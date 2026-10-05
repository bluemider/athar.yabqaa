import React, { useState, useEffect } from 'react';
import {
  Award,
  GraduationCap,
  Sparkles,
  ZoomIn,
  CheckCircle2,
  FileCheck,
  Calendar,
  Building,
  Scroll,
  BookOpen,
  Send,
  ShieldCheck,
  FileText,
  HeartHandshake,
} from 'lucide-react';
import { SectionNavigationHeader } from './SectionNavigationHeader';
import { ACADEMIC_CERTIFICATES } from '../data/archiveData';
import { AcademicCertificate } from '../types';
import { useSiteContent } from '../context/SiteContentContext';

interface CertificatesSectionProps {
  onOpenLightbox: (
    imageUrl: string,
    title: string,
    caption?: string,
    dateOrYear?: string,
    tags?: string[],
    code?: string
  ) => void;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  onOpenLightbox,
}) => {
  const { content } = useSiteContent();
  const navLabels = content?.navLabels;
  const certificatesList: AcademicCertificate[] = content?.certificates && content.certificates.length > 0
    ? content.certificates
    : ACADEMIC_CERTIFICATES;

  // Main Section Tab: 'academic' vs 'reference'
  const [mainTab, setMainTab] = useState<'academic' | 'reference'>('academic');

  // Sub-filter for Academic Certificates
  const [academicFilter, setAcademicFilter] = useState<'all' | 'doctorate' | 'master' | 'honorary' | 'practitioner' | 'award'>('all');

  // Listen to hash changes or custom events from Navbar
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash === '#reference-certificates') {
        setMainTab('reference');
      } else if (hash === '#academic-certificates' || hash === '#certificates') {
        setMainTab('academic');
      }
    };

    const handleCustomCertEvent = (e: any) => {
      if (e.detail?.type === 'reference') {
        setMainTab('reference');
      } else if (e.detail?.type === 'academic') {
        setMainTab('academic');
      }
    };

    window.addEventListener('hashchange', handleHashCheck);
    window.addEventListener('select-certificate-tab', handleCustomCertEvent);
    handleHashCheck();

    return () => {
      window.removeEventListener('hashchange', handleHashCheck);
      window.removeEventListener('select-certificate-tab', handleCustomCertEvent);
    };
  }, []);

  // Filter lists
  const academicCertificates = certificatesList.filter((cert) => {
    // If explicitly marked as reference, skip from academic
    if (cert.type === 'reference' || cert.category === 'reference' || cert.category === 'ijaza' || cert.category === 'hawza') {
      return false;
    }
    if (academicFilter === 'all') return true;
    if (academicFilter === 'doctorate') return cert.category === 'doctorate' || cert.category === 'master';
    return cert.category === academicFilter;
  });

  const referenceCertificates = certificatesList.filter((cert) => {
    return cert.type === 'reference' || cert.category === 'reference' || cert.category === 'ijaza' || cert.category === 'hawza';
  });

  const academicFilterButtons = [
    { id: 'all', label: `كافة الشهادات والاعتمادات (${certificatesList.filter(c => c.type !== 'reference' && c.category !== 'reference' && c.category !== 'ijaza' && c.category !== 'hawza').length})` },
    { id: 'doctorate', label: 'الدكتوراه والماجستير' },
    { id: 'honorary', label: 'العضويات الفخرية والأكاديمية' },
    { id: 'award', label: 'الجوائز والتكريم الدولي' },
    { id: 'practitioner', label: 'رخص وتدريب الكوتشينج (EDU/TOT)' },
  ];

  return (
    <section id="certificates" className="py-20 bg-[#0F382C] text-white relative overflow-hidden">
      {/* Subtle Background textures */}
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Integrated Section Navigation & Back Button */}
        <SectionNavigationHeader
          parentName="السيرة والمسيرة"
          currentName={mainTab === 'academic' ? (navLabels?.academicCertificates || 'الشهادات العلمية والأكاديمية') : (navLabels?.referenceCertificates || 'الشهادات والإجازات المرجعية')}
          theme="dark"
          showLibraryLinks={false}
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/20 text-[#FAF8F5] text-sm font-bold font-cairo border border-[#D4AF37] rounded-sm shadow-sm">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>سجل الاعتمادات والشهادات الرسمية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-cairo text-white flex items-center justify-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
            <span>{navLabels?.certificatesDropdown || 'الشهادات والاعتمادات الرسمية'}</span>
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
          </h2>
          <p className="text-lg sm:text-xl text-[#FAF8F5]/90 font-cairo leading-relaxed">
            التوثيق الشامل للشهادات الأكاديمية العليا، الرخص المهنية، والاعتمادات والإجازات الدينية والمرجعية الممنوحة لسماحة الشيخ الدكتور كاظم الحريب.
          </p>
          <div className="w-28 h-[2px] bg-[#D4AF37] mx-auto pt-0" />
        </div>

        {/* 1. Primary Two-Pillar Switcher (الشهادات العلمية vs الشهادات المرجعية) */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-[#082218] p-1.5 rounded-sm border-2 border-[#D4AF37] shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              id="tab-btn-academic"
              onClick={() => {
                setMainTab('academic');
                window.history.replaceState(null, '', '#academic-certificates');
              }}
              className={`py-3.5 px-4 rounded-sm text-sm sm:text-base font-bold font-cairo flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                mainTab === 'academic'
                  ? 'bg-[#D4AF37] text-[#0F382C] shadow-lg font-black scale-[1.01]'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className={`w-5 h-5 ${mainTab === 'academic' ? 'text-[#0F382C]' : 'text-[#D4AF37]'}`} />
              <span>{navLabels?.academicCertificates || 'الشهادات العلمية والأكاديمية'}</span>
            </button>

            <button
              type="button"
              id="tab-btn-reference"
              onClick={() => {
                setMainTab('reference');
                window.history.replaceState(null, '', '#reference-certificates');
              }}
              className={`py-3.5 px-4 rounded-sm text-sm sm:text-base font-bold font-cairo flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                mainTab === 'reference'
                  ? 'bg-[#D4AF37] text-[#0F382C] shadow-lg font-black scale-[1.01]'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scroll className={`w-5 h-5 ${mainTab === 'reference' ? 'text-[#0F382C]' : 'text-[#D4AF37]'}`} />
              <span>{navLabels?.referenceCertificates || 'الشهادات والإجازات المرجعية'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ACADEMIC CERTIFICATES */}
        {/* ========================================================= */}
        {mainTab === 'academic' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Sub-Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {academicFilterButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setAcademicFilter(btn.id as any)}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold font-cairo transition-all cursor-pointer rounded-sm border ${
                    academicFilter === btn.id
                      ? 'bg-[#D4AF37] text-[#0F382C] border-[#D4AF37] shadow-md font-extrabold'
                      : 'bg-[#0F382C] hover:bg-white/10 text-[#FAF8F5] border-[#D4AF37]/40'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Academic Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {academicCertificates.map((cert: AcademicCertificate) => {
                const issuerName = cert.issuer || cert.institution || 'جامعة أو هيئة أكاديمية';
                return (
                  <div
                    key={cert.id}
                    id={`cert-${cert.id}`}
                    className="group bg-[#09241C] border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-sm overflow-hidden shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Top Media Preview with Zoom trigger */}
                    <div
                      className="relative aspect-[4/3] bg-white overflow-hidden cursor-pointer group/img border-b border-[#D4AF37]/30"
                      onClick={() =>
                        onOpenLightbox(
                          cert.imageUrl,
                          cert.title,
                          `${cert.description} — الجهة المانحة: ${issuerName} (${cert.country || ''})`,
                          cert.year,
                          [issuerName, cert.country || '', cert.category],
                          cert.code
                        )
                      }
                    >
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="w-full h-full object-contain p-3 group-hover/img:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Hover overlay with zoom button */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-4 py-2.5 rounded-sm bg-[#D4AF37] text-[#0F382C] font-extrabold text-sm font-cairo flex items-center gap-2 shadow-md">
                          <ZoomIn className="w-4 h-4" />
                          <span>تكبير وقراءة الوثيقة</span>
                        </div>
                      </div>

                      {/* Badge corner */}
                      <div className="absolute top-3 right-3 bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37] px-3 py-1 rounded-sm text-xs sm:text-sm font-bold font-cairo shadow-sm">
                        {cert.year}
                      </div>
                    </div>

                    {/* Certificate Metadata */}
                    <div className="p-6 space-y-3.5 flex-1 flex flex-col justify-between text-right">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#D4AF37] font-semibold">
                          <Building className="w-4 h-4 text-[#D4AF37]" />
                          <span>{issuerName}</span>
                          {cert.country && (
                            <>
                              <span className="text-white/40">•</span>
                              <span>{cert.country}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold font-cairo text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                          {cert.title}
                        </h3>

                        <p className="text-sm sm:text-base text-[#FAF8F5]/85 font-cairo leading-relaxed line-clamp-3">
                          {cert.description}
                        </p>
                      </div>

                      {/* Footer specs */}
                      <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-[#FAF8F5]/80">
                        <span className="font-mono bg-white/5 px-2.5 py-1 rounded-sm border border-[#D4AF37]/30 text-xs text-[#D4AF37]">
                          {cert.code ? `كود: ${cert.code}` : `المستفيد: ${cert.recipient || 'سماحة الشيخ'}`}
                        </span>

                        <button
                          onClick={() =>
                            onOpenLightbox(
                              cert.imageUrl,
                              cert.title,
                              cert.description,
                              cert.year,
                              [issuerName],
                              cert.code
                            )
                          }
                          className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>عرض التفاصيل</span>
                          <FileCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Banner on Academic Excellence */}
            <div className="mt-14 p-6 rounded-sm bg-[#09241C] border border-[#D4AF37] text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-lg font-bold font-cairo text-[#D4AF37]">
                  التكامل المعرفي بين الفقه الديني والعلوم المعاصرة
                </h4>
                <p className="text-sm text-[#FAF8F5]/85 font-cairo">
                  عكست مسيرة الشيخ الأكاديمية حرصه على امتلاك أحدث مهارات الكوتشينج والتوجيه الأسري لخدمة مجتمعه وأمته.
                </p>
              </div>
              <div className="px-5 py-2.5 bg-[#0F382C] border border-[#D4AF37] text-[#FAF8F5] text-xs font-bold font-cairo uppercase tracking-wider shrink-0 shadow-md inline-flex items-center gap-2 rounded-sm">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>أرشيف رسمي موثق ومؤرشف</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REFERENCE & HAWZA CERTIFICATES (الشهادات والإجازات المرجعية) */}
        {/* ========================================================= */}
        {mainTab === 'reference' && (
          <div className="space-y-10 animate-in fade-in duration-300 text-right">
            {referenceCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {referenceCertificates.map((cert: AcademicCertificate) => {
                  const issuerName = cert.issuer || cert.institution || 'مرجع الدين أو الفقيه المانح';
                  return (
                    <div
                      key={cert.id}
                      className="group bg-[#09241C] border-2 border-[#D4AF37] rounded-sm overflow-hidden shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div
                        className="relative aspect-[4/3] bg-white overflow-hidden cursor-pointer group/img border-b border-[#D4AF37]/30"
                        onClick={() =>
                          onOpenLightbox(
                            cert.imageUrl,
                            cert.title,
                            `${cert.description} — الجهة / المرجع: ${issuerName}`,
                            cert.year,
                            [issuerName, 'إجازة مرجعية']
                          )
                        }
                      >
                        <img
                          src={cert.imageUrl}
                          alt={cert.title}
                          className="w-full h-full object-contain p-3 group-hover/img:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="px-4 py-2.5 rounded-sm bg-[#D4AF37] text-[#0F382C] font-extrabold text-sm font-cairo flex items-center gap-2 shadow-md">
                            <ZoomIn className="w-4 h-4" />
                            <span>تكبير الوثيقة المرجعية</span>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37] px-3 py-1 rounded-sm text-xs font-bold font-cairo shadow-sm flex items-center gap-1.5">
                          <Scroll className="w-3.5 h-3.5" />
                          <span>إجازة مرجعية • {cert.year}</span>
                        </div>
                      </div>

                      <div className="p-6 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#D4AF37] font-bold">
                            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                            <span>{issuerName}</span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold font-cairo text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                            {cert.title}
                          </h3>

                          <p className="text-sm sm:text-base text-[#FAF8F5]/85 font-cairo leading-relaxed">
                            {cert.description}
                          </p>
                        </div>

                        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-[#FAF8F5]/80">
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1 rounded-sm text-xs font-semibold">
                            وثيقة معتمدة ومؤرشفة
                          </span>

                          <button
                            onClick={() =>
                              onOpenLightbox(
                                cert.imageUrl,
                                cert.title,
                                cert.description,
                                cert.year,
                                [issuerName]
                              )
                            }
                            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>عرض الوثيقة</span>
                            <FileCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Noble & Respectful Empty State / Under-Archival Banner */
              <div className="bg-[#09241C] border-2 border-[#D4AF37] rounded-sm p-8 sm:p-12 shadow-2xl space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#0F382C] border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37] shadow-lg">
                    <Scroll className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold font-cairo text-[#D4AF37]">
                    قسم الشهادات والإجازات والتزكيات المرجعية
                  </h3>

                  <p className="text-base sm:text-lg text-[#FAF8F5]/90 font-cairo leading-relaxed">
                    يجري حالياً جمع وأرشفة وتدقيق الوثائق والإجازات الروائية والشرعية والتزكيات الصادرة من المراجع العظام وكبار الفقهاء لسماحة الشيخ الدكتور كاظم الحريب (قدست روحه الزكية) لتوثيقها وتثبيتها تباعاً في هذا السجل المبارك.
                  </p>
                </div>

                {/* 3 Pillars of Clerical / Reference Endorsements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#D4AF37]/30">
                  <div className="p-5 rounded-sm bg-[#0F382C] border border-[#D4AF37]/40 space-y-2.5">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm sm:text-base">
                      <Scroll className="w-5 h-5 text-[#D4AF37]" />
                      <span>إجازات الرواية والحديث</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#FAF8F5]/75 leading-relaxed font-cairo">
                      أسانيد الرواية المعتمدة والتصديق العلمي لنقل وتدريس الروايات والأحاديث الشريفة عن أئمة أهل البيت (عليهم السلام).
                    </p>
                  </div>

                  <div className="p-5 rounded-sm bg-[#0F382C] border border-[#D4AF37]/40 space-y-2.5">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm sm:text-base">
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                      <span>الوكالات والتفويضات الشرعية</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#FAF8F5]/75 leading-relaxed font-cairo">
                      وثائق الاعتماد والتخويل الصادرة من مراجع التقليد العظام لإدارة الشؤون الحسبية والشرعية ورعاية المؤمنين.
                    </p>
                  </div>

                  <div className="p-5 rounded-sm bg-[#0F382C] border border-[#D4AF37]/40 space-y-2.5">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm sm:text-base">
                      <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
                      <span>شهادات وتزكيات الحوزة</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#FAF8F5]/75 leading-relaxed font-cairo">
                      شهادات التحصيل العلمي وإجازات الفضيلة والمحطات الحوزوية المباركة وإقرارات أساطين العلم بفضله.
                    </p>
                  </div>
                </div>

                {/* Contribution Prompt */}
                <div className="bg-[#082218] p-5 rounded-sm border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="w-6 h-6 text-[#D4AF37] shrink-0 hidden sm:inline" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        هل تحتفظ بنسخة من وثيقة أو إجازة مرجعية للشيخ؟
                      </h4>
                      <p className="text-xs text-[#FAF8F5]/70">
                        ندعو كافة التلامذة والأهالي والمهتمين لتزويد الأرشيف بالوثائق المعتمدة لتخليدها.
                      </p>
                    </div>
                  </div>

                  <a
                    href="#submissions"
                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2c] text-[#0F382C] font-extrabold text-xs sm:text-sm font-cairo rounded-sm flex items-center gap-2 shrink-0 transition-colors shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>شاركنا وثيقة أو إجازة</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
