import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { budgetService } from "@/features/budget/api/budgetApi";
import { giftsApi } from "@/features/gifts/api/giftsApi";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { rsvpService } from "@/features/rsvp/api/rsvpApi";
import { asList } from "../model/financialReport";

export function useActiveEventReport() {
  const params = useParams();
  const eventId = params.eventId || params.invitationId;
  const generation = useRef(0);
  const [sourceData, setSourceData] = useState(null);
  const [loadedEventId, setLoadedEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const reload = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true); setError("");
    try {
      if (!/^[1-9]\d*$/.test(String(eventId || ""))) throw new Error("Choose an event to view its report");
      const invitation = await invitationService.get(eventId);
      const [gifts, budget, guests, rsvps, checkIns] = await Promise.all([
        giftsApi.listGifts(eventId), budgetService.getBudget(eventId), guestService.listByInvitation(eventId),
        rsvpService.listByInvitation(eventId), guestService.checkInList(eventId),
      ]);
      if (request !== generation.current) return;
      setLoadedEventId(eventId);
      setSourceData({ invitation, gifts: asList(gifts), expenses: asList(budget?.items || budget?.budgetItems || budget), guests: asList(guests), rsvps: asList(rsvps), checkIns: asList(checkIns) });
      setGeneratedAt(new Date());
    } catch (err) {
      if (request === generation.current) {
        if ([401, 403, 404].includes(err?.status ?? err?.response?.status)) { setSourceData(null); setLoadedEventId(null); }
        setError(err.message);
      }
    }
    finally { if (request === generation.current) setLoading(false); }
  }, [eventId]);
  useEffect(() => {
    reload();
    const interval = window.setInterval(reload, 30_000);
    window.addEventListener("focus", reload);
    return () => { generation.current += 1; window.clearInterval(interval); window.removeEventListener("focus", reload); };
  }, [reload]);
  return { sourceData: loadedEventId === eventId ? sourceData : null, loading, error, generatedAt, reload };
}
export default useActiveEventReport;
