import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { OPERATIONS_MESSAGES } from "@/shared/i18n/operationsMessages";
import { Modal } from "@/shared/ui";
import { rsvpService } from "../api/rsvpApi";

export default function RsvpOwnerActions({ invitationId, record, onSaved, text }) {
  const lang = useLanguageStore(state => state.lang);
  const t = text || (key => OPERATIONS_MESSAGES.rsvp[lang][key]);
  const [mode, setMode] = useState("");
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshFailed, setRefreshFailed] = useState(false);
  const open = (next) => {
    setError(""); setNotice(""); setRefreshFailed(false); setMode(next);
    setDraft({ responseStatus: record.responseStatus || record.status || "ATTENDING", attendeeCount: record.attendeeCount ?? record.partySize ?? 1, message: record.message ?? record.wish ?? "" });
  };
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (mode === "delete") await rsvpService.remove(invitationId, record.id);
      else await rsvpService.update(invitationId, record.id, { ...draft, attendeeCount: Number(draft.attendeeCount) });
      setMode(""); setNotice(t(mode === "delete" ? "deleted" : "saved"));
      try { await onSaved?.(); }
      catch { setRefreshFailed(true); setNotice(t("refreshError")); }
    } catch { setError(t("saveError")); }
    finally { setBusy(false); }
  };
  return <div className="rsvp-owner-actions">
    {notice && <p role="status">{notice}</p>}
    {refreshFailed && <button type="button" onClick={async () => { setBusy(true); try { await onSaved?.(); setRefreshFailed(false); setNotice(t("refreshed")); } catch { setNotice(t("stillSaved")); } finally { setBusy(false); } }} disabled={busy}>{t("retry")}</button>}
    <button type="button" className="workspace-button" disabled={busy || refreshFailed} onClick={() => open("edit")}><Pencil size={16} aria-hidden="true" />{t("edit")}</button>
    <button type="button" className="workspace-button danger" disabled={busy || refreshFailed} onClick={() => open("delete")}><Trash2 size={16} aria-hidden="true" />{t("remove")}</button>
    <Modal isOpen={Boolean(mode)} onClose={() => !busy && setMode("")} title={t(mode === "delete" ? "deleteTitle" : "editTitle")} className="workspace-dialog rsvp-response-dialog" closeLabel={lang === "en" ? "Close" : "បិទ"} closeOnEscape={!busy} closeOnBackdropClick={!busy}>
      <form className="rsvp-response-form" onSubmit={submit}>
        {error && <p role="alert">{error}</p>}
        {mode === "delete" ? <p>{t("deleteText")}</p> : draft && <>
          <label>{t("status")}<select value={draft.responseStatus} onChange={(e) => setDraft({ ...draft, responseStatus: e.target.value })}>
            <option value="ATTENDING">{t("attending")}</option><option value="NOT_ATTENDING">{t("declined")}</option><option value="MAYBE">{t("maybe")}</option>
          </select></label>
          <label>{t("count")}<input type="number" min="0" max="100" required value={draft.attendeeCount} onChange={(e) => setDraft({ ...draft, attendeeCount: e.target.value })} /></label>
          <label>{t("message")}<textarea maxLength="2000" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} /></label>
        </>}
        <button type="submit" className={`workspace-button ${mode === "delete" ? "danger" : "primary"}`} disabled={busy}>{t(busy ? "saving" : mode === "delete" ? "confirmDelete" : "save")}</button>
        <button type="button" className="workspace-button" disabled={busy} onClick={() => setMode("")}>{t("cancel")}</button>
      </form>
    </Modal>
  </div>;
}
