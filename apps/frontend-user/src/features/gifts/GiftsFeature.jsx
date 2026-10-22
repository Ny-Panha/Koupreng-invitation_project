import {
    IoAddOutline,
    IoGiftOutline,
} from "react-icons/io5";
import { SkeletonCard } from "@/shared/ui";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useGifts } from "./hooks/useGifts";
import { GiftStatsCards } from "./components/GiftStatsCards";
import { GiftTable } from "./components/GiftTable";
import "./GiftsFeature.css";

export function GiftsFeature() {
    const { text: t, lang } = useBackendMessages("gifts");
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
            <div role="main" className="gifts-page">
                <SkeletonCard height="140px" /><SkeletonCard height="260px" />
            </div>
        );
    }

    return (
        <div role="main" className="wg-page">
            {/* Hero */}
            <header className="dash-page-header">
                <div className="wg-hero-content">
                    <span className="wg-hero-tag">{t("kicker")}</span>
                    <h1 className="wg-title">
                        <IoGiftOutline aria-hidden="true" />
                        {t("title")}
                    </h1>
                    <p className="wg-subtitle">{t("subtitle")}</p>
                </div>
                <button
                    type="button"
                    className="workspace-button primary"
                    disabled={!eventId || saving}
                    onClick={() => {
                        openAddForm();
                        requestAnimationFrame(() => document.querySelector(".wg-inline-form-row [data-gift-name-input]")?.focus());
                    }}
                >
                    <IoAddOutline aria-hidden="true" />
                    {t("addBtn")}
                </button>
            </header>

            {error && <div className="wg-empty">{error}</div>}

            {!backendInvitation?.id && !drafts.length && (
                <div className="wg-empty">
                    <div className="wg-empty-icon"><IoGiftOutline aria-hidden="true" /></div>
                    <h3>{t("noInvitationsTitle")}</h3>
                    <p>{t("noInvitationsText")}</p>
                </div>
            )}

            {/* Stats */}
            {eventId && gifts.length > 0 && <GiftStatsCards gifts={gifts} t={t} />}

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
                    deleteGift={(id) => deleteGift(id, `${t("deleteConfirmTitle")} ${t("deleteConfirmText")}`)}
                    saving={saving}
                    t={t}
                    lang={lang}
                />
            )}
        </div>
    );
}

export default GiftsFeature;
