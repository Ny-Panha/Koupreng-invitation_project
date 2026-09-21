import { useState, useRef, useEffect } from "react";
import { getTemplateById } from "../../templates/data/templatesData";

export function EventCard({ draft, onManage, onEdit, onPreview, onDelete, t }) {
    const template = getTemplateById(draft.templateId);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    let designCoverImage = "";
    try {
        if (draft.designJson) {
            const parsed = typeof draft.designJson === "string" ? JSON.parse(draft.designJson) : draft.designJson;
            designCoverImage = parsed?.coverImage || "";
        }
    } catch {
        designCoverImage = "";
    }

    const coverImage = draft.coverUrl
        || draft.cover_url
        || draft.media?.coverImage?.fileUrl
        || draft.coverImage
        || designCoverImage
        || template?.defaultImage
        || template?.phoneCoverImage
        || template?.mainImage
        || "/facebook/all/03-card/cover-card.jpg";

    const title = draft.title || draft.event?.title || template?.name || "សិរីមង្គលអាពាហ៍ពិពាហ៍";
    const coupleText = (draft.couple?.groom && draft.couple?.bride)
        ? `${draft.couple.groom} & ${draft.couple.bride}`
        : (draft.groomName && draft.brideName)
            ? `${draft.groomName} & ${draft.brideName}`
            : "";
    const dateText = draft.event?.date || draft.eventDate || (t ? t("noDate") : null) || "មិនទាន់កំណត់កាលបរិច្ឆេទ";
    const timeText = draft.event?.receptionTime || draft.eventTime || "";
    const isPublished = Boolean(draft.publishedAt || draft.status === "PUBLISHED");

    const handleCardClick = () => {
        if (onPreview) {
            onPreview(draft);
        } else if (onEdit) {
            onEdit(draft);
        }
    };

    return (
        <article className="event-card" onClick={handleCardClick}>
            <div className="event-card-img-wrap">
                <img src={coverImage} alt={title} className="event-card-img" />
                <span className={`event-card-badge ${isPublished ? "event-card-badge--published" : "event-card-badge--draft"}`}>
                    {isPublished ? ((t && t("badgePublished")) || "បោះពុម្ពផ្សាយ") : ((t && t("badgeDraft")) || "ព្រាង")}
                </span>
            </div>
            <div className="event-card-body">
                <div className="event-card-title">{title}</div>
                {coupleText && <div className="event-card-couple">{coupleText}</div>}
                <div className="event-card-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{dateText} {timeText ? `• ${timeText}` : ""}</span>
                </div>

                <div className="event-card-footer">
                    <button
                        type="button"
                        className="event-card-manage-btn"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (onManage) {
                                onManage(draft);
                            } else if (onEdit) {
                                onEdit(draft);
                            }
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>{(t && t("dashboardBtn")) || "ផ្ទាំងគ្រប់គ្រង"}</span>
                    </button>

                    <div className="event-card-menu-wrap" ref={menuRef}>
                        <button
                            type="button"
                            className={`event-card-dots-btn ${isMenuOpen ? "is-active" : ""}`}
                            aria-label={(t && t("moreOptions")) || "ជម្រើសបន្ថែម"}
                            aria-expanded={isMenuOpen}
                            onClick={(event) => {
                                event.stopPropagation();
                                setIsMenuOpen((prev) => !prev);
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2.2" />
                                <circle cx="12" cy="12" r="2.2" />
                                <circle cx="12" cy="19" r="2.2" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className="event-card-dropdown" onClick={(event) => event.stopPropagation()}>
                                <button
                                    type="button"
                                    className="event-card-dropdown-item"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setIsMenuOpen(false);
                                        if (onEdit) onEdit(draft);
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    <span>{(t && t("editBtn")) || "កែសម្រួល"}</span>
                                </button>

                                <div className="event-card-dropdown-divider" />

                                <button
                                    type="button"
                                    className="event-card-dropdown-item event-card-dropdown-item--danger"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setIsMenuOpen(false);
                                        if (onDelete) onDelete(draft);
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                    <span>{(t && t("deleteBtn")) || "លុប"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default EventCard;
