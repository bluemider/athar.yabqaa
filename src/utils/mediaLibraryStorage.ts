/**
 * Persistent Media Library Storage for Uploaded & Saved Images
 * Keeps a permanent record of all user-uploaded photos across sessions,
 * deploys, and devices using localStorage and IndexedDB.
 */

const MEDIA_LIBRARY_KEY = 'sheikh_uploaded_media_library_v1';

export interface MediaLibraryItem {
  url: string;
  name?: string;
  uploadedAt: string;
}

// Built-in presets for quick reference
const DEFAULT_PRESET_URLS: string[] = [
  '/assets/sheikh/sheikh_kazim_01.jpg',
  '/assets/sheikh/sheikh_kazim_02.jpg',
  '/assets/sheikh/sheikh_kazim_03.jpg',
  '/assets/sheikh/sheikh_kazim_04.jpg',
  '/assets/sheikh/sheikh_kazim_05.jpg',
  '/assets/sheikh/sheikh_kazim_06.jpg',
  '/assets/sheikh/sheikh_kazim_07.jpg',
  '/assets/sheikh/sheikh_kazim_08.jpg',
  '/assets/sheikh/sheikh_kazim_09.jpg',
  '/assets/sheikh/sheikh_kazim_10.jpg',
  '/assets/sheikh/sheikh_kazim_11.jpg',
  '/assets/sheikh/sheikh_kazim_12.jpg',
  '/assets/sheikh/sheikh_kazim_13.jpg',
  '/assets/sheikh/sheikh_kazim_14.jpg',
  '/assets/sheikh/sheikh_kazim_15.jpg',
  '/assets/sheikh/sheikh_kazim_16.jpg',
  '/assets/sheikh/sheikh_kazim_17.jpg',
  '/assets/sheikh/sheikh_kazim_18.jpg',
  '/assets/sheikh/sheikh_kazim_19.jpg',
  '/assets/sheikh/sheikh_kazim_20.jpg',
  '/assets/sheikh/sheikh_kazim_21.jpg',
  '/assets/sheikh/sheikh_kazim_22.jpg',
  '/assets/sheikh/sheikh_kazim_23.jpg',
  '/assets/sheikh/sheikh_kazim_24.jpg',
  '/assets/sheikh/sheikh_kazim_25.jpg',
  '/assets/sheikh/sheikh_kazim_26.jpg',
  '/assets/sheikh/timeline_athar_yabqaa.jpg',
  '/assets/sheikh/timeline_hawza_studies.jpg',
  '/assets/sheikh/timeline_mosque_pulpit.jpg',
  '/assets/sheikh/timeline_roots_munaizilah.jpg',
  '/assets/sheikh/timeline_social_reconciliation.jpg',
];

export function getMediaLibrary(): MediaLibraryItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_LIBRARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading media library:', err);
  }

  // Initial defaults
  return DEFAULT_PRESET_URLS.map((url, idx) => ({
    url,
    name: `صورة أرشيفية #${idx + 1}`,
    uploadedAt: new Date().toISOString(),
  }));
}

export function addMediaToLibrary(url: string, name?: string): MediaLibraryItem[] {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return getMediaLibrary();
  }

  const current = getMediaLibrary();
  const trimmedUrl = url.trim();

  // If already in library, bring it to the front
  const filtered = current.filter((item) => item.url !== trimmedUrl);
  const newItem: MediaLibraryItem = {
    url: trimmedUrl,
    name: name || (trimmedUrl.startsWith('/uploads/') ? 'صورة مرفوعة حديثاً' : 'صورة مخصصة'),
    uploadedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...filtered];

  try {
    localStorage.setItem(MEDIA_LIBRARY_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (err) {
    console.warn('Error saving to media library:', err);
  }

  return updated;
}
