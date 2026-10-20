import { eventFields } from "./eventFields";
export default function EventFields({ form, setForm, type, en, errors = {}, onBlur, draft = false }) {
  return <div className={`event-wizard-grid event-fields-${String(type || "OTHER").toLowerCase()}`}>{eventFields(type).map(([key, kh, english, inputType = "text", required = true]) =>
    <label key={key} htmlFor={`event-${key}`}>{en ? english : kh}{required && <span className="event-required" aria-hidden="true"> *</span>}
      <input id={`event-${key}`} name={key} type={inputType} required={required && (!draft || key === "title")} maxLength={key === "venueAddress" ? 1000 : 255}
        placeholder={inputType === "url" ? "https://maps.google.com/…" : inputType === "text" ? en ? english.replace(" (optional)", "") : kh : undefined}
        aria-invalid={errors[key] ? true : undefined} aria-describedby={errors[key] ? `event-${key}-error` : undefined}
        value={form[key] || ""} onBlur={() => onBlur?.(key)} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} />
      {errors[key] && <span className="workspace-field-error" id={`event-${key}-error`}>{errors[key]}</span>}
    </label>)}</div>;
}
