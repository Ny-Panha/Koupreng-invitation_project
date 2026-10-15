import { reportValue } from "../reportModel";
import { workspaceText } from "../reportWorkspace";
import ReportKpi from "./ReportKpi";
import ReportLedger from "./ReportLedger";
export default function InvitationsReportSection({
  report,
  lang,
  children,
  ...props
}) {
  const summary = report.filteredSummary;
  return (
    <div className="report-section-stack">
      <section
        className="report-kpis"
        aria-label={workspaceText("fullScope", lang)}
      >
        {[
          "totalInvitations",
          "publishedInvitations",
          "draftInvitations",
          "rsvpRate",
        ].map((key) => (
          <ReportKpi
            key={key}
            label={workspaceText(key, lang)}
            value={reportValue(
              summary[key],
              { type: key === "rsvpRate" ? "PERCENT" : "NUMBER" },
              lang,
            )}
            note={workspaceText("fullScope", lang)}
            progress={key === "rsvpRate" ? summary[key] : null}
          />
        ))}
      </section>
      {children}
      <ReportLedger report={report} lang={lang} {...props} />
    </div>
  );
}
