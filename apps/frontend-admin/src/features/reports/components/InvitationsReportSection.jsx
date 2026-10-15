import { reportText, reportValue } from "../reportModel";
import ReportLedger from "./ReportLedger";
export default function InvitationsReportSection({
  report,
  lang,
  children,
  ...props
}) {
  return (
    <div className="space-y-4">
      <p className="report-scope-note">
        {reportText("fullScope", lang)} · {reportText("totalInvitations", lang)}
        : {report.filteredSummary.totalInvitations} · RSVP:{" "}
        {reportValue(
          report.filteredSummary.rsvpRate,
          { type: "PERCENT" },
          lang,
        )}{" "}
        · Check-in:{" "}
        {reportValue(
          report.filteredSummary.checkInRate,
          { type: "PERCENT" },
          lang,
        )}
      </p>
      {children}
      <ReportLedger report={report} lang={lang} {...props} />
    </div>
  );
}
