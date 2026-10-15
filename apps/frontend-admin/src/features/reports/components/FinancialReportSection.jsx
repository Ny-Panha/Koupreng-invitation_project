import { StatCard } from "../../../shared/ui/AdminUI";
import { reportText, reportValue } from "../reportModel";
import ReportLedger from "./ReportLedger";
export default function FinancialReportSection({
  report,
  lang,
  children,
  ...props
}) {
  const summary = report.filteredSummary;
  return (
    <div className="space-y-4">
      <section
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        aria-label={reportText("fullScope", lang)}
      >
        {["confirmedReceipts", "pendingValue", "failedValue"].flatMap((key) =>
          ["USD", "KHR"].map((currency) => (
            <StatCard
              key={`${key}-${currency}`}
              label={`${reportText(key, lang)} \u00b7 ${currency}`}
              value={reportValue(
                summary[`${key}ByCurrency`]?.[currency],
                { type: "MONEY" },
                lang,
                { currency },
              )}
              note={reportText("fullScope", lang)}
              tone={key === "confirmedReceipts" ? "emerald" : "amber"}
            />
          )),
        )}
      </section>
      {children}
      <ReportLedger report={report} lang={lang} {...props} />
    </div>
  );
}
