import { CircleCheck, CircleX, Clock, MessageCircleHeart } from "lucide-react";

export function RsvpKpiCards({ attendingCount = 0, declinedCount = 0, pendingCount = 0, wishesCount = 0, viewMode = "TABLE", setViewMode, t }) {
  const active = viewMode === "WISHES";
  const cards = [
    { key: "attending", value: attendingCount, note: "confirmed", Icon: CircleCheck },
    { key: "declined", value: declinedCount, note: "declinedNote", Icon: CircleX },
    { key: "pending", value: pendingCount, note: "pendingNote", Icon: Clock },
  ];
  return <section className="rsvp-kpi-grid" aria-label={t("summary")}>
    {cards.map(({ key, value, note, Icon }) => <article key={key} className={`rsvp-kpi-card is-${key}`}>
      <div className="rsvp-kpi-top"><span className="rsvp-kpi-label">{t(key)}</span><span className="rsvp-kpi-icon-pill"><Icon size={20} aria-hidden="true" /></span></div>
      <strong className="rsvp-kpi-value">{value}</strong><small className="rsvp-kpi-note">{t(note)}</small>
    </article>)}
    <button type="button" className={`rsvp-kpi-card is-wishes ${active ? "is-active" : ""}`} onClick={() => setViewMode(active ? "TABLE" : "WISHES")} aria-pressed={active}>
      <span className="rsvp-kpi-top"><span className="rsvp-kpi-label">{t("wishes")}</span><span className="rsvp-kpi-icon-pill"><MessageCircleHeart size={20} aria-hidden="true" /></span></span>
      <strong className="rsvp-kpi-value">{wishesCount}</strong><small className="rsvp-kpi-note">{t("wishesNote")}</small>
    </button>
  </section>;
}

export default RsvpKpiCards;
