import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  Copy,
  Crop,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { uploadImageAsset } from '../../utils/imageUploadService';
import { ImageCropModal } from './ImageCropModal';
import { addMediaToLibrary, getMediaLibrary, MediaLibraryItem } from '../../utils/mediaLibraryStorage';

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '/assets/sheikh/... أو رابط مباشر',
  helperText,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaLibraryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLibraryOpen) {
      setLibraryItems(getMediaLibrary());
    }
  }, [isLibraryOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 20MB source)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً، الحد الأقصى 20 ميغابايت');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Compress and upload directly to server for clean visible URL
      const permanentUrl = await uploadImageAsset(file, {
        maxDimension: 1000,
        quality: 0.82,
        fileName: file.name,
      });

      if (permanentUrl) {
        onChange(permanentUrl);
        // Save to persistent media library so it is remembered in future sessions
        addMediaToLibrary(permanentUrl, file.name);
      } else {
        setUploadError('لم نتمكن من معالجة الصورة، يرجى المحاولة مرة أخرى.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsUploading(false);
    } catch (err: any) {
      console.error('Image processing error:', err);
      setUploadError('حدث خطأ أثناء معالجة الصورة: ' + (err.message || ''));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsUploading(false);
    }
  };

  const handleManualTextChange = (newVal: string) => {
    onChange(newVal);
    if (newVal && newVal.trim().length > 5) {
      addMediaToLibrary(newVal.trim());
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSelectFromLibrary = (itemUrl: string) => {
    onChange(itemUrl);
    setIsLibraryOpen(false);
  };

  return (
    <div className="space-y-1.5 text-right font-cairo">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#0F382C]">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {value && (
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              تم حفظ وتعيين رابط الصورة
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="text-[11px] font-bold text-[#0F382C] hover:text-[#D4AF37] bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
            title="استعراض الصور المرفوعة والمحفوظة سابقاً"
          >
            <FolderOpen className="w-3 h-3 text-[#D4AF37]" />
            <span>الصور المحفوظة</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Thumbnail Preview */}
        <div className="w-14 h-14 shrink-0 rounded-sm border border-[#D4AF37]/50 bg-slate-100 overflow-hidden relative group flex items-center justify-center">
          {value ? (
            <>
              <img
                src={value}
                alt="معاينة"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/sheikh/sheikh_kazim_01.jpg';
                }}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                title="إزالة الصورة"
                className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>

        {/* Input & Action Buttons */}
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => handleManualTextChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono text-left dir-ltr bg-slate-50 focus:bg-white"
              />
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {value && (
              <button
                type="button"
                onClick={handleCopyUrl}
                title="نسخ الرابط"
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm border border-slate-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-2 bg-[#0F382C] hover:bg-[#154a3a] text-white text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                  <span>جارٍ الرفع وتوليد الرابط...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>رفع من الجهاز</span>
                </>
              )}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => setIsCropOpen(true)}
                title="قص وتعديل تركيز الصورة يدويًا للعرض"
                className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#0F382C] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <Crop className="w-3.5 h-3.5 text-[#0F382C]" />
                <span className="hidden sm:inline">قص</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Persistent Media Library Modal/Dropdown */}
      {isLibraryOpen && (
        <div className="bg-white border-2 border-[#D4AF37] p-3 rounded-sm shadow-md mt-2 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b pb-1.5">
            <span className="text-xs font-bold text-[#0F382C] flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>مكتبة الصور المحفوظة والمرفوعة ({libraryItems.length} صورة)</span>
            </span>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
            >
              ✕ إغلاق
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            اضغط على أي صورة لتطبيق رابطها فوراً على هذا الحقل:
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded border border-slate-200">
            {libraryItems.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
                onClick={() => handleSelectFromLibrary(item.url)}
                className={`relative aspect-square rounded overflow-hidden border-2 cursor-pointer transition-all group ${
                  value === item.url
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-95'
                    : 'border-slate-300 hover:border-[#0F382C]'
                }`}
                title={item.name || item.url}
              >
                <img
                  src={item.url}
                  alt={item.name || `صورة ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/sheikh/sheikh_kazim_01.jpg';
                  }}
                />
                {value === item.url && (
                  <div className="absolute inset-0 bg-[#0F382C]/60 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-600 font-semibold">{uploadError}</p>
      )}
      {helperText && !uploadError && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}

      {/* Manual & Smart Face Cropper Modal */}
      {isCropOpen && value && (
        <ImageCropModal
          isOpen={isCropOpen}
          imageSrc={value}
          title={`قص وضبط تركيز (${label})`}
          onSave={(cropped) => {
            onChange(cropped);
            addMediaToLibrary(cropped, 'صورة مقصوصة');
            setIsCropOpen(false);
          }}
          onClose={() => setIsCropOpen(false)}
        />
      )}
    </div>
  );
};

