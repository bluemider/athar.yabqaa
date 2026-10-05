import React, { useState } from 'react';
import { MediaItem } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';
import { Image as ImageIcon, Plus, Trash2, Edit3, Check, X, CheckCircle2 } from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminGalleryTabProps {
  gallery: MediaItem[];
  onChange: (updated: MediaItem[]) => void;
}

export const AdminGalleryTab: React.FC<AdminGalleryTabProps> = ({ gallery, onChange }) => {
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

  const [draft, setDraft] = useState<MediaItem>({
    id: '',
    title: '',
    url: '',
    type: 'image',
    caption: '',
    dateOrYear: '',
    category: 'portrait',
    tags: [],
  });

  const [tagsInput, setTagsInput] = useState('');

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setIsAddingNew(false);
    setDraft({ ...gallery[index] });
    setTagsInput((gallery[index].tags || []).join('، '));
  };

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingIndex(null);
    setDraft({
      id: `photo-${Date.now()}`,
      title: 'صورة جديدة',
      url: '/assets/sheikh/sheikh_kazim_25.jpg',
      type: 'image',
      caption: 'تعليق توثيقي على الصورة ومناسبتها...',
      dateOrYear: '2020م',
      category: 'portrait',
      tags: ['أرشيف', 'المنيزلة'],
    });
    setTagsInput('أرشيف، المنيزلة');
  };

  const handleSaveDraft = async () => {
    const processedTags = tagsInput
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const finalized: MediaItem = {
      ...draft,
      tags: processedTags,
    };

    let updatedList: MediaItem[];
    if (isAddingNew) {
      updatedList = [...gallery, finalized];
    } else if (editingIndex !== null) {
      updatedList = [...gallery];
      updatedList[editingIndex] = finalized;
    } else {
      updatedList = [...gallery];
    }

    onChange(updatedList);
    setEditingIndex(null);
    setIsAddingNew(false);

    try {
      await saveContent({ gallery: updatedList }, { silent: true });
      showNotification('تم حفظ الصورة في الألبوم وتثبيتها بنجاح!');
    } catch {
      showNotification('تم حفظ الصورة محلياً');
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصورة من المعرض؟')) {
      const updated = gallery.filter((_, i) => i !== index);
      onChange(updated);
      saveContent({ gallery: updated }, { silent: true });
      if (editingIndex === index) setEditingIndex(null);
      showNotification('تم حذف الصورة وتحديث الألبوم بنجاح');
    }
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
            <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>إدارة ألبوم الصور والمحطات الأرشيفية ({gallery.length} صورة)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تعديل وإضافة الصور الأرشيفية مع إمكانية رفع الصور مباشرة من الجهاز وتحديد التصنيفات.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FirestoreCloudSaveButton
            tabName="ألبوم الصور"
            onSaved={showNotification}
            showStatusPill={true}
          />

          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2 bg-[#0F382C] text-[#D4AF37] hover:bg-[#144b3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صورة جديدة</span>
          </button>
        </div>
      </div>

      {/* Form */}
      {(editingIndex !== null || isAddingNew) && (
        <div className="bg-[#FAF8F5] border-2 border-[#D4AF37] p-6 rounded-sm space-y-5 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-3">
            <h4 className="text-sm font-bold text-[#0F382C]">
              {isAddingNew ? 'إضافة صورة أرشيفية جديدة' : `تعديل الصورة: ${draft.title}`}
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
                عنوان الصورة
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
                التصنيف
              </label>
              <select
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as any })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
              >
                <option value="portrait">صور شخصية ورسمية (Portrait)</option>
                <option value="pulpit">المنبر والمحراب (Pulpit)</option>
                <option value="mosque">المسجد والجماعة (Mosque)</option>
                <option value="community">المجتمع والمنيزلة (Community)</option>
                <option value="academic">المجالس والفعاليات العلمية (Academic)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                السنة / التاريخ
              </label>
              <input
                type="text"
                value={draft.dateOrYear || ''}
                onChange={(e) => setDraft({ ...draft, dateOrYear: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                الوسوم (افصل بينها بفاصلة)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <ImageUploadInput
                label="الصورة"
                value={draft.url}
                onChange={(url) => setDraft({ ...draft, url })}
                helperText="يمكنك رفع صورة من جهازك أو وضع مسارها."
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                التعليق والسياق التوثيقي
              </label>
              <textarea
                rows={3}
                value={draft.caption || ''}
                onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
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
              <span>تأكيد وحفظ الصورة</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {gallery.map((photo, idx) => (
          <div
            key={photo.id || idx}
            className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-xs hover:border-[#D4AF37] transition-all group flex flex-col justify-between"
          >
            <div className="aspect-square bg-slate-100 overflow-hidden relative">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/sheikh/sheikh_kazim_01.jpg';
                }}
              />
              <span className="absolute top-1 right-1 bg-black/70 text-[#D4AF37] text-[9px] px-1 rounded-xs font-mono">
                {photo.dateOrYear || ''}
              </span>
            </div>

            <div className="p-2 space-y-1">
              <h5 className="text-xs font-bold text-[#0F382C] truncate">{photo.title}</h5>
              <p className="text-[10px] text-slate-500 line-clamp-1">{photo.caption}</p>
              
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => startEdit(idx)}
                  className="text-[11px] font-bold text-[#0F382C] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-[#D4AF37]" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
