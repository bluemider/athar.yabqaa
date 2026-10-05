import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="العودة إلى أعلى الصفحة"
      title="العودة إلى أعلى الصفحة"
      className="fixed bottom-6 left-6 z-40 p-3 bg-[#0F382C]/95 hover:bg-[#144d3d] text-[#D4AF37] hover:text-white rounded-full border-2 border-[#D4AF37] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] flex items-center justify-center group cursor-pointer backdrop-blur-xs"
    >
      <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
      <span className="sr-only">العودة للأعلى</span>
    </button>
  );
};
