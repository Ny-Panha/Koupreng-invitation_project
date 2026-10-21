import { ArrowLeft, Check, CloudOff, Eye, LoaderCircle, MoreHorizontal, Palette, RotateCcw, Undo2, Redo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEventWorkspace } from "../../events/workspace/EventContext";

export default function StudioToolbar({ title, templateName, english, studio, saving, publishing, published, canPublish, onTemplate, onPreview, onPublish, onBack }) {
  const navigate = useNavigate();
  const workspace = useEventWorkspace();
  const labels = english
    ? { saved:"Saved to server", unsaved:"Unsaved changes", saving:"Saving…", failed:"Save failed", offline:"Offline" }
    : { saved:"បានរក្សាទុក", unsaved:"មិនទាន់រក្សាទុក", saving:"កំពុងរក្សាទុក…", failed:"រក្សាទុកបរាជ័យ", offline:"គ្មានអ៊ីនធឺណិត" };
  const StatusIcon = studio.phase === "saved" ? Check : studio.phase === "saving" ? LoaderCircle : CloudOff;
  return <header className="studio-toolbar" aria-label={english ? "Invitation studio" : "រចនាធៀបអញ្ជើញ"}>
    <button type="button" className="studio-back" onClick={onBack} aria-label={english ? "Back to Event" : "ត្រឡប់ទៅកម្មវិធី"} title={english ? "Back to Event" : "ត្រឡប់ទៅកម្មវិធី"}><ArrowLeft size={20} /></button>
    <div className="studio-document">
      <h1 title={title}>{title || (english ? "Invitation studio" : "រចនាធៀបអញ្ជើញ")}</h1>
      <button type="button" className="studio-template-button" onClick={onTemplate} aria-label={english ? "Change template" : "ប្ដូរគំរូ"}>
        <Palette size={14} aria-hidden="true" /><span className="pe-template-tag">{templateName}</span>
      </button>
    </div>
    <span className="studio-save-status" data-phase={studio.phase} role="status" aria-live="polite"><StatusIcon size={16} aria-hidden="true" />{labels[studio.phase]}</span>
    <div className="studio-toolbar-actions">
      <button type="button" className="studio-action" aria-label={english ? "Preview invitation" : "មើលធៀបជាមុន"} onClick={onPreview}><Eye size={18} aria-hidden="true" /><span>{english ? "Preview" : "មើលជាមុន"}</span></button>
      <button type="button" className="studio-action studio-action--save pe-save-main-btn" disabled={saving} onClick={() => studio.save()}>{english ? (saving ? "Saving…" : "Save") : (saving ? "កំពុងរក្សាទុក…" : "រក្សាទុក")}</button>
      {canPublish && !published && <button type="button" className="studio-action" disabled={saving || publishing} onClick={onPublish}>{english ? (publishing ? "Publishing…" : "Publish") : "ផ្សព្វផ្សាយ"}</button>}
      <details className="studio-more" onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
        <summary aria-label={english ? "More studio actions" : "ជម្រើសបន្ថែម"}><MoreHorizontal size={20} aria-hidden="true" /></summary>
        <div className="studio-more-panel">
          <button type="button" disabled={!studio.canUndo} onClick={studio.undo}><Undo2 size={17} />{english ? "Undo" : "ត្រឡប់វិញ"}</button>
          <button type="button" disabled={!studio.canRedo} onClick={studio.redo}><Redo2 size={17} />{english ? "Redo" : "ធ្វើឡើងវិញ"}</button>
          <button type="button" disabled={saving} onClick={studio.reset}><RotateCcw size={17} />{english ? "Reset changes" : "កំណត់ឡើងវិញ"}</button>
          {workspace?.events?.length > 0 && <label>{english ? "Switch event" : "ប្ដូរកម្មវិធី"}<select className="event-switcher-select" value={workspace.eventId} onChange={event => navigate(`/app/events/${event.target.value}/invitation`)}>{workspace.events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>}
        </div>
      </details>
    </div>
  </header>;
}
