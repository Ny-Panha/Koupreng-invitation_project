import { useRef, useState } from "react";
import TicketModal from "./TicketModal";

export default function PublicTicketAccess({ slug, token, accessToken }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  return <>
    <meta name="referrer" content="no-referrer" />
    <meta name="robots" content="noindex,nofollow" />
    <button ref={trigger} type="button" className="public-ticket-button" onClick={() => { trigger.current?.focus(); setOpen(true); }}>
      {token ? "កាតរបស់ខ្ញុំ · My ticket" : "កាតអញ្ជើញ · Invitation ticket"}
    </button>
    {open && <TicketModal slug={slug} publicParams={{ token, accessToken }} onClose={() => setOpen(false)} />}
  </>;
}
