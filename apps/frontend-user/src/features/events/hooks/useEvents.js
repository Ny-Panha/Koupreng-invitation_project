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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const loadGeneration = useRef(0);
    const autoSyncAttempted = useRef(new Set());
    const syncInFlight = useRef(new Set());

    const loadDrafts = useCallback(() => {
        const generation = ++loadGeneration.current;
        setLoading(true); setError("");
        eventsApi.listMine().then((apiInvs) => {
            if (generation !== loadGeneration.current) return;
            const localDrafts = listDrafts(ownerUserId);
            const merged = (apiInvs || []).map((apiInv) => {
                const matchingLocal = localDrafts.find((ld) =>
                    String(ld.id) === String(apiInv.id) || String(ld.backendInvitationId) === String(apiInv.id)
                );
                if (matchingLocal) {
                    const coverIdentity = Object.fromEntries(['coverUrl', 'coverSource', 'invitationCoverUrl', 'templateThumbnailUrl', 'templateCode', 'templateId'].map(key => [key, apiInv[key]]));
                    if (matchingLocal.syncStatus === "SYNC_FAILED") {
                        return {
                            ...apiInv,
                            ...matchingLocal,
                            shared: apiInv.shared,
                            coverIdentity,
                            id: apiInv.id,
                            coverUrl: apiInv.coverUrl,
                            coverSource: apiInv.coverSource,
                            templateThumbnailUrl: apiInv.templateThumbnailUrl,
                            invitationCoverUrl: apiInv.invitationCoverUrl,
                            backendInvitationId: apiInv.id,
                            syncStatus: "SYNC_FAILED",
                            templateId: matchingLocal.templateId || apiInv.templateId,
                        };
                    }
                    return {
                        ...matchingLocal,
                        ...apiInv,
                        coverIdentity,
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
                    merged.push({ ...ld, syncError: "Server record unavailable; local copy preserved" });
                    return;
                }
                if (!merged.some((m) => String(m.id) === String(ld.id) || String(m.id) === String(ld.backendInvitationId))) {
                    merged.push(ld);
                }
            });
            setDrafts(merged);
            setBackendListLoaded(true);
        }).catch((err) => {
            if (generation !== loadGeneration.current) return;
            setError(err.message || "Could not load events");
            setDrafts(listDrafts(ownerUserId));
            setBackendListLoaded(false);
        }).finally(() => { if (generation === loadGeneration.current) setLoading(false); });
    }, [ownerUserId]);

    useEffect(() => {
        loadDrafts();
        return () => { loadGeneration.current += 1; };
    }, [loadDrafts]);

    const handleDeleteClick = (draft) => {
        if (draft.shared) return;
        setDraftToDelete(draft);
    };

    const cancelDelete = () => {
        setDraftToDelete(null);
    };

    const syncDraft = useCallback(async (draft, { silent = false } = {}) => {
        const draftId = String(draft?.id || "");
        if (!draftId || syncInFlight.current.has(draftId)) return;
        // Display summaries carry server cover identity; retries must use the untouched local payload.
        const storedDraft = listDrafts(ownerUserId).find(item => String(item.id) === draftId
            || (item.backendInvitationId && String(item.backendInvitationId) === String(draft.backendInvitationId || draft.id)));
        if (storedDraft) draft = { ...storedDraft, backendInvitationId: draft.backendInvitationId || storedDraft.backendInvitationId };
        autoSyncAttempted.current.add(draftId);
        syncInFlight.current.add(draftId);
        setSyncingDraftId(draftId);
        try {
            if (!draft.backendInvitationId) {
                draft = { ...draft, clientRequestId: draft.clientRequestId || crypto.randomUUID(),
                    ...(ownerUserId != null ? { ownerUserId } : {}) };
                saveDraft(draft);
            }
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
            setDrafts((current) => current.map((item) => String(item.id) === draftId ? { ...syncedDraft, id: item.id, coverIdentity: item.coverIdentity } : item));
            loadDrafts();
            if (!silent) toast("បាន sync កម្មវិធីទៅ server ជោគជ័យ / Event synced to server");
        } catch (error) {
            const partialPatch = error?.partialPatch || {};
            const failedDraft = {
                ...draft,
                ...partialPatch,
                id: draft.id,
                syncStatus: partialPatch.backendInvitationId || draft.backendInvitationId ? "SYNC_FAILED" : "LOCAL_ONLY",
                syncFailure: { status: error?.status, code: error?.code, details: error?.details },
                syncError: error?.message || "មិនអាច sync ទៅ server បានទេ",
            };
            saveDraft(failedDraft);
            setDrafts((current) => current.map((item) => String(item.id) === draftId ? { ...failedDraft, id: item.id, coverIdentity: item.coverIdentity } : item));
            if (!silent) toast.warning(`មិនអាច sync បានទេ: ${failedDraft.syncError}`);
        } finally {
            syncInFlight.current.delete(draftId);
            setSyncingDraftId("");
        }
    }, [ownerUserId, loadDrafts]);

    useEffect(() => {
        if (!backendListLoaded) return undefined;
        const draftsToSync = drafts.filter((draft) => {
            if (draft.shared) return false;
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
        if (!target || target.shared) return;
        setIsDeleting(true);

        const targetId = target.id;
        const candidateId = target.backendInvitationId || targetId;
        const backendId = /^[1-9]\d*$/.test(String(candidateId)) ? candidateId : null;
        try {
            if (backendId) await eventsApi.remove(backendId);
        } catch (err) {
            setError(err.message || "Could not delete event; your draft is preserved");
            setIsDeleting(false);
            return;
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
        loading, error, reload: loadDrafts,
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
