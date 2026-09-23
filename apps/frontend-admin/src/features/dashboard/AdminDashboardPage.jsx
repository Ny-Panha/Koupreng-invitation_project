import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AdminPageHeader,
  StatCard,
  StatusBadge,
  ActionButton,
  LoadingState,
  ErrorStateView,
} from "../../shared/ui/AdminUI";
import { useResource } from "../../shared/hooks";
import { formatMoney, formatDateTime } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import dashboardService from "./dashboardService";
import {
  Users,
  Palette,
  Mail,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  UserCheck,
  QrCode,
  SendHorizontal
} from "lucide-react";

export default function AdminDashboardPage() {
  const { lang, t } = useAdminLanguage();
  const { data, loading, error, reload } = useResource(dashboardService.summary);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      dashboardService.analyticsOverview(),
      dashboardService.analyticsRevenue(),
      dashboardService.analyticsTemplates(),
      dashboardService.analyticsDelivery(),
      dashboardService.analyticsRsvp(),
      dashboardService.analyticsCheckIn(),
      dashboardService.systemHealth(),
      dashboardService.alerts(),
    ]).then((results) => {
      if (!active) return;
      setAnalytics({
        overview: results[0].status === "fulfilled" ? results[0].value : null,
        revenue: results[1].status === "fulfilled" ? results[1].value : null,
        templates: results[2].status === "fulfilled" ? results[2].value : null,
        delivery: results[3].status === "fulfilled" ? results[3].value : null,
        rsvp: results[4].status === "fulfilled" ? results[4].value : null,
        checkIn: results[5].status === "fulfilled" ? results[5].value : null,
        health: results[6].status === "fulfilled" ? results[6].value : null,
        alerts: results[7].status === "fulfilled" ? results[7].value : null,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingState label={t("dashboard.loading", "កំពុងទាញយកទិន្នន័យផ្ទាំងគ្រប់គ្រង...")} />;
  }
  if (error || !data) {
    return (
      <ErrorStateView
        message={t("dashboard.error", "មិនអាចទាញយកទិន្នន័យ Dashboard បានទេ")}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        eyebrow={t("dashboard.eyebrow", "ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ")}
        title={t("dashboard.title", "ផ្ទាំងគ្រប់គ្រង")}
        subtitle={t("dashboard.subtitle", "ការវិភាគទិន្នន័យទូទៅ សកម្មភាពអ្នកប្រើប្រាស់ និងសុខភាពប្រព័ន្ធ")}
        actions={
          <ActionButton variant="ghost" size="sm" onClick={reload}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{t("dashboard.reload", "ផ្ទុកឡើងវិញ")}</span>
          </ActionButton>
        }
      />

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label={t("dashboard.totalUsers", "អ្នកប្រើសរុប")}
          value={data.totalUsers}
          note={
            lang === "en"
              ? `${data.activeUsers ?? 0} Active Accounts`
              : `${data.activeUsers ?? 0} គណនី Active`
          }
          icon={Users}
          tone="cyan"
        />
        <StatCard
          label={t("dashboard.totalTemplates", "គំរូធៀបការ")}
          value={data.totalTemplates}
          note={`${data.premiumTemplates ?? 0} Premium`}
          icon={Palette}
          tone="purple"
        />
        <StatCard
          label={t("dashboard.totalInvitations", "ធៀបការសរុប")}
          value={data.totalInvitations}
          note={
            lang === "en"
              ? `${data.publishedInvitations ?? 0} Published`
              : `${data.publishedInvitations ?? 0} បានផ្សាយ`
          }
          icon={Mail}
          tone="amber"
        />
        <StatCard
          label={t("dashboard.totalGuests", "ភ្ញៀវសរុប (Guests)")}
          value={data.totalGuests}
          note={t("dashboard.allGuestsNote", "ភ្ញៀវក្នុងធៀបការទាំងអស់")}
          icon={UserCheck}
          tone="emerald"
        />
        <StatCard
          label={t("dashboard.totalPayments", "ការទូទាត់សរុប")}
          value={data.totalPayments}
          note={
            lang === "en"
              ? `${data.failedPayments ?? 0} Failed`
              : `${data.failedPayments ?? 0} បរាជ័យ`
          }
          icon={CreditCard}
          tone="rose"
        />
        <StatCard
          label={t("dashboard.totalRevenue", "ចំណូលសរុប")}
          value={formatMoney(data.totalRevenue)}
          note={data.systemHealthSummary || t("dashboard.normalOperation", "ដំណើរការធម្មតា")}
          icon={TrendingUp}
          tone="amber"
        />
      </section>

      {/* Secondary Analytics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("dashboard.rsvpConversion", "RSVP Conversion")}
          value={percent(analytics.overview?.summary?.rsvpConversion)}
          note={t("dashboard.rsvpRateNote", "អត្រាឆ្លើយតបធៀបនឹងចំនួនភ្ញៀវ")}
          icon={Mail}
          tone="cyan"
        />
        <StatCard
          label={t("dashboard.checkInRate", "Check-in Rate")}
          value={percent(analytics.checkIn?.summary?.checkInRate)}
          note={
            lang === "en"
              ? `${analytics.checkIn?.summary?.checkedIn || 0} Checked-in`
              : `${analytics.checkIn?.summary?.checkedIn || 0} ភ្ញៀវបាន Check-in`
          }
          icon={QrCode}
          tone="emerald"
        />
        <StatCard
          label={t("dashboard.telegramDelivery", "Telegram Delivery")}
          value={analytics.delivery?.summary?.opened ?? "—"}
          note={
            lang === "en"
              ? `${analytics.delivery?.summary?.failed || 0} Failed`
              : `${analytics.delivery?.summary?.failed || 0} ផ្ញើមិនបានសម្រេច`
          }
          icon={SendHorizontal}
          tone="purple"
        />
        <StatCard
          label={t("dashboard.systemHealth", "សុខភាពប្រព័ន្ធ")}
          value={analytics.health?.summary?.status || "OK"}
          note={`${analytics.health?.summary?.failedNotifications || 0} alerts`}
          icon={ShieldCheck}
          tone="emerald"
        />
      </section>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#111113]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {t("dashboard.recentUsers", "អ្នកប្រើប្រាស់ថ្មីៗ (Recent Users)")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t("dashboard.recentUsersSub", "គណនីដែលបានចុះឈ្មោះចុងក្រោយ")}
              </p>
            </div>
            <Link
              to="/users"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              <span>{t("common.viewAll", "មើលទាំងអស់")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
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
                  <tr key={u.id || u.email} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-zinc-100">{u.fullName || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-400">{u.email || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
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
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                      {t("dashboard.noUsersData", "មិនទាន់មានទិន្នន័យ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#111113]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {t("dashboard.recentPayments", "ការទូទាត់ថ្មីៗ (Recent Payments)")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t("dashboard.recentPaymentsSub", "ប្រតិបត្តិការទូទាត់ចុងក្រោយក្នុងប្រព័ន្ធ")}
              </p>
            </div>
            <Link
              to="/payments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              <span>{t("common.viewAll", "មើលទាំងអស់")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
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
                  <tr key={p.orderCode || p.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-3 py-2.5 font-mono font-semibold text-slate-900 dark:text-zinc-100">
                      {p.orderCode}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(p.paidAmount ?? p.amount, p.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-zinc-400">
                      {formatDateTime(p.paidAt)}
                    </td>
                  </tr>
                ))}
                {!(data.recentPayments?.length) && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
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

function percent(value) {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}
