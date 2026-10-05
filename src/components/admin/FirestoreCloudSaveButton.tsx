import React, { useState } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import { SiteContent } from '../../types';

interface FirestoreCloudSaveButtonProps {
  /** Label describing the current tab or section, e.g. "الإعدادات العامة", "الشهادات", etc. */
  tabName?: string;
  /** Optional custom save function; defaults to saving global site content */
  customSaveFn?: () => Promise<boolean | void>;
  /** Optional custom updated content object to pass directly to saveContent */
  updatedContent?: SiteContent;
  /** Optional callback after successful save */
  onSaved?: (msg: string) => void;
  /** Extra CSS classes */
  className?: string;
  /** Button sizing */
  size?: 'sm' | 'md';
  /** Show status pill (kept for prop compatibility) */
  showStatusPill?: boolean;
}

export const FirestoreCloudSaveButton: React.FC<FirestoreCloudSaveButtonProps> = ({
  tabName = 'البيانات',
  customSaveFn,
  updatedContent,
  onSaved,
  className = '',
  size = 'md',
}) => {
  const { saveContent, isSaving: globalIsSaving } = useSiteContent();
  const [isLocalSaving, setIsLocalSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const isBusy = isLocalSaving || globalIsSaving;

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isBusy) return;

    setIsLocalSaving(true);
    setJustSaved(false);

    try {
      let success = true;
      if (customSaveFn) {
        const res = await customSaveFn();
        if (res === false) success = false;
      } else {
        success = await saveContent(updatedContent, { silent: false });
      }

      if (success) {
        setJustSaved(true);
        const successMsg = `تم حفظ وتثبيت كافة بيانات «${tabName}» بنجاح دائم!`;
        if (onSaved) {
          onSaved(successMsg);
        }
        setTimeout(() => {
          setJustSaved(false);
        }, 3500);
      }
    } catch (err) {
      console.error('SaveButton error:', err);
    } finally {
      setIsLocalSaving(false);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : 'px-3.5 py-2 text-xs';

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={handleSave}
        disabled={isBusy}
        title={`حفظ وتثبيت كافة بيانات ${tabName} لتعميمها وثباتها دائماً`}
        className={`bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold rounded-sm border border-[#D4AF37] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 ${sizeClasses} ${
          justSaved ? 'bg-emerald-700 ring-2 ring-[#D4AF37]/80' : ''
        } ${className}`}
      >
        {isBusy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
            <span>جارٍ الحفظ والتثبيت...</span>
          </>
        ) : justSaved ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>تم الحفظ والتثبيت بنجاح!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>حفظ وتثبيت التعديلات</span>
          </>
        )}
      </button>
    </div>
  );
};
