import React from 'react';
import { Quote, HeartHandshake, User } from 'lucide-react';
import { SectionNavigationHeader } from './SectionNavigationHeader';
import { TESTIMONIALS } from '../data/archiveData';
import { TestimonialItem } from '../types';
import { useSiteContent } from '../context/SiteContentContext';

export const TestimonialsSection: React.FC = () => {
  const { content } = useSiteContent();
  const testimonialsList = content?.testimonials && content.testimonials.length > 0
    ? content.testimonials
    : TESTIMONIALS;

  return (
    <section id="testimonials" className="py-20 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Integrated Section Navigation & Back Button */}
        <SectionNavigationHeader
          parentName="مكتبة أثر"
          currentName="قالوا عن الشيخ"
          theme="light"
          showLibraryLinks={true}
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F382C]/10 text-[#0F382C] text-sm font-bold font-cairo border border-[#D4AF37] rounded-sm shadow-sm">
            <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
            <span>شهادات العلماء والوجهاء والأهالي</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-cairo text-[#0F382C] flex items-center justify-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
            <span>ماذا قالوا عن الشيخ الدكتور كاظم الحريب</span>
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
          </h2>
          <p className="text-lg sm:text-xl text-[#1E293B] font-cairo leading-relaxed">
            كلمات وشهادات تأبينية صادقة من كبار علماء الدين ووجهاء بلدة المنيزلة والأحساء، تشهد بفضله وإخلاصه وبصماته الخالدة في النفوس.
          </p>
          <div className="w-28 h-[2px] bg-[#D4AF37] mx-auto pt-0" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonialsList.map((t: TestimonialItem) => (
            <div
              key={t.id}
              id={`testimonial-${t.id}`}
              className="bg-white rounded-sm border-r-4 border-r-[#D4AF37] border-y border-l border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
            >
              {/* Quote Icon corner */}
              <div className="absolute top-5 left-5 text-[#D4AF37]/20 group-hover:text-[#D4AF37]/40 transition-colors">
                <Quote className="w-9 h-9 rotate-180" />
              </div>

              {/* Quote Text */}
              <div className="relative z-10 space-y-4 text-right">
                <p className="text-base sm:text-lg text-[#1E293B] font-amiri font-bold leading-relaxed pt-2">
                  «{t.quote}»
                </p>

                {t.dateOrEvent && (
                  <div className="pt-1">
                    <span className="text-xs font-bold text-[#D4AF37] bg-[#0F382C] px-3 py-1 rounded-sm uppercase tracking-wider inline-block font-cairo shadow-sm">
                      {t.dateOrEvent}
                    </span>
                  </div>
                )}
              </div>

              {/* Speaker Metadata */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center gap-3.5 text-right">
                <div className="w-12 h-12 rounded-full bg-[#0F382C] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-bold font-cairo text-[#0F382C] line-clamp-1">
                    {t.speakerName || t.author}
                  </h4>
                  <p className="text-sm text-[#854D0E] font-semibold font-cairo line-clamp-1">
                    {t.speakerTitle || t.role}
                  </p>
                  <p className="text-xs text-[#1E293B]/70 font-cairo mt-0.5 truncate">
                    {t.association || t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
