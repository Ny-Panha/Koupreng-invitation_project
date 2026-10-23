import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventWorkspace } from "../workspace/EventContext";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { eventPath } from "../workspace/eventRoutes";
import { eventPayload } from "./eventFields";
import EventFields from "./EventFields.jsx";

function readContent(value) {
  try { const parsed = JSON.parse(value || "{}"); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; }
  catch { return {}; }
}

export default function EventDetails() {
  const uiCopy = useUiCopy();
  const { event, eventId, updateEvent } = useEventWorkspace();
  const [form, setForm] = useState(() => ({ ...event }));
  const [content] = useState(() => readContent(event.contentJson));
  const [contact, setContact] = useState(content.contact || {});
  const [schedule, setSchedule] = useState(Array.isArray(content.schedule) ? content.schedule : []);
  const generic = event.templateCode === "event-essential";
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const navigate = useNavigate();
  const en = useLanguageStore(s => s.lang) === "en";
  const save = async e => {
    e.preventDefault(); if (busy.current) return;
    busy.current = true; setSaving(true); setError("");
    try {
      const payload = eventPayload(form, event.eventType);
      if (generic) payload.contentJson = JSON.stringify({ ...readContent(payload.contentJson), messageText: form.storyText || "", contact, schedule });
      const saved = await invitationService.update(eventId, payload);
      updateEvent(saved); navigate(eventPath(eventId));
    }
    catch (err) { setError(err.message); }
    finally { busy.current = false; setSaving(false); }
  };
  return <main className="event-wizard"><h2>{en ? "Event details" : "ព័ត៌មានកម្មវិធី"}</h2>{error && <p role="alert">{error}</p>}<form onSubmit={save} aria-busy={saving}>
    <EventFields form={form} setForm={setForm} type={event.eventType} en={en} />
    {generic && <>
      <label>{en ? "Invitation message or description (optional)" : "សារអញ្ជើញ ឬការពិពណ៌នា (មិនបាច់បំពេញ)"}<textarea maxLength={5000} value={form.storyText || ""} onChange={e => setForm(current => ({ ...current, storyText: e.target.value }))} /></label>
      <label>{en ? "Invitation language" : "ភាសាសំបុត្រអញ្ជើញ"}<select value={form.languageMode || "KH"} onChange={e => setForm(current => ({ ...current, languageMode: e.target.value }))}><option value="KH">{uiCopy("ភាសាខ្មែរ", "Khmer")}</option><option value="EN">{uiCopy("ភាសាអង់គ្លេស", "English")}</option><option value="BOTH">{uiCopy("ភាសាខ្មែរ និងអង់គ្លេស", "Khmer and English")}</option></select></label>
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
    <label>{en ? "Invitation visibility" : "ការមើលសំបុត្រអញ្ជើញ"}<select value={form.visibility || "PRIVATE"} onChange={e => setForm(current => ({ ...current, visibility: e.target.value }))}>
      <option value="PRIVATE">{en ? "Private" : "ឯកជន"}</option><option value="PUBLIC">{en ? "Public when published" : "សាធារណៈពេលផ្សាយ"}</option><option value="PASSWORD_PROTECTED">{en ? "Password protected" : "ការពារដោយពាក្យសម្ងាត់"}</option>
    </select></label>
    {form.visibility === "PASSWORD_PROTECTED" && <label>{en ? "Invitation password (leave blank to keep the current password)" : "ពាក្យសម្ងាត់សំបុត្រអញ្ជើញ (ទុកទទេដើម្បីរក្សាពាក្យសម្ងាត់ចាស់)"}<input type="password" autoComplete="new-password" value={form.accessPassword || ""} onChange={e => setForm(current => ({ ...current, accessPassword: e.target.value }))} /></label>}
    <button disabled={saving} type="submit">{saving ? en ? "Saving…" : "កំពុងរក្សាទុក…" : en ? "Save details" : "រក្សាទុក"}</button></form></main>;
}
