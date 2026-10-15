import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Send, LoaderCircle, MessageSquare, LayoutTemplate, Layers3 } from "lucide-react";
import { api } from "../../shared/api/httpClient";
import { unwrap } from "../../shared/api/helpers";
import { useLanguageStore } from "../../stores/useLanguageStore";
import "./MarketingPages.css";

const initialForm = { name: "", email: "", phone: "", plan: "General inquiry", message: "" };
const limits = { name: 120, email: 255, phone: 30, plan: 120, message: 5000 };

export default function ContactFeature() {
  const lang = useLanguageStore(state => state.lang);
  const copy = (km, en) => lang === "en" ? en : km;
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);
  const [invalid, setInvalid] = useState({});
  const inFlight = useRef(false);
  const form = useRef(null);
  const acceptance = useRef(null);
  useEffect(() => { if (submitted) acceptance.current?.focus(); }, [submitted]);

  const labels = {
    name: copy("ឈ្មោះរបស់អ្នក", "Full name"), email: copy("អ៊ីមែល", "Email"),
    phone: copy("លេខទូរស័ព្ទ ឬ Telegram (មិនចាំបាច់)", "Phone or Telegram (optional)"),
    plan: copy("ប្រធានបទ", "Topic"), message: copy("សារ ឬសំណួររបស់អ្នក", "Message"),
  };
  const fieldError = (key, code) => code === "email"
    ? copy("សូមបញ្ចូលអ៊ីមែលដែលត្រឹមត្រូវ។", "Enter a valid email address.")
    : code === "length"
      ? copy(`សូមបញ្ចូលមិនលើស ${limits[key]} តួអក្សរ។`, `Use no more than ${limits[key]} characters.`)
      : copy("សូមបំពេញព័ត៌មាននេះ។", "Please complete this field.");
  const update = (key, text) => {
    setFormData(current => ({ ...current, [key]: text }));
    setInvalid(current => ({ ...current, [key]: undefined }));
  };
  const submit = async event => {
    event.preventDefault();
    if (inFlight.current) return;
    const payload = Object.fromEntries(Object.entries(formData).map(([key, text]) => [key, text.trim()]));
    const errors = {};
    for (const key of ["name", "email", "phone", "plan", "message"]) {
      if (["name", "email", "message"].includes(key) && !payload[key]) errors[key] = "required";
      else if (payload[key].length > limits[key]) errors[key] = "length";
      else if (key === "email" && !form.current.elements.namedItem("email").validity.valid) errors[key] = "email";
    }
    setInvalid(errors); setFailure(null);
    if (Object.keys(errors).length) { form.current.elements.namedItem(Object.keys(errors)[0])?.focus(); return; }
    inFlight.current = true; setSubmitting(true);
    try {
      const result = unwrap(await api.post("/v1/contact", payload, { skipAuth: true, suppressAuthRedirect: true }));
      if (result?.accepted !== true || result?.delivery !== "SMTP_ACCEPTED") throw new Error("Contact acceptance not acknowledged");
      setSubmitted(true);
    } catch (error) { setFailure(error?.status === 429 ? "rate" : "delivery"); }
    finally { inFlight.current = false; setSubmitting(false); }
  };
  const attrs = key => ({
    id: `contact-${key}`, name: key, maxLength: limits[key], value: formData[key],
    onChange: event => update(key, event.target.value),
    "aria-invalid": invalid[key] ? "true" : undefined,
    "aria-describedby": invalid[key] ? `contact-${key}-error` : key === "message" ? "contact-message-hint" : undefined,
  });
  const field = (key, children) => <div className={`kp-contact-field${invalid[key] ? " kp-contact-field--invalid" : ""}`}>
    <label htmlFor={`contact-${key}`}>{labels[key]}{["name", "email", "message"].includes(key) && <span aria-hidden="true"> *</span>}</label>{children}
    {invalid[key] && <p id={`contact-${key}-error`} className="kp-field-error">{fieldError(key, invalid[key])}</p>}
  </div>;
  const guidance = <section className="kp-contact-help" aria-labelledby="kp-contact-help-title"><h2 id="kp-contact-help-title">{copy("យើងអាចជួយអ្វីខ្លះ?", "Where can we help?")}</h2>
          <Link to="/templates"><LayoutTemplate size={20} aria-hidden="true" /><span>{copy("ស្វែងរកគំរូសម្រាប់ពិធី", "Find a design for your event")}<small>{copy("មើលរចនាបទ និងគំរូពេញលេញ", "Explore designs and complete demos")}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link to="/pricing"><Layers3 size={20} aria-hidden="true" /><span>{copy("ស្វែងយល់ពីកញ្ចប់ និងសិទ្ធិ", "Understand packages & access")}<small>{copy("ពិនិត្យកម្រិតប្រើប្រាស់ និងមុខងារ", "Review limits and included tools")}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>
          <a href="#contact-form"><MessageSquare size={20} aria-hidden="true" /><span>{copy("សួរអំពីការប្រើប្រាស់", "Get help with Koupreng")}<small>{copy("ប្រាប់យើងអំពីសំណួររបស់អ្នក", "Tell us what you need a hand with")}</small></span><ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>;
  return <div className="kp-product-page kp-contact-page" lang={lang}>
    <div className="kp-contact-layout">
      <section className="kp-contact-intro" aria-labelledby="kp-contact-title"><p className="kp-page-label">{copy("នៅជាមួយអ្នក គ្រប់ជំហាន", "Here for your next step")}</p><h1 id="kp-contact-title">{copy("មានសំណួរ?\nយើងរីករាយជួយអ្នក។", "Have a question?\nWe’re happy to help.")}</h1><p className="kp-contact-lead">{copy("សួរអំពីគំរូ កញ្ចប់ ឬការប្រើប្រាស់ Koupreng។ ប្រាប់យើងពីអ្វីដែលអ្នកត្រូវការ។", "Questions about a design, a package or your invitation? Tell us what you need a hand with.")}</p>

      </section>
      <section className="kp-contact-panel" id="contact-form" aria-labelledby="kp-contact-form-title">
        {submitted ? <div ref={acceptance} tabIndex={-1} className="kp-contact-accepted" role="status" aria-live="polite"><CheckCircle2 size={44} strokeWidth={1.5} aria-hidden="true" /><h2 id="kp-contact-form-title">{copy("សូមអរគុណ សាររបស់អ្នកត្រូវបានទទួលហើយ។", "Thank you. Message received.")}</h2><p>{copy("សាររបស់អ្នកត្រូវបានទទួលសម្រាប់ផ្ញើទៅក្រុមការងារ។ យើងនឹងប្រើអ៊ីមែលដែលអ្នកបានផ្តល់ ដើម្បីឆ្លើយតប។", "Your message has been accepted for delivery to our team. We’ll use the email you provided to respond.")}</p><button type="button" className="kp-button" onClick={() => { setSubmitted(false); setFailure(null); requestAnimationFrame(() => form.current?.elements.namedItem("name")?.focus()); }}>{copy("ផ្ញើសារមួយទៀត", "Send another message")}</button><Link to="/templates" className="kp-text-link">{copy("មើលគំរូសន្លឹកការ", "Explore invitation designs")}</Link></div> : <form ref={form} onSubmit={submit} noValidate aria-busy={submitting}>
          <h2 id="kp-contact-form-title">{copy("ផ្ញើសារមកកាន់យើង", "Send us a message")}</h2><p className="kp-contact-form-note">{copy("សញ្ញា * ជាព័ត៌មានដែលត្រូវបំពេញ។", "Fields marked * are required.")}</p>
          <fieldset disabled={submitting}><legend className="sr-only">{copy("ព័ត៌មានទំនាក់ទំនង និងសារ", "Your contact information and message")}</legend>
            <div className="kp-contact-row">{field("name", <input {...attrs("name")} type="text" required autoComplete="name" placeholder={copy("ឈ្មោះពេញរបស់អ្នក", "Your full name")} />)}{field("email", <input {...attrs("email")} type="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" />)}</div>
            <div className="kp-contact-row">{field("phone", <input {...attrs("phone")} type="text" autoComplete="tel" placeholder={copy("លេខទូរស័ព្ទ ឬ @ឈ្មោះ", "Phone number or @username")} />)}{field("plan", <select {...attrs("plan")}>{[["General inquiry", copy("សំណួរទូទៅ", "General inquiry")], ["Templates", copy("គំរូសន្លឹកការ", "Invitation designs")], ["Packages", copy("កញ្ចប់សេវាកម្ម", "Service packages")], ["Technical help", copy("ជំនួយក្នុងការប្រើប្រាស់", "Help using Koupreng")]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>)}</div>
            {field("message", <textarea {...attrs("message")} rows={5} required placeholder={copy("តើអ្នកចង់សួរអំពីអ្វី?", "What would you like to know?")} />)}
            <p id="contact-message-hint" className="kp-contact-hint">{copy("ព័ត៌មានអំពីពិធី និងសំណួររបស់អ្នក ជួយឱ្យយើងយល់ពីតម្រូវការបានច្បាស់។", "A little context about your event helps us understand what you need.")}</p>
          </fieldset>
          {failure && <p className="kp-contact-error" role="alert">{failure === "rate" ? copy("សូមរង់ចាំបន្តិច រួចព្យាយាមម្ដងទៀត។ ព័ត៌មានដែលអ្នកបានបញ្ចូលនៅតែរក្សាទុក។", "Please wait before sending again. Your entries are saved here.") : copy("មិនអាចផ្ញើសារបានទេ។ ព័ត៌មានរបស់អ្នកនៅតែរក្សាទុក សូមព្យាយាមម្ដងទៀត។", "We could not send your message. Your entries are saved here; please try again.")}</p>}
          <button type="submit" className="kp-button kp-contact-submit" disabled={submitting}>{submitting ? <LoaderCircle size={18} aria-hidden="true" className="kp-busy-icon" /> : <Send size={18} aria-hidden="true" />}{submitting ? copy("កំពុងផ្ញើ…", "Sending…") : copy("ផ្ញើសារ", "Send message")}</button>
        </form>}
      </section>
      {guidance}
    </div>
  </div>;
}
