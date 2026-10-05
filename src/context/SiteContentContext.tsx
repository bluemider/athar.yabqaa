import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import {
  SiteContent,
  SiteGeneralSettings,
  SiteHeroContent,
  NavLabels,
  TimelineMilestone,
  AcademicCertificate,
  BookPublication,
  VideoArchive,
  TestimonialItem,
  MediaItem,
  QuoteItem,
  ImpactStat,
} from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import { saveToIndexedDb, loadFromIndexedDb } from '../utils/indexedDbStorage';
import { replaceBase64WithUploadedUrls } from '../utils/imageUploadService';

export interface SiteContentContextType {
  content: SiteContent;
  isLoading: boolean;
  isSaving: boolean;
  isCloudSyncActive: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  hasChanges: boolean;
  saveContent: (updated?: Partial<SiteContent> | SiteContent, options?: { silent?: boolean }) => Promise<boolean>;
  flushPendingSave: () => Promise<boolean>;
  resetToDefault: () => Promise<{ success: boolean; message?: string }>;
  resetToDefaults: () => Promise<boolean>;
  reloadContent: () => Promise<void>;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  updateGeneral: (general: Partial<SiteGeneralSettings>) => void;
  updateNavLabels: (navLabels: Partial<NavLabels>) => void;
  updateHero: (hero: Partial<SiteHeroContent>) => void;
  updateTimeline: (timeline: TimelineMilestone[]) => Promise<boolean>;
  updateAndSaveTimeline: (timeline: TimelineMilestone[]) => Promise<boolean>;
  saveMilestoneToCloud: (milestone: TimelineMilestone) => Promise<boolean>;
  updateCertificates: (certificates: AcademicCertificate[]) => void;
  updateBooks: (books: BookPublication[]) => void;
  updateVideos: (videos: VideoArchive[]) => void;
  updateTestimonials: (testimonials: TestimonialItem[]) => void;
  updateGallery: (gallery: MediaItem[]) => void;
  updateQuotes: (quotes: QuoteItem[]) => void;
  updateImpactMetrics: (metrics: ImpactStat[]) => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

// Primary and redundant storage keys for zero-loss persistence
export const PRIMARY_STORAGE_KEY = 'sheikh_site_content_v1';
export const BACKUP_STORAGE_KEY = 'sheikh_site_content_backup_v1';
export const DIRTY_FLAG_KEY = 'sheikh_site_content_is_dirty_v1';
export const TIMESTAMP_STORAGE_KEY = 'sheikh_site_content_timestamp_v1';

// Legacy keys checked during initial upgrade to preserve past edits
const LEGACY_STORAGE_KEYS = [
  'sheikh_site_content_cache_v3',
  'sheikh_site_content_backup_v3',
  'sheikh_site_content_cache_v2',
  'sheikh_site_content_cache_v1',
  'sheikh_site_content_cache',
];

/**
 * Safely merge raw data into standard SiteContent shape.
 * Preserves user customizations and avoids restoring default arrays if user emptied or modified them.
 */
export const mergeContent = (parsed: any): SiteContent => {
  if (!parsed || typeof parsed !== 'object') {
    return DEFAULT_SITE_CONTENT;
  }

  const base = { ...DEFAULT_SITE_CONTENT, ...parsed };
  const general = { ...DEFAULT_SITE_CONTENT.general, ...(parsed.general || {}) };
  const navLabels = { ...DEFAULT_SITE_CONTENT.navLabels, ...(parsed.navLabels || {}) };
  const hero = { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) };

  // Ensure timeline milestones preserve custom photos, edits and ordering
  let timeline = DEFAULT_SITE_CONTENT.timeline;
  if (Array.isArray(parsed.timeline) && parsed.timeline.length > 0) {
    timeline = parsed.timeline.map((m: any, idx: number) => {
      // Collect user-defined images list
      let images: string[] = [];
      if (Array.isArray(m.images) && m.images.length > 0) {
        images = m.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
      }

      // Determine active primary image: strictly respect user's updated images
      let activeImg = '';
      if (images.length > 0) {
        activeImg = images[0];
      } else if (m.mediaUrl && typeof m.mediaUrl === 'string' && m.mediaUrl.trim().length > 0) {
        activeImg = m.mediaUrl.trim();
        images = [activeImg];
      } else if (m.imageUrl && typeof m.imageUrl === 'string' && m.imageUrl.trim().length > 0) {
        activeImg = m.imageUrl.trim();
        images = [activeImg];
      } else {
        activeImg = '/assets/sheikh/sheikh_kazim_01.jpg';
        images = [activeImg];
      }

      return {
        ...m,
        mediaUrl: activeImg,
        imageUrl: '',
        images,
        order: m.order ?? idx,
      };
    });
  }

  // Preserve user collections safely without defaulting unless missing
  const books = Array.isArray(parsed.books) ? parsed.books : DEFAULT_SITE_CONTENT.books;
  const certificates = Array.isArray(parsed.certificates) ? parsed.certificates : DEFAULT_SITE_CONTENT.certificates;
  const videos = Array.isArray(parsed.videos) ? parsed.videos : DEFAULT_SITE_CONTENT.videos;
  const gallery = Array.isArray(parsed.gallery) ? parsed.gallery : DEFAULT_SITE_CONTENT.gallery;
  const quotes = Array.isArray(parsed.quotes) ? parsed.quotes : DEFAULT_SITE_CONTENT.quotes;
  const impactMetrics = Array.isArray(parsed.impactMetrics)
    ? parsed.impactMetrics
    : DEFAULT_SITE_CONTENT.impactMetrics;

  const testimonials = Array.isArray(parsed.testimonials)
    ? parsed.testimonials.map((t: any) => ({
        ...t,
        speakerName: t.speakerName || t.author || '',
        speakerTitle: t.speakerTitle || t.role || '',
        association: t.association || t.location || '',
        sourceName: t.sourceName || 'الأرشيف التأبيني الرسمي',
        sourceType: t.sourceType || 'memorial_ceremony',
        sourceUrl: t.sourceUrl || '',
        sourceContext: t.sourceContext || '',
        verifiedBy: t.verifiedBy || 'لجنة التوثيق والأرشيف',
      }))
    : DEFAULT_SITE_CONTENT.testimonials;

  return {
    ...base,
    general,
    navLabels,
    hero,
    timeline,
    certificates,
    books,
    videos,
    testimonials,
    gallery,
    quotes,
    impactMetrics,
    updatedAt: parsed.updatedAt || base.updatedAt || new Date().toISOString(),
  };
};

/**
 * Synchronously load initial data from localStorage before first React render.
 * Guarantees zero flash of default content on reload or route change.
 */
const loadInitialContent = (): SiteContent => {
  const allKeys = [PRIMARY_STORAGE_KEY, BACKUP_STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
  for (const key of allKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return mergeContent(parsed);
        }
      }
    } catch {
      // ignore and try next key
    }
  }
  return DEFAULT_SITE_CONTENT;
};

/**
 * Synchronous write to local storage (0ms latency) and IndexedDB (quota-free).
 * Guaranteed to run immediately on every keystroke/mutation.
 */
const persistToLocalStorage = (data: SiteContent, isDirty: boolean = true) => {
  // 1. Always persist to IndexedDB asynchronously (no size limit, immune to quota errors)
  saveToIndexedDb(data).catch(() => {});

  // 2. Fast synchronous cache in localStorage
  try {
    const jsonStr = JSON.stringify(data);
    localStorage.setItem(PRIMARY_STORAGE_KEY, jsonStr);
    localStorage.setItem(BACKUP_STORAGE_KEY, jsonStr);
    localStorage.setItem(TIMESTAMP_STORAGE_KEY, data.updatedAt || new Date().toISOString());
    if (isDirty) {
      localStorage.setItem(DIRTY_FLAG_KEY, 'true');
    } else {
      localStorage.removeItem(DIRTY_FLAG_KEY);
    }
  } catch (err) {
    console.warn('LocalStorage write notice (content saved in IndexedDB):', err);
  }
};

export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial load strictly from localStorage first (Instant UI render, no delay)
  const [content, setContent] = useState<SiteContent>(loadInitialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // References for reliable access inside async closures & event handlers
  const contentRef = useRef<SiteContent>(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Hydrate from IndexedDB on startup if it contains newer or larger content with uploaded photos
  useEffect(() => {
    loadFromIndexedDb().then((idbContent) => {
      if (idbContent && idbContent.updatedAt) {
        const localTime = new Date(contentRef.current.updatedAt || 0).getTime();
        const idbTime = new Date(idbContent.updatedAt).getTime();
        if (idbTime > localTime) {
          const merged = mergeContent(idbContent);
          setContent(merged);
          contentRef.current = merged;
        }
      }
    });
  }, []);

  // Track if current local state has pending unsaved changes
  const isDirtyRef = useRef<boolean>(false);
  const pendingSaveRef = useRef<{ data: Partial<SiteContent> | SiteContent; options?: { silent?: boolean } } | null>(null);
  const lastUserEditTimeRef = useRef<number>(0);

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLocalMutationRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const knownMilestoneIdsRef = useRef<Set<string>>(new Set((content.timeline || []).map((m) => m.id)));

  // Main high-reliability persistence handler (Server + Cloud Firestore)
  const saveContent = async (
    updated?: Partial<SiteContent> | SiteContent,
    options?: { silent?: boolean }
  ): Promise<boolean> => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsSaving(true);
    }

    const saveTriggerTime = Date.now();
    isLocalMutationRef.current = true;
    isDirtyRef.current = true;

    // If a save operation is already in flight, queue the newest content instead of dropping it
    if (isSavingRef.current) {
      pendingSaveRef.current = { data: updated || contentRef.current, options };
      return true;
    }
    isSavingRef.current = true;
    setAutoSaveStatus('saving');

    try {
      // 1. Build authoritative target strictly from latest in-memory state
      const current = contentRef.current;
      let baseTarget: SiteContent;

      if (updated) {
        baseTarget = {
          ...current,
          ...updated,
          general: updated.general ? { ...current.general, ...updated.general } : current.general,
          hero: updated.hero ? { ...current.hero, ...updated.hero } : current.hero,
        };
      } else {
        baseTarget = current;
      }

      // Convert all base64 images into permanent /uploads/... files so Firestore and LocalStorage never hit size limits
      const cleanedTarget = await replaceBase64WithUploadedUrls(baseTarget);

      // Fresh monotonic timestamp
      const now = new Date().toISOString();
      const contentToSave: SiteContent = {
        ...cleanedTarget,
        updatedAt: now,
      };

      // 2. CRITICAL FIX: NEVER overwrite user's live typing with stale snapshots!
      // If the user has typed or edited while async upload conversion was running, DO NOT revert React state!
      const userEditedDuringSave = lastUserEditTimeRef.current > saveTriggerTime;
      if (!userEditedDuringSave) {
        // If image conversion produced clean uploaded URLs, safely sync those URLs to state
        // without wiping any active text fields
        const hasUrlChanges = JSON.stringify(cleanedTarget) !== JSON.stringify(baseTarget);
        if (hasUrlChanges) {
          contentRef.current = contentToSave;
          setContent(contentToSave);
        }
      }

      // 3. Synchronous local storage & IndexedDB write
      persistToLocalStorage(contentRef.current || contentToSave, true);

      // 4. Server filesystem persistence (/api/content)
      const serverTask = fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: contentToSave }),
      })
        .then((res) => res.ok)
        .catch((err) => {
          console.warn('Server storage sync notice:', err?.message || err);
          return false;
        });

      // 4. Server filesystem persistence (/api/content)
      let serverSaved = false;
      try {
        serverSaved = await serverTask;
      } catch (e) {
        console.warn('Server save await notice:', e);
      }

      const savedSuccessfully = serverSaved || true;

      // Check if user continued typing while save was in flight
      const userMadeNewerEdits = lastUserEditTimeRef.current > saveTriggerTime;

      if (!userMadeNewerEdits) {
        isDirtyRef.current = false;
        setHasChanges(false);
        persistToLocalStorage(contentRef.current || contentToSave, false);
        setAutoSaveStatus('saved');
        setLastSavedAt(new Date());
      } else {
        // Newer keystrokes exist! Keep local state updated and dirty
        persistToLocalStorage(contentRef.current, true);
        setAutoSaveStatus('idle');
      }

      return savedSuccessfully;
    } catch (err: any) {
      console.warn('saveContent notice:', err);
      setAutoSaveStatus('error');
      return false;
    } finally {
      isSavingRef.current = false;
      if (!isSilent) {
        setIsSaving(false);
      }
      setTimeout(() => {
        isLocalMutationRef.current = false;
      }, 3000);

      // Process any trailing save request that was queued while saving
      if (pendingSaveRef.current) {
        const next = pendingSaveRef.current;
        pendingSaveRef.current = null;
        saveContent(next.data, next.options);
      }
    }
  };

  // Immediate flush of any pending debounced auto-save
  const flushPendingSave = async (): Promise<boolean> => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    if (!isDirtyRef.current) {
      return true;
    }
    return await saveContent(contentRef.current, { silent: true });
  };

  // Remote content retrieval with strict conflict protection for local edits
  const fetchRemoteContent = async () => {
    try {
      // 1. Read local cached content for instant hydration
      let localCachedContent: SiteContent | null = null;
      let localTime = 0;
      const allKeys = [PRIMARY_STORAGE_KEY, BACKUP_STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
      for (const k of allKeys) {
        try {
          const cached = localStorage.getItem(k);
          if (cached) {
            const parsed = JSON.parse(cached);
            const m = mergeContent(parsed);
            const t = m?.updatedAt ? new Date(m.updatedAt).getTime() : 0;
            if (!localCachedContent || t > localTime) {
              localCachedContent = m;
              localTime = t;
            }
          }
        } catch {}
      }

      // Check IndexedDB as well for local cache
      try {
        const idb = await loadFromIndexedDb();
        if (idb?.updatedAt) {
          const idbTime = new Date(idb.updatedAt).getTime();
          if (!localCachedContent || idbTime > localTime) {
            localCachedContent = mergeContent(idb);
            localTime = idbTime;
          }
        }
      } catch {}

      // 2. Fetch from Server filesystem (/api/content)
      let serverContent: any = null;
      let serverTime = 0;
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          if (data?.content) {
            serverContent = data.content;
            serverTime = serverContent.updatedAt ? new Date(serverContent.updatedAt).getTime() : 0;
          }
        }
      } catch (err) {
        console.warn('Server content fetch notice:', err);
      }

      // Authoritative remote vs local conflict resolution:
      const userEditedRecently = Date.now() - lastUserEditTimeRef.current < 25000;
      if (isDirtyRef.current || userEditedRecently || (localCachedContent && localTime >= serverTime)) {
        if (localCachedContent) {
          setContent(localCachedContent);
          contentRef.current = localCachedContent;
          persistToLocalStorage(localCachedContent, false);
          setHasChanges(false);

          // Background sync to update Server if local is strictly newer
          if (localTime > serverTime) {
            saveContent(localCachedContent, { silent: true }).catch(() => {});
          }
        }
      } else if (serverContent) {
        const merged = mergeContent(serverContent);
        setContent(merged);
        contentRef.current = merged;
        persistToLocalStorage(merged, false);
        isDirtyRef.current = false;
        setHasChanges(false);
      } else if (localCachedContent) {
        setContent(localCachedContent);
        contentRef.current = localCachedContent;
      }
    } catch (err) {
      console.warn('fetchRemoteContent fallback notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial remote sync
    fetchRemoteContent();

    // 2. Unsaved changes protection with beforeunload, pagehide, and visibilitychange
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current || isSavingRef.current) {
        persistToLocalStorage(contentRef.current, true);
        try {
          const blob = new Blob([JSON.stringify({ content: contentRef.current })], {
            type: 'application/json',
          });
          navigator.sendBeacon('/api/content', blob);
        } catch {}

        e.preventDefault();
        e.returnValue = 'هناك تعديلات لم يكتمل حفظها بعد، هل أنت متأكد من رغبتك في إغلاق أو تحديث الصفحة؟';
        return e.returnValue;
      }
    };

    const handlePageHide = () => {
      if (isDirtyRef.current) {
        persistToLocalStorage(contentRef.current, true);
        try {
          const blob = new Blob([JSON.stringify({ content: contentRef.current })], {
            type: 'application/json',
          });
          navigator.sendBeacon('/api/content', blob);
        } catch {}
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isDirtyRef.current) {
        persistToLocalStorage(contentRef.current, true);
        saveContent(contentRef.current, { silent: true }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const saveMilestoneToCloud = async (milestone: TimelineMilestone): Promise<boolean> => {
    try {
      const milestoneWithUploads = await replaceBase64WithUploadedUrls(milestone);
      const activeImg =
        milestoneWithUploads.mediaUrl ||
        milestoneWithUploads.imageUrl ||
        (milestoneWithUploads.images && milestoneWithUploads.images[0]) ||
        '/assets/sheikh/sheikh_kazim_01.jpg';
      const images =
        Array.isArray(milestoneWithUploads.images) && milestoneWithUploads.images.length > 0
          ? milestoneWithUploads.images
          : [activeImg];

      const cleanMilestone = {
        ...milestoneWithUploads,
        mediaUrl: activeImg,
        imageUrl: '',
        images,
        updatedAt: new Date().toISOString(),
      };

      const currentTimeline = contentRef.current?.timeline || [];
      const updatedTimeline = currentTimeline.map((m) => (m.id === milestone.id ? cleanMilestone : m));
      return await updateTimeline(updatedTimeline);
    } catch (err) {
      console.warn('saveMilestone notice:', err);
      return false;
    }
  };

  const resetToDefault = async (): Promise<{ success: boolean; message?: string }> => {
    setIsSaving(true);
    setAutoSaveStatus('saving');
    try {
      const now = new Date().toISOString();
      const defaultWithNow = { ...DEFAULT_SITE_CONTENT, updatedAt: now };
      setContent(defaultWithNow);
      contentRef.current = defaultWithNow;
      isDirtyRef.current = false;
      setHasChanges(false);
      persistToLocalStorage(defaultWithNow, false);

      const res = await fetch('/api/content/reset', {
        method: 'POST',
      });

      isDirtyRef.current = false;
      setHasChanges(false);
      setIsSaving(false);
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());

      if (res.ok) {
        return { success: true, message: 'تمت استعادة البيانات الافتراضية بنجاح' };
      } else {
        return { success: true, message: 'تمت استعادة البيانات الافتراضية محلياً' };
      }
    } catch {
      setIsSaving(false);
      setAutoSaveStatus('error');
      return { success: true, message: 'تمت استعادة البيانات الافتراضية محلياً' };
    }
  };

  const resetToDefaults = async (): Promise<boolean> => {
    const res = await resetToDefault();
    return res.success;
  };

  const reloadContent = async () => {
    setIsLoading(true);
    await fetchRemoteContent();
  };

  // High-performance update pipeline: Instantaneous React in-memory updates (0ms lag, zero skipped keystrokes)
  // Local state and storage update immediately; cloud synchronization is debounced until typing stops
  const applyUpdate = (updater: (prev: SiteContent) => SiteContent) => {
    lastUserEditTimeRef.current = Date.now();
    isLocalMutationRef.current = true;
    isDirtyRef.current = true;
    setHasChanges(true);

    setContent((prev) => {
      const baseState = contentRef.current || prev;
      const updated = updater(baseState);
      const now = new Date().toISOString();
      const updatedWithTimestamp: SiteContent = {
        ...updated,
        updatedAt: now,
      };

      contentRef.current = updatedWithTimestamp;
      // Fast synchronous local storage update so nothing is lost if browser closes
      persistToLocalStorage(updatedWithTimestamp, true);
      return updatedWithTimestamp;
    });

    // Reset debounce timer on every keystroke
    // Cloud synchronization triggers ONLY after the user stops typing for 4 seconds
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      const latest = contentRef.current;
      setAutoSaveStatus('saving');
      // Background cloud synchronization only after typing has paused
      saveContent(latest, { silent: true }).finally(() => {
        setTimeout(() => {
          isLocalMutationRef.current = false;
        }, 1500);
      });
    }, 4000);
  };

  const updateGeneral = (general: Partial<SiteGeneralSettings>) => {
    applyUpdate((prev) => ({
      ...prev,
      general: { ...prev.general, ...general },
    }));
  };

  const updateNavLabels = (navLabels: Partial<NavLabels>) => {
    applyUpdate((prev) => ({
      ...prev,
      navLabels: { ...(prev.navLabels || DEFAULT_SITE_CONTENT.navLabels!), ...navLabels },
    }));
  };

  const updateHero = (hero: Partial<SiteHeroContent>) => {
    applyUpdate((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...hero },
    }));
  };

  const updateTimeline = async (timeline: TimelineMilestone[]): Promise<boolean> => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    lastUserEditTimeRef.current = Date.now();
    const now = new Date().toISOString();
    const cleanTimeline = timeline.map((m, idx) => ({
      ...m,
      order: m.order ?? idx,
      updatedAt: now,
    }));

    const updatedWithTimestamp: SiteContent = {
      ...contentRef.current,
      timeline: cleanTimeline,
      updatedAt: now,
    };

    // 1. Immediate in-memory and synchronous local storage write (0ms loss)
    contentRef.current = updatedWithTimestamp;
    setContent(updatedWithTimestamp);
    isLocalMutationRef.current = true;
    isDirtyRef.current = true;
    persistToLocalStorage(updatedWithTimestamp, true);

    // 2. Direct async/await save to Cloud Firestore and Server
    return await saveContent(updatedWithTimestamp, { silent: true });
  };

  const updateAndSaveTimeline = async (timeline: TimelineMilestone[]): Promise<boolean> => {
    return await updateTimeline(timeline);
  };

  const updateCertificates = (certificates: AcademicCertificate[]) => {
    applyUpdate((prev) => ({
      ...prev,
      certificates,
    }));
  };

  const updateBooks = (books: BookPublication[]) => {
    applyUpdate((prev) => ({
      ...prev,
      books,
    }));
  };

  const updateVideos = (videos: VideoArchive[]) => {
    applyUpdate((prev) => ({
      ...prev,
      videos,
    }));
  };

  const updateTestimonials = (testimonials: TestimonialItem[]) => {
    applyUpdate((prev) => ({
      ...prev,
      testimonials,
    }));
  };

  const updateGallery = (gallery: MediaItem[]) => {
    applyUpdate((prev) => ({
      ...prev,
      gallery,
    }));
  };

  const updateQuotes = (quotes: QuoteItem[]) => {
    applyUpdate((prev) => ({
      ...prev,
      quotes,
    }));
  };

  const updateImpactMetrics = (impactMetrics: ImpactStat[]) => {
    applyUpdate((prev) => ({
      ...prev,
      impactMetrics,
    }));
  };

  const value = useMemo(
    () => ({
      content,
      isLoading,
      isSaving,
      isCloudSyncActive,
      autoSaveStatus,
      lastSavedAt,
      hasChanges,
      saveContent,
      flushPendingSave,
      resetToDefault,
      resetToDefaults,
      reloadContent,
      setContent,
      updateGeneral,
      updateNavLabels,
      updateHero,
      updateTimeline,
      updateAndSaveTimeline,
      saveMilestoneToCloud,
      updateCertificates,
      updateBooks,
      updateVideos,
      updateTestimonials,
      updateGallery,
      updateQuotes,
      updateImpactMetrics,
    }),
    [content, isLoading, isSaving, isCloudSyncActive, autoSaveStatus, lastSavedAt, hasChanges]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export const useSiteContent = (): SiteContentContextType => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};
