import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useEventWorkspace } from "../workspace/EventContext";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { eventPath } from "../workspace/eventRoutes";
import { eventPayload } from "./eventFields";
import EventFields from "./EventFields.jsx";
import './EventDetails.css';

function readContent(value) {
  try { const parsed = JSON.parse(value || "{}"); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; }
  catch { return {}; }
}

export default function EventDetails() {
  const { event, eventId, updateEvent } = useEventWorkspace();
  const [form, setForm] = useState(() => {
    const content = readContent(event.contentJson);
    return { ...event, venueAddress: event.venueAddress ?? content.venueAddress ?? content.event?.venueAddress ?? '',
      googleMapUrl: event.googleMapUrl ?? content.googleMapUrl ?? content.event?.mapLink ?? '' };
  });
  const [content] = useState(() => readContent(event.contentJson));
  const [contact, setContact] = useState(content.contact || {});
  const [schedule, setSchedule] = useState(Array.isArray(content.schedule) ? content.schedule : []);
  const generic = event.templateCode === "event-essential";
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const busy = useRef(false);
  const en = useLanguageStore(s => s.lang) === "en";
  const save = async e => {
    e.preventDefault(); if (busy.current) return;
    busy.current = true; setSaving(true); setSaved(false); setError("");
    try {
      const payload = eventPayload(form, event.eventType);
      if (generic) payload.contentJson = JSON.stringify({ ...readContent(payload.contentJson), messageText: form.storyText || "", contact, schedule });
      const saved = await invitationService.update(eventId, payload);
      updateEvent(saved); setForm(current => ({ ...current, ...saved, accessPassword: '' })); setSaved(true);
    }
    catch (err) { setError(err.message); }
    finally { busy.current = false; setSaving(false); }
  };
  return <main className="event-wizard event-settings workspace-page"><header className="workspace-page-heading"><div><h1>{en ? "Event settings" : "ការកំណត់កម្មវិធី"}</h1><p>{en ? 'Keep your invitation details, venue and visibility up to date.' : 'កែព័ត៌មានធៀប ទីកន្លែង និងការមើលកម្មវិធីរបស់អ្នក។'}</p></div><Link className="workspace-button" to={eventPath(eventId, 'invitation')}>{en ? 'Open invitation Studio' : 'បើករចនាធៀប'}</Link></header>{error && <p role="alert">{error}</p>}<form onSubmit={save} onChangeCapture={() => setSaved(false)} aria-busy={saving}>
    <EventFields grouped form={form} setForm={setForm} type={event.eventType} en={en} />
    {/https?:\/\//i.test(form.venueAddress || '') && <p className="workspace-notice">{en ? 'The saved address contains a link. Review the address and Maps link separately before changing them.' : 'អាសយដ្ឋានដែលរក្សាទុកមានតំណភ្ជាប់។ សូមពិនិត្យអាសយដ្ឋាន និងតំណផែនទីដោយឡែកមុនកែប្រែ។'}</p>}
    {generic && <>
      <label>{en ? "Invitation message or description (optional)" : "សារអញ្ជើញ ឬការពិពណ៌នា (មិនបាច់បំពេញ)"}<textarea maxLength={5000} value={form.storyText || ""} onChange={e => setForm(current => ({ ...current, storyText: e.target.value }))} /></label>
      <label>{en ? "Invitation language" : "ភាសាសំបុត្រអញ្ជើញ"}<select value={form.languageMode || "KH"} onChange={e => setForm(current => ({ ...current, languageMode: e.target.value }))}><option value="KH">ខ្មែរ</option><option value="EN">English</option><option value="BOTH">ខ្មែរ / English</option></select></label>
      <fieldset><legend>{en ? "Contact (optional)" : "ទំនាក់ទំនង (មិនបាច់បំពេញ)"}</legend>
        {[["name", "ឈ្មោះទំនាក់ទំនង", "Contact name", "text"], ["phone", "លេខទូរស័ព្ទ", "Phone", "tel"], ["email", "អ៊ីមែល", "Email", "email"]].map(([key, kh, english, type]) =>
          <label key={key}>{en ? english : kh}<input type={type} maxLength={key === "phone" ? 30 : 255} value={contact[key] || ""} onChange={e => setContact(current => ({ ...current, [key]: e.target.value }))} /></label>)}
      </fieldset>
      <fieldset><legend>{en ? "Schedule (optional)" : "កាលវិភាគ (មិនបាច់បំពេញ)"}</legend>
        {schedule.map((item, index) => <div className="event-wizard-card" key={index}>
          <label>{en ? "Time" : "ម៉ោង"}<input type="time" value={item.time || ""} onChange={e => setSchedule(current => current.map((row, i) => i === index ? { ...row, time: e.target.value } : row))} /></label>
          <label>{en ? "Activity" : "សកម្មភាព"}<input required maxLength={255} value={item.title || ""} onChange={e => setSchedule(current => current.map((row, i) => i === index ? { ...row, title: e.target.value } : row))} /></label>
          <button type="button" onClick={() => setSchedule(current => current.filter((_, i) => i !== index))}>{en ? "Remove activity" : "លុបសកម្មភាព"}</button>
        </div>)}
        <button type="button" disabled={schedule.length >= 20} onClick={() => setSchedule(current => [...current, { time: "", title: "" }])}>{en ? "Add activity" : "បន្ថែមសកម្មភាព"}</button>
      </fieldset>
    </>}
    <fieldset className="event-settings-section"><legend>{en ? 'Invitation visibility' : 'ការមើលធៀបអញ្ជើញ'}</legend><label>{en ? "Invitation visibility" : "ការមើលសំបុត្រអញ្ជើញ"}<select value={form.visibility || "PRIVATE"} onChange={e => setForm(current => ({ ...current, visibility: e.target.value }))}>
      <option value="PRIVATE">{en ? "Private" : "ឯកជន"}</option><option value="PUBLIC">{en ? "Public when published" : "សាធារណៈពេលផ្សាយ"}</option><option value="PASSWORD_PROTECTED">{en ? "Password protected" : "ការពារដោយពាក្យសម្ងាត់"}</option>
    </select></label>
    {form.visibility === "PASSWORD_PROTECTED" && <label>{en ? "Invitation password (leave blank to keep the current password)" : "ពាក្យសម្ងាត់សំបុត្រអញ្ជើញ (ទុកទទេដើម្បីរក្សាពាក្យសម្ងាត់ចាស់)"}<input type="password" autoComplete="new-password" value={form.accessPassword || ""} onChange={e => setForm(current => ({ ...current, accessPassword: e.target.value }))} /></label>}
    </fieldset><div className="event-settings-save"><button className="workspace-button primary" disabled={saving} type="submit">{saving ? en ? "Saving…" : "កំពុងរក្សាទុក…" : en ? "Save details" : "រក្សាទុក"}</button><span role="status">{saved ? en ? 'Saved to event' : 'បានរក្សាទុកទៅកម្មវិធី' : ''}</span></div></form></main>;
}
