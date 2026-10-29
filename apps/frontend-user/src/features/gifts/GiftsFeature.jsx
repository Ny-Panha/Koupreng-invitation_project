import { PageSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { IoGiftOutline } from "react-icons/io5";

import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useGifts } from "./hooks/useGifts";
import { GiftStatsCards } from "./components/GiftStatsCards";
import { GiftTable } from "./components/GiftTable";
import { useState } from 'react';
import "./GiftsFeature.css";

export function GiftsFeature() {
    const { text: t, lang } = useBackendMessages("gifts");
    const [search, setSearch] = useState(''), [currency, setCurrency] = useState('');
    const {
        eventId,
        drafts,
        backendInvitation,
        gifts,
        guestOptions,
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

    if (loading && !backendInvitation) return <PageSkeleton layout="dashboard" />;

    return (
        <div role="main" className="wg-page" aria-busy={loading}>
            {loading && <LoadingRegion />}
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
            </header>

            {error && <div className="workspace-notice" role="alert">{error}</div>}

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
            {gifts.length > 0 && <div className="gift-filter-toolbar"><label>{lang === 'en' ? 'Search gifts' : 'ស្វែងរកអំណោយ'}<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label><label>{lang === 'en' ? 'Currency' : 'រូបិយប័ណ្ណ'}<select value={currency} onChange={e => setCurrency(e.target.value)}><option value="">{lang === 'en' ? 'All currencies' : 'គ្រប់រូបិយប័ណ្ណ'}</option><option value="USD">USD</option><option value="KHR">KHR</option></select></label></div>}
            {eventId && (
                <GiftTable
                    gifts={gifts.filter(gift => (!currency || gift.currency === currency) && (!search || `${gift.name} ${gift.note}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())))}
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
