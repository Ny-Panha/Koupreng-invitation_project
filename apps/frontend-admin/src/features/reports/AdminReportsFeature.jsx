import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, Printer } from "lucide-react";
import { Loading, ErrorState } from "../../shared/ui";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import { formatDate, formatMoney } from "../../shared/utils";
import adminManagementService from "../../shared/api/adminService";

export default function AdminReportsPage() {
  const { lang, t } = useAdminLanguage();
  const [active, setActive] = useState("users");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("thisMonth");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue());

  const REPORTS = [
    { key: "users", label: t("reports.tabUsers", "Users") },
    { key: "invitations", label: t("reports.tabInvitations", "Invitations") },
    { key: "payments", label: t("reports.tabPayments", "Payments") },
    { key: "rsvp", label: t("reports.tabRsvp", "RSVP") },
    { key: "system", label: t("reports.tabSystem", "System") },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await adminManagementService.report(active);
        if (!mounted) return;
        setReport(data);
        setError("");
      } catch (err) {
        if (mounted) setError(err?.message || (lang === "en" ? "Could not load report" : "មិនអាចទាញយករបាយការណ៍បានទេ"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [active, lang]);

  const filteredRows = useMemo(
    () => filterRowsByDate(report?.rows || [], dateRange, selectedMonth),
    [report, dateRange, selectedMonth]
  );

  const displaySummary = useMemo(
    () => buildDisplaySummary(active, report?.summary || {}, filteredRows),
    [active, report, filteredRows]
  );

  const exportCsv = () => {
    const columns = getColumns(filteredRows, active);
    if (!columns.length) return;
    const csv = [
      columns.join(","),
      ...filteredRows.map((row) => columns.map((column) => csvValue(row[column], column)).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${active}-report.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="reports-print-only reports-letterhead">
        <div className="reports-brand">KOUPRENG</div>
        <div>Official Monthly Report</div>
        <div className="reports-print-date">{formatDate(new Date())}</div>
      </div>
      <div className="page-head reports-screen-only">
        <div>
          <h2 className="page-title">{t("reports.title", "Reports")}</h2>
          <p className="page-subtitle">{t("reports.subtitle", "Users, invitations, payments, RSVP, and system reports.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="select" value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
            <option value="thisMonth">{t("reports.thisMonth", "This Month")}</option>
            <option value="lastMonth">{t("reports.lastMonth", "Last Month")}</option>
            <option value="custom">{t("reports.selectMonth", "Select Month / Year")}</option>
          </select>
          {dateRange === "custom" && (
            <input
              className="text-input"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              aria-label={t("reports.selectMonth", "Select Month / Year")}
            />
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportCsv} title={t("reports.exportCsv", "Export CSV")}>
            <Download className="h-4 w-4" /> CSV
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()} title={t("reports.printMonthly", "Print Monthly Report")}>
            <Printer className="h-4 w-4" /> {t("reports.printMonthly", "Print Monthly Report")}
          </button>
        </div>
      </div>

      <div className="admin-tabs reports-screen-only">
        {REPORTS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`btn ${active === item.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActive(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <section className="admin-feature-grid">
            {Object.entries(displaySummary).map(([key, value]) => (
              <article key={key} className="admin-feature-card">
                <span>{formatMetricLabel(key)}</span>
                <strong>{formatMetricValue(key, value)}</strong>
              </article>
            ))}
          </section>
          {[
            "users",
            "invitations",
            "payments",
          ].includes(active) && <AnalyticsChart report={active} rows={filteredRows} />}
          <section className="card reports-report-content">
            {active === "payments" ? (
              <PaymentTransactionsTable rows={filteredRows} emptyText={t("reports.noData", "No row data for this report.")} />
            ) : (
              <GenericRows report={active} rows={filteredRows} emptyText={t("reports.noData", "No row data for this report.")} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function GenericRows({ report, rows, emptyText }) {
  const columns = getColumns(rows, report);

  if (!rows.length || !columns.length) {
    return <div className="state">{emptyText || "No row data for this report."}</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{formatMetricLabel(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((row, index) => (
            <tr key={row.id || row.orderCode || index}>
              {columns.map((column) => (
                <td key={column}>
                  <Value value={row[column]} column={column} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentTransactionsTable({ rows, emptyText }) {
  if (!rows.length) return <div className="state">{emptyText || "No transactions for this month."}</div>;

  const total = rows.reduce((sum, row) => sum + Number(row.paidAmount ?? row.amount ?? 0), 0);
  return (
    <div className="table-wrap">
      <table className="data payment-report-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Customer Name</th>
            <th>Package Type</th>
            <th>Payment Method</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.transactionId || row.orderCode || index}>
              <td>{row.transactionId || row.orderCode || "—"}</td>
              <td>{row.customerName || "—"}</td>
              <td>{row.packageName || "—"}</td>
              <td>{row.provider || "—"}</td>
              <td>{formatDate(row.createdAt || row.paidAt)}</td>
              <td>{formatMoney(row.paidAmount ?? row.amount, row.currency)}</td>
              <td><span className="badge badge-gray">{row.status || "—"}</span></td>
            </tr>
          ))}
          <tr className="total-summary-row">
            <th colSpan="5">Total Summary</th>
            <th>{formatMoney(total)}</th>
            <th>{rows.length} transactions</th>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function getColumns(rows, report) {
  return Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).slice(0, 8).forEach((key) => set.add(key));
      return set;
    }, new Set())
  ).filter((column) => !(report === "users" && column.toLowerCase() === "active"));
}

function AnalyticsChart({ report, rows }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const points = buildChartPoints(report, rows);
  const max = Math.max(...points.map((point) => point.value), 1);
  const axisMax = Math.max(1, Math.ceil(max));
  const tickStep = Math.max(1, Math.ceil(axisMax / 4));
  const ticks = Array.from({ length: 5 }, (_, index) => Math.min(index * tickStep, axisMax));
  if (ticks[ticks.length - 1] !== axisMax) ticks[ticks.length - 1] = axisMax;

  return (
    <section className="card analytics-chart">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
            {report === "users" ? "User Growth" : report === "invitations" ? "Invitation Status" : "Revenue Trend"}
          </h3>
        </div>
        <div className="analytics-legend" aria-label="Chart legend">
          <span className="analytics-legend-swatch" />
          <span>{report === "payments" ? "Report values" : "Records"}</span>
        </div>
      </div>
      <div className="analytics-chart-body" aria-label={`${report} chart`}>
        <div className="analytics-y-axis" aria-label="Integer chart scale">
          {[...ticks].reverse().map((tick) => <span key={tick}>{tick}</span>)}
        </div>
        <div className="analytics-plot">
          <div className="analytics-grid-lines" aria-hidden="true">
            {ticks.map((tick) => <span key={tick} style={{ bottom: `${(tick / axisMax) * 100}%` }} />)}
          </div>
          <div className="analytics-bars">
            {points.length ? points.map((point) => (
              <div className="analytics-bar-group" key={point.label}>
                <div
                  className="analytics-bar-track"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onFocus={() => setHoveredPoint(point)}
                  onBlur={() => setHoveredPoint(null)}
                  tabIndex="0"
                  aria-label={`${point.label}: ${point.display}`}
                >
                  <div className="analytics-bar" style={{ height: `${Math.max((point.value / axisMax) * 100, 4)}%` }} />
                  {hoveredPoint?.label === point.label && (
                    <div className="analytics-tooltip" role="tooltip">
                      <strong>{point.label}</strong>
                      <span>{point.display}</span>
                    </div>
                  )}
                </div>
                <span>{point.label}</span>
                <strong>{point.display}</strong>
              </div>
            )) : <div className="state">No chart data for this range.</div>}
            </div>
          </div>
      </div>
    </section>
  );
}

function buildChartPoints(report, rows) {
  if (report === "payments") {
    const paid = rows.filter((row) => String(row.status || "").toUpperCase() === "PAID");
    const total = paid.reduce((sum, row) => sum + Number(row.paidAmount ?? row.amount ?? 0), 0);
    return [{ label: "Paid", value: total, display: formatMoney(total) }, { label: "Orders", value: rows.length, display: String(rows.length) }];
  }
  const groups = rows.reduce((result, row) => {
    const date = findDateValue(row);
    const label = date ? formatDate(date) : "Unknown";
    result[label] = (result[label] || 0) + 1;
    return result;
  }, {});
  return Object.entries(groups).slice(-6).map(([label, value]) => ({ label, value, display: String(value) }));
}

function filterRowsByDate(rows, range, selectedMonth) {
  const now = new Date();
  let start;
  let end;
  if (range === "custom" && selectedMonth) {
    const [year, month] = selectedMonth.split("-").map(Number);
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 1);
  } else if (range === "lastMonth") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  return rows.filter((row) => {
    const value = findDateValue(row);
    if (!value) return true;
    const date = new Date(value);
    return date >= start && date < end;
  });
}

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function buildDisplaySummary(report, summary, rows) {
  if (report === "payments") {
    const paidRows = rows.filter((row) => String(row.status || "").toUpperCase() === "PAID");
    const failedRows = rows.filter((row) => ["FAILED", "REJECTED"].includes(String(row.status || "").toUpperCase()));
    return {
      totalPayments: rows.length,
      paidPayments: paidRows.length,
      failedPayments: failedRows.length,
      totalRevenue: paidRows.reduce((sum, row) => sum + Number(row.paidAmount ?? row.amount ?? 0), 0),
    };
  }
  if (["users", "invitations"].includes(report)) {
    return { ...summary, [`filtered${report === "users" ? "Users" : "Invitations"}`]: rows.length };
  }
  return summary;
}

function findDateValue(row) {
  const key = Object.keys(row || {}).find((name) => /createdat|created_at|paidat|paid_at|date/i.test(name));
  return key ? row[key] : null;
}

function formatMetricLabel(value) {
  return String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

function formatMetricValue(key, value) {
  return /revenue|amount|price/i.test(key) && typeof value === "number" ? formatMoney(value) : String(value);
}

function csvValue(value, column) {
  const formatted = /date|at$/i.test(column) ? formatDate(value) : value ?? "";
  return `"${String(formatted).replace(/"/g, '""')}"`;
}

function Value({ value, column }) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return <span className="admin-json">{JSON.stringify(value)}</span>;
  if (/date|at$/i.test(column)) return formatDate(value);
  return String(value);
}
