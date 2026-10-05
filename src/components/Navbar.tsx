import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Shield,
  BookOpen,
  Film,
  Image as ImageIcon,
  Award,
  HeartHandshake,
  Home,
  MessageSquarePlus,
  ExternalLink,
  GraduationCap,
  ChevronDown,
  Library,
  Sparkles,
  Scroll,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useSiteContent } from '../context/SiteContentContext';

interface NavbarProps {
  currentView: 'home' | 'admin';
  setCurrentView: (view: 'home' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  isAdminLoggedIn,
  onOpenAdminLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [libraryDropdownOpen, setLibraryDropdownOpen] = useState(false);
  const [certificatesDropdownOpen, setCertificatesDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const certificatesDropdownRef = useRef<HTMLDivElement>(null);

  const { content, flushPendingSave } = useSiteContent();
  const general = content?.general;
  const youtubeUrl = general?.youtubeChannelUrl || "https://www.youtube.com/@athar.yabqaa313";
  const yearsOfLife = general?.yearsOfLife ? `(${general.yearsOfLife})` : '(1387 - 1444هـ)';

  // Nav labels from content or standard defaults
  const navLabels = {
    home: content?.navLabels?.home || 'الرئيسية',
    timeline: content?.navLabels?.timeline || 'السيرة المصورة',
    certificatesDropdown: content?.navLabels?.certificatesDropdown || 'الشهادات',
    academicCertificates: content?.navLabels?.academicCertificates || 'الشهادات العلمية والأكاديمية',
    referenceCertificates: content?.navLabels?.referenceCertificates || 'الشهادات والإجازات المرجعية',
    libraryDropdown: content?.navLabels?.libraryDropdown || 'مكتبة أثر',
    books: content?.navLabels?.books || 'المؤلفات والكتب',
    videos: content?.navLabels?.videos || 'المكتبة المرئية',
    gallery: content?.navLabels?.gallery || 'مكتبة الصور',
    testimonials: content?.navLabels?.testimonials || 'قالوا عنه',
    submissions: content?.navLabels?.submissions || 'شاركنا أثرك',
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLibraryDropdownOpen(false);
      }
      if (certificatesDropdownRef.current && !certificatesDropdownRef.current.contains(event.target as Node)) {
        setCertificatesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Core Top Links (Leading)
  const primaryNavLinks = [
    { label: navLabels.home, href: '#hero', icon: Home },
    { label: navLabels.timeline, href: '#timeline', icon: Award },
  ];

  // Sub-items inside «مكتبة أثر» dropdown (Books, Videos, Gallery)
  const librarySubLinks = [
    {
      label: navLabels.books,
      description: 'أبحاث ودراسات ومؤلفات سماحة الشيخ',
      href: '#books',
      icon: BookOpen,
      badge: `${content?.books?.length || 5} مؤلفات`,
    },
    {
      label: navLabels.videos,
      description: 'خطب وتسجيلات ودروس مرئية موثقة',
      href: '#videos',
      icon: Film,
      badge: `${content?.videos?.length || 6} تسجيلات`,
    },
    {
      label: navLabels.gallery,
      description: 'ألبوم الصور والوثائق والمناسبات النادرة',
      href: '#gallery',
      icon: ImageIcon,
      badge: `${content?.gallery?.length || 18} صورة`,
    },
  ];

  const handleNavClick = (href: string) => {
    if (currentView === 'admin') {
      flushPendingSave().catch(() => {});
      setCurrentView('home');
      setTimeout(() => {
        const el = document.querySelector(href.startsWith('#academic-') || href.startsWith('#reference-') ? '#certificates' : href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(href.startsWith('#academic-') || href.startsWith('#reference-') ? '#certificates' : href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setLibraryDropdownOpen(false);
    setCertificatesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleCertificatesNavClick = (type: 'academic' | 'reference') => {
    window.dispatchEvent(new CustomEvent('select-certificate-tab', { detail: { type } }));
    handleNavClick(type === 'academic' ? '#academic-certificates' : '#reference-certificates');
    setCertificatesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      if (currentView === 'admin') {
        flushPendingSave().catch(() => {});
      }
      setCurrentView(currentView === 'admin' ? 'home' : 'admin');
    } else {
      onOpenAdminLogin();
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 bg-[#0F382C] border-b-2 border-[#D4AF37] text-white shadow-xl select-none"
    >
      {/* 1. Top Utility Ribbon */}
      <div className="bg-[#082218] border-b border-[#D4AF37]/25 py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs font-cairo">
          {/* Right: Official platform badge */}
          <div className="flex items-center gap-2 text-[#FAF8F5]/90 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 animate-pulse" />
            <span className="truncate font-semibold hidden md:inline">
              المنصة الرسمية للأرشيف الرقمي والتوثيق لسماحة الشيخ د. كاظم ياسين الحريب
            </span>
            <span className="truncate font-semibold md:hidden">
              الأرشيف الرسمي لسماحة الشيخ د. كاظم الحريب
            </span>
            <span className="hidden lg:inline-block text-[#D4AF37] text-[11px] font-bold">
              {yearsOfLife}
            </span>
          </div>

          {/* Left: Direct official channels and quick tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <PWAInstallButton />

            <a
              id="top-youtube-link"
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-800/90 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold rounded-sm border border-red-500/40 transition-colors shadow-sm"
              title="القناة الرسمية لأرشيف الشيخ على اليوتيوب"
            >
              <Film className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">قناة «أثر يبقى»</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <button
              onClick={handleAdminClick}
              aria-label={currentView === 'admin' ? 'العودة للمنصة الرئيسية' : 'لوحة الإدارة'}
              title={currentView === 'admin' ? 'العودة للمنصة الرئيسية' : 'لوحة الإدارة'}
              className="hidden sm:inline-flex items-center justify-center p-1 text-[#D4AF37] hover:text-white border border-[#D4AF37]/50 hover:border-[#D4AF37] rounded-sm transition-colors cursor-pointer"
            >
              {currentView === 'admin' ? (
                <Home className="w-3.5 h-3.5" />
              ) : (
                <Shield className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3">
          {/* Brand Identity */}
          <button
            id="brand-logo-btn"
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 sm:gap-3.5 text-right group cursor-pointer focus:outline-none shrink-0 min-w-0"
          >
            {/* Calligraphic & Official Emblem */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#D4AF37] rounded-full flex items-center justify-center overflow-hidden bg-[#0A261E] shadow-md group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="سماحة الشيخ د. كاظم الحريب - رمز الخدمة والعطاء"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Subtitles */}
            <div className="text-right">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <span className="text-base sm:text-lg lg:text-xl font-black font-cairo text-white tracking-normal group-hover:text-[#D4AF37] transition-colors whitespace-nowrap">
                  الشيخ د. كاظم ياسين الحريب
                </span>
                <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-[#D4AF37] text-[#0F382C] rounded-sm shadow-sm whitespace-nowrap">
                  قدست روحه الزكية
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#FAF8F5]/80 font-cairo mt-0.5 truncate max-w-[220px] sm:max-w-none">
                منارة العلم والفضيلة • بلدة المنيزلة بمحافظة الأحساء
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links (Large Screens) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {primaryNavLinks.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="px-2 xl:px-2.5 py-1.5 text-xs xl:text-sm font-bold font-cairo text-[#FAF8F5]/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-sm transition-all cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}

            {/* «الشهادات» Integrated Dropdown Menu (العلمية & المرجعية) */}
            <div className="relative" ref={certificatesDropdownRef}>
              <button
                type="button"
                onClick={() => setCertificatesDropdownOpen(!certificatesDropdownOpen)}
                onMouseEnter={() => setCertificatesDropdownOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-bold font-cairo rounded-sm transition-all cursor-pointer border ${
                  certificatesDropdownOpen
                    ? 'bg-[#D4AF37] text-[#0F382C] border-[#D4AF37] shadow-md font-black'
                    : 'text-[#FAF8F5]/90 hover:text-[#D4AF37] hover:bg-white/5 border-transparent hover:border-[#D4AF37]/40'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{navLabels.certificatesDropdown}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    certificatesDropdownOpen ? 'rotate-180 text-[#0F382C]' : ''
                  }`}
                />
              </button>

              {/* Certificates Dropdown Popup */}
              {certificatesDropdownOpen && (
                <div
                  onMouseLeave={() => setCertificatesDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-72 bg-[#09241C] border-2 border-[#D4AF37] rounded-sm shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-right font-cairo"
                >
                  <div className="px-3 py-2 border-b border-[#D4AF37]/30 mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>{navLabels.certificatesDropdown} والاعتمادات الرسمية</span>
                    </span>
                    <span className="text-[10px] text-white/60">قسمان</span>
                  </div>

                  <div className="space-y-1">
                    {/* Option 1: الشهادات العلمية والأكاديمية */}
                    <button
                      onClick={() => handleCertificatesNavClick('academic')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-sm hover:bg-white/10 transition-colors text-right group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-sm bg-[#0F382C] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:scale-105 transition-all shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                            {navLabels.academicCertificates}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#FAF8F5]/70 truncate mt-0.5">
                          الدكتوراه والماجستير والاعتمادات المهنية
                        </p>
                      </div>
                    </button>

                    {/* Option 2: الشهادات والإجازات المرجعية */}
                    <button
                      onClick={() => handleCertificatesNavClick('reference')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-sm hover:bg-white/10 transition-colors text-right group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-sm bg-[#0F382C] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:scale-105 transition-all shrink-0 mt-0.5">
                        <Scroll className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                            {navLabels.referenceCertificates}
                          </span>
                          <span className="text-[10px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-1.5 py-0.5 rounded">
                            حوزوية
                          </span>
                        </div>
                        <p className="text-[11px] text-[#FAF8F5]/70 truncate mt-0.5">
                          الإجازات الروائية والشرعية وتزكيات العلماء
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* «مكتبة أثر» Integrated Dropdown Menu (Books, Videos, Gallery) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLibraryDropdownOpen(!libraryDropdownOpen)}
                onMouseEnter={() => setLibraryDropdownOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-bold font-cairo rounded-sm transition-all cursor-pointer border ${
                  libraryDropdownOpen
                    ? 'bg-[#D4AF37] text-[#0F382C] border-[#D4AF37] shadow-md font-black'
                    : 'text-[#D4AF37] hover:text-white bg-[#0A261E]/80 hover:bg-[#0A261E] border-[#D4AF37]/60 hover:border-[#D4AF37]'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>{navLabels.libraryDropdown}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    libraryDropdownOpen ? 'rotate-180 text-[#0F382C]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Popup */}
              {libraryDropdownOpen && (
                <div
                  onMouseLeave={() => setLibraryDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-72 bg-[#09241C] border-2 border-[#D4AF37] rounded-sm shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-right font-cairo"
                >
                  <div className="px-3 py-2 border-b border-[#D4AF37]/30 mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{navLabels.libraryDropdown} (الأرشيف التخصصي)</span>
                    </span>
                    <span className="text-[10px] text-white/60">3 أقسام</span>
                  </div>

                  <div className="space-y-1">
                    {librarySubLinks.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <button
                          key={sub.href}
                          onClick={() => handleNavClick(sub.href)}
                          className="w-full flex items-start gap-3 p-2.5 rounded-sm hover:bg-white/10 transition-colors text-right group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-sm bg-[#0F382C] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:scale-105 transition-all shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                                {sub.label}
                              </span>
                              {sub.badge && (
                                <span className="text-[10px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-1.5 py-0.5 rounded">
                                  {sub.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#FAF8F5]/70 truncate mt-0.5">
                              {sub.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* «قالوا عنه» Directly on the Ribbon */}
            <button
              onClick={() => handleNavClick('#testimonials')}
              className="px-2 xl:px-2.5 py-1.5 text-xs xl:text-sm font-bold font-cairo text-[#FAF8F5]/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{navLabels.testimonials}</span>
            </button>

            {/* Standalone Community Submission CTA Button */}
            <button
              onClick={() => handleNavClick('#submissions')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-sm font-bold font-cairo text-white bg-emerald-800/80 hover:bg-emerald-700 rounded-sm border border-emerald-500/50 hover:border-[#D4AF37] transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{navLabels.submissions}</span>
            </button>
          </nav>

          {/* Admin Switcher / Return to Platform on Desktop (Icon button) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              id="nav-admin-dashboard-btn"
              onClick={handleAdminClick}
              aria-label={currentView === 'admin' ? 'العودة للمنصة الرئيسية' : 'دخول لوحة الإدارة'}
              title={currentView === 'admin' ? 'العودة للمنصة الرئيسية' : 'دخول لوحة الإدارة والتحكم'}
              className={`flex items-center justify-center w-9 h-9 xl:w-10 xl:h-10 rounded-sm transition-all duration-200 cursor-pointer border-2 shadow-sm hover:scale-105 active:scale-95 ${
                currentView === 'admin'
                  ? 'bg-[#D4AF37] text-[#0F382C] border-[#D4AF37] hover:bg-[#e5c14e] shadow-md'
                  : 'bg-[#0A261E] hover:bg-[#144d3d] text-[#D4AF37] hover:text-white border-[#D4AF37]/80 hover:border-[#D4AF37]'
              }`}
            >
              {currentView === 'admin' ? (
                <Home className="w-4.5 h-4.5 text-[#0F382C]" />
              ) : (
                <Shield className="w-4.5 h-4.5 text-[#D4AF37]" />
              )}
            </button>
          </div>

          {/* Mobile / Tablet Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {/* Quick Admin Icon Button */}
            <button
              id="mobile-admin-btn"
              onClick={handleAdminClick}
              aria-label="لوحة الإدارة"
              className={`p-2 rounded-sm border ${
                currentView === 'admin'
                  ? 'bg-[#D4AF37] text-[#0F382C] border-[#D4AF37]'
                  : 'border-[#D4AF37]/60 text-[#D4AF37] bg-[#0A261E]'
              }`}
              title={currentView === 'admin' ? 'العودة للمنصة الرئيسية' : 'لوحة الإدارة'}
            >
              {currentView === 'admin' ? (
                <Home className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="تبديل القائمة"
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-white/40 hover:border-[#D4AF37] bg-[#0A261E] text-white rounded-sm transition-colors text-xs font-bold font-cairo cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#D4AF37]" /> : <Menu className="w-5 h-5" />}
              <span className="hidden sm:inline">{mobileMenuOpen ? 'إغلاق' : 'القائمة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="lg:hidden bg-[#0A261E] border-t border-[#D4AF37]/30 px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200"
        >
          {/* Main sections */}
          <div className="space-y-1 pb-3">
            <div className="text-[11px] font-bold text-[#D4AF37] mb-2 px-2">
              الأقسام الرئيسية:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {primaryNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold font-cairo text-[#FAF8F5] hover:text-[#D4AF37] transition-colors text-right cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              {/* قالوا عنه in Mobile */}
              <button
                onClick={() => handleNavClick('#testimonials')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold font-cairo text-[#FAF8F5] hover:text-[#D4AF37] transition-colors text-right cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{navLabels.testimonials}</span>
              </button>

              {/* شاركنا أثرك in Mobile */}
              <button
                onClick={() => handleNavClick('#submissions')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-sm bg-emerald-900/60 hover:bg-emerald-800 text-xs sm:text-sm font-bold font-cairo text-white transition-colors text-right cursor-pointer border border-emerald-500/40"
              >
                <MessageSquarePlus className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{navLabels.submissions}</span>
              </button>
            </div>
          </div>

          {/* «الشهادات» in Mobile */}
          <div className="pt-3 pb-3 border-t border-white/10 space-y-1.5">
            <div className="text-[11px] font-bold text-[#D4AF37] mb-1.5 px-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{navLabels.certificatesDropdown} (العلمية والأكاديمية والمرجعية):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCertificatesNavClick('academic')}
                className="flex items-center gap-2 p-2.5 rounded-sm bg-[#0F382C] hover:bg-[#144d3d] border border-[#D4AF37]/30 text-xs font-bold font-cairo text-[#FAF8F5] hover:text-[#D4AF37] transition-colors text-right cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{navLabels.academicCertificates}</span>
              </button>

              <button
                onClick={() => handleCertificatesNavClick('reference')}
                className="flex items-center gap-2 p-2.5 rounded-sm bg-[#0F382C] hover:bg-[#144d3d] border border-[#D4AF37]/30 text-xs font-bold font-cairo text-[#FAF8F5] hover:text-[#D4AF37] transition-colors text-right cursor-pointer"
              >
                <Scroll className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{navLabels.referenceCertificates}</span>
              </button>
            </div>
          </div>

          {/* «مكتبة أثر» grouped in mobile */}
          <div className="pt-3 pb-3 border-t border-white/10 space-y-1.5">
            <div className="text-[11px] font-bold text-[#D4AF37] mb-1.5 px-2 flex items-center gap-1.5">
              <Library className="w-3.5 h-3.5" />
              <span>{navLabels.libraryDropdown} (المؤلفات، المرئيات، ومكتبة الصور):</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {librarySubLinks.map((sub) => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.href}
                    onClick={() => handleNavClick(sub.href)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-sm bg-[#0F382C] hover:bg-[#144d3d] border border-[#D4AF37]/30 text-xs font-bold font-cairo text-[#FAF8F5] hover:text-[#D4AF37] transition-colors text-center cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[#D4AF37] mb-1" />
                    <span className="truncate w-full text-[11px]">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Actions Footer */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex justify-center pb-1">
              <PWAInstallButton />
            </div>

            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs sm:text-sm font-bold bg-[#D4AF37] text-[#0F382C] hover:bg-[#c49f2c] transition-colors cursor-pointer shadow-md"
            >
              {currentView === 'admin' ? (
                <>
                  <Home className="w-4 h-4" />
                  <span>العودة للمنصة الرئيسية</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>دخول لوحة الإدارة</span>
                </>
              )}
            </button>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-sm text-xs font-bold bg-red-800 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>زيارة قناة «أثر يبقى» على يوتيوب</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
