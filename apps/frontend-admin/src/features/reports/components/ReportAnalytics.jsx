import { reportText, reportValue } from "../reportModel";
import CategoryBreakdownSection from "./CategoryBreakdownSection";
export default function ReportAnalytics({ report, lang, onCategory }) {
  const groups = report.series.map((series) => ({
    name: series.name,
    rows: series.points,
  }));
  for (const key of [
    "categories",
    "topUsage",
    "topPurchases",
    "accountStatuses",
    "activeStates",
    "outcomes",
    "statuses",
  ])
    if (Array.isArray(report.filteredSummary[key]))
      groups.push({ name: key, rows: report.filteredSummary[key] });
  return (
    <div className="report-analytics">
      {report.report === "users" && (
        <section
          className="card"
          aria-label={reportText("purchaseClassification", lang)}
        >
          <h3>{reportText("purchaseClassification", lang)}</h3>
          <table>
            <tbody>
              {["paidUsers", "noVerifiedReceiptUsers"].map((key) => (
                <tr key={key}>
                  <th scope="row">{reportText(key, lang)}</th>
                  <td>
                    {reportValue(
                      report.filteredSummary[key],
                      { type: "NUMBER" },
                      lang,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {report.filteredSummary.eventCategoryBreakdown && (
        <CategoryBreakdownSection
          categoryBreakdown={report.filteredSummary.eventCategoryBreakdown}
          onSelectCategory={onCategory}
          lang={lang}
        />
      )}{" "}
      {groups.map((group) => (
        <section
          className="card"
          key={group.name}
          aria-label={reportText(group.name, lang)}
        >
          <h3>{reportText(group.name, lang)}</h3>
          {!group.rows.length ? (
            <p>{reportText("empty", lang)}</p>
          ) : (
            <table className="report-chart-table">
              <caption className="sr-only">
                {reportText(group.name, lang)}
              </caption>
              <thead>
                <tr>
                  <th>{reportText("period", lang)}</th>
                  <th>{reportText("count", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((point, index) => {
                  const label =
                      point.period || point.category || point.label || "—",
                    count = point.count ?? point.total ?? 0;
                  const maximum = Math.max(
                    ...group.rows.map((row) => row.count ?? row.total ?? 0),
                    1,
                  );
                  return (
                    <tr key={`${label}-${point.currency || index}`}>
                      <th scope="row">
                        {group.name === "eventCategoryBreakdown" &&
                        onCategory ? (
                          <button onClick={() => onCategory(point.category)}>
                            {label} ↗
                          </button>
                        ) : (
                          label
                        )}
                        {point.currency && ` · ${point.currency}`}
                      </th>
                      <td>
                        <div className="report-bar" aria-hidden="true">
                          <span
                            style={{ width: `${(count / maximum) * 100}%` }}
                          />
                        </div>
                        <strong>{count}</strong>
                        {point.suppressed ? (
                          <small>{reportText("suppressed", lang)}</small>
                        ) : point.amount != null ? (
                          <small>
                            {point.amount} {point.currency}
                          </small>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  );
}
