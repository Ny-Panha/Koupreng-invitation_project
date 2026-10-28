import { useRef, useState } from "react";
import { Ticket } from 'lucide-react';
import TicketModal from "./TicketModal";

export default function PublicTicketAccess({ slug, token, accessToken, languageMode, displayContent, compact = false }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const label = String(languageMode).toLowerCase() === "en" ? (token ? "My ticket" : "Invitation ticket") : token ? "កាតរបស់ខ្ញុំ · My ticket" : "កាតអញ្ជើញ · Invitation ticket";
  return <>
    <meta name="referrer" content="no-referrer" />
    <meta name="robots" content="noindex,nofollow" />
    <button ref={trigger} type="button" className="public-ticket-button" data-compact={compact || undefined} aria-label={compact ? label : undefined} title={compact ? label : undefined} onClick={() => { trigger.current?.focus(); setOpen(true); }}>
      {compact ? <Ticket size={20} aria-hidden="true" /> : label}
    </button>
    {open && <TicketModal displayContent={displayContent} slug={slug} publicParams={{ token, accessToken }} onClose={() => setOpen(false)} />}
  </>;
}
