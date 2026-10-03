import { useState } from "react";
import { Modal } from "@/shared/ui";
import { rsvpService } from "../api/rsvpApi";

export default function RsvpOwnerActions({ invitationId, record, onSaved }) {
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
      setMode(""); setNotice(mode === "delete" ? "RSVP response deleted." : "RSVP response saved.");
      try { await onSaved?.(); }
      catch { setRefreshFailed(true); setNotice("The RSVP change was saved, but the list could not refresh. Retry refresh before making another change."); }
    } catch (failure) { setError(failure.message || "Could not save RSVP. Your response is retained."); }
    finally { setBusy(false); }
  };
  return <>
    {notice && <p role="status">{notice}</p>}
    {refreshFailed && <button type="button" onClick={async () => { setBusy(true); try { await onSaved?.(); setRefreshFailed(false); setNotice("RSVP list refreshed."); } catch { setNotice("The RSVP change remains saved. Refresh is still unavailable."); } finally { setBusy(false); } }} disabled={busy}>Retry RSVP refresh</button>}
    <button type="button" className="dash-btn" onClick={() => open("edit")}>Edit RSVP</button>
    <button type="button" className="dash-btn" onClick={() => open("delete")}>Delete RSVP</button>
    <Modal isOpen={Boolean(mode)} onClose={() => !busy && setMode("")} title={mode === "delete" ? "Delete RSVP response?" : "Edit RSVP response"} closeOnEscape={!busy} closeOnBackdropClick={!busy}>
      <form onSubmit={submit}>
        {error && <p role="alert">{error}</p>}
        {mode === "delete" ? <p>This removes the attendance response and its wish. The invited guest remains. To remove only a wish, use the Wishes page.</p> : draft && <>
          <label>Status<select value={draft.responseStatus} onChange={(e) => setDraft({ ...draft, responseStatus: e.target.value })}>
            <option value="ATTENDING">Attending</option><option value="NOT_ATTENDING">Not attending</option><option value="MAYBE">Maybe</option>
          </select></label>
          <label>Attendee count<input type="number" min="0" max="100" required value={draft.attendeeCount} onChange={(e) => setDraft({ ...draft, attendeeCount: e.target.value })} /></label>
          <label>Wish message<textarea maxLength="2000" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} /></label>
        </>}
        <button type="submit" disabled={busy}>{busy ? "Saving…" : mode === "delete" ? "Confirm deletion" : "Save RSVP"}</button>
        <button type="button" disabled={busy} onClick={() => setMode("")}>Cancel</button>
      </form>
    </Modal>
  </>;
}
