import React, { useState } from 'react';
import { Film, Play, ExternalLink, Sparkles, Clock, X } from 'lucide-react';
import { SectionNavigationHeader } from './SectionNavigationHeader';
import { VIDEO_ARCHIVES } from '../data/archiveData';
import { VideoArchive } from '../types';
import { useSiteContent } from '../context/SiteContentContext';

interface VideoSectionProps {
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  activeVideoId,
  setActiveVideoId,
}) => {
  const { content } = useSiteContent();
  const videosList = content?.videos && content.videos.length > 0
    ? content.videos
    : VIDEO_ARCHIVES;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: `كافة التسجيلات المرئية (${videosList.length})` },
    { id: 'speech', label: 'توجيهات كاظمية ومنبرية' },
    { id: 'prayer', label: 'دعاء ومناجاة خاشعة' },
    { id: 'documentary', label: 'أفلام وثائقية ومراثي' },
    { id: 'social', label: 'رسائل وتلاحم مجتمعي' },
  ];

  const filteredVideos = videosList.filter((v) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'documentary') return v.category === 'documentary' || v.category === 'mercy';
    return v.category === selectedCategory;
  });

  return (
    <section id="videos" className="py-20 bg-[#09241C] text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Integrated Section Navigation & Back Button */}
        <SectionNavigationHeader
          parentName="مكتبة أثر"
          currentName="المكتبة المرئية والتسجيلات"
          theme="dark"
          showLibraryLinks={true}
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/20 text-[#FAF8F5] text-sm font-bold font-cairo border border-[#D4AF37] rounded-sm shadow-sm">
            <Film className="w-4 h-4 text-[#D4AF37]" />
            <span>المكتبة المرئية وقناة أثر يبقى</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-cairo text-white flex items-center justify-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
            <span>المكتبة المرئية والتسجيلات الخالدة</span>
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
          </h2>
          <p className="text-lg sm:text-xl text-[#FAF8F5]/90 font-cairo leading-relaxed">
            محاضرات، خطب المنبر الحسيني، أدعية بصوت سماحة الشيخ، والفيلم الوثائقي «رحيل الأمل» المستخرجة مباشرة من القناة الرسمية.
          </p>
          <div className="w-28 h-[2px] bg-[#D4AF37] mx-auto pt-0" />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 text-sm sm:text-base font-bold font-cairo transition-all cursor-pointer rounded-sm border ${
                selectedCategory === cat.id
                  ? 'bg-[#D4AF37] text-[#0F382C] border-[#D4AF37] shadow-md font-extrabold'
                  : 'bg-[#0F382C] hover:bg-white/10 text-[#FAF8F5] border-[#D4AF37]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredVideos.map((video: VideoArchive) => (
            <div
              key={video.id}
              id={`video-card-${video.id}`}
              className="bg-[#0F382C] rounded-sm border border-[#D4AF37]/40 hover:border-[#D4AF37] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Video Thumbnail with Play Button */}
              <div
                className="relative aspect-video bg-black overflow-hidden cursor-pointer border-b border-[#D4AF37]/25"
                onClick={() => setActiveVideoId(video.youtubeId)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F382C] via-transparent to-black/40" />

                {/* Big Center Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-700 hover:bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 border-white/40">
                    <Play className="w-6 h-6 fill-current mr-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-sm bg-black/80 border border-[#D4AF37]/40 text-xs text-[#D4AF37] font-mono">
                  يوتيوب مباشر
                </div>
              </div>

              {/* Video Metadata */}
              <div className="p-6 space-y-3.5 flex-1 flex flex-col justify-between text-right">
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold font-cairo text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#FAF8F5]/85 font-cairo line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setActiveVideoId(video.youtubeId)}
                    className="text-xs sm:text-sm font-bold text-[#D4AF37] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>تشغيل في المنصة</span>
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-[#FAF8F5]/70 hover:text-white flex items-center gap-1"
                  >
                    <span>فتح في YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Channel Promotion Strip */}
        <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0F382C] to-red-950/40 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="space-y-1">
            <h4 className="text-lg font-bold font-cairo text-white flex items-center gap-2 justify-center sm:justify-start">
              <Film className="w-5 h-5 text-red-400" />
              <span>قناة «أثر يبقى» الرسمية على يوتيوب</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#FAF8F5]/80 font-cairo">
              اشترك في القناة لمتابعة كافة المجالس، الخطب، والوثائقيات الأرشيفية لسماحة الشيخ كاظم الحريب.
            </p>
          </div>

          <a
            href={content?.general?.youtubeChannelUrl || "https://www.youtube.com/@athar.yabqaa313"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm font-cairo transition-all shadow-lg flex items-center gap-2 shrink-0"
          >
            <span>زيارة القناة والاشتراك</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Embedded Video Modal */}
      {activeVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveVideoId(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl border-2 border-[#D4AF37] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 bg-[#0F382C] border-b border-[#D4AF37]/40 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold font-cairo text-[#D4AF37]">
                  مشغل المرئيات المباشر
                </span>
              </div>
              <button
                onClick={() => setActiveVideoId(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* IFrame player */}
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                title="مشغل الفيديو"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
