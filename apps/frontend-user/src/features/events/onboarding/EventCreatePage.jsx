import { feedback } from "@/shared/feedback/feedback";
import QuotaProgress from '@/shared/access/QuotaProgress';
import { useAccountEntitlements } from '@/shared/access/entitlementContext';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useBeforeUnload, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Cake,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  PartyPopper,
  Pencil,
  Sparkles,
  Users,
  Camera,
  RefreshCw
} from "lucide-react";
import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { getTemplateIntent, clearTemplateIntent, findMatchingTemplate, templateIntentFromParams } from "@/features/templates/model/templateIntent";
import subscriptionService from "@/features/subscriptions/subscriptionService";
import { paymentService } from "@/features/payments/paymentService";
import { packagePrice } from "@/features/marketing/model/packagePresentation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { eventPath } from "../workspace/eventRoutes";
import { EVENT_TYPES, STYLE_LABELS, eventPayload } from "./eventFields.js";
import { validateEventForm } from "./eventCreation.js";
import { generateSecureUuid } from "@/shared/utils/uuid";
import EventFields from "./EventFields.jsx";
import EventPhotoUpload from "./EventPhotoUpload.jsx";
import "@/shared/styles/workspace-ui.css";
import "./EventCreatePage.css";

const TYPE_ICONS = {
  WEDDING: Heart,
  ENGAGEMENT: Users,
  BIRTHDAY: Cake,
  ANNIVERSARY: Sparkles,
  CORPORATE: BriefcaseBusiness,
  OTHER: PartyPopper
};

export default function EventCreatePage() {
  const uiCopy = useUiCopy();
  const en = useLanguageStore(state => state.lang) === "en";
  const copy = (kh, english) => en ? english : kh;
  const { user } = useAuth();
  const account = useAccountEntitlements();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasUrlTemplate = ["template", "templateCode", "templateId", "tpl"].some(name => searchParams.has(name));
  const urlTemplateKey = templateIntentFromParams(searchParams);
  const [initialRequestedKey] = useState(() => hasUrlTemplate ? (urlTemplateKey || "") : (getTemplateIntent() || ""));
  const initialIntentKey = useRef(initialRequestedKey);
  const intentConsumed = useRef(false);
  const intentTemplate = useRef(null);
  const clearUrlIntent = useCallback(() => {
    if (!hasUrlTemplate) return;
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      for (const name of ["template", "templateCode", "templateId", "tpl"]) next.delete(name);
      return next;
    }, { replace: true });
  }, [hasUrlTemplate, setSearchParams]);

  const storageKey = `koupreng.onboarding.${user?.id}`;
  const [initial] = useState(() => { try { return JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch { return {}; } });
  const [type, setType] = useState(EVENT_TYPES.some(row => row[0] === initial.type) ? initial.type : "WEDDING");
  const [style, setStyle] = useState(initial.style || "");
  const [language, setLanguage] = useState(initial.language || (en ? "EN" : "KH"));
  const [price, setPrice] = useState(initial.price || "ALL");
  const [templateId, setTemplateId] = useState(initialRequestedKey || (hasUrlTemplate ? "" : initial.templateId) || "");
  const [form, setForm] = useState(initial.form || {});
  const [requestId] = useState(() => initial.requestId || generateSecureUuid());
  const [catalog, setCatalog] = useState([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [intentNotice, setIntentNotice] = useState(hasUrlTemplate && !urlTemplateKey ? "invalid" : "");
  const [recommendations, setRecommendations] = useState([]);
  const [browsingDesigns, setBrowsingDesigns] = useState(false);
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
  const [currentStep, setCurrentStep] = useState(1);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [photoFocalPoint, setPhotoFocalPoint] = useState("center");
  const [photoError, setPhotoError] = useState("");
  const [pendingEventId, setPendingEventId] = useState(null);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const submitting = useRef(false);
  const saved = useRef(false);
  const templateSection = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const dirty = Object.values(form).some(value => !!value);

  const scrollToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    const refs = [step1Ref, step2Ref, step3Ref, step4Ref];
    const target = refs[stepNumber - 1]?.current;
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (hasUrlTemplate && !urlTemplateKey) { clearTemplateIntent(); clearUrlIntent(); }
  }, [hasUrlTemplate, urlTemplateKey, clearUrlIntent]);

  useBeforeUnload(event => { if (dirty && !saved.current) { event.preventDefault(); event.returnValue = ""; } });

  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ type, style, language, price, templateId, form, requestId })); setStorageError(false); }
    catch { setStorageError(true); }
  }, [storageKey, type, style, language, price, templateId, form, requestId]);

  useEffect(() => {
    let active = true;
    templateCatalogService.list().then(items => { if (active) { setCatalog(items); setCatalogLoaded(true); } }).catch(() => { /* Recommendations remain independently usable. */ });
    subscriptionService.current().then(value => { if (active) setPlan(value); }).catch(() => { /* Do not infer a subscription from unavailable account data. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true); setRecommendationError("");
    api.get("/v1/templates/recommendations", { skipAuth: true, params: { eventType: type, style: style || undefined, language, pricePreference: price } })
      .then(unwrap).then(items => {
        if (!active) return;
        const preferred = intentTemplate.current;
        if (preferred && preferred.supportedEventTypes?.includes(type)
            && (!preferred.supportedLanguages?.length || preferred.supportedLanguages.includes(language))
            && price === "ALL" && !items.some(row => String(row.template.id) === String(preferred.id))) {
          items = [{ template: preferred, styleMatch: true }, ...items];
        }
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
      intentTemplate.current = match;
      clearTemplateIntent();
      clearUrlIntent();
      setTemplateId(match.id);
      setPrice("ALL");
      setStyle("");
      if (Array.isArray(match.supportedEventTypes) && match.supportedEventTypes.length > 0 && !match.supportedEventTypes.includes(type)) {
        setType(match.supportedEventTypes[0]);
      }
      if (match.supportedLanguages?.length && !match.supportedLanguages.includes(language)) {
        setLanguage(match.supportedLanguages[0]);
      }
      setRecommendations(current => {
        if (current.some(r => String(r.template?.id) === String(match.id))) return current;
        return [{ template: match, styleMatch: true }, ...current];
      });
    } else if (catalogLoaded && !loading && !recommendationError) {
      intentConsumed.current = true;
      initialIntentKey.current = "";
      setTemplateId("");
      setIntentNotice("unavailable");
      clearTemplateIntent();
      clearUrlIntent();
    }
  }, [catalog, recommendations, type, language, catalogLoaded, loading, recommendationError, clearUrlIntent]);

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

  const completedSteps = [];
  if (type) completedSteps.push(1);
  if (form.title?.trim() && (submitted === "draft" || (form.eventDate && form.venueName && (photoFile || submitted === "draft")))) completedSteps.push(2);
  if (templateId) completedSteps.push(3);

  const getParticipantsSummary = () => {
    if (type === "WEDDING") {
      if (form.groomName && form.brideName) return `${form.groomName} & ${form.brideName}`;
      return form.groomName || form.brideName || copy("មិនទាន់បំពេញ", "Not added yet");
    }
    if (type === "ENGAGEMENT" || type === "ANNIVERSARY") {
      if (form.hostName && form.partnerName) return `${form.hostName} & ${form.partnerName}`;
      return form.hostName || form.partnerName || copy("មិនទាន់បំពេញ", "Not added yet");
    }
    return form.hostName || copy("មិនទាន់បំពេញ", "Not added yet");
  };

  const changeType = value => {
    intentConsumed.current = true;
    intentTemplate.current = null;
    clearTemplateIntent();
    clearUrlIntent();
    setType(value); setTemplateId(""); setStyle(""); setTouched({}); setSubmitted(null); setError(""); setPhotoError("");
    setForm(current => ({ ...current, hostName: current.hostName || current.groomName || "", partnerName: current.partnerName || current.brideName || "", groomName: current.groomName || current.hostName || "", brideName: current.brideName || current.partnerName || "" }));
  };

  const selectTemplate = id => {
    intentConsumed.current = true;
    intentTemplate.current = null;
    clearTemplateIntent();
    clearUrlIntent();
    setIntentNotice("");
    setTemplateId(id);
    setBrowsingDesigns(false);
  };

  const save = async mode => {
    if (submitting.current) return;
    setSubmitted(mode); setError(""); setPhotoError("");
    const validation = validateEventForm(form, type, { draft: mode === "draft", en });
    const firstError = Object.keys(validation)[0];
    if (firstError) {
      setCurrentStep(2);
      const errorEl = document.getElementById(`event-${firstError}`);
      errorEl?.focus();
      errorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (mode !== "draft" && !photoFile) {
      setCurrentStep(2);
      const msg = copy(
        "សូមជ្រើសរើសរូបថតកម្មវិធីដើម្បីបង្កើត។",
        "An event photo is required to complete event creation."
      );
      setPhotoError(msg);
      setError(msg);
      const photoEl = document.getElementById("event-photo-upload");
      photoEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (selectedTemplate && access[selectedTemplate.id] === false) {
      setCurrentStep(3);
      setError(copy("គំរូនេះត្រូវការសិទ្ធិប្រើប្រាស់។ សូមជ្រើសគំរូឥតគិតថ្លៃ ឬទិញសិទ្ធិជាមុន។", "This template requires access. Choose a free template or purchase access first."));
      templateSection.current?.focus();
      templateSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (mode !== "draft" && !selectedTemplate) {
      setCurrentStep(3);
      setError(copy("សូមជ្រើសរើសគំរូសមស្របមុនបង្កើតកម្មវិធី។", "Choose a compatible template before creating your event."));
      templateSection.current?.focus();
      templateSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    submitting.current = true; setSaving(true);
    try {
      let eventId = pendingEventId;
      if (!eventId) {
        const details = { ...form, title: form.title.trim(), eventDate: form.eventDate || undefined, eventTime: form.eventTime || undefined };
        if (type !== "WEDDING") { details.groomName = ""; details.brideName = ""; }
        if (!["WEDDING", "ENGAGEMENT", "ANNIVERSARY"].includes(type)) details.partnerName = "";
        const designOverrides = {};
        if (photoFocalPoint && photoFocalPoint !== "center") {
          designOverrides.coverFocalPoint = photoFocalPoint;
        }
        if (selectedTemplate?.code === "event-essential" && form.storyText) details.contentJson = JSON.stringify({ messageText: form.storyText });
        if (Object.keys(designOverrides).length > 0) {
          details.designJson = JSON.stringify(designOverrides);
        }
        const event = await invitationService.create({ ...eventPayload(details, type), templateId: selectedTemplate?.id || undefined, languageMode: language, visibility: "PRIVATE", clientRequestId: requestId });
        if (!/^[1-9]\d*$/.test(String(event?.id || ""))) throw new Error(copy("ម៉ាស៊ីនមេមិនបានបញ្ជាក់កម្មវិធី។", "The server did not return an event ID. Retry safely."));
        eventId = event.id;
        setPendingEventId(eventId);
      }

      if (photoFile && eventId) {
        try {
          await mediaService.uploadCover(eventId, photoFile);
        } catch (uploadErr) {
          feedback.explain(uploadErr);
          setError(copy("បានបង្កើតកម្មវិធីរួចរាល់ ប៉ុន្តែការបញ្ចូលរូបថតមិនជោគជ័យ។ សូមចុច 'ព្យាយាមបញ្ចូលរូបថតម្ដងទៀត'។", "Event created successfully, but photo upload failed. Please click 'Retry photo upload'."));
          return;
        }
      }

      saved.current = true;
      clearTemplateIntent();
      try { sessionStorage.removeItem(storageKey); } catch { /* A successful backend save must still open its workspace. */ }
      navigate(mode === "draft" ? eventPath(eventId) : `${eventPath(eventId)}/invitation?mode=guided`, { replace: true });
    } catch (err) { feedback.explain(err); setError(err.message || copy("មិនអាចរក្សាទុកកម្មវិធីបានទេ។", "Could not save your event.")); }
    finally { if (!saved.current) { submitting.current = false; setSaving(false); } }
  };

  const stepsMeta = [
    { id: 1, label: copy("ប្រភេទកម្មវិធី", "Event Type"), short: copy("ប្រភេទ", "Type") },
    { id: 2, label: copy("ព័ត៌មានកម្មវិធី", "Event Essentials"), short: copy("ព័ត៌មាន", "Details") },
    { id: 3, label: copy("គំរូសំបុត្រអញ្ជើញ", "Choose Design"), short: copy("គំរូ", "Design") },
    { id: 4, label: copy("ពិនិត្យ & បង្កើត", "Review & Create"), short: copy("ពិនិត្យ", "Review") },
  ];

  return (
    <main className="workspace-page event-create" lang={en ? "en" : "km"}>
      <Link className="event-create-back" to="/app/events">
        <ArrowLeft size={18} aria-hidden="true" />
        {copy("កម្មវិធីរបស់ខ្ញុំ", "My Events")}
      </Link>
      <header className="workspace-heading">
        <h1>{copy("បង្កើតកម្មវិធីរបស់អ្នក", "Bring your event together")}</h1>
      </header>

      {/* Modern Accessible Multi-Step Progress Stepper */}
      <div className="event-wizard-stepper-wrap" role="region" aria-label={copy("ដំណើរការបង្កើតកម្មវិធី", "Creation progress")}>
        <div className="event-wizard-stepper-inner">
          <div className="event-wizard-progress-track">
            <div
              className="event-wizard-progress-bar"
              role="progressbar"
              aria-label={copy("វឌ្ឍនភាពនៃការបង្កើតកម្មវិធី", "Event creation progress")}
              aria-valuenow={currentStep * 25}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={copy(`ជំហានទី ${currentStep} នៃ 4`, `Step ${currentStep} of 4`)}
              style={{ width: `${currentStep * 25}%` }}
            />
          </div>
          <nav className="event-wizard-steps" aria-label={copy("ជំហានបង្កើតកម្មវិធី", "Event creation steps")}>
            {stepsMeta.map(step => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`event-wizard-step-btn ${isActive ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => scrollToStep(step.id)}
                >
                  <span className="event-wizard-step-num" aria-hidden="true">
                    {isCompleted ? <Check size={14} strokeWidth={2.5} /> : step.id}
                  </span>
                  <span className="event-wizard-step-label">{step.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {account.verified && <QuotaProgress usage={account.value?.quotas?.invitations} resource="invitations" scope="ACCOUNT" />}

      <form noValidate onSubmit={event => { event.preventDefault(); save("create"); }} aria-busy={saving} className="event-create-layout">
        <fieldset disabled={saving} className="event-create-sections">
          
          {/* STEP 1: CHOOSE EVENT TYPE */}
          <section
            ref={step1Ref}
            id="step-1-type"
            className={`workspace-section event-step-section step-1 ${currentStep === 1 ? "is-step-active" : "is-step-inactive"}`}
            aria-labelledby="event-type-title"
          >
            <div className="event-step-header">
              <div className="event-step-badge-wrap">
                <span className="event-step-badge">{copy("ជំហានទី ១", "Step 1")}</span>
                <span className="event-step-indicator-text">{copy("ជ្រើសរើសប្រភេទកម្មវិធី", "Choose celebration type")}</span>
              </div>
              <h2 id="event-type-title">{copy("ប្រភេទកម្មវិធី", "What are you celebrating?")}</h2>
              <p className="workspace-muted">{copy("ជ្រើសរើសប្រភេទកម្មវិធី ដើម្បីបង្ហាញទម្រង់ព័ត៌មាន និងគំរូសំបុត្រដែលត្រូវគ្នា។", "Select your celebration type to customize relevant fields and compatible invitation designs.")}</p>
            </div>
            <div className="event-type-grid">
              {EVENT_TYPES.map(([value, kh, english]) => {
                const Icon = TYPE_ICONS[value] || PartyPopper;
                return (
                  <button
                    type="button"
                    className="event-type-option"
                    key={value}
                    aria-pressed={type === value}
                    onClick={() => changeType(value)}
                  >
                    <Icon size={24} aria-hidden="true" />
                    <span>{en ? english : kh}</span>
                    {type === value && <Check size={16} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <div className="event-step-nav-footer">
              <button
                type="button"
                className="workspace-button event-step-nav-btn next"
                onClick={() => scrollToStep(2)}
              >
                <span>{copy("ទៅកាន់ព័ត៌មានកម្មវិធី", "Next: Event essentials")}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>

          {/* STEP 2: EVENT ESSENTIALS */}
          <section
            ref={step2Ref}
            id="step-2-details"
            className={`workspace-section event-step-section step-2 ${currentStep === 2 ? "is-step-active" : "is-step-inactive"}`}
            aria-labelledby="event-information-title"
          >
            <div className="event-step-header">
              <div className="event-step-badge-wrap">
                <span className="event-step-badge">{copy("ជំហានទី ២", "Step 2")}</span>
                <span className="event-step-indicator-text">{copy("ព័ត៌មានចាំបាច់", "Essential details")}</span>
              </div>
              <div className="workspace-section-heading">
                <h2 id="event-information-title">{copy("ព័ត៌មានកម្មវិធី", "Event essentials")}</h2>
                <span className="workspace-muted">{copy("* ត្រូវបំពេញសម្រាប់បង្កើតកម្មវិធី", "* Required to create")}</span>
              </div>
            </div>
            <EventFields
              form={form}
              setForm={setForm}
              type={type}
              en={en}
              errors={errors}
              onBlur={key => setTouched(current => ({ ...current, [key]: true }))}
              draft={submitted === "draft"}
              grouped={true}
            />
            <EventPhotoUpload
              file={photoFile}
              previewUrl={photoPreviewUrl}
              focalPoint={photoFocalPoint}
              eventType={type}
              onFileChange={(file, url) => {
                if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
                  URL.revokeObjectURL(photoPreviewUrl);
                }
                setPhotoFile(file);
                setPhotoPreviewUrl(url);
                setPhotoError("");
              }}
              onFocalPointChange={setPhotoFocalPoint}
              onRemove={() => {
                if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
                  URL.revokeObjectURL(photoPreviewUrl);
                }
                setPhotoFile(null);
                setPhotoPreviewUrl(null);
              }}
              error={photoError}
              required={submitted !== "draft"}
              disabled={saving}
              en={en}
            />
            <details className="workspace-section event-additional">
              <summary>{copy("ព័ត៌មានបន្ថែម (មិនបាច់បំពេញ)", "A personal touch (optional)")}</summary>
              <label>
                {copy("សារអញ្ជើញ ឬការពិពណ៌នា", "Invitation message or description")}
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={form.storyText || ""}
                  onChange={event => setForm(current => ({ ...current, storyText: event.target.value }))}
                  placeholder={copy("សរសេរសារជូនភ្ញៀវរបស់អ្នក…", "A few words to welcome your guests…")}
                />
              </label>
            </details>
            <div className="event-step-nav-footer">
              <button
                type="button"
                className="workspace-button event-step-nav-btn prev"
                onClick={() => scrollToStep(1)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>{copy("ថយក្រោយ: ប្រភេទកម្មវិធី", "Previous: Event type")}</span>
              </button>
              <button
                type="button"
                className="workspace-button event-step-nav-btn next"
                onClick={() => scrollToStep(3)}
              >
                <span>{copy("ទៅកាន់ការជ្រើសរើសគំរូ", "Next: Choose design")}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>

          {/* STEP 3: CHOOSE INVITATION DESIGN */}
          <section
            ref={templateSection}
            id="step-3-design"
            tabIndex={-1}
            className={`workspace-section event-step-section event-template-section step-3 ${currentStep === 3 ? "is-step-active" : "is-step-inactive"}`}
            aria-labelledby="event-templates-title"
            aria-busy={loading}
          >
            <div className="event-step-header" ref={step3Ref}>
              <div className="event-step-badge-wrap">
                <span className="event-step-badge">{copy("ជំហានទី ៣", "Step 3")}</span>
                <span className="event-step-indicator-text">{copy("រចនាប័ទ្ម & សំបុត្រអញ្ជើញ", "Style & Invitation design")}</span>
              </div>
              <h2 id="event-templates-title">{copy("គំរូដែលសាកសមសម្រាប់កម្មវិធីរបស់អ្នក", "Invitations that fit")}</h2>
              <p className="workspace-muted">{copy("គំរូទាំងនេះគាំទ្រប្រភេទកម្មវិធី និងភាសាដែលអ្នកជ្រើសរើស។", "These templates support your event type and invitation language.")}</p>
            </div>

            <details className="event-preferences-disclosure">
              <summary>{copy("រចនាប័ទ្ម ភាសា និងតម្លៃគំរូ", "Design style, language and price preferences")}</summary>
              <div className="event-preferences">
                <label>
                  {copy("រចនាប័ទ្ម", "Design style")}
                  <select value={style} onChange={event => { intentTemplate.current = null; setStyle(event.target.value); }}>
                    <option value="">{copy("គ្រប់រចនាប័ទ្ម", "All available styles")}</option>
                    {styles.map(value => <option key={value} value={value}>{STYLE_LABELS[value]?.[en ? 1 : 0] || value}</option>)}
                  </select>
                </label>
                <label>
                  {copy("ភាសាសំបុត្រអញ្ជើញ", "Invitation language")}
                  <select value={language} onChange={event => { intentTemplate.current = null; setLanguage(event.target.value); }}>
                    <option value="KH">{uiCopy("ភាសាខ្មែរ", "Khmer")}</option>
                    <option value="EN">{uiCopy("ភាសាអង់គ្លេស", "English")}</option>
                    <option value="BOTH">{uiCopy("ភាសាខ្មែរ និងអង់គ្លេស", "Khmer and English")}</option>
                  </select>
                </label>
                <label>
                  {copy("តម្លៃគំរូ", "Template price")}
                  <select value={price} onChange={event => { intentTemplate.current = null; setPrice(event.target.value); }}>
                    <option value="ALL">{copy("គ្រប់តម្លៃ", "All prices")}</option>
                    <option value="FREE">{copy("ឥតគិតថ្លៃ", "Free")}</option>
                    <option value="PREMIUM">{copy("គំរូបង់ប្រាក់", "Premium")}</option>
                  </select>
                </label>
              </div>
            </details>

            {intentNotice && (
              <p className="workspace-notice" role="status">
                {copy("គំរូដែលបានជ្រើសរើសមិនអាចប្រើបានទេ។ សូមជ្រើសរើសគំរូដែលគាំទ្រកម្មវិធីរបស់អ្នក។", "The selected design is unavailable. Choose a compatible design below; your event details are retained.")}
              </p>
            )}

            {loading ? (
              <div className="event-template-loading" role="status">
                {copy("កំពុងស្វែងរកគំរូសមស្រប…", "Finding compatible invitations…")}
                <div className="event-template-skeleton" aria-hidden="true" />
              </div>
            ) : recommendationError ? (
              <div className="workspace-notice" role="alert">
                <p>{recommendationError}</p>
                <button className="workspace-button" type="button" onClick={() => setRetry(value => value + 1)}>
                  {copy("ទាញយកម្ដងទៀត", "Retry templates")}
                </button>
              </div>
            ) : (
              <>
                {!recommendations.length && (
                  <div className="workspace-notice">
                    <p>{copy("មិនមានគំរូគាំទ្រជម្រើសទាំងនេះទេ។ សូមប្ដូរភាសា ឬតម្លៃ។ អ្នកអាចរក្សាទុកព្រាងដោយមិនជ្រើសគំរូ។", "No templates support these preferences. Try another language or price filter, or save a draft without a template.")}</p>
                    <button className="workspace-button" type="button" onClick={() => { setStyle(""); setPrice("ALL"); }}>
                      {copy("មើលគ្រប់តម្លៃ និងរចនាប័ទ្ម", "Show all prices and styles")}
                    </button>
                  </div>
                )}
                {!!recommendations.length && !recommendations.some(row => row.styleMatch) && (
                  <p className="workspace-notice">
                    {copy("មិនមានរចនាប័ទ្មត្រូវគ្នាទេ។ គំរូជំនួសទាំងនេះគាំទ្រកម្មវិធី និងភាសារបស់អ្នក។", "No exact style match. These alternatives support your event and language.")}
                  </p>
                )}
                {selectedTemplate && (
                  <button
                    className="workspace-button event-change-design"
                    type="button"
                    aria-expanded={browsingDesigns}
                    aria-controls="event-design-options"
                    onClick={() => setBrowsingDesigns(current => !current)}
                  >
                    {browsingDesigns ? copy("រក្សាគំរូដែលបានជ្រើសរើស", "Keep selected design") : copy("ប្ដូរគំរូ", "Change design")}
                  </button>
                )}
                <div
                  id="event-design-options"
                  className={`event-template-grid${selectedTemplate && !browsingDesigns ? " event-template-grid--selected" : ""}`}
                >
                  {recommendations
                    .filter(({ template }) => !selectedTemplate || browsingDesigns || String(template.id) === String(templateId))
                    .map(({ template }) => (
                      <article
                        className={`event-template-card ${String(templateId) === String(template.id) ? "is-selected" : ""}`}
                        key={template.id}
                      >
                        <img src={template.thumbnailUrl || "/templates/event-essential.svg"} alt={template.name} loading="lazy" />
                        <div className="event-template-content">
                          <h3>{template.name}</h3>
                          <p>{STYLE_LABELS[template.category]?.[en ? 1 : 0] || template.category}</p>
                          <p>
                            {template.premium || Number(template.price) > 0
                              ? `${packagePrice(template, en ? "en" : "km") || copy("តម្លៃមិនបានបញ្ជាក់", "Price not specified")} · Premium`
                              : copy("ឥតគិតថ្លៃ", "Free")}
                          </p>
                          {(template.premium || Number(template.price) > 0) && (
                            <small>{copy("សិទ្ធិប្រើប្រាស់នឹងត្រូវពិនិត្យពេលរក្សាទុក។", "Access is verified when you save.")}</small>
                          )}
                          {access[template.id] === true && (
                            <small className="event-access-highlight">{copy("មានសិទ្ធិប្រើប្រាស់", "Included in your access")}</small>
                          )}
                          <div className="event-template-actions">
                            <a
                              href={`/templates/${encodeURIComponent(template.code)}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${copy("មើលជាមុន", "Preview")} ${template.name} (${copy("ផ្ទាំងថ្មី", "new tab")})`}
                            >
                              {copy("មើលជាមុន", "Preview")}
                            </a>
                            {access[template.id] === false ? (
                              <a href={`/templates/${template.id}/checkout`} target="_blank" rel="noreferrer">
                                {copy("ទិញសិទ្ធិ (ផ្ទាំងថ្មី)", "Get access (new tab)")}
                              </a>
                            ) : (
                              <button
                                className="workspace-button"
                                type="button"
                                aria-pressed={String(templateId) === String(template.id)}
                                aria-label={`${copy("ជ្រើសរើស", "Select")} ${template.name}`}
                                onClick={() => selectTemplate(template.id)}
                              >
                                {String(templateId) === String(template.id) ? (
                                  <>
                                    <Check size={16} aria-hidden="true" />
                                    {copy("បានជ្រើសរើស", "Selected")}
                                  </>
                                ) : (
                                  copy("ជ្រើសរើស", "Select")
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              </>
            )}
            <div className="event-step-nav-footer">
              <button
                type="button"
                className="workspace-button event-step-nav-btn prev"
                onClick={() => scrollToStep(2)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>{copy("ថយក្រោយ: ព័ត៌មានកម្មវិធី", "Previous: Event essentials")}</span>
              </button>
              <button
                type="button"
                className="workspace-button event-step-nav-btn next"
                onClick={() => scrollToStep(4)}
              >
                <span>{copy("ពិនិត្យ និងបង្កើត", "Next: Review & create")}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>

          {/* STEP 4: REVIEW & CREATE */}
          <section
            ref={step4Ref}
            id="step-4-review"
            className={`workspace-section event-step-section event-review-section step-4 ${currentStep === 4 ? "is-step-active" : "is-step-inactive"}`}
            aria-labelledby="event-review-title"
          >
            <div className="event-step-header">
              <div className="event-step-badge-wrap">
                <span className="event-step-badge">{copy("ជំហានទី ៤", "Step 4")}</span>
                <span className="event-step-indicator-text">{copy("ជំហានចុងក្រោយ", "Final step")}</span>
              </div>
              <h2 id="event-review-title">{copy("ពិនិត្យ និងបង្កើតកម្មវិធី", "Review and create your event")}</h2>
              <p className="workspace-muted">{copy("ពិនិត្យព័ត៌មានទាំងអស់មុនបង្កើតកម្មវិធី។ អ្នកអាចកែប្រែបានគ្រប់ពេលពីកន្លែងគ្រប់គ្រង។", "Review your celebration details before creating. You can edit anytime from your workspace.")}</p>
            </div>

            <div className="event-review-card">
              {/* Event Type Review */}
              <div className="event-review-group">
                <div className="event-review-group-head">
                  <div className="event-review-icon-wrap" aria-hidden="true">
                    {(() => {
                      const Icon = TYPE_ICONS[type] || PartyPopper;
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <div className="event-review-group-info">
                    <span className="event-review-group-kicker">{copy("ប្រភេទកម្មវិធី", "Event Type")}</span>
                    <h3 className="event-review-group-title">{EVENT_TYPES.find(row => row[0] === type)?.[en ? 2 : 1]}</h3>
                  </div>
                  <button type="button" className="event-review-edit-btn" onClick={() => scrollToStep(1)} aria-label={copy("កែប្រែប្រភេទកម្មវិធី", "Edit event type")}>
                    <Pencil size={14} aria-hidden="true" />
                    <span>{copy("កែប្រែ", "Edit")}</span>
                  </button>
                </div>
              </div>

              {/* Event Essentials Review */}
              <div className="event-review-group">
                <div className="event-review-group-head">
                  <div className="event-review-icon-wrap" aria-hidden="true">
                    <Heart size={20} />
                  </div>
                  <div className="event-review-group-info">
                    <span className="event-review-group-kicker">{copy("ព័ត៌មានកម្មវិធី", "Event Essentials")}</span>
                    <h3 className="event-review-group-title">{form.title || copy("មិនទាន់បំពេញឈ្មោះ", "Untitled event")}</h3>
                  </div>
                  <button type="button" className="event-review-edit-btn" onClick={() => scrollToStep(2)} aria-label={copy("កែប្រែព័ត៌មានកម្មវិធី", "Edit event details")}>
                    <Pencil size={14} aria-hidden="true" />
                    <span>{copy("កែប្រែ", "Edit")}</span>
                  </button>
                </div>
                <div className="event-review-grid">
                  <div className="event-review-item">
                    <span className="event-review-label">{copy("អ្នករៀបចំ / ម្ចាស់កម្មវិធី", "Celebrants / Hosts")}</span>
                    <strong className="event-review-val">{getParticipantsSummary()}</strong>
                  </div>
                  <div className="event-review-item">
                    <span className="event-review-label">{copy("កាលបរិច្ឆេទ & ម៉ោង", "Date & Time")}</span>
                    <strong className="event-review-val">
                      <Calendar size={14} aria-hidden="true" />
                      <span>{form.eventDate || copy("មិនទាន់កំណត់", "Not set")}</span>
                      {form.eventTime && (
                        <>
                          <Clock size={14} aria-hidden="true" style={{ marginLeft: "6px" }} />
                          <span>{form.eventTime}</span>
                        </>
                      )}
                    </strong>
                  </div>
                  <div className="event-review-item">
                    <span className="event-review-label">{copy("ទីកន្លែង", "Venue")}</span>
                    <strong className="event-review-val">
                      <MapPin size={14} aria-hidden="true" />
                      <span>{form.venueName || copy("មិនទាន់កំណត់", "Not set")}</span>
                    </strong>
                  </div>
                  {form.venueAddress && (
                    <div className="event-review-item event-review-item--full">
                      <span className="event-review-label">{copy("អាសយដ្ឋាន", "Address")}</span>
                      <span className="event-review-val-text">{form.venueAddress}</span>
                    </div>
                  )}
                  {form.googleMapUrl && (
                    <div className="event-review-item event-review-item--full">
                      <span className="event-review-label">{copy("តំណ Google Maps", "Google Maps")}</span>
                      <a href={form.googleMapUrl} target="_blank" rel="noreferrer" className="event-review-map-link">
                        <span>{form.googleMapUrl}</span>
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Photo Review */}
              <div className="event-review-group">
                <div className="event-review-group-head">
                  <div className="event-review-icon-wrap" aria-hidden="true">
                    <Camera size={20} />
                  </div>
                  <div className="event-review-group-info">
                    <span className="event-review-group-kicker">{copy("រូបថតកម្មវិធី", "Event Photo")}</span>
                    <h3 className="event-review-group-title">
                      {photoFile
                        ? photoFile.name || copy("រូបថតបានជ្រើសរើស", "Photo selected")
                        : copy("មិនទាន់ជ្រើសរើសរូបថត", "No photo selected")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="event-review-edit-btn"
                    onClick={() => scrollToStep(2)}
                    aria-label={copy("កែប្រែរូបថតកម្មវិធី", "Edit event photo")}
                  >
                    <Pencil size={14} aria-hidden="true" />
                    <span>{copy("កែប្រែ", "Edit")}</span>
                  </button>
                </div>
                {photoPreviewUrl ? (
                  <div className="event-review-photo-preview">
                    <img
                      src={photoPreviewUrl}
                      alt={copy("រូបថតកម្មវិធី", "Event photo")}
                      className="event-review-photo-thumb"
                      style={{ objectPosition: photoFocalPoint }}
                    />
                    <div className="event-review-photo-meta">
                      <span className="event-review-photo-focal">
                        {copy("តម្រង់៖ ", "Focus: ")}
                        {photoFocalPoint === "top"
                          ? copy("ផ្នែកលើ", "Top")
                          : photoFocalPoint === "bottom"
                          ? copy("ផ្នែកក្រោម", "Bottom")
                          : copy("កណ្ដាល", "Center")}
                      </span>
                      <small className="workspace-muted">
                        {copy("នឹងត្រូវបង្ហាញលើកាតកម្មវិធី និងសំបុត្រអញ្ជើញ", "Appears on event card & invitation")}
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="event-review-photo-empty">
                    <p className="workspace-muted">
                      {copy(
                        "មិនទាន់មានរូបថត (ចាំបាច់សម្រាប់ការបង្កើតកម្មវិធី)",
                        "No photo selected (Required to create event)"
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Template & Style Review */}
              <div className="event-review-group">
                <div className="event-review-group-head">
                  <div className="event-review-icon-wrap" aria-hidden="true">
                    <Sparkles size={20} />
                  </div>
                  <div className="event-review-group-info">
                    <span className="event-review-group-kicker">{copy("គំរូសំបុត្រអញ្ជើញ", "Invitation Design")}</span>
                    <h3 className="event-review-group-title">{selectedTemplate?.name || copy("មិនទាន់ជ្រើសរើស", "No design chosen")}</h3>
                  </div>
                  <button type="button" className="event-review-edit-btn" onClick={() => scrollToStep(3)} aria-label={copy("កែប្រែគំរូសំបុត្រ", "Edit design")}>
                    <Pencil size={14} aria-hidden="true" />
                    <span>{copy("កែប្រែ", "Edit")}</span>
                  </button>
                </div>
                <div className="event-review-grid">
                  <div className="event-review-item">
                    <span className="event-review-label">{copy("រចនាប័ទ្ម", "Style")}</span>
                    <strong className="event-review-val">
                      {selectedTemplate ? (STYLE_LABELS[selectedTemplate.category]?.[en ? 1 : 0] || selectedTemplate.category) : copy("ស្វ័យប្រវត្តិ", "Automatic")}
                    </strong>
                  </div>
                  <div className="event-review-item">
                    <span className="event-review-label">{copy("ភាសាសំបុត្រ", "Invitation Language")}</span>
                    <strong className="event-review-val">
                      {language === "KH" ? copy("ភាសាខ្មែរ", "Khmer") : language === "EN" ? copy("ភាសាអង់គ្លេស", "English") : copy("ភាសាខ្មែរ និងអង់គ្លេស", "Khmer & English")}
                    </strong>
                  </div>
                  <div className="event-review-item">
                    <span className="event-review-label">{copy("តម្លៃ & សិទ្ធិ", "Pricing & Access")}</span>
                    <strong className="event-review-val">
                      {selectedTemplate ? (
                        selectedTemplate.premium || Number(selectedTemplate.price) > 0 ? (
                          access[selectedTemplate.id] === true ? (
                            <span className="event-access-pill success"><Check size={12} /> {copy("មានសិទ្ធិប្រើប្រាស់", "Included")}</span>
                          ) : (
                            <span className="event-access-pill premium">{packagePrice(selectedTemplate, en ? "en" : "km") || "Premium"}</span>
                          )
                        ) : (
                          <span className="event-access-pill free">{copy("ឥតគិតថ្លៃ", "Free")}</span>
                        )
                      ) : copy("ជ្រើសរើសគំរូដើម្បីពិនិត្យ", "Select template")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Story Message (if present) */}
              {form.storyText && (
                <div className="event-review-group">
                  <div className="event-review-quote">
                    <span className="event-review-label">{copy("សារអញ្ជើញផ្ទាល់ខ្លួន", "Personal Welcome Message")}</span>
                    <p>"{form.storyText}"</p>
                  </div>
                </div>
              )}
            </div>

            <div className="event-create-final">
              {pendingEventId && (
                <div className="event-retry-banner workspace-notice" role="alert">
                  <p>
                    {copy(
                      "កម្មវិធីរបស់អ្នកត្រូវបានបង្កើតរួចហើយ ប៉ុន្តែរូបថតមិនទាន់បញ្ចូលបានសម្រេច។",
                      "Your event was created, but the photo upload did not finish."
                    )}
                  </p>
                  <div className="event-retry-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="workspace-button primary"
                      disabled={saving}
                      onClick={() => save("create")}
                    >
                      <RefreshCw size={14} aria-hidden="true" />
                      <span>{copy("ព្យាយាមបញ្ចូលរូបថតម្ដងទៀត", "Retry photo upload")}</span>
                    </button>
                    <button
                      type="button"
                      className="workspace-button"
                      disabled={saving}
                      onClick={() => {
                        saved.current = true;
                        clearTemplateIntent();
                        try { sessionStorage.removeItem(storageKey); } catch { /* Session cleanup is best effort. */ }
                        navigate(`${eventPath(pendingEventId)}/invitation?mode=guided`, { replace: true });
                      }}
                    >
                      <span>{copy("បន្តទៅកាន់សំបុត្រអញ្ចើញ", "Continue to invitation")}</span>
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <div role="alert" className="workspace-notice">
                  <p>{error}</p>
                  <p>{copy("ព័ត៌មានរបស់អ្នកនៅតែរក្សាទុក។ អ្នកអាចព្យាយាមរក្សាទុកម្ដងទៀតបាន។", "Your details are retained. You can retry saving safely.")}</p>
                </div>
              )}
              <p className="workspace-muted">
                {copy("កម្មវិធីនឹងត្រូវរក្សាទុកជាឯកជន។ បន្ថែមភ្ញៀវ និងផ្សព្វផ្សាយពីកន្លែងគ្រប់គ្រងកម្មវិធី។", "Your event starts as a private draft. Add guests and publish from its workspace.")}
              </p>
              <div className="event-create-actions">
                <button className="workspace-button" type="button" disabled={saving} onClick={() => save("draft")}>
                  {copy("រក្សាទុកព្រាង", "Save draft")}
                </button>
                <button className="workspace-button primary" type="submit" disabled={saving || loading}>
                  {saving ? copy("កំពុងរក្សាទុក…", "Saving…") : copy("បង្កើតកម្មវិធី", "Create event")}
                </button>
              </div>
              <p className="event-save-note" role="status">
                {storageError
                  ? copy("កម្មវិធីរុករកមិនអាចរក្សាទុកព័ត៌មានក្នុងផ្ទាំងនេះបានទេ។ សូមរក្សាទុកព្រាងមុនចាកចេញ។", "This browser cannot retain your setup. Save a draft before leaving.")
                  : copy("ព័ត៌មានត្រូវបានរក្សាទុកក្នុងផ្ទាំងនេះ ខណៈអ្នកកំពុងបំពេញ។", "Your setup is kept in this tab while you work.")}
              </p>
            </div>
          </section>
        </fieldset>

        {/* Desktop Sticky Summary Sidebar */}
        <aside className="event-create-summary workspace-section" aria-label={copy("សង្ខេបកម្មវិធី", "Event summary")}>
          <h2>{copy("កម្មវិធីរបស់អ្នក", "Your event")}</h2>
          <dl>
            <div>
              <dt>{copy("ប្រភេទ", "Type")}</dt>
              <dd>{EVENT_TYPES.find(row => row[0] === type)?.[en ? 2 : 1]}</dd>
            </div>
            <div>
              <dt>{copy("ឈ្មោះ", "Title")}</dt>
              <dd>{form.title || copy("មិនទាន់បំពេញ", "Not added yet")}</dd>
            </div>
            <div>
              <dt>{copy("រូបថត", "Photo")}</dt>
              <dd>{photoFile ? photoFile.name : copy("មិនទាន់ជ្រើសរើស", "Not chosen yet")}</dd>
            </div>
            <div>
              <dt>{copy("កាលបរិច្ឆេទ", "Date")}</dt>
              <dd>{form.eventDate || copy("មិនទាន់កំណត់", "Not set yet")}</dd>
            </div>
            <div>
              <dt>{copy("គំរូ", "Invitation")}</dt>
              <dd>{selectedTemplate?.name || copy("មិនទាន់ជ្រើសរើស", "Choose a template")}</dd>
            </div>
            <div>
              <dt>{copy("កញ្ចប់", "Subscription")}</dt>
              <dd>
                {plan?.active && plan?.status === "ACTIVE" && plan?.paymentStatus === "PAID"
                  ? plan.packagePlan?.packageName
                  : copy("សិទ្ធិនឹងត្រូវពិនិត្យពេលរក្សាទុក", "Eligibility checked when saving")}
              </dd>
            </div>
          </dl>
          <p className="workspace-muted">
            {copy("សម្រាប់ព្រាង ត្រូវការតែឈ្មោះកម្មវិធី។", "Only a title is needed to save a draft.")}
          </p>
        </aside>
      </form>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <div className="event-mobile-bottom-bar" role="region" aria-label={copy("ការរុករកជំហាន", "Wizard step navigation")}>
        {currentStep === 1 ? (
          <Link to="/app/events" className="event-mobile-nav-btn prev">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{copy("បោះបង់", "Cancel")}</span>
          </Link>
        ) : (
          <button
            type="button"
            className="event-mobile-nav-btn prev"
            onClick={() => scrollToStep(currentStep - 1)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{copy("ថយក្រោយ", "Back")}</span>
          </button>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            className="event-mobile-nav-btn next"
            onClick={() => scrollToStep(currentStep + 1)}
          >
            <span>{copy("បន្ត", "Next")}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <div className="event-mobile-submit-group">
            <button
              type="button"
              className="event-mobile-nav-btn draft"
              disabled={saving}
              onClick={() => save("draft")}
            >
              <span>{saving && submitted === "draft" ? copy("កំពុងរក្សា…", "Saving…") : copy("រក្សាពង្រាង", "Save Draft")}</span>
            </button>
            <button
              type="button"
              className="event-mobile-nav-btn create"
              disabled={saving}
              onClick={() => save("create")}
            >
              <span>{saving && submitted === "create" ? copy("កំពុងបង្កើត…", "Creating…") : copy("បង្កើតកម្មវិធី", "Create Event")}</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
