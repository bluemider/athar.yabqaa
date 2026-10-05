import React, { useState } from 'react';
import { SiteHeroContent, QuoteItem, ImpactStat, SiteHeroSlide } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';
import { Sparkles, Plus, Trash2, Quote, BarChart2, Layers, MoveUp, MoveDown, CheckCircle2 } from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminHeroTabProps {
  hero: SiteHeroContent;
  quotes: QuoteItem[];
  impactMetrics: ImpactStat[];
  onHeroChange: (updated: SiteHeroContent) => void;
  onQuotesChange: (updated: QuoteItem[]) => void;
  onMetricsChange: (updated: ImpactStat[]) => void;
}

export const AdminHeroTab: React.FC<AdminHeroTabProps> = ({
  hero,
  quotes,
  impactMetrics,
  onHeroChange,
  onQuotesChange,
  onMetricsChange,
}) => {
  const { content, saveContent } = useSiteContent();
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'slides' | 'quotes' | 'metrics'>('hero');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // Hero fields
  const updateHeroField = (field: keyof SiteHeroContent, value: any) => {
    const updated = {
      ...hero,
      [field]: value,
    };
    onHeroChange(updated);
  };

  // Slides management
  const handleAddSlide = () => {
    const newSlide: SiteHeroSlide = {
      id: `slide-${Date.now()}`,
      url: '/assets/sheikh/sheikh_kazim_26.jpg',
      title: 'عنوان الشريحة الجديد',
      subtitle: 'وصف أو تعليق مختصر على الصورة',
    };
    const updatedSlides = [...(hero.slides || []), newSlide];
    const updatedHero = {
      ...hero,
      slides: updatedSlides,
    };
    onHeroChange(updatedHero);
    saveContent({ hero: updatedHero }, { silent: true });
  };

  const handleUpdateSlide = (index: number, field: keyof SiteHeroSlide, value: string) => {
    const slides = [...(hero.slides || [])];
    slides[index] = { ...slides[index], [field]: value };
    const updatedHero = { ...hero, slides };
    onHeroChange(updatedHero);
    // Only trigger immediate background persistence if an image was uploaded/selected, NOT on text keystrokes
    if (field === 'url') {
      saveContent({ hero: updatedHero }, { silent: true });
    }
  };

  const handleDeleteSlide = (index: number) => {
    const slides = (hero.slides || []).filter((_, i) => i !== index);
    const updatedHero = { ...hero, slides };
    onHeroChange(updatedHero);
    saveContent({ hero: updatedHero }, { silent: true });
    showNotification('تم حذف الشريحة وتحديث السلايدر بنجاح');
  };

  // Quotes management
  const handleAddQuote = () => {
    const newQuote: QuoteItem = {
      id: `quote-${Date.now()}`,
      text: 'اكتب درة أو حكمة لسماحة الشيخ هنا...',
      context: 'مناسبة القول أو الخطبة',
    };
    const updated = [...quotes, newQuote];
    onQuotesChange(updated);
    saveContent({ quotes: updated }, { silent: true });
  };

  const handleUpdateQuote = (index: number, field: keyof QuoteItem, value: string) => {
    const list = [...quotes];
    list[index] = { ...list[index], [field]: value };
    onQuotesChange(list);
  };

  const handleDeleteQuote = (index: number) => {
    const updated = quotes.filter((_, i) => i !== index);
    onQuotesChange(updated);
    saveContent({ quotes: updated }, { silent: true });
    showNotification('تم حذف المقولة وتحديث القائمة بنجاح');
  };

  // Metrics management
  const handleUpdateMetric = (index: number, field: keyof ImpactStat, value: string) => {
    const list = [...impactMetrics];
    list[index] = { ...list[index], [field]: value };
    onMetricsChange(list);
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

      {/* Header Bar with Firestore Cloud Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-sm border border-slate-200 gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>إدارة الواجهة والشرائح والدرر والأثر المجتمعي</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تعديل محتوى البانر الترحيبي، سلايدر الصور، كلمات وحكم الشيخ، وأرقام وإحصائيات مسيرته المباركة.
          </p>
        </div>

        <FirestoreCloudSaveButton
          tabName="الواجهة والأثر والدرر"
          onSaved={showNotification}
          showStatusPill={true}
        />
      </div>

      {/* Sub tabs selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('hero')}
          className={`px-4 py-2 text-xs font-bold rounded-sm border transition-colors cursor-pointer ${
            activeSubTab === 'hero'
              ? 'bg-[#0F382C] text-white border-[#0F382C]'
              : 'bg-white text-slate-700 border-slate-300 hover:border-[#D4AF37]'
          }`}
        >
          نصوص الواجهة والروابط
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('slides')}
          className={`px-4 py-2 text-xs font-bold rounded-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'slides'
              ? 'bg-[#0F382C] text-white border-[#0F382C]'
              : 'bg-white text-slate-700 border-slate-300 hover:border-[#D4AF37]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>سلايدر صور الواجهة ({hero.slides?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('quotes')}
          className={`px-4 py-2 text-xs font-bold rounded-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'quotes'
              ? 'bg-[#0F382C] text-white border-[#0F382C]'
              : 'bg-white text-slate-700 border-slate-300 hover:border-[#D4AF37]'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          <span>درر وأقوال الشيخ ({quotes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('metrics')}
          className={`px-4 py-2 text-xs font-bold rounded-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'metrics'
              ? 'bg-[#0F382C] text-white border-[#0F382C]'
              : 'bg-white text-slate-700 border-slate-300 hover:border-[#D4AF37]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>أرقام وإحصائيات الأثر</span>
        </button>
      </div>

      {/* Sub Tab 1: Hero texts & buttons */}
      {activeSubTab === 'hero' && (
        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                شارة الحالة العليا (Top Badge)
              </label>
              <input
                type="text"
                value={hero.badge}
                onChange={(e) => updateHeroField('badge', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                اللقب التكريمي فوق الاسم
              </label>
              <input
                type="text"
                value={hero.honorific}
                onChange={(e) => updateHeroField('honorific', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                بادئة الاسم (مثل: الشيخ الدكتور)
              </label>
              <input
                type="text"
                value={hero.namePrefix}
                onChange={(e) => updateHeroField('namePrefix', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                الاسم البارز
              </label>
              <input
                type="text"
                value={hero.sheikhName}
                onChange={(e) => updateHeroField('sheikhName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none text-[#0F382C] font-bold"
              />
            </div>

            {/* Title & Quotes Font Size Manual Controls */}
            <div className="col-span-1 md:col-span-2 bg-[#FAF8F5] p-5 rounded-sm border-2 border-[#D4AF37]/50 space-y-4">
              <div className="border-b border-[#D4AF37]/30 pb-2 flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0F382C] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>تخصيص مقاسات الخطوط كتابةً يدوياً (بالرقم حسب رغبتك):</span>
                </label>
                <span className="text-[11px] text-slate-500 font-semibold">بكسل (Pixel)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Main Title Font Size */}
                <div className="space-y-1.5 bg-white p-3.5 rounded-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F382C]">حجم خط عنوان واسم الشيخ:</span>
                    <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {parseInt(String(hero.titleFontSize || '26').replace(/\D/g, '')) || 26}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={parseInt(String(hero.titleFontSize || '26').replace(/\D/g, '')) || 26}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateHeroField('titleFontSize', val);
                        saveContent({ hero: { ...hero, titleFontSize: val } }, { silent: true });
                      }}
                      className="w-24 px-3 py-1.5 text-sm border-2 border-[#D4AF37] rounded-sm font-mono text-center font-bold bg-[#FAF8F5] text-[#0F382C]"
                      placeholder="26"
                    />
                    <span className="text-xs font-bold text-slate-600 font-mono">px</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    اكتب أي رقم تريده (مثال: 18، 22، 26، 31).
                  </p>
                </div>

                {/* 2. Quotes / Wisdoms Font Size */}
                <div className="space-y-1.5 bg-white p-3.5 rounded-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F382C]">حجم خط نصوص الأثر والدرر:</span>
                    <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {parseInt(String(hero.quotesFontSize || '16').replace(/\D/g, '')) || 16}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={parseInt(String(hero.quotesFontSize || '16').replace(/\D/g, '')) || 16}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateHeroField('quotesFontSize', val);
                        saveContent({ hero: { ...hero, quotesFontSize: val } }, { silent: true });
                      }}
                      className="w-24 px-3 py-1.5 text-sm border-2 border-[#D4AF37] rounded-sm font-mono text-center font-bold bg-[#FAF8F5] text-[#0F382C]"
                      placeholder="16"
                    />
                    <span className="text-xs font-bold text-slate-600 font-mono">px</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    اكتب أي رقم تريده لشريط الأقوال والحكم (مثال: 14، 16، 18، 20).
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-[#09241C] text-white rounded-sm border border-[#D4AF37]/40 text-center space-y-2">
                <span className="text-[10px] text-[#D4AF37] block font-mono">
                  معاينة حية ومباشرة للخطين:
                </span>
                <div>
                  <span
                    style={{
                      fontSize: `${parseInt(String(hero.titleFontSize || '26').replace(/\D/g, '')) || 26}px`,
                      lineHeight: '1.25',
                    }}
                    className="font-black font-cairo text-[#D4AF37] inline-block transition-all"
                  >
                    {hero.namePrefix || 'الشيخ الدكتور'} {hero.sheikhName || 'كاظم ياسين الحريب'}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: `${parseInt(String(hero.quotesFontSize || '16').replace(/\D/g, '')) || 16}px`,
                    }}
                    className="font-amiri font-bold text-slate-200 inline-block transition-all"
                  >
                    «درر وأقوال مأثورة لسماحة الشيخ...»
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                النص التعريفي الموجز (Hero Bio Intro)
              </label>
              <textarea
                rows={3}
                value={hero.bioIntro}
                onChange={(e) => updateHeroField('bioIntro', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Buttons & Video */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                نص الزر الرئيسي (الاستكشاف)
              </label>
              <input
                type="text"
                value={hero.exploreButtonText}
                onChange={(e) => updateHeroField('exploreButtonText', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                نص زر الفيلم الوثائقي
              </label>
              <input
                type="text"
                value={hero.videoButtonText}
                onChange={(e) => updateHeroField('videoButtonText', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                معرف يوتيوب للوثائقي (YouTube Video ID)
              </label>
              <input
                type="text"
                value={hero.videoButtonYoutubeId}
                onChange={(e) => updateHeroField('videoButtonYoutubeId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono text-left dir-ltr"
                placeholder="p0atEekmf7c"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F382C]">
                نص زر المشاركات المجتمعية
              </label>
              <input
                type="text"
                value={hero.communityButtonText}
                onChange={(e) => updateHeroField('communityButtonText', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Carousel Slides */}
      {activeSubTab === 'slides' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              يمكنك تعديل الصور المتبدلة في الواجهة الرئيسية وإضافة شرائح جديدة أو رفع صور مباشرة.
            </span>
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-3.5 py-1.5 bg-[#0F382C] text-[#D4AF37] hover:bg-[#14493a] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شريحة جديدة</span>
            </button>
          </div>

          <div className="space-y-4">
            {(hero.slides || []).map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-[#0F382C]">
                    الشريحة #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(idx)}
                    className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الشريحة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      العنوان الرئيسي للصورة
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      التعليق الفرعي
                    </label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <ImageUploadInput
                      label="صورة الشريحة"
                      value={slide.url}
                      onChange={(url) => handleUpdateSlide(idx, 'url', url)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Rotating Quotes */}
      {activeSubTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              شريط الحكمة المتبدل أسفل الواجهة الرئيسية لعرض اقتباسات وكلمات سماحة الشيخ.
            </span>
            <button
              type="button"
              onClick={handleAddQuote}
              className="px-3.5 py-1.5 bg-[#0F382C] text-[#D4AF37] hover:bg-[#14493a] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قول أو حكمة</span>
            </button>
          </div>

          <div className="space-y-4">
            {quotes.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-[#0F382C]">
                    الدرة #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuote(idx)}
                    className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    نص الكلمة / الحكمة
                  </label>
                  <textarea
                    rows={2}
                    value={q.text}
                    onChange={(e) => handleUpdateQuote(idx, 'text', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    المناسبة أو السياق (مثل: من خطبة الجمعة بمسجد الإمام الجواد)
                  </label>
                  <input
                    type="text"
                    value={q.context}
                    onChange={(e) => handleUpdateQuote(idx, 'context', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 4: Impact Metrics */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-4">
          <div className="bg-[#FAF8F5] p-3 rounded-sm border border-[#D4AF37]/30 text-xs text-slate-700">
            أرقام وإحصائيات شريط الأثر المعروضة أسفل الواجهة الرئيسية.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {impactMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm space-y-3"
              >
                <span className="text-xs font-bold text-[#0F382C] block border-b pb-2">
                  الإحصائية #{idx + 1}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      الرقم / القيمة (مثل: +35)
                    </label>
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) => handleUpdateMetric(idx, 'value', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm font-bold text-[#0F382C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F382C]">
                      الأيقونة
                    </label>
                    <select
                      value={metric.icon}
                      onChange={(e) => handleUpdateMetric(idx, 'icon', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                    >
                      <option value="Clock">ساعة (Clock)</option>
                      <option value="Award">وسام (Award)</option>
                      <option value="HeartHandshake">مصافحة (HeartHandshake)</option>
                      <option value="BookOpen">كتاب (BookOpen)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    العنوان المباشر
                  </label>
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => handleUpdateMetric(idx, 'label', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    الوصف التفصيلي
                  </label>
                  <textarea
                    rows={2}
                    value={metric.description}
                    onChange={(e) => handleUpdateMetric(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
