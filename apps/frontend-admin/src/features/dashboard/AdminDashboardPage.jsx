import { RefreshStatus } from '../../shared/ui/AdminSkeleton';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AdminPageHeader,
  StatusBadge,
  ActionButton,
  LoadingState,
  ErrorStateView,
} from "../../shared/ui/AdminUI";
import { useResource } from "../../shared/hooks";
import { formatMoney, formatRevenue, formatDateTime } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import dashboardService from "./dashboardService";
import LiveTickerBanner from "./components/LiveTickerBanner";
import AnimatedNumber from "./components/AnimatedNumber";
import AnimatedTrendChart from "./components/AnimatedTrendChart";
import RecentInvitationsCard from "./components/RecentInvitationsCard";
import CoreMetricsBox from "./components/CoreMetricsBox";
import ConversionHealthBox from "./components/ConversionHealthBox";
import {
  Users,
  Mail,
  CreditCard,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { lang, t } = useAdminLanguage();
  const { data, loading, refreshing, error, reload } = useResource(dashboardService.summary);
  const [analytics, setAnalytics] = useState({});
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);
  const refresh = () => { setAnalyticsRefresh(value => value + 1); return reload(); };
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const requests = {
      overview: dashboardService.analyticsOverview, revenue: dashboardService.analyticsRevenue,
      templates: dashboardService.analyticsTemplates, delivery: dashboardService.analyticsDelivery,
      rsvp: dashboardService.analyticsRsvp, checkIn: dashboardService.analyticsCheckIn,
      health: dashboardService.systemHealth, alerts: dashboardService.alerts,
    };
    // Each independent region resolves without waiting for the slowest report.
    Object.entries(requests).forEach(([key, fetcher]) => {
      fetcher().then(value => { if (active) setAnalytics(current => ({ ...current, [key]: value })); })
        .catch(() => { if (active) setAnalytics(current => ({ ...current, [key]: null })); });
    });
    return () => {
      active = false;
    };
  }, [analyticsRefresh]);

  if (loading) {
    return <LoadingState layout="dashboard" label={t("dashboard.loading", "កំពុងទាញយកទិន្នន័យផ្ទាំងគ្រប់គ្រង...")} />;
  }
  if (!data) {
    return (
      <ErrorStateView
        message={t("dashboard.error", "មិនអាចទាញយកទិន្នន័យ Dashboard បានទេ")}
        onRetry={refresh}
      />
    );
  }

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });


  return (
    <div className="relative space-y-6">
      {/* 1. Page Header with Realtime Service Clock (Cascade Delay: 0s) */}
      <div className="animate-cascade" style={{ animationDelay: "0s" }}>
        <RefreshStatus active={refreshing} error={Boolean(error && data)} onRetry={reload} />
      <AdminPageHeader
          eyebrow={t("dashboard.eyebrow", "ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ")}
          title={t("dashboard.title", "ផ្ទាំងគ្រប់គ្រង")}
          subtitle={t("dashboard.subtitle", "ការវិភាគទិន្នន័យទូទៅ សកម្មភាពអ្នកប្រើប្រាស់ និងសុខភាពប្រព័ន្ធ")}
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Live Service Clock Capsule */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 shadow-xs text-xs font-semibold text-slate-700 dark:text-zinc-300 backdrop-blur-md">
                <span className="live-radar-dot" aria-hidden="true" />
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-mono tracking-tight">{formattedTime}</span>
                <span className="text-slate-300 dark:text-zinc-700">|</span>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold uppercase tracking-wider">
                  {lang === "en" ? "LOCAL CLOCK" : "ម៉ោងមូលដ្ឋាន"}
                </span>
              </div>

              <ActionButton variant="ghost" size="sm" onClick={refresh}>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t("dashboard.reload", "ផ្ទុកឡើងវិញ")}</span>
              </ActionButton>
            </div>
          }
        />
      </div>

      {/* 2. Continuous Right-to-Left Running Ticker Banner (Cascade Delay: 0.05s) */}
      <div className="animate-cascade" style={{ animationDelay: "0.05s" }}>
        <LiveTickerBanner
          data={data}
          analytics={analytics}
          lang={lang}
          onReload={refresh}
        />
      </div>

      {/* 3. Hero Centerpiece: Tavola 12-col Dual Layout (Live Service Chart + Pass Queue) */}
      <section className="space-y-4 animate-cascade" style={{ animationDelay: "0.10s" }}>
        {/* Section Header with Khmer Title & Tavola Summary Pills */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="animate-zoom-in" style={{ animationDelay: "0.12s" }}>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === "en"
                  ? "Recorded receipts & recent invitations"
                  : "ប្រាក់ទទួលកត់ត្រា និងធៀបអញ្ជើញថ្មីៗ"}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === "en"
                ? "Current recorded totals; use Reports for defined date periods and exports."
                : "ចំនួនបច្ចុប្បន្ន។ ប្រើរបាយការណ៍សម្រាប់រយៈពេល និងការនាំចេញ។"}
            </p>
          </div>

          {/* Tavola Quick Summary Pills for Koupreng Wedding Platform */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Pill 1: Revenue Today */}
            <div
              style={{ animationDelay: "0.16s" }}
              className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-[#121622]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md animate-zoom-in"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-400">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatRevenue(data)}
                  </strong>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    {lang === "en" ? "Recorded" : "បានកត់ត្រា"}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground block">
                  {lang === "en" ? "Recorded receipts (all time)" : "ប្រាក់ទទួលកត់ត្រា (ទាំងអស់)"}
                </span>
              </div>
            </div>

            {/* Pill 2: RSVP Confirmed */}
            <div
              style={{ animationDelay: "0.20s" }}
              className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-[#121622]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md animate-zoom-in"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  <AnimatedNumber value={data.totalGuests ?? 0} />
                </strong>
                <span className="text-[10px] font-semibold text-muted-foreground block">
                  {lang === "en" ? "Guest records" : "កំណត់ត្រាភ្ញៀវ"}
                </span>
              </div>
            </div>

            {/* Pill 3: Avg per Invitation */}
            <div
              style={{ animationDelay: "0.24s" }}
              className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-[#121622]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md animate-zoom-in"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {data.totalInvitations ?? 0}
                </strong>
                <span className="text-[10px] font-semibold text-muted-foreground block">
                  {lang === "en" ? "Invitation records" : "កំណត់ត្រាធៀបអញ្ជើញ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Continuous 2-Column Layout: Left (7 cols) & Right (5 cols) - Zero dead space */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (7 cols): Live Service Trend Chart + Core Metrics Box directly underneath */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-5">
            <div className="animate-cascade" style={{ animationDelay: "0.22s" }}>
              <AnimatedTrendChart
                lang={lang}
                report={analytics.revenue}
                loading={analytics.revenue === undefined}
              />
            </div>
            <div className="animate-cascade" style={{ animationDelay: "0.28s" }}>
              <CoreMetricsBox
                data={data}
                lang={lang}
                t={t}
                formatRevenue={formatRevenue}
              />
            </div>
          </div>

          {/* Right Column (5 cols): Recent Invitations Card + Conversion & Health Box directly underneath */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-5">
            <div className="animate-cascade" style={{ animationDelay: "0.24s" }}>
              <RecentInvitationsCard lang={lang} invitations={data.recentInvitations} />
            </div>
            <div className="animate-cascade" style={{ animationDelay: "0.32s" }}>
              <ConversionHealthBox
                loading
                analytics={analytics}
                lang={lang}
                t={t}
              />
            </div>
          </div>
        </div>
      </section>


      {/* Tables Grid with Tavola Glass & Hover Polish */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Card (Cascade Delay: 0.91s) */}
        <div
          style={{ animationDelay: "0.91s" }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs dark:border-zinc-800 dark:bg-[#111114]/90 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-amber-500/30 animate-cascade"
        >
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-500" />
                <span>{t("dashboard.recentUsers", "អ្នកប្រើប្រាស់ថ្មីៗ (Recent Users)")}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t("dashboard.recentUsersSub", "គណនីដែលបានចុះឈ្មោះចុងក្រោយ")}
              </p>
            </div>
            <Link
              to="/users"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-700 dark:text-amber-400 transition-transform hover:translate-x-0.5"
            >
              <span>{t("common.viewAll", "មើលទាំងអស់")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/80" tabIndex={0} role="region" aria-label={t('dashboard.recentUsers', 'Recent users')}>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
                <tr>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colName", "ឈ្មោះ")}
                  </th>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colEmail", "អ៊ីមែល")}
                  </th>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colRole", "តួនាទី")}
                  </th>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colStatus", "ស្ថានភាព")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {(data.recentUsers || []).map((u) => (
                  <tr key={u.id || u.email} className="hover:bg-amber-500/5 dark:hover:bg-amber-500/5 transition-colors">
                    <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-zinc-100">{u.fullName || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">{u.email || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={u.status} />
                    </td>
                  </tr>
                ))}
                {!(data.recentUsers?.length) && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                      {t("dashboard.noUsersData", "មិនទាន់មានទិន្នន័យ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Card (Cascade Delay: 0.98s) */}
        <div
          style={{ animationDelay: "0.98s" }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs dark:border-zinc-800 dark:bg-[#111114]/90 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-amber-500/30 animate-cascade"
        >
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <span>{t("dashboard.recentPayments", "ការទូទាត់ថ្មីៗ (Recent Payments)")}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t("dashboard.recentPaymentsSub", "ប្រតិបត្តិការទូទាត់ចុងក្រោយក្នុងប្រព័ន្ធ")}
              </p>
            </div>
            <Link
              to="/payments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-700 dark:text-amber-400 transition-transform hover:translate-x-0.5"
            >
              <span>{t("common.viewAll", "មើលទាំងអស់")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/80">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
                <tr>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colOrderCode", "Order Code")}
                  </th>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colStatus", "ស្ថានភាព")}
                  </th>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colAmount", "ចំនួនទឹកប្រាក់")}
                  </th>
                  <th className="px-3 py-2.5 font-bold text-slate-500 dark:text-zinc-400">
                    {t("dashboard.colDate", "កាលបរិច្ឆេទ")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {(data.recentPayments || []).map((p) => (
                  <tr key={p.orderCode || p.id} className="hover:bg-amber-500/5 dark:hover:bg-amber-500/5 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-semibold text-slate-900 dark:text-zinc-100">
                      {p.orderCode}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-emerald-800 dark:text-emerald-300">
                      {formatMoney(p.paidAmount ?? p.amount, p.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-zinc-400 text-[11px]">
                      {formatDateTime(p.paidAt)}
                    </td>
                  </tr>
                ))}
                {!(data.recentPayments?.length) && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                      {t("dashboard.noPaymentsData", "មិនទាន់មានទិន្នន័យទូទាត់ទេ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
