import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { budgetService } from "@/features/budget/api/budgetApi";
import { giftsApi } from "@/features/gifts/api/giftsApi";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { listDrafts } from "@/shared/storage/weddingStorage";
import {
  getActiveEventId,
  listBudgetExpenses,
  listManualCheckIns,
  listManualGuests,
  listWeddingGifts,
} from "@/shared/storage/hostPlanningStorage";
import { listRsvps, rsvpService } from "@/features/rsvp/api/rsvpApi";
import { asList } from "../model/financialReport";

function idOf(invitation) {
  return invitation?.id || invitation?.invitationId;
}

function sameId(left, right) {
  return left != null && right != null && String(left) === String(right);
}

function selectOwnerEvent(invitations, drafts, activeId) {
  const activeDraft = drafts.find((draft) => sameId(draft.id, activeId)
    || sameId(draft.backendInvitationId, activeId)) || drafts[0] || null;
  const candidateIds = [activeId, activeDraft?.backendInvitationId, activeDraft?.id];
  const matchedInvitation = invitations.find((invitation) =>
    candidateIds.some((candidateId) => sameId(idOf(invitation), candidateId))
    || Boolean(activeDraft?.slug && invitation.slug === activeDraft.slug)
  );
  const invitation = matchedInvitation
    || invitations.find((item) => item.status === "PUBLISHED")
    || invitations[0]
    || null;
  const draft = drafts.find((item) => sameId(item.id, invitation?.id)
    || sameId(item.backendInvitationId, invitation?.id)
    || Boolean(invitation?.slug && item.slug === invitation.slug)) || activeDraft;

  return { invitation, draft };
}

export function useActiveEventReport() {
  const { user } = useAuth();
  const ownerUserId = user?.id || user?.userId;
  const generation = useRef(0);
  const [sourceData, setSourceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedAt, setGeneratedAt] = useState(() => new Date());

  const reload = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError("");

    try {
      const drafts = ownerUserId == null ? [] : listDrafts(ownerUserId);
      const invitations = asList(await invitationService.listMine());
      if (request !== generation.current) return;

      const { invitation, draft } = selectOwnerEvent(invitations, drafts, getActiveEventId());
      if (!invitation && !draft) {
        setSourceData(null);
        return;
      }

      if (invitation) {
        const invitationId = idOf(invitation);
        const [gifts, budget, guests, rsvps, checkIns] = await Promise.all([
          giftsApi.listGifts(invitationId),
          budgetService.getBudget(invitationId),
          guestService.listByInvitation(invitationId),
          rsvpService.listByInvitation(invitationId),
          guestService.checkInList(invitationId),
        ]);
        if (request !== generation.current) return;
        setSourceData({
          invitation,
          gifts: asList(gifts),
          expenses: asList(budget?.items || budget?.budgetItems || budget),
          guests: asList(guests),
          rsvps: asList(rsvps),
          checkIns: asList(checkIns),
        });
      } else {
        const eventId = draft.id;
        setSourceData({
          invitation: draft,
          gifts: listWeddingGifts([], eventId),
          expenses: listBudgetExpenses([], eventId),
          guests: listManualGuests(eventId),
          rsvps: listRsvps(eventId),
          checkIns: listManualCheckIns(eventId),
        });
      }
      setGeneratedAt(new Date());
    } catch (loadError) {
      if (request === generation.current) {
        setError(loadError?.message || "មិនអាចទាញយករបាយការណ៍បានទេ / Could not load report");
      }
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [ownerUserId]);

  useEffect(() => {
    reload();
    const interval = window.setInterval(reload, 30_000);
    const handleFocus = () => reload();
    window.addEventListener("focus", handleFocus);
    return () => {
      generation.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [reload]);

  return { sourceData, loading, error, generatedAt, reload };
}

export default useActiveEventReport;