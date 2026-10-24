import { eventFields } from "./eventFields";
export default function EventFields({ form, setForm, type, en, errors = {}, onBlur, draft = false, grouped = false }) {
  const fields = eventFields(type);
  const field = ([key, kh, english, inputType = "text", required = true]) =>
    <label key={key} htmlFor={`event-${key}`}><span>{en ? english : kh}{required && <span className="event-required" aria-hidden="true"> *</span>}</span>
      <input id={`event-${key}`} name={key} type={inputType} required={required && (!draft || key === "title")} maxLength={key === "venueAddress" ? 1000 : 255}
        placeholder={inputType === "url" ? "https://maps.google.com/…" : inputType === "text" ? en ? english.replace(" (optional)", "") : kh : undefined}
        aria-invalid={errors[key] ? true : undefined} aria-describedby={errors[key] ? `event-${key}-error` : undefined}
        value={form[key] || ""} onBlur={() => onBlur?.(key)} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} />
      {errors[key] && <span className="workspace-field-error" id={`event-${key}-error`}>{errors[key]}</span>}
    </label>;
  if (!grouped) return <div className={`event-wizard-grid event-fields-${String(type || "OTHER").toLowerCase()}`}>{fields.map(field)}</div>;
  const sections = [
    [en ? 'Event information' : 'ព័ត៌មានកម្មវិធី', fields.filter(([key]) => !['eventDate','eventTime','venueName','venueAddress','googleMapUrl'].includes(key))],
    [en ? 'Date and venue' : 'កាលបរិច្ឆេទ និងទីកន្លែង', fields.filter(([key]) => ['eventDate','eventTime','venueName','venueAddress'].includes(key))],
    [en ? 'Maps and location' : 'ផែនទី និងទីតាំង', fields.filter(([key]) => key === 'googleMapUrl')],
  ];
  return <div className="event-settings-fields">{sections.map(([title, items]) => <fieldset className="event-settings-section" key={title}><legend>{title}</legend>{title === sections[2][0] && <p className="workspace-muted">{en ? 'Keep the location description in Address and the map link here.' : 'រក្សាព័ត៌មានទីតាំងក្នុងអាសយដ្ឋាន និងតំណផែនទីនៅទីនេះ។'}</p>}<div className="event-wizard-grid">{items.map(field)}</div></fieldset>)}</div>;
}
