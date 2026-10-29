import { CardGridSkeleton } from '@/shared/ui/LoadingState';
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ImageOff, Search } from "lucide-react";
import Modal from "@/shared/ui/Modal";
import { TEMPLATES } from "../../templates/data/templatesData";
import { isPublicCatalogTemplate, matchesTemplateSearch, requiresTemplateAccess, templateCategory } from "../../templates/model/catalogPolicy";
import { templateIdentity, templatePriceLabel } from "../../templates/model/templateIdentity";
import { publicTemplateImage } from "../../templates/model/publicTemplateImage";
import { resolveTemplateRenderer } from "../../templates/registry/templateRegistry";
import "./TemplateChooser.css";

function Thumbnail({ template }) {
  const [failed, setFailed] = useState(false);
  const source = template.thumbnailUrl || template.image;
  return <div className="tc-thumbnail">{source && !failed
    ? <img {...publicTemplateImage(source)} sizes="(max-width: 520px) 85vw, (max-width: 900px) 38vw, 260px" width="360" height="640" alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
    : <span><ImageOff aria-hidden="true" />Preview image unavailable</span>}</div>;
}

export default function TemplateChooser({ templates, status, onRetry, currentId, eventType = "WEDDING", language = "KH", onSelect, onClose, english = false, selectionAllowed = true }) {
  const copy = (km, en) => english ? en : km;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [candidate, setCandidate] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const source = status === "error" ? TEMPLATES : templates.filter(isPublicCatalogTemplate);
  const categories = [...new Set(source.map(templateCategory))];
  const labels = { ALL: copy("ទាំងអស់", "All designs"), TRADITIONAL: copy("ប្រពៃណីខ្មែរ", "Khmer tradition"), MODERN: copy("ទំនើប", "Modern"), MINIMALIST: copy("សាមញ្ញ", "Minimalist"), LUXURY: copy("ប្រណីត", "Luxury"), FLORAL: copy("ផ្កា", "Floral"), CONTEMPORARY: copy("សហសម័យ", "Contemporary") };
  const filtered = source.filter(template => (category === "ALL" || templateCategory(template) === category) && matchesTemplateSearch(template, query));
  const compatible = template => (!template.supportedEventTypes?.length || template.supportedEventTypes.includes(eventType))
    && (!template.supportedLanguages?.length || template.supportedLanguages.includes(language));
  const available = template => selectionAllowed && status === "ready" && isPublicCatalogTemplate(template) && resolveTemplateRenderer(template).available && compatible(template);
  const selected = templates.find(template => templateIdentity(template) === candidate);
  const confirm = async () => {
    if (!selected || !available(selected)) return;
    setBusy(true); setMessage("");
    try { await onSelect(selected); }
    catch { setMessage(copy("មិនអាចប្តូរគំរូបានទេ។ សូមព្យាយាមម្តងទៀត។", "The design could not be changed. Try again.")); }
    finally { setBusy(false); }
  };
  return <Modal isOpen onClose={onClose} size="xl" className="tc-modal" title={copy("ប្តូរគំរូ", "Change template")}
    subtitle={copy("មើលគំរូពេញលេញ រួចជ្រើសរើសរចនាបថសម្រាប់កម្មវិធីរបស់អ្នក។", "Preview a complete invitation, then choose a design for your event.")}
    footer={<div className="tc-confirm"><p aria-live="polite">{selected ? selected.style || selected.name : copy("ជ្រើសរើសគំរូដើម្បីបន្ត", "Select a design to continue")}</p><button type="button" className="inv-primary-btn" disabled={!selected || !available(selected) || busy} onClick={confirm}>{busy ? copy("កំពុងពិនិត្យសិទ្ធិ…", "Checking access…") : copy("ប្រើគំរូដែលបានជ្រើសរើស", "Use selected design")}</button></div>}>
    <div className="tc-controls">
      <label className="tc-search"><span>{copy("ស្វែងរកគំរូ", "Search designs")}</span><div><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={copy("ឈ្មោះ កូដ ឬរចនាបថ", "Name, code or style")} /></div></label>
      <div className="tc-filters" role="group" aria-label={copy("ប្រភេទគំរូ", "Design categories")}>{["ALL", ...categories].map(key => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{labels[key] || key}</button>)}</div>
    </div>
    {status === "loading" && <CardGridSkeleton variant="template" label={copy("កំពុងផ្ទុកគំរូ…", "Loading the invitation collection…")} />}
    {status === "error" && <div role="status" className="tc-state"><p>{copy("មិនអាចផ្ទុកបញ្ជីគំរូបានទេ។ គំរូខាងក្រោមអាចមើលតែប៉ុណ្ណោះ។", "The catalog is unavailable. These demo designs are preview only.")}</p><button type="button" onClick={onRetry}>{copy("សាកម្តងទៀត", "Try again")}</button></div>}
    {message && <p role="alert">{message}</p>}
    {status !== "loading" && <><p className="tc-count" role="status">{filtered.length} {copy("គំរូ", "designs")}</p><div className="tc-grid">{filtered.map(template => {
      const code = templateIdentity(template);
      const chosen = candidate === code;
      const inUse = [template.id, template.backendId, template.code, template.slug].map(String).includes(String(currentId));
      const price = templatePriceLabel(template, english ? "en" : "km");
      return <article key={code} className={`tc-card ${chosen ? "is-selected" : ""}`} data-template={code}>
        <Thumbnail template={template} />
        <div className="tc-card-body"><p className="tc-category">{labels[templateCategory(template)] || templateCategory(template)}{inUse && <span><Check size={14} aria-hidden="true" />{copy("កំពុងប្រើ", "In use")}</span>}</p>
          <h3>{english ? template.style || template.name : template.name || template.style}</h3>
          <p className="tc-access">{status !== "ready" ? copy("មើលគំរូប៉ុណ្ណោះ", "Preview only") : requiresTemplateAccess(template) ? `Premium · ${price || copy("រួមបញ្ចូលក្នុងគម្រោង Premium", "Included with Premium access")}` : copy("ឥតគិតថ្លៃ", "Free")}</p>
          {status === "ready" && !available(template) && <p className="tc-unavailable">{!compatible(template) ? copy("មិនគាំទ្រប្រភេទកម្មវិធី ឬភាសានេះទេ", "Unavailable for this event or language") : copy("មិនទាន់អាចប្រើក្នុង Studio", "Studio unavailable")}</p>}
          <div className="tc-actions"><Link to={`/templates/${encodeURIComponent(code)}`} target="_blank" rel="noopener noreferrer" aria-label={`${copy("មើលគំរូ", "Preview")} ${english ? template.style || template.name : template.name} (${copy("ផ្ទាំងថ្មី", "new tab")})`}>{copy("មើលគំរូ", "Preview")}</Link>
            <button type="button" aria-pressed={chosen} disabled={!available(template) || busy} onClick={() => { setCandidate(code); setMessage(""); }}>{chosen ? <><Check size={15} aria-hidden="true" />{copy("បានជ្រើសរើស", "Selected")}</> : copy("ជ្រើសរើស", "Select")}</button></div>
        </div>
      </article>;
    })}</div>{filtered.length === 0 && <div className="tc-state"><p>{templates.length === 0 ? copy("មិនទាន់មានគំរូដែលអាចជ្រើសរើសបានទេ។", "There are no published designs available.") : copy("មិនមានគំរូត្រូវនឹងការស្វែងរកទេ។", "No designs match your search or category.")}</p><button type="button" onClick={() => { setQuery(""); setCategory("ALL"); }}>{copy("សម្អាតតម្រង", "Clear filters")}</button><button type="button" onClick={onRetry}>{copy("ផ្ទុកឡើងវិញ", "Refresh collection")}</button></div>}</>}
  </Modal>;
}
