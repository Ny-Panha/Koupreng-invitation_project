import { AlertTriangle, ArrowLeft, Check, CloudOff, Eye, LoaderCircle, Lock, Menu, MoreHorizontal, Palette, RotateCcw, Undo2, Redo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useEventWorkspace } from "../../events/workspace/EventContext";
import { feedback } from '@/shared/feedback/feedback';
import { StudioActionBar } from './StudioFields';
import DisplayPreferences from '@/shared/preferences/DisplayPreferences';
import BrandLogo from '@/shared/branding/BrandLogo';

export default function StudioToolbar({ title, templateName, english, studio, saving, publishing, published, canPublish, canEdit = true, onTemplate, onPreview, previewOpen, onPublish, onBack }) {
  const workspace = useEventWorkspace();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const isShrunk = Boolean(viewport && window.innerHeight - viewport.height > 150);
      const isInputActive = Boolean(document.activeElement?.matches("input,textarea,select,[contenteditable=true]"));
      setKeyboardOpen(isShrunk && isInputActive);
      setKeyboardInset(isShrunk && isInputActive ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0);
    };
    viewport?.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  const labels = english
    ? { saved:"Saved to server", unsaved:"Unsaved changes", saving:"Saving…", failed:"Save failed", offline:"Offline" }
    : { saved:"បានរក្សាទុក", unsaved:"មិនទាន់រក្សាទុក", saving:"កំពុងរក្សាទុក…", failed:"រក្សាទុកបរាជ័យ", offline:"គ្មានអ៊ីនធឺណិត" };
  labels.conflict = english ? "Newer version on server" : "មានកំណែថ្មីលើម៉ាស៊ីនមេ";
  labels.expired = english ? "Session expired" : "វគ្គចូលប្រើផុតកំណត់";
  labels.denied = english ? "Access denied" : "មិនមានសិទ្ធិរក្សាទុក";
  const blocked = ["conflict", "expired", "denied"].includes(studio.phase);
  const StatusIcon = studio.phase === "saved" ? Check
    : studio.phase === "saving" ? LoaderCircle
    : studio.phase === "conflict" ? AlertTriangle
    : ["expired", "denied"].includes(studio.phase) ? Lock
    : CloudOff;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.altKey
        || !(event.ctrlKey || event.metaKey) || saving || blocked || !canEdit) return;
      if (event.target?.closest?.('[role="dialog"],dialog')) return;
      const editable = event.target?.closest?.('input,textarea,select,[contenteditable]');
      const isTextEditable = editable && editable.getAttribute('contenteditable') !== 'false';

      // Ctrl/Cmd + S -> Save
      if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
        if (!event.shiftKey) {
          event.preventDefault();
          studio.flush({ deliberate: true }).then((saved) => {
            if (saved) {
              feedback.success({
                id: 'studio-save',
                title: english ? 'Saved to server' : 'បានរក្សាទុកលើម៉ាស៊ីនមេ',
                description: english ? 'Your invitation changes have been saved.' : 'ការកែប្រែសំបុត្រអញ្ជើញរបស់អ្នកត្រូវបានរក្សាទុក។',
              });
            }
          });
        }
        return;
      }

      // Studio document-level Undo / Redo when not focused in an editable text control
      if ((event.ctrlKey || event.metaKey) && !isTextEditable) {
        if (event.key === 'z' || event.key === 'Z') {
          if (event.shiftKey) {
            if (studio.canRedo) { event.preventDefault(); studio.redo(); }
          } else {
            if (studio.canUndo) { event.preventDefault(); studio.undo(); }
          }
        } else if (event.key === 'y' || event.key === 'Y') {
          if (!event.shiftKey && studio.canRedo) { event.preventDefault(); studio.redo(); }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, blocked, canEdit, studio, english]);

  return <header className="studio-toolbar" aria-label={english ? "Invitation studio" : "ស្ទូឌីយោសំបុត្រអញ្ជើញ"}>
    <button type="button" className="studio-back" onClick={onBack} aria-label={english ? "Back to Event" : "ត្រឡប់ទៅកម្មវិធី"} title={english ? "Back to Event" : "ត្រឡប់ទៅកម្មវិធី"}><ArrowLeft size={20} /></button>
    {workspace?.openNavigation && <button type="button" ref={node => workspace.registerNavigationTrigger?.(node)} className="studio-back studio-event-menu" onClick={workspace.openNavigation} aria-label={english ? "Open event navigation" : "បើកម៉ឺនុយកម្មវិធី"} aria-haspopup="dialog" aria-expanded={workspace.navigationOpen} title={english ? "Event navigation" : "មុខងារកម្មវិធី"}><Menu size={20} aria-hidden="true" /></button>}
    <div className="studio-document">
      <BrandLogo variant="icon" className="studio-brand" priority />
      <div className="studio-document-copy">
        <h1 title={title}>{title || (english ? "Invitation studio" : "ស្ទូឌីយោសំបុត្រអញ្ជើញ")}</h1>
        <button type="button" className="studio-template-button" disabled={!canEdit} onClick={event => { event.currentTarget.focus({ preventScroll: true }); onTemplate?.(); }} aria-label={`${english ? "Change template" : "ប្ដូរគំរូ"}: ${templateName || ''}`}>
          <Palette size={14} aria-hidden="true" /><span className="pe-template-tag">{templateName}</span>
        </button>
      </div>
    </div>
    <div className="studio-navbar-preferences"><DisplayPreferences compact /></div>
    <span className="studio-save-status" data-phase={studio.phase} role="status" aria-live="polite"><StatusIcon size={16} className={studio.phase === "saving" ? "animate-spin" : undefined} aria-hidden="true" />{labels[studio.phase]}</span>
    <StudioActionBar data-keyboard-open={keyboardOpen} style={{ '--studio-keyboard-inset': `${keyboardInset}px` }}>
      <button type="button" className="studio-action studio-action--preview" aria-haspopup="dialog" aria-expanded={Boolean(previewOpen)} aria-label={english ? "Preview invitation" : "មើលសំបុត្រអញ្ជើញជាមុន"} onClick={event => { event.currentTarget.focus({ preventScroll: true }); onPreview?.(); }}><Eye size={18} aria-hidden="true" /><span>{english ? "Preview" : "មើលជាមុន"}</span></button>
      <button type="button" className="studio-action studio-action--save pe-save-main-btn" disabled={saving || blocked || !canEdit} aria-keyshortcuts="Control+s Meta+s" title={english ? "Save changes (Ctrl+S)" : "រក្សាទុកការកែប្រែ (Ctrl+S)"} onClick={async () => { if (await studio.flush({ deliberate: true })) feedback.success({ id: 'studio-save', title: english ? 'Saved to server' : 'បានរក្សាទុកលើម៉ាស៊ីនមេ', description: english ? 'Your invitation changes have been saved.' : 'ការកែប្រែសំបុត្រអញ្ជើញរបស់អ្នកត្រូវបានរក្សាទុក។' }); }}>{english ? (saving ? "Saving…" : "Save") : (saving ? "កំពុងរក្សាទុក…" : "រក្សាទុក")}</button>
      {canPublish && canEdit && !published && <button type="button" className="studio-action studio-action--publish" disabled={saving || publishing || blocked} onClick={event => { event.currentTarget.focus({ preventScroll: true }); onPublish?.(); }}>{english ? (publishing ? "Publishing…" : "Publish") : "ផ្សព្វផ្សាយ"}</button>}
      <details className="studio-more" onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
        <summary aria-label={english ? "More studio actions" : "ជម្រើសបន្ថែម"}><MoreHorizontal size={20} aria-hidden="true" /></summary>
        <div className="studio-more-panel">
          <button type="button" disabled={!studio.canUndo || saving || blocked || !canEdit} aria-keyshortcuts="Control+z Meta+z" title={english ? "Undo (Ctrl+Z)" : "ត្រឡប់វិញ (Ctrl+Z)"} onClick={studio.undo}><Undo2 size={17} />{english ? "Undo" : "ត្រឡប់វិញ"}</button>
          <button type="button" disabled={!studio.canRedo || saving || blocked || !canEdit} aria-keyshortcuts="Control+Shift+z Meta+Shift+z Control+y Meta+y" title={english ? "Redo (Ctrl+Shift+Z / Ctrl+Y)" : "ធ្វើឡើងវិញ (Ctrl+Shift+Z / Ctrl+Y)"} onClick={studio.redo}><Redo2 size={17} />{english ? "Redo" : "ធ្វើឡើងវិញ"}</button>
          <button type="button" disabled={saving || blocked || !canEdit} onClick={studio.reset}><RotateCcw size={17} />{english ? "Reset changes" : "កំណត់ឡើងវិញ"}</button>
        </div>
      </details>
    </StudioActionBar>
  </header>;
}
