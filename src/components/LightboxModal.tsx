import React, { useEffect } from 'react';
import { X, ZoomIn, Calendar, Tag, ExternalLink } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  caption?: string;
  dateOrYear?: string;
  tags?: string[];
  code?: string;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
  dateOrYear,
  tags,
  code,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="lightbox-container"
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#0F382C] border-2 border-[#D4AF37] rounded-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#09241C] border-b border-[#D4AF37]/40">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#D4AF37] inline-block"></span>
            <h3 className="text-lg sm:text-xl font-bold text-white font-cairo line-clamp-1">
              {title}
            </h3>
          </div>
          <button
            id="lightbox-close-btn"
            onClick={onClose}
            aria-label="إغلاق المعاينة"
            className="p-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media stage */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-[#04120E]/95 min-h-[350px]">
          <div className="relative group max-w-full max-h-[65vh]">
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[62vh] w-auto object-contain mx-auto rounded-sm shadow-2xl border border-[#D4AF37]/40"
              loading="lazy"
            />
          </div>
        </div>

        {/* Caption & Metadata bar */}
        <div className="px-6 py-4 bg-[#09241C] border-t border-[#D4AF37]/40 space-y-2">
          {caption && (
            <p className="text-sm sm:text-base text-[#FAF8F5]/90 leading-relaxed font-cairo">
              {caption}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-[#D4AF37]">
            <div className="flex items-center gap-4 flex-wrap">
              {dateOrYear && (
                <span className="flex items-center gap-1.5 bg-[#0F382C] px-3 py-1 rounded-sm border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {dateOrYear}
                </span>
              )}
              {code && (
                <span className="font-mono bg-[#0F382C] px-3 py-1 rounded-sm border border-[#D4AF37]/40 text-xs text-white/90">
                  رمز الاعتماد: {code}
                </span>
              )}
            </div>

            {tags && tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-0.5 rounded-sm text-xs border border-[#D4AF37]/30 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
