import React, { useState } from 'react';
import { VideoArchive } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';
import { Film, Plus, Trash2, Edit3, Play, Check, X, MoveUp, MoveDown, CheckCircle2 } from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminVideosTabProps {
  videos: VideoArchive[];
  onChange: (updated: VideoArchive[]) => void;
}

export const AdminVideosTab: React.FC<AdminVideosTabProps> = ({ videos, onChange }) => {
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

  const [draft, setDraft] = useState<VideoArchive>({
    id: '',
    title: '',
    youtubeId: '',
    duration: '',
    category: 'speech',
    description: '',
    date: '',
  });

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setIsAddingNew(false);
    setDraft({ ...videos[index] });
  };

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingIndex(null);
    setDraft({
      id: `vid-${Date.now()}`,
      title: 'تسجيل مرئي جديد',
      youtubeId: '',
      duration: '15:00',
      category: 'speech',
      description: 'وصف مختصر لمحاضرة أو دعاء أو وثائقي...',
      date: '2021م',
    });
  };

  // Helper to extract youtube ID if user pastes a full URL
  const handleYoutubeInput = (val: string) => {
    let cleanId = val.trim();
    if (cleanId.includes('v=')) {
      cleanId = cleanId.split('v=')[1]?.split('&')[0] || cleanId;
    } else if (cleanId.includes('youtu.be/')) {
      cleanId = cleanId.split('youtu.be/')[1]?.split('?')[0] || cleanId;
    } else if (cleanId.includes('embed/')) {
      cleanId = cleanId.split('embed/')[1]?.split('?')[0] || cleanId;
    }
    setDraft({ ...draft, youtubeId: cleanId });
  };

  const handleSaveDraft = async () => {
    if (!draft.youtubeId) {
      alert('يرجى إدخال معرف يوتيوب أو رابط الفيديو');
      return;
    }

    let updatedList: VideoArchive[];
    if (isAddingNew) {
      updatedList = [...videos, draft];
    } else if (editingIndex !== null) {
      updatedList = [...videos];
      updatedList[editingIndex] = draft;
    } else {
      updatedList = [...videos];
    }

    onChange(updatedList);
    setEditingIndex(null);
    setIsAddingNew(false);

    try {
      await saveContent({ videos: updatedList }, { silent: true });
      showNotification('تم حفظ التسجيل المرئي وتثبيته بنجاح!');
    } catch {
      showNotification('تم حفظ التسجيل المرئي محلياً');
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التسجيل؟')) {
      const updated = videos.filter((_, i) => i !== index);
      onChange(updated);
      saveContent({ videos: updated }, { silent: true });
      if (editingIndex === index) setEditingIndex(null);
      showNotification('تم حذف التسجيل وتحديث المكتبة المرئية بنجاح');
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= videos.length) return;
    const updated = [...videos];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChange(updated);
    saveContent({ videos: updated }, { silent: true });
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
            <Film className="w-4 h-4 text-[#D4AF37]" />
            <span>إدارة المكتبة المرئية وقناة «أثر يبقى» ({videos.length} تسجيل)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تعديل وإضافة تسجيلات اليوتيوب والمحاضرات والدعاء والأفلام الوثائقية.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FirestoreCloudSaveButton
            tabName="المكتبة المرئية"
            onSaved={showNotification}
            showStatusPill={true}
          />

          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2 bg-[#0F382C] text-[#D4AF37] hover:bg-[#144b3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فيديو جديد</span>
          </button>
        </div>
      </div>

      {/* Form */}
      {(editingIndex !== null || isAddingNew) && (
        <div className="bg-[#FAF8F5] border-2 border-[#D4AF37] p-6 rounded-sm space-y-5 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-3">
            <h4 className="text-sm font-bold text-[#0F382C]">
              {isAddingNew ? 'إضافة فيديو جديد' : `تعديل الفيديو: ${draft.title}`}
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
                عنوان التسجيل المرئي
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
                <option value="speech">توجيهات ومنبرية (Speech)</option>
                <option value="prayer">دعاء ومناجاة (Prayer)</option>
                <option value="documentary">أفلام وثائقية ومراثي (Documentary)</option>
                <option value="social">رسائل وتلاحم مجتمعي (Social)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                معرف يوتيوب (YouTube ID أو رابط كامل)
              </label>
              <input
                type="text"
                value={draft.youtubeId}
                onChange={(e) => handleYoutubeInput(e.target.value)}
                placeholder="p0atEekmf7c أو https://youtu.be/..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono text-left dir-ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  المدة (مثل: 24:15)
                </label>
                <input
                  type="text"
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono text-left dir-ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  السنة / التاريخ
                </label>
                <input
                  type="text"
                  value={draft.date || ''}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <ImageUploadInput
                label="صورة الغلاف المصغرة للفيديو (اختياري)"
                value={draft.thumbnailUrl || (draft.youtubeId ? `https://img.youtube.com/vi/${draft.youtubeId}/hqdefault.jpg` : '')}
                onChange={(url) => setDraft({ ...draft, thumbnailUrl: url })}
                placeholder="https://img.youtube.com/... أو /assets/... أو رفع صورة"
                helperText="يمكنك رفع صورة مخصصة من جهازك لتكون غلافاً للفيديو بدلاً من غلاف يوتيوب الافتراضي."
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                الوصف والمحتوى
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
              <span>تأكيد وحفظ الفيديو</span>
            </button>
          </div>
        </div>
      )}

      {/* Videos list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((vid, idx) => (
          <div
            key={vid.id || idx}
            className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex gap-4 hover:border-[#D4AF37] transition-colors"
          >
            {/* YouTube thumb */}
            <div className="w-28 aspect-video bg-slate-900 rounded-sm overflow-hidden relative shrink-0">
              <img
                src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                alt={vid.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/sheikh/sheikh_kazim_01.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded-xs font-mono">
                {vid.duration}
              </span>
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-bold text-[#0F382C] line-clamp-1">{vid.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{vid.description}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {vid.date || vid.category}
                </span>
                <div className="flex items-center gap-2">
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
                    disabled={idx === videos.length - 1}
                    className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
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
          </div>
        ))}
      </div>
    </div>
  );
};
