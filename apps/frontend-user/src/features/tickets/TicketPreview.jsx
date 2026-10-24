import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEffect, useRef, useState } from "react";
import { renderTicket } from "./ticketRenderer";
import "./tickets.css";

export default function TicketPreview({ ticket, canvasRef, onReady }) {
  const uiCopy = useUiCopy();
  const localRef = useRef(null);
  const ref = canvasRef || localRef;
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    onReady?.(false);
    const buffer = document.createElement("canvas");
    renderTicket(buffer, ticket).then(() => {
      if (!active || !ref.current) return;
      ref.current.width = buffer.width; ref.current.height = buffer.height;
      ref.current.getContext("2d").drawImage(buffer, 0, 0);
      setError(""); onReady?.(true);
    }).catch(error => { if (active) { setError(error.message || "The ticket could not be rendered. Check images and fonts, then retry."); onReady?.(false); } });
    return () => { active = false; };
  }, [ticket, ref, onReady, retry]);
  return <div className="ticket-preview">
    <canvas ref={ref} role="img" aria-label={`${ticket.title} — ${ticket.guestName || "General invitation"}. ${ticket.eventDate || ""} ${ticket.venueName || ""}`} />
    {error && <div role="alert">{error} <button type="button" onClick={() => setRetry(value => value + 1)}>{uiCopy("មើលជាមុនម្ដងទៀត", "Retry preview")}</button></div>}
    <p className="ticket-text-equivalent">{ticket.guestName} · {ticket.eventDate} {ticket.eventTime?.slice(0, 5)} · {ticket.venueName}
      {ticket.tableName ? ` · Table ${ticket.tableName}` : ""}{ticket.seatNumber ? ` · Seat ${ticket.seatNumber}` : ""}</p>
  </div>;
}
