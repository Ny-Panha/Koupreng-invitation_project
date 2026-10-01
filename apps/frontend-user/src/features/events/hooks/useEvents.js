import { useState, useEffect, useCallback, useRef } from "react";
import { listDrafts, deleteDraft, saveDraft } from "../../../shared/storage/weddingStorage";
import { eventsApi } from "../api/eventsApi";
import { toast } from "../../../shared/ui/toast";
import { useAuth } from "../../auth/hooks/useAuth";
import { persistWeddingDraft } from "../../wedding-builder/utils/draftPublishApi";

export function useEvents(t) {
    const { user } = useAuth();
    const ownerUserId = user?.id || user?.userId;
    const [drafts, setDrafts] = useState(() => listDrafts(ownerUserId));
    const [draftToDelete, setDraftToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [syncingDraftId, setSyncingDraftId] = useState("");
    const [backendListLoaded, setBackendListLoaded] = useState(false);
    const autoSyncAttempted = useRef(new Set());
    const syncInFlight = useRef(new Set());

    const loadDrafts = useCallback(() => {
        eventsApi.listMine().then((apiInvs) => {
            const localDrafts = listDrafts(ownerUserId);
            const merged = (apiInvs || []).map((apiInv) => {
                const matchingLocal = localDrafts.find((ld) =>
                    String(ld.id) === String(apiInv.id) || String(ld.backendInvitationId) === String(apiInv.id)
                );
                if (matchingLocal) {
                    if (matchingLocal.syncStatus === "SYNC_FAILED") {
                        return {
                            ...apiInv,
                            ...matchingLocal,
                            id: apiInv.id,
                            backendInvitationId: apiInv.id,
                            syncStatus: "SYNC_FAILED",
                            templateId: matchingLocal.templateId || apiInv.templateId,
                        };
                    }
                    return {
                        ...matchingLocal,
                        ...apiInv,
                        syncStatus: "SYNCED",
                        syncError: "",
                        templateId: apiInv.templateId || matchingLocal.templateId,
                        title: apiInv.title || matchingLocal.title,
                    };
                }
                return apiInv;
            });
            localDrafts.forEach((ld) => {
                if (ld.syncStatus === "SYNCED" && ld.backendInvitationId && !apiInvs.some((m) => String(m.id) === String(ld.backendInvitationId))) {
                    deleteDraft(ld.id);
                    return;
                }
                if (!merged.some((m) => String(m.id) === String(ld.id) || String(m.id) === String(ld.backendInvitationId))) {
                    merged.push(ld);
                }
            });
            setDrafts(merged);
            setBackendListLoaded(true);
        }).catch(() => {
            setDrafts(listDrafts(ownerUserId));
            setBackendListLoaded(false);
        });
    }, [ownerUserId]);

    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    const handleDeleteClick = (draft) => {
        setDraftToDelete(draft);
    };

    const cancelDelete = () => {
        setDraftToDelete(null);
    };

    const syncDraft = useCallback(async (draft, { silent = false } = {}) => {
        const draftId = String(draft?.id || "");
        if (!draftId || syncInFlight.current.has(draftId)) return;
        syncInFlight.current.add(draftId);
        setSyncingDraftId(String(draft.id));
        try {
            const { response, patch } = await persistWeddingDraft(draft);
            const syncedDraft = {
                ...draft,
                ...patch,
                id: draft.id,
                backendInvitationId: response?.id || patch?.backendInvitationId || draft.backendInvitationId,
                syncStatus: "SYNCED",
                syncError: "",
            };
            saveDraft(syncedDraft);
            setDrafts((current) => current.map((item) => String(item.id) === String(draft.id) ? syncedDraft : item));
            if (!silent) toast("បាន sync កម្មវិធីទៅ server ជោគជ័យ / Event synced to server");
        } catch (error) {
            const partialPatch = error?.partialPatch || {};
            const failedDraft = {
                ...draft,
                ...partialPatch,
                id: draft.id,
                syncStatus: partialPatch.backendInvitationId || draft.backendInvitationId ? "SYNC_FAILED" : "LOCAL_ONLY",
                syncError: error?.message || "មិនអាច sync ទៅ server បានទេ",
            };
            saveDraft(failedDraft);
            setDrafts((current) => current.map((item) => String(item.id) === String(draft.id) ? failedDraft : item));
            toast.warning(`មិនអាច sync បានទេ: ${failedDraft.syncError}`);
        } finally {
            syncInFlight.current.delete(draftId);
            setSyncingDraftId("");
        }
    }, []);

    useEffect(() => {
        if (!backendListLoaded) return undefined;
        const draftsToSync = drafts.filter((draft) => {
            const isLocalOnly = draft.syncStatus === "LOCAL_ONLY"
                || (!draft.backendInvitationId && typeof draft.id === "string" && draft.id.startsWith("wed-"));
            const isRetry = draft.syncStatus === "SYNC_FAILED";
            const draftId = String(draft.id);
            return (isLocalOnly || isRetry) && !autoSyncAttempted.current.has(draftId);
        });
        if (!draftsToSync.length) return undefined;

        let active = true;
        const migrateDrafts = async () => {
            for (const draft of draftsToSync) {
                if (!active) return;
                const draftId = String(draft.id);
                autoSyncAttempted.current.add(draftId);
                await syncDraft(draft, { silent: true });
            }
        };
        migrateDrafts();
        return () => { active = false; };
    }, [backendListLoaded, drafts, syncDraft]);

    const confirmDelete = async (directDraft) => {
        const target = (directDraft && directDraft.id) ? directDraft : draftToDelete;
        if (!target) return;
        setIsDeleting(true);

        const targetId = target.id;
        const backendId = target.backendInvitationId || targetId;

        try {
            if (backendId) {
                await eventsApi.remove(backendId).catch((err) => {
                    console.warn("Failed to delete from API", err);
                });
            }
        } catch (e) {
            console.warn("Ignored local draft deletion error", e);
        }

        deleteDraft(targetId);
        if (target.backendInvitationId) {
            deleteDraft(target.backendInvitationId);
        }
        localStorage.removeItem(`koupreng.host.manualGuests.${targetId}`);
        localStorage.removeItem(`koupreng.host.guestGroups.${targetId}`);
        localStorage.removeItem(`koupreng.host.guestCategories.${targetId}`);
        localStorage.removeItem(`koupreng.host.expenses.${targetId}`);
        localStorage.removeItem(`koupreng.host.gifts.${targetId}`);

        setDrafts((prev) =>
            prev.filter(
                (d) =>
                    String(d.id) !== String(targetId) &&
                    String(d.backendInvitationId) !== String(targetId) &&
                    (!target.backendInvitationId || (String(d.id) !== String(target.backendInvitationId) && String(d.backendInvitationId) !== String(target.backendInvitationId)))
            )
        );
        setDraftToDelete(null);
        setIsDeleting(false);
        toast(t ? t("deletedSuccess") || "បានលុបកម្មវិធីជោគជ័យ" : "បានលុបកម្មវិធីជោគជ័យ");
    };

    return {
        drafts,
        syncingDraftId,
        syncDraft,
        draftToDelete,
        isDeleting,
        handleDeleteClick,
        cancelDelete,
        confirmDelete,
    };
}

export default useEvents;
