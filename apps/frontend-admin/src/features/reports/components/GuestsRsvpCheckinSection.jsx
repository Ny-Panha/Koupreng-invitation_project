import { StatCard } from "../../../shared/ui/AdminUI";
import { reportText, reportValue } from "../reportModel";
import ReportLedger from "./ReportLedger";

export default function GuestsRsvpCheckinSection({
  report,
  lang,
  children,
  ...props
}) {
  const summary = report.filteredSummary;
  return (
    <div className="space-y-4">
      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        aria-label={reportText("fullScope", lang)}
      >
        {["totalGuests", "totalRsvps", "totalCheckIns"].map((key) => (
          <StatCard
            key={key}
            label={reportText(key, lang)}
            value={reportValue(summary[key], { type: "NUMBER" }, lang)}
            note={reportText("fullScope", lang)}
            tone="cyan"
          />
        ))}
        {["rsvpRate", "checkInRate"].map((key) => (
          <StatCard
            key={key}
            label={reportText(key, lang)}
            value={reportValue(summary[key], { type: "PERCENT" }, lang)}
            note={reportText("fullScope", lang)}
            tone="emerald"
          />
        ))}
      </section>
      <p className="report-scope-note">{reportText("guestPrivacy", lang)}</p>
      {children}
      <ReportLedger report={report} lang={lang} {...props} />
    </div>
  );
}
