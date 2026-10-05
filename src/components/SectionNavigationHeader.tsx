import React from 'react';
import { Home, ArrowUp, ArrowRight, Library, BookOpen, Film, Image as ImageIcon, HeartHandshake } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface SectionNavigationHeaderProps {
  /** Parent section or category name, e.g. "مكتبة أثر" or "المنصة الرسمية" */
  parentName?: string;
  /** Name of the current section */
  currentName: string;
  /** Color theme of the hosting section */
  theme?: 'light' | 'dark';
  /** Show fast jump buttons to other library sections */
  showLibraryLinks?: boolean;
}

export const SectionNavigationHeader: React.FC<SectionNavigationHeaderProps> = ({
  parentName,
  currentName,
  theme = 'light',
  showLibraryLinks = false,
}) => {
  const isDark = theme === 'dark';
  const { content } = useSiteContent();
  const navLabels = content?.navLabels;

  const resolvedParentName = parentName ?? (navLabels?.libraryDropdown || 'مكتبة أثر');

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`mb-8 p-3 sm:p-4 rounded-sm border flex flex-wrap items-center justify-between gap-3 font-cairo transition-all ${
        isDark
          ? 'bg-[#082218]/90 border-[#D4AF37]/30 text-white shadow-md'
          : 'bg-white border-slate-200 text-slate-800 shadow-xs'
      }`}
    >
      {/* Breadcrumb Navigation on the Right */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold flex-wrap">
        <button
          type="button"
          onClick={scrollToTop}
          className={`flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors cursor-pointer ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
          title="العودة إلى الصفحة الرئيسية"
        >
          <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{navLabels?.home || 'الرئيسية'}</span>
        </button>

        <span className="text-[#D4AF37] font-sans">/</span>

        {resolvedParentName && (
          <>
            <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {resolvedParentName}
            </span>
            <span className="text-[#D4AF37] font-sans">/</span>
          </>
        )}

        <span className="text-[#D4AF37] font-extrabold flex items-center gap-1">
          <span>{currentName}</span>
        </span>
      </div>

      {/* Structural Action & Return Buttons on the Left */}
      <div className="flex items-center gap-2 flex-wrap">
        {showLibraryLinks && (
          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-300/30">
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              تنقل سريع:
            </span>
            <button
              type="button"
              onClick={() => scrollToSection('#books')}
              className={`p-1.5 rounded-sm hover:text-[#D4AF37] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="الانتقال إلى المؤلفات والكتب"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden lg:inline">{navLabels?.books || 'الكتب'}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('#videos')}
              className={`p-1.5 rounded-sm hover:text-[#D4AF37] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="الانتقال إلى المكتبة المرئية"
            >
              <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden lg:inline">{navLabels?.videos || 'المرئيات'}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('#gallery')}
              className={`p-1.5 rounded-sm hover:text-[#D4AF37] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="الانتقال إلى ألبوم الصور"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden lg:inline">{navLabels?.gallery || 'الصور'}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('#testimonials')}
              className={`p-1.5 rounded-sm hover:text-[#D4AF37] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="الانتقال إلى قالوا عنه"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden lg:inline">{navLabels?.testimonials || 'قالوا عنه'}</span>
            </button>
          </div>
        )}

        {/* Integrated Back Button */}
        <button
          type="button"
          onClick={scrollToTop}
          className={`px-3 py-1.5 text-xs font-bold rounded-sm border flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isDark
              ? 'bg-[#0F382C] hover:bg-[#144d3d] text-white border-[#D4AF37]/50 hover:border-[#D4AF37]'
              : 'bg-[#0F382C] hover:bg-[#144d3d] text-white border-[#D4AF37]'
          }`}
          title="العودة لأعلى الصفحة وللقائمة الرئيسية"
        >
          <ArrowUp className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>العودة للأعلى</span>
        </button>
      </div>
    </div>
  );
};
