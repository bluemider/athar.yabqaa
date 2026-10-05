import React, { useState } from 'react';
import { BookPublication } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';
import { Plus, Trash2, Edit3, BookOpen, Check, X, MoveUp, MoveDown, CheckCircle2 } from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminBooksTabProps {
  books: BookPublication[];
  onChange: (updated: BookPublication[]) => void;
}

export const AdminBooksTab: React.FC<AdminBooksTabProps> = ({ books, onChange }) => {
  const { content, saveContent } = useSiteContent();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const [draft, setDraft] = useState<BookPublication>({
    id: '',
    title: '',
    subtitle: '',
    year: '',
    pages: 180,
    author: 'د. كاظم الحريب',
    publisher: 'دار صوت المؤلّف للنشر والتوزيع',
    coverUrl: '',
    coverImage: '',
    summary: '',
    description: '',
    keyTopics: [],
    topics: [],
    price: '35 ر.س',
    externalUrl: '',
    whatsappOrderUrl: 'https://wa.me/c/130069393621219',
    downloadUrl: '',
  });

  const [topicsInput, setTopicsInput] = useState('');

  const startEdit = (index: number) => {
    const b = books[index];
    setEditingIndex(index);
    setIsAddingNew(false);
    const cover = b.coverUrl || b.coverImage || '';
    const desc = b.description || b.summary || '';
    const topicsArr = b.keyTopics || b.topics || [];
    setDraft({
      ...b,
      author: b.author || 'د. كاظم الحريب',
      publisher: b.publisher || 'دار صوت المؤلّف للنشر والتوزيع',
      coverUrl: cover,
      coverImage: cover,
      summary: desc,
      description: desc,
      keyTopics: topicsArr,
      topics: topicsArr,
      price: b.price || '35 ر.س',
      whatsappOrderUrl: b.whatsappOrderUrl || 'https://wa.me/c/130069393621219',
    });
    setTopicsInput(topicsArr.join('\n'));
  };

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingIndex(null);
    const newBook: BookPublication = {
      id: `book-${Date.now()}`,
      title: 'كتاب جديد',
      subtitle: 'دراسة تخصصية أو كتاب توجيهي',
      year: '2025م',
      pages: 180,
      author: 'د. كاظم الحريب',
      publisher: 'دار صوت المؤلّف للنشر والتوزيع',
      coverUrl: '/assets/books/al_life_coaching.png',
      coverImage: '/assets/books/al_life_coaching.png',
      summary: 'نبذة عن موضوع الكتاب ومحاوره الأساسية وأثره المعرفي والإرشادي...',
      description: 'نبذة عن موضوع الكتاب ومحاوره الأساسية وأثره المعرفي والإرشادي...',
      keyTopics: ['المحور الأول: التأصيل المنهجي', 'المحور الثاني: التطبيقات الحياتية'],
      topics: ['المحور الأول: التأصيل المنهجي', 'المحور الثاني: التطبيقات الحياتية'],
      price: '35 ر.س',
      externalUrl: 'https://soutalmulaf.com',
      whatsappOrderUrl: 'https://wa.me/c/130069393621219',
    };
    setDraft(newBook);
    setTopicsInput('المحور الأول: التأصيل المنهجي\nالمحور الثاني: التطبيقات الحياتية');
  };

  const handleSaveDraft = async () => {
    const processedTopics = topicsInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const cover = draft.coverUrl || draft.coverImage || '/assets/books/al_life_coaching.png';
    const desc = draft.description || draft.summary || '';

    const finalized: BookPublication = {
      ...draft,
      coverUrl: cover,
      coverImage: cover,
      author: draft.author || 'د. كاظم الحريب',
      publisher: draft.publisher || 'دار صوت المؤلّف للنشر والتوزيع',
      summary: desc,
      description: desc,
      keyTopics: processedTopics,
      topics: processedTopics,
      year: draft.year || '2025م',
      price: draft.price || '35 ر.س',
      whatsappOrderUrl: draft.whatsappOrderUrl || 'https://wa.me/c/130069393621219',
    };

    let updatedList: BookPublication[];
    if (isAddingNew) {
      updatedList = [...books, finalized];
    } else if (editingIndex !== null) {
      updatedList = [...books];
      updatedList[editingIndex] = finalized;
    } else {
      updatedList = [...books];
    }

    onChange(updatedList);
    setEditingIndex(null);
    setIsAddingNew(false);

    try {
      await saveContent({ books: updatedList }, { silent: true });
      showNotification('تم حفظ بيانات الكتاب وتثبيته بنجاح!');
    } catch {
      showNotification('تم حفظ بيانات الكتاب محلياً');
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكتاب من المكتبة؟')) {
      const updated = books.filter((_, i) => i !== index);
      onChange(updated);
      saveContent({ books: updated }, { silent: true });
      if (editingIndex === index) setEditingIndex(null);
      showNotification('تم حذف الكتاب وتحديث المكتبة بنجاح');
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= books.length) return;
    const updated = [...books];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChange(updated);
    saveContent({ books: updated }, { silent: true });
  };

  return (
    <div className="space-y-6 text-right font-cairo">
      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-900/90 text-white border-2 border-[#D4AF37] p-3.5 rounded-sm shadow-md flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-sm border border-slate-200 gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>إدارة المكتبة الفكرية والمؤلفات ({books.length} مؤلف)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تعديل وإضافة الكتب والدراسات المطبوعة وأغلفة الكتب وفهرس المحتويات.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FirestoreCloudSaveButton
            tabName="المؤلفات والكتب"
            onSaved={showNotification}
            showStatusPill={true}
          />

          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2 bg-[#0F382C] text-[#D4AF37] hover:bg-[#144b3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كتاب جديد</span>
          </button>
        </div>
      </div>

      {/* Form modal/card */}
      {(editingIndex !== null || isAddingNew) && (
        <div className="bg-[#FAF8F5] border-2 border-[#D4AF37] p-6 rounded-sm space-y-5 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-3">
            <h4 className="text-sm font-bold text-[#0F382C]">
              {isAddingNew ? 'إضافة مؤلف أو دراسة جديدة' : `تعديل المؤلف: ${draft.title}`}
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setIsAddingNew(false);
              }}
              className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>إلغاء</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                عنوان الكتاب
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                العنوان الفرعي
              </label>
              <input
                type="text"
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                اسم المؤلف
              </label>
              <input
                type="text"
                value={draft.author || 'د. كاظم الحريب'}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                دار النشر والتوزيع
              </label>
              <input
                type="text"
                value={draft.publisher}
                onChange={(e) => setDraft({ ...draft, publisher: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  سنة النشر
                </label>
                <input
                  type="text"
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  السعر
                </label>
                <input
                  type="text"
                  value={draft.price || '35 ر.س'}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono"
                  placeholder="35 ر.س"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  الصفحات
                </label>
                <input
                  type="number"
                  value={draft.pages}
                  onChange={(e) =>
                    setDraft({ ...draft, pages: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  رابط المتجر الإلكتروني
                </label>
                <input
                  type="url"
                  value={draft.externalUrl || ''}
                  onChange={(e) => setDraft({ ...draft, externalUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono text-xs"
                  placeholder="https://soutalmulaf.com/product/..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  رابط طلب واتساب (دار صوت)
                </label>
                <input
                  type="url"
                  value={draft.whatsappOrderUrl || 'https://wa.me/c/130069393621219'}
                  onChange={(e) => setDraft({ ...draft, whatsappOrderUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono text-xs"
                  placeholder="https://wa.me/c/130069393621219"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <ImageUploadInput
                label="غلاف الكتاب (الصورة)"
                value={draft.coverImage || draft.coverUrl || ''}
                onChange={(url) => setDraft({ ...draft, coverImage: url, coverUrl: url })}
                helperText="ارفع غلاف الكتاب أو حدد مسار الصورة."
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                الملخص والنبذة التعريفية
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value, summary: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                فهرس ومحاور الكتاب (سطر لكل محور)
              </label>
              <textarea
                rows={4}
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder="الفصل الأول: ...&#10;الفصل الثاني: ..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/30">
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setIsAddingNew(false);
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 py-2 bg-[#0F382C] text-white hover:bg-[#154c3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>تأكيد وحفظ الكتاب</span>
            </button>
          </div>
        </div>
      )}

      {/* Books grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((b, idx) => (
          <div
            key={b.id || idx}
            className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#D4AF37] transition-colors"
          >
            <div className="flex gap-3">
              <div className="w-16 h-22 bg-[#FAF8F5] border border-[#D4AF37]/30 rounded-sm overflow-hidden shrink-0 shadow-sm">
                <img
                  src={b.coverUrl || b.coverImage || '/assets/books/al_life_coaching.png'}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/books/al_life_coaching.png';
                  }}
                />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#0F382C] px-1.5 py-0.5 rounded-sm">
                    {b.year || '2025م'}
                  </span>
                  {b.price && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-200">
                      {b.price}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {b.pages ? `${b.pages} صفحة` : ''}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0F382C] line-clamp-1">{b.title}</h4>
                <p className="text-[11px] text-[#854D0E] font-semibold line-clamp-1">{b.subtitle}</p>
                <p className="text-[10px] text-slate-500">{b.publisher}</p>
                <p className="text-xs text-slate-600 line-clamp-2">{b.summary || b.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === books.length - 1}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(idx)}
                  className="text-xs font-bold text-[#0F382C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-[#D4AF37]" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
