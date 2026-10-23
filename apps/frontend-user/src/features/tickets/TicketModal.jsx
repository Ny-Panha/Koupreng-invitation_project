import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEffect, useState } from "react";
import Modal from "@/shared/ui/Modal";
import { ticketService } from "./ticketApi";
import TicketPreview from "./TicketPreview";
import TicketActions from "./TicketActions";

export default function TicketModal({ eventId, guestId, slug, publicParams, onClose }) {
  const uiCopy = useUiCopy();
  const [state, setState] = useState({ loading: true });
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const token = publicParams?.token;
  const accessToken = publicParams?.accessToken;
  useEffect(() => {
    let active = true;
    const request = slug ? ticketService.publicTicket(slug, { token, accessToken }) : ticketService.ticket(eventId, guestId);
    request.then(ticket => { if (active) setState({ ticket }); })
      .catch(error => { if (active) setState({ error: error.message || "Ticket unavailable for this invitation or package." }); });
    return () => { active = false; };
  }, [eventId, guestId, slug, token, accessToken, retry]);
  return <Modal isOpen onClose={onClose} size="lg" title={uiCopy("កាតអញ្ជើញ", "Invitation ticket")}>
    {state.loading && <p role="status">{uiCopy("កំពុងរៀបចំកាត…", "Loading ticket…")}</p>}
    {state.error && <div role="alert"><p>{state.error}</p><button onClick={() => { setState({ loading: true }); setRetry(n => n + 1); }}>{uiCopy("ព្យាយាមម្ដងទៀត", "Retry")}</button></div>}
    {state.ticket && <><TicketPreview ticket={state.ticket} onReady={setReady} /><TicketActions ticket={state.ticket} ready={ready} /></>}
  </Modal>;
}
