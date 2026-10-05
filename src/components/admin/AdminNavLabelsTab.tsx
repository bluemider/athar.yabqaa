import React, { useState } from 'react';
import { NavLabels } from '../../types';
import {
  Menu,
  Home,
  Award,
  GraduationCap,
  Library,
  BookOpen,
  Film,
  Image as ImageIcon,
  HeartHandshake,
  MessageSquarePlus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Scroll,
} from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';
import { DEFAULT_SITE_CONTENT } from '../../data/defaultSiteContent';

interface AdminNavLabelsTabProps {
  navLabels?: NavLabels;
  onChange: (updated: Partial<NavLabels>) => void;
}

export const AdminNavLabelsTab: React.FC<AdminNavLabelsTabProps> = ({
  navLabels,
  onChange,
}) => {
  const { flushPendingSave } = useSiteContent();
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentLabels: NavLabels = {
    home: navLabels?.home || DEFAULT_SITE_CONTENT.navLabels?.home || 'الرئيسية',
    timeline: navLabels?.timeline || DEFAULT_SITE_CONTENT.navLabels?.timeline || 'السيرة المصورة',
    certificates: navLabels?.certificates || DEFAULT_SITE_CONTENT.navLabels?.certificates || 'الشهادات',
    certificatesDropdown: navLabels?.certificatesDropdown || DEFAULT_SITE_CONTENT.navLabels?.certificatesDropdown || 'الشهادات',
    academicCertificates: navLabels?.academicCertificates || DEFAULT_SITE_CONTENT.navLabels?.academicCertificates || 'الشهادات العلمية والأكاديمية',
    referenceCertificates: navLabels?.referenceCertificates || DEFAULT_SITE_CONTENT.navLabels?.referenceCertificates || 'الشهادات والإجازات المرجعية',
    libraryDropdown: navLabels?.libraryDropdown || DEFAULT_SITE_CONTENT.navLabels?.libraryDropdown || 'مكتبة أثر',
    books: navLabels?.books || DEFAULT_SITE_CONTENT.navLabels?.books || 'المؤلفات والكتب',
    videos: navLabels?.videos || DEFAULT_SITE_CONTENT.navLabels?.videos || 'المكتبة المرئية',
    gallery: navLabels?.gallery || DEFAULT_SITE_CONTENT.navLabels?.gallery || 'مكتبة الصور',
    testimonials: navLabels?.testimonials || DEFAULT_SITE_CONTENT.navLabels?.testimonials || 'قالوا عنه',
    submissions: navLabels?.submissions || DEFAULT_SITE_CONTENT.navLabels?.submissions || 'شاركنا أثرك',
  };

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const updateLabel = (key: keyof NavLabels, value: string) => {
    onChange({
      ...currentLabels,
      [key]: value,
    });
  };

  const handleBlur = () => {
    flushPendingSave().catch(() => {});
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من استعادة التسميات الافتراضية لجميع القوائم؟')) {
      onChange(DEFAULT_SITE_CONTENT.navLabels || {});
      flushPendingSave().catch(() => {});
      showNotification('تمت استعادة تسميات القوائم الافتراضية بنجاح.');
    }
  };

  return (
    <div className="space-y-6 text-right font-cairo">
      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-900/90 text-white border-2 border-[#D4AF37] p-3.5 rounded-sm shadow-md flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-[#FAF8F5] border border-[#D4AF37]/40 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0F382C] flex items-center gap-2">
            <Menu className="w-5 h-5 text-[#D4AF37]" />
            <span>إدارة وتخصيص عناوين القوائم وشريط التنقل</span>
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            يمكنك تخصيص أسماء كافة الأزرار والروابط في الشريط العلوي والقوائم المنسدلة ومطابقتها فوراً على الواجهة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-sm border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            title="استعادة الأسماء الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>الأسماء الافتراضية</span>
          </button>

          <FirestoreCloudSaveButton
            tabName="عناوين القوائم"
            onSaved={showNotification}
            showStatusPill={true}
          />
        </div>
      </div>

      {/* Live Navbar Preview Card */}
      <div className="bg-[#0A261E] text-white p-4 rounded-sm border-2 border-[#D4AF37] shadow-md space-y-2">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-2">
          <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>معاينة حية لشريط القوائم كما يظهر للزوار:</span>
          </span>
          <span className="text-[11px] text-slate-300">مباشر وفوري</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
          {/* Home */}
          <span className="px-2.5 py-1 bg-white/10 rounded text-slate-200 flex items-center gap-1">
            <Home className="w-3 h-3 text-[#D4AF37]" />
            <span>{currentLabels.home}</span>
          </span>

          {/* Timeline */}
          <span className="px-2.5 py-1 bg-white/10 rounded text-slate-200 flex items-center gap-1">
            <Award className="w-3 h-3 text-[#D4AF37]" />
            <span>{currentLabels.timeline}</span>
          </span>

          {/* Certificates Dropdown preview */}
          <span className="px-2.5 py-1 bg-[#D4AF37]/20 border border-[#D4AF37] text-white font-bold rounded flex items-center gap-1 shadow-xs">
            <GraduationCap className="w-3 h-3 text-[#D4AF37]" />
            <span>{currentLabels.certificatesDropdown} ▾</span>
            <span className="text-[10px] bg-black/30 text-[#D4AF37] px-1 rounded mr-1">
              ({currentLabels.academicCertificates} • {currentLabels.referenceCertificates})
            </span>
          </span>

          {/* Library dropdown preview */}
          <span className="px-2.5 py-1 bg-[#D4AF37] text-[#0F382C] font-black rounded flex items-center gap-1 shadow-xs">
            <Library className="w-3 h-3" />
            <span>{currentLabels.libraryDropdown} ▾</span>
            <span className="text-[10px] bg-black/20 text-white px-1 rounded mr-1">
              ({currentLabels.books} • {currentLabels.videos} • {currentLabels.gallery})
            </span>
          </span>

          {/* Testimonials */}
          <span className="px-2.5 py-1 bg-white/10 rounded text-slate-200 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3 text-[#D4AF37]" />
            <span>{currentLabels.testimonials}</span>
          </span>

          {/* Submissions */}
          <span className="px-2.5 py-1 bg-emerald-800 text-white border border-emerald-500 rounded flex items-center gap-1">
            <MessageSquarePlus className="w-3 h-3 text-[#D4AF37]" />
            <span>{currentLabels.submissions}</span>
          </span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="space-y-6">
        {/* Section 1: Top Navigation Strip Links */}
        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-2">
            <h4 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>الروابط الأساسية في الشريط العلوي</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              العناوين الظاهرة بشكل مباشر في شريط الموقع.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Home Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>عنوان رابط الرئيسية</span>
              </label>
              <input
                type="text"
                value={currentLabels.home}
                onChange={(e) => updateLabel('home', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="الرئيسية"
              />
            </div>

            {/* Timeline Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>عنوان رابط السيرة المصورة</span>
              </label>
              <input
                type="text"
                value={currentLabels.timeline}
                onChange={(e) => updateLabel('timeline', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="السيرة المصورة"
              />
            </div>

            {/* Testimonials Label (Directly on الشريط) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>عنوان رابط «قالوا عنه»</span>
              </label>
              <input
                type="text"
                value={currentLabels.testimonials}
                onChange={(e) => updateLabel('testimonials', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="قالوا عنه"
              />
            </div>

            {/* Community Submissions Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>عنوان زر «شاركنا أثرك»</span>
              </label>
              <input
                type="text"
                value={currentLabels.submissions}
                onChange={(e) => updateLabel('submissions', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="شاركنا أثرك"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Certificates Dropdown and Pillars */}
        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-2">
            <h4 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
              <span>قائمة «الشهادات» المنسدلة (العلمية والمرجعية)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              تسمية زر القائمة المنسدلة وتسميات قسمي الشهادات الأكاديمية والإجازات المرجعية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Certificates Main Dropdown Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>عنوان القائمة المنسدلة على الشريط</span>
              </label>
              <input
                type="text"
                value={currentLabels.certificatesDropdown}
                onChange={(e) => updateLabel('certificatesDropdown', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border-2 border-[#D4AF37] bg-amber-50/30 rounded-sm focus:border-[#0F382C] focus:outline-none font-bold text-[#0F382C]"
                placeholder="الشهادات"
              />
            </div>

            {/* Academic Certificates Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>قسم الشهادات العلمية والأكاديمية</span>
              </label>
              <input
                type="text"
                value={currentLabels.academicCertificates}
                onChange={(e) => updateLabel('academicCertificates', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="الشهادات العلمية والأكاديمية"
              />
            </div>

            {/* Reference Certificates Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <Scroll className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>قسم الشهادات والإجازات المرجعية</span>
              </label>
              <input
                type="text"
                value={currentLabels.referenceCertificates}
                onChange={(e) => updateLabel('referenceCertificates', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="الشهادات والإجازات المرجعية"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Library Dropdown and Sub-items */}
        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-2">
            <h4 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
              <Library className="w-4 h-4 text-[#D4AF37]" />
              <span>قائمة «مكتبة أثر» المنسدلة وأقسامها الفرعية</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              تسمية الزر الرئيسي للقائمة المنسدلة وتسميات الأقسام التخصصية المندرجة تحته.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Library Main Dropdown Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <Library className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>عنوان القائمة المنسدلة الرئيسية</span>
              </label>
              <input
                type="text"
                value={currentLabels.libraryDropdown}
                onChange={(e) => updateLabel('libraryDropdown', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border-2 border-[#D4AF37] bg-amber-50/40 rounded-sm focus:border-[#0F382C] focus:outline-none font-bold text-[#0F382C]"
                placeholder="مكتبة أثر"
              />
            </div>

            {/* Books Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>المؤلفات والكتب</span>
              </label>
              <input
                type="text"
                value={currentLabels.books}
                onChange={(e) => updateLabel('books', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="المؤلفات والكتب"
              />
            </div>

            {/* Videos Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>المكتبة المرئية</span>
              </label>
              <input
                type="text"
                value={currentLabels.videos}
                onChange={(e) => updateLabel('videos', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="المكتبة المرئية"
              />
            </div>

            {/* Gallery Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>مكتبة وألبوم الصور</span>
              </label>
              <input
                type="text"
                value={currentLabels.gallery}
                onChange={(e) => updateLabel('gallery', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                placeholder="مكتبة الصور"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
