import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { rsvpService } from "@/features/rsvp/api/rsvpApi";
import { listDrafts } from "@/shared/storage/weddingStorage";
import { getActiveEventId, listManualGuests } from "@/shared/storage/hostPlanningStorage";
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
    invitations.find((invitation) => invitation.status === "PUBLISHED") ||
    invitations.find((invitation) => invitationId(invitation)) ||
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
    published[0]
  );
}

export function useGuests() {
  const { invitationId: requestedInvitationId = "" } = useParams();
  const drafts = useMemo(() => listDrafts(), []);
  const activeEventId = getActiveEventId();
  const currentDraft =
    drafts.find((draft) => draft.id === activeEventId) || drafts[0] || null;
  const eventId = currentDraft?.id || activeEventId || "";
  const backendDraftInvitationId = currentDraft?.backendInvitationId || currentDraft?.id || "";

  const draftMatch = useMemo(
    () => (currentDraft ? { ...currentDraft, id: eventId, backendInvitationId: backendDraftInvitationId } : null),
    [backendDraftInvitationId, currentDraft, eventId]
  );

  const [manualGuests, setManualGuests] = useState(() =>
    listManualGuests(eventId).map(normalizeManualGuest)
  );
  const [backendGuests, setBackendGuests] = useState([]);
  const [rsvpGuests, setRsvpGuests] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [publicInvitation, setPublicInvitation] = useState(null);
  const [backendInvitation, setBackendInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const myInvitations = await invitationService.listMine();
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

      let fetchedBackendGuests = [];
      const backendIdToUse = matchedBackend ? invitationId(matchedBackend) : null;

      if (backendIdToUse) {
        try {
          const [rawGuests, rawRsvps, rawCheckIns] = await Promise.all([
            guestService.listByInvitation(backendIdToUse),
            rsvpService.listByInvitation(backendIdToUse),
            typeof guestService.checkInList === "function"
              ? guestService.checkInList(backendIdToUse).catch(() => [])
              : Promise.resolve([]),
          ]);
          fetchedBackendGuests = (rawGuests || []).map(normalizeBackendGuest);
          setRsvpGuests((rawRsvps || []).map(normalizeBackendRsvp));
          setCheckIns(rawCheckIns || []);
        } catch (err) {
          setError(err?.message || "Could not fetch backend guest records");
          setRsvpGuests([]);
          setCheckIns([]);
        }
      } else {
        setRsvpGuests([]);
        setCheckIns([]);
      }

      setBackendGuests(fetchedBackendGuests);
    } catch (err) {
      setError(err?.message || "Failed to load guest data");
    } finally {
      setLoading(false);
    }
  }, [draftMatch, requestedInvitationId]);

  useEffect(() => {
    refreshData();
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

  return {
    eventId,
    draftMatch,
    backendInvitation,
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
