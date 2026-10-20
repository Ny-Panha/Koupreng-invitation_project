import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { rsvpService } from "@/features/rsvp/api/rsvpApi";
import { listDrafts } from "@/shared/storage/weddingStorage";
import { getActiveEventId, listManualGuests } from "@/shared/storage/hostPlanningStorage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  normalizeBackendGuest,
  normalizeBackendRsvp,
  normalizeManualGuest,
  mergeBackendGuestsWithRsvps,
} from "../model/guestMappers";

function invitationId(invitation) {
  return invitation?.id || invitation?.invitationId;
}

function pickBackendInvitation(invitations, draft, requestedInvitationId) {
  if (!invitations?.length) return null;

  if (requestedInvitationId) {
    return (
      invitations.find(
        (invitation) => String(invitationId(invitation)) === String(requestedInvitationId)
      ) || null
    );
  }

  const draftId = draft?.backendInvitationId || draft?.invitationId || draft?.id;
  return (
    invitations.find((invitation) => String(invitationId(invitation)) === String(draftId)) ||
    invitations.find((invitation) => invitation.slug && invitation.slug === draft?.slug) ||
    null
  );
}

function pickPublicInvitation(invitations, draft, requestedInvitationId) {
  const published = (invitations || []).filter(
    (invitation) => invitation?.status === "PUBLISHED" && invitation?.slug
  );

  if (!published.length) return null;

  if (requestedInvitationId) {
    return (
      published.find(
        (invitation) => String(invitationId(invitation)) === String(requestedInvitationId)
      ) || null
    );
  }

  const draftId = draft?.backendInvitationId || draft?.invitationId || draft?.id;
  return (
    published.find((invitation) => String(invitationId(invitation)) === String(draftId)) ||
    published.find((invitation) => invitation.slug === draft?.slug) ||
    null
  );
}

export function useGuests() {
  const { eventId: routeEventId, invitationId: requestedInvitationId = routeEventId || "" } = useParams();
  const { user } = useAuth();
  const ownerUserId = user?.id || user?.userId;
  const drafts = useMemo(() => listDrafts(ownerUserId), [ownerUserId]);
  const activeEventId = requestedInvitationId || getActiveEventId();
  const currentDraft =
    drafts.find((draft) => String(draft.id) === String(activeEventId) || String(draft.backendInvitationId) === String(activeEventId)) || null;
  const eventId = requestedInvitationId || currentDraft?.id || "";
  const backendDraftInvitationId = currentDraft?.backendInvitationId || currentDraft?.id || "";

  const draftMatch = useMemo(
    () => (currentDraft ? { ...currentDraft, id: eventId, backendInvitationId: backendDraftInvitationId } : null),
    [backendDraftInvitationId, currentDraft, eventId]
  );

  const [manualGuests, setManualGuests] = useState(() =>
    eventId ? listManualGuests(eventId).map(normalizeManualGuest) : []
  );
  const [backendGuests, setBackendGuests] = useState([]);
  const [rsvpGuests, setRsvpGuests] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [publicInvitation, setPublicInvitation] = useState(null);
  const [backendInvitation, setBackendInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadedBackendInvitationId = useRef(null);
  const generation = useRef(0);

  const refreshData = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError("");

    try {
      const myInvitations = await invitationService.listMine();
      if (request !== generation.current) return;
      const matchedBackend = pickBackendInvitation(
        myInvitations,
        draftMatch,
        requestedInvitationId
      );
      const matchedPublic = pickPublicInvitation(
        myInvitations,
        draftMatch,
        requestedInvitationId
      );

      if (requestedInvitationId && !matchedBackend) {
        loadedBackendInvitationId.current = null;
        setBackendInvitation(null);
        setPublicInvitation(null);
        setBackendGuests([]);
        setRsvpGuests([]);
        setCheckIns([]);
        setError("Invitation not found or you do not have permission to manage its guests");
        return;
      }

      setBackendInvitation(matchedBackend);
      setPublicInvitation(matchedPublic);

      const backendIdToUse = matchedBackend ? invitationId(matchedBackend) : null;

      if (String(loadedBackendInvitationId.current) !== String(backendIdToUse)) {
        setBackendGuests([]);
        setRsvpGuests([]);
        setCheckIns([]);
      }
      loadedBackendInvitationId.current = backendIdToUse;

      if (backendIdToUse) {
        const [guestsResult, rsvpsResult, checkInsResult] = await Promise.allSettled([
          guestService.listByInvitation(backendIdToUse),
          rsvpService.listByInvitation(backendIdToUse),
          typeof guestService.checkInList === "function"
            ? guestService.checkInList(backendIdToUse)
            : Promise.resolve([]),
        ]);

        if (request !== generation.current) return;
        if (guestsResult.status === "fulfilled") {
          setBackendGuests((guestsResult.value || []).map(normalizeBackendGuest));
        }
        if (rsvpsResult.status === "fulfilled") {
          setRsvpGuests((rsvpsResult.value || []).map(normalizeBackendRsvp));
        }
        if (checkInsResult.status === "fulfilled") {
          setCheckIns(checkInsResult.value || []);
        }

        const failedResult = [guestsResult, rsvpsResult, checkInsResult].find(
          (result) => result.status === "rejected"
        );
        if (failedResult) {
          setError(failedResult.reason?.message || "Could not fetch backend guest records");
        }
      } else {
        setBackendGuests([]);
        setRsvpGuests([]);
        setCheckIns([]);
      }
    } catch (err) {
      if (request !== generation.current) return;
      setError(err?.message || "Failed to load guest data");
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [draftMatch, requestedInvitationId]);

  useEffect(() => {
    refreshData();
    return () => { generation.current += 1; };
  }, [refreshData]);

  const allGuests = useMemo(() => {
    if (backendInvitation) {
      return mergeBackendGuestsWithRsvps(backendGuests, rsvpGuests, checkIns);
    }
    if (requestedInvitationId) {
      return [];
    }
    return manualGuests;
  }, [backendGuests, backendInvitation, checkIns, manualGuests, requestedInvitationId, rsvpGuests]);

  const rawBackendInvitationId =
    (backendInvitation ? invitationId(backendInvitation) : null) ||
    (publicInvitation ? invitationId(publicInvitation) : null) ||
    (draftMatch?.backendInvitationId && /^\d+$/.test(String(draftMatch.backendInvitationId))
      ? Number(draftMatch.backendInvitationId)
      : null);
  const backendInvitationId = rawBackendInvitationId != null && /^\d+$/.test(String(rawBackendInvitationId))
    ? Number(rawBackendInvitationId)
    : null;

  return {
    eventId,
    draftMatch,
    backendInvitation,
    backendInvitationId,
    requestedInvitationId,
    publicInvitation,
    guests: allGuests,
    manualGuests,
    setManualGuests,
    backendGuests,
    setBackendGuests,
    loading,
    error,
    refreshData,
  };
}
