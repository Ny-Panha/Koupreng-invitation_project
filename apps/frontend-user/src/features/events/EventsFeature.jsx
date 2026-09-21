import { Link, useNavigate } from "react-router-dom";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useEvents } from "./hooks/useEvents";
import { EventCard } from "./components/EventCard";
import { EventDeleteModal } from "./components/EventDeleteModal";
import { CalendarHeart } from "lucide-react";
import "./EventsFeature.css";

export function EventsFeature() {
    const navigate = useNavigate();
    const { text: t } = useBackendMessages("events");
    const { text: tDash } = useBackendMessages("dashboard");
    const {
        drafts,
        draftToDelete,
        isDeleting,
        handleDeleteClick,
        cancelDelete,
        confirmDelete,
    } = useEvents(t);

    const handleDashboard = (draft) => {
        navigate(`/dashboard?id=${draft.id}`);
    };

    const handleEdit = (draft) => {
        navigate(`/dashboard/invitations/${draft.id}/edit`);
    };

    const handlePreview = (draft) => {
        navigate(`/dashboard/invitations/${draft.id}/preview`);
    };

    const createBtnText = (t("createBtn") || "បង្កើតកម្មវិធី").replace(/^\+*\s*/, "");
    const emptyActionText = (t("goToCreate") || t("createBtn") || "បង្កើតកម្មវិធីថ្មី").replace(/^\+*\s*/, "");

    return (
        <main className="events-page">
            <header className="events-page-header">
                <div>
                    <span>{t("brandKicker") || `${tDash("brand")} invitations`}</span>
                    <h1>{t("title")}</h1>
                    <p>{t("subtitle")}</p>
                </div>
                <Link to="/create/wedding" className="events-create-btn">
                    + {createBtnText}
                </Link>
            </header>

            {drafts.length === 0 ? (
                <div className="events-empty-state">
                    <div className="events-empty-icon">
                        <CalendarHeart size={32} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="events-empty-title">{t("emptyTitle")}</div>
                    <div className="events-empty-desc">{t("emptySubtitle")}</div>
                    <Link to="/create/wedding" className="events-empty-action">
                        + {emptyActionText}
                    </Link>
                </div>
            ) : (
                <div className="events-grid">
                    {drafts.map((draft) => (
                        <EventCard
                            key={draft.id}
                            draft={draft}
                            onManage={handleDashboard}
                            onEdit={handleEdit}
                            onPreview={handlePreview}
                            onDelete={handleDeleteClick}
                            t={t}
                        />
                    ))}
                </div>
            )}

            <EventDeleteModal
                draftToDelete={draftToDelete}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                t={t}
            />
        </main>
    );
}

export default EventsFeature;
