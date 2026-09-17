import { useState } from "react";
import { guestService } from "@/features/guests/api/guestApi";
import { saveManualGuests } from "@/shared/storage/hostPlanningStorage";
import {
  normalizeBackendGuest,
  normalizeManualGuest,
  toBackendGuestPayload,
  toManualGuest,
} from "../model/guestMappers";
import { SEND_STATUS } from "../model/guestConstants";

function invitationId(invitation) {
  return invitation?.id || invitation?.invitationId;
}

export function useGuestMutations({
  eventId,
  backendInvitation,
  setManualGuests,
  backendGuests,
  setBackendGuests,
  refreshData,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveGuest = async (form, editingId) => {
    setSaving(true);
    setError("");

    try {
      const backendIdToUse = backendInvitation ? invitationId(backendInvitation) : null;
      const targetBackendGuest = editingId
        ? backendGuests.find((item) => String(item.id) === String(editingId))
        : null;

      if (backendIdToUse && (targetBackendGuest || !editingId)) {
        const payload = toBackendGuestPayload(form);

        try {
          let savedBackend;
          if (targetBackendGuest) {
            savedBackend = await guestService.updateForInvitation(
              backendIdToUse,
              targetBackendGuest.backendId || targetBackendGuest.id,
              payload
            );
          } else {
            savedBackend = await guestService.createForInvitation(backendIdToUse, payload);
          }

          const normalized = normalizeBackendGuest(savedBackend);

          setBackendGuests((current) => {
            const index = current.findIndex((item) => String(item.id) === String(normalized.id));
            if (index >= 0) {
              const next = [...current];
              next[index] = normalized;
              return next;
            }
            return [...current, normalized];
          });
        } catch (apiErr) {
          console.warn("Backend guest save failed, falling back to local storage:", apiErr);
          const guestToSave = toManualGuest(form, editingId);
          setManualGuests((current) => {
            const next = editingId
              ? current.map((item) => (item.id === editingId ? guestToSave : item))
              : [...current, guestToSave];
            saveManualGuests(eventId, next);
            return next;
          });
        }
      } else {
        const guestToSave = toManualGuest(form, editingId);
        setManualGuests((current) => {
          const next = editingId
            ? current.map((item) => (item.id === editingId ? guestToSave : item))
            : [...current, guestToSave];
          saveManualGuests(eventId, next);
          return next;
        });
      }

      await refreshData();
      return true;
    } catch (err) {
      setError(err?.message || "Could not save guest record");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteGuest = async (guestToDelete) => {
    if (!guestToDelete) return false;
    setSaving(true);
    setError("");

    try {
      const backendIdToUse = backendInvitation ? invitationId(backendInvitation) : null;

      if (
        backendIdToUse &&
        guestToDelete.source === "backend" &&
        (guestToDelete.backendId || guestToDelete.id)
      ) {
        try {
          await guestService.removeFromInvitation(
            backendIdToUse,
            guestToDelete.backendId || guestToDelete.id
          );
        } catch (apiErr) {
          console.warn("Backend remove guest failed, removing locally:", apiErr);
        }
        setBackendGuests((current) =>
          current.filter((item) => String(item.id) !== String(guestToDelete.id))
        );
      }

      setManualGuests((current) => {
        const next = current.filter((item) => String(item.id) !== String(guestToDelete.id));
        saveManualGuests(eventId, next);
        return next;
      });

      await refreshData();
      return true;
    } catch (err) {
      setError(err?.message || "Could not remove guest");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const importGuests = async (importedList) => {
    setSaving(true);
    setError("");

    try {
      const backendIdToUse = backendInvitation ? invitationId(backendInvitation) : null;
      if (backendIdToUse) {
        // Collect existing phones and emails to prevent 409 Conflict with already-saved guests
        const existingPhones = new Set(
          (backendGuests || [])
            .map((g) => (g.phone ? String(g.phone).replace(/[^0-9]/g, "") : ""))
            .filter(Boolean)
        );
        const existingEmails = new Set(
          (backendGuests || [])
            .map((g) => (g.email ? String(g.email).trim().toLowerCase() : ""))
            .filter(Boolean)
        );

        const seenPhones = new Set(existingPhones);
        const seenEmails = new Set(existingEmails);
        const toImport = [];

        for (const guest of importedList) {
          const rawPhone = guest.phone ? String(guest.phone).replace(/[^0-9]/g, "") : null;
          const rawEmail = guest.email ? String(guest.email).trim().toLowerCase() : null;

          const isDuplicate =
            (rawPhone && seenPhones.has(rawPhone)) ||
            (rawEmail && seenEmails.has(rawEmail));

          if (isDuplicate) {
            continue;
          }

          if (rawPhone) seenPhones.add(rawPhone);
          if (rawEmail) seenEmails.add(rawEmail);
          toImport.push(guest);
        }

        if (toImport.length === 0) {
          const msg = "ភ្ញៀវទាំងអស់ក្នុង File នេះមានលេខទូរស័ព្ទ ឬ Email នៅក្នុងប្រព័ន្ធរួចរាល់ហើយ (ស្ទួន)";
          setError(msg);
          return false;
        }

        const payloadList = toImport.map(toBackendGuestPayload);
        await guestService.importForInvitation(backendIdToUse, payloadList);
      } else {
        const normalizedNew = importedList.map(normalizeManualGuest);
        setManualGuests((current) => {
          const next = [...current, ...normalizedNew];
          saveManualGuests(eventId, next);
          return next;
        });
      }

      await refreshData();
      return true;
    } catch (err) {
      const is409 = err?.status === 409 || err?.data?.code === "GUEST_DUPLICATE";
      const errorMsg = is409
        ? "មានភ្ញៀវដែលមានលេខទូរស័ព្ទ ឬ Email ដូចគ្នានៅក្នុងប្រព័ន្ធរួចហើយ (Conflict 409)"
        : err?.message || "Could not import guests";
      setError(errorMsg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const markGuestAsSent = async (guest) => {
    if (!guest) return;
    const nextStatus = SEND_STATUS.sent;

    setBackendGuests((current) =>
      current.map((g) =>
        String(g.id) === String(guest.id) ? { ...g, sendStatus: nextStatus } : g
      )
    );
    setManualGuests((current) => {
      const next = current.map((g) =>
        String(g.id) === String(guest.id) ? { ...g, sendStatus: nextStatus } : g
      );
      saveManualGuests(eventId, next);
      return next;
    });

    const backendIdToUse = backendInvitation ? invitationId(backendInvitation) : null;
    if (backendIdToUse && guest.source === "backend" && (guest.backendId || guest.id)) {
      try {
        await guestService.updateForInvitation(
          backendIdToUse,
          guest.backendId || guest.id,
          {
            ...toBackendGuestPayload(guest),
            sendStatus: "SENT",
          }
        );
      } catch (err) {
        console.warn("Could not persist sent status to backend:", err);
      }
    }
  };

  return {
    saving,
    error,
    setError,
    saveGuest,
    deleteGuest,
    importGuests,
    markGuestAsSent,
  };
}
