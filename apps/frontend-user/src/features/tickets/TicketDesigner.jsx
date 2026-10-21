import { useContext, useEffect, useMemo, useState } from "react";
import { UNSAFE_NavigationContext, useParams } from "react-router-dom";
import { registerUnsavedHistoryGuard } from "@/shared/navigation/unsavedHistoryGuard";
import { guestService } from "@/features/guests/api/guestApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { ticketService } from "./ticketApi";
import TicketPreview from "./TicketPreview";
import TicketActions from "./TicketActions";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { Save, Ticket, Eye } from "lucide-react";

export default function TicketDesigner() {
  const { eventId } = useParams();
  return <Designer key={eventId} eventId={eventId} />;
}
function Designer({ eventId }) {
  const en = useLanguageStore(state => state.lang) === "en";
  const text = (english, khmer) => en ? english : khmer;
  const navigation = useContext(UNSAFE_NavigationContext);
  const [state, setState] = useState({ loading: true });
  const [design, setDesign] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [guestId, setGuestId] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const [baseline, setBaseline] = useState("");
  const serial = JSON.stringify(design);
  const dirty = design !== null && serial !== baseline;
  const items = useMemo(() => [state.media?.coverImage, ...(state.media?.gallery || state.media?.galleryImages || [])].filter(item => item?.id && item?.mimeType?.startsWith("image/")), [state.media]);
  const preview = useMemo(() => {
    if (!ticket || !design) return null;
    const mediaUrl = id => items.find(item => String(item.id) === String(id))?.fileUrl || null;
    return { ...ticket, group: design.showGroup ? ticket.group : null, tableName: design.showTable ? ticket.tableName : null,
      seatNumber: design.showTable ? ticket.seatNumber : null, seatCount: design.showSeatCount ? ticket.seatCount : null,
      appearance: { schemaVersion: 1, design, backgroundUrl: mediaUrl(design.backgroundMediaId), coverUrl: mediaUrl(design.coverMediaId) } };
  }, [ticket, design, items]);
  useEffect(() => {
    let active = true;
    Promise.all([ticketService.design(eventId), ticketService.ticket(eventId), guestService.listByInvitation(eventId), mediaService.list(eventId)])
      .then(([appearance, initial, guests, media]) => {
        if (!active) return;
        setBaseline(JSON.stringify(appearance.design));
        setDesign(appearance.design); setTicket(initial); setState({ guests, media, appearance });
      }).catch(err => { if (active) setState({ error: err.message || "The ticket designer is unavailable for this event or package." }); });
    return () => { active = false; };
  }, [eventId, retry]);
  useEffect(() => {
    if (!state.appearance) return;
    let active = true;
    setReady(false);
    ticketService.ticket(eventId, guestId || null).then(value => { if (active) { setTicket(value); setError(""); } })
      .catch(err => { if (active) { setTicket(null); setError(err.message); } });
    return () => { active = false; };
  }, [guestId, eventId, state.appearance]);
  useEffect(() => {
    if (!dirty) return;
    const navigator = navigation?.navigator;
    const mayLeave = () => window.confirm("The ticket design has unsaved changes. Leave this page?");
    const guard = registerUnsavedHistoryGuard(mayLeave);
    const original = {};
    if (navigator) for (const method of ["push", "replace"]) {
      original[method] = navigator[method];
      navigator[method] = function (...args) { if (mayLeave()) return original[method].apply(navigator, args); };
    }
    const warn = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn); guard.release();
      if (navigator) Object.keys(original).forEach(method => { navigator[method] = original[method]; });
    };
  }, [dirty, navigation]);
  if (state.loading) return <p className="ticket-studio" role="status">Loading ticket designer…</p>;
  if (state.error) return <div className="ticket-studio" role="alert"><p>{state.error}</p><button onClick={() => { setState({ loading: true }); setRetry(n => n + 1); }}>Retry</button></div>;
  const update = (key, value) => { setNotice(""); setDesign(current => ({ ...current, [key]: value })); };
  async function save() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const saved = await ticketService.save(eventId, design);
      setBaseline(JSON.stringify(saved.design)); setDesign(saved.design); setNotice("បានរក្សាទុក · Ticket design saved for this event");
      setState(value => ({ ...value, appearance: saved }));
    } catch (err) { setError(err.message || "Save failed. Retry. If the design changed elsewhere, reload first."); }
    finally { setBusy(false); }
  }
  async function upload(event, key) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPEG, PNG or WebP under 5 MB."); return; }
    setBusy(true); setError("");
    try {
      const uploaded = await mediaService.uploadGallery(eventId, [file]);
      const image = (Array.isArray(uploaded) ? uploaded : uploaded.items || uploaded.data || [])[0];
      if (!image?.id) throw new Error("The server did not return the uploaded image.");
      setState(value => ({ ...value, media: { ...value.media, gallery: [...(value.media?.gallery || value.media?.galleryImages || []), image] } }));
      update(key, image.id);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="ticket-studio workspace-page">
    <header className="dash-page-header"><div><span className="dash-kicker"><Ticket size={16} />{text("Digital invitations", "ធៀបអញ្ជើញឌីជីថល")}</span><h1>{text("Ticket designer", "រចនាកាតអញ្ជើញ")}</h1><p>{text("One event design, personalized for each saved guest. Publish before sharing guest links.", "រចនាកាតសម្រាប់កម្មវិធី និងកំណត់ឈ្មោះភ្ញៀវម្នាក់ៗ។ ផ្សព្វផ្សាយធៀបមុនចែករំលែកតំណទៅភ្ញៀវ។")}</p></div>
      <button disabled={busy || !dirty} onClick={save}><Save size={18} />{busy ? text("Saving…", "កំពុងរក្សាទុក…") : text("Save design", "រក្សាទុករចនា")}</button></header>
    <p className="ticket-save-status" role="status">{notice ? text("Ticket design saved for this event", "បានរក្សាទុករចនាកាតសម្រាប់កម្មវិធីនេះ") : dirty ? text("Unsaved design", "ការកែប្រែមិនទាន់រក្សាទុក") : text("Saved design", "បានរក្សាទុករចនា")}</p>
    {error && <p role="alert">{error}</p>}
    <div className="ticket-designer-grid"><fieldset disabled={busy} className="ticket-design-controls"><legend>{text("Customize your ticket", "កែសម្រួលកាតរបស់អ្នក")}</legend>
      <label>{text("Layout", "រចនាប័ទ្ម")}<select value={design.layout} onChange={e => update("layout", e.target.value)}>
        {[["GOLD", "Royal Gold"], ["MINIMAL", "Modern Minimal"], ["FLORAL", "Botanical Floral"], ["IVORY", "Ivory Seal"]].map(([value, name]) => <option key={value} value={value}>{name}</option>)}
      </select></label>
      <div className="ticket-control-pair"><label>{text("Accent", "ពណ៌លម្អ")}<input type="color" value={design.accent} onChange={e => update("accent", e.target.value)} /></label>
      <label>{text("Frame", "ស៊ុម")}<select value={design.frame} onChange={e => update("frame", e.target.value)}>{[["DOUBLE", text("Double", "ស៊ុមពីរជាន់")], ["SINGLE", text("Single", "ស៊ុមមួយជាន់")], ["NONE", text("None", "គ្មានស៊ុម")]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
      <label>{text("Heading font", "អក្សរចំណងជើង")}<select value={design.font} onChange={e => update("font", e.target.value)}><option value="MOUL">Moul</option><option value="KANTUMRUY">Kantumruy Pro</option><option value="CORMORANT">Cormorant Garamond</option></select></label>
      <label>{text("Header", "សារខាងលើ")}<input maxLength={100} value={design.header} onChange={e => update("header", e.target.value)} /></label>
      <label>{text("Footer", "សារខាងក្រោម")}<textarea maxLength={200} value={design.footer} onChange={e => update("footer", e.target.value)} /></label>
      {[["coverMediaId", text("Cover image", "រូបក្រប")], ["backgroundMediaId", text("Background", "ផ្ទៃខាងក្រោយ")]].map(([key, label]) => <label key={key}>{label}
        <select value={design[key] || ""} onChange={e => update(key, Number(e.target.value) || null)}><option value="">{text("None", "គ្មានរូបភាព")}</option>{items.map(item => <option value={item.id} key={item.id}>{item.originalFilename || `Image ${item.id}`}</option>)}</select>
        <input type="file" aria-label={`Upload ${label}`} accept="image/jpeg,image/png,image/webp" onChange={e => upload(e, key)} />
      </label>)}
      {[["showTable", text("Table & seat", "តុ និងកៅអី")], ["showSeatCount", text("Guest count", "ចំនួនភ្ញៀវ")], ["showGroup", text("Guest group", "ក្រុមភ្ញៀវ")]].map(([key, label]) => <label className="ticket-checkbox" key={key}><input type="checkbox" checked={design[key]} onChange={e => update(key, e.target.checked)} />{label}</label>)}
      <button type="button" disabled={!dirty} onClick={() => { if (window.confirm(text("Discard unsaved ticket design changes?", "បោះបង់ការកែប្រែរចនាកាតដែលមិនទាន់រក្សាទុកឬ?"))) setDesign(JSON.parse(baseline)); }}>{text("Reset changes", "កំណត់ឡើងវិញ")}</button>
    </fieldset><div className="ticket-preview-panel"><h2><Eye size={20} />{text("Live preview", "មើលជាមុន")}</h2><label className="ticket-guest-select">{text("Preview recipient", "ភ្ញៀវសម្រាប់មើលជាមុន")}<select value={guestId} onChange={e => setGuestId(e.target.value)}><option value="">{text("General invitation · no guest check-in", "ធៀបទូទៅ · គ្មានការកត់ត្រាវត្តមានភ្ញៀវ")}</option>
      {state.guests.map(guest => <option key={guest.id} value={guest.id}>{guest.guestName}</option>)}</select></label>
      {preview && <><TicketPreview ticket={preview} onReady={setReady} /><TicketActions ticket={preview} ready={ready && !dirty} />{dirty && <p className="workspace-notice">{text("Save the design before downloading or sharing.", "រក្សាទុករចនាមុនទាញយក ឬចែករំលែក។")}</p>}</>}
    </div></div>
  </section>;
}
