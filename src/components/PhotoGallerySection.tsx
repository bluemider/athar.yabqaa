import React, { useState } from 'react';
import { Image as ImageIcon, ZoomIn, Tag, Calendar, Sparkles } from 'lucide-react';
import { SectionNavigationHeader } from './SectionNavigationHeader';
import { GALLERY_PHOTOS } from '../data/archiveData';
import { MediaItem } from '../types';
import { useSiteContent } from '../context/SiteContentContext';

interface PhotoGallerySectionProps {
  onOpenLightbox: (imageUrl: string, title: string, caption?: string, dateOrYear?: string, tags?: string[]) => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  onOpenLightbox,
}) => {
  const { content } = useSiteContent();
  const photosList = content?.gallery && content.gallery.length > 0
    ? content.gallery
    : GALLERY_PHOTOS;

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'portrait' | 'pulpit' | 'mosque' | 'community' | 'academic'>('all');

  const filterTabs = [
    { id: 'all', label: `كافة الصور الأرشيفية (${photosList.length})` },
    { id: 'portrait', label: 'صور شخصية ورسمية' },
    { id: 'pulpit', label: 'المنبر الحسيني والمحراب' },
    { id: 'community', label: 'المجتمع والمنيزلة' },
    { id: 'academic', label: 'المجالس والفعاليات العلمية' },
  ];

  const filteredPhotos = photosList.filter((img) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pulpit') return img.category === 'pulpit' || img.category === 'mosque';
    return img.category === selectedFilter;
  });

  return (
    <section id="gallery" className="py-20 bg-[#0F382C] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Integrated Section Navigation & Back Button */}
        <SectionNavigationHeader
          parentName="مكتبة أثر"
          currentName="ألبوم ومكتبة الصور"
          theme="dark"
          showLibraryLinks={true}
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/20 text-[#FAF8F5] text-sm font-bold font-cairo border border-[#D4AF37] rounded-sm shadow-sm">
            <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>الأرشيف الفوتوغرافي الموثق</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-cairo text-white flex items-center justify-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
            <span>ألبوم الصور ومحطات العطاء المجتمعي</span>
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
          </h2>
          <p className="text-lg sm:text-xl text-[#FAF8F5]/90 font-cairo leading-relaxed">
            مشاهد توثيقية حية لسماحة الشيخ الدكتور كاظم الحريب، في محراب الصلاة، المنبر الحسيني، مجالس الصلح، وتكريم المبدعين ببلدة المنيزلة.
          </p>
          <div className="w-28 h-[2px] bg-[#D4AF37] mx-auto pt-0" />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-4 py-2.5 text-sm sm:text-base font-bold font-cairo transition-all cursor-pointer rounded-sm border ${
                selectedFilter === tab.id
                  ? 'bg-[#D4AF37] text-[#0F382C] border-[#D4AF37] shadow-md font-extrabold'
                  : 'bg-[#0F382C] hover:bg-white/10 text-[#FAF8F5] border-[#D4AF37]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredPhotos.map((photo: MediaItem) => (
            <div
              key={photo.id}
              id={`gallery-photo-${photo.id}`}
              className="group bg-[#09241C] rounded-sm border border-[#D4AF37]/40 hover:border-[#D4AF37] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Frame */}
              <div
                className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer group/img border-b border-[#D4AF37]/25"
                onClick={() =>
                  onOpenLightbox(
                    photo.url,
                    photo.title,
                    photo.caption,
                    photo.year,
                    photo.tags
                  )
                }
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Overlay with zoom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-4 py-2 rounded-sm bg-[#D4AF37] text-[#0F382C] font-extrabold text-xs sm:text-sm font-cairo flex items-center gap-2 shadow-md">
                    <ZoomIn className="w-4 h-4" />
                    <span>عرض بالكامل</span>
                  </div>
                </div>

                {photo.year && (
                  <div className="absolute top-2 right-2 bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37] px-2.5 py-1 rounded-sm text-xs font-bold font-cairo shadow-sm">
                    {photo.year}
                  </div>
                )}
              </div>

              {/* Caption & Details below photo */}
              <div className="p-5 space-y-2 text-right">
                <h4 className="text-base sm:text-lg font-bold font-cairo text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {photo.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#FAF8F5]/85 font-cairo leading-relaxed line-clamp-2">
                  {photo.caption}
                </p>

                {/* Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {photo.tags.slice(0, 2).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs bg-[#D4AF37]/15 text-[#D4AF37] px-2.5 py-0.5 rounded-sm border border-[#D4AF37]/40 font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
