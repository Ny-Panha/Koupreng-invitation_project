import ReportKpi from "./ReportKpi";
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
        className="report-kpis"
        aria-label={reportText("fullScope", lang)}
      >
        {["totalGuests", "totalRsvps", "totalCheckIns"].map((key) => (
          <ReportKpi
            key={key}
            label={reportText(key, lang)}
            value={reportValue(summary[key], { type: "NUMBER" }, lang)}
            note={reportText("fullScope", lang)}
            tone="cyan"
          />
        ))}
        {["rsvpRate", "checkInRate"].map((key) => (
          <ReportKpi
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
