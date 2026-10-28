import { useState, useRef, useEffect } from "react";
import { getTemplateById } from "../../templates/data/templatesData";
import EventCover from './EventCover';
import { EVENT_TYPES } from "../onboarding/eventFields";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { formatLocalDate } from "@/shared/utils/localDate";
import {
  Calendar,
  MapPin,
  Palette,
  LayoutDashboard,
  Edit3,
  Eye,
  Trash2,
  MoreVertical,
  Heart,
} from "lucide-react";

export function EventCard({
  draft,
  onManage,
  onEdit,
  onDelete,
  onPreview,
  onReviewAccess,
  t,
  featured = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const en = useLanguageStore((s) => s.lang) === "en";

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    const escape = event => { if (event.key === "Escape") { setIsMenuOpen(false); menuRef.current?.querySelector("button")?.focus(); } };
    document.addEventListener("keydown", escape);
    menuRef.current?.querySelector(".event-card-dropdown button")?.focus();
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", escape); };
  }, [isMenuOpen]);

  let designTemplateId = "";
  try {
    if (draft?.designJson) {
      const parsed =
        typeof draft.designJson === "string"
          ? JSON.parse(draft.designJson)
          : draft.designJson;
      designTemplateId = parsed?.templateId || parsed?.presetId || "";
    }
  } catch {
    designTemplateId = "";
  }

  const template = getTemplateById(
    draft?.templateCode || draft?.templateId || designTemplateId || draft?.presetId
  );

  // Clearly separate event title from template style/name
  const title =
    draft?.title ||
    draft?.event?.title ||
    (draft?.groomName && draft?.brideName
      ? `${draft.groomName} & ${draft.brideName}`
      : "") ||
    (en ? "Wedding Celebration" : "សិរីមង្គលអាពាហ៍ពិពាហ៍");

  const coupleText =
    draft.couple?.groom && draft.couple?.bride
      ? `${draft.couple.groom} & ${draft.couple.bride}`
      : draft.groomName && draft.brideName
      ? `${draft.groomName} & ${draft.brideName}`
      : "";

  const dateText =
    draft.event?.date ||
    draft.eventDate ||
    (t ? t("noDate") : null) ||
    (en ? "Date to be announced" : "មិនទាន់កំណត់កាលបរិច្ឆេទ");
  const timeText = draft.event?.receptionTime || draft.eventTime || "";

  const isPublished = draft.status
    ? draft.status === "PUBLISHED"
    : Boolean(draft.publishedAt);
  const statusLabel =
    draft.status === "UNPUBLISHED"
      ? en
        ? "Unpublished"
        : "ផ្អាកផ្សាយ"
      : draft.status === "ARCHIVED"
      ? en
        ? "Archived"
        : "ទុកក្នុងបណ្ណសារ"
      : isPublished
      ? (t && t("badgePublished")) || (en ? "Published" : "បានផ្សាយ")
      : (t && t("badgeDraft")) || (en ? "Draft" : "ព្រាង");

  const eventTypeName =
    EVENT_TYPES.find((type) => type[0] === draft.eventType)?.[en ? 2 : 1] ||
    draft.eventType ||
    (en ? "Wedding" : "អាពាហ៍ពិពាហ៍");

  const templateName =
    draft.templateName || template?.name || template?.style || "";

  const venueText = draft.venueName || draft.event?.venueName || "";
  const premiumAccessRequired = draft.syncFailure?.status === 403 && draft.syncFailure?.code === "PACKAGE_FEATURE_REQUIRED";

  return (
    <article
      className={`event-card ${featured ? "event-card--featured" : ""}`}
      aria-label={title}
    >
      <div className="event-card-img-wrap">
        <EventCover
          event={draft}
          alt={title}
          loading="lazy"
          className="event-card-img"
        />
        <span
          className={`event-card-badge ${
            isPublished
              ? "event-card-badge--published"
              : draft.status === "UNPUBLISHED"
              ? "event-card-badge--unpublished"
              : "event-card-badge--draft"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="event-card-body">
        {/* Eyebrow: Event type & Template */}
        <div className="event-card-eyebrow">
          <span className="event-card-type-tag">{eventTypeName}</span>
          {templateName && (
            <span className="event-card-template-tag">
              <Palette size={12} aria-hidden="true" />
              <span>{templateName}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="event-card-title" title={title}>
          {title}
        </h2>
        {draft.shared && <p className="event-card-owner">{en ? 'Shared by' : 'ចែករំលែកដោយ'} {draft.ownerName || (en ? 'event owner' : 'ម្ចាស់កម្មវិធី')}</p>}

        {/* Couple Names */}
        {coupleText && coupleText !== title && (
          <div className="event-card-couple">
            <Heart size={13} className="event-card-couple-icon" aria-hidden="true" />
            <span>{coupleText}</span>
          </div>
        )}

        {/* Date & Time */}
        <div className="event-card-date">
          <Calendar size={14} aria-hidden="true" />
          <span>
            {/^(\d{4})-\d{2}-\d{2}/.test(dateText) ? formatLocalDate(dateText, en ? "en-US" : "km-KH") : dateText}
            {timeText ? ` · ${timeText.slice(0, 5)}` : ""}
          </span>
        </div>

        {/* Venue */}
        {venueText && (
          <div className="event-card-venue">
            <MapPin size={14} aria-hidden="true" />
            <span className="truncate" title={venueText}>{venueText}</span>
          </div>
        )}

        {/* Sync or Validation status */}
        {draft.syncError && (
          <p className="event-card-sync-error" role="status">
            {premiumAccessRequired ? (en ? "Premium access required to save this template." : "ត្រូវការសិទ្ធិបុព្វលាភ ដើម្បីរក្សាទុកគំរូនេះ។") : (en ? "Changes are stored on this device. Open the invitation to review and save them online." : "ការកែប្រែបានរក្សាទុកក្នុងឧបករណ៍នេះ។ បើកធៀបដើម្បីពិនិត្យ និងរក្សាទុកលើអ៊ីនធឺណិត។")}
            {onReviewAccess && <button type="button" className="event-card-btn event-card-btn--secondary" onClick={() => onReviewAccess(draft)}>{en ? "Review access" : "ពិនិត្យសិទ្ធិ"}</button>}
          </p>
        )}

        {/* Unified, single action bar */}
        <div className="event-card-footer">
          <button
            type="button"
            className="event-card-btn event-card-btn--primary"
            onClick={(event) => {
              event.stopPropagation();
              if (onManage) onManage(draft);
              else if (onEdit) onEdit(draft);
            }}
          >
            <LayoutDashboard size={15} aria-hidden="true" />
            <span>{en ? "Manage event" : "គ្រប់គ្រងកម្មវិធី"}</span>
          </button>

          {!draft.shared && <button
            type="button"
            className="event-card-btn event-card-btn--secondary"
            onClick={(event) => {
              event.stopPropagation();
              if (onEdit) onEdit(draft);
            }}
          >
            <Edit3 size={15} aria-hidden="true" />
            <span>
              {(t && t("editBtn")) || (en ? "Edit" : "កែសម្រួល")}
            </span>
          </button>}

          {onPreview && (
            <button
              type="button"
              className="event-card-btn event-card-btn--secondary"
              onClick={(event) => {
                event.stopPropagation();
                onPreview(draft);
              }}
            >
              <Eye size={15} aria-hidden="true" />
              <span>{(t && t("previewBtn")) || (en ? "Preview" : "មើលជាមុន")}</span>
            </button>
          )}

          {/* 3-dots overflow menu */}
          {!draft.shared && <div className="event-card-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className={`event-card-dots-btn ${isMenuOpen ? "is-active" : ""}`}
              aria-label={en ? "More options" : "ជម្រើសបន្ថែម"}
              aria-expanded={isMenuOpen}
              onClick={(event) => {
                event.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <MoreVertical size={16} aria-hidden="true" />
            </button>

            {isMenuOpen && (
              <div
                className="event-card-dropdown"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="event-card-dropdown-item"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsMenuOpen(false);
                    if (onEdit) onEdit(draft);
                  }}
                >
                  <Edit3 size={14} aria-hidden="true" />
                  <span>{(t && t("editBtn")) || (en ? "Edit" : "កែសម្រួល")}</span>
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
                  <Trash2 size={14} aria-hidden="true" />
                  <span>{(t && t("deleteBtn")) || (en ? "Delete" : "លុប")}</span>
                </button>
              </div>
            )}
          </div>}
        </div>
      </div>
    </article>
  );
}

export default EventCard;
