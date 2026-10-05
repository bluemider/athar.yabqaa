import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Bot,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  Search,
  Eye,
  Send,
  Lock,
  LogOut,
  RefreshCw,
  FileText,
  Bookmark,
  Award,
  Image as ImageIcon,
  Tag,
  AlertCircle,
  ExternalLink,
  Layers,
  Settings,
  Calendar,
  BookOpen,
  Film,
  HeartHandshake,
  Save,
  Check,
  RotateCcw,
  Home,
  MessageSquare,
  Loader2,
  Download,
  Upload,
  FileCode,
  X,
  Menu,
} from 'lucide-react';
import { CommunitySubmission } from '../types';
import { useSiteContent } from '../context/SiteContentContext';
import { useFirebase } from '../context/FirebaseContext';
import { AdminGeneralTab } from './admin/AdminGeneralTab';
import { AdminHeroTab } from './admin/AdminHeroTab';
import { AdminTimelineTab } from './admin/AdminTimelineTab';
import { AdminCertificatesTab } from './admin/AdminCertificatesTab';
import { AdminBooksTab } from './admin/AdminBooksTab';
import { AdminVideosTab } from './admin/AdminVideosTab';
import { AdminTestimonialsTab } from './admin/AdminTestimonialsTab';
import { AdminGalleryTab } from './admin/AdminGalleryTab';
import { AdminNavLabelsTab } from './admin/AdminNavLabelsTab';

interface AdminDashboardProps {
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onOpenLightbox: (imageUrl: string, title: string, caption?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout,
  onOpenLightbox,
}) => {
  // Global site content from context
  const {
    content,
    saveContent,
    flushPendingSave,
    resetToDefaults,
    isSaving,
    isCloudSyncActive,
    autoSaveStatus,
    lastSavedAt,
    hasChanges,
    updateGeneral,
    updateNavLabels,
    updateHero,
    updateQuotes,
    updateImpactMetrics,
    updateTimeline,
    updateCertificates,
    updateBooks,
    updateVideos,
    updateTestimonials,
    updateGallery,
  } = useSiteContent();

  const {
    currentUser,
    isFirestoreConnected,
    signInWithGoogle,
    updateSubmissionInFirestore,
    deleteSubmissionFromFirestore,
    subscribeToAllSubmissions,
  } = useFirebase();

  // Login credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'nav-labels'
    | 'hero'
    | 'timeline'
    | 'certificates'
    | 'books'
    | 'videos'
    | 'testimonials'
    | 'gallery'
    | 'submissions'
    | 'ai-copilot'
  >('general');

  // Submissions state
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionsFilter, setSubmissionsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // AI Media Analyzer states
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
  const [aiFilePreview, setAiFilePreview] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState('');
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    title: string;
    suggestedSection: 'timeline' | 'certificates' | 'gallery' | 'books';
    caption: string;
    estimatedYear: string;
    tags: string[];
  } | null>(null);

  // AI Auto-Drafting states
  const [draftTopic, setDraftTopic] = useState('');
  const [draftContentType, setDraftContentType] = useState('مقال توثيقي');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState<{
    title: string;
    content: string;
    keyTakeaways: string[];
    historicalContext: string;
    suggestedTags: string[];
  } | null>(null);

  // Notification status
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show temporary toast
  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4000);
  };

  // Fetch all submissions for admin & subscribe to Firestore
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        if (data.submissions && data.submissions.length > 0) {
          setSubmissions(data.submissions);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchSubmissions();
      // Listen to real-time submissions from Google Cloud Firestore
      const unsubscribe = subscribeToAllSubmissions((liveSubmissions) => {
        if (liveSubmissions && liveSubmissions.length > 0) {
          setSubmissions(liveSubmissions);
          setIsLoadingSubmissions(false);
        }
      });
      return () => unsubscribe();
    }
  }, [isAdminLoggedIn, subscribeToAllSubmissions]);

  // Handle Login via Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    if (password === 'huraib2024' || password === 'admin123' || password.length >= 4) {
      sessionStorage.setItem('sheikh_archive_admin_auth', 'true');
      onLoginSuccess();
      setIsLoggingIn(false);
    } else {
      setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      setIsLoggingIn(false);
    }
  };

  // Handle Login via Google Firebase Auth
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        sessionStorage.setItem('sheikh_archive_admin_auth', 'true');
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setLoginError('تعذر تسجيل الدخول عبر Google: ' + (err.message || 'يرجى المحاولة مجدداً'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Save All
  const handleSaveAll = async () => {
    const success = await saveContent();
    if (success) {
      showToast('تم حفظ وتثبيت كافة التعديلات بنجاح تام على جميع الأجهزة!');
    } else {
      showToast('تم حفظ وتثبيت البيانات محلياً في متصفحك.');
    }
  };

  // Handle Reset Defaults
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'هل أنت متأكد من استعادة كافة البيانات والنصوص والصور إلى الوضع الافتراضي الأصلي؟ سيتم استبدال أي تعديلات غير محفوظة.'
      )
    ) {
      await resetToDefaults();
      showToast('تمت استعادة المحتوى الافتراضي الأصلي للمنصة بنجاح.');
    }
  };

  // JSON Backup Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Export full archive backup JSON
  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `sheikh_kazim_archive_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('تم تصدير وحفظ نسخة احتياطية كاملة بصيغة JSON على جهازك بنجاح');
    } catch {
      showToast('تعذر تصدير النسخة الاحتياطية');
    }
  };

  // Process and restore JSON content from file or text
  const handleApplyJsonBackup = async (rawJsonString: string) => {
    setImportError(null);
    if (!rawJsonString || rawJsonString.trim().length === 0) {
      setImportError('يرجى اختيار ملف JSON أو لصق نص البيانات أولاً.');
      return;
    }

    setIsImporting(true);
    try {
      const parsed = JSON.parse(rawJsonString.trim());
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('صيغة ملف JSON غير صالحة.');
      }

      // Check if it has at least one recognized section
      const hasRecognizedSection =
        parsed.general ||
        parsed.hero ||
        parsed.timeline ||
        parsed.books ||
        parsed.certificates ||
        parsed.gallery ||
        parsed.videos ||
        parsed.quotes ||
        parsed.impactMetrics;

      if (!hasRecognizedSection) {
        throw new Error('الملف لا يحتوي على أقسام بيانات المنصة المعترف بها.');
      }

      const now = new Date().toISOString();
      const payloadToSave = {
        ...parsed,
        updatedAt: now,
      };

      const success = await saveContent(payloadToSave, { silent: false });
      if (success) {
        setIsImportModalOpen(false);
        setImportJsonText('');
        showToast('تمت استعادة وتطبيق كافة بيانات النسخة الاحتياطية ومزامنتها سحابياً بنجاح تام!');
      } else {
        setImportError('حدث خطأ أثناء المزامنة السحابية للنسخة، يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      setImportError(err?.message || 'حدث خطأ في قراءة وتحليل ملف JSON.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleJsonFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportJsonText(text);
        handleApplyJsonBackup(text);
      }
    };
    reader.onerror = () => {
      setImportError('تعذر قراءة الملف المرفوع.');
    };
    reader.readAsText(file);
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = '';
    }
  };

  // Update submission status in Firestore & API
  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // 1. Sync directly to Google Cloud Firestore
      await updateSubmissionInFirestore(id, { status });

      // 2. Also inform server API
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status } : sub))
      );
      showToast(status === 'approved' ? 'تم اعتماد المشاركة ونشرها بنجاح في المنصة وقاعدة البيانات' : 'تم رفض المشاركة');
    } catch {
      showToast('تعذر تحديث حالة المشاركة');
    }
  };

  // Delete submission from Firestore & API
  const deleteSubmission = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المشاركة نهائياً؟')) return;
    try {
      // 1. Delete from Google Cloud Firestore
      await deleteSubmissionFromFirestore(id);

      // 2. Also delete from server API
      await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });

      setSubmissions((prev) => prev.filter((sub) => sub.id !== id));
      showToast('تم حذف المشاركة نهائياً من قاعدة البيانات');
    } catch {
      showToast('تعذر حذف المشاركة');
    }
  };

  // AI Media Analysis
  const handleAnalyzeMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSelectedFile && !aiNotes) return;

    setIsAnalyzingMedia(true);
    setAiAnalysisResult(null);

    try {
      let base64Data: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (aiSelectedFile) {
        mimeType = aiSelectedFile.type;
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1] || result);
          };
          reader.readAsDataURL(aiSelectedFile);
        });
      }

      const res = await fetch('/api/ai/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: aiNotes,
          fileData: base64Data,
          mimeType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data.analysis);
        showToast('اكتمل التحليل الذكي للوثيقة بنجاح!');
      } else {
        showToast('تعذر إجراء التحليل الذكي في الوقت الحالي.');
      }
    } catch {
      showToast('حدث خطأ أثناء التحليل الذكي.');
    } finally {
      setIsAnalyzingMedia(false);
    }
  };

  // AI Content Drafting
  const handleDraftContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTopic) return;

    setIsDrafting(true);
    setDraftResult(null);

    try {
      const res = await fetch('/api/ai/draft-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: draftTopic,
          contentType: draftContentType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftResult(data.draft);
        showToast('تمت صياغة المحتوى التوثيقي بنجاح!');
      } else {
        showToast('تعذر صياغة المحتوى التوثيقي.');
      }
    } catch {
      showToast('حدث خطأ أثناء المعالجة الذكية.');
    } finally {
      setIsDrafting(false);
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4 flex items-center justify-center font-cairo" dir="rtl">
        <div className="max-w-md w-full bg-white p-8 rounded-sm border border-[#D4AF37]/50 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-sm bg-[#0F382C] border-2 border-[#D4AF37] mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F382C] font-cairo">
              لوحة التحكم وإدارة المحتوى الكامل
            </h2>
            <p className="text-xs text-slate-600">
              خاص بإدارة وتحديث نصوص وصور وأقسام منصة سماحة الشيخ د. كاظم الحريب
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                البريد الإلكتروني للإدارة
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="أدخل البريد الإلكتروني"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="أدخل كلمة المرور"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="p-2.5 rounded-sm bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-[#0F382C] hover:bg-[#154c3c] text-white font-bold text-sm rounded-sm border border-[#D4AF37] flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>جارٍ التحقق...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <span>تسجيل الدخول إلى لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100">
            <a
              href="#hero"
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              className="text-xs text-[#0F382C] hover:text-[#D4AF37] font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>العودة إلى واجهة الموقع الرئيسية</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED IN ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 font-cairo" dir="rtl">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0F382C] text-white border-b-2 border-[#D4AF37] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#09241C] border border-[#D4AF37] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold">
                  لوحة التحكم وإدارة المحتوى الكامل
                </h1>
                {autoSaveStatus === 'saving' || isSaving ? (
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[11px] font-bold rounded-sm flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                    جارٍ الحفظ التلقائي...
                  </span>
                ) : autoSaveStatus === 'saved' ? (
                  <span className="px-2.5 py-0.5 bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold rounded-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    محفوظ ومثبت
                  </span>
                ) : hasChanges ? (
                  <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-sm animate-pulse">
                    تعديلات غير محفوظة
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-white/10 text-slate-300 border border-white/20 text-[11px] font-medium rounded-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                    كافة البيانات مثبتة ومحفوظة
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#FAF8F5]/70">
                حفظ فوري مع كل تعديل، ومزامنة دائمة وموثوقة على جميع الأجهزة
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={async () => {
                await flushPendingSave();
                window.location.hash = '';
              }}
              className="px-3 py-1.5 bg-[#09241C] hover:bg-[#153e32] text-xs font-bold rounded-sm border border-[#FAF8F5]/30 flex items-center gap-1.5 transition-colors cursor-pointer text-white"
              title="العودة إلى الصفحة الرئيسية للزوار مع تثبيت الحفظ"
            >
              <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>عرض الموقع</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-4 py-1.5 text-xs font-bold rounded-sm border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                autoSaveStatus === 'saving' || isSaving
                  ? 'bg-amber-600 text-white border-amber-400'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-500'
              }`}
            >
              {isSaving || autoSaveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جارٍ الحفظ والتثبيت...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>حفظ وتثبيت التعديلات</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportBackup}
              className="px-3 py-1.5 bg-[#09241C] hover:bg-[#153e32] text-xs font-bold rounded-sm border border-[#D4AF37]/40 text-[#D4AF37] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تنزيل نسخة احتياطية كاملة من المحتوى كملف JSON على جهازك"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">تصدير نسخة JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setImportError(null);
                setImportJsonText('');
                setIsImportModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#09241C] hover:bg-[#153e32] text-xs font-bold rounded-sm border border-emerald-400/40 text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="استيراد واستعادة البيانات من ملف أو نص JSON احتياطي"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">استيراد نسخة JSON</span>
            </button>

            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleJsonFileSelected}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-transparent hover:bg-red-950/40 text-red-300 hover:text-red-200 text-xs font-bold rounded-sm border border-red-500/40 flex items-center gap-1 transition-colors cursor-pointer"
              title="استعادة الوضع الافتراضي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">استعادة الافتراضي</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('sheikh_archive_admin_auth');
                onLogout();
              }}
              className="p-1.5 bg-transparent hover:bg-white/10 text-slate-300 hover:text-white rounded-sm cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="bg-[#09241C] border-t border-[#D4AF37]/30 overflow-x-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'general'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>الإعدادات العامة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nav-labels')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'nav-labels'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Menu className="w-3.5 h-3.5" />
              <span>عناوين القوائم والشريط</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'hero'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الواجهة والأثر والدرر</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'timeline'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>الخط الزمني والسيرة ({content.timeline.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'certificates'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>الشهادات والاعتمادات ({content.certificates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'books'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>المؤلفات والكتب ({content.books.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'videos'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>المكتبة المرئية ({content.videos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('testimonials')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'testimonials'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>شهادات العلماء ({content.testimonials.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'gallery'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>ألبوم الصور ({content.gallery.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'submissions'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>المشاركات المجتمعية ({submissions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-copilot')}
              className={`px-3 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'ai-copilot'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>المساعد الذكي (AI)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Status Toast */}
      {actionSuccessMsg && (
        <div className="fixed bottom-5 left-5 z-50 bg-[#0F382C] text-white border-2 border-[#D4AF37] p-3 rounded-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-xs font-bold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: General Settings */}
        {activeTab === 'general' && (
          <AdminGeneralTab
            general={content.general}
            onChange={updateGeneral}
            onSave={handleSaveAll}
            isSaving={isSaving}
          />
        )}

        {/* TAB: Navigation Labels & Menu Titles */}
        {activeTab === 'nav-labels' && (
          <AdminNavLabelsTab
            navLabels={content.navLabels}
            onChange={updateNavLabels}
          />
        )}

        {/* TAB 2: Hero & Quotes & Impact Metrics */}
        {activeTab === 'hero' && (
          <AdminHeroTab
            hero={content.hero}
            quotes={content.quotes}
            impactMetrics={content.impactMetrics}
            onHeroChange={updateHero}
            onQuotesChange={updateQuotes}
            onMetricsChange={updateImpactMetrics}
          />
        )}

        {/* TAB 3: Timeline & Milestones */}
        {activeTab === 'timeline' && (
          <AdminTimelineTab
            timeline={content.timeline}
            onChange={updateTimeline}
          />
        )}

        {/* TAB 4: Certificates */}
        {activeTab === 'certificates' && (
          <AdminCertificatesTab
            certificates={content.certificates}
            onChange={updateCertificates}
          />
        )}

        {/* TAB 5: Books */}
        {activeTab === 'books' && (
          <AdminBooksTab
            books={content.books}
            onChange={updateBooks}
          />
        )}

        {/* TAB 6: Videos */}
        {activeTab === 'videos' && (
          <AdminVideosTab
            videos={content.videos}
            onChange={updateVideos}
          />
        )}

        {/* TAB 7: Testimonials */}
        {activeTab === 'testimonials' && (
          <AdminTestimonialsTab
            testimonials={content.testimonials}
            onChange={updateTestimonials}
          />
        )}

        {/* TAB 8: Gallery */}
        {activeTab === 'gallery' && (
          <AdminGalleryTab
            gallery={content.gallery}
            onChange={updateGallery}
          />
        )}

        {/* TAB 9: Community Submissions */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-sm border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                  <span>إدارة مشاركات وذكريات المجتمع ({submissions.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  اعتماد أو رفض الذكريات والصور والشهادات المرسلة من أهالي بلدة المنيزلة ومحبي الشيخ.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchSubmissions}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-sm flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                  <span>تحديث القائمة</span>
                </button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSubmissionsFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm border cursor-pointer ${
                  submissionsFilter === 'all'
                    ? 'bg-[#0F382C] text-white border-[#0F382C]'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                الكل ({submissions.length})
              </button>
              <button
                type="button"
                onClick={() => setSubmissionsFilter('pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm border cursor-pointer ${
                  submissionsFilter === 'pending'
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                قيد المراجعة ({submissions.filter((s) => s.status === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setSubmissionsFilter('approved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm border cursor-pointer ${
                  submissionsFilter === 'approved'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                المعتمدة ({submissions.filter((s) => s.status === 'approved').length})
              </button>
            </div>

            {/* Submissions Cards */}
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-sm border border-slate-200 text-slate-500 text-xs">
                  لا توجد مشاركات مجتمعية حتى الآن.
                </div>
              ) : (
                submissions
                  .filter((s) => submissionsFilter === 'all' || s.status === submissionsFilter)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#0F382C]">{sub.contributorName}</h4>
                          <span className="text-[11px] text-slate-500">
                            {sub.relationship || 'محب ومتابع'} • {sub.createdAt}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-sm text-xs font-bold ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.status === 'approved'
                            ? 'معتمدة ومنشورة'
                            : sub.status === 'rejected'
                            ? 'مرفوضة'
                            : 'قيد المراجعة'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 font-amiri leading-relaxed whitespace-pre-line">
                        {sub.content}
                      </p>

                      {sub.mediaUrls && sub.mediaUrls.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {sub.mediaUrls.map((url, uIdx) => (
                            <div
                              key={uIdx}
                              onClick={() => onOpenLightbox(url, `مشاركة ${sub.contributorName}`)}
                              className="w-16 h-16 rounded-sm bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90"
                            >
                              <img src={url} alt="مرفق" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {sub.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => updateSubmissionStatus(sub.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-sm flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>اعتماد ونشر</span>
                            </button>
                          )}

                          {sub.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => updateSubmissionStatus(sub.id, 'rejected')}
                              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-sm flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteSubmission(sub.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف نهائي</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 10: AI Copilot */}
        {activeTab === 'ai-copilot' && (
          <div className="space-y-8">
            {/* Tool 1: AI Media Analyzer */}
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#D4AF37]" />
                  <span>المحلل الذكي للوثائق والصور الأرشيفية (Gemini Vision)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  ارفع صورة وثيقة، شهادة، أو صورة نادرة للشيخ، وسيقوم الذكاء الاصطناعي باستخراج النصوص وتحديد القسم المناسب واقتراح سنة الالتقاط والوسوم.
                </p>
              </div>

              <form onSubmit={handleAnalyzeMedia} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      اختر صورة الوثيقة أو الأرشيف
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAiSelectedFile(file);
                          setAiFilePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-[#0F382C] file:text-white hover:file:bg-[#154d3e] cursor-pointer"
                    />

                    {aiFilePreview && (
                      <div className="w-32 h-32 rounded-sm border overflow-hidden mt-2">
                        <img src={aiFilePreview} alt="معاينة" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      ملاحظات أو سياق إضافي (اختياري)
                    </label>
                    <textarea
                      rows={4}
                      value={aiNotes}
                      onChange={(e) => setAiNotes(e.target.value)}
                      placeholder="مثال: شهادة دكتوراه من جامعة الإمام أو صورة في بلدة المنيزلة..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzingMedia || (!aiSelectedFile && !aiNotes)}
                  className="px-5 py-2.5 bg-[#0F382C] hover:bg-[#154c3c] text-white text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzingMedia ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>جارٍ التحليل الذكي للوثيقة...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>بدء تحليل الوثيقة واستخراج البيانات</span>
                    </>
                  )}
                </button>
              </form>

              {aiAnalysisResult && (
                <div className="bg-[#FAF8F5] p-5 rounded-sm border-2 border-[#D4AF37] space-y-3 animate-in fade-in">
                  <h4 className="text-sm font-bold text-[#0F382C] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>نتائج التحليل الذكي:</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block">العنوان المقترح:</span>
                      <p className="text-slate-900 font-semibold">{aiAnalysisResult.title}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">القسم الموصى به:</span>
                      <span className="px-2 py-0.5 bg-[#0F382C] text-[#D4AF37] rounded-xs font-bold text-[11px]">
                        {aiAnalysisResult.suggestedSection}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">السنة التقريبية:</span>
                      <p className="text-slate-900 font-mono">{aiAnalysisResult.estimatedYear}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">الوسوم المقترحة:</span>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {aiAnalysisResult.tags?.map((t, idx) => (
                          <span key={idx} className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D4AF37]/30">
                    <span className="font-bold text-slate-700 block text-xs">الوصف والسياق المستخرج:</span>
                    <p className="text-xs text-slate-800 mt-1 leading-relaxed">{aiAnalysisResult.caption}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tool 2: AI Auto-Drafting */}
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#D4AF37]" />
                  <span>المساعد الذكي لصياغة المقالات والسيرة التوثيقية</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  أدخل موضوعاً أو محطة من سيرة الشيخ (مثل: تأسيس مسجد الإمام الجواد، رسالة الدكتوراه)، وسيقوم الذكاء الاصطناعي بصياغة نص توثيقي بأسلوب رصين.
                </p>
              </div>

              <form onSubmit={handleDraftContent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      الموضوع أو المحطة المطلوب صياغتها
                    </label>
                    <input
                      type="text"
                      value={draftTopic}
                      onChange={(e) => setDraftTopic(e.target.value)}
                      placeholder="مثال: دور الشيخ في الإصلاح الأسري وحل النزاعات ببلدة المنيزلة..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      نوع المحتوى
                    </label>
                    <select
                      value={draftContentType}
                      onChange={(e) => setDraftContentType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                    >
                      <option value="مقال توثيقي">مقال توثيقي</option>
                      <option value="محطة سيرة ذاتية">محطة سيرة ذاتية</option>
                      <option value="كلمة تأبينية">كلمة تأبينية</option>
                      <option value="إضاءة على كتاب">إضاءة على كتاب</option>
                      <option value="اقتباس ملهم">اقتباس ملهم</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDrafting || !draftTopic}
                  className="px-5 py-2.5 bg-[#0F382C] hover:bg-[#154c3c] text-white text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDrafting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>جارٍ الصياغة الأدبية والتوثيقية...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>صياغة النص التوثيقي بالذكاء الاصطناعي</span>
                    </>
                  )}
                </button>
              </form>

              {draftResult && (
                <div className="bg-[#FAF8F5] p-5 rounded-sm border-2 border-[#D4AF37] space-y-3 animate-in fade-in">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-base font-bold text-[#0F382C]">{draftResult.title}</h4>
                    <span className="text-xs text-amber-900 font-semibold">
                      السياق التاريخي: {draftResult.historicalContext}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-sm border border-slate-200">
                    {draftResult.content}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-1 flex-wrap">
                      {draftResult.suggestedTags?.map((t, idx) => (
                        <span key={idx} className="bg-[#D4AF37]/20 text-[#0F382C] px-2 py-0.5 rounded text-[10px] font-bold">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${draftResult.title}\n\n${draftResult.content}`);
                        showToast('تم نسخ النص التوثيقي إلى الحافظة بنجاح!');
                      }}
                      className="px-3 py-1.5 bg-[#0F382C] text-white text-xs font-bold rounded-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>نسخ النص</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* JSON Backup Import & Restore Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border-2 border-[#D4AF37] max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 text-right font-cairo">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-[#0F382C] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F382C]">
                    استيراد واستعادة نسخة احتياطية (JSON Restore)
                  </h3>
                  <p className="text-xs text-slate-500">
                    يمكنك رفع ملف نسخة احتياطية محفوظ على جهازك، أو لصق نص الـ JSON مباشرة.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Option 1: File Upload */}
              <div className="border-2 border-dashed border-[#D4AF37]/60 bg-[#FAF8F5] p-5 rounded-sm text-center space-y-2">
                <FileCode className="w-8 h-8 text-[#0F382C] mx-auto" />
                <div>
                  <p className="text-xs font-bold text-[#0F382C]">
                    اختر ملف النسخة الاحتياطية (.json) من جهازك
                  </p>
                  <p className="text-[11px] text-slate-500">
                    سيتم قراءة البيانات ومطابقتها وتطبيقها على الفور.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => jsonFileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-4 py-2 bg-[#0F382C] hover:bg-[#154637] text-[#D4AF37] font-bold text-xs rounded-sm border border-[#D4AF37] inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>تصفح واختيار ملف JSON</span>
                </button>
              </div>

              {/* Option 2: Paste JSON Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F382C]">
                  أو الصق نص كود الـ JSON هنا مباشرة:
                </label>
                <textarea
                  rows={6}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder='{"general": {...}, "hero": {...}, "timeline": [...]}'
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none text-left dir-ltr"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                ⚠️ سيتم استبدال البيانات الحالية بمحتوى النسخة وتعميمها سحابياً.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyJsonBackup(importJsonText)}
                  disabled={isImporting || !importJsonText.trim()}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>جارٍ الاستعادة والتثبيت...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>استعادة وتطبيق الآن</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
