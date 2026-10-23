import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { SEND_STATUS } from "../model/guestConstants";

function initialForm(guest, groups, categories) {
  return {
    name: guest?.name || "", companionName: guest?.companionName || "", phone: guest?.phone || "", email: guest?.email || "",
    count: String(guest?.count || 1), group: guest?.group || groups[0]?.name || "Groom Side",
    category: guest?.category || categories[0]?.name || "Friend", seat: guest?.seat || "",
    note: guest?.note || "", sendStatus: guest?.sendStatus || SEND_STATUS.pending,
  };
}

export default function GuestInlineForm({ onCancel, onSave, guest = null, groups = [], categories = [], saving = false, error, focusRequest = 0, t }) {
  const nameInputRef = useRef(null);
  const formRef = useRef(null);
  const submittingRef = useRef(false);
  const focusNameAfterSave = useRef(false);
  const [form, setForm] = useState(() => initialForm(guest, groups, categories));
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(guest);
  const busy = saving || submitting;
  const text = (key, fallback) => t ? t(key) : fallback;
  const title = isEditing ? text("editGuestTitle", "កែប្រែព័ត៌មានភ្ញៀវ") : text("addGuestTitle", "បន្ថែមភ្ញៀវថ្មី");
  const statusKey = Object.entries(SEND_STATUS).find(([key, value]) => value === form.sendStatus || key.toUpperCase() === form.sendStatus)?.[0];

  useEffect(() => {
    if (!guest && !focusRequest) return;
    const frame = requestAnimationFrame(() => nameInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [guest, focusRequest]);

  useEffect(() => {
    if (!busy && focusNameAfterSave.current) {
      focusNameAfterSave.current = false;
      nameInputRef.current?.focus();
    }
  }, [busy]);

  const change = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (field === "name") setNameError("");
    setSubmitError("");
  };
  const submit = async (event) => {
    event.preventDefault();
    if (submittingRef.current || busy) return;
    if (!form.name.trim()) {
      setNameError(text("batchNameRequired", "សូមបញ្ចូលឈ្មោះភ្ញៀវ"));
      nameInputRef.current?.focus();
      return;
    }
    if (!formRef.current.reportValidity()) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const success = await onSave({ ...form, name: form.name.trim() }, guest?.id ?? null);
      if (!success) { setSubmitError(text("saveFailed", "មិនអាចរក្សាទុកភ្ញៀវបានទេ។")); return; }
      if (!isEditing) {
        focusNameAfterSave.current = true;
        setForm((previous) => ({ ...initialForm(null, groups, categories), group: previous.group, category: previous.category }));
      } else { onCancel(); }
    } catch (failure) {
      setSubmitError(failure.message || text("saveFailed", "មិនអាចរក្សាទុកភ្ញៀវបានទេ។"));
    } finally { submittingRef.current = false; setSubmitting(false); }
  };
  const inputProps = (field) => ({ id: `guestForm-${field}`, form: "guest-inline-form", value: form[field], onChange: change(field), disabled: busy });

  return <tr className="guest-inline-form-row" aria-label={title}>
      <td data-label={text("fieldName", "ឈ្មោះភ្ញៀវ")}>
        <input {...inputProps("name")} ref={nameInputRef} aria-label={text("fieldName", "ឈ្មោះភ្ញៀវ")} placeholder={text("inlineNamePlaceholder", "បញ្ចូលឈ្មោះ")} maxLength={255} required autoComplete="name" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "guest-name-error" : undefined} />
        {nameError && <p id="guest-name-error" className="guest-field-error" role="alert">{nameError}</p>}
      </td>
      <td data-label={text("fieldGroup", "ក្រុម")}>
        {isEditing ? <span className="guest-group-tag">{form.group}</span> : <select {...inputProps("group")} aria-label={text("fieldGroup", "ក្រុម")}>{groups.map((group) => <option key={group.id} value={group.name}>{group.name}</option>)}</select>}
      </td>
      <td data-label={text("fieldCategory", "ប្រភេទ")}>
        {isEditing ? <span className="guest-category">{form.category}</span> : <select {...inputProps("category")} aria-label={text("fieldCategory", "ប្រភេទ")}>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select>}
      </td>
      <td data-label={text("fieldSeats", "ចំនួនកៅអី / មនុស្ស")}>
        <input {...inputProps("count")} aria-label={text("fieldSeats", "ចំនួនកៅអី / មនុស្ស")} type="number" min="1" step="1" required aria-describedby="guestForm-count-hint" />
        <small className="guest-sr-only" id="guestForm-count-hint">{text("seatsHint", "រួមទាំងអ្នករួមដំណើរ")}</small>
      </td>
      <td data-label={text("thStatus", "ស្ថានភាព")}>
        {isEditing ? <input id="guestForm-sendStatus" aria-label={text("thStatus", "ស្ថានភាព")} readOnly value={statusKey ? text(`status${statusKey.replace(/^./, char => char.toUpperCase())}`, form.sendStatus) : form.sendStatus} /> : <span className="guest-inline-status">{text("statusPending", "មិនទាន់ផ្ញើ")}</span>}
      </td>
      <td data-label={text("thActions", "សកម្មភាព")}>
        <form id="guest-inline-form" ref={formRef} onSubmit={submit} className="guest-inline-actions" aria-label={title} aria-busy={busy}>
          <button type="submit" className="guest-inline-save" disabled={busy || !form.name.trim()}>{busy ? <LoaderCircle size={16} className="guest-spinner" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}{busy ? text("saving", "កំពុងរក្សាទុក…") : isEditing ? text("save", "រក្សាទុក") : text("inlineAddLabel", "បន្ថែម")}</button>
          {isEditing && <button type="button" className="guest-inline-cancel" onClick={onCancel} disabled={busy}>{text("cancel", "បោះបង់")}</button>}
        </form>
        {(submitError || error) && <p className="guest-field-error" role="alert">{error || submitError}</p>}
      </td>
    </tr>;
}
