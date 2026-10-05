import React from 'react';
import {
  Home,
  Scroll,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  Flame,
  BookOpen,
  ZoomIn,
  CheckCircle2,
} from 'lucide-react';
import { TIMELINE_MILESTONES } from '../data/archiveData';
import { TimelineMilestone } from '../types';
import { useSiteContent } from '../context/SiteContentContext';
import { MilestonePhotoCarousel } from './MilestonePhotoCarousel';
import { SectionNavigationHeader } from './SectionNavigationHeader';

interface TimelineSectionProps {
  onOpenLightbox: (imageUrl: string, title: string, caption?: string) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  onOpenLightbox,
}) => {
  const { content } = useSiteContent();
  const milestones = content?.timeline && content.timeline.length > 0
    ? content.timeline
    : TIMELINE_MILESTONES;
  const getMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-5 h-5 text-[#0F382C]" />;
      case 'Scroll':
        return <Scroll className="w-5 h-5 text-[#0F382C]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-[#0F382C]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#0F382C]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-[#0F382C]" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-[#0F382C]" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-[#0F382C]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#0F382C]" />;
    }
  };

  return (
    <section id="timeline" className="py-20 bg-[#FAF8F5] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F382C]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Integrated Section Navigation & Back Button */}
        <SectionNavigationHeader
          parentName="السيرة والمحطات"
          currentName="السيرة المصورة والخط الزمني"
          theme="light"
          showLibraryLinks={false}
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F382C]/10 text-[#0F382C] text-sm font-bold font-cairo border border-[#D4AF37] rounded-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>السيرة الذاتية التوثيقية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-cairo text-[#0F382C] flex items-center justify-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
            <span>المسيرة المباركة والخط الزمني المصور</span>
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
          </h2>
          <p className="text-lg sm:text-xl text-[#1E293B] font-cairo leading-relaxed">
            محطات مضيئة في حياة سماحة الشيخ الدكتور كاظم ياسين الحريب، توثق تحصيله العلمي، ريادته المجتمعية، وأثره الخالد في بلدة المنيزلة والأحساء.
          </p>
          <div className="w-28 h-[2px] bg-[#D4AF37] mx-auto pt-0" />
        </div>

        {/* Vertical Timeline Tree */}
        <div className="relative">
          {/* Central vertical line */}
          <div className="hidden lg:block absolute right-1/2 translate-x-1/2 top-4 bottom-4 w-[2px] bg-[#D4AF37]" />
          {/* Mobile vertical line */}
          <div className="lg:hidden absolute right-6 top-4 bottom-4 w-[2px] bg-[#D4AF37]" />

          <div className="space-y-12 lg:space-y-16">
            {milestones.map((milestone: TimelineMilestone, index: number) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={milestone.id}
                  id={`milestone-${milestone.id}`}
                  className="relative flex flex-col lg:flex-row items-stretch lg:items-center group"
                >
                  {/* Timeline Badge Node (Center on desktop, right side on mobile) */}
                  <div className="absolute right-3.5 lg:right-1/2 lg:translate-x-1/2 top-0 lg:top-1/2 lg:-translate-y-1/2 z-20 w-9 h-9 lg:w-10 lg:h-10 rounded-sm bg-[#D4AF37] border-2 border-[#0F382C] shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-sm font-black text-[#0F382C] font-cairo">
                      {index + 1}
                    </span>
                  </div>

                  {/* Content Container */}
                  <div
                    className={`w-full lg:w-1/2 pr-14 lg:pr-0 ${
                      isEven ? 'lg:pr-12 lg:text-right' : 'lg:pl-12 lg:mr-auto lg:text-right'
                    }`}
                  >
                    <div className="bg-white rounded-sm p-6 sm:p-8 border border-[#D4AF37]/50 shadow-md hover:shadow-xl hover:border-[#D4AF37] transition-all space-y-5">
                      
                      {/* Milestone Period Tag */}
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-3">
                        <span className="px-4 py-1.5 bg-[#0F382C] text-[#D4AF37] text-xs sm:text-sm font-bold font-cairo rounded-sm flex items-center gap-2 shadow-sm">
                          <span className="w-2 h-2 bg-[#D4AF37] inline-block rounded-full" />
                          {milestone.period}
                        </span>
                        <div className="p-2.5 bg-[#FAF8F5] border border-[#D4AF37]/40 shadow-sm rounded-sm">
                          {getMilestoneIcon(milestone.iconName)}
                        </div>
                      </div>

                      {/* Titles */}
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold font-cairo text-[#0F382C] leading-snug">
                          {milestone.title}
                        </h3>
                        <p className="text-base sm:text-lg font-semibold text-[#854D0E] font-cairo mt-1">
                          {milestone.subtitle}
                        </p>
                      </div>

                      {/* MULTI-PHOTO SLIDER WITH 5-SECOND AUTO-PLAY & MANUAL BUTTONS */}
                      <MilestonePhotoCarousel
                        milestoneId={milestone.id}
                        title={milestone.title}
                        images={milestone.images}
                        defaultImage={milestone.mediaUrl || milestone.imageUrl || '/assets/sheikh/sheikh_kazim_01.jpg'}
                        caption={milestone.mediaCaption || milestone.subtitle || milestone.title}
                        onOpenLightbox={onOpenLightbox}
                      />

                      {/* Description Text */}
                      <p className="text-base sm:text-lg text-[#1E293B] font-cairo leading-relaxed">
                        {milestone.description}
                      </p>

                      {/* Key Highlights */}
                      <div className="space-y-2.5 pt-3 border-t border-gray-100">
                        {milestone.highlights.map((item, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base font-medium text-[#1E293B] font-cairo">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
