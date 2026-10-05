import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  BookOpen,
  HeartHandshake,
  Clock,
  ArrowDown,
  Play,
  Film,
  Scroll,
  MessageSquarePlus,
  Send,
  HelpCircle,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { ROTATING_QUOTES, IMPACT_METRICS } from '../data/archiveData';
import { useSiteContent } from '../context/SiteContentContext';

interface HeroSectionProps {
  onOpenVideoModal: (videoId: string) => void;
  onOpenLightbox: (imageUrl: string, title: string, caption?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenVideoModal,
  onOpenLightbox,
}) => {
  const { content } = useSiteContent();

  const heroConfig = content?.hero || {
    badge: 'المنصة الرسمية للسيرة والتوثيق والأرشيف المجتمعي',
    honorific: 'سماحة المربي الفاضل والمستشار الأسري (قدست روحه الزكية)',
    namePrefix: 'الشيخ الدكتور',
    sheikhName: 'كاظم ياسين الحريب',
    titleFontSize: 'lg',
    bioIntro: 'رمز بلدة المنيزلة بمحافظة الأحساء، رائد الإصلاح والتآلف المجتمعي، إمام محراب مساجد البلد وخارجها، مؤسس لجنة الإبداع والتطوير، ورائد الكوتشينج الأسري والتنمية الإنسانية.',
    exploreButtonText: 'استكشف السيرة المصورة',
    videoButtonText: 'وثائقي «رحيل الأمل»',
    videoButtonYoutubeId: 'p0atEekmf7c',
    communityButtonText: 'شاركنا ذكرياتك وأثرك',
    slides: [],
  };

  const heroImages = heroConfig.slides && heroConfig.slides.length > 0
    ? heroConfig.slides
    : [
        {
          id: 'slide-1',
          url: '/assets/sheikh/sheikh_kazim_26.jpg',
          title: 'سماحة الشيخ الدكتور كاظم ياسين الحريب',
          subtitle: 'صورة شخصية رسمية لسماحة المربي الفاضل',
        },
        {
          id: 'slide-2',
          url: '/assets/sheikh/sheikh_kazim_21.jpg',
          title: 'بين أهالي ووجهاء بلدة المنيزلة الأوفياء',
          subtitle: 'حضور مجتمعي حميم وحرص مستمر على التآلف والمودة',
        },
        {
          id: 'slide-3',
          url: '/assets/sheikh/sheikh_kazim_22.jpg',
          title: 'نبض القرية ورمز العطاء الأحسائي',
          subtitle: 'عقود من التفاني في خدمة قضايا الناس والبلدة',
        },
        {
          id: 'slide-4',
          url: '/assets/sheikh/sheikh_kazim_23.jpg',
          title: 'مجالس العلماء ورجالات المجتمع',
          subtitle: 'تشاور مستمر في سبيل وحدة الكلمة والإصلاح',
        },
        {
          id: 'slide-5',
          url: '/assets/sheikh/sheikh_kazim_24.jpg',
          title: 'الأثر الباقي ونبراس الأجيال',
          subtitle: 'إرث إيماني وعلمي متوارث يضيء درب الأبناء',
        },
      ];

  const quotesList = content?.quotes && content.quotes.length > 0
    ? content.quotes
    : ROTATING_QUOTES;

  const metricsList = content?.impactMetrics && content.impactMetrics.length > 0
    ? content.impactMetrics
    : IMPACT_METRICS;

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeQuote, setActiveQuote] = useState(0);
  const [isHoveringBar, setIsHoveringBar] = useState(false);

  // Active hover tooltip state
  const [activeTooltip, setActiveTooltip] = useState<'timeline' | 'documentary' | 'community' | null>(null);

  // Combine Quotes + Verification & Endorsement Tags from Certificates into a rich rotating bar
  const rotatingItems = React.useMemo(() => {
    const list: Array<{
      id: string;
      text: string;
      context: string;
      categoryBadge: string;
      isEndorsement: boolean;
      certId?: string;
    }> = [];

    // 1. Add verification and accreditation tags from all certificates
    const allCertificates = content?.certificates || [];
    allCertificates.forEach((cert) => {
      if (cert.verificationTags && Array.isArray(cert.verificationTags)) {
        cert.verificationTags.forEach((tag, tIdx) => {
          if (tag && tag.trim()) {
            list.push({
              id: `endorsement-${cert.id}-${tIdx}`,
              text: tag.trim(),
              context: cert.issuer
                ? `تزكية وتوثيق: ${cert.issuer}`
                : cert.title
                ? `وسام اعتماد موثق: ${cert.title}`
                : 'وسام وتزكية مرجعية معتمدة',
              categoryBadge: cert.type === 'reference' || cert.category === 'reference' || cert.category === 'ijaza'
                ? 'وسام وتزكية مرجعية'
                : 'وسام اعتماد وتوثيق علمي',
              isEndorsement: true,
              certId: cert.id,
            });
          }
        });
      }
    });

    // 2. Add rotating quotes
    quotesList.forEach((quote: any, qIdx: number) => {
      list.push({
        id: quote.id || `quote-${qIdx}`,
        text: quote.text,
        context: quote.context || 'من درر ومواعظ سماحة الشيخ',
        categoryBadge: 'درر ومواعظ مأثورة',
        isEndorsement: false,
      });
    });

    // Fallback if empty
    if (list.length === 0) {
      list.push({
        id: 'fallback-quote',
        text: 'بناء الإنسان ورعاية الأسرة هما غاية الإصلاح وبوابة الخير المجتمعي المستدام.',
        context: 'من كلمات وتوجيهات سماحة الشيخ',
        categoryBadge: 'درر ومواعظ مأثورة',
        isEndorsement: false,
      });
    }

    return list;
  }, [quotesList, content?.certificates]);

  // Auto rotate carousel every 6 seconds
  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Auto rotate quotes and endorsement tags every 6 seconds (pauses on hover)
  useEffect(() => {
    if (rotatingItems.length <= 1 || isHoveringBar) return;
    const timer = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % rotatingItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [rotatingItems.length, isHoveringBar]);

  const getMetricIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return <Clock className="w-6 h-6 text-[#D4AF37]" />;
      case 'Award':
        return <Award className="w-6 h-6 text-[#D4AF37]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-[#D4AF37]" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-[#D4AF37]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#D4AF37]" />;
    }
  };

  // Helper function to resolve dynamic title font size in exact pixels
  const getResolvedTitleFontSize = (size?: string) => {
    const raw = size || content?.general?.titleFontSize || '26';
    const parsed = parseInt(String(raw).replace(/\D/g, ''));
    if (!isNaN(parsed) && parsed > 0) return `${parsed}px`;
    return '26px';
  };

  // Helper function to resolve dynamic quotes font size in exact pixels
  const getResolvedQuotesFontSize = (size?: string) => {
    const raw = size || content?.general?.quotesFontSize || '16';
    const parsed = parseInt(String(raw).replace(/\D/g, ''));
    if (!isNaN(parsed) && parsed > 0) return `${parsed}px`;
    return '16px';
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden bg-[#09241C] text-white select-none">
      {/* Background Media Slider with overlay */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? 'opacity-35 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{
              backgroundImage: `url(${img.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              transition: 'opacity 1.2s ease-in-out, transform 8s ease',
            }}
          />
        ))}

        {/* Emerald and Gold gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09241C] via-[#0F382C]/85 to-[#09241C]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/15 via-transparent to-transparent" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Text & Introduction Column */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Noble Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-bold font-cairo text-[#FAF8F5]">
                {heroConfig.badge || 'المنصة الرسمية للسيرة والتوثيق والأرشيف المجتمعي'}
              </span>
            </div>

            {/* Main Headline with Custom Font Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-[2px] bg-[#D4AF37] inline-block"></span>
                <span className="text-base sm:text-lg font-bold text-[#D4AF37] font-cairo">
                  {heroConfig.honorific || 'سماحة المربي الفاضل والمستشار الأسري (قدست روحه الزكية)'}
                </span>
              </div>
              <h1
                style={{
                  fontSize: getResolvedTitleFontSize(heroConfig.titleFontSize),
                  lineHeight: '1.25',
                }}
                className="font-black font-cairo text-white tracking-normal transition-all duration-300"
              >
                {heroConfig.namePrefix || 'الشيخ الدكتور'} <br className="hidden sm:inline" />
                <span className="text-[#D4AF37] text-glow">
                  {heroConfig.sheikhName || 'كاظم ياسين الحريب'}
                </span>
              </h1>
            </div>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-[#FAF8F5]/95 font-cairo leading-relaxed max-w-2xl">
              {heroConfig.bioIntro || 'رمز بلدة المنيزلة بمحافظة الأحساء، رائد الإصلاح والتآلف المجتمعي، إمام محراب مساجد البلد وخارجها، مؤسس لجنة الإبداع والتطوير، ورائد الكوتشينج الأسري والتنمية الإنسانية.'}
            </p>

            {/* ========================================================= */}
            {/* 3 Sleek Compact Interactive Action Icons with Hover Tooltips */}
            {/* ========================================================= */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37]">
                <Sparkles className="w-3 h-3" />
                <span>أبرز محاور الاستكشاف والتفاعل (مرر للمزيد):</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                
                {/* 1. Timeline / Biography Compact Action Card */}
                <div
                  className="relative group/action flex-1 sm:flex-initial min-w-[110px] sm:min-w-[135px] max-w-[160px]"
                  onMouseEnter={() => setActiveTooltip('timeline')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <a
                    href="#timeline"
                    className="w-full flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-sm bg-gradient-to-b from-[#0F382C] to-[#082218] border border-[#D4AF37] hover:border-white text-white shadow-md hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 text-center cursor-pointer"
                  >
                    {/* Compact Icon */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0A261E] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover/action:bg-[#D4AF37] group-hover/action:text-[#0F382C] transition-colors shadow-xs mb-1 relative">
                      <Scroll className="w-4 h-4" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#D4AF37] group-hover/action:bg-[#0F382C] flex items-center justify-center text-[7px] text-[#0F382C] group-hover/action:text-[#D4AF37] font-black">
                        ✦
                      </span>
                    </div>

                    <span className="text-[11px] sm:text-xs font-bold font-cairo text-white group-hover/action:text-[#D4AF37] transition-colors leading-tight truncate max-w-full">
                      {heroConfig.exploreButtonText || 'السيرة المصورة'}
                    </span>

                    <span className="text-[9px] text-[#D4AF37]/90 font-medium mt-0.5 flex items-center gap-0.5">
                      <span>محطات الحياة</span>
                      <ArrowDown className="w-2.5 h-2.5 text-[#D4AF37]" />
                    </span>
                  </a>

                  {/* Hover Explanation Tooltip Popup */}
                  {activeTooltip === 'timeline' && (
                    <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-60 p-2.5 bg-[#09241C] border border-[#D4AF37] text-white rounded-sm shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-right pointer-events-none">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1 mb-1">
                        <Scroll className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>مهمة الزر: استكشاف السيرة المصورة</span>
                      </div>
                      <p className="text-[10px] text-[#FAF8F5]/90 leading-relaxed font-cairo">
                        الانتقال المباشر للمحطات والجدول الزمني الموثق بالصور النادرة وسيرة سماحة الشيخ.
                      </p>
                      <div className="mt-1 text-[9px] text-amber-300 font-bold flex items-center gap-1">
                        <Compass className="w-2.5 h-2.5" />
                        <span>اضغط للتمرير إلى الخط الزمني</span>
                      </div>
                      <div className="absolute top-full right-1/2 translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#D4AF37]" />
                    </div>
                  )}
                </div>

                {/* 2. Documentary Video Compact Action Card */}
                <div
                  className="relative group/action flex-1 sm:flex-initial min-w-[110px] sm:min-w-[135px] max-w-[160px]"
                  onMouseEnter={() => setActiveTooltip('documentary')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <button
                    type="button"
                    onClick={() => onOpenVideoModal(heroConfig.videoButtonYoutubeId || 'p0atEekmf7c')}
                    className="w-full flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-sm bg-gradient-to-b from-[#1a0808] to-[#0A261E] border border-red-500/70 hover:border-[#D4AF37] text-white shadow-md hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 text-center cursor-pointer"
                  >
                    {/* Compact Icon */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-900/80 border border-red-400 group-hover/action:border-[#D4AF37] flex items-center justify-center text-white group-hover/action:bg-red-600 transition-colors shadow-xs mb-1 relative">
                      <Play className="w-4 h-4 fill-current text-white mr-0.5" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    </div>

                    <span className="text-[11px] sm:text-xs font-bold font-cairo text-white group-hover/action:text-[#D4AF37] transition-colors leading-tight truncate max-w-full">
                      {heroConfig.videoButtonText || 'وثائقي «رحيل الأمل»'}
                    </span>

                    <span className="text-[9px] text-red-300 font-medium mt-0.5 flex items-center gap-0.5">
                      <Film className="w-2.5 h-2.5 text-red-400" />
                      <span>مشاهدة الفيلم</span>
                    </span>
                  </button>

                  {/* Hover Explanation Tooltip Popup */}
                  {activeTooltip === 'documentary' && (
                    <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-60 p-2.5 bg-[#09241C] border border-[#D4AF37] text-white rounded-sm shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-right pointer-events-none">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 border-b border-[#D4AF37]/30 pb-1 mb-1">
                        <Film className="w-3.5 h-3.5 text-red-400" />
                        <span>مهمة الزر: تشغيل الفيلم الوثائقي</span>
                      </div>
                      <p className="text-[10px] text-[#FAF8F5]/90 leading-relaxed font-cairo">
                        فتح مشغل العرض السينمائي لمشاهدة الفيلم الوثائقي التكريمي «رحيل الأمل».
                      </p>
                      <div className="mt-1 text-[9px] text-[#D4AF37] font-bold flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>اضغط للتشغيل السينمائي المباشر</span>
                      </div>
                      <div className="absolute top-full right-1/2 translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#D4AF37]" />
                    </div>
                  )}
                </div>

                {/* 3. Community Memories & Submissions Compact Action Card */}
                <div
                  className="relative group/action flex-1 sm:flex-initial min-w-[110px] sm:min-w-[135px] max-w-[160px]"
                  onMouseEnter={() => setActiveTooltip('community')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <a
                    href="#submissions"
                    className="w-full flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-sm bg-gradient-to-b from-[#0F382C] to-[#06261d] border border-emerald-500/70 hover:border-[#D4AF37] text-white shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 text-center cursor-pointer"
                  >
                    {/* Compact Icon */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-950 border border-emerald-400 group-hover/action:border-[#D4AF37] flex items-center justify-center text-emerald-300 group-hover/action:bg-[#D4AF37] group-hover/action:text-[#0F382C] transition-colors shadow-xs mb-1 relative">
                      <HeartHandshake className="w-4 h-4" />
                      <span className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-500 group-hover/action:bg-[#0F382C] flex items-center justify-center text-[7px] text-white group-hover/action:text-[#D4AF37] font-black">
                        ✍️
                      </span>
                    </div>

                    <span className="text-[11px] sm:text-xs font-bold font-cairo text-white group-hover/action:text-[#D4AF37] transition-colors leading-tight truncate max-w-full">
                      {heroConfig.communityButtonText || 'شاركنا أثرك'}
                    </span>

                    <span className="text-[9px] text-emerald-300 font-medium mt-0.5 flex items-center gap-0.5">
                      <MessageSquarePlus className="w-2.5 h-2.5 text-emerald-400" />
                      <span>تدوين شهادة أو ذكرى</span>
                    </span>
                  </a>

                  {/* Hover Explanation Tooltip Popup */}
                  {activeTooltip === 'community' && (
                    <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-60 p-2.5 bg-[#09241C] border border-[#D4AF37] text-white rounded-sm shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-right pointer-events-none">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 border-b border-[#D4AF37]/30 pb-1 mb-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                        <span>مهمة الزر: تدوين ذكرياتك وأثرك</span>
                      </div>
                      <p className="text-[10px] text-[#FAF8F5]/90 leading-relaxed font-cairo">
                        إرسال ذكرياتك الشخصية، مواقفك، أو صورك مع سماحة الشيخ لتنشر في سجل الوفاء.
                      </p>
                      <div className="mt-1 text-[9px] text-[#D4AF37] font-bold flex items-center gap-1">
                        <Send className="w-2.5 h-2.5" />
                        <span>اضغط لفتح نموذج المشاركة الفوري</span>
                      </div>
                      <div className="absolute top-full right-1/2 translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#D4AF37]" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Portrait Carousel Card Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] bg-[#FAF8F5]/10 border-2 border-[#D4AF37] overflow-hidden group shadow-2xl rounded-sm">
              
              {/* Inner Picture Container */}
              <div className="relative w-full h-full bg-[#04120E]">
                <img
                  src={heroImages[activeSlide].url}
                  alt={heroImages[activeSlide].title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={() =>
                    onOpenLightbox(
                      heroImages[activeSlide].url,
                      heroImages[activeSlide].title,
                      heroImages[activeSlide].subtitle
                    )
                  }
                />

                {/* Bottom Card Ribbon */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#09241C] via-[#09241C]/85 to-transparent p-5 text-right">
                  <span className="text-[10px] font-black text-[#D4AF37] tracking-widest uppercase font-cairo">
                    أرشيف بلدة المنيزلة
                  </span>
                  <h4 className="text-base font-bold text-white font-cairo">
                    {heroImages[activeSlide].title}
                  </h4>
                  <p className="text-xs text-[#FAF8F5]/80 font-cairo mt-0.5">
                    {heroImages[activeSlide].subtitle}
                  </p>
                </div>
              </div>

              {/* Editorial Stamp Badge */}
              <div className="absolute -bottom-1 -left-1 bg-[#D4AF37] text-[#0F382C] px-3.5 py-2 font-black text-xs uppercase tracking-tight shadow-lg border border-[#0F382C]/20 z-20">
                35+ عاماً من العطاء
              </div>

              {/* Slider Controls */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 z-20">
                <button
                  onClick={() =>
                    setActiveSlide(
                      (prev) => (prev - 1 + heroImages.length) % heroImages.length
                    )
                  }
                  aria-label="الصورة السابقة"
                  className="w-8 h-8 bg-black/70 hover:bg-[#D4AF37] text-white hover:text-[#0F382C] border border-[#D4AF37]/50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setActiveSlide((prev) => (prev + 1) % heroImages.length)
                  }
                  aria-label="الصورة التالية"
                  className="w-8 h-8 bg-black/70 hover:bg-[#D4AF37] text-white hover:text-[#0F382C] border border-[#D4AF37]/50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Slide Counter Indicator */}
              <div
                dir="rtl"
                className="absolute top-4 right-4 bg-black/85 backdrop-blur-md border border-[#D4AF37] text-[#D4AF37] px-3 py-1 text-xs font-cairo rounded-sm font-bold z-20 flex items-center gap-1.5 shadow-lg select-none"
              >
                <span className="text-gray-300 font-normal">صورة</span>
                <span className="text-white font-mono font-bold text-sm">{activeSlide + 1}</span>
                <span className="text-gray-300 font-normal">من</span>
                <span className="text-[#D4AF37] font-mono font-bold text-sm">{heroImages.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating Quotes & Endorsement Accreditations Bar */}
      {rotatingItems.length > 0 && (
        <div
          className="relative z-10 bg-[#061c16] border-y border-[#D4AF37]/30 py-4 px-4 sm:px-6 transition-colors"
          onMouseEnter={() => setIsHoveringBar(true)}
          onMouseLeave={() => setIsHoveringBar(false)}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Main Item Content */}
            <div className="flex items-start sm:items-center gap-3 text-right flex-1 min-w-0 w-full">
              {/* Type Icon with glowing gold border */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0F382C] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                {rotatingItems[activeQuote]?.isEndorsement ? (
                  <Award className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                {/* Badge Header for Category */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                    rotatingItems[activeQuote]?.isEndorsement
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {rotatingItems[activeQuote]?.isEndorsement ? (
                      <>
                        <Scroll className="w-2.5 h-2.5" />
                        <span>{rotatingItems[activeQuote]?.categoryBadge}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{rotatingItems[activeQuote]?.categoryBadge}</span>
                      </>
                    )}
                  </span>

                  {rotatingItems[activeQuote]?.isEndorsement && (
                    <a
                      href="#certificates"
                      className="text-[10px] text-amber-200 hover:text-white underline font-semibold flex items-center gap-0.5 transition-colors"
                    >
                      <span>عرض في قسم الشهادات</span>
                      <span>←</span>
                    </a>
                  )}
                </div>

                {/* Main Text Content */}
                <p
                  style={{ fontSize: getResolvedQuotesFontSize(heroConfig.quotesFontSize) }}
                  className="font-amiri font-bold text-[#FAF8F5] leading-relaxed transition-all drop-shadow-sm"
                >
                  «{rotatingItems[activeQuote]?.text}»
                </p>

                {/* Subtitle / Context */}
                <span className="text-xs text-[#D4AF37] font-cairo block">
                  — {rotatingItems[activeQuote]?.context}
                </span>
              </div>
            </div>

            {/* Navigation Buttons and Dots Indicators */}
            <div className="flex items-center gap-2 shrink-0 self-center md:self-auto pt-2 md:pt-0">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() =>
                  setActiveQuote((prev) => (prev - 1 + rotatingItems.length) % rotatingItems.length)
                }
                className="w-7 h-7 rounded-sm bg-[#0F382C] hover:bg-[#D4AF37] text-white hover:text-[#0F382C] border border-[#D4AF37]/40 flex items-center justify-center transition-colors cursor-pointer"
                title="السابق"
                aria-label="السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots for Items */}
              <div className="flex items-center gap-1 max-w-[150px] overflow-x-auto py-1">
                {rotatingItems.map((_, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => setActiveQuote(qIdx)}
                    className={`h-2 rounded-full transition-all cursor-pointer shrink-0 ${
                      qIdx === activeQuote ? 'bg-[#D4AF37] w-5' : 'bg-white/30 hover:bg-white/60 w-2'
                    }`}
                    aria-label={`الانتقال للعنصر ${qIdx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() =>
                  setActiveQuote((prev) => (prev + 1) % rotatingItems.length)
                }
                className="w-7 h-7 rounded-sm bg-[#0F382C] hover:bg-[#D4AF37] text-white hover:text-[#0F382C] border border-[#D4AF37]/40 flex items-center justify-center transition-colors cursor-pointer"
                title="التالي"
                aria-label="التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Impact Statistics Counter Row */}
      <div className="relative z-10 bg-[#09241C] py-8 border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {metricsList.map((metric, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-center mb-1">
                  {getMetricIcon(metric.icon)}
                </div>
                <div className="text-3xl sm:text-4xl font-black font-cairo text-[#D4AF37] tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs sm:text-sm font-bold font-cairo text-white">
                  {metric.label}
                </div>
                <div className="text-[11px] text-[#FAF8F5]/70 font-cairo">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
