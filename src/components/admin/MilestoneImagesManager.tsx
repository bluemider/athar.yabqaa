import React, { useState, useRef } from 'react';
import {
  Images,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  Star,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Plus,
  Info,
  Crop,
  Copy,
  Check,
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageAsset } from '../../utils/imageUploadService';
import { smartAutoCropImage } from '../../utils/smartFaceFocus';
import { addMediaToLibrary } from '../../utils/mediaLibraryStorage';
import { ImageCropModal } from './ImageCropModal';
import { ImageUploadInput } from './ImageUploadInput';

// Available archive images list for quick selection
const ARCHIVE_PRESETS = [
  { url: '/assets/sheikh/sheikh_kazim_01.jpg', label: 'صورة شخصية رسمية (01)' },
  { url: '/assets/sheikh/sheikh_kazim_02.jpg', label: 'حضور وبحث حوزوي (02)' },
  { url: '/assets/sheikh/sheikh_kazim_03.jpg', label: 'المنبر الشريف والمحراب (03)' },
  { url: '/assets/sheikh/sheikh_kazim_04.jpg', label: 'لقاء مجتمعي وأخوي (04)' },
  { url: '/assets/sheikh/sheikh_kazim_05.jpg', label: 'رعاية الفعاليات الأهلية (05)' },
  { url: '/assets/sheikh/sheikh_kazim_06.jpg', label: 'الموعظة الصادقة (06)' },
  { url: '/assets/sheikh/sheikh_kazim_07.jpg', label: 'جلسة توجيهية مع الشباب (07)' },
  { url: '/assets/sheikh/sheikh_kazim_08.jpg', label: 'المناسبات الدينية (08)' },
  { url: '/assets/sheikh/sheikh_kazim_09.jpg', label: 'لقاء وجهاء الأحساء (09)' },
  { url: '/assets/sheikh/sheikh_kazim_10.jpg', label: 'إصلاح ذات البين (10)' },
  { url: '/assets/sheikh/sheikh_kazim_11.jpg', label: 'مؤتمرات وبرامج تنموية (11)' },
  { url: '/assets/sheikh/sheikh_kazim_12.jpg', label: 'مناقشة الدرجات العلمية (12)' },
  { url: '/assets/sheikh/sheikh_kazim_13.jpg', label: 'روحانية المحراب (13)' },
  { url: '/assets/sheikh/sheikh_kazim_14.jpg', label: 'مهرجان تكريم المتفوقين (14)' },
  { url: '/assets/sheikh/sheikh_kazim_15.jpg', label: 'مهرجان الإبداع والتطوير (15)' },
  { url: '/assets/sheikh/sheikh_kazim_16.jpg', label: 'حوار فكري وأسري (16)' },
  { url: '/assets/sheikh/sheikh_kazim_17.jpg', label: 'تفقد المشاريع بالبلدة (17)' },
  { url: '/assets/sheikh/sheikh_kazim_18.jpg', label: 'إشراقة الابتسامة (18)' },
  { url: '/assets/sheikh/sheikh_kazim_19.jpg', label: 'نظرة الأمل والرسالة (19)' },
  { url: '/assets/sheikh/sheikh_kazim_20.jpg', label: 'وفاء الأحبة والمسيرة (20)' },
  { url: '/assets/sheikh/sheikh_kazim_21.jpg', label: 'بين أهالي ووجهاء المنيزلة (21)' },
  { url: '/assets/sheikh/sheikh_kazim_22.jpg', label: 'نبض القرية والعطاء (22)' },
  { url: '/assets/sheikh/sheikh_kazim_23.jpg', label: 'مجالس العلماء والمجتمع (23)' },
  { url: '/assets/sheikh/sheikh_kazim_24.jpg', label: 'الأثر الباقي للأجيال (24)' },
  { url: '/assets/sheikh/sheikh_kazim_25.jpg', label: 'مجلس التوجيه الأسري (25)' },
  { url: '/assets/sheikh/sheikh_kazim_26.jpg', label: 'البورتريه الذهبي المعتمد (26)' },
];

interface MilestoneImagesManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const MilestoneImagesManager: React.FC<MilestoneImagesManagerProps> = ({
  images,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [autoFaceCropOnUpload, setAutoFaceCropOnUpload] = useState(true);
  const [cropModalState, setCropModalState] = useState<{
    isOpen: boolean;
    imageIndex: number;
    imageSrc: string;
  }>({ isOpen: false, imageIndex: -1, imageSrc: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyImageLink = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  const currentImages = React.useMemo(() => {
    return (images || []).filter((img) => typeof img === 'string' && img.trim().length > 0);
  }, [images]);

  // Handle uploading multiple files from device
  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus(`جارٍ معالجة ${files.length} صورة...`);

    const newCompressedList: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 25 * 1024 * 1024) continue; // max 25MB safety
        setUploadStatus(
          autoFaceCropOnUpload
            ? `جارٍ التركيز الذكي على الوجه وضبط العرض (${i + 1} من ${files.length})...`
            : `جارٍ تجهيز وضغط الصورة (${i + 1} من ${files.length})...`
        );

        let processed = '';
        if (autoFaceCropOnUpload) {
          try {
            processed = await smartAutoCropImage(file, 16 / 9, 960, 0.8);
          } catch (autoErr) {
            console.warn('Smart auto-crop fallback:', autoErr);
            processed = await compressImage(file, 900, 0.76);
          }
        } else {
          processed = await compressImage(file, 900, 0.76);
        }

        if (processed) {
          // Upload to server to get permanent, lightweight static URL
          const permanentUrl = await uploadImageAsset(processed, { fileName: file.name });
          const finalUrl = permanentUrl || processed;
          newCompressedList.push(finalUrl);
          addMediaToLibrary(finalUrl, file.name);
        }
      }

      if (newCompressedList.length > 0) {
        onChange([...currentImages, ...newCompressedList]);
        setUploadStatus(`تمت إضافة ${newCompressedList.length} صورة وحفظها بشكل دائم بنجاح!`);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to process images:', err);
      setUploadStatus('حدث خطأ أثناء معالجة الصور');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Open manual crop modal for an image
  const handleOpenCrop = (index: number) => {
    if (!currentImages[index]) return;
    setCropModalState({
      isOpen: true,
      imageIndex: index,
      imageSrc: currentImages[index],
    });
  };

  // Save manual crop result
  const handleSaveCrop = async (croppedUrl: string) => {
    if (cropModalState.imageIndex < 0) return;
    // Ensure cropped result is saved as permanent server URL
    const permanentUrl = await uploadImageAsset(croppedUrl, { fileName: 'milestone_crop.jpg' });
    const updated = [...currentImages];
    updated[cropModalState.imageIndex] = permanentUrl || croppedUrl;
    onChange(updated);
    setCropModalState({ isOpen: false, imageIndex: -1, imageSrc: '' });
  };

  // Add custom URL
  const handleAddUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (currentImages.includes(trimmed)) {
      alert('هذه الصورة مضافة مسبقاً في المحطة');
      return;
    }
    setUrlInput('');
    if (trimmed.startsWith('data:image/')) {
      const permanent = await uploadImageAsset(trimmed, { fileName: 'pasted_milestone_img.jpg' });
      onChange([...currentImages, permanent || trimmed]);
    } else {
      onChange([...currentImages, trimmed]);
    }
  };

  // Add preset from archive
  const handleAddPreset = (url: string) => {
    if (!url) return;
    if (currentImages.includes(url)) {
      alert('هذه الصورة موجودة بالفعل في صور هذه المحطة');
      return;
    }
    onChange([...currentImages, url]);
    setSelectedPreset('');
  };

  // Remove photo
  const handleRemove = (index: number) => {
    const updated = currentImages.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  // Set as primary (first photo)
  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    const target = currentImages[index];
    const rest = currentImages.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
  };

  // Reorder left/right
  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= currentImages.length) return;
    const copy = [...currentImages];
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    onChange(copy);
  };

  return (
    <div className="space-y-4 font-cairo text-right">
      {/* Header with Explanatory Banner */}
      <div className="bg-[#FAF8F5] p-3.5 rounded-sm border border-[#D4AF37]/50 shadow-sm space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0F382C] text-[#D4AF37] rounded-sm">
              <Images className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F382C]">
                معرض صور المحطة التوثيقية (حركة تلقائية مشروطة)
              </h4>
              <p className="text-[11px] text-slate-600">
                إذا كانت هناك صورة واحدة تظهر ثابتة بدون حركة. وإذا أضفت صورتين أو أكثر، يتحرك السلايدر تلقائياً كل 5 ثوانٍ مع أزرار وأسهم التنقل.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#0F382C] text-[#D4AF37] text-xs font-bold rounded-sm border border-[#D4AF37]/60">
            {currentImages.length} {currentImages.length === 1 ? 'صورة' : 'صور مضافة'}
          </span>
        </div>

        {/* Notice badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#854D0E] bg-amber-50 p-2 rounded-sm border border-amber-200">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#854D0E]" />
          <span>
            الصورة الأولى المحددة بنجمة ذهبية هي <strong>الصورة الرئيسية (الغلاف)</strong> التي تظهر أولاً في السيرة.
          </span>
        </div>
      </div>

      {/* Existing Images Grid */}
      {currentImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {currentImages.map((imgUrl, idx) => {
            const isPrimary = idx === 0;

            return (
              <div
                key={`${imgUrl}-${idx}`}
                className={`relative rounded-sm overflow-hidden border-2 bg-slate-900 group shadow-sm transition-all ${
                  isPrimary
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40'
                    : 'border-slate-300 hover:border-[#D4AF37]/80'
                }`}
              >
                {/* Image Aspect Box */}
                <div className="aspect-video w-full overflow-hidden relative">
                  <img
                    src={imgUrl}
                    alt={`صورة ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/sheikh/sheikh_kazim_01.jpg';
                    }}
                  />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <span className="absolute top-1.5 right-1.5 bg-[#D4AF37] text-[#0F382C] text-[10px] font-bold px-2 py-0.5 rounded-sm shadow flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#0F382C]" />
                      الرئيسية
                    </span>
                  )}

                  {/* Number Badge */}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    #{idx + 1}
                  </span>
                </div>

                {/* Control Action Toolbar */}
                <div className="p-2 bg-white border-t border-slate-200 flex flex-col gap-1.5 text-slate-700">
                  {/* Link Preview and Edit Input */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span>رابط الصورة:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyImageLink(imgUrl, idx)}
                        title="نسخ رابط الصورة"
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        const copy = [...currentImages];
                        copy[idx] = newUrl;
                        onChange(copy);
                        if (newUrl.trim().length > 5) {
                          addMediaToLibrary(newUrl.trim());
                        }
                      }}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full px-1.5 py-0.5 text-[10px] font-mono text-left dir-ltr bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    {/* Left / Right move buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, idx - 1)}
                        title="تحريك لليمين (سابق)"
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 hover:text-[#0F382C] cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentImages.length - 1}
                        onClick={() => handleMove(idx, idx + 1)}
                        title="تحريك لليسار (تالي)"
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 hover:text-[#0F382C] cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Actions: Crop / Make primary / Delete */}
                    <div className="flex items-center gap-1">
                      {/* Manual Crop Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenCrop(idx)}
                        title="قص وتعديل تركيز الصورة يدويًا للعرض"
                        className="text-[10px] font-bold text-[#0F382C] hover:text-[#D4AF37] bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Crop className="w-3 h-3 text-[#0F382C]" />
                        <span>قص</span>
                      </button>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleMakePrimary(idx)}
                          title="تعيين كصورة رئيسية أولى"
                          className="text-[10px] font-bold text-[#854D0E] hover:text-[#D4AF37] bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Star className="w-3 h-3" />
                          <span>رئيسية</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        title="حذف هذه الصورة من المحطة"
                        className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed border-slate-300 rounded-sm bg-slate-50 text-slate-500 text-xs">
          لا توجد صور مضافة لهذه المحطة بعد. استخدم الخيارات أدناه لرفع أو إضافة صور.
        </div>
      )}

      {/* ADD IMAGES TOOLBAR */}
      <div className="bg-white p-4 rounded-sm border border-slate-300 space-y-3 shadow-sm">
        <h5 className="text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>إضافة صور جديدة لهذه المحطة:</span>
        </h5>

        {/* AI Face Focus toggle for uploading */}
        <div className="bg-amber-50/80 p-2.5 rounded-sm border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs font-bold text-[#0F382C] cursor-pointer">
            <input
              type="checkbox"
              checked={autoFaceCropOnUpload}
              onChange={(e) => setAutoFaceCropOnUpload(e.target.checked)}
              className="w-4 h-4 accent-[#0F382C] rounded cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>التركيز الذكي التلقائي على الوجه (AI Face Auto-Focus) لمقاس 16:9</span>
            </span>
          </label>
          <span className="text-[11px] text-slate-600">
            يضبط الوجه في الثلث العلوي لمنع اقتصاص الرأس
          </span>
        </div>

        {/* 1. Multi-file upload from device */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelect}
            className="hidden"
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-2.5 bg-[#0F382C] text-white hover:bg-[#154c3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>{uploadStatus || 'جارٍ الرفع والمعالجة...'}</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                <span>رفع صورة أو عدة صور من جهازك (مع الضبط التلقائي)</span>
              </>
            )}
          </button>
        </div>

        {uploadStatus && (
          <p className="text-[11px] text-emerald-700 font-semibold">{uploadStatus}</p>
        )}

        {/* 2. Add from Archive Presets Dropdown */}
        <div className="pt-2 border-t border-slate-200">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            أو اختيار سريع من أرشيف صور الشيخ التوثيقية:
          </label>
          <div className="flex gap-2">
            <select
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value);
                if (e.target.value) {
                  handleAddPreset(e.target.value);
                }
              }}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white text-right font-cairo"
            >
              <option value="">-- اختر صورة من أرشيف الشيخ لإضافتها فوراً --</option>
              {ARCHIVE_PRESETS.map((preset) => (
                <option key={preset.url} value={preset.url}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Add via ImageUploadInput (Direct Upload & Link generator) */}
        <div className="pt-2 border-t border-slate-200">
          <ImageUploadInput
            label="إضافة صورة للمحطة مع توليد الرابط التلقائي:"
            value={urlInput}
            onChange={(url) => {
              if (url) {
                if (currentImages.includes(url)) {
                  alert('هذه الصورة مضافة مسبقاً في المحطة');
                  return;
                }
                onChange([...currentImages, url]);
                setUrlInput('');
              }
            }}
            placeholder="https://example.com/photo.jpg أو /assets/sheikh/..."
            helperText="عند رفع الصورة أو إدخال الرابط، ستضاف تلقائياً إلى معرض صور هذه المحطة."
          />
        </div>
      </div>

      {/* Manual & Smart Crop Modal */}
      {cropModalState.isOpen && (
        <ImageCropModal
          isOpen={cropModalState.isOpen}
          imageSrc={cropModalState.imageSrc}
          title={`قص وتعديل تركيز الصورة #${cropModalState.imageIndex + 1}`}
          onSave={handleSaveCrop}
          onClose={() => setCropModalState({ isOpen: false, imageIndex: -1, imageSrc: '' })}
        />
      )}
    </div>
  );
};
