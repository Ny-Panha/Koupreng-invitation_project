import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { RefreshStatus } from "../../shared/ui/AdminSkeleton";
import { StatusBadge, LoadingState, ErrorStateView } from "../../shared/ui/AdminUI";
import { useResource } from "../../shared/hooks";
import { formatMoney, formatDateTime } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import dashboardService from "./dashboardService";
import CoreMetricsBox from "./components/CoreMetricsBox";
import AnimatedTrendChart from "./components/AnimatedTrendChart";
import ConversionHealthBox from "./components/ConversionHealthBox";
import RecentInvitationsCard from "./components/RecentInvitationsCard";
import "./AdminDashboardPage.css";

const reports = {
  overview: dashboardService.analyticsOverview,
  revenue: dashboardService.analyticsRevenue,
  templates: dashboardService.analyticsTemplates,
  delivery: dashboardService.analyticsDelivery,
  rsvp: dashboardService.analyticsRsvp,
  checkIn: dashboardService.analyticsCheckIn,
  health: dashboardService.systemHealth,
  alerts: dashboardService.alerts,
};

export default function AdminDashboardPage() {
  const { lang, t } = useAdminLanguage();
  const en = lang === "en";
  const { data, loading, refreshing, error, reload } = useResource(dashboardService.summary);
  const [analytics, setAnalytics] = useState({});
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const refresh = () => {
    setAnalyticsLoading(true);
    setAnalyticsRefresh(value => value + 1);
    return reload();
  };

  useEffect(() => {
    let active = true;
    let remaining = Object.keys(reports).length;
    // Independent reports keep their own loading/unavailable states.
    Object.entries(reports).forEach(([key, fetcher]) => {
      fetcher()
        .then(value => { if (active) setAnalytics(current => ({ ...current, [key]: value })); })
        .catch(() => { if (active) setAnalytics(current => ({ ...current, [key]: null })); })
        .finally(() => {
          remaining -= 1;
          if (active && remaining === 0) setAnalyticsLoading(false);
        });
    });
    return () => { active = false; };
  }, [analyticsRefresh]);

  if (loading) return <LoadingState layout="dashboard" label={t("dashboard.loading")} />;
  if (!data) return <ErrorStateView message={t("dashboard.error")} onRetry={refresh} />;

  const busy = refreshing || analyticsLoading;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-heading">
        <div>
          <h1>{t("dashboard.title")}</h1>
          <p>{en ? "An overview of your platform and recent activity." : "ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ និងសកម្មភាពថ្មីៗ។"}</p>
        </div>
        <div className="dashboard-heading-actions">
          <Link className="dashboard-button dashboard-button--primary" to="/reports">
            {en ? "View reports" : "មើលរបាយការណ៍"}<ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button className="dashboard-button" type="button" onClick={refresh} disabled={busy}>
            <RefreshCw size={16} aria-hidden="true" />
            {en ? "Refresh" : "ផ្ទុកឡើងវិញ"}
          </button>
        </div>
      </header>

      <RefreshStatus active={busy} error={Boolean(error)} onRetry={refresh} />
      <CoreMetricsBox data={data} lang={lang} t={t} />

      <div className="dashboard-grid">
        <AnimatedTrendChart lang={lang} report={analytics.revenue} loading={analytics.revenue === undefined} data={data} />
        <ConversionHealthBox analytics={analytics} lang={lang} loading={analyticsLoading} />
      </div>

      <div className="dashboard-grid">
        <RecentInvitationsCard lang={lang} invitations={data.recentInvitations} />

        <section className="dashboard-panel" aria-labelledby="dashboard-users-title">
          <div className="dashboard-panel-header">
            <div>
              <h2 id="dashboard-users-title">{t("dashboard.recentUsers")}</h2>
              <p>{t("dashboard.recentUsersSub")}</p>
            </div>
            <Link to="/users" className="dashboard-text-link" aria-label={en ? "View all users" : "មើលអ្នកប្រើប្រាស់ទាំងអស់"}>
              {t("common.viewAll")}<ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {data.recentUsers?.length ? (
            <ul className="dashboard-user-list">
              {data.recentUsers.map(user => (
                <li key={user.id || user.email}>
                  <span className="dashboard-avatar" aria-hidden="true">{Array.from(user.fullName || user.email || "?")[0]}</span>
                  <div className="dashboard-user-identity">
                    <strong>{user.fullName || "—"}</strong>
                    <span>{user.email || "—"}</span>
                  </div>
                  <div className="dashboard-user-state">
                    <StatusBadge status={user.status} />
                    <span>{user.role || "—"}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="dashboard-empty">{t("dashboard.noUsersData")}</p>}
        </section>
      </div>

      <section className="dashboard-panel" aria-labelledby="dashboard-payments-title">
        <div className="dashboard-panel-header">
          <div>
            <h2 id="dashboard-payments-title">{t("dashboard.recentPayments")}</h2>
            <p>{t("dashboard.recentPaymentsSub")}</p>
          </div>
          <Link to="/payments" className="dashboard-text-link" aria-label={en ? "View all payments" : "មើលការទូទាត់ទាំងអស់"}>
            {t("common.viewAll")}<ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {data.recentPayments?.length ? (
          <table className="dashboard-payments" role="table">
            <caption className="sr-only">{t("dashboard.recentPayments")}</caption>
            <thead role="rowgroup"><tr role="row">
              <th scope="col">{t("dashboard.colOrderCode")}</th>
              <th scope="col">{t("dashboard.colStatus")}</th>
              <th scope="col" className="dashboard-amount">{t("dashboard.colAmount")}</th>
              <th scope="col">{en ? "Paid at" : "បានទូទាត់នៅ"}</th>
            </tr></thead>
            <tbody role="rowgroup">
              {data.recentPayments.map(payment => (
                <tr key={payment.orderCode || payment.id} role="row">
                  <th scope="row" role="rowheader">{payment.orderCode || "—"}</th>
                  <td role="cell"><StatusBadge status={payment.status} /></td>
                  <td role="cell" className="dashboard-amount">{formatMoney(payment.paidAmount ?? payment.amount, payment.currency)}</td>
                  <td role="cell" className="dashboard-payment-date">{formatDateTime(payment.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="dashboard-empty">{t("dashboard.noPaymentsData")}</p>}
      </section>

      <p className="dashboard-snapshot-note">{en
        ? "Current server snapshot. Refresh to load the latest records."
        : "ស្ថានភាពបច្ចុប្បន្នពីម៉ាស៊ីនមេ។ ផ្ទុកឡើងវិញដើម្បីមើលកំណត់ត្រាចុងក្រោយ។"}</p>
    </div>
  );
}
