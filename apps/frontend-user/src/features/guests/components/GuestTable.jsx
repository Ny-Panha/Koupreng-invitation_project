import { useRef, useState } from "react";
import { Armchair, Phone, Plus, SearchX, Upload, Users } from "lucide-react";
import { ResponsiveTable, StatusBadge } from "@/shared/ui";
import { buildShareMessage, guestInviteUrl, initials } from "../model/guestMappers";
import { SEND_STATUS } from "../model/guestConstants";
import GuestRowActions from "./GuestRowActions";

function emptyGuestForm(groups, categories) {
  return { name: "", companionName: "", phone: "", count: "1", group: groups[0]?.name || "Groom Side", category: categories[0]?.name || "Friend", note: "", seat: "", sendStatus: SEND_STATUS.pending };
}

export default function GuestTable({
  guests = [], groups = [], categories = [], saving = false, emptyMessage = "No guests found.",
  currentDraft, publicInvitation, onSaveGuest, onEdit, onDelete, onShowQr, onCopyLink,
  onMarkAsSent, onOpenAddGuest, onOpenImport, onClearFilters, isFiltered = false, showQuickAdd = true, t,
}) {
  const nameInputRef = useRef(null);
  const submittingRef = useRef(false);
  const [newGuest, setNewGuest] = useState(() => emptyGuestForm(groups, categories));
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [nameError, setNameError] = useState("");
  const text = (key, fallback) => t ? t(key) : fallback;
  const labels = {
    name: text("batchFieldName", "ឈ្មោះ"), companionName: text("batchFieldCompanion", "ឈ្មោះអ្នកភ្ជាប់"),
    phone: text("batchFieldPhone", "លេខទូរស័ព្ទ"), count: text("batchFieldSeats", "ចំនួនកៅអី"),
    group: text("batchFieldSide", "ក្រុម"), status: text("thStatus", "Status"), note: text("batchFieldNotes", "កំណត់ចំណាំ"),
  };

  const saveNewGuest = async () => {
    if (submittingRef.current || saving) return false;
    if (!newGuest.name.trim()) {
      setNameError(text("batchNameRequired", "សូមបញ្ចូលឈ្មោះភ្ញៀវ"));
      nameInputRef.current?.focus();
      return false;
    }
    submittingRef.current = true;
    try {
      const saved = onSaveGuest ? await onSaveGuest({ ...newGuest }, null) : true;
      if (saved) { setNewGuest(emptyGuestForm(groups, categories)); setNameError(""); }
      requestAnimationFrame(() => nameInputRef.current?.focus());
      return saved;
    } finally { submittingRef.current = false; }
  };

  const beginEdit = (guest) => {
    if (onEdit) { onEdit(guest); return; }
    setEditingGuestId(guest.id);
    setEditingGuest({ ...emptyGuestForm(groups, categories), ...guest, count: String(guest.count || 1) });
  };
  const saveEdit = async () => {
    if (!editingGuest?.name.trim() || saving) return;
    const saved = onSaveGuest ? await onSaveGuest(editingGuest, editingGuestId) : true;
    if (saved) { setEditingGuestId(null); setEditingGuest(null); }
  };
  const editor = (draft, setDraft, isNew = false) => (
    <div className="guest-inline-editor">
      {Object.entries(labels).map(([field, label]) => (
        <label key={field}>
          <span>{label}</span>
          {field === "group" || field === "status" ? (
            <select aria-label={label} value={draft[field === "status" ? "sendStatus" : field]} disabled={saving} onChange={(event) => setDraft((value) => ({ ...value, [field === "status" ? "sendStatus" : field]: event.target.value }))}>
              {(field === "group" ? groups.map((g) => [g.name, g.name]) : Object.entries(SEND_STATUS).map(([key, value]) => [value, text(`status${key[0].toUpperCase()}${key.slice(1)}`, key)])).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          ) : (
            <input ref={isNew && field === "name" ? nameInputRef : undefined} aria-label={`${label}${!isNew && field === "name" ? ` ${editingGuestId}` : ""}`} type={field === "count" ? "number" : field === "phone" ? "tel" : "text"} min={field === "count" ? "1" : undefined} required={field === "name"} value={draft[field]} disabled={saving}
              aria-invalid={isNew && field === "name" && Boolean(nameError)}
              onChange={(event) => { setDraft((value) => ({ ...value, [field]: event.target.value })); if (isNew) setNameError(""); }}
              onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); (isNew ? saveNewGuest : saveEdit)(); } }} />
          )}
        </label>
      ))}
      {isNew && <button type="button" className="guest-button guest-button-primary" disabled={saving} onClick={saveNewGuest}>{text("inlineAddButton", "បន្ថែម")}</button>}
      {isNew && nameError && <small role="alert">{nameError}</small>}
    </div>
  );

  return (
    <ResponsiveTable ariaLabel="Guests List Table" className="guest-table" containerClassName="guest-table-container">
      <colgroup><col className="guest-col-person" /><col className="guest-col-group" /><col className="guest-col-seats" /><col className="guest-col-status" /><col className="guest-col-actions" /></colgroup>
      <thead><tr>
        <th scope="col">{text("thGuest", "ឈ្មោះភ្ញៀវ")}</th>
        <th scope="col">{text("thGroup", "ក្រុម")} / {text("thCategory", "ប្រភេទ")}</th>
        <th scope="col">{text("thSeats", "ចំនួនកៅអី")}</th>
        <th scope="col">{labels.status}</th>
        <th scope="col" className="guest-actions-heading">{text("thActions", "Actions")}</th>
      </tr></thead>
      <tbody>
        {showQuickAdd && <tr className="pe-guest-inline-add-row"><td colSpan="5">{editor(newGuest, setNewGuest, true)}</td></tr>}
        {guests.map((guest) => {
          const isEditing = editingGuestId != null && String(editingGuestId) === String(guest.id);
          const actions = <GuestRowActions guest={guest} saving={saving} onShowQr={onShowQr} onCopyLink={onCopyLink} onMarkAsSent={onMarkAsSent} onEdit={beginEdit} onDelete={onDelete} onSave={saveEdit} onCancel={() => { setEditingGuestId(null); setEditingGuest(null); }} isEditing={isEditing} shareMessage={buildShareMessage(guest, currentDraft, publicInvitation) || guestInviteUrl(currentDraft, guest, publicInvitation)} t={t} />;
          return <tr key={guest.id} className="guest-record-row">
            {isEditing ? <><td colSpan="4">{editor(editingGuest, setEditingGuest)}</td><td>{actions}</td></> : <>
              <td className="guest-person-cell" data-label={text("thGuest", "ឈ្មោះភ្ញៀវ")}>
                <div className="guest-person"><span className={`guest-avatar ${guest.group === groups[1]?.name ? "guest-avatar-bride" : ""}`} aria-hidden="true">{initials(guest.name)}</span>
                  <div className="guest-person-info"><strong>{guest.name}</strong>
                    {guest.companionName && <span className="guest-companion">{guest.companionName}</span>}
                    <span className="guest-contact"><Phone size={12} aria-hidden="true" />{guest.phone || text("contactMissing", "មិនមានលេខទូរស័ព្ទ")}</span>
                    {guest.note && <details className="guest-note"><summary>{text("fieldNote", "ចំណាំ")}</summary><p>{guest.note}</p></details>}
                  </div>
                </div>
              </td>
              <td className="guest-group-cell" data-label={text("fieldGroup", "ក្រុម")}><span className="guest-group-tag">{guest.group || "—"}</span><span className="guest-category">{guest.category || "—"}</span></td>
              <td className="guest-seat-cell" data-label={text("thSeats", "ចំនួនកៅអី")}><span className="guest-seat-count"><Armchair size={15} aria-hidden="true" />{guest.count || 1}</span><span className="guest-table-number">{guest.seat || text("noTable", "មិនទាន់កំណត់តុ")}</span></td>
              <td className="guest-status-cell" data-label={labels.status}><div className="pe-guest-statuses">
                {guest.checkedIn && <StatusBadge status="CHECKED_IN" label={text("checkedIn", "Checked in")} variant="success" />}
                {guest.rsvpStatus && <StatusBadge status={guest.rsvpStatus} label={`RSVP: ${guest.rsvpStatus.replaceAll("_", " ")}`} />}
                {!guest.checkedIn && !guest.rsvpStatus && <StatusBadge status={guest.sendStatus} />}
                {(guest.checkedIn || guest.rsvpStatus) && guest.sendStatus && ![SEND_STATUS.pending, "PENDING", SEND_STATUS.responded, "RESPONDED"].includes(guest.sendStatus) && <StatusBadge status={guest.sendStatus} />}
              </div></td>
              <td className="guest-action-cell">{actions}</td>
            </>}
          </tr>;
        })}
        {guests.length === 0 && <tr className="guest-empty-row"><td colSpan="5">
          <div className="guest-empty-state"><span className="guest-empty-icon">{isFiltered ? <SearchX size={28} aria-hidden="true" /> : <Users size={28} aria-hidden="true" />}</span>
            <h3>{isFiltered ? text("emptySearchTitle", "មិនមានលទ្ធផលស្វែងរកទេ") : text("emptyTitle", "មិនទាន់មានភ្ញៀវនៅឡើយទេ")}</h3>
            <p>{isFiltered ? emptyMessage : text("emptyListHint", emptyMessage)}</p>
            <div className="guest-empty-actions">{isFiltered ? <button type="button" className="guest-button guest-button-secondary" onClick={onClearFilters}>{text("clearFilters", "សម្អាតតម្រង")}</button> : <>
              {onOpenAddGuest && <button type="button" className="guest-button guest-button-primary" onClick={onOpenAddGuest}><Plus size={17} aria-hidden="true" />{text("addGuestAction", "បន្ថែមភ្ញៀវ")}</button>}
              {onOpenImport && <button type="button" className="guest-button guest-button-secondary" onClick={onOpenImport}><Upload size={17} aria-hidden="true" />{text("importBtn", "នាំចូល")}</button>}
            </>}</div>
          </div>
        </td></tr>}
      </tbody>
    </ResponsiveTable>
  );
}
