import React, { useState, useRef } from 'react';
import { TimelineMilestone } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';
import { MilestoneImagesManager } from './MilestoneImagesManager';
import { ImageCropModal } from './ImageCropModal';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageAsset } from '../../utils/imageUploadService';
import { smartAutoCropImage } from '../../utils/smartFaceFocus';
import { addMediaToLibrary } from '../../utils/mediaLibraryStorage';
import { useSiteContent } from '../../context/SiteContentContext';
import {
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Check,
  X,
  Calendar,
  Sparkles,
  Camera,
  Loader2,
  CheckCircle2,
  ImageIcon,
  Images,
  Cloud,
  Save,
  Crop,
  Copy,
  Link as LinkIcon,
} from 'lucide-react';

interface AdminTimelineTabProps {
  timeline: TimelineMilestone[];
  onChange: (updated: TimelineMilestone[]) => Promise<boolean> | void;
}

export const AdminTimelineTab: React.FC<AdminTimelineTabProps> = ({ timeline, onChange }) => {
  const { content, saveContent, updateAndSaveTimeline, saveMilestoneToCloud, isSaving } = useSiteContent();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [quickUploadingIndex, setQuickUploadingIndex] = useState<number | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isCloudSavingAll, setIsCloudSavingAll] = useState(false);
  const [cropModalState, setCropModalState] = useState<{
    isOpen: boolean;
    milestoneIndex: number;
    imageSrc: string;
  }>({ isOpen: false, milestoneIndex: -1, imageSrc: '' });

  // Hidden file input for quick direct image upload on a card
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [targetQuickIndex, setTargetQuickIndex] = useState<number | null>(null);
  const [copiedMilestoneLinkIndex, setCopiedMilestoneLinkIndex] = useState<number | null>(null);

  const handleCopyMilestoneUrl = (url: string, index: number) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedMilestoneLinkIndex(index);
    setTimeout(() => setCopiedMilestoneLinkIndex(null), 2000);
  };

  const handleDirectCardUrlChange = async (newUrl: string, idx: number) => {
    const updated = [...timeline];
    const target = updated[idx];
    if (!target) return;
    const currentImgs = Array.isArray(target.images) && target.images.length > 0
      ? [newUrl, ...target.images.slice(1)]
      : [newUrl];
    updated[idx] = {
      ...target,
      mediaUrl: newUrl,
      imageUrl: '',
      images: currentImgs,
    };
    await onChange(updated);
    if (newUrl.trim().length > 5) {
      addMediaToLibrary(newUrl.trim());
    }
  };

  // Form draft state
  const [draftMilestone, setDraftMilestone] = useState<TimelineMilestone>({
    id: '',
    period: '',
    year: '',
    dateArabic: '',
    title: '',
    subtitle: '',
    role: '',
    description: '',
    mediaUrl: '',
    imageUrl: '',
    mediaCaption: '',
    category: 'roots',
    tags: [],
    highlights: [],
    keyAchievements: [],
    iconName: 'Sparkles',
    icon: 'Sparkles',
  });

  const [highlightsInput, setHighlightsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  const startEdit = (index: number) => {
    const item = timeline[index];
    setEditingIndex(index);
    setIsAddingNew(false);

    const currentImg = item.mediaUrl || item.imageUrl || '';
    const currentPeriod = item.period || item.year || '';
    const currentCaption = item.mediaCaption || item.subtitle || item.title || '';
    const currentHighlights = item.highlights && item.highlights.length > 0
      ? item.highlights
      : (item.keyAchievements || []);
    const currentIcon = item.iconName || item.icon || 'Sparkles';

    const currentImages = Array.isArray(item.images) && item.images.length > 0
      ? [...item.images]
      : (currentImg ? [currentImg] : ['/assets/sheikh/sheikh_kazim_01.jpg']);

    setDraftMilestone({
      ...item,
      period: currentPeriod,
      year: item.year || currentPeriod,
      dateArabic: item.dateArabic || '',
      title: item.title || '',
      subtitle: item.subtitle || '',
      mediaUrl: currentImages[0] || currentImg,
      imageUrl: '',
      images: currentImages,
      mediaCaption: currentCaption,
      description: item.description || '',
      iconName: currentIcon,
      icon: currentIcon,
      highlights: currentHighlights,
      keyAchievements: currentHighlights,
    });

    setHighlightsInput(currentHighlights.join('\n'));
    setTagsInput((item.tags || []).join('، '));
  };

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingIndex(null);
    const newId = `milestone-${Date.now()}`;
    const defaultImg = '/assets/sheikh/sheikh_kazim_01.jpg';

    setDraftMilestone({
      id: newId,
      period: 'محطة جديدة',
      year: '2020م',
      dateArabic: '1441 هـ',
      title: 'عنوان المحطة التاريخية',
      subtitle: 'وصف مختصر للمحطة',
      role: 'الصفة / الدور',
      description: 'اكتب هنا تفاصيل هذه المحطة المضيئة من سيرة الشيخ...',
      mediaUrl: defaultImg,
      imageUrl: '',
      images: [defaultImg],
      mediaCaption: 'صورة توثيقية للمحطة',
      category: 'community',
      tags: ['المنيزلة', 'الأحساء'],
      highlights: ['أبرز الإنجازات في هذه المرحلة', 'أثر مجتمعي رائد'],
      keyAchievements: ['أبرز الإنجازات في هذه المرحلة', 'أثر مجتمعي رائد'],
      iconName: 'Sparkles',
      icon: 'Sparkles',
    });

    setHighlightsInput('أبرز الإنجازات في هذه المرحلة\nأثر مجتمعي رائد');
    setTagsInput('المنيزلة، الأحساء');
  };

  const handleSaveDraft = async () => {
    const processedHighlights = highlightsInput
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    const processedTags = tagsInput
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const activeImg = draftMilestone.mediaUrl || draftMilestone.imageUrl || '/assets/sheikh/sheikh_kazim_01.jpg';
    const activePeriod = draftMilestone.period || draftMilestone.year || '2020م';
    const activeCaption = draftMilestone.mediaCaption || draftMilestone.subtitle || draftMilestone.title;
    const activeIcon = draftMilestone.iconName || draftMilestone.icon || 'Sparkles';

    const cleanImages = Array.isArray(draftMilestone.images) && draftMilestone.images.length > 0
      ? draftMilestone.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
      : [activeImg];

    const finalizedImg = cleanImages[0] || activeImg;

    const finalized: TimelineMilestone = {
      ...draftMilestone,
      period: activePeriod,
      year: draftMilestone.year || activePeriod,
      mediaUrl: finalizedImg,
      imageUrl: '', // Cleaned to prevent duplicate bloat
      images: cleanImages,
      mediaCaption: activeCaption,
      iconName: activeIcon,
      icon: activeIcon,
      highlights: processedHighlights.length > 0 ? processedHighlights : ['محطة مباركة في سيرة الشيخ'],
      keyAchievements: processedHighlights,
      tags: processedTags,
    };

    let updatedList: TimelineMilestone[];
    if (isAddingNew) {
      updatedList = [...timeline, finalized];
    } else if (editingIndex !== null) {
      updatedList = [...timeline];
      updatedList[editingIndex] = finalized;
    } else {
      updatedList = [...timeline];
    }

    setEditingIndex(null);
    setIsAddingNew(false);

    // Direct atomic async/await save to Cloud Firestore and storage
    try {
      await onChange(updatedList);
      showNotification('تم حفظ المحطة وتثبيت كامل الخط الزمني سحابياً بنجاح!');
    } catch {
      showNotification('تم حفظ المحطة محلياً وجارٍ المزامنة السحابية');
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه المحطة من الخط الزمني؟')) {
      const updated = timeline.filter((_, i) => i !== index);
      if (editingIndex === index) {
        setEditingIndex(null);
      }
      await onChange(updated);
      showNotification('تم حذف المحطة وتحديث الترتيب سحابياً بنجاح');
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= timeline.length) return;
    const updated = [...timeline];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    await onChange(updated);
  };

  // Quick direct image upload handler from card
  const handleTriggerQuickUpload = (idx: number) => {
    setTargetQuickIndex(idx);
    if (quickFileInputRef.current) {
      quickFileInputRef.current.value = '';
      quickFileInputRef.current.click();
    }
  };

  const handleQuickFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || targetQuickIndex === null) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، الحد الأقصى 20 ميغابايت');
      return;
    }

    setQuickUploadingIndex(targetQuickIndex);

    try {
      // Smart Auto Face Focus for 16:9 display framing
      let compressedDataUrl = '';
      try {
        compressedDataUrl = await smartAutoCropImage(file, 16 / 9, 960, 0.8);
      } catch (cropErr) {
        console.warn('Smart auto-crop fallback:', cropErr);
        compressedDataUrl = await compressImage(file, 800, 0.72);
      }

      // Convert to permanent static URL on server
      const permanentUrl = await uploadImageAsset(compressedDataUrl, { fileName: file.name });
      const finalMediaUrl = permanentUrl || compressedDataUrl;

      // Persist to Media Library for future reuse
      addMediaToLibrary(finalMediaUrl, file.name);

      // Apply immediately to the target milestone
      const updated = [...timeline];
      const target = updated[targetQuickIndex];
      if (target) {
        const currentImages = Array.isArray(target.images) && target.images.length > 0
          ? [finalMediaUrl, ...target.images.slice(1)]
          : [finalMediaUrl];

        const updatedItem: TimelineMilestone = {
          ...target,
          mediaUrl: finalMediaUrl,
          imageUrl: '',
          images: currentImages,
        };
        updated[targetQuickIndex] = updatedItem;

        // Immediate background server & cloud save
        try {
          await onChange(updated);
          showNotification(`تم ضبط وتثبيت صورة «${target.title}» بشكل دائم وسحابياً بنجاح!`);
        } catch {
          showNotification(`تم تغيير صورة «${target.title}» محلياً`);
        }
      }
      setQuickUploadingIndex(null);
      setTargetQuickIndex(null);
    } catch (err: any) {
      console.error('Upload & compress error:', err);
      alert('حدث خطأ أثناء معالجة الصورة: ' + (err.message || ''));
      setQuickUploadingIndex(null);
      setTargetQuickIndex(null);
    }
  };

  // Open manual crop modal for milestone
  const handleOpenCropForIndex = (idx: number) => {
    const item = timeline[idx];
    if (!item) return;
    const img = item.mediaUrl || item.imageUrl || (item.images && item.images[0]) || '';
    if (!img) return;
    setCropModalState({
      isOpen: true,
      milestoneIndex: idx,
      imageSrc: img,
    });
  };

  // Save manual crop for milestone
  const handleSaveCropForMilestone = async (croppedUrl: string) => {
    if (cropModalState.milestoneIndex < 0) return;
    const idx = cropModalState.milestoneIndex;
    const updated = [...timeline];
    const target = updated[idx];
    if (target) {
      const curImages = Array.isArray(target.images) && target.images.length > 0
        ? [croppedUrl, ...target.images.slice(1)]
        : [croppedUrl];

      const updatedItem: TimelineMilestone = {
        ...target,
        mediaUrl: croppedUrl,
        imageUrl: '',
        images: curImages,
      };
      updated[idx] = updatedItem;
      try {
        await onChange(updated);
        showNotification(`تم قص وضبط تركيز صورة «${target.title}» بنجاح!`);
      } catch {
        showNotification(`تم تعديل صورة «${target.title}» محلياً`);
      }
    }
    setCropModalState({ isOpen: false, milestoneIndex: -1, imageSrc: '' });
  };

  const handleSaveAllToCloud = async () => {
    setIsCloudSavingAll(true);
    try {
      const ok = await onChange(timeline);
      if (ok !== false) {
        showNotification('تم حفظ وتثبيت كافة محطات وصور الخط الزمني بنجاح تام!');
      } else {
        showNotification('تم حفظ المحطات محلياً');
      }
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء الحفظ والتثبيت');
    } finally {
      setIsCloudSavingAll(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-cairo">
      {/* Hidden file input for quick direct upload */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuickFileSelected}
        className="hidden"
      />

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-900/90 text-white border-2 border-[#D4AF37] p-3.5 rounded-sm shadow-md flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-sm border border-slate-200 gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>إدارة الخط الزمني والسيرة المصورة ({timeline.length} محطات)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            يمكنك رفع وتغيير صور المحطات فوراً من زر «تغيير الصورة» المباشر على كل بطاقة، أو عبر نموذج التعديل.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAllToCloud}
            disabled={isCloudSavingAll || isSaving}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="حفظ وتثبيت كافة صور وبيانات الخط الزمني"
          >
            {isCloudSavingAll || isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>جارٍ الحفظ والتثبيت...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>حفظ وتثبيت التعديلات</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2 bg-[#0F382C] text-[#D4AF37] hover:bg-[#144b3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة محطة جديدة</span>
          </button>
        </div>
      </div>

      {/* Edit/Add Form Modal or Card */}
      {(editingIndex !== null || isAddingNew) && (
        <div className="bg-[#FAF8F5] border-2 border-[#D4AF37] p-6 rounded-sm space-y-5 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-3">
            <h4 className="text-base font-bold text-[#0F382C] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {isAddingNew
                  ? 'إضافة محطة زمنية جديدة'
                  : `تعديل المحطة: ${draftMilestone.title || 'بدون عنوان'}`}
              </span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setIsAddingNew(false);
              }}
              className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded border border-slate-200"
            >
              <X className="w-4 h-4" />
              <span>إلغاء التعديل</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                عنوان المحطة الرئيسي *
              </label>
              <input
                type="text"
                value={draftMilestone.title}
                onChange={(e) =>
                  setDraftMilestone({ ...draftMilestone, title: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold"
                placeholder="مثال: النشأة في قرية المنيزلة بالأحساء ومهد التقوى"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                العنوان الفرعي
              </label>
              <input
                type="text"
                value={draftMilestone.subtitle}
                onChange={(e) =>
                  setDraftMilestone({ ...draftMilestone, subtitle: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder="مثال: أصالة البيئة الأحسائية والارتباط الوثيق بأهل المنيزلة"
              />
            </div>

            {/* Period / Timeline Header Tag */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                الفترة الزمنية / الشارة (تظهر أعلى البطاقة) *
              </label>
              <input
                type="text"
                value={draftMilestone.period}
                onChange={(e) =>
                  setDraftMilestone({ ...draftMilestone, period: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold text-[#0F382C]"
                placeholder="مثال: النشأة والجذور المباركة أو 1968م – 1388هـ"
              />
            </div>

            {/* Icon selection */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                أيقونة المحطة
              </label>
              <select
                value={draftMilestone.iconName || draftMilestone.icon || 'Sparkles'}
                onChange={(e) =>
                  setDraftMilestone({
                    ...draftMilestone,
                    iconName: e.target.value,
                    icon: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
              >
                <option value="Home">ولادة / نشأة وجذور (Home)</option>
                <option value="Scroll">دراسة دينية وحوزوية (Scroll)</option>
                <option value="GraduationCap">شهادة أكاديمية ودكتوراه (GraduationCap)</option>
                <option value="Sparkles">مبادرة وريادة مجتمعية (Sparkles)</option>
                <option value="HeartHandshake">إصلاح أسري ومجتمعي (HeartHandshake)</option>
                <option value="BookOpen">مؤلفات ودراسات (BookOpen)</option>
                <option value="Flame">رحيل وأثر خالد (Flame)</option>
              </select>
            </div>

            {/* PRIMARY IMAGE UPLOAD & SAVED URL INPUT */}
            <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-sm border border-[#D4AF37]/60 shadow-sm space-y-2">
              <ImageUploadInput
                label="رابط صورة المحطة الرئيسية (المحفوظة حالياً):"
                value={draftMilestone.mediaUrl || draftMilestone.imageUrl || (draftMilestone.images && draftMilestone.images[0]) || ''}
                onChange={(url) => {
                  const currentList = Array.isArray(draftMilestone.images) && draftMilestone.images.length > 0
                    ? draftMilestone.images
                    : [];
                  const updatedList = url
                    ? (currentList.length > 0 ? [url, ...currentList.slice(1)] : [url])
                    : currentList.slice(1);
                  setDraftMilestone({
                    ...draftMilestone,
                    mediaUrl: url,
                    imageUrl: '',
                    images: updatedList,
                  });
                }}
                placeholder="/assets/sheikh/... أو رابط الصورة المباشر"
                helperText="يظهر هذا الرابط كصورة رئيسية للمحطة. يمكنك رفع صورة جديدة أو اختيار صورة من مكتبة الصور المحفوظة."
              />
            </div>

            {/* MULTI-IMAGE GALLERY MANAGER */}
            <div className="col-span-1 md:col-span-2">
              <MilestoneImagesManager
                images={
                  draftMilestone.images && draftMilestone.images.length > 0
                    ? draftMilestone.images
                    : ([draftMilestone.mediaUrl || draftMilestone.imageUrl].filter(Boolean) as string[])
                }
                onChange={(newImages) => {
                  setDraftMilestone({
                    ...draftMilestone,
                    images: newImages,
                    mediaUrl: newImages[0] || '',
                    imageUrl: '',
                  });
                }}
              />
            </div>

            {/* Media Caption */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                تعليق ووصف الصورة (يظهر فوق الصورة عند تكبيرها)
              </label>
              <input
                type="text"
                value={draftMilestone.mediaCaption || ''}
                onChange={(e) =>
                  setDraftMilestone({ ...draftMilestone, mediaCaption: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder="مثال: سماحة الشيخ كاظم الحريب في لقاء مجتمعي مع وجهاء وأهالي بلدة المنيزلة"
              />
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                نص الوصف التوثيقي التفصيلي للمحطة *
              </label>
              <textarea
                rows={4}
                value={draftMilestone.description}
                onChange={(e) =>
                  setDraftMilestone({ ...draftMilestone, description: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder="اكتب هنا تفاصيل هذه المحطة في سيرة الشيخ..."
              />
            </div>

            {/* Highlights */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                أبرز الإنجازات والنقاط المميزة (سطر لكل نقطة)
              </label>
              <textarea
                rows={3}
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder="نقطة أولى&#10;نقطة ثانية&#10;نقطة ثالثة"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/30">
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
              className="px-5 py-2.5 bg-[#0F382C] text-white hover:bg-[#154c3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>تأكيد وحفظ المحطة (تحديث فوري)</span>
            </button>
          </div>
        </div>
      )}

      {/* Milestones list */}
      <div className="space-y-3">
        {timeline.map((item, idx) => {
          const currentImg = item.mediaUrl || item.imageUrl || '/assets/sheikh/sheikh_kazim_01.jpg';
          const isUploadingThis = quickUploadingIndex === idx;

          return (
            <div
              key={item.id || idx}
              className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#D4AF37] transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Image thumb with direct change action */}
                <div className="relative group/thumb w-20 h-20 rounded-sm bg-slate-900 border-2 border-[#D4AF37]/60 overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={currentImg}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                    style={{ objectPosition: 'center 22%' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/sheikh/sheikh_kazim_01.jpg';
                    }}
                  />
                  
                  {/* Quick Change Overlay Button */}
                  <button
                    type="button"
                    onClick={() => handleTriggerQuickUpload(idx)}
                    disabled={isUploadingThis}
                    title="تغيير هذه الصورة فوراً"
                    className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity cursor-pointer p-1 text-center"
                  >
                    {isUploadingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-[#D4AF37] mb-0.5" />
                        <span>تغيير الصورة</span>
                      </>
                    )}
                  </button>

                  {/* Loading spinner if currently uploading */}
                  {isUploadingThis && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-[#0F382C] text-[#D4AF37] text-xs font-bold rounded-sm">
                      {item.period || item.year || `#${idx + 1}`}
                    </span>
                    <h4 className="text-sm font-bold text-[#0F382C]">{item.title}</h4>
                    {Array.isArray(item.images) && item.images.length > 1 && (
                      <span className="px-2 py-0.5 bg-amber-50 text-[#854D0E] border border-amber-300 text-[11px] font-bold rounded-sm flex items-center gap-1">
                        <Images className="w-3 h-3 text-[#D4AF37]" />
                        <span>{item.images.length} صور (سلايدر 5ث)</span>
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-amber-900 font-semibold line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {item.description}
                  </p>
                  
                  {/* Media Caption display */}
                  {(item.mediaCaption) && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 line-clamp-1">
                      <ImageIcon className="w-3 h-3 text-[#D4AF37]" />
                      <span>{item.mediaCaption}</span>
                    </p>
                  )}

                  {/* Direct Image URL input/display with Copy Button */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 max-w-lg">
                    <span className="text-[11px] font-bold text-slate-600 shrink-0 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-[#D4AF37]" />
                      <span>رابط الصورة:</span>
                    </span>
                    <input
                      type="text"
                      value={currentImg}
                      onChange={(e) => handleDirectCardUrlChange(e.target.value, idx)}
                      title={currentImg}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 px-2 py-0.5 text-[11px] font-mono text-left dir-ltr bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:border-[#D4AF37] focus:outline-none text-slate-800 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyMilestoneUrl(currentImg, idx)}
                      title="نسخ رابط صورة هذه المحطة"
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-sm border border-slate-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedMilestoneLinkIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Quick change photo button */}
                <button
                  type="button"
                  onClick={() => handleTriggerQuickUpload(idx)}
                  disabled={isUploadingThis}
                  title="رفع صورة جديدة لهذه المحطة"
                  className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#f1ebe0] text-[#0F382C] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isUploadingThis ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                  <span>تغيير الصورة</span>
                </button>

                {/* Manual & Face Crop button */}
                <button
                  type="button"
                  onClick={() => handleOpenCropForIndex(idx)}
                  title="قص وتعديل تركيز الصورة يدويًا للعرض"
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0F382C] text-xs font-bold rounded-sm border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Crop className="w-3.5 h-3.5 text-[#0F382C]" />
                  <span>قص العرض</span>
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  title="تحريك لأعلى"
                  className="p-1.5 text-slate-500 hover:text-[#0F382C] disabled:opacity-30 cursor-pointer"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === timeline.length - 1}
                  title="تحريك لأسفل"
                  className="p-1.5 text-slate-500 hover:text-[#0F382C] disabled:opacity-30 cursor-pointer"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(idx)}
                  className="px-3 py-1.5 bg-[#0F382C] text-white hover:bg-[#154d3e] text-xs font-bold rounded-sm flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                  title="حذف المحطة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual & Smart Face Cropper Modal */}
      {cropModalState.isOpen && (
        <ImageCropModal
          isOpen={cropModalState.isOpen}
          imageSrc={cropModalState.imageSrc}
          title={`قص وضبط تركيز صورة «${timeline[cropModalState.milestoneIndex]?.title || ''}»`}
          onSave={handleSaveCropForMilestone}
          onClose={() => setCropModalState({ isOpen: false, milestoneIndex: -1, imageSrc: '' })}
        />
      )}
    </div>
  );
};
