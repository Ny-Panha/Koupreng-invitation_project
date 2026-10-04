import {
    IoAddOutline,
    IoGiftOutline,
} from "react-icons/io5";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useGifts } from "./hooks/useGifts";
import { GiftStatsCards } from "./components/GiftStatsCards";
import { GiftTable } from "./components/GiftTable";
import "./GiftsFeature.css";

export function GiftsFeature() {
    const { text: t } = useBackendMessages("gifts");
    const {
        eventId,
        drafts,
        backendInvitation,
        gifts,
        guestOptions,
        openAddForm,
        editingId,
        form,
        updateForm,
        isDuplicateGift,
        resetForm,
        submitGift,
        editGift,
        deleteGift,
        saving,
        error,
        loading,
    } = useGifts();

    if (loading) {
        return (
            <div className="gifts-page">
                <div className="gifts-empty">
                    {t("loadingText") || "កំពុងទាញយកទិន្នន័យ..."}
                </div>
            </div>
        );
    }

    return (
        <div className="wg-page">
            {/* Hero */}
            <div className="wg-hero">
                <div className="wg-hero-content">
                    <span className="wg-hero-tag">{t("heroTag")}</span>
                    <h1 className="wg-title">
                        <IoGiftOutline aria-hidden="true" />
                        {t("title")}
                    </h1>
                    <p className="wg-subtitle">{t("subtitle")}</p>
                </div>
                <button
                    type="button"
                    className="wg-add-btn"
                    disabled={!eventId || saving}
                    onClick={() => {
                        openAddForm();
                        requestAnimationFrame(() => document.querySelector(".wg-inline-form-row [data-gift-name-input]")?.focus());
                    }}
                >
                    <IoAddOutline aria-hidden="true" />
                    {t("addBtn")}
                </button>
            </div>

            {error && <div className="wg-empty">{error}</div>}

            {!backendInvitation?.id && !drafts.length && (
                <div className="wg-empty">
                    <div className="wg-empty-icon"><IoGiftOutline aria-hidden="true" /></div>
                    <h3>{t("noInvitationsTitle")}</h3>
                    <p>{t("noInvitationsText")}</p>
                </div>
            )}

            {/* Stats */}
            {eventId && <GiftStatsCards gifts={gifts} t={t} />}

            {/* Table */}
            {eventId && (
                <GiftTable
                    gifts={gifts}
                    guestOptions={guestOptions}
                    form={form}
                    editingId={editingId}
                    updateForm={updateForm}
                    submitGift={submitGift}
                    resetForm={resetForm}
                    isDuplicateGift={isDuplicateGift}
                    editGift={editGift}
                    deleteGift={(id) => deleteGift(id, t("deleteConfirm"))}
                    saving={saving}
                    t={t}
                />
            )}
        </div>
    );
}

export default GiftsFeature;
