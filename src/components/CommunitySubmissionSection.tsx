import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Send,
  HeartHandshake,
  User,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Clock,
  Film,
} from 'lucide-react';
import { SectionNavigationHeader } from './SectionNavigationHeader';
import { CommunitySubmission } from '../types';
import { useFirebase } from '../context/FirebaseContext';

interface CommunitySubmissionSectionProps {
  onOpenLightbox: (imageUrl: string, title: string, caption?: string) => void;
}

const DEFAULT_COMMUNITY_MEMORIES: CommunitySubmission[] = [
  {
    id: 'sub-1',
    authorName: 'الحاج علي بن حسين العيسى',
    relationship: 'من وجهاء بلدة المنيزلة ورفيق دربه في العمل الاجتماعي',
    message: 'رحم الله شيخنا الجليل أبا محمد، كان سداً منيعاً للخلافات، لا يهدأ له بال إذا سمع بخصومة بين اثنين حتى يجمع بينهما في منزله أو في المسجد بابتسامته المعهودة وقلبه النقي، حتى يعود الصفاء والتآخي. كان رمزاً حقيقياً للعطاء ونبضاً لبلدتنا.',
    mediaUrl: '/assets/sheikh/sheikh_kazim_04.jpg',
    mediaType: 'image',
    status: 'approved',
    createdAt: '2026-08-15T14:20:00.000Z',
    approvedAt: '2026-08-16T10:00:00.000Z',
  },
  {
    id: 'sub-2',
    authorName: 'الأستاذ حسن العبدالله',
    relationship: 'عضو لجنة مهرجان الإبداع والتطوير',
    message: 'كان الدكتور كاظم يؤمن بطاقات الشباب وبأن التميز العلمي والأكاديمي هو بوابة المستقبل. في كل عام في مهرجان التفوق، كان يحرص على مصافحة كل طالب متفوق وتوجيه كلمة خاصة له تُشعل فيه روح الطموح والمسؤولية تجاه مجتمعه.',
    mediaUrl: '/assets/sheikh/sheikh_kazim_15.jpg',
    mediaType: 'image',
    status: 'approved',
    createdAt: '2026-08-20T18:45:00.000Z',
    approvedAt: '2026-08-21T09:30:00.000Z',
  },
  {
    id: 'sub-3',
    authorName: 'محمد جاسم الحريب',
    relationship: 'من رواد مسجد الإمام الجواد (ع)',
    message: 'صوته الخاشع في دعاء كميل وصلاة الجماعة في مسجد الإمام الجواد يتردد في آذاننا دائماً. كان يجمع بين الفقه الرصين والعقلانية المعاصرة في خطبه، ولم يكن منبره مجرد وعظ بل كان مدرسة لتطوير الذات والتسامح الأسري.',
    mediaUrl: '/assets/sheikh/sheikh_kazim_03.jpg',
    mediaType: 'image',
    status: 'approved',
    createdAt: '2026-08-25T11:15:00.000Z',
    approvedAt: '2026-08-26T08:00:00.000Z',
  },
];

export const CommunitySubmissionSection: React.FC<CommunitySubmissionSectionProps> = ({
  onOpenLightbox,
}) => {
  const { submitMemoryToFirestore, subscribeToApprovedSubmissions } = useFirebase();
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>(() => {
    try {
      const cached = localStorage.getItem('cached_approved_memories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_COMMUNITY_MEMORIES;
  });
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  // Form states
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch approved submissions with Firestore real-time listener & graceful fallback
  const fetchApproved = async (retryCount = 0) => {
    setIsLoadingArchive(true);
    try {
      const res = await fetch('/api/published-archive');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.submissions) && data.submissions.length > 0) {
          setSubmissions(data.submissions);
          try {
            localStorage.setItem('cached_approved_memories', JSON.stringify(data.submissions));
          } catch {}
        }
      }
    } catch {
      // Fallback gracefully to cache or defaults without logging uncaught error
      try {
        const cached = localStorage.getItem('cached_approved_memories');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSubmissions(parsed);
          }
        }
      } catch {}
      if (retryCount < 2) {
        setTimeout(() => fetchApproved(retryCount + 1), 2500);
      }
    } finally {
      setIsLoadingArchive(false);
    }
  };

  useEffect(() => {
    fetchApproved();

    // Subscribe to real-time Firestore updates for approved submissions
    const unsubscribe = subscribeToApprovedSubmissions((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setSubmissions(liveItems);
        setIsLoadingArchive(false);
      }
    });

    return () => unsubscribe();
  }, [subscribeToApprovedSubmissions]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (up to 30MB)
    if (file.size > 30 * 1024 * 1024) {
      setSubmitErrorMessage('حجم الملف المرفق يتجاوز 30 ميغابايت. يرجى اختيار ملف أصغر.');
      return;
    }

    setSelectedFile(file);
    setSubmitErrorMessage(null);

    const isVideo = file.type.startsWith('video');
    setFileType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) {
      setSubmitErrorMessage('يرجى كتابة اسمك ونص الذكرى أو الرسالة لإتمام المشاركة.');
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage(null);
    setSubmitSuccessMessage(null);

    try {
      const payload = {
        authorName: authorName.trim(),
        relationship: relationship.trim() || 'أحد محبي وعارفي الشيخ',
        message: message.trim(),
        mediaUrl: filePreviewUrl || undefined,
        mediaType: fileType,
      };

      // 1. Submit directly to Google Cloud Firestore
      let firestoreSuccess = false;
      try {
        const fsResult = await submitMemoryToFirestore(payload);
        if (fsResult.success) {
          firestoreSuccess = true;
        }
      } catch (fsErr) {
        console.warn('Firestore submission notice:', fsErr);
      }

      // 2. Also send to server API
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if ((res.ok && data.success) || firestoreSuccess) {
        setSubmitSuccessMessage(
          'تم استلام مشاركتكم الكريمة بنجاح وحفظها في قاعدة بيانات المنصة! ستظهر في جدار الأثر فور مراجعتها واعتمادها من قبل إدارة المنصة.'
        );
        // Reset form
        setAuthorName('');
        setRelationship('');
        setMessage('');
        handleRemoveFile();
      } else {
        setSubmitErrorMessage(data.message || 'حدث خطأ أثناء إرسال المشاركة. يرجى المحاولة لاحقاً.');
      }
    } catch (err: any) {
      setSubmitErrorMessage('تعذر إرسال المشاركة: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="submissions" className="py-20 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Integrated Section Navigation & Back Button */}
        <SectionNavigationHeader
          parentName="التوثيق والمشاركة"
          currentName="دفتر الذكريات وشاركنا أثرك"
          theme="light"
          showLibraryLinks={false}
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F382C]/10 text-[#0F382C] text-sm font-bold font-cairo border border-[#D4AF37] rounded-sm shadow-sm">
            <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
            <span>المشاركة المجتمعية وأثر الذكرى</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-cairo text-[#0F382C] flex items-center justify-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
            <span>شاركنا أثرك وذكرياتك مع الشيخ</span>
            <span className="w-10 h-[2px] bg-[#D4AF37] hidden sm:inline-block"></span>
          </h2>
          <p className="text-lg sm:text-xl text-[#1E293B] font-cairo leading-relaxed">
            دعوة مفتوحة لأهالي المنيزلة والأحساء وكل محبي وتلامذة سماحة الشيخ الدكتور كاظم الحريب لتدوين ذكرياتهم، مواقفهم، وإرفاق صورهم ووثائقهم لتخليدها في هذا الأرشيف الرقمي المبارك.
          </p>
          <div className="w-28 h-[2px] bg-[#D4AF37] mx-auto pt-0" />
        </div>

        {/* Two Columns Layout: Form on Left, Approved Wall on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Submission Form Column */}
          <div className="lg:col-span-5 bg-white rounded-sm p-7 sm:p-9 border border-[#D4AF37]/50 shadow-lg space-y-6 text-right">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold font-cairo text-[#0F382C] flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>نموذج إرسال ذكرى أو وثيقة</span>
              </h3>
              <p className="text-sm sm:text-base text-[#1E293B]/80 font-cairo mt-1.5 leading-relaxed">
                تُعرض المشاركات وتُخلد في المنصة بعد تدقيقها ومراجعتها.
              </p>
            </div>

            {submitSuccessMessage && (
              <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm sm:text-base font-cairo flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{submitSuccessMessage}</p>
              </div>
            )}

            {submitErrorMessage && (
              <div className="p-4 rounded-sm bg-red-50 border border-red-300 text-red-900 text-sm sm:text-base font-cairo flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{submitErrorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Author Name */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-[#0F382C] font-cairo mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="اكتب اسمك الكريم هنا"
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none text-base sm:text-lg font-cairo text-right transition-all"
                  />
                  <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Relationship or Title */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-[#0F382C] font-cairo mb-2">
                  صفتك أو علاقتك بالشيخ <span className="text-gray-400 font-normal text-xs sm:text-sm">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="صفتك أو صلة المعرفة (اختياري)"
                  className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none text-base sm:text-lg font-cairo text-right transition-all"
                />
              </div>

              {/* Memory / Message */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-[#0F382C] font-cairo mb-2">
                  نص الذكرى أو الكلمة التأبينية <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب هنا ما يفيض به خاطرك من ذكرى طيبة لسماحة الشيخ، أو موقف شخصي، أو كلمة وفاء، أو دعاء مخلص لروحه الطاهرة..."
                  className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none text-base sm:text-lg font-cairo text-right leading-relaxed resize-y transition-all"
                />
              </div>

              {/* DIRECT FILE UPLOADER WITH INSTANT PREVIEW */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-[#0F382C] font-cairo mb-2">
                  إرفاق صورة أو تسجيل من جهازك <span className="text-gray-400 font-normal text-xs sm:text-sm">(اختياري)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="direct-file-input"
                />

                {!filePreviewUrl ? (
                  <label
                    htmlFor="direct-file-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-sm bg-[#FAF8F5] cursor-pointer transition-colors group text-center"
                  >
                    <div className="w-12 h-12 rounded-sm bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 shadow-sm">
                      <UploadCloud className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <span className="text-sm sm:text-base font-bold font-cairo text-[#0F382C]">
                      انقر لاختيار صورة أو مقطع من هاتفك أو جهازك
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 font-cairo mt-1">
                      يدعم الصور (JPG, PNG) ومقاطع الفيديو القصيرة حتى 30MB
                    </span>
                  </label>
                ) : (
                  <div className="relative rounded-sm overflow-hidden border-2 border-[#D4AF37] bg-black shadow-md">
                    {fileType === 'video' ? (
                      <video
                        src={filePreviewUrl}
                        controls
                        className="w-full max-h-56 object-contain mx-auto"
                      />
                    ) : (
                      <img
                        src={filePreviewUrl}
                        alt="معاينة الملف المرفق"
                        className="w-full max-h-56 object-contain mx-auto"
                      />
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2.5 left-2.5 p-2 rounded-sm bg-red-700 hover:bg-red-800 text-white shadow-lg transition-colors cursor-pointer"
                      title="إلغاء الملف المرفق"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="p-2.5 bg-[#09241C] text-white text-xs sm:text-sm font-cairo flex items-center justify-between px-4">
                      <span className="line-clamp-1">{selectedFile?.name}</span>
                      <span className="text-[#D4AF37] font-semibold">
                        {(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0')} MB
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-sm bg-[#0F382C] hover:bg-[#164e3e] text-[#D4AF37] font-extrabold font-cairo text-base sm:text-lg border-2 border-[#D4AF37] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
                    <span>جارٍ الإرسال إلى الأرشيف...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#D4AF37] -scale-x-100" />
                    <span>إرسال المشاركة للأرشيف المبارك</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Wall of Approved Community Tributes */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold font-cairo text-[#0F382C] flex items-center gap-2.5">
                  <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
                  <span>جدار الوفاء والأثر المجتمعي</span>
                </h3>
                <p className="text-sm sm:text-base text-[#1E293B]/80 font-cairo mt-1">
                  مشاركات وذكريات معتمدة من أبناء وأهالي بلدة المنيزلة ومحبي الشيخ.
                </p>
              </div>
              <button
                onClick={fetchApproved}
                className="text-sm font-bold text-[#0F382C] hover:text-[#D4AF37] font-cairo px-4 py-2 rounded-sm border border-[#D4AF37] bg-white cursor-pointer shadow-sm hover:shadow transition-all"
              >
                تحديث
              </button>
            </div>

            {isLoadingArchive ? (
              <div className="p-12 text-center text-gray-500 font-cairo">
                <span className="w-7 h-7 rounded-full border-2 border-[#0F382C] border-t-transparent animate-spin inline-block mb-3" />
                <p className="text-base font-semibold">جارٍ تحميل المشاركات المجتمعية المعتمدة...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-sm border border-dashed border-[#D4AF37]/60 text-gray-600 font-cairo space-y-2">
                <HeartHandshake className="w-10 h-10 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-lg font-bold text-[#0F382C]">كن أول من يشارك أثره وذكرياته</p>
                <p className="text-sm sm:text-base text-gray-600">
                  املأ النموذج لإضافة أول ذكرى مباركة لسماحة الشيخ.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {submissions.map((item: CommunitySubmission) => (
                  <div
                    key={item.id}
                    id={`community-item-${item.id}`}
                    className="bg-white rounded-sm p-6 sm:p-7 border-r-4 border-r-[#D4AF37] border-y border-l border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 text-right"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37] flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg sm:text-xl font-bold font-cairo text-[#0F382C]">
                            {item.authorName}
                          </h4>
                          {item.relationship && (
                            <span className="text-sm sm:text-base text-[#854D0E] font-semibold font-cairo">
                              {item.relationship}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm text-gray-500 font-cairo flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>

                    {/* Text */}
                    <p className="text-base sm:text-lg text-[#1E293B] font-cairo leading-loose pt-1 whitespace-pre-line">
                      {item.message}
                    </p>

                    {/* Attached Media */}
                    {item.mediaUrl && (
                      <div className="pt-2">
                        {item.mediaType === 'video' ? (
                          <div className="relative aspect-video rounded-sm overflow-hidden border border-[#D4AF37]/40 bg-black">
                            <video
                              src={item.mediaUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className="relative max-w-sm rounded-sm overflow-hidden border-2 border-[#D4AF37]/60 shadow-sm cursor-pointer group"
                            onClick={() =>
                              onOpenLightbox(
                                item.mediaUrl!,
                                `مشاركة من: ${item.authorName}`,
                                item.message
                              )
                            }
                          >
                            <img
                              src={item.mediaUrl}
                              alt={item.authorName}
                              className="w-full max-h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold font-cairo gap-1.5">
                              <span>تكبير الصورة المرفقة</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
