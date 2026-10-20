import { eventFields } from "./eventFields";
export default function EventFields({ form, setForm, type, en }) {
  return <div className="event-wizard-grid">{eventFields(type).map(([key, kh, english, inputType = "text", required = true]) =>
    <label key={key} htmlFor={`event-${key}`}>{en ? english : kh}
      <input id={`event-${key}`} name={key} type={inputType} required={required} maxLength={key === "venueAddress" ? 1000 : 255}
        value={form[key] || ""} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} />
    </label>)}</div>;
}
