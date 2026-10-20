import { useState } from "react";
import { copyText } from "@/features/guests/model/guestMappers";
import { renderTicket, ticketBlob } from "./ticketRenderer";

export default function TicketActions({ ticket, ready }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function perform(action) {
    setBusy(true); setMessage("");
    try { await action(); }
    catch (error) { if (error.name !== "AbortError") setMessage(error.message || "The action failed. Please retry."); }
    finally { setBusy(false); }
  }
  async function file(scale = 2) {
    const canvas = document.createElement("canvas");
    await renderTicket(canvas, ticket, scale);
    return new File([await ticketBlob(canvas)], "invitation-ticket.png", { type: "image/png" });
  }
  async function download(scale) {
    const png = await file(scale); const url = URL.createObjectURL(png);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = png.name; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`PNG ready · ${600 * scale} × ${900 * scale}px`);
  }
  async function share() {
    const png = await file();
    if (navigator.canShare?.({ files: [png] })) await navigator.share({ files: [png], title: "Invitation ticket" });
    else if (navigator.share) await navigator.share({ url: ticket.invitationUrl, title: "Invitation" });
    else { if (!await copyText(ticket.invitationUrl)) throw new Error("Copy is unavailable. Please download the ticket to share it."); setMessage("Invitation link copied. You can also download the PNG to send it."); }
  }
  return <div className="ticket-actions">
    <div>
      <button type="button" disabled={!ready || busy} onClick={() => perform(() => download(2))}>ទាញយក PNG · 2×</button>
      <button type="button" disabled={!ready || busy} onClick={() => perform(() => download(3))}>PNG · 3×</button>
      <button type="button" disabled={!ready || busy} onClick={() => perform(share)}>ចែករំលែក · Share</button>
      <button type="button" disabled={busy} onClick={() => perform(async () => { if (!await copyText(ticket.invitationUrl)) throw new Error("Copy is unavailable. Please download the ticket to share it."); setMessage("Invitation link copied"); })}>Copy invitation link</button>
      <a href={`https://t.me/share/url?url=${encodeURIComponent(ticket.invitationUrl)}`} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Telegram</a>
    </div>
    <p>{ticket.kind === "GUEST" ? "កាត និងតំណនេះសម្រាប់ភ្ញៀវនេះតែប៉ុណ្ណោះ។ Share this personal ticket only with its guest." : "General invitation · This QR opens the invitation. It does not identify a guest for check-in."}</p>
    <p role="status" aria-live="polite">{busy ? "កំពុងរៀបចំ · Preparing…" : message}</p>
  </div>;
}
