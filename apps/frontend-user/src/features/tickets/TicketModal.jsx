import { PageSkeleton } from '@/shared/ui/LoadingState';
import { localizeTicket } from './ticketLocalization';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/shared/ui/Modal";
import { ticketService } from "./ticketApi";
import TicketPreview from "./TicketPreview";
import TicketActions from "./TicketActions";

export default function TicketModal({ eventId, guestId, slug, publicParams, onClose, displayContent }) {
  const uiCopy = useUiCopy();
  const [state, setState] = useState({ loading: true });
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const ticket = useMemo(() => localizeTicket(state.ticket, displayContent), [state.ticket, displayContent]);
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
    {state.loading && <PageSkeleton layout="ticket" label={uiCopy("កំពុងរៀបចំកាត…", "Loading ticket…")} />}
    {state.error && <div role="alert"><p>{state.error}</p><button onClick={() => { setState({ loading: true }); setRetry(n => n + 1); }}>{uiCopy("ព្យាយាមម្ដងទៀត", "Retry")}</button></div>}
    {state.ticket && <><TicketPreview ticket={ticket} onReady={setReady} /><TicketActions languageMode={ticket.languageMode} ticket={ticket} ready={ready} /></>}
  </Modal>;
}
