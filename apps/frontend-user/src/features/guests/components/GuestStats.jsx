import { useMemo } from "react";
import { Users, Armchair, Send, CheckCircle2 } from "lucide-react";
import { SEND_STATUS } from "../model/guestConstants";

export default function GuestStats({ guests = [], summary, t }) {
  const stats = useMemo(() => {
    if (summary) return { totalCount: summary.guestRecords, totalSeats: summary.reservedSeats, sentCount: summary.markedSentRecords, respondedCount: summary.respondedRecords };
    let totalCount = 0;
    let totalSeats = 0;
    let sentCount = 0;
    let respondedCount = 0;

    for (const g of guests) {
      const normalizedSendStatus = String(g.sendStatus || "").toUpperCase();
      totalCount += 1;
      totalSeats += Math.max(1, Number(g.count) || 1);
      if (
        g.sendStatus === SEND_STATUS.sent ||
        g.sendStatus === SEND_STATUS.opened ||
        normalizedSendStatus === "SENT" ||
        normalizedSendStatus === "OPENED"
      ) {
        sentCount += 1;
      }

      const isResponded = Boolean(
        g.sendStatus === SEND_STATUS.responded ||
        normalizedSendStatus === "RESPONDED" ||
        (g.rsvpStatus && !["PENDING", "UNKNOWN", "AWAITING"].includes(String(g.rsvpStatus).trim().toUpperCase()))
      );
      if (isResponded) {
        respondedCount += 1;
      }
    }

    return { totalCount, totalSeats, sentCount, respondedCount };
  }, [guests, summary]);

  return (
    <section className="pe-summary-grid" aria-label="Guest list statistics">
      <article className="pe-summary-card group">
        <div className="pe-summary-card-inner">
          <div className="pe-summary-icon-wrap text-[#B98B42] bg-[#B98B42]/10">
            <Users size={18} aria-hidden="true" />
          </div>
          <div className="pe-summary-details">
            <span>{t ? t("statTotalGuests") : "ភ្ញៀវសរុប"}</span>
            <strong>{stats.totalCount}</strong>
          </div>
        </div>
      </article>

      <article className="pe-summary-card group">
        <div className="pe-summary-card-inner">
          <div className="pe-summary-icon-wrap text-emerald-700 bg-emerald-500/10">
            <Armchair size={18} aria-hidden="true" />
          </div>
          <div className="pe-summary-details">
            <span>{t ? t("statTotalSeats") : "ចំនួនកៅអី/មនុស្ស"}</span>
            <strong>{stats.totalSeats}</strong>
          </div>
        </div>
      </article>

      <article className="pe-summary-card group">
        <div className="pe-summary-card-inner">
          <div className="pe-summary-icon-wrap text-sky-700 bg-sky-500/10">
            <Send size={18} aria-hidden="true" />
          </div>
          <div className="pe-summary-details">
            <span>{t ? t("statSent") : "បានផ្ញើ"}</span>
            <strong>{stats.sentCount}</strong>
          </div>
        </div>
      </article>

      <article className="pe-summary-card group">
        <div className="pe-summary-card-inner">
          <div className="pe-summary-icon-wrap text-teal-700 bg-teal-500/10">
            <CheckCircle2 size={18} aria-hidden="true" />
          </div>
          <div className="pe-summary-details">
            <span>{t ? t("statResponded") : "បានឆ្លើយតប"}</span>
            <strong>{stats.respondedCount}</strong>
          </div>
        </div>
      </article>
    </section>
  );
}
