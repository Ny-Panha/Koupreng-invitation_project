import { useContext, useEffect, useMemo, useState } from "react";
import { UNSAFE_NavigationContext, useParams } from "react-router-dom";
import { registerUnsavedHistoryGuard } from "@/shared/navigation/unsavedHistoryGuard";
import { guestService } from "@/features/guests/api/guestApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { ticketService } from "./ticketApi";
import TicketPreview from "./TicketPreview";
import TicketActions from "./TicketActions";

export default function TicketDesigner() {
  const { eventId } = useParams();
  return <Designer key={eventId} eventId={eventId} />;
}
function Designer({ eventId }) {
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
  return <section className="ticket-studio">
    <header><div><p>INVITATION STUDIO</p><h2>រចនាកាតអញ្ជើញ · Ticket designer</h2><p>One event design, personalized for each saved guest. Available before RSVP.</p><p>Publish the invitation before sending guest links.</p></div>
      <button disabled={busy || !dirty} onClick={save}>{busy ? "Saving…" : "រក្សាទុករចនា · Save design"}</button></header>
    <p role="status">{notice || (dirty ? "ការកែប្រែមិនទាន់រក្សាទុក · Unsaved design" : "Saved design")}</p>
    {error && <p role="alert">{error}</p>}
    <div className="ticket-designer-grid"><fieldset disabled={busy} className="ticket-design-controls"><legend>កែសម្រួល · Customize</legend>
      <label>រចនាប័ទ្ម · Layout<select value={design.layout} onChange={e => update("layout", e.target.value)}>
        {[["GOLD", "Royal Gold"], ["MINIMAL", "Modern Minimal"], ["FLORAL", "Botanical Floral"], ["IVORY", "Ivory Seal"]].map(([value, name]) => <option key={value} value={value}>{name}</option>)}
      </select></label>
      <label>ពណ៌ · Accent<input type="color" value={design.accent} onChange={e => update("accent", e.target.value)} /></label>
      <label>អក្សរ · Heading font<select value={design.font} onChange={e => update("font", e.target.value)}><option value="MOUL">Moul · ខ្មែរ</option><option value="KANTUMRUY">Kantumruy Pro</option><option value="CORMORANT">Cormorant Garamond</option></select></label>
      <label>ស៊ុម · Frame<select value={design.frame} onChange={e => update("frame", e.target.value)}>{["DOUBLE", "SINGLE", "NONE"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>សារខាងលើ · Header<input maxLength={100} value={design.header} onChange={e => update("header", e.target.value)} /></label>
      <label>សារខាងក្រោម · Footer<textarea maxLength={200} value={design.footer} onChange={e => update("footer", e.target.value)} /></label>
      {[["coverMediaId", "រូបក្រប · Cover image"], ["backgroundMediaId", "ផ្ទៃខាងក្រោយ · Background"]].map(([key, label]) => <label key={key}>{label}
        <select value={design[key] || ""} onChange={e => update(key, Number(e.target.value) || null)}><option value="">None</option>{items.map(item => <option value={item.id} key={item.id}>{item.originalFilename || `Image ${item.id}`}</option>)}</select>
        <input type="file" aria-label={`Upload ${label}`} accept="image/jpeg,image/png,image/webp" onChange={e => upload(e, key)} />
      </label>)}
      {[["showTable", "តុ និងកៅអី · Table & seat"], ["showSeatCount", "ចំនួនភ្ញៀវ · Guest count"], ["showGroup", "ក្រុមភ្ញៀវ · Guest group"]].map(([key, label]) => <label className="ticket-checkbox" key={key}><input type="checkbox" checked={design[key]} onChange={e => update(key, e.target.checked)} />{label}</label>)}
      <button type="button" onClick={() => { if (window.confirm("Discard unsaved ticket design changes?")) setDesign(JSON.parse(baseline)); }}>Reset changes</button>
    </fieldset><div><label className="ticket-guest-select">មើលជាមុន · Preview recipient<select value={guestId} onChange={e => setGuestId(e.target.value)}><option value="">General invitation · no guest check-in</option>
      {state.guests.map(guest => <option key={guest.id} value={guest.id}>{guest.guestName}</option>)}</select></label>
      {preview && <><TicketPreview ticket={preview} onReady={setReady} /><TicketActions ticket={preview} ready={ready && !dirty} />{dirty && <p>Save the design before downloading or sharing.</p>}</>}
    </div></div>
  </section>;
}
