import { useState, useEffect } from "react";
import {
    createHostRecordId,
    getActiveEventId,
    listManualGuests,
    listWeddingGifts,
    saveWeddingGifts,
} from "../../../shared/storage/hostPlanningStorage";
import { listDrafts } from "../../../shared/storage/weddingStorage";
import { giftsApi } from "../api/giftsApi";
import { useAuth } from "../../auth/hooks/useAuth";

export function toGiftPayload(form) {
    return {
        name: form.name.trim(),
        amount: Math.max(0, Number(form.amount) || 0),
        method: form.method,
        date: form.date || new Date().toISOString().slice(0, 10),
        note: form.note.trim(),
    };
}

export function normalizeGift(gift) {
    return {
        id: gift.id || createHostRecordId("gift"),
        name: gift.name || gift.giverName || gift.payerName || "",
        amount: Number(gift.amount) || 0,
        method: gift.method || "Bakong QR",
        date: gift.date || "",
        note: gift.note || "",
    };
}

export function normalizeGuestOption(guest) {
    return {
        id: guest.id || guest.guestId || createHostRecordId("guest"),
        name: guest.guestName || guest.name || "Guest",
        note: guest.note || "",
    };
}

export function useGifts() {
    const { user } = useAuth();
    const ownerUserId = user?.id || user?.userId;
    const [backendInvitation, setBackendInvitation] = useState(null);
    const activeEventId = getActiveEventId();
    const drafts = listDrafts(ownerUserId);
    const currentDraft = drafts.find((draft) => draft.id === activeEventId) || drafts[0] || null;
    const backendInvitationId = currentDraft?.backendInvitationId || currentDraft?.id || "";
    const eventId = currentDraft?.id || activeEventId || backendInvitation?.id || "";

    const [gifts, setGifts] = useState(() => listWeddingGifts([], eventId).map(normalizeGift));
    const [guestOptions, setGuestOptions] = useState(() => listManualGuests(eventId));
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: "", amount: "", method: "Bakong QR", date: "", note: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");

        giftsApi.listMineInvitations()
            .then(async (items) => {
                if (!active) return;
                const list = Array.isArray(items) ? items : items?.data || [];
                const selected = list.find(inv => String(inv.id) === String(backendInvitationId))
                    || list.find(inv => inv.status === "PUBLISHED")
                    || list[0]
                    || null;

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

    const isDuplicateGift = gifts.some(g => g.name === form.name && g.id !== editingId);

    const resetForm = () => {
        setEditingId(null);
        setForm({ name: "", amount: "", method: "Bakong QR", date: "", note: "" });
        setShowForm(false);
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm({ name: "", amount: "", method: "Bakong QR", date: "", note: "" });
        setShowForm(true);
    };

    const submitGift = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !eventId || saving) return;
        setSaving(true);
        setError("");
        try {
            const payload = toGiftPayload(form);
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
        } catch (err) {
            setError(err.message || "Could not save wedding gift");
        } finally {
            setSaving(false);
        }
    };

    const editGift = (gift) => {
        setEditingId(gift.id);
        setForm({ name: gift.name, amount: String(gift.amount), method: gift.method, date: gift.date, note: gift.note || "" });
        setShowForm(true);
    };

    const deleteGift = async (giftId, confirmMsg) => {
        if (!window.confirm(confirmMsg || "Are you sure you want to delete this gift?")) return;
        if (!eventId || saving) return;
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
        drafts,
        backendInvitation,
        gifts,
        guestOptions,
        showForm,
        openAddModal,
        setShowForm,
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
