import { ArrowLeft, Check, CloudOff, Eye, LoaderCircle, Menu, MoreHorizontal, Palette, RotateCcw, Undo2, Redo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useEventWorkspace } from "../../events/workspace/EventContext";

export default function StudioToolbar({ title, templateName, english, studio, saving, publishing, published, canPublish, onTemplate, onPreview, previewOpen, onPublish, onBack }) {
  const workspace = useEventWorkspace();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => setKeyboardOpen(Boolean(viewport && window.innerHeight - viewport.height > 150 && document.activeElement?.matches("input,textarea,select,[contenteditable=true]")));
    viewport?.addEventListener("resize", update); document.addEventListener("focusout", update);
    return () => { viewport?.removeEventListener("resize", update); document.removeEventListener("focusout", update); };
  }, []);
  const labels = english
    ? { saved:"Saved to server", unsaved:"Unsaved changes", saving:"Saving…", failed:"Save failed", offline:"Offline" }
    : { saved:"បានរក្សាទុក", unsaved:"មិនទាន់រក្សាទុក", saving:"កំពុងរក្សាទុក…", failed:"រក្សាទុកបរាជ័យ", offline:"គ្មានអ៊ីនធឺណិត" };
  labels.conflict = english ? "Newer version on server" : "មានកំណែថ្មីលើម៉ាស៊ីនមេ";
  labels.expired = english ? "Session expired" : "វគ្គចូលប្រើផុតកំណត់";
  const blocked = ["conflict", "expired"].includes(studio.phase);
  const StatusIcon = studio.phase === "saved" ? Check : studio.phase === "saving" ? LoaderCircle : CloudOff;
  return <header className="studio-toolbar" aria-label={english ? "Invitation studio" : "រចនាធៀបអញ្ជើញ"}>
    <button type="button" className="studio-back" onClick={onBack} aria-label={english ? "Back to Event" : "ត្រឡប់ទៅកម្មវិធី"} title={english ? "Back to Event" : "ត្រឡប់ទៅកម្មវិធី"}><ArrowLeft size={20} /></button>
    {workspace?.openNavigation && <button type="button" ref={node => workspace.registerNavigationTrigger?.(node)} className="studio-back studio-event-menu" onClick={workspace.openNavigation} aria-label={english ? "Open event navigation" : "បើកម៉ឺនុយកម្មវិធី"} aria-haspopup="dialog" aria-expanded={workspace.navigationOpen} title={english ? "Event navigation" : "មុខងារកម្មវិធី"}><Menu size={20} aria-hidden="true" /></button>}
    <div className="studio-document">
      <h1 title={title}>{title || (english ? "Invitation studio" : "រចនាធៀបអញ្ជើញ")}</h1>
      <button type="button" className="studio-template-button" onClick={onTemplate} aria-label={`${english ? "Change template" : "ប្ដូរគំរូ"}: ${templateName || ''}`}>
        <Palette size={14} aria-hidden="true" /><span className="pe-template-tag">{templateName}</span>
      </button>
    </div>
    <span className="studio-save-status" data-phase={studio.phase} role="status" aria-live="polite"><StatusIcon size={16} aria-hidden="true" />{labels[studio.phase]}</span>
    <div className="studio-toolbar-actions" data-keyboard-open={keyboardOpen}>
      <button type="button" className="studio-action studio-action--preview" aria-haspopup="dialog" aria-expanded={Boolean(previewOpen)} aria-label={english ? "Preview invitation" : "មើលជាមុន៖ ធៀបអញ្ជើញ"} onClick={onPreview}><Eye size={18} aria-hidden="true" /><span>{english ? "Preview" : "មើលជាមុន"}</span></button>
      <button type="button" className="studio-action studio-action--save pe-save-main-btn" disabled={saving || blocked} onClick={() => studio.flush()}>{english ? (saving ? "Saving…" : "Save") : (saving ? "កំពុងរក្សាទុក…" : "រក្សាទុក")}</button>
      {canPublish && !published && <button type="button" className="studio-action" disabled={saving || publishing || blocked} onClick={onPublish}>{english ? (publishing ? "Publishing…" : "Publish") : "ផ្សព្វផ្សាយ"}</button>}
      <details className="studio-more" onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
        <summary aria-label={english ? "More studio actions" : "ជម្រើសបន្ថែម"}><MoreHorizontal size={20} aria-hidden="true" /></summary>
        <div className="studio-more-panel">
          <button type="button" disabled={!studio.canUndo} onClick={studio.undo}><Undo2 size={17} />{english ? "Undo" : "ត្រឡប់វិញ"}</button>
          <button type="button" disabled={!studio.canRedo} onClick={studio.redo}><Redo2 size={17} />{english ? "Redo" : "ធ្វើឡើងវិញ"}</button>
          <button type="button" disabled={saving} onClick={studio.reset}><RotateCcw size={17} />{english ? "Reset changes" : "កំណត់ឡើងវិញ"}</button>
        </div>
      </details>
    </div>
  </header>;
}
