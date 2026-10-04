import { useRef, useState } from "react";
import {
  IoCheckmarkOutline,
  IoCloseOutline,
  IoCopyOutline,
  IoPencilOutline,
  IoQrCodeOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { ResponsiveTable, StatusBadge } from "@/shared/ui";
import { buildShareMessage, guestInviteUrl } from "../model/guestMappers";
import { SEND_STATUS } from "../model/guestConstants";

const INLINE_INPUT_CLASS = "w-full h-10 min-w-0 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 bg-white border border-gray-200 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500";

function emptyGuestForm(groups, categories) {
  return {
    name: "",
    companionName: "",
    phone: "",
    count: "1",
    group: groups[0]?.name || "Groom Side",
    category: categories[0]?.name || "Friend",
    note: "",
    seat: "",
    sendStatus: SEND_STATUS.pending,
  };
}

export default function GuestTable({
  guests = [],
  groups = [],
  categories = [],
  saving = false,
  emptyMessage = "No guests found.",
  currentDraft,
  publicInvitation,
  onSaveGuest,
  onDelete,
  onShowQr,
  onCopyLink,
  t,
}) {
  const nameInputRef = useRef(null);
  const submittingRef = useRef(false);
  const [newGuest, setNewGuest] = useState(() => emptyGuestForm(groups, categories));
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [nameError, setNameError] = useState("");

  const labels = {
    name: t ? t("batchFieldName") : "ឈ្មោះ",
    companionName: t ? t("batchFieldCompanion") : "ឈ្មោះអ្នកភ្ជាប់",
    phone: t ? t("batchFieldPhone") : "លេខទូរស័ព្ទ",
    count: t ? t("batchFieldSeats") : "ចំនួនកៅអី",
    group: t ? t("batchFieldSide") : "ក្រុម",
    status: t ? t("thStatus") : "Status",
    note: t ? t("batchFieldNotes") : "កំណត់ចំណាំ",
  };

  const updateDraft = (setDraft, field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveNewGuest = async () => {
    if (submittingRef.current) return false;
    if (!newGuest.name.trim()) {
      setNameError(t ? t("batchNameRequired") : "Guest name is required.");
      nameInputRef.current?.focus();
      return;
    }
    submittingRef.current = true;
    const submittedGuest = { ...newGuest };
    const pendingSave = onSaveGuest(submittedGuest, null);
    setNewGuest(emptyGuestForm(groups, categories));
    setNameError("");
    try {
      const saved = await pendingSave;
      if (!saved) {
        setNewGuest(submittedGuest);
      }
      requestAnimationFrame(() => nameInputRef.current?.focus());
      return saved;
    }
    finally { submittingRef.current = false; }
  };

  const submitNewGuest = (event) => {
    event.preventDefault();
    saveNewGuest();
  };

  const beginEdit = (guest) => {
    setEditingGuestId(guest.id);
    setEditingGuest({
      name: guest.name || "",
      companionName: guest.companionName || "",
      phone: guest.phone || "",
      count: String(guest.count || 1),
      group: guest.group || groups[0]?.name || "Groom Side",
      category: guest.category || categories[0]?.name || "Friend",
      note: guest.note || "",
      seat: guest.seat || "",
      sendStatus: guest.sendStatus || SEND_STATUS.pending,
    });
  };

  const saveEdit = async () => {
    if (!editingGuest?.name.trim()) return;
    const saved = await onSaveGuest(editingGuest, editingGuestId);
    if (saved) {
      setEditingGuestId(null);
      setEditingGuest(null);
    }
  };

  const handleEnter = (event, save) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
  };

  const renderEditor = (draft, setDraft, { newRow = false } = {}) => (
    <>
      <td data-label={labels.name}>
        <input
          className={INLINE_INPUT_CLASS}
          ref={newRow ? nameInputRef : undefined}
          aria-label={`${labels.name}${newRow ? "" : " " + (editingGuestId ?? "")}`}
          aria-required="true"
          aria-invalid={newRow && Boolean(nameError)}
          disabled={saving}
          value={draft.name}
          onChange={(event) => {
            updateDraft(setDraft, "name", event.target.value);
            if (newRow) setNameError("");
          }}
          onKeyDown={(event) => handleEnter(event, newRow ? saveNewGuest : saveEdit)}
          required
          placeholder="ឈ្មោះ..."
        />
        {newRow && nameError && <small className="pe-inline-field-error" role="alert">{nameError}</small>}
      </td>
      <td data-label={labels.companionName}>
        <input className={INLINE_INPUT_CLASS} aria-label={labels.companionName} value={draft.companionName} disabled={saving} placeholder="ឈ្មោះអ្នកភ្ជាប់..." onChange={(event) => updateDraft(setDraft, "companionName", event.target.value)} onKeyDown={(event) => handleEnter(event, newRow ? saveNewGuest : saveEdit)} />
      </td>
      <td data-label={labels.phone}>
        <input className={INLINE_INPUT_CLASS} type="tel" aria-label={labels.phone} value={draft.phone} disabled={saving} placeholder="ទូរស័ព្ទ..." onChange={(event) => updateDraft(setDraft, "phone", event.target.value)} onKeyDown={(event) => handleEnter(event, newRow ? saveNewGuest : saveEdit)} />
      </td>
      <td data-label={labels.count}>
        <input className={INLINE_INPUT_CLASS} type="number" min="1" aria-label={labels.count} value={draft.count} disabled={saving} placeholder="1" onChange={(event) => updateDraft(setDraft, "count", event.target.value)} onKeyDown={(event) => handleEnter(event, newRow ? saveNewGuest : saveEdit)} />
      </td>
      <td data-label={labels.group}>
        <select className={INLINE_INPUT_CLASS} aria-label={labels.group} value={draft.group} disabled={saving} onChange={(event) => updateDraft(setDraft, "group", event.target.value)} onKeyDown={(event) => handleEnter(event, newRow ? saveNewGuest : saveEdit)}>
          {groups.map((group) => <option key={group.id} value={group.name}>{group.name}</option>)}
        </select>
      </td>
      <td data-label={labels.status}>
        <select className={INLINE_INPUT_CLASS} aria-label={labels.status} value={draft.sendStatus} disabled={saving} onChange={(event) => updateDraft(setDraft, "sendStatus", event.target.value)} onKeyDown={(event) => handleEnter(event, newRow ? saveNewGuest : saveEdit)}>
          <option value={SEND_STATUS.pending}>Pending</option>
          <option value={SEND_STATUS.sent}>Sent</option>
          <option value={SEND_STATUS.opened}>Opened</option>
          <option value={SEND_STATUS.responded}>Responded</option>
        </select>
      </td>
      <td data-label={labels.note}>
        <input className={INLINE_INPUT_CLASS} aria-label={labels.note} value={draft.note} disabled={saving} placeholder="កំណត់ចំណាំ..." onChange={(event) => updateDraft(setDraft, "note", event.target.value)} onKeyDown={(event) => handleEnter(event, newRow ? saveNewGuest : saveEdit)} />
      </td>
    </>
  );

  return (
    <ResponsiveTable ariaLabel="Guests List Table" className="pe-guest-data-table w-full table-fixed">
      <colgroup>
        <col className="w-[18%]" /><col className="w-[13%]" /><col className="w-[12%]" />
        <col className="w-[7%]" /><col className="w-[11%]" /><col className="w-[12%]" />
        <col className="w-[14%]" /><col className="w-[13%]" />
      </colgroup>
      <thead>
        <tr>
          <th className="w-[18%]">{t ? t("thGuest") : "ឈ្មោះភ្ញៀវ"} <em aria-label="required">*</em></th>
          <th className="w-[13%]">{labels.companionName}</th>
          <th className="w-[12%]">{t ? t("thPhone") : "លេខទូរស័ព្ទ"}</th>
          <th className="w-[7%]">{labels.count}</th>
          <th className="w-[11%]">{labels.group}</th>
          <th className="w-[12%]">{labels.status}</th>
          <th className="w-[14%]">{labels.note}</th>
          <th className="w-[13%]">{t ? t("thActions") : "Actions"}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="pe-guest-inline-add-row">
          {renderEditor(newGuest, setNewGuest, { newRow: true })}
          <td data-label={t ? t("thActions") : "Actions"} className="pe-guest-inline-actions">
            <form className="pe-guest-inline-form" onSubmit={submitNewGuest}>
              <button type="submit" className="pe-guest-inline-save" disabled={saving}>
                {t ? t("inlineAddButton") : "+ បន្ថែម"}
              </button>
            </form>
          </td>
        </tr>
        {guests.map((guest) => {
          const inviteUrl = guestInviteUrl(currentDraft, guest, publicInvitation);
          const shareMessage = buildShareMessage(guest, currentDraft, publicInvitation);
          const isEditing = String(editingGuestId) === String(guest.id);
          return (
            <tr key={guest.id} className={isEditing ? "pe-guest-table-edit-row" : undefined} onDoubleClick={() => !isEditing && beginEdit(guest)}>
              {isEditing ? renderEditor(editingGuest, setEditingGuest) : (
                <>
                  <td data-label={labels.name}><strong>{guest.name}</strong></td>
                  <td data-label={labels.companionName}>{guest.companionName || "-"}</td>
                  <td data-label={labels.phone}>{guest.phone || "-"}</td>
                  <td data-label={labels.count}>{guest.count || 1}</td>
                  <td data-label={labels.group}>{guest.group || "-"}</td>
                  <td data-label={labels.status}>
                    <div className="pe-guest-statuses">
                      {guest.checkedIn && <StatusBadge status="CHECKED_IN" label={t ? t("checkedIn") : "Checked in"} variant="success" />}
                      {guest.rsvpStatus && <StatusBadge status={guest.rsvpStatus} label={`RSVP: ${guest.rsvpStatus.replaceAll("_", " ")}`} />}
                      {!guest.checkedIn && !guest.rsvpStatus && <StatusBadge status={guest.sendStatus} />}
                      {(guest.checkedIn || guest.rsvpStatus) && guest.sendStatus && guest.sendStatus !== SEND_STATUS.pending && guest.sendStatus !== "PENDING" && guest.sendStatus !== SEND_STATUS.responded && guest.sendStatus !== "RESPONDED" && <StatusBadge status={guest.sendStatus} />}
                    </div>
                  </td>
                  <td data-label={labels.note}>{guest.note || "-"}</td>
                </>
              )}
              <td>
                <div className="pe-guest-inline-actions">
                  <button
                    type="button"
                    className="pe-icon-btn"
                    onClick={() => onShowQr(guest)}
                    title={t ? t("showQr") : "បង្ហាញ QR Code"}
                    aria-label={t ? t("showQr") : "បង្ហាញ QR Code"}
                  >
                    <IoQrCodeOutline aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="pe-icon-btn"
                    onClick={() => onCopyLink(shareMessage || inviteUrl, guest)}
                    title={t ? t("copyMessage") : "ចម្លងសារអញ្ជើញ"}
                    aria-label={t ? t("copyMessage") : "ចម្លងសារអញ្ជើញ"}
                  >
                    <IoCopyOutline aria-hidden="true" />
                  </button>
                  {isEditing ? (
                    <>
                      <button type="button" className="pe-icon-btn" onClick={saveEdit} disabled={saving} title={t ? t("save") : "រក្សាទុក"} aria-label={t ? t("save") : "រក្សាទុក"}>
                        <IoCheckmarkOutline aria-hidden="true" />
                      </button>
                      <button type="button" className="pe-icon-btn" onClick={() => { setEditingGuestId(null); setEditingGuest(null); }} title={t ? t("cancel") : "បោះបង់"} aria-label={t ? t("cancel") : "បោះបង់"}>
                        <IoCloseOutline aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="pe-icon-btn"
                      onClick={() => beginEdit(guest)}
                      title={t ? t("edit") : "កែប្រែ"}
                      aria-label={t ? t("edit") : "កែប្រែ"}
                    >
                      <IoPencilOutline aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="pe-icon-btn danger"
                    onClick={() => onDelete(guest)}
                    title={t ? t("delete") : "លុប"}
                    aria-label={t ? t("delete") : "លុប"}
                  >
                    <IoTrashOutline aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        {guests.length === 0 && (
          <tr><td className="pe-guest-table-empty" colSpan="8">{emptyMessage}</td></tr>
        )}
      </tbody>
    </ResponsiveTable>
  );
}
