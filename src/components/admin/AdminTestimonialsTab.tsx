import React, { useState } from 'react';
import { TestimonialItem } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';
import {
  HeartHandshake,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Quote,
  ExternalLink,
  BookOpen,
  Film,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminTestimonialsTabProps {
  testimonials: TestimonialItem[];
  onChange: (updated: TestimonialItem[]) => void;
}

export const AdminTestimonialsTab: React.FC<AdminTestimonialsTabProps> = ({
  testimonials,
  onChange,
}) => {
  const { content, saveContent } = useSiteContent();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showSourceGuide, setShowSourceGuide] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // Helper to ensure compatibility between speakerName/author, speakerTitle/role, association/location
  const getSpeakerName = (t: TestimonialItem) => t.speakerName || t.author || '';
  const getSpeakerTitle = (t: TestimonialItem) => t.speakerTitle || t.role || '';
  const getAssociation = (t: TestimonialItem) => t.association || t.location || '';

  const [draft, setDraft] = useState<TestimonialItem>({
    id: '',
    speakerName: '',
    speakerTitle: '',
    association: '',
    quote: '',
    dateOrEvent: '',
    sourceName: '',
    sourceType: 'memorial_ceremony',
    sourceUrl: '',
    sourceContext: '',
    verifiedBy: '',
    author: '',
    role: '',
    relationship: '',
    location: '',
    avatarUrl: '',
  });

  const startEdit = (index: number) => {
    const item = testimonials[index];
    setEditingIndex(index);
    setIsAddingNew(false);
    setDraft({
      ...item,
      speakerName: getSpeakerName(item),
      speakerTitle: getSpeakerTitle(item),
      association: getAssociation(item),
      author: getSpeakerName(item),
      role: getSpeakerTitle(item),
      location: getAssociation(item),
      sourceName: item.sourceName || '',
      sourceType: item.sourceType || 'memorial_ceremony',
      sourceUrl: item.sourceUrl || '',
      sourceContext: item.sourceContext || '',
      verifiedBy: item.verifiedBy || '',
    });
  };

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingIndex(null);
    setDraft({
      id: `testi-${Date.now()}`,
      speakerName: '',
      speakerTitle: '',
      association: 'بلدة المنيزلة، الأحساء',
      relationship: 'أحد رفقاء الدرب والعلماء',
      quote: '',
      dateOrEvent: 'الحفل التأبيني ومجلس الفاتحة',
      sourceName: 'أرشيف قناة أثر يبقى الرسمية أو مجلس التأبين',
      sourceType: 'memorial_ceremony',
      sourceUrl: 'https://www.youtube.com/@athar.yabqaa313',
      sourceContext: 'ألقيت الكلمة بمناسبة تأبين سماحة الشيخ د. كاظم الحريب بمشاركة علماء المنطقة ووجهائها.',
      verifiedBy: 'قناة أثر يبقى ولجنة التوثيق',
      author: '',
      role: '',
      location: 'بلدة المنيزلة، الأحساء',
      avatarUrl: '',
    });
  };

  const handleSaveDraft = async () => {
    const sName = draft.speakerName || draft.author || 'صاحب الشهادة';
    const sTitle = draft.speakerTitle || draft.role || '';
    const sAssoc = draft.association || draft.location || '';

    const normalizedItem: TestimonialItem = {
      ...draft,
      speakerName: sName,
      speakerTitle: sTitle,
      association: sAssoc,
      author: sName,
      role: sTitle,
      location: sAssoc,
      sourceName: draft.sourceName || 'الأرشيف التأبيني الرسمي',
      sourceType: draft.sourceType || 'memorial_ceremony',
      sourceUrl: draft.sourceUrl || '',
      sourceContext: draft.sourceContext || '',
      verifiedBy: draft.verifiedBy || 'لجنة الأرشيف والتوثيق',
    };

    let updatedList: TestimonialItem[];
    if (isAddingNew) {
      updatedList = [...testimonials, normalizedItem];
    } else if (editingIndex !== null) {
      updatedList = [...testimonials];
      updatedList[editingIndex] = normalizedItem;
    } else {
      updatedList = [...testimonials];
    }

    onChange(updatedList);
    setEditingIndex(null);
    setIsAddingNew(false);

    try {
      await saveContent({ testimonials: updatedList }, { silent: true });
      showNotification('تم حفظ وتوثيق الشهادة وتثبيتها سحابياً بنجاح!');
    } catch {
      showNotification('تم حفظ الشهادة محلياً');
    }
  };

  const handleDelete = (index: number) => {
    const item = testimonials[index];
    const name = getSpeakerName(item) || `رقم ${index + 1}`;
    if (window.confirm(`هل أنت متأكد من حذف شهادة (${name})؟`)) {
      const updated = testimonials.filter((_, i) => i !== index);
      onChange(updated);
      saveContent({ testimonials: updated }, { silent: true });
      if (editingIndex === index) setEditingIndex(null);
      showNotification('تم حذف الشهادة وتحديث القائمة سحابياً');
    }
  };

  const getSourceTypeBadge = (type?: string) => {
    switch (type) {
      case 'youtube':
        return { label: 'تسجيل مرئي يوتيوب', icon: Film, color: 'bg-red-100 text-red-800 border-red-300' };
      case 'documentary':
        return { label: 'فيلم وثائقي رسمي', icon: Film, color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'memorial_ceremony':
        return { label: 'الحفل ومجلس التأبين', icon: HeartHandshake, color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'family_statement':
        return { label: 'بيان أسرة آل حريب', icon: Users, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'official_speech':
        return { label: 'خطاب رسمي بملتقى تنموي', icon: Award, color: 'bg-blue-100 text-blue-800 border-blue-300' };
      default:
        return { label: 'كلمة توثيقية موثقة', icon: BookOpen, color: 'bg-slate-100 text-slate-800 border-slate-300' };
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-sm border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0F382C] flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-[#D4AF37]" />
            <span>توثيق شهادات العلماء والوجهاء والأهالي ({testimonials.length} شهادة)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            بيان وتوثيق دقيق لمصادر الكلمات التأبينية، ومن قالها بالضبط، ومكان وتاريخ إلقائها، وروابط المشاهدة الرسمية.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <FirestoreCloudSaveButton
            tabName="شهادات وكلمات العلماء"
            onSaved={showNotification}
            showStatusPill={true}
          />

          <button
            type="button"
            onClick={() => setShowSourceGuide(!showSourceGuide)}
            className="px-3.5 py-2 border border-[#D4AF37] text-[#0F382C] hover:bg-[#FAF8F5] text-xs font-bold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-[#D4AF37]" />
            <span>{showSourceGuide ? 'إخفاء دليل المصادر' : 'عرض دليل المصادر'}</span>
            {showSourceGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2 bg-[#0F382C] text-[#D4AF37] hover:bg-[#144b3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة شهادة جديدة</span>
          </button>
        </div>
      </div>

      {/* Official Sources & Provenance Explanatory Hub */}
      {showSourceGuide && (
        <div className="bg-[#FAF8F5] border-2 border-[#D4AF37] p-5 sm:p-6 rounded-sm shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
              <h4 className="text-sm sm:text-base font-bold text-[#0F382C]">
                دليل مصادر قسم «ماذا قالوا عنه» (من أين تم جلبها ومن مين بالضبط؟)
              </h4>
            </div>
            <span className="text-xs bg-[#0F382C] text-[#D4AF37] px-2.5 py-0.5 rounded-sm font-bold">
              بيانات موثوقة ومحققة
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            جميع الشهادات المذكورة في المنصة هي كلمات صادقة موثقة بالصوت والصورة أو في المحافل الرسمية الكبرى المنعقدة بالأحساء وبلدة المنيزلة:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-sm border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0F382C]">
                <span className="w-5 h-5 rounded-full bg-[#0F382C] text-[#D4AF37] flex items-center justify-center text-[10px]">1</span>
                <span>سماحة العلامة السيد علي السيد ناصر السلمان</span>
              </div>
              <p className="text-slate-600">
                <strong>المصدر:</strong> الكلمة التأبينية الكبرى بالحفل التأبيني الموحد ومجلس الفاتحة بمسجد الإمام الجواد (ع) بالمنيزلة.
              </p>
              <p className="text-slate-500 text-[11px]">
                <strong>من هو بالضبط:</strong> كبير علماء الأحساء والمنطقة الشرقية والمربي الفاضل.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-sm border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0F382C]">
                <span className="w-5 h-5 rounded-full bg-[#0F382C] text-[#D4AF37] flex items-center justify-center text-[10px]">2</span>
                <span>سماحة الشيخ عادل بوخمسين</span>
              </div>
              <p className="text-slate-600">
                <strong>المصدر:</strong> فيلم «وثائقي رحيل الأمل | ومضات من مسيرة وأثر الشيخ كاظم الحريب» على قناة أثر يبقى الرسمية.
              </p>
              <p className="text-slate-500 text-[11px]">
                <strong>من هو بالضبط:</strong> عالم دين جليل وأستاذ الحوزة العلمية بالأحساء ووكيل المرجعيات الدينية.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-sm border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0F382C]">
                <span className="w-5 h-5 rounded-full bg-[#0F382C] text-[#D4AF37] flex items-center justify-center text-[10px]">3</span>
                <span>فضيلة العلامة السيد أبو عدنان الموسوي</span>
              </div>
              <p className="text-slate-600">
                <strong>المصدر:</strong> تسجيل مرئي كامل على يوتيوب: «العلامة السيد أبو عدنان يرثي العامل والمربي الفاضل الشيخ كاظم الحريب» (فيديو HyQt5lEdj40).
              </p>
              <p className="text-slate-500 text-[11px]">
                <strong>من هو بالضبط:</strong> خطيب المنبر الحسيني وموجه ديني واجتماعي بارز بالمنيزلة.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-sm border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0F382C]">
                <span className="w-5 h-5 rounded-full bg-[#0F382C] text-[#D4AF37] flex items-center justify-center text-[10px]">4</span>
                <span>الأستاذ عبدالمحسن بن عيسى الهاشم</span>
              </div>
              <p className="text-slate-600">
                <strong>المصدر:</strong> كلمة ملتقى جمعية التنمية الأهلية ومهرجان تكريم رواد ومؤسسي العمل الاجتماعي ببلدة المنيزلة.
              </p>
              <p className="text-slate-500 text-[11px]">
                <strong>من هو بالضبط:</strong> رئيس جمعية التنمية الأهلية والمشرف السابق على مهرجان الإبداع بالمنيزلة.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-sm border border-slate-200 space-y-1.5 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-[#0F382C]">
                <span className="w-5 h-5 rounded-full bg-[#0F382C] text-[#D4AF37] flex items-center justify-center text-[10px]">5</span>
                <span>الحاج جاسم بن علي الحريب</span>
              </div>
              <p className="text-slate-600">
                <strong>المصدر:</strong> بيان وكلمة أسرة آل حريب الكريمة في حفل تأبين الشيخ بمسجد الإمام الجواد (ع).
              </p>
              <p className="text-slate-500 text-[11px]">
                <strong>من هو بالضبط:</strong> عميد أسرة آل حريب الكريمة ووجيه بلدة المنيزلة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Form Modal / Card */}
      {(editingIndex !== null || isAddingNew) && (
        <div className="bg-[#FAF8F5] border-2 border-[#D4AF37] p-5 sm:p-7 rounded-sm space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-3">
            <div>
              <h4 className="text-base font-bold text-[#0F382C]">
                {isAddingNew ? 'إضافة شهادة جديدة وتوثيق مصدرها' : `تعديل شهادة: ${draft.speakerName || draft.author || ''}`}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                يرجى إدخال اسم صاحب الشهادة وصفته بالضبط وتحديد مصدرها بدقة لضمان المصداقية الأكاديمية والتوثيقية.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setIsAddingNew(false);
              }}
              className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
              <span>إلغاء</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Section 1: قائل الشهادة */}
            <div className="bg-white p-4 rounded-sm border border-slate-200 space-y-4">
              <div className="text-xs font-black text-[#0F382C] border-b pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>أولاً: بيانات صاحب الشهادة (من قالها بالضبط؟)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    الاسم الكامل لصاحب الشهادة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.speakerName || draft.author || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, speakerName: e.target.value, author: e.target.value })
                    }
                    placeholder="مثال: سماحة الشيخ عادل بوخمسين"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold text-[#0F382C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    الصفة أو اللقب العلمي والاجتماعي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.speakerTitle || draft.role || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, speakerTitle: e.target.value, role: e.target.value })
                    }
                    placeholder="مثال: عالم دين وأستاذ الحوزة العلمية بالأحساء"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    المدينة / البلدة / المنطقة
                  </label>
                  <input
                    type="text"
                    value={draft.association || draft.location || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, association: e.target.value, location: e.target.value })
                    }
                    placeholder="مثال: بلدة المنيزلة - الأحساء"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    العلاقة بسماحة الشيخ
                  </label>
                  <input
                    type="text"
                    value={draft.relationship || ''}
                    onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
                    placeholder="مثال: زميل دراسة بالحوزة، أو رفيق درب في التنمية"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: نص الشهادة والاقتباس */}
            <div className="bg-white p-4 rounded-sm border border-slate-200 space-y-4">
              <div className="text-xs font-black text-[#0F382C] border-b pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>ثانياً: نص الشهادة والاقتباس المعتمد</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    نص الكلمة / الشهادة <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={draft.quote || ''}
                    onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                    placeholder="اكتب نص الكلمة الصادقة أو الاقتباس المأخوذ من الكلمة التأبينية..."
                    className="w-full px-3 py-2 text-sm sm:text-base border border-slate-300 rounded-sm bg-white font-amiri leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    المناسبة أو الحدث
                  </label>
                  <input
                    type="text"
                    value={draft.dateOrEvent || ''}
                    onChange={(e) => setDraft({ ...draft, dateOrEvent: e.target.value })}
                    placeholder="مثال: في كلمته التأبينية بالحفل الموحد بمسجد الإمام الجواد"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: المصدر والتوثيق الرسمي (من أين جلبناها) */}
            <div className="bg-white p-4 rounded-sm border border-[#D4AF37]/50 space-y-4">
              <div className="text-xs font-black text-[#0F382C] border-b pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0F382C]" />
                  <span>ثالثاً: توثيق المصدر بدقة (من أين تم جلبها بالضبط؟)</span>
                </div>
                <span className="text-[11px] text-[#854D0E] font-bold">حقل مهم للتوثيق الأرشيفي</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    اسم المصدر بالتحديد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.sourceName || ''}
                    onChange={(e) => setDraft({ ...draft, sourceName: e.target.value })}
                    placeholder="مثال: فيلم «وثائقي رحيل الأمل»، أو قناة «أثر يبقى» على يوتيوب"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    نوع المصدر
                  </label>
                  <select
                    value={draft.sourceType || 'memorial_ceremony'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        sourceType: e.target.value as TestimonialItem['sourceType'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="memorial_ceremony">كلمة الحفل التأبيني ومجلس الفاتحة</option>
                    <option value="youtube">تسجيل مرئي على اليوتيوب</option>
                    <option value="documentary">فيلم وثائقي رسمي</option>
                    <option value="official_speech">خطاب رسمي بملتقى أو جمعية</option>
                    <option value="family_statement">بيان أسرة آل حريب الكريمة</option>
                    <option value="written">مطبوعة توثيقية / رسالة مكتوبة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    رابط المصدر (يوتيوب أو موقع رسمي إن وجد)
                  </label>
                  <input
                    type="url"
                    value={draft.sourceUrl || ''}
                    onChange={(e) => setDraft({ ...draft, sourceUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white text-left font-mono text-xs"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    جهة التحقق أو التوثيق
                  </label>
                  <input
                    type="text"
                    value={draft.verifiedBy || ''}
                    onChange={(e) => setDraft({ ...draft, verifiedBy: e.target.value })}
                    placeholder="مثال: قناة أثر يبقى الرسمية ولجنة التوثيق"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-[#0F382C]">
                    سياق الكلمة ومكان تسجيلها أو إلقائها بالتفصيل
                  </label>
                  <textarea
                    rows={2}
                    value={draft.sourceContext || ''}
                    onChange={(e) => setDraft({ ...draft, sourceContext: e.target.value })}
                    placeholder="مثال: ألقيت في حفل تأبين الراحل بمسجد الإمام الجواد بالمنيزلة بحضور حشد غفير من علماء وأهالي المنطقة..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/30">
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setIsAddingNew(false);
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-2 bg-[#0F382C] text-white hover:bg-[#154c3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>تأكيد وحفظ الشهادة ومصدرها</span>
            </button>
          </div>
        </div>
      )}

      {/* Testimonials List Grid with explicit Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {testimonials.map((t, idx) => {
          const sName = getSpeakerName(t);
          const sTitle = getSpeakerTitle(t);
          const sAssoc = getAssociation(t);
          const badge = getSourceTypeBadge(t.sourceType);
          const Icon = badge.icon;

          return (
            <div
              key={t.id || idx}
              className="bg-white rounded-sm border border-slate-200 shadow-sm hover:border-[#D4AF37] transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Card Top: Speaker Details */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0F382C] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-[#0F382C] leading-snug">
                        {sName}
                      </h4>
                    </div>
                    <p className="text-xs text-[#854D0E] font-semibold pr-8">
                      {sTitle}
                    </p>
                    {sAssoc && (
                      <p className="text-[11px] text-slate-500 pr-8">
                        📍 {sAssoc}
                      </p>
                    )}
                  </div>

                  <Quote className="w-7 h-7 text-[#D4AF37]/30 shrink-0 rotate-180" />
                </div>

                {/* The Quote */}
                <p className="text-xs sm:text-sm text-slate-800 font-amiri leading-relaxed bg-[#FAF8F5] p-3.5 rounded-sm border-r-2 border-[#D4AF37]">
                  «{t.quote}»
                </p>

                {/* Explicit Source Box ("من وين جايبها ومن مين بالضبط") */}
                <div className="bg-[#FAF8F5]/80 border border-[#D4AF37]/40 rounded-sm p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-[#0F382C] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>المصدر والتوثيق:</span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold border ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800">
                    {t.sourceName || 'الأرشيف التأبيني الرسمي'}
                  </div>

                  {t.dateOrEvent && (
                    <div className="text-[11px] text-slate-600">
                      <strong>المناسبة:</strong> {t.dateOrEvent}
                    </div>
                  )}

                  {t.sourceContext && (
                    <div className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/60 pt-1.5">
                      {t.sourceContext}
                    </div>
                  )}

                  {t.verifiedBy && (
                    <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>جهة التوثيق: {t.verifiedBy}</span>
                    </div>
                  )}

                  {t.sourceUrl && (
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-end">
                      <a
                        href={t.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 hover:text-red-900 transition-colors"
                      >
                        <span>فتح رابط المصدر والفيديو</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom: Admin Actions */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {t.id}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(idx)}
                    className="text-xs font-bold text-[#0F382C] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>تعديل الشهادة والمصدر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
