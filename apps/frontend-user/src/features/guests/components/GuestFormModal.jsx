import { useEffect, useRef, useState } from "react";
import { ChevronDown, LoaderCircle, UserRound } from "lucide-react";
import Modal from "@/shared/ui/Modal";
import { SEND_STATUS } from "../model/guestConstants";

function initialForm(guest, groups, categories) {
  return {
    name: guest?.name || "", companionName: guest?.companionName || "", phone: guest?.phone || "", email: guest?.email || "",
    count: String(guest?.count || 1), group: guest?.group || groups[0]?.name || "Groom Side",
    category: guest?.category || categories[0]?.name || "Friend", seat: guest?.seat || "",
    note: guest?.note || "", sendStatus: guest?.sendStatus || SEND_STATUS.pending,
  };
}

function Field({ id, label, required, children, hint }) {
  return <div className="guest-form-field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{children}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>;
}

export default function GuestFormModal({ isOpen, onClose, onSave, guest = null, eventType = "WEDDING", groups = [], categories = [], saving = false, error, t }) {
  const nameInputRef = useRef(null);
  const formRef = useRef(null);
  const submittingRef = useRef(false);
  const focusNameAfterSave = useRef(false);
  const originalForm = useRef("");
  const [form, setForm] = useState(() => initialForm(guest, groups, categories));
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(guest);
  const normalizedEventType = String(eventType || "").trim().toUpperCase();
  const allowsTableAssignment = Boolean(normalizedEventType && normalizedEventType !== "WEDDING");
  const busy = saving || submitting;
  const text = (key, fallback) => t ? t(key) : fallback;

  useEffect(() => {
    if (!isOpen) return;
    const initial = initialForm(guest, groups, categories);
    originalForm.current = JSON.stringify(initial);
    setForm(initial);
    setNameError("");
    setPhoneError("");
    setSubmitError("");
    const frame = requestAnimationFrame(() => nameInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, guest, groups, categories]);

  useEffect(() => {
    if (isOpen && !busy && focusNameAfterSave.current) {
      focusNameAfterSave.current = false;
      nameInputRef.current?.focus();
    }
  }, [busy, isOpen]);

  if (!isOpen) return null;
  const change = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (field === "name") setNameError("");
    if (field === "phone") setPhoneError("");
    setSubmitError("");
  };
  const submit = async (event, addAnother = false) => {
    event.preventDefault();
    if (submittingRef.current || busy) return;
    if (!form.name.trim()) {
      setNameError(text("batchNameRequired", "សូមបញ្ចូលឈ្មោះភ្ញៀវ"));
      nameInputRef.current?.focus();
      return;
    }
    const phone = form.phone.replace(/[\s()-]/g, "");
    if (phone && !(/^(0\d{8,9}|\+[1-9]\d{6,14})$/.test(phone))) {
      setPhoneError(text("phoneInvalid", "សូមបញ្ចូលលេខទូរស័ព្ទខ្មែរ ឬលេខអន្តរជាតិដែលមានកូដប្រទេស។"));
      formRef.current.querySelector('[type="tel"]')?.focus();
      return;
    }
    if (!formRef.current.reportValidity()) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const success = await onSave({ ...form, name: form.name.trim() }, guest?.id ?? null);
      if (!success) { setSubmitError(text("saveFailed", "មិនអាចរក្សាទុកភ្ញៀវបានទេ។")); return; }
      if (addAnother && !isEditing) {
        focusNameAfterSave.current = true;
        const next = { ...initialForm(null, groups, categories), group: form.group, category: form.category };
        originalForm.current = JSON.stringify(next);
        setForm(next);
      } else { onClose(); }
    } catch (failure) {
      setSubmitError(failure.message || text("saveFailed", "មិនអាចរក្សាទុកភ្ញៀវបានទេ។"));
    } finally { submittingRef.current = false; setSubmitting(false); }
  };
  const inputProps = (field) => ({ id: `guestForm-${field}`, value: form[field], onChange: change(field), disabled: busy });
  const requestClose = () => {
    if (JSON.stringify(form) !== originalForm.current && !window.confirm(text("discardGuestChanges", "បោះបង់ការកែប្រែដែលមិនទាន់រក្សាទុក?"))) return;
    onClose();
  };
  const options = (items, value) => items.some(item => item.name === value) ? items : [...items, { id: value, name: value }];
  const statusKey = Object.entries(SEND_STATUS).find(([key, value]) => value === form.sendStatus || key.toUpperCase() === form.sendStatus)?.[0];

  return <Modal
    isOpen={isOpen} onClose={busy ? undefined : requestClose} className="guest-form-modal workspace-dialog" size="md"
    title={isEditing ? text("editGuestTitle", "កែប្រែព័ត៌មានភ្ញៀវ") : text("addGuestTitle", "បន្ថែមភ្ញៀវថ្មី")}
    subtitle={text("guestFormHint", "បញ្ចូលឈ្មោះភ្ញៀវដើម្បីចាប់ផ្តើម។")}
    closeOnBackdropClick={!busy} closeOnEscape={!busy}
    closeLabel={text("cancel", "បោះបង់")}
  >
    <form ref={formRef} onSubmit={submit} className="guest-form" aria-busy={busy}>
      <div className="guest-form-section-label"><UserRound size={17} aria-hidden="true" />{text("guestDetails", "ព័ត៌មានភ្ញៀវ")}</div>
      <Field id="guestForm-name" label={text("fieldName", "ឈ្មោះភ្ញៀវ")} required>
        <input {...inputProps("name")} ref={nameInputRef} maxLength={255} required autoComplete="name" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "guest-name-error" : undefined} />
        {nameError && <p id="guest-name-error" className="guest-field-error" role="alert">{nameError}</p>}
      </Field>
      <div className="guest-form-grid">
        <Field id="guestForm-phone" label={text("fieldPhone", "លេខទូរស័ព្ទ")} hint={text("phoneOptional", "អាចទុកទទេបាន · 012 345 678 ឬ +855 12 345 678")}><input {...inputProps("phone")} type="tel" maxLength={50} autoComplete="tel" placeholder="012 345 678" aria-invalid={Boolean(phoneError)} aria-describedby={phoneError ? "guest-phone-error" : "guestForm-phone-hint"} />{phoneError && <p id="guest-phone-error" className="guest-field-error" role="alert">{phoneError}</p>}</Field>
        <Field id="guestForm-count" label={text("fieldSeats", "ចំនួនកៅអី / មនុស្ស")} hint={text("seatsHint", "រួមទាំងអ្នករួមដំណើរ")}><input {...inputProps("count")} type="number" min="1" step="1" required aria-describedby="guestForm-count-hint" /></Field>
      </div>
      <div className="guest-form-grid">
        <Field id="guestForm-group" label={text("fieldGroup", "ក្រុម")}><select {...inputProps("group")}>{options(groups, form.group).map((group) => <option key={group.id} value={group.name}>{group.name}</option>)}</select></Field>
        <Field id="guestForm-category" label={text("fieldCategory", "ប្រភេទ")}><select {...inputProps("category")}>{options(categories, form.category).map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></Field>
      </div>
      <details className="guest-form-details" open={isEditing ? true : undefined}>
        <summary><span>{text("optionalDetails", "ព័ត៌មានបន្ថែម")}<small>{allowsTableAssignment ? text("optionalDetailsHint", "អ្នករួមដំណើរ លេខតុ និងចំណាំ") : text("optionalWeddingDetailsHint", "អ្នករួមដំណើរ និងចំណាំ")}</small></span><ChevronDown size={18} aria-hidden="true" /></summary>
        <div className="guest-form-grid">
          <Field id="guestForm-email" label={text("fieldEmail", "អ៊ីមែល")}><input {...inputProps("email")} type="email" maxLength={255} autoComplete="email" /></Field>
          <Field id="guestForm-companionName" label={text("fieldCompanion", "ឈ្មោះអ្នករួមដំណើរ")}><input {...inputProps("companionName")} maxLength={255} /></Field>
          {allowsTableAssignment && <Field id="guestForm-seat" label={text("tableSeat", "លេខតុ / កៅអី")}><input {...inputProps("seat")} placeholder="A-01" /></Field>}
          <Field id="guestForm-sendStatus" label={text("thStatus", "ស្ថានភាព")}><input id="guestForm-sendStatus" readOnly value={statusKey ? text(`status${statusKey.replace(/^./, char => char.toUpperCase())}`, form.sendStatus) : form.sendStatus} /></Field>
          <Field id="guestForm-note" label={text("fieldNote", "ចំណាំ")}><textarea {...inputProps("note")} rows="2" /></Field>
        </div>
      </details>
      {(submitError || error) && <p className="guest-field-error" role="alert">{error || submitError}</p>}
      <div className="guest-form-footer">
        <button type="button" className="guest-button guest-button-secondary guest-cancel-button" onClick={requestClose} disabled={busy}>{text("cancel", "បោះបង់")}</button>
        {!isEditing && <button type="button" className="guest-button guest-button-secondary" disabled={busy} onClick={(event) => submit(event, true)}>{text("saveAndAddAnother", "រក្សាទុក និងបន្ថែមទៀត")}</button>}
        <button type="submit" className="guest-button guest-button-primary" disabled={busy}>{busy && <LoaderCircle size={16} className="guest-spinner" aria-hidden="true" />}{busy ? text("saving", "កំពុងរក្សាទុក…") : isEditing ? text("save", "រក្សាទុក") : text("addGuestAction", "បន្ថែមភ្ញៀវ")}</button>
      </div>
    </form>
  </Modal>;
}
