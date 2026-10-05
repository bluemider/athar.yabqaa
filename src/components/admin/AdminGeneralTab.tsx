import React, { useState } from 'react';
import { SiteGeneralSettings } from '../../types';
import { Settings, Globe, MapPin, Building, Youtube, Instagram, AlignRight, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminGeneralTabProps {
  general: SiteGeneralSettings;
  onChange: (updated: SiteGeneralSettings) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export const AdminGeneralTab: React.FC<AdminGeneralTabProps> = ({ general, onChange, onSave, isSaving }) => {
  const { flushPendingSave } = useSiteContent();
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const updateField = (field: keyof SiteGeneralSettings, value: string) => {
    onChange({
      ...general,
      [field]: value,
    });
  };

  const handleBlur = () => {
    flushPendingSave().catch(() => {});
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

      {/* Header Info Banner with Permanent Cloud Save Button */}
      <div className="bg-[#FAF8F5] border border-[#D4AF37]/40 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0F382C] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            <span>بيانات المنصة والتعريف العام</span>
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            هنا يمكنك تعديل العناوين الرئيسية، ألقاب الشيخ، تواريخ الميلاد والوفاة، وروابط المنصات الرسمية.
          </p>
        </div>

        <FirestoreCloudSaveButton
          tabName="الإعدادات العامة"
          onSaved={showNotification}
          showStatusPill={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        {/* Site Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C]">
            عنوان المنصة والموقع
          </label>
          <input
            type="text"
            value={general.siteTitle}
            onChange={(e) => updateField('siteTitle', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
            placeholder="سيرة وأثر الشيخ الدكتور كاظم ياسين الحريب"
          />
        </div>

        {/* Title Font Size Manual Control */}
        <div className="space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-sm border border-[#D4AF37]/50">
          <label className="block text-xs font-bold text-[#0F382C] flex items-center justify-between">
            <span>حجم خط العنوان الرئيسي (كتابة الرقم يدوياً)</span>
            <span className="font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
              {parseInt(String(general.titleFontSize || '26').replace(/\D/g, '')) || 26}px
            </span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="10"
              max="100"
              value={parseInt(String(general.titleFontSize || '26').replace(/\D/g, '')) || 26}
              onChange={(e) => {
                const val = e.target.value;
                updateField('titleFontSize', val);
              }}
              onBlur={handleBlur}
              className="w-28 px-3 py-2 text-sm border-2 border-[#D4AF37] rounded-sm font-mono text-center font-bold bg-white text-[#0F382C]"
              placeholder="26"
            />
            <span className="text-xs font-bold text-slate-600 font-mono">بكسل (px)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            أدخل أي رقم تريده لحجم خط العنوان الرئيسي في الواجهة (مثال: 18, 22, 26, 31).
          </p>
        </div>

        {/* Quotes & Wisdoms Font Size Manual Control */}
        <div className="space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-sm border border-[#D4AF37]/50">
          <label className="block text-xs font-bold text-[#0F382C] flex items-center justify-between">
            <span>حجم خط نصوص الأثر والدرر والحكم (كتابة الرقم يدوياً)</span>
            <span className="font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
              {parseInt(String(general.quotesFontSize || '16').replace(/\D/g, '')) || 16}px
            </span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="10"
              max="60"
              value={parseInt(String(general.quotesFontSize || '16').replace(/\D/g, '')) || 16}
              onChange={(e) => {
                const val = e.target.value;
                updateField('quotesFontSize', val);
              }}
              onBlur={handleBlur}
              className="w-28 px-3 py-2 text-sm border-2 border-[#D4AF37] rounded-sm font-mono text-center font-bold bg-white text-[#0F382C]"
              placeholder="16"
            />
            <span className="text-xs font-bold text-slate-600 font-mono">بكسل (px)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            أدخل أي رقم تريده لحجم خط شريط درر وأقوال الشيخ في الواجهة (مثال: 14, 16, 18, 20).
          </p>
        </div>

        {/* Site Subtitle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C]">
            الوصف المختصر (Subtitle)
          </label>
          <input
            type="text"
            value={general.siteSubtitle}
            onChange={(e) => updateField('siteSubtitle', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
            placeholder="المنصة الرسمية للسيرة الذاتية والتكريم والأرشيف الرقمي المجتمعي"
          />
        </div>

        {/* Sheikh Honorific */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C]">
            اللقب التكريمي والترحم
          </label>
          <input
            type="text"
            value={general.sheikhHonorific}
            onChange={(e) => updateField('sheikhHonorific', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
            placeholder="سماحة المربي الفاضل والفقيه المصلح (قدست روحه الزكية)"
          />
        </div>

        {/* Years of Life */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C]">
            سنوات العمر المبارك
          </label>
          <input
            type="text"
            value={general.yearsOfLife}
            onChange={(e) => updateField('yearsOfLife', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono"
            placeholder="1968م – 2022م"
          />
        </div>

        {/* Mosque Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>اسم المسجد وإمامته</span>
          </label>
          <input
            type="text"
            value={general.mosqueName}
            onChange={(e) => updateField('mosqueName', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
            placeholder="مسجد الإمام الجواد (ع)"
          />
        </div>

        {/* Village & Region */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>البلدة والمحافظة</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={general.villageName}
              onChange={(e) => updateField('villageName', e.target.value)}
              onBlur={handleBlur}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              placeholder="بلدة المنيزلة"
            />
            <input
              type="text"
              value={general.governorateName}
              onChange={(e) => updateField('governorateName', e.target.value)}
              onBlur={handleBlur}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
              placeholder="محافظة الأحساء"
            />
          </div>
        </div>

        {/* Official Links */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
            <Youtube className="w-3.5 h-3.5 text-red-600" />
            <span>رابط قناة اليوتيوب الرسمية</span>
          </label>
          <input
            type="text"
            value={general.youtubeChannelUrl}
            onChange={(e) => updateField('youtubeChannelUrl', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono text-left dir-ltr"
            placeholder="https://www.youtube.com/@athar.yabqaa313"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
            <Instagram className="w-3.5 h-3.5 text-pink-600" />
            <span>رابط حساب الانستغرام الرسمي</span>
          </label>
          <input
            type="text"
            value={general.instagramUrl}
            onChange={(e) => updateField('instagramUrl', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono text-left dir-ltr"
            placeholder="https://www.instagram.com/p/..."
          />
        </div>

        {/* Footer Bio Text */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
            <AlignRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>نص نبذة التذييل (Footer Bio)</span>
          </label>
          <textarea
            rows={3}
            value={general.footerBio}
            onChange={(e) => updateField('footerBio', e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none"
            placeholder="المنصة الرسمية المعتمدة لتوثيق مسيرة وسيرة سماحة الشيخ..."
          />
        </div>
      </div>

      {/* Save Action Bar */}
      {onSave && (
        <div className="p-4 bg-white border border-[#D4AF37]/50 rounded-sm shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              يتم حفظ أي تعديل تجريه هنا ومزامنته سحابياً مع قاعدة بيانات Google Cloud Firestore ليظهر في جميع الروابط وكلما فتحت الموقع.
            </span>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0F382C] hover:bg-[#164e3e] text-white font-bold text-xs rounded-sm border border-[#D4AF37] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>جارٍ الحفظ والمزامنة السحابية...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>حفظ وتعميم التعديلات على كافة الروابط</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
