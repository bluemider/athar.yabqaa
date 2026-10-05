import React from 'react';
import {
  Film,
  ExternalLink,
  Heart,
  Shield,
  BookOpen,
  Award,
  Lock,
  ArrowUp,
  ArrowRight,
} from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { content } = useSiteContent();
  const general = content?.general || {
    siteTitle: 'سيرة وأثر الشيخ الدكتور كاظم ياسين الحريب',
    sheikhHonorific: 'سماحة المربي الفاضل والفقيه المصلح (قدست روحه الزكية)',
    yearsOfLife: '1968م – 2022م',
    mosqueName: 'مسجد الإمام الجواد (ع)',
    villageName: 'بلدة المنيزلة',
    governorateName: 'محافظة الأحساء',
    footerBio: 'منصة توثيقية رقمية مجتمعية وفاءً لسيرة وعطاء سماحة الشيخ الدكتور كاظم ياسين الحريب، رمز بلدة المنيزلة بمحافظة الأحساء، وإمام محراب مسجد الإمام الجواد (ع)، ورائد الإصلاح الأسري والمجتمعي.',
    youtubeChannelUrl: 'https://www.youtube.com/@athar.yabqaa313',
    instagramUrl: 'https://www.instagram.com/p/DL5Zr5sMfkM/',
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#09241C] text-white border-t-2 border-[#D4AF37]/40 relative overflow-hidden font-cairo">
      {/* Background radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 text-right">
          
          {/* Col 1: Identity & Description */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0F382C] border-2 border-[#D4AF37] overflow-hidden shadow-md flex items-center justify-center shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="سماحة الشيخ د. كاظم الحريب"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-cairo">
                  الشيخ د. كاظم ياسين الحريب
                </h3>
                <span className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                  {general.sheikhHonorific} ({general.yearsOfLife})
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#FAF8F5]/80 leading-relaxed max-w-md">
              {general.footerBio}
            </p>

            <div className="p-3.5 rounded-sm bg-[#0F382C] border border-[#D4AF37]/30 text-[11px] text-[#FAF8F5]/70 space-y-1">
              <p className="font-bold text-[#D4AF37] uppercase tracking-wider">
                التزام التوثيق والأمانة الأرشيفية:
              </p>
              <p>
                كافة المواد والشهادات والصور والمؤلفات المعروضة في هذه المنصة مستخرجة حصراً من الأرشيف الرقمي المعتمد والمصادر الرسمية الموثقة.
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-[#D4AF37] inline-block"></span>
              <span>أقسام المنصة الأرشيفية</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF8F5]/80">
              <li>
                <a href="#hero" className="hover:text-[#D4AF37] transition-colors">
                  الرئيسية ونبذة الأثر
                </a>
              </li>
              <li>
                <a href="#timeline" className="hover:text-[#D4AF37] transition-colors">
                  السيرة الذاتية (الخط الزمني المصور)
                </a>
              </li>
              <li>
                <a href="#certificates" className="hover:text-[#D4AF37] transition-colors">
                  الشهادات والاعتمادات العلمية
                </a>
              </li>
              <li>
                <a href="#books" className="hover:text-[#D4AF37] transition-colors">
                  المؤلفات والكتب التخصصية
                </a>
              </li>
              <li>
                <a href="#videos" className="hover:text-[#D4AF37] transition-colors">
                  المكتبة المرئية وقناة أثر يبقى
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-[#D4AF37] transition-colors">
                  شهادات العلماء والوجهاء (قالوا عنه)
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#D4AF37] transition-colors">
                  ألبوم الصور ومحطات العطاء
                </a>
              </li>
              <li>
                <a href="#submissions" className="hover:text-[#D4AF37] transition-colors">
                  شاركنا أثرك وذكرياتك
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Official External Links & Admin */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-[#D4AF37] inline-block"></span>
              <span>المصادر والروابط الرسمية المعتمدة</span>
            </h4>

            <div className="space-y-2.5">
              <a
                href={general.youtubeChannelUrl || "https://www.youtube.com/@athar.yabqaa313"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-sm bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-bold text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400" />
                  <span>قناة «أثر يبقى» الرسمية على YouTube</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/70" />
              </a>

              <a
                href="#certificates"
                className="flex items-center justify-between p-2.5 rounded-sm bg-[#0F382C] hover:bg-[#164e3e] border border-[#D4AF37]/40 text-xs font-bold text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span>أرشيف الوثائق والشهادات الأكاديمية</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] rtl:rotate-180" />
              </a>

              <a
                href={general.instagramUrl || "https://www.instagram.com/p/DL5Zr5sMfkM/"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-sm bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-bold text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-pink-400" />
                  <span>منشورات الكتب (صوت مؤلف - Instagram)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/70" />
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#0F382C] hover:bg-[#164e3e] text-[#D4AF37] border border-[#D4AF37] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>دخول المشرفين ولوحة الإدارة (/admin)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F5]/60">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} — منصة أرشيف سماحة الشيخ الدكتور كاظم ياسين الحريب | بلدة المنيزلة - الأحساء
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <span>العودة للأعلى</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
