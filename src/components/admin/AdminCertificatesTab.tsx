import React, { useState } from 'react';
import { AcademicCertificate } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';
import {
  Plus,
  Trash2,
  Edit3,
  Award,
  Check,
  X,
  MoveUp,
  MoveDown,
  CheckCircle2,
  GraduationCap,
  Scroll,
  ShieldCheck,
} from 'lucide-react';
import { FirestoreCloudSaveButton } from './FirestoreCloudSaveButton';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminCertificatesTabProps {
  certificates: AcademicCertificate[];
  onChange: (updated: AcademicCertificate[]) => void;
}

export const AdminCertificatesTab: React.FC<AdminCertificatesTabProps> = ({
  certificates,
  onChange,
}) => {
  const { saveContent } = useSiteContent();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'reference'>('all');

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const [draft, setDraft] = useState<AcademicCertificate>({
    id: '',
    title: '',
    type: 'academic',
    category: 'doctorate',
    institution: '',
    issuer: '',
    year: '',
    code: '',
    imageUrl: '',
    description: '',
    verificationTags: [],
  });

  const [tagsInput, setTagsInput] = useState('');

  const startEdit = (index: number) => {
    const cert = certificates[index];
    setEditingIndex(index);
    setIsAddingNew(false);
    setDraft({
      ...cert,
      type: cert.type || (cert.category === 'reference' || cert.category === 'ijaza' || cert.category === 'hawza' ? 'reference' : 'academic'),
      institution: cert.institution || cert.issuer || '',
      issuer: cert.issuer || cert.institution || '',
    });
    setTagsInput((cert.verificationTags || []).join('، '));
  };

  const startAdd = (type: 'academic' | 'reference' = 'academic') => {
    setIsAddingNew(true);
    setEditingIndex(null);
    if (type === 'reference') {
      setDraft({
        id: `cert-${Date.now()}`,
        title: 'إجازة روائية أو تزكية مرجعية جديدة',
        type: 'reference',
        category: 'reference',
        institution: 'اسم المرجع أو الفقيه المانح',
        issuer: 'اسم المرجع أو الفقيه المانح',
        year: '1440هـ',
        code: 'REF-001',
        imageUrl: '/assets/certificates/cert_01.jpg',
        description: 'نص وتفاصيل الإجازة الروائية أو الوكالة الشرعية الصادرة من المرجع...',
        verificationTags: ['إجازة مرجعية', 'معتمد'],
      });
      setTagsInput('إجازة مرجعية، معتمد');
    } else {
      setDraft({
        id: `cert-${Date.now()}`,
        title: 'شهادة علمية / اعتماد أكاديمي جديد',
        type: 'academic',
        category: 'doctorate',
        institution: 'الجهة المانحة أو الجامعة',
        issuer: 'الجهة المانحة أو الجامعة',
        year: '2020م',
        code: 'ACAD-001',
        imageUrl: '/assets/certificates/cert_01.jpg',
        description: 'وصف تفصيلي للشهادة أو الاعتماد العلمي...',
        verificationTags: ['معتمد', 'أكاديمي'],
      });
      setTagsInput('معتمد، أكاديمي');
    }
  };

  const handleSaveDraft = async () => {
    const processedTags = tagsInput
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const finalized: AcademicCertificate = {
      ...draft,
      issuer: draft.institution || draft.issuer || '',
      institution: draft.institution || draft.issuer || '',
      verificationTags: processedTags,
    };

    let updatedList: AcademicCertificate[];
    if (isAddingNew) {
      updatedList = [...certificates, finalized];
    } else if (editingIndex !== null) {
      updatedList = [...certificates];
      updatedList[editingIndex] = finalized;
    } else {
      updatedList = [...certificates];
    }

    onChange(updatedList);
    setEditingIndex(null);
    setIsAddingNew(false);

    try {
      await saveContent({ certificates: updatedList }, { silent: true });
      showNotification('تم حفظ وتثبيت الشهادة بنجاح!');
    } catch {
      showNotification('تم حفظ الشهادة محلياً');
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الشهادة؟')) {
      const updated = certificates.filter((_, i) => i !== index);
      onChange(updated);
      saveContent({ certificates: updated }, { silent: true });
      if (editingIndex === index) setEditingIndex(null);
      showNotification('تم حذف الشهادة وتحديث القائمة بنجاح');
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= certificates.length) return;
    const updated = [...certificates];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChange(updated);
    saveContent({ certificates: updated }, { silent: true });
  };

  const academicCount = certificates.filter((c) => c.type !== 'reference' && c.category !== 'reference' && c.category !== 'ijaza' && c.category !== 'hawza').length;
  const referenceCount = certificates.filter((c) => c.type === 'reference' || c.category === 'reference' || c.category === 'ijaza' || c.category === 'hawza').length;

  const filteredList = certificates.map((cert, originalIdx) => ({ cert, originalIdx })).filter(({ cert }) => {
    if (filterType === 'all') return true;
    const isRef = cert.type === 'reference' || cert.category === 'reference' || cert.category === 'ijaza' || cert.category === 'hawza';
    if (filterType === 'reference') return isRef;
    if (filterType === 'academic') return !isRef;
    return true;
  });

  return (
    <div className="space-y-6 text-right font-cairo">
      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-900/90 text-white border-2 border-[#D4AF37] p-3.5 rounded-sm shadow-md flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-sm border border-slate-200 gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>إدارة قسم الشهادات والاعتمادات ({certificates.length} وثيقة)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            مقسمة بين: 🎓 الشهادات العلمية والأكاديمية ({academicCount}) و 📜 الشهادات والإجازات المرجعية ({referenceCount}).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FirestoreCloudSaveButton
            tabName="الشهادات والاعتمادات"
            onSaved={showNotification}
            showStatusPill={true}
          />

          <button
            type="button"
            onClick={() => startAdd('academic')}
            className="px-3.5 py-1.5 bg-[#0F382C] text-[#D4AF37] hover:bg-[#144b3c] text-xs font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>+ شهادة علمية</span>
          </button>

          <button
            type="button"
            onClick={() => startAdd('reference')}
            className="px-3.5 py-1.5 bg-[#D4AF37] text-[#0F382C] hover:bg-[#c49f2c] text-xs font-extrabold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Scroll className="w-4 h-4" />
            <span>+ إجازة مرجعية</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer transition-colors ${
            filterType === 'all'
              ? 'bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37]'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          كافة الشهادات ({certificates.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('academic')}
          className={`px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
            filterType === 'academic'
              ? 'bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37]'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>الشهادات العلمية والأكاديمية ({academicCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('reference')}
          className={`px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
            filterType === 'reference'
              ? 'bg-[#0F382C] text-[#D4AF37] border border-[#D4AF37]'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" />
          <span>الشهادات والإجازات المرجعية ({referenceCount})</span>
        </button>
      </div>

      {/* Form modal/card */}
      {(editingIndex !== null || isAddingNew) && (
        <div className="bg-[#FAF8F5] border-2 border-[#D4AF37] p-6 rounded-sm space-y-5 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-3">
            <h4 className="text-sm font-bold text-[#0F382C] flex items-center gap-2">
              {draft.type === 'reference' ? <Scroll className="w-4 h-4 text-[#D4AF37]" /> : <GraduationCap className="w-4 h-4 text-[#D4AF37]" />}
              <span>{isAddingNew ? 'إضافة وثيقة / شهادة جديدة' : `تعديل الشهادة: ${draft.title}`}</span>
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
            {/* Main Pillar Type */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                القسم الرئيسي للشهادة
              </label>
              <select
                value={draft.type || 'academic'}
                onChange={(e) => {
                  const newType = e.target.value as 'academic' | 'reference';
                  setDraft({
                    ...draft,
                    type: newType,
                    category: newType === 'reference' ? 'reference' : 'doctorate',
                  });
                }}
                className="w-full px-3 py-2 text-sm border-2 border-[#D4AF37] rounded-sm bg-white font-bold text-[#0F382C]"
              >
                <option value="academic">🎓 قسم الشهادات العلمية والأكاديمية</option>
                <option value="reference">📜 قسم الشهادات والإجازات المرجعية</option>
              </select>
            </div>

            {/* Sub-Category */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                التصنيف الفرعي
              </label>
              {draft.type === 'reference' ? (
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold"
                >
                  <option value="reference">إجازة وتزكية مرجعية عامة</option>
                  <option value="ijaza">إجازة رواية وحديث شريف</option>
                  <option value="wikala">وكالة وتفويض شرعي</option>
                  <option value="hawza">شهادة حوزوية / تحصيل فقهي</option>
                </select>
              ) : (
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold"
                >
                  <option value="doctorate">دكتوراه (Doctorate)</option>
                  <option value="master">ماجستير (Master)</option>
                  <option value="honorary">عضوية فخرية أو تخصصية (Honorary)</option>
                  <option value="practitioner">كوتشينج وممارس (Practitioner / TOT)</option>
                  <option value="award">جائزة وتكريم دولي (Award)</option>
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                مسمى الشهادة / الإجازة
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-bold"
                placeholder={draft.type === 'reference' ? 'إجازة رواية من سماحة آية الله...' : 'شهادة الدكتوراه المهنية في...'}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                {draft.type === 'reference' ? 'اسم المرجع / الفقيه المانح' : 'الجهة المانحة / الجامعة'}
              </label>
              <input
                type="text"
                value={draft.institution || draft.issuer || ''}
                onChange={(e) => setDraft({ ...draft, institution: e.target.value, issuer: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder={draft.type === 'reference' ? 'سماحة آية الله العظمى...' : 'جامعة... / الأكاديمية البريطانية...'}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  السنة / التاريخ
                </label>
                <input
                  type="text"
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono"
                  placeholder={draft.type === 'reference' ? '1435هـ' : '2018م'}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F382C]">
                  رمز الوثيقة / الكود (اختياري)
                </label>
                <input
                  type="text"
                  value={draft.code || ''}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white font-mono text-left dir-ltr"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                الدولة / المدينة (اختياري)
              </label>
              <input
                type="text"
                value={draft.country || ''}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder="النجف الأشرف / قم المقدسة / بريطانيا / مصر"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <ImageUploadInput
                label="صورة الوثيقة / الشهادة"
                value={draft.imageUrl}
                onChange={(url) => setDraft({ ...draft, imageUrl: url })}
                helperText="يمكنك رفع صورة الشهادة أو الإجازة من جهازك."
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                الوصف والتفاصيل
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm bg-white"
                placeholder="نص الشهادة أو حيثيات المنح والتكريم..."
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#0F382C]">
                وسوم الاعتماد والتوثيق (افصل بينها بفاصلة)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
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
              <span>تأكيد وحفظ الوثيقة</span>
            </button>
          </div>
        </div>
      )}

      {/* Certificates list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map(({ cert, originalIdx }) => {
          const isRef = cert.type === 'reference' || cert.category === 'reference' || cert.category === 'ijaza' || cert.category === 'hawza';
          return (
            <div
              key={cert.id || originalIdx}
              className={`bg-white p-4 rounded-sm border transition-colors flex items-start gap-4 shadow-sm ${
                isRef ? 'border-[#D4AF37] bg-amber-50/20' : 'border-slate-200 hover:border-[#D4AF37]'
              }`}
            >
              {/* Cert thumb */}
              <div className="w-16 h-20 bg-slate-100 border border-slate-200 rounded-sm overflow-hidden shrink-0">
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Cert info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#0F382C]/10 text-[#0F382C] flex items-center gap-1">
                    {isRef ? <Scroll className="w-3 h-3 text-[#D4AF37]" /> : <GraduationCap className="w-3 h-3 text-[#D4AF37]" />}
                    <span>{isRef ? 'إجازة / وثيقة مرجعية' : 'شهادة علمية'}</span>
                  </span>
                  <span className="text-xs font-bold text-[#D4AF37] font-mono">{cert.year}</span>
                </div>

                <h4 className="text-sm font-bold text-[#0F382C] truncate">{cert.title}</h4>
                <p className="text-xs text-slate-600 truncate">{cert.issuer || cert.institution}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{cert.description}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(originalIdx)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm cursor-pointer"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(originalIdx, 'up')}
                  disabled={originalIdx === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  title="تحريك لأعلى"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(originalIdx, 'down')}
                  disabled={originalIdx === certificates.length - 1}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  title="تحريك لأسفل"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(originalIdx)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
