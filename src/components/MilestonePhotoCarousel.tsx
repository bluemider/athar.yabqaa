import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, ZoomIn, Images, Play, Pause } from 'lucide-react';

interface MilestonePhotoCarouselProps {
  milestoneId: string;
  title: string;
  images?: string[];
  defaultImage: string;
  caption?: string;
  onOpenLightbox: (imageUrl: string, title: string, caption?: string) => void;
}

export const MilestonePhotoCarousel: React.FC<MilestonePhotoCarouselProps> = ({
  milestoneId,
  title,
  images,
  defaultImage,
  caption,
  onOpenLightbox,
}) => {
  // Normalize images list
  const cleanImages = React.useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((img) => {
        if (typeof img === 'string' && img.trim().length > 0 && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    } else if (defaultImage && typeof defaultImage === 'string' && defaultImage.trim().length > 0) {
      list.push(defaultImage.trim());
    }

    if (list.length === 0) {
      list.push('/assets/sheikh/sheikh_kazim_01.jpg');
    }
    return list;
  }, [images, defaultImage]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const [key, setKey] = useState(0); // for resetting transition animation
  const total = cleanImages.length;
  const hasMultiple = total >= 2;

  // Auto-slide every 5 seconds ONLY if there are 2 or more images
  useEffect(() => {
    if (!hasMultiple || isHovered || isAutoPlayPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(timer);
  }, [hasMultiple, total, isHovered, isAutoPlayPaused, key]);

  // Ensure currentIndex is in bounds if list changes
  useEffect(() => {
    if (currentIndex >= total) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
    setKey((prev) => prev + 1); // resets interval
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setKey((prev) => prev + 1); // resets interval
  };

  const handleSelect = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(idx);
    setKey((prev) => prev + 1);
  };

  const currentImage = cleanImages[currentIndex] || cleanImages[0];
  const displayCaption = caption || title;

  return (
    <div
      id={`milestone-carousel-${milestoneId}`}
      className="relative rounded-sm overflow-hidden border-2 border-[#D4AF37] shadow-md group/carousel aspect-video bg-[#04120E] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Current Image with smooth fade */}
      <div
        className="w-full h-full cursor-pointer relative"
        onClick={() => onOpenLightbox(currentImage, title, displayCaption)}
        title="انقر لتكبير الصورة في شاشة كاملة"
      >
        <img
          key={`${milestoneId}-${currentIndex}`}
          src={currentImage}
          alt={`${title} - صورة ${currentIndex + 1}`}
          className="w-full h-full object-cover group-hover/carousel:scale-[1.03] transition-all duration-700 ease-out"
          style={{ objectPosition: 'center 22%' }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/sheikh/sheikh_kazim_01.jpg';
          }}
        />

        {/* Gradient Overlay for Caption and Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover/carousel:opacity-100 transition-opacity flex flex-col justify-between p-3.5 text-right pointer-events-none">
          {/* Top Bar: Multi-image badge & auto-play status */}
          <div className="flex items-center justify-between pointer-events-auto">
            {hasMultiple ? (
              <div
                dir="rtl"
                className="inline-flex items-center gap-1.5 text-xs bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-sm border border-[#D4AF37]/60 text-[#D4AF37] select-none shadow-md"
              >
                <Images className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-gray-300 font-cairo font-normal">صورة</span>
                <span className="text-white font-mono font-bold text-sm">{currentIndex + 1}</span>
                <span className="text-gray-300 font-cairo font-normal">من</span>
                <span className="text-[#D4AF37] font-mono font-bold text-sm">{total}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse mx-0.5" />
                <span className="text-[10px] text-gray-300 font-cairo font-normal hidden sm:inline">
                  {isHovered ? '(متوقف مؤقتاً)' : '(تلقائي 5ث)'}
                </span>
              </div>
            ) : (
              <div />
            )}

            {/* Fullscreen Zoom button */}
            <button
              type="button"
              id={`zoom-btn-${milestoneId}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox(currentImage, title, displayCaption);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F382C] bg-[#D4AF37] hover:bg-[#b8952b] px-2.5 py-1 rounded-sm border border-[#D4AF37] shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>تكبير</span>
            </button>
          </div>

          {/* Bottom Bar: Caption and Dots Navigation */}
          <div className="space-y-2 pointer-events-auto">
            {/* Caption */}
            <p className="text-sm font-bold text-white font-cairo line-clamp-1 drop-shadow-sm">
              {displayCaption}
            </p>

            {/* Navigation Dots (Only if multiple images) */}
            {hasMultiple && (
              <div className="flex items-center justify-between pt-1 border-t border-white/20">
                <div className="flex items-center gap-1.5">
                  {cleanImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelect(idx, e)}
                      aria-label={`انتقل للصورة رقم ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        currentIndex === idx
                          ? 'w-6 h-2 bg-[#D4AF37] shadow-sm'
                          : 'w-2 h-2 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>

                {/* Auto-play pause toggle button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoPlayPaused((prev) => !prev);
                  }}
                  className="text-[10px] font-cairo text-gray-300 hover:text-white flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-sm border border-white/20 transition-colors cursor-pointer"
                  title={isAutoPlayPaused ? 'تشغيل الحركة التلقائية كل 5 ثوانٍ' : 'إيقاف الحركة التلقائية مؤقتاً'}
                >
                  {isAutoPlayPaused ? (
                    <>
                      <Play className="w-3 h-3 text-[#D4AF37]" />
                      <span>تشغيل (5ث)</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3 text-[#D4AF37]" />
                      <span>إيقاف مؤقت</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Navigation Buttons (Next / Prev) */}
      {hasMultiple && (
        <>
          {/* Prev Button (Right side in Arabic RTL view) */}
          <button
            type="button"
            id={`prev-btn-${milestoneId}`}
            onClick={handlePrev}
            aria-label="الصورة السابقة"
            title="الصورة السابقة"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-[#D4AF37] text-white hover:text-[#0F382C] border border-[#D4AF37]/60 flex items-center justify-center shadow-lg transition-all transform active:scale-90 hover:scale-105 cursor-pointer backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Next Button (Left side in Arabic RTL view) */}
          <button
            type="button"
            id={`next-btn-${milestoneId}`}
            onClick={handleNext}
            aria-label="الصورة التالية"
            title="الصورة التالية"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-[#D4AF37] text-white hover:text-[#0F382C] border border-[#D4AF37]/60 flex items-center justify-center shadow-lg transition-all transform active:scale-90 hover:scale-105 cursor-pointer backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Top Progress Bar for 5-second interval */}
          {!isHovered && !isAutoPlayPaused && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/40 z-30 overflow-hidden">
              <div
                key={`progress-${currentIndex}-${key}`}
                className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-300 transition-all"
                style={{
                  animation: 'linear-progress 5s linear forwards',
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Embedded CSS animation for smooth 5-second progress bar */}
      <style>{`
        @keyframes linear-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
