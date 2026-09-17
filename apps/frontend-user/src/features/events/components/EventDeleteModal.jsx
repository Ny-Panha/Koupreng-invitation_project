import { ConfirmDialog } from "@/shared/ui";

export function EventDeleteModal({ draftToDelete, onCancel, onConfirm, isDeleting, t }) {
    if (!draftToDelete) return null;

    const title = (t && t("deleteModalTitle")) || "លុបទិន្នន័យនេះ?";
    const desc = (t && t("deleteModalDesc")) || "នេះនឹងលុបទិន្នន័យនេះជាអចិន្ត្រៃយ៍។";

    const confirmLabel = isDeleting
        ? ((t && t("deleting")) || "កំពុងលុប...")
        : ((t && t("confirmBtn")) || "យល់ព្រម");

    const cancelLabel = (t && t("cancelBtn")) || "បោះបង់";

    return (
        <ConfirmDialog
            isOpen={Boolean(draftToDelete)}
            onClose={onCancel}
            onConfirm={onConfirm}
            title={title}
            message={desc}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            isDestructive={true}
            isLoading={isDeleting}
        />
    );
}

export default EventDeleteModal;
