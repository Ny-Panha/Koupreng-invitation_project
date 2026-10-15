import { useId } from "react";
import { reportValue } from "../reportModel";
import { periodLabel, valueLabel, workspaceText } from "../reportWorkspace";
import CategoryBreakdownSection from "./CategoryBreakdownSection";

function ChartCard({ group, report, lang, onCategory }) {
  const id = useId(),
    text = (key) => workspaceText(key, lang);
  const time = group.rows.some((row) => row.period);
  const distribution = [
    "statuses",
    "outcomes",
    "accountStatuses",
    "activeStates",
  ].includes(group.name);
  const currencies = [...new Set(group.rows.map((row) => row.currency || ""))];
  const label = (row) =>
    row.period || valueLabel(row.category || row.label, lang);
  const amount = (row) => row.count ?? row.total;
  const scope = periodLabel(
    report.metadata.filters?.from || report.metadata.from,
    report.metadata.filters?.to || report.metadata.to,
    lang,
  );
  return (
    <section className="card report-chart-card" aria-labelledby={id}>
      <header>
        <h3 id={id}>{text(group.name)}</h3>
        <span className="report-chart-unit">{text("countAxis")}</span>
      </header>
      <p className="report-chart-definition">
        {text(
          group.name === "verifiedReceipts"
            ? "cashHint"
            : group.name === "accountStatuses"
              ? "currentSnapshot"
              : "fullScope",
        )}
      </p>
      <p className="report-chart-period">{scope}</p>
      {!group.rows.length ? (
        <p>{text("empty")}</p>
      ) : time ? (
        <div className="report-time-facets">
          {currencies.map((currency) => {
            const points = group.rows.filter(
                (point) => (point.currency || "") === currency,
              ),
              max = Math.max(...points.map(amount).filter(Number.isFinite), 1);
            const x = (index) =>
              points.length === 1
                ? 164
                : 42 + (index * 270) / (points.length - 1);
            const y = (value) => 126 - (value / max) * 98;
            const defined = points.filter((point) =>
              Number.isFinite(amount(point)),
            );
            return (
              <div className="report-time-facet" key={currency || "count"}>
                {currency && <strong>{currency}</strong>}
                <svg
                  viewBox="0 0 340 164"
                  role="img"
                  aria-label={`${text(group.name)} ${currency} · ${text("countAxis")}`}
                >
                  <title>
                    {text(group.name)} {currency}
                  </title>
                  {[...new Set([0, Math.ceil(max / 2), max])].map((tick) => (
                    <g key={tick}>
                      <line
                        x1="38"
                        x2="322"
                        y1={y(tick)}
                        y2={y(tick)}
                        className="report-chart-grid"
                      />
                      <text x="31" y={y(tick) + 4} textAnchor="end">
                        {tick}
                      </text>
                    </g>
                  ))}
                  {defined.length === points.length && points.length > 1 && (
                    <>
                      <polygon
                        points={`42,126 ${points.map((point, index) => `${x(index)},${y(amount(point))}`).join(" ")} 312,126`}
                        className="report-chart-area"
                      />
                      <polyline
                        points={points
                          .map(
                            (point, index) => `${x(index)},${y(amount(point))}`,
                          )
                          .join(" ")}
                        className="report-chart-line"
                      />
                    </>
                  )}
                  {points.map((point, index) => (
                    <g key={point.period}>
                      {Number.isFinite(amount(point)) && (
                        <circle
                          cx={x(index)}
                          cy={y(amount(point))}
                          r="4"
                          className="report-chart-dot"
                        >
                          <title>
                            {label(point)}: {amount(point)}
                          </title>
                        </circle>
                      )}
                      {(index === 0 ||
                        index === points.length - 1 ||
                        points.length <= 4) && (
                        <text x={x(index)} y="149" textAnchor="middle">
                          {point.period}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
                <p className="report-muted">
                  {text(points.length === 1 ? "onePoint" : "monthAxis")}
                </p>
                {points.some((point) => point.suppressed) && (
                  <p className="report-chart-privacy">{text("suppressed")}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : distribution ? (
        <div className="report-distribution">
          <div className="report-stacked-bar" aria-hidden="true">
            {group.rows.map((point, index) => (
              <span
                key={index}
                data-tone={index % 3}
                style={{
                  flexGrow: Number.isFinite(amount(point)) ? amount(point) : 0,
                }}
              />
            ))}
          </div>
          <ul>
            {group.rows.map((point, index) => (
              <li key={index}>
                <span>
                  <i data-tone={index % 3} aria-hidden="true" />
                  {label(point)}
                </span>
                <strong>
                  {reportValue(amount(point), { type: "NUMBER" }, lang)}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      ) : group.name === "eventCategoryBreakdown" ? (
        <CategoryBreakdownSection
          categoryBreakdown={group.rows}
          onSelectCategory={onCategory}
          lang={lang}
        />
      ) : (
        <div className="report-rankings">
          {group.rows.map((point, index) => {
            const max = Math.max(
              ...group.rows.map(amount).filter(Number.isFinite),
              1,
            );
            return (
              <div key={index}>
                <div>
                  {onCategory && point.category ? (
                    <button
                      type="button"
                      onClick={() => onCategory(point.category)}
                    >
                      {label(point)} ↗
                    </button>
                  ) : (
                    <span>{label(point)}</span>
                  )}
                  <strong>
                    {reportValue(amount(point), { type: "NUMBER" }, lang)}
                  </strong>
                </div>
                <div className="report-ranking-track" aria-hidden="true">
                  <span
                    style={{
                      width: `${Number.isFinite(amount(point)) ? (amount(point) / max) * 100 : 0}%`,
                    }}
                  />
                </div>
                {point.publishedRate != null && (
                  <small>
                    {text("publishedRate")}:{" "}
                    {reportValue(
                      point.publishedRate,
                      { type: "PERCENT" },
                      lang,
                    )}
                  </small>
                )}
              </div>
            );
          })}
        </div>
      )}
      <details className="report-chart-data">
        <summary>{text("dataTable")}</summary>
        <table>
          <caption className="sr-only">
            {text(group.name)} · {scope}
          </caption>
          <thead>
            <tr>
              <th>{text(time ? "period" : "status")}</th>
              <th>{text("count")}</th>
              {group.rows.some((row) => row.currency) && (
                <th>{text("currency")}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {group.rows.map((point, index) => (
              <tr key={index}>
                <th scope="row">{label(point)}</th>
                <td>{reportValue(amount(point), { type: "NUMBER" }, lang)}</td>
                {point.currency && (
                  <td>
                    {point.currency} ·{" "}
                    {point.suppressed
                      ? text("suppressed")
                      : point.amount == null
                        ? text("unavailable")
                        : reportValue(
                            point.amount,
                            { type: "MONEY" },
                            lang,
                            point,
                          )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
export default function ReportAnalytics({ report, lang, onCategory }) {
  const groups = (report.series || []).map((series) => ({
    name: series.name,
    rows: series.points,
  }));
  for (const key of [
    "eventCategoryBreakdown",
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
  if (!groups.length && report.report !== "users") return null;
  const priorities =
    report.report === "executive"
      ? ["eventCreation", "eventCategoryBreakdown"]
      : report.report === "templates"
        ? ["topUsage", "topPurchases"]
        : [
            "verifiedReceipts",
            "outcomes",
            "creation",
            "eventCategoryBreakdown",
            "accountStatuses",
            "activeStates",
          ];
  groups.sort((a, b) => {
    const rank = (value) =>
      priorities.indexOf(value) < 0 ? 99 : priorities.indexOf(value);
    return rank(a.name) - rank(b.name);
  });
  return (
    <div className="report-analytics-wrapper">
      {report.report === "users" && (
        <section
          className="report-user-classification"
          aria-label={workspaceText("purchaseClassification", lang)}
        >
          <h3>{workspaceText("purchaseClassification", lang)}</h3>
          <dl>
            {["paidUsers", "noVerifiedReceiptUsers"].map((key) => (
              <div key={key}>
                <dt>{workspaceText(key, lang)}</dt>
                <dd>
                  {reportValue(
                    report.filteredSummary[key],
                    { type: "NUMBER" },
                    lang,
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <div className="report-analytics">
        {groups.slice(0, 2).map((group) => (
          <ChartCard
            key={group.name}
            group={group}
            report={report}
            lang={lang}
            onCategory={onCategory}
          />
        ))}
      </div>
      {groups.length > 2 && (
        <details className="report-extra-analytics">
          <summary>
            {workspaceText("moreBreakdowns", lang)} ({groups.length - 2})
          </summary>
          <div className="report-analytics">
            {groups.slice(2).map((group) => (
              <ChartCard
                key={group.name}
                group={group}
                report={report}
                lang={lang}
                onCategory={onCategory}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
