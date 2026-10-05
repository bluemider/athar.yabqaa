import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Crop,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Loader2,
  ZoomIn,
  Move,
  Eye,
  Info,
} from 'lucide-react';
import {
  detectFaceFocalPoint,
  calculateSmartCropRect,
  cropImageRegion,
  loadImage,
  CropRect,
} from '../../utils/smartFaceFocus';
import { uploadImageAsset } from '../../utils/imageUploadService';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  title?: string;
  onSave: (croppedDataUrl: string) => void;
  onClose: () => void;
}

type AspectRatioOption = '16:9' | '4:3' | '1:1' | 'free';

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  title = 'قص وضبط تركيز العرض',
  onSave,
  onClose,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9');
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'nw' | 'ne' | 'se' | 'sw' | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; box: CropRect }>({
    mouseX: 0,
    mouseY: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [displayMetrics, setDisplayMetrics] = useState<{
    width: number;
    height: number;
    scale: number;
    offsetX: number;
    offsetY: number;
  }>({ width: 0, height: 0, scale: 1, offsetX: 0, offsetY: 0 });

  // 1. Load image and perform initial AI face centering
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    let isMounted = true;
    setIsAnalyzing(true);

    loadImage(imageSrc)
      .then(async (img) => {
        if (!isMounted) return;
        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;
        setImgElement(img);
        setNaturalSize({ width: nw, height: nh });

        // AI Smart Face Focus
        const focal = await detectFaceFocalPoint(img);
        const targetAspect = 16 / 9;
        const initialCrop = calculateSmartCropRect(nw, nh, targetAspect, focal);

        setCropBox(initialCrop);
        setIsAnalyzing(false);
      })
      .catch((err) => {
        console.error('Failed to load image for cropping:', err);
        setIsAnalyzing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageSrc]);

  // 2. Measure display dimensions of image in viewport
  const updateDisplayMetrics = useCallback(() => {
    if (!containerRef.current || !naturalSize.width || !naturalSize.height) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cWidth = rect.width;
    const cHeight = rect.height;

    const imgAspect = naturalSize.width / naturalSize.height;
    const containerAspect = cWidth / cHeight;

    let dispWidth = cWidth;
    let dispHeight = cHeight;

    if (imgAspect > containerAspect) {
      dispHeight = cWidth / imgAspect;
    } else {
      dispWidth = cHeight * imgAspect;
    }

    const scale = dispWidth / naturalSize.width;
    const offsetX = (cWidth - dispWidth) / 2;
    const offsetY = (cHeight - dispHeight) / 2;

    setDisplayMetrics({
      width: dispWidth,
      height: dispHeight,
      scale,
      offsetX,
      offsetY,
    });
  }, [naturalSize]);

  useEffect(() => {
    updateDisplayMetrics();
    window.addEventListener('resize', updateDisplayMetrics);
    return () => window.removeEventListener('resize', updateDisplayMetrics);
  }, [updateDisplayMetrics]);

  // 3. Update live preview thumbnail whenever cropBox changes (throttled)
  useEffect(() => {
    if (!imageSrc || !cropBox.width || !cropBox.height) return;

    const timer = setTimeout(() => {
      cropImageRegion(imageSrc, cropBox, 360, 0.7)
        .then((url) => setPreviewDataUrl(url))
        .catch(() => {});
    }, 60);

    return () => clearTimeout(timer);
  }, [imageSrc, cropBox]);

  // Trigger AI Auto Focus
  const handleAiAutoFocus = async () => {
    if (!imgElement || !naturalSize.width) return;
    setIsAnalyzing(true);
    try {
      const focal = await detectFaceFocalPoint(imgElement);
      let targetRatio = 16 / 9;
      if (aspectRatio === '4:3') targetRatio = 4 / 3;
      if (aspectRatio === '1:1') targetRatio = 1;
      if (aspectRatio === 'free') targetRatio = cropBox.width / cropBox.height;

      const smartRect = calculateSmartCropRect(
        naturalSize.width,
        naturalSize.height,
        targetRatio,
        focal
      );
      setCropBox(smartRect);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Change Aspect Ratio
  const handleRatioChange = (newRatio: AspectRatioOption) => {
    setAspectRatio(newRatio);
    if (!naturalSize.width) return;

    let ratioVal = 16 / 9;
    if (newRatio === '4:3') ratioVal = 4 / 3;
    if (newRatio === '1:1') ratioVal = 1;
    if (newRatio === 'free') return; // keep current box

    // Recompute crop box with current center
    const cx = cropBox.x + cropBox.width / 2;
    const cy = cropBox.y + cropBox.height / 2;

    let newWidth = cropBox.width;
    let newHeight = Math.round(newWidth / ratioVal);

    if (newHeight > naturalSize.height) {
      newHeight = naturalSize.height;
      newWidth = Math.round(newHeight * ratioVal);
    }
    if (newWidth > naturalSize.width) {
      newWidth = naturalSize.width;
      newHeight = Math.round(newWidth / ratioVal);
    }

    let nx = Math.round(cx - newWidth / 2);
    let ny = Math.round(cy - newHeight / 2);

    nx = Math.max(0, Math.min(naturalSize.width - newWidth, nx));
    ny = Math.max(0, Math.min(naturalSize.height - newHeight, ny));

    setCropBox({
      x: nx,
      y: ny,
      width: newWidth,
      height: newHeight,
    });
  };

  // Mouse / Touch Drag Handlers
  const handleMouseDown = (
    e: React.MouseEvent | React.TouchEvent,
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    setDragType(type);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      box: { ...cropBox },
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragType || displayMetrics.scale <= 0) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = (clientX - dragStartRef.current.mouseX) / displayMetrics.scale;
      const deltaY = (clientY - dragStartRef.current.mouseY) / displayMetrics.scale;
      const orig = dragStartRef.current.box;

      const nw = naturalSize.width;
      const nh = naturalSize.height;

      if (dragType === 'move') {
        let nx = Math.round(orig.x + deltaX);
        let ny = Math.round(orig.y + deltaY);

        nx = Math.max(0, Math.min(nw - orig.width, nx));
        ny = Math.max(0, Math.min(nh - orig.height, ny));

        setCropBox({
          ...orig,
          x: nx,
          y: ny,
        });
      } else {
        // Resizing handles
        let targetRatio = 16 / 9;
        if (aspectRatio === '4:3') targetRatio = 4 / 3;
        if (aspectRatio === '1:1') targetRatio = 1;
        const lockAspect = aspectRatio !== 'free';

        let newW = orig.width;
        let newH = orig.height;
        let newX = orig.x;
        let newY = orig.y;

        if (dragType === 'se') {
          newW = Math.max(80, Math.min(nw - orig.x, Math.round(orig.width + deltaX)));
          if (lockAspect) {
            newH = Math.round(newW / targetRatio);
            if (orig.y + newH > nh) {
              newH = nh - orig.y;
              newW = Math.round(newH * targetRatio);
            }
          } else {
            newH = Math.max(60, Math.min(nh - orig.y, Math.round(orig.height + deltaY)));
          }
        } else if (dragType === 'nw') {
          newW = Math.max(80, Math.round(orig.width - deltaX));
          if (lockAspect) {
            newH = Math.round(newW / targetRatio);
            newX = orig.x + (orig.width - newW);
            newY = orig.y + (orig.height - newH);
          } else {
            newH = Math.max(60, Math.round(orig.height - deltaY));
            newX = orig.x + deltaX;
            newY = orig.y + deltaY;
          }
          if (newX < 0) {
            newW += newX;
            newX = 0;
            if (lockAspect) newH = Math.round(newW / targetRatio);
          }
          if (newY < 0) {
            newH += newY;
            newY = 0;
            if (lockAspect) newW = Math.round(newH * targetRatio);
          }
        } else if (dragType === 'ne') {
          newW = Math.max(80, Math.min(nw - orig.x, Math.round(orig.width + deltaX)));
          if (lockAspect) {
            newH = Math.round(newW / targetRatio);
            newY = orig.y + (orig.height - newH);
          } else {
            newH = Math.max(60, Math.round(orig.height - deltaY));
            newY = orig.y + deltaY;
          }
          if (newY < 0) {
            newH += newY;
            newY = 0;
            if (lockAspect) newW = Math.round(newH * targetRatio);
          }
        } else if (dragType === 'sw') {
          newW = Math.max(80, Math.round(orig.width - deltaX));
          newX = orig.x + (orig.width - newW);
          if (lockAspect) {
            newH = Math.round(newW / targetRatio);
          } else {
            newH = Math.max(60, Math.min(nh - orig.y, Math.round(orig.height + deltaY)));
          }
          if (newX < 0) {
            newW += newX;
            newX = 0;
            if (lockAspect) newH = Math.round(newW / targetRatio);
          }
          if (orig.y + newH > nh) {
            newH = nh - orig.y;
            if (lockAspect) newW = Math.round(newH * targetRatio);
          }
        }

        setCropBox({
          x: Math.max(0, Math.min(nw - 20, newX)),
          y: Math.max(0, Math.min(nh - 20, newY)),
          width: Math.max(40, newW),
          height: Math.max(30, newH),
        });
      }
    },
    [isDragging, dragType, displayMetrics.scale, naturalSize, aspectRatio]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle Save
  const handleApply = async () => {
    if (!imageSrc || !cropBox.width || !cropBox.height) return;
    setIsSaving(true);
    try {
      const croppedResult = await cropImageRegion(imageSrc, cropBox, 960, 0.82);
      // Upload cropped result to server for permanent, lightweight static URL
      const permanentUrl = await uploadImageAsset(croppedResult, {
        fileName: 'cropped_photo.jpg',
      });
      onSave(permanentUrl || croppedResult);
      onClose();
    } catch (err) {
      console.error('Failed to apply crop:', err);
      alert('حدث خطأ أثناء تطبيق القص.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Render crop box in display coordinates
  const screenBox = {
    left: displayMetrics.offsetX + cropBox.x * displayMetrics.scale,
    top: displayMetrics.offsetY + cropBox.y * displayMetrics.scale,
    width: cropBox.width * displayMetrics.scale,
    height: cropBox.height * displayMetrics.scale,
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-cairo select-none"
      dir="rtl"
    >
      <div className="bg-[#0A261E] border border-[#D4AF37]/60 rounded-sm w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-[#071F18] border-b border-[#D4AF37]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#D4AF37]/15 rounded text-[#D4AF37] border border-[#D4AF37]/30">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  تركيز الوجه وعرض 16:9
                </span>
              </h3>
              <p className="text-[11px] text-gray-300">
                حدد موضع القص يدويًا أو استخدم الذكاء الاصطناعي لضبط التركيز على الوجه تلقائيًا
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="px-4 py-2.5 bg-[#0D2F25] border-b border-[#D4AF37]/25 flex flex-wrap items-center justify-between gap-2.5">
          {/* Aspect Ratio Buttons */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-sm border border-[#D4AF37]/30">
            <span className="text-[11px] font-semibold text-gray-300 px-1.5">النسبة:</span>
            <button
              type="button"
              onClick={() => handleRatioChange('16:9')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                aspectRatio === '16:9'
                  ? 'bg-[#D4AF37] text-[#0F382C] shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              16:9 (عريض الموقع)
            </button>
            <button
              type="button"
              onClick={() => handleRatioChange('4:3')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                aspectRatio === '4:3'
                  ? 'bg-[#D4AF37] text-[#0F382C] shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              4:3
            </button>
            <button
              type="button"
              onClick={() => handleRatioChange('1:1')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                aspectRatio === '1:1'
                  ? 'bg-[#D4AF37] text-[#0F382C] shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              1:1 (مربع)
            </button>
            <button
              type="button"
              onClick={() => handleRatioChange('free')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                aspectRatio === 'free'
                  ? 'bg-[#D4AF37] text-[#0F382C] shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              حر
            </button>
          </div>

          {/* AI Auto Face Focus Button */}
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAiAutoFocus}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-600 hover:to-[#c49f2b] text-[#0F382C] text-xs font-bold rounded-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جارٍ فحص الوجه...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-[#0F382C]" />
                <span>ضبط ذكي على الوجه (AI)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Work Area: Canvas Area + Live Website Preview Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#030c09] min-h-[320px] max-h-[58vh]">
          {/* Left / Center: Interactive Crop Canvas */}
          <div
            ref={containerRef}
            className="relative flex-1 h-full min-h-[280px] overflow-hidden flex items-center justify-center p-3 select-none"
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt="الأصل"
                className="max-w-full max-h-full object-contain pointer-events-none opacity-90"
                style={{
                  width: displayMetrics.width || 'auto',
                  height: displayMetrics.height || 'auto',
                }}
              />
            )}

            {/* Dark Mask around crop box */}
            <div
              className="absolute inset-0 bg-black/60 pointer-events-none"
              style={{
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                  ${screenBox.left}px ${screenBox.top}px,
                  ${screenBox.left}px ${screenBox.top + screenBox.height}px,
                  ${screenBox.left + screenBox.width}px ${screenBox.top + screenBox.height}px,
                  ${screenBox.left + screenBox.width}px ${screenBox.top}px,
                  ${screenBox.left}px ${screenBox.top}px
                )`,
              }}
            />

            {/* Interactive Crop Frame Box */}
            {screenBox.width > 0 && screenBox.height > 0 && (
              <div
                className="absolute border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-move"
                style={{
                  left: `${screenBox.left}px`,
                  top: `${screenBox.top}px`,
                  width: `${screenBox.width}px`,
                  height: `${screenBox.height}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                onTouchStart={(e) => handleMouseDown(e, 'move')}
              >
                {/* Rule-of-Thirds Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-white/60" />
                  <div className="border-r border-white/60" />
                  <div />
                </div>

                {/* Move Handle Label */}
                <div className="absolute top-2 left-2 bg-black/80 text-[#D4AF37] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
                  <Move className="w-2.5 h-2.5" />
                  <span>اسحب للتحريك</span>
                </div>

                {/* Corner Resize Handles */}
                {/* Top-Left */}
                <div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-[#D4AF37] border-2 border-black rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                  onTouchStart={(e) => handleMouseDown(e, 'nw')}
                />
                {/* Top-Right */}
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-[#D4AF37] border-2 border-black rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleMouseDown(e, 'ne')}
                  onTouchStart={(e) => handleMouseDown(e, 'ne')}
                />
                {/* Bottom-Right */}
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#D4AF37] border-2 border-black rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                  onTouchStart={(e) => handleMouseDown(e, 'se')}
                />
                {/* Bottom-Left */}
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#D4AF37] border-2 border-black rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleMouseDown(e, 'sw')}
                  onTouchStart={(e) => handleMouseDown(e, 'sw')}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar: Real-Time Live Website Frame Preview */}
          <div className="w-full md:w-72 bg-[#071F18] border-t md:border-t-0 md:border-r border-[#D4AF37]/30 p-3.5 flex flex-col justify-between shrink-0">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة حية في إطار الموقع:</span>
              </div>

              {/* Exact 16:9 Website Card Frame */}
              <div className="space-y-1.5">
                <div className="aspect-video w-full rounded-sm overflow-hidden border-2 border-[#D4AF37] bg-black relative shadow-lg">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="معاينة المقصوصة"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                    </div>
                  )}

                  <div className="absolute bottom-1 right-1 bg-black/80 px-2 py-0.5 rounded text-[10px] text-[#D4AF37] font-bold">
                    إطار الخط الزمني (16:9)
                  </div>
                </div>

                <div className="p-2 bg-[#0F382C]/60 rounded border border-[#D4AF37]/20 text-[11px] text-gray-300 leading-relaxed flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>
                    هكذا ستظهر الصورة بالضبط للزوار داخل بطاقة السيرة الذاتية بالموقع بعد الحفظ.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="text-[10px] text-gray-400 space-y-1 pt-2 border-t border-white/10 hidden md:block">
              <p>• انقر على الدوائر الذهبية بالأركان لتكبير أو تصغير إطار القص.</p>
              <p>• اسحب من وسط الإطار لتحريكه وضبط موقع رأس ووجه الشيخ.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-[#071F18] border-t border-[#D4AF37]/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-sm border border-white/20 transition-colors"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAiAutoFocus}
              disabled={isAnalyzing || isSaving}
              className="px-3 py-2 text-xs font-bold text-[#D4AF37] bg-white/5 hover:bg-white/10 rounded-sm border border-[#D4AF37]/50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الوجه</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isSaving || !cropBox.width}
              className="px-5 py-2 text-xs font-bold text-[#0F382C] bg-[#D4AF37] hover:bg-[#bfa02e] rounded-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ تطبيق القص...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>تطبيق القص وحفظ التعديل</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
