import { useState, useEffect, useCallback } from "react";
import { listDrafts, deleteDraft } from "../../../shared/storage/weddingStorage";
import { eventsApi } from "../api/eventsApi";
import { toast } from "../../../shared/ui/toast";

export function useEvents(t) {
    const [drafts, setDrafts] = useState(listDrafts());
    const [draftToDelete, setDraftToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadDrafts = useCallback(() => {
        eventsApi.listMine().then((apiInvs) => {
            const localDrafts = listDrafts();
            const merged = [...(apiInvs || [])];
            localDrafts.forEach((ld) => {
                if (!merged.some((m) => String(m.id) === String(ld.id) || String(m.id) === String(ld.backendInvitationId))) {
                    merged.push(ld);
                }
            });
            if (merged.length > 0) {
                setDrafts(merged);
            }
        }).catch(() => {
            // Keep local drafts
        });
    }, []);

    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    const handleDeleteClick = (draft) => {
        setDraftToDelete(draft);
    };

    const cancelDelete = () => {
        setDraftToDelete(null);
    };

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
        draftToDelete,
        isDeleting,
        handleDeleteClick,
        cancelDelete,
        confirmDelete,
    };
}

export default useEvents;
