import ReportKpi from "./ReportKpi";
import { reportValue } from "../reportModel";
import { workspaceText as reportText } from "../reportWorkspace";
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
        className="report-kpis report-financial-kpis"
        aria-label={reportText("fullScope", lang)}
      >
        {["confirmedReceipts", "pendingValue", "failedValue"].flatMap((key) =>
          ["USD", "KHR"].map((currency) => (
            <ReportKpi
              key={`${key}-${currency}`}
              label={`${reportText(key, lang)} \u00b7 ${currency}`}
              value={reportValue(
                summary[`${key}ByCurrency`]?.[currency],
                { type: "MONEY" },
                lang,
                { currency },
              )}
              note={reportText(
                key === "confirmedReceipts" ? "cashHint" : "pendingHint",
                lang,
              )}
              tone={key === "confirmedReceipts" ? "emerald" : "amber"}
            />
          )),
        )}
      </section>
      <p className="report-scope-note">{reportText("exceptionHint", lang)}</p>
      {children}
      <ReportLedger report={report} lang={lang} {...props} />
    </div>
  );
}
