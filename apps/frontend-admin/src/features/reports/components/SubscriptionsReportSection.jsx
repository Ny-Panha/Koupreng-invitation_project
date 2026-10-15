import { StatCard } from "../../../shared/ui/AdminUI";
import { reportText } from "../reportModel";
import ReportLedger from "./ReportLedger";
export default function SubscriptionsReportSection({
  report,
  lang,
  children,
  ...props
}) {
  return (
    <div className="space-y-4">
      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        aria-label={reportText("activeSubscriptions", lang)}
      >
        {(report.filteredSummary.subscriptionTiers || []).map((tier) => (
          <StatCard
            key={tier.tier}
            label={tier.tier || reportText("unavailable", lang)}
            value={tier.activeSubscriptions}
            note={reportText("activeSubscriptions", lang)}
            tone="cyan"
          />
        ))}
      </section>
      <p className="report-scope-note">
        {reportText("transitionsUnavailable", lang)}
      </p>
      {children}
      <ReportLedger report={report} lang={lang} {...props} />
    </div>
  );
}
