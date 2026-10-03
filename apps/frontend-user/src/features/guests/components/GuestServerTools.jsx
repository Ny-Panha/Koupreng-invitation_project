import { useEffect, useRef, useState } from "react";
import { Modal } from "@/shared/ui";
import { guestService } from "../api/guestApi";

export default function GuestServerTools({ invitationId }) {
  const [mode, setMode] = useState("");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  useEffect(() => { generation.current += 1; setMode(""); setData(null); setError(""); setBusy(false); return () => { generation.current += 1; }; }, [invitationId]);
  const close = () => { generation.current += 1; setMode(""); setData(null); setBusy(false); };
  const open = async (next) => {
    const request = ++generation.current;
    setMode(next); setData(null); setError(""); setBusy(true);
    try { const response = await (next === "groups" ? guestService.grouped(invitationId) : guestService.sendList(invitationId)); if (request === generation.current) setData(response); }
    catch (failure) { if (request === generation.current) setError(failure.message || "Could not load guest delivery data"); }
    finally { if (request === generation.current) setBusy(false); }
  };
  const copy = async (value) => {
    try { await navigator.clipboard.writeText(value); setError(""); }
    catch { setError("Could not copy the invitation link. Please retry."); }
  };
  return <div className="pe-guest-server-tools">
    <button type="button" className="pe-secondary-btn" onClick={() => open("groups")}>View saved guest groups</button>
    <button type="button" className="pe-secondary-btn" onClick={() => open("send-list")}>Guest send list</button>
    <Modal isOpen={Boolean(mode)} onClose={close} title={mode === "groups" ? "Saved guest groups" : "Guest send list"}>
      {busy && <p role="status">Loading…</p>}{error && <p role="alert">{error}</p>}
      {mode === "groups" && Array.isArray(data) && data.map((group) => <section key={group.category}><h3>{group.category || "Ungrouped"} ({group.totalGuests})</h3><ul>{(group.guests || []).map((guest) => <li key={guest.id}>{guest.guestName}</li>)}</ul></section>)}
      {mode === "send-list" && data && <><p>{data.sendableGuests} of {data.totalGuests} guests have contact information. Copying a link does not record delivery.</p>
        <ul>{(data.guests || []).map((guest) => <li key={guest.id}>{guest.guestName} · {guest.phone || guest.email || "No contact"} · {guest.sendStatus || "Not sent"}
          {guest.invitationUrl && <button type="button" onClick={() => copy(guest.invitationUrl)}>Copy link for {guest.guestName}</button>}</li>)}</ul></>}
    </Modal>
  </div>;
}
