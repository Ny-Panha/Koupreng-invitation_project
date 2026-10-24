import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    createHostRecordId,
    listManualGuests,
    listWeddingGifts,
    saveWeddingGifts,
} from "../../../shared/storage/hostPlanningStorage";
import { listDrafts } from "../../../shared/storage/weddingStorage";
import { giftsApi } from "../api/giftsApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { localDateString } from "@/shared/utils/localDate";

export function toGiftPayload(form) {
    return {
        name: form.name.trim(),
        guestId: form.guestId ?? null,
        amount: Number(form.amount || 0),
        currency: form.currency || "USD",
        method: form.method,
        date: form.date || localDateString(),
        note: form.note.trim(),
    };
}

export function normalizeGift(gift) {
    return {
        id: gift.id || createHostRecordId("gift"),
        guestId: gift.guestId || null,
        name: gift.name || gift.giverName || gift.payerName || "",
        amount: Number(gift.amount) || 0,
        currency: gift.currency || gift.currencyCode || "USD",
        method: gift.method || "",
        date: gift.date || "",
        note: gift.note || "",
    };
}

export function normalizeGuestOption(guest) {
    return {
        id: guest.id || guest.guestId || createHostRecordId("guest"),
        name: guest.guestName || guest.name || "Guest",
        phone: guest.phone || guest.phoneNumber || "",
        side: guest.side || guest.guestSide || "",
        group: guest.group || guest.guestGroup || guest.groupName || "",
        note: guest.note || "",
    };
}

export function useGifts() {
    const { user } = useAuth();
    const ownerUserId = user?.id || user?.userId;
    const [backendInvitation, setBackendInvitation] = useState(null);
    const params = useParams();
    const activeEventId = params.eventId || params.invitationId || "";
    const drafts = listDrafts(ownerUserId);
    const currentDraft = drafts.find((draft) => String(draft.id) === String(activeEventId) || String(draft.backendInvitationId) === String(activeEventId)) || null;
    const backendInvitationId = params.eventId || params.invitationId || currentDraft?.backendInvitationId || "";
    const eventId = activeEventId;

    const [gifts, setGifts] = useState([]);
    const [guestOptions, setGuestOptions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const createRequestId = useRef(null);
    const inFlight = useRef(false);
    const [form, setForm] = useState({ name: "", guestId: null, amount: "", currency: "USD", method: "Cash", date: localDateString(), note: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setBackendInvitation(null);
        setShowForm(false); setEditingId(null); createRequestId.current = null;
        setGifts([]); setGuestOptions([]);
        setError("");

        giftsApi.listMineInvitations()
            .then(async (items) => {
                if (!active) return;
                const list = Array.isArray(items) ? items : items?.data || [];
                const selected = list.find(inv => String(inv.id) === String(backendInvitationId)) || null;
                if (!selected) throw new Error("Choose an event you own to manage gifts");

                setBackendInvitation(selected);

                if (selected?.id) {
                    const [backendGifts, backendGuests] = await Promise.all([
                        giftsApi.listGifts(selected.id),
                        giftsApi.listGuests(selected.id),
                    ]);
                    if (active) {
                        const giftsList = Array.isArray(backendGifts) ? backendGifts : backendGifts?.data || [];
                        const guestsList = Array.isArray(backendGuests) ? backendGuests : backendGuests?.data || [];
                        setGifts(giftsList.map(normalizeGift));
                        setGuestOptions(guestsList.map(normalizeGuestOption));
                    }
                } else {
                    if (active) {
                        setGifts(listWeddingGifts([], eventId).map(normalizeGift));
                        setGuestOptions(listManualGuests(eventId));
                    }
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err.message || "Could not load gifts from backend");
                    setGifts([]);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backendInvitationId]);

    const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const isDuplicateGift = gifts.some((gift) => {
        if (gift.id === editingId) return false;
        if (form.guestId != null) return gift.guestId != null && String(gift.guestId) === String(form.guestId);
        return gift.guestId == null && gift.name === form.name;
    });

    const resetForm = () => {
        setShowForm(false); setError(''); createRequestId.current = null;
        setEditingId(null);
        setForm({ name: "", guestId: null, amount: "", currency: "USD", method: "Cash", date: localDateString(), note: "" });
    };

    const openAddForm = () => {
        setShowForm(true); setError(''); createRequestId.current = crypto.randomUUID();
        setEditingId(null);
        setForm({ name: "", guestId: null, amount: "", currency: "USD", method: "Cash", date: localDateString(), note: "" });
    };

    const submitGift = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !eventId || !backendInvitation?.id || inFlight.current) return false;
        const amount = Number(form.amount || 0);
        if (!Number.isFinite(amount) || amount < 0 || amount > 9999999999.99 || !/^\d+(?:\.\d{1,2})?$/.test(form.amount || '0') || !['USD', 'KHR'].includes(form.currency)) {
            setError('Enter a nonnegative amount with at most two decimal places and choose USD or KHR.'); return false;
        }
        if (isDuplicateGift) return false;
        inFlight.current = true;
        setSaving(true);
        setError("");
        try {
            const payload = toGiftPayload(form);
            if (!editingId) payload.clientRequestId = createRequestId.current ||= crypto.randomUUID();
            if (backendInvitation?.id) {
                if (editingId) {
                    const updated = await giftsApi.updateGift(backendInvitation.id, editingId, payload);
                    const normalized = normalizeGift(updated);
                    setGifts((current) => current.map((g) => g.id === editingId ? normalized : g));
                } else {
                    const created = await giftsApi.createGift(backendInvitation.id, payload);
                    const normalized = normalizeGift(created);
                    setGifts((current) => [normalized, ...current]);
                }
            } else {
                const nextGift = normalizeGift(payload);
                if (editingId) nextGift.id = editingId;
                const nextGifts = editingId
                    ? gifts.map((gift) => (gift.id === editingId ? nextGift : gift))
                    : [nextGift, ...gifts];
                setGifts(nextGifts);
                saveWeddingGifts(nextGifts, eventId);
            }
            resetForm();
            return true;
        } catch (err) {
            setError(err.message || "Could not save wedding gift");
            return false;
        } finally {
            setSaving(false);
            inFlight.current = false;
        }
    };

    const editGift = (gift) => {
        setShowForm(true); setError('');
        setEditingId(gift.id);
        setForm({ name: gift.name, guestId: gift.guestId || null, amount: String(gift.amount), currency: gift.currency || "USD", method: gift.method, date: gift.date, note: gift.note || "" });
    };

    const deleteGift = async (giftId, confirmMsg) => {
        if (!window.confirm(confirmMsg || "Are you sure you want to delete this gift?")) return;
        if (!eventId || !backendInvitation?.id || saving) return;
        setSaving(true);
        setError("");
        try {
            if (backendInvitation?.id) {
                await giftsApi.removeGift(backendInvitation.id, giftId);
                setGifts((current) => current.filter((g) => g.id !== giftId));
            } else {
                const nextGifts = gifts.filter((gift) => gift.id !== giftId);
                setGifts(nextGifts);
                saveWeddingGifts(nextGifts, eventId);
            }
        } catch (err) {
            setError(err.message || "Could not delete wedding gift");
        } finally {
            setSaving(false);
        }
    };

    return {
        eventId,
        showForm,
        drafts,
        backendInvitation,
        gifts,
        guestOptions,
        openAddForm,
        editingId,
        setEditingId,
        form,
        setForm,
        updateForm,
        isDuplicateGift,
        resetForm,
        submitGift,
        editGift,
        deleteGift,
        saving,
        error,
        loading,
    };
}

export default useGifts;
