import { useEffect, useRef, useState } from "react";
import { Link, useBeforeUnload, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Cake, Check, Heart, PartyPopper, Sparkles, Users } from "lucide-react";
import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { getTemplateIntent, clearTemplateIntent, findMatchingTemplate } from "@/features/templates/model/templateIntent";
import subscriptionService from "@/features/subscriptions/subscriptionService";
import { paymentService } from "@/features/payments/paymentService";
import { packagePrice } from "@/features/marketing/model/packagePresentation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { eventPath } from "../workspace/eventRoutes";
import { EVENT_TYPES, STYLE_LABELS, eventPayload } from "./eventFields.js";
import { validateEventForm } from "./eventCreation.js";
import EventFields from "./EventFields.jsx";
import "@/shared/styles/workspace-ui.css";
import "./EventCreatePage.css";

const TYPE_ICONS = { WEDDING: Heart, ENGAGEMENT: Users, BIRTHDAY: Cake, ANNIVERSARY: Sparkles, CORPORATE: BriefcaseBusiness, OTHER: PartyPopper };

export default function EventCreatePage() {
  const en = useLanguageStore(state => state.lang) === "en";
  const copy = (kh, english) => en ? english : kh;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTemplateKey = searchParams.get("template") || searchParams.get("templateCode") || searchParams.get("templateId") || searchParams.get("tpl") || "";
  const initialIntentKey = useRef(urlTemplateKey || getTemplateIntent() || "");
  const intentConsumed = useRef(false);
  const storageKey = `koupreng.onboarding.${user?.id}`;
  const [initial] = useState(() => { try { return JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch { return {}; } });
  const [type, setType] = useState(EVENT_TYPES.some(row => row[0] === initial.type) ? initial.type : "WEDDING");
  const [style, setStyle] = useState(initial.style || "");
  const [language, setLanguage] = useState(initial.language || (en ? "EN" : "KH"));
  const [price, setPrice] = useState(initial.price || "ALL");
  const [templateId, setTemplateId] = useState(initial.templateId || initialIntentKey.current || "");
  const [form, setForm] = useState(initial.form || {});
  const [requestId] = useState(() => initial.requestId || crypto.randomUUID());
  const [catalog, setCatalog] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [plan, setPlan] = useState(null);
  const [access, setAccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const submitting = useRef(false);
  const saved = useRef(false);
  const templateSection = useRef(null);
  const dirty = Object.values(form).some(value => !!value);

  useBeforeUnload(event => { if (dirty && !saved.current) { event.preventDefault(); event.returnValue = ""; } });
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ type, style, language, price, templateId, form, requestId })); setStorageError(false); }
    catch { setStorageError(true); }
  }, [storageKey, type, style, language, price, templateId, form, requestId]);
  useEffect(() => {
    let active = true;
    templateCatalogService.list().then(items => { if (active) setCatalog(items); }).catch(() => { /* Recommendations remain independently usable. */ });
    subscriptionService.current().then(value => { if (active) setPlan(value); }).catch(() => { /* Do not infer a subscription from unavailable account data. */ });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setRecommendationError("");
    api.get("/v1/templates/recommendations", { skipAuth: true, params: { eventType: type, style: style || undefined, language, pricePreference: price } })
      .then(unwrap).then(items => {
        if (!active) return;
        setRecommendations(items);
        setTemplateId(current => {
          const target = current || (!intentConsumed.current ? initialIntentKey.current : "");
          if (!target) return "";
          const found = items.find(row => String(row.template.id) === String(target) || String(row.template.code || "").toLowerCase() === String(target).toLowerCase() || String(row.template.slug || "").toLowerCase() === String(target).toLowerCase());
          return found ? found.template.id : (items.some(row => String(row.template.id) === String(current)) ? current : "");
        });
      })
      .catch(err => { if (active) { setRecommendations([]); setRecommendationError(err.message); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type, style, language, price, retry]);
  useEffect(() => {
    if (intentConsumed.current || !initialIntentKey.current) return;
    const all = [...recommendations.map(r => r.template), ...catalog].filter(Boolean);
    const match = findMatchingTemplate(all, initialIntentKey.current);
    if (match) {
      intentConsumed.current = true;
      clearTemplateIntent();
      setTemplateId(match.id);
      if (Array.isArray(match.supportedEventTypes) && match.supportedEventTypes.length > 0 && !match.supportedEventTypes.includes(type)) {
        setType(match.supportedEventTypes[0]);
      }
      setRecommendations(current => {
        if (current.some(r => String(r.template?.id) === String(match.id))) return current;
        return [{ template: match, styleMatch: true }, ...current];
      });
    }
  }, [catalog, recommendations, type]);
  useEffect(() => {
    let active = true;
    const premium = recommendations.map(row => row.template).filter(template => template.premium || Number(template.price) > 0);
    Promise.allSettled(premium.map(template => paymentService.templateAccess(template.id).then(result => [template.id, result.hasAccess === true])))
      .then(results => { if (active) setAccess(Object.fromEntries(results.filter(result => result.status === "fulfilled").map(result => result.value))); });
    return () => { active = false; };
  }, [recommendations]);
  const styles = [...new Set(catalog.filter(item => item.supportedEventTypes?.includes(type)).map(item => item.category))].filter(Boolean);
  const selectedTemplate = !loading && recommendations.find(row => String(row.template.id) === String(templateId))?.template;
  const allErrors = validateEventForm(form, type, { draft: submitted === "draft", en });
  const errors = Object.fromEntries(Object.entries(allErrors).filter(([key]) => submitted || touched[key]));
  const changeType = value => {
    intentConsumed.current = true;
    clearTemplateIntent();
    setType(value); setTemplateId(""); setStyle(""); setTouched({}); setSubmitted(null); setError("");
    // Preserve common details and translate participant fields without discarding prior entries.
    setForm(current => ({ ...current, hostName: current.hostName || current.groomName || "", partnerName: current.partnerName || current.brideName || "", groomName: current.groomName || current.hostName || "", brideName: current.brideName || current.partnerName || "" }));
  };
  const save = async mode => {
    if (submitting.current) return;
    setSubmitted(mode); setError("");
    const validation = validateEventForm(form, type, { draft: mode === "draft", en });
    const firstError = Object.keys(validation)[0];
    if (firstError) {
      document.getElementById(`event-${firstError}`)?.focus();
      return;
    }
    if (selectedTemplate && access[selectedTemplate.id] === false) {
      setError(copy("គំរូនេះត្រូវការសិទ្ធិប្រើប្រាស់។ សូមជ្រើសគំរូឥតគិតថ្លៃ ឬទិញសិទ្ធិជាមុន។", "This template requires access. Choose a free template or purchase access first."));
      templateSection.current?.focus(); return;
    }
    if (mode !== "draft" && !selectedTemplate) {
      setError(copy("សូមជ្រើសរើសគំរូសមស្របមុនបង្កើតកម្មវិធី។", "Choose a compatible template before creating your event."));
      templateSection.current?.focus();
      return;
    }
    submitting.current = true; setSaving(true);
    try {
      const details = { ...form, title: form.title.trim(), eventDate: form.eventDate || undefined, eventTime: form.eventTime || undefined };
      // Only details for the current type are transmitted; hidden values stay in this tab.
      if (type !== "WEDDING") { details.groomName = ""; details.brideName = ""; }
      if (!["WEDDING", "ENGAGEMENT", "ANNIVERSARY"].includes(type)) details.partnerName = "";
      if (selectedTemplate?.code === "event-essential" && form.storyText) details.contentJson = JSON.stringify({ messageText: form.storyText });
      const event = await invitationService.create({ ...eventPayload(details, type), templateId: selectedTemplate?.id || undefined, languageMode: language, visibility: "PRIVATE", clientRequestId: requestId });
      if (!/^[1-9]\d*$/.test(String(event?.id || ""))) throw new Error(copy("ម៉ាស៊ីនមេមិនបានបញ្ជាក់កម្មវិធី។", "The server did not return an event ID. Retry safely."));
      saved.current = true;
      clearTemplateIntent();
      try { sessionStorage.removeItem(storageKey); } catch { /* A successful backend save must still open its workspace. */ }
      navigate(eventPath(event.id), { replace: true });
    } catch (err) { setError(err.message || copy("មិនអាចរក្សាទុកកម្មវិធីបានទេ។", "Could not save your event.")); }
    finally { submitting.current = false; setSaving(false); }
  };

  return <main className="workspace-page event-create" lang={en ? "en" : "km"}>
    <Link className="event-create-back" to="/app/events"><ArrowLeft size={18} aria-hidden="true" />{copy("កម្មវិធីរបស់ខ្ញុំ", "My Events")}</Link>
    <header className="workspace-heading"><h1>{copy("បង្កើតកម្មវិធីរបស់អ្នក", "Bring your event together")}</h1><p>{copy("បំពេញព័ត៌មានសំខាន់ៗ និងជ្រើសរើសគំរូនៅក្នុងទំព័រតែមួយ។ អ្នកអាចកែប្រែបន្ថែមនៅពេលក្រោយ។", "Add the essentials and choose an invitation, all in one place. You can refine the details later.")}</p></header>
    <form noValidate onSubmit={event => { event.preventDefault(); save("create"); }} aria-busy={saving} className="event-create-layout">
      <fieldset disabled={saving} className="event-create-sections">
        <section className="workspace-section" aria-labelledby="event-type-title"><h2 id="event-type-title">{copy("ប្រភេទកម្មវិធី", "What are you celebrating?")}</h2><div className="event-type-grid">{EVENT_TYPES.map(([value, kh, english]) => {
          const Icon = TYPE_ICONS[value];
          return <button type="button" className="event-type-option" key={value} aria-pressed={type === value} onClick={() => changeType(value)}><Icon size={24} aria-hidden="true" /><span>{en ? english : kh}</span>{type === value && <Check size={16} aria-hidden="true" />}</button>;
        })}</div></section>
        <section className="workspace-section" aria-labelledby="event-information-title"><div className="workspace-section-heading"><h2 id="event-information-title">{copy("ព័ត៌មានកម្មវិធី", "Event essentials")}</h2><span className="workspace-muted">{copy("* ត្រូវបំពេញសម្រាប់បង្កើតកម្មវិធី", "* Required to create")}</span></div><EventFields form={form} setForm={setForm} type={type} en={en} errors={errors} onBlur={key => setTouched(current => ({ ...current, [key]: true }))} draft={submitted === "draft"} /></section>
        <section className="workspace-section" aria-labelledby="event-preferences-title"><h2 id="event-preferences-title">{copy("រចនាប័ទ្ម និងភាសា", "Make it feel like your event")}</h2><div className="event-preferences">
          <label>{copy("រចនាប័ទ្ម", "Design style")}<select value={style} onChange={event => setStyle(event.target.value)}><option value="">{copy("គ្រប់រចនាប័ទ្ម", "All available styles")}</option>{styles.map(value => <option key={value} value={value}>{STYLE_LABELS[value]?.[en ? 1 : 0] || value}</option>)}</select></label>
          <label>{copy("ភាសាសំបុត្រអញ្ជើញ", "Invitation language")}<select value={language} onChange={event => setLanguage(event.target.value)}><option value="KH">ខ្មែរ</option><option value="EN">English</option><option value="BOTH">ខ្មែរ / English</option></select></label>
          <label>{copy("តម្លៃគំរូ", "Template price")}<select value={price} onChange={event => setPrice(event.target.value)}><option value="ALL">{copy("គ្រប់តម្លៃ", "All prices")}</option><option value="FREE">{copy("ឥតគិតថ្លៃ", "Free")}</option><option value="PREMIUM">{copy("គំរូបង់ប្រាក់", "Premium")}</option></select></label>
        </div></section>
        <section ref={templateSection} tabIndex={-1} className="workspace-section event-template-section" aria-labelledby="event-templates-title" aria-busy={loading}>
          <h2 id="event-templates-title">{copy("គំរូដែលសាកសមសម្រាប់កម្មវិធីរបស់អ្នក", "Invitations that fit")}</h2><p className="workspace-muted">{copy("គំរូទាំងនេះគាំទ្រប្រភេទកម្មវិធី និងភាសាដែលអ្នកជ្រើសរើស។", "These templates support your event type and invitation language.")}</p>
          {loading ? <div className="event-template-loading" role="status">{copy("កំពុងស្វែងរកគំរូសមស្រប…", "Finding compatible invitations…")}<div className="event-template-skeleton" aria-hidden="true" /></div> : recommendationError ? <div className="workspace-notice" role="alert"><p>{recommendationError}</p><button className="workspace-button" type="button" onClick={() => setRetry(value => value + 1)}>{copy("ទាញយកម្ដងទៀត", "Retry templates")}</button></div> : <>
            {!recommendations.length && <div className="workspace-notice"><p>{copy("មិនមានគំរូគាំទ្រជម្រើសទាំងនេះទេ។ សូមប្ដូរភាសា ឬតម្លៃ។ អ្នកអាចរក្សាទុកព្រាងដោយមិនជ្រើសគំរូ។", "No templates support these preferences. Try another language or price filter, or save a draft without a template.")}</p><button className="workspace-button" type="button" onClick={() => { setStyle(""); setPrice("ALL"); }}>{copy("មើលគ្រប់តម្លៃ និងរចនាប័ទ្ម", "Show all prices and styles")}</button></div>}
            {!!recommendations.length && !recommendations.some(row => row.styleMatch) && <p className="workspace-notice">{copy("មិនមានរចនាប័ទ្មត្រូវគ្នាទេ។ គំរូជំនួសទាំងនេះគាំទ្រកម្មវិធី និងភាសារបស់អ្នក។", "No exact style match. These alternatives support your event and language.")}</p>}
            <div className="event-template-grid">{recommendations.map(({ template }) => <article className={`event-template-card ${String(templateId) === String(template.id) ? "is-selected" : ""}`} key={template.id}>
              <img src={template.thumbnailUrl || "/templates/event-essential.svg"} alt={template.name} loading="lazy" /><div className="event-template-content"><h3>{template.name}</h3><p>{STYLE_LABELS[template.category]?.[en ? 1 : 0] || template.category}</p><p>{template.premium || Number(template.price) > 0 ? `${packagePrice(template, en ? "en" : "km") || copy("តម្លៃមិនបានបញ្ជាក់", "Price not specified")} · Premium` : copy("ឥតគិតថ្លៃ", "Free")}</p>{(template.premium || Number(template.price) > 0) && <small>{copy("សិទ្ធិប្រើប្រាស់នឹងត្រូវពិនិត្យពេលរក្សាទុក។", "Access is verified when you save.")}</small>}
                {access[template.id] === true && <small>{copy("មានសិទ្ធិប្រើប្រាស់", "Included in your access")}</small>}
                <div className="event-template-actions"><a href={`/templates/${encodeURIComponent(template.code)}`} target="_blank" rel="noreferrer" aria-label={`${copy("មើលជាមុន", "Preview")} ${template.name} (${copy("ផ្ទាំងថ្មី", "new tab")})`}>{copy("មើលជាមុន", "Preview")}</a>{access[template.id] === false ? <a href={`/templates/${template.id}/checkout`} target="_blank" rel="noreferrer">{copy("ទិញសិទ្ធិ (ផ្ទាំងថ្មី)", "Get access (new tab)")}</a> : <button className="workspace-button" type="button" aria-pressed={String(templateId) === String(template.id)} aria-label={`${copy("ជ្រើសរើស", "Select")} ${template.name}`} onClick={() => setTemplateId(template.id)}>{String(templateId) === String(template.id) ? <><Check size={16} aria-hidden="true" />{copy("បានជ្រើសរើស", "Selected")}</> : copy("ជ្រើសរើស", "Select")}</button>}</div>
              </div></article>)}</div>
          </>}
        </section>
        <details className="workspace-section event-additional"><summary>{copy("ព័ត៌មានបន្ថែម (មិនបាច់បំពេញ)", "A personal touch (optional)")}</summary><label>{copy("សារអញ្ជើញ ឬការពិពណ៌នា", "Invitation message or description")}<textarea rows={4} maxLength={5000} value={form.storyText || ""} onChange={event => setForm(current => ({ ...current, storyText: event.target.value }))} placeholder={copy("សរសេរសារជូនភ្ញៀវរបស់អ្នក…", "A few words to welcome your guests…")} /></label></details>
        <section className="event-create-final">
          {error && <div role="alert" className="workspace-notice"><p>{error}</p><p>{copy("ព័ត៌មានរបស់អ្នកនៅតែរក្សាទុក។ អ្នកអាចព្យាយាមរក្សាទុកម្ដងទៀតបាន។", "Your details are retained. You can retry saving safely.")}</p></div>}
          <p className="workspace-muted">{copy("កម្មវិធីនឹងត្រូវរក្សាទុកជាឯកជន។ បន្ថែមភ្ញៀវ និងផ្សព្វផ្សាយពីកន្លែងគ្រប់គ្រងកម្មវិធី។", "Your event starts as a private draft. Add guests and publish from its workspace.")}</p>
          <div className="event-create-actions"><button className="workspace-button" type="button" disabled={saving} onClick={() => save("draft")}>{copy("រក្សាទុកព្រាង", "Save draft")}</button><button className="workspace-button primary" type="submit" disabled={saving || loading}>{saving ? copy("កំពុងរក្សាទុក…", "Saving…") : copy("បង្កើតកម្មវិធី", "Create event")}</button></div>
          <p className="event-save-note" role="status">{storageError ? copy("កម្មវិធីរុករកមិនអាចរក្សាទុកព័ត៌មានក្នុងផ្ទាំងនេះបានទេ។ សូមរក្សាទុកព្រាងមុនចាកចេញ។", "This browser cannot retain your setup. Save a draft before leaving.") : copy("ព័ត៌មានត្រូវបានរក្សាទុកក្នុងផ្ទាំងនេះ ខណៈអ្នកកំពុងបំពេញ។", "Your setup is kept in this tab while you work.")}</p>
        </section>
      </fieldset>
      <aside className="event-create-summary workspace-section" aria-label={copy("សង្ខេបកម្មវិធី", "Event summary")}><h2>{copy("កម្មវិធីរបស់អ្នក", "Your event")}</h2><dl>
        <div><dt>{copy("ប្រភេទ", "Type")}</dt><dd>{EVENT_TYPES.find(row => row[0] === type)?.[en ? 2 : 1]}</dd></div><div><dt>{copy("ឈ្មោះ", "Title")}</dt><dd>{form.title || copy("មិនទាន់បំពេញ", "Not added yet")}</dd></div><div><dt>{copy("កាលបរិច្ឆេទ", "Date")}</dt><dd>{form.eventDate || copy("មិនទាន់កំណត់", "Not set yet")}</dd></div><div><dt>{copy("គំរូ", "Invitation")}</dt><dd>{selectedTemplate?.name || copy("មិនទាន់ជ្រើសរើស", "Choose a template")}</dd></div><div><dt>{copy("កញ្ចប់", "Subscription")}</dt><dd>{plan?.active && plan?.status === "ACTIVE" && plan?.paymentStatus === "PAID" ? plan.packagePlan?.packageName : copy("សិទ្ធិនឹងត្រូវពិនិត្យពេលរក្សាទុក", "Eligibility checked when saving")}</dd></div>
      </dl><p className="workspace-muted">{copy("សម្រាប់ព្រាង ត្រូវការតែឈ្មោះកម្មវិធី។", "Only a title is needed to save a draft.")}</p></aside>
    </form>
  </main>;
}
