import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarHeart } from "lucide-react";
import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { eventPath } from "../workspace/eventRoutes";
import { EVENT_TYPES, STYLE_LABELS, eventPayload } from "./eventFields";
import EventFields from "./EventFields.jsx";
import "../workspace/EventWorkspace.css";

export default function EventWizard() {
  const en = useLanguageStore(s => s.lang) === "en";
  const { user } = useAuth();
  const navigate = useNavigate();
  const storageKey = `koupreng.onboarding.${user?.id}`;
  const [initial] = useState(() => { try { return JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch { return {}; } });
  const [step, setStep] = useState(0);
  const [type, setType] = useState(initial.type || "WEDDING");
  const [style, setStyle] = useState(initial.style || "");
  const [language, setLanguage] = useState(initial.language || "KH");
  const [price, setPrice] = useState(initial.price || "ALL");
  const [templateId, setTemplateId] = useState(initial.templateId || "");
  const [form, setForm] = useState(initial.form || {});
  const [requestId] = useState(() => initial.requestId || crypto.randomUUID());
  const [catalog, setCatalog] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const submitting = useRef(false);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ type, style, language, price, templateId, form, requestId })); }
    catch { /* Keep the in-memory form usable when browser persistence is unavailable. */ }
  }, [storageKey, type, style, language, price, templateId, form, requestId]);
  useEffect(() => {
    let active = true;
    templateCatalogService.list().then(items => { if (active) setCatalog(items); })
      .catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => {
    if (step !== 4) return;
    let active = true;
    api.get("/v1/templates/recommendations", { skipAuth: true, params: { eventType: type, style: style || undefined, language, pricePreference: price } })
      .then(unwrap).then(items => { if (active) setRecommendations(items); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type, style, language, price, step, retry]);
  const styles = [...new Set(catalog.filter(t => t.supportedEventTypes?.includes(type)).map(t => t.category))].filter(Boolean);
  const steps = en ? ["Event type", "Preferred style", "Language", "Template pricing", "Compatible templates", "Event details"]
    : ["ប្រភេទកម្មវិធី", "រចនាប័ទ្ម", "ភាសា", "តម្លៃគំរូ", "គំរូសមស្រប", "ព័ត៌មានកម្មវិធី"];
  const move = next => { setError(""); setLoading(true); setStep(next); };
  const save = async e => {
    e.preventDefault();
    if (submitting.current || !templateId) return;
    submitting.current = true; setSaving(true); setError("");
    try {
      const event = await invitationService.create({ ...eventPayload(form, type), templateId: Number(templateId), languageMode: language, visibility: "PRIVATE", clientRequestId: requestId });
      if (!event?.id) throw new Error(en ? "The server did not return an event." : "ម៉ាស៊ីនមេមិនបានបញ្ជាក់កម្មវិធី។");
      sessionStorage.removeItem(storageKey);
      navigate(eventPath(event.id), { replace: true });
    } catch (err) { setError(err.message); }
    finally { submitting.current = false; setSaving(false); }
  };
  return <main className="event-wizard">
    <Link to="/app/events">← {en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}</Link>
    <h1>{en ? "Create your event" : "បង្កើតកម្មវិធីរបស់អ្នក"}</h1>
    <p role="status">{step + 1} / 6 · {steps[step]}</p>
    <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
    {error && <div role="alert"><p>{error}</p><p>{en ? "Your setup is saved in this tab. You can retry safely." : "ព័ត៌មានត្រូវបានរក្សាទុកក្នុងផ្ទាំងនេះ។ អ្នកអាចព្យាយាមម្ដងទៀត។"}</p><button type="button" onClick={() => { setError(""); setLoading(true); setRetry(n => n + 1); }}>{en ? "Retry loading" : "ទាញយកម្ដងទៀត"}</button></div>}
    {step === 0 && <div className="event-wizard-grid">{EVENT_TYPES.map(([value, kh, english]) => <button type="button" key={value} aria-pressed={type === value} onClick={() => { setType(value); setTemplateId(""); setStyle(""); setForm({}); }}><CalendarHeart size={22} aria-hidden="true" /> {en ? english : kh}</button>)}</div>}
    {step === 1 && <label>{en ? "Preferred style" : "រចនាប័ទ្មដែលចូលចិត្ត"}<select value={style} onChange={e => { setStyle(e.target.value); setTemplateId(""); }}><option value="">{en ? "All available styles" : "គ្រប់រចនាប័ទ្ម"}</option>{styles.map(value => <option key={value} value={value}>{STYLE_LABELS[value]?.[en ? 1 : 0] || value}</option>)}</select></label>}
    {step === 2 && <label>{en ? "Invitation language" : "ភាសាសំបុត្រអញ្ជើញ"}<select value={language} onChange={e => { setLanguage(e.target.value); setTemplateId(""); }}><option value="KH">ខ្មែរ</option><option value="EN">English</option><option value="BOTH">ខ្មែរ / English</option></select></label>}
    {step === 3 && <label>{en ? "Template pricing" : "តម្លៃគំរូ"}<select value={price} onChange={e => { setPrice(e.target.value); setTemplateId(""); }}><option value="ALL">{en ? "All compatible templates" : "គ្រប់គំរូសមស្រប"}</option><option value="FREE">{en ? "Free" : "ឥតគិតថ្លៃ"}</option><option value="PREMIUM">{en ? "Premium" : "គំរូបង់ប្រាក់"}</option></select></label>}
    {step === 4 && <>
      {loading ? <p role="status">{en ? "Finding compatible templates…" : "កំពុងស្វែងរកគំរូសមស្រប…"}</p> : <>
        {recommendations.length === 0 && <p>{en ? "No templates support these event, language and price filters. Change your preferences." : "មិនមានគំរូសមស្របនឹងជម្រើសនេះទេ។ សូមប្ដូរជម្រើស។"}</p>}
        {recommendations.length > 0 && !recommendations.some(r => r.styleMatch) && <p>{en ? "No exact style match. These alternatives support your event and language." : "មិនមានរចនាប័ទ្មត្រូវគ្នាទេ។ គំរូទាំងនេះគាំទ្រកម្មវិធី និងភាសារបស់អ្នក។"}</p>}
        <div className="event-wizard-grid">{recommendations.map(({ template: t }) => <article className="event-wizard-card" key={t.id}>
          <img src={t.thumbnailUrl} alt={t.name} loading="lazy" /><h3>{t.name}</h3>
          <p>{t.supportedEventTypes.map(value => EVENT_TYPES.find(row => row[0] === value)?.[en ? 2 : 1] || value).join(" · ")}</p>
          <p>{STYLE_LABELS[t.category]?.[en ? 1 : 0]} · {t.supportedLanguages.join(" / ")}</p>
          <p>{t.premium || Number(t.price) > 0 ? `${t.price} ${t.currency} · Premium` : en ? "Free" : "ឥតគិតថ្លៃ"}</p>
          <a href={`/templates/${encodeURIComponent(t.code)}`} target="_blank" rel="noreferrer">{en ? "Preview" : "មើលជាមុន"}</a>{" "}
          <button type="button" aria-pressed={String(templateId) === String(t.id)} onClick={() => setTemplateId(t.id)}>{en ? "Select" : "ជ្រើសរើស"} {t.name}</button>
        </article>)}</div>
      </>}
    </>}
    {step === 5 && <form onSubmit={save} aria-busy={saving}><EventFields type={type} en={en} form={form} setForm={setForm} /><p>{en ? "You can add guests, media and more after saving." : "អ្នកអាចបន្ថែមភ្ញៀវ រូបភាព និងព័ត៌មានផ្សេងៗ ក្រោយរក្សាទុក។"}</p><button type="submit" disabled={saving}>{saving ? en ? "Saving…" : "កំពុងរក្សាទុក…" : en ? "Create event" : "រក្សាទុកកម្មវិធី"}</button></form>}
    <div className="event-wizard-actions">{step > 0 && <button type="button" disabled={saving} onClick={() => move(step - 1)}>{en ? "Back" : "ត្រឡប់"}</button>}{step < 5 && <button type="button" disabled={step === 4 && (loading || !templateId || !recommendations.some(r => String(r.template.id) === String(templateId)))} onClick={() => move(step + 1)}>{en ? "Continue" : "បន្ត"}</button>}</div>
  </main>;
}
