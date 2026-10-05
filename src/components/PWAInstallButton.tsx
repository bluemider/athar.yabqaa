import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone, CheckCircle } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already running as an installed standalone PWA, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow (standard beforeinstallprompt)
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#0F382C] text-xs font-bold font-cairo rounded-sm border border-white/40 flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        title="تثبيت منصة الشيخ على سطح المكتب وشريط المهام أو الهاتف"
      >
        <img
          src="/pwa-192x192.png"
          alt="أيقونة المنصة"
          className="w-4 h-4 rounded-sm object-cover border border-[#0F382C]/30"
        />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#D4AF37] text-xs font-bold font-cairo rounded-sm border border-[#D4AF37]/50 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="تثبيت التطبيق على الآيفون / الآيباد"
        >
          <img
            src="/pwa-192x192.png"
            alt="أيقونة المنصة"
            className="w-4 h-4 rounded-sm object-cover border border-[#D4AF37]/40"
          />
          <span>تثبيت التطبيق</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-cairo text-right">
            <div className="w-full max-w-sm rounded-sm bg-[#0F382C] border-2 border-[#D4AF37] p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/pwa-192x192.png"
                    alt="أيقونة المنصة"
                    className="w-8 h-8 rounded-sm object-cover border border-[#D4AF37]"
                  />
                  <h3 className="text-base font-bold text-[#D4AF37]">
                    تثبيت التطبيق على الآيفون / الآيباد
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-white/60 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-200">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-sm border border-white/10">
                  <div className="p-2 bg-[#D4AF37] text-[#0F382C] rounded-sm shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">الخطوة الأولى:</span>
                    اضغط على زر <strong>المشاركة (Share)</strong> في أسفل شريط متصفح Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-sm border border-white/10">
                  <div className="p-2 bg-[#D4AF37] text-[#0F382C] rounded-sm shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">الخطوة الثانية:</span>
                    مرر للأسفل واضغط على <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-sm border border-white/10">
                  <div className="p-2 bg-[#D4AF37] text-[#0F382C] rounded-sm shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">الخطوة الثالثة:</span>
                    اضغط «إضافة»، وستظهر أيقونة الشيخ الفاخرة على شاشتك الرئيسية!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#0F382C] text-xs font-bold rounded-sm border border-white transition-colors cursor-pointer"
              >
                فهمت ذلك، إغلاق
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback if beforeinstallprompt is pending or unsupported on browser
  return (
    <>
      <button
        type="button"
        onClick={() => setShowAndroidGuide(true)}
        className="px-3 py-1.5 bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#D4AF37] text-xs font-bold font-cairo rounded-sm border border-[#D4AF37]/50 flex items-center gap-1.5 transition-colors cursor-pointer"
        title="تثبيت التطبيق على جهازك أو جوالك"
      >
        <img
          src="/pwa-192x192.png"
          alt="أيقونة المنصة"
          className="w-4 h-4 rounded-sm object-cover border border-[#D4AF37]/40"
        />
        <span>تثبيت التطبيق</span>
      </button>

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-cairo text-right">
          <div className="w-full max-w-sm rounded-sm bg-[#0F382C] border-2 border-[#D4AF37] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/pwa-192x192.png"
                  alt="أيقونة المنصة"
                  className="w-8 h-8 rounded-sm object-cover border border-[#D4AF37]"
                />
                <h3 className="text-base font-bold text-[#D4AF37]">
                  تثبيت المنصة كتطبيق
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              يمكنك تثبيت منصة الشيخ د. كاظم الحريب مباشرة على شريط مهام الكمبيوتر أو شاشة الجوال للوصول السريع:
            </p>

            <div className="space-y-2 text-xs text-slate-200">
              <div className="bg-white/5 p-2.5 rounded border border-white/10">
                <span className="font-bold text-[#D4AF37] block mb-1">في المتصفح (كمبيوتر):</span>
                اضغط على أيقونة التثبيت <Download className="w-3.5 h-3.5 inline text-[#D4AF37]" /> في شريط عنوان المتصفح بالأعلى، أو اختر «تثبيت التطبيق» من قائمة خيارات المتصفح.
              </div>
              <div className="bg-white/5 p-2.5 rounded border border-white/10">
                <span className="font-bold text-[#D4AF37] block mb-1">في الجوال (أندرويد):</span>
                اضغط على النقاط الثلاث ⋮ في أعلى المتصفح، ثم اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#0F382C] text-xs font-bold rounded-sm border border-white transition-colors cursor-pointer"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
