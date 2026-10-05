import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Bookmark, ExternalLink, X, ShoppingBag, MessageCircle } from 'lucide-react';
import { SectionNavigationHeader } from './SectionNavigationHeader';
import { BOOK_PUBLICATIONS } from '../data/archiveData';
import { BookPublication } from '../types';
import { useSiteContent } from '../context/SiteContentContext';

interface BooksSectionProps {
  onOpenLightbox: (imageUrl: string, title: string, caption?: string) => void;
}

export const BooksSection: React.FC<BooksSectionProps> = ({ onOpenLightbox }) => {
  const { content } = useSiteContent();
  const booksList = content?.books && content.books.length > 0
    ? content.books
    : BOOK_PUBLICATIONS;

  const [activeBookModal, setActiveBookModal] = useState<BookPublication | null>(null);

  const officialDarSawtWhatsapp = "https://wa.me/c/130069393621219";

  return (
    <section id="books" className="py-20 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Integrated Section Navigation & Back Button */}
        <SectionNavigationHeader
          parentName="مكتبة أثر"
          currentName="المؤلفات والكتب والدراسات"
          theme="light"
          showLibraryLinks={true}
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F382C]/10 text-[#0F382C] text-sm font-bold font-cairo border border-[#D4AF37] rounded-sm shadow-sm">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>المكتبة الفكرية والأسرية والمنطقية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-cairo text-[#0F382C] flex items-center justify-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
            <span>المؤلفات والكتب والدراسات التخصصية</span>
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
          </h2>
          <p className="text-lg sm:text-xl text-[#1E293B] font-cairo leading-relaxed">
            نتاج فكري وقلم رصين للشيخ الدكتور كاظم الحريب يجمع بين أصالة المفاهيم وقوة التطبيق، في الكوتشينج الأسري، المنطق المعرفي، وحماية الاستقرار الاجتماعي.
          </p>
          <div className="w-28 h-[2px] bg-[#D4AF37] mx-auto pt-0" />
        </div>

        {/* Official Publisher & WhatsApp Catalog Banner */}
        <div className="mb-12 bg-gradient-to-r from-[#0F382C] via-[#144b3c] to-[#0F382C] text-white p-5 sm:p-6 rounded-sm border-2 border-[#D4AF37] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="p-3 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-full shrink-0 text-[#D4AF37]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 bg-[#D4AF37] text-[#0F382C] text-[11px] font-extrabold rounded-sm font-cairo mb-1">
                الكتالوج الرسمي المعتمد
              </div>
              <h3 className="text-base sm:text-lg font-bold font-cairo text-white">
                مؤلفات د. كاظم الحريب لدى دار صوت المؤلّف للنشر والتوزيع
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-cairo">
                جميع الإصدارات متاحة للشحن والتوزيع المباشر داخل وخارج المملكة عبر متجر الدار وكتالوج واتساب الرسمي.
              </p>
            </div>
          </div>

          <a
            href={officialDarSawtWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm font-bold font-cairo text-xs sm:text-sm flex items-center gap-2 border border-emerald-400 shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>تصفح واطلب عبر كتالوج واتساب الدار</span>
          </a>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {booksList.map((book: BookPublication) => {
            const cover = book.coverUrl || book.coverImage || '/assets/books/al_life_coaching.png';
            const desc = book.summary || book.description || '';
            const topics = book.keyTopics || book.topics || [];
            const waUrl = book.whatsappOrderUrl || officialDarSawtWhatsapp;

            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                className="bg-white rounded-sm border border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Book Cover Presentation */}
                <div
                  className="relative p-6 pb-2 bg-[#FAF8F5] flex items-center justify-center cursor-pointer border-b border-[#D4AF37]/20"
                  onClick={() =>
                    onOpenLightbox(cover, book.title, `${book.subtitle} — ${book.author} (${book.publisher})`)
                  }
                >
                  <div className="relative w-44 sm:w-48 aspect-[1/1.45] rounded-sm overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500 border border-black/15 bg-slate-50">
                    <img
                      src={cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/books/al_life_coaching.png';
                      }}
                    />
                    {/* Subtle 3D book spine overlay */}
                    <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/25 to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-5 pt-4 flex-1 flex flex-col justify-between space-y-3.5 text-right">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-xs font-bold text-[#D4AF37] bg-[#0F382C] px-2.5 py-0.5 rounded-sm border border-[#D4AF37]/30 inline-block font-cairo shadow-sm">
                        {book.edition || 'إصدار علمي'} • {book.year || '2025م'}
                      </span>
                      {book.price && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-300 font-mono">
                          {book.price}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold font-cairo text-[#0F382C] group-hover:text-[#854D0E] transition-colors leading-tight">
                      {book.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm font-semibold text-[#854D0E] font-cairo">
                      {book.subtitle}
                    </p>

                    <p className="text-xs text-slate-500 font-cairo">
                      بقلم: <strong className="text-slate-800">{book.author || 'د. كاظم الحريب'}</strong>
                    </p>

                    <p className="text-xs sm:text-sm text-[#1E293B] font-cairo line-clamp-3 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="text-[11px] text-[#1E293B]/70 font-semibold font-cairo">
                      {book.publisher}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveBookModal(book)}
                        className="w-full py-2 px-2 rounded-sm bg-[#0F382C] hover:bg-[#164e3e] text-[#D4AF37] text-xs font-bold font-cairo transition-colors cursor-pointer flex items-center justify-center gap-1 border border-[#D4AF37]/40 shadow-sm"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>تفاصيل الكتاب</span>
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-2 rounded-sm bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold font-cairo transition-colors cursor-pointer flex items-center justify-center gap-1 border border-emerald-500 shadow-sm text-center"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>طلب عبر واتساب</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Book Details Modal */}
        {activeBookModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setActiveBookModal(null)}
          >
            <div
              className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#D4AF37] p-6 sm:p-8 space-y-6 text-right shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-sm bg-[#0F382C] text-[#D4AF37]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-cairo text-[#0F382C]">
                      {activeBookModal.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#854D0E] font-cairo">
                      {activeBookModal.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveBookModal(null)}
                  className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                <div className="sm:col-span-1 flex flex-col items-center gap-3">
                  <div className="w-40 aspect-[1/1.45] rounded-sm overflow-hidden shadow-xl border border-black/10 bg-slate-50">
                    <img
                      src={activeBookModal.coverUrl || activeBookModal.coverImage || '/assets/books/al_life_coaching.png'}
                      alt={activeBookModal.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/books/al_life_coaching.png';
                      }}
                    />
                  </div>

                  {activeBookModal.price && (
                    <div className="text-center w-full px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold font-cairo text-sm rounded-sm">
                      السعر: {activeBookModal.price}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <div className="text-xs text-gray-700 space-y-1.5 bg-gray-50 p-3.5 rounded-sm border border-gray-200">
                    <p>
                      <strong className="text-gray-900">المؤلف:</strong> {activeBookModal.author || 'د. كاظم الحريب'}
                    </p>
                    <p>
                      <strong className="text-gray-900">دار النشر والتوزيع:</strong> {activeBookModal.publisher}
                    </p>
                    <p>
                      <strong className="text-gray-900">الطبعة والسنة:</strong>{' '}
                      {activeBookModal.edition || 'إصدار رسمي'} ({activeBookModal.year || '2025م'})
                    </p>
                    {activeBookModal.pages && (
                      <p>
                        <strong className="text-gray-900">عدد الصفحات:</strong> {activeBookModal.pages} صفحة
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F382C] font-cairo mb-1">
                      نبذة عن الكتاب:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#1E293B]/85 font-cairo leading-relaxed">
                      {activeBookModal.summary || activeBookModal.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Topics */}
              {((activeBookModal.keyTopics && activeBookModal.keyTopics.length > 0) || (activeBookModal.topics && activeBookModal.topics.length > 0)) && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-[#0F382C] font-cairo flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>أبرز المحاور والمخرجات في الكتاب:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(activeBookModal.keyTopics || activeBookModal.topics || []).map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        className="flex items-center gap-2 p-2.5 rounded-sm bg-[#FAF8F5] border border-[#D4AF37]/20"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span className="text-xs font-semibold text-[#1E293B]/90 font-cairo">
                          {topic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href={activeBookModal.whatsappOrderUrl || officialDarSawtWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-bold font-cairo shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>طلب النسخة الورقية عبر واتساب الدار</span>
                  </a>

                  {activeBookModal.externalUrl && (
                    <a
                      href={activeBookModal.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F382C] hover:text-[#854D0E] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>صفحة الكتاب بالمتجر الإلكتروني</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setActiveBookModal(null)}
                  className="px-5 py-2 rounded-sm bg-[#0F382C] text-white text-xs font-bold font-cairo hover:bg-[#164e3e] cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
