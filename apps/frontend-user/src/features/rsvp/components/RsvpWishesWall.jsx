import { EmptyState, StatusBadge } from "@/shared/ui";
import { Clock as IoTimeOutline, ArrowLeft as IoArrowBackOutline, MessageCircleHeart } from "lucide-react";

export function RsvpWishesWall({ wishesList = [], setViewMode, t, lang }) {
  return (
    <section className="rsvp-board">
      <div className="rsvp-wishes-head">
        <div>
          <h2>{t("wishes")}</h2>
          <p>{t("wishesText")}</p>
        </div>
        <button
          type="button"
          className="rsvp-return-btn"
          onClick={() => setViewMode("TABLE")}
        >
          <IoArrowBackOutline aria-hidden="true" />
          <span>{t("back")}</span>
        </button>
      </div>

      {wishesList.length === 0 ? (
        <div className="rsvp-empty-box">
          <EmptyState
            icon={MessageCircleHeart}
            title={t("noWishes")}
            description={t("noWishesText")}
          />
        </div>
      ) : (
        <div className="rsvp-wishes-grid">
          {wishesList.map((item, index) => {
            const author = item.guestName || item.name || t("unnamed");
            const initial = author.trim().charAt(0).toUpperCase();
            const dateVal = item.createdAt || item.updatedAt;

            return (
              <article
                key={item.id ?? item.guestId ?? index}
                className="rsvp-wish-card"
              >
                <div className="rsvp-wish-header">
                  <div className="rsvp-wish-author">
                    <div className="rsvp-wish-avatar" aria-hidden="true">
                      {initial}
                    </div>
                    <strong>{author}</strong>
                  </div>
                  <StatusBadge status={item.responseStatus || item.status || "PENDING"} label={t(({ ATTENDING: "attending", NOT_ATTENDING: "declined", DECLINED: "declined", MAYBE: "maybe" })[item.responseStatus || item.status] || "pending")} />
                </div>

                <p className="rsvp-wish-quote">
                  “{item.wish || item.message}”
                </p>

                {dateVal && !Number.isNaN(new Date(dateVal).getTime()) && (
                  <div className="rsvp-wish-footer">
                    <IoTimeOutline aria-hidden="true" />
                    <span>
                      {new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "km-KH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(dateVal))}
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RsvpWishesWall;
