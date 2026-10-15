import { reportValue } from "../reportModel";
import { workspaceText } from "../reportWorkspace";
import ReportKpi from "./ReportKpi";
export default function ReportOverviewCards({ summary, lang }) {
  const text = (key) => workspaceText(key, lang);
  return (
    <section
      className="report-kpis report-overview-kpis"
      aria-label={text("fullScope")}
    >
      {["USD", "KHR"].map((currency) => (
        <ReportKpi
          key={currency}
          label={`${text("confirmedReceipts")} · ${currency}`}
          value={reportValue(
            summary.confirmedReceiptsByCurrency?.[currency],
            { type: "MONEY" },
            lang,
            { currency },
          )}
          note={text("cashHint")}
          tone="emerald"
        />
      ))}
      {[
        "totalInvitations",
        "totalUsers",
        "activeSubscriptions",
        "periodGrowth",
      ].map((key) => (
        <ReportKpi
          key={key}
          label={text(key)}
          value={reportValue(
            summary[key],
            { type: key === "periodGrowth" ? "PERCENT" : "NUMBER" },
            lang,
          )}
          note={
            key === "periodGrowth"
              ? text(summary[key] == null ? "noActivity" : "fullScope")
              : text(
                  ["totalUsers", "activeSubscriptions"].includes(key)
                    ? "currentSnapshot"
                    : "fullScope",
                )
          }
        />
      ))}
    </section>
  );
}
