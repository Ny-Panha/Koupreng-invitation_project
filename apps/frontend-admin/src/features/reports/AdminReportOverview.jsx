import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, CreditCard, RefreshCw, Users } from "lucide-react";
import { ActionButton, AdminPageHeader, ErrorStateView, LoadingState, StatCard } from "../../shared/ui/AdminUI";
import adminService from "../../shared/api/adminService";

const categories = [
  { key: "WEDDING", label: "Wedding (អាពាហ៍ពិពាហ៍)", color: "#a855f7" },
  { key: "ENGAGEMENT", label: "Engagement (ភ្ជាប់ពាក្យ)", color: "#0ea5e9" },
  { key: "ANNIVERSARY_BIRTHDAY", label: "Anniversary / Birthday (ខួប/ជប់លៀង)", color: "#f59e0b" },
];
const tiers = ["Basic", "Pro", "Premium"];
const list = (value) => Array.isArray(value) ? value : [];
const amount = (value) => Number(value || 0);
const integer = (value) => new Intl.NumberFormat().format(amount(value));
const currency = (value, code = "USD") => new Intl.NumberFormat(undefined, { style: "currency", currency: code, maximumFractionDigits: 2 }).format(amount(value));
const monthLabel = (value) => {
  const date = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { month: "short" }).format(date);
};

function MetricPanel({ title, description, children }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#111113]">
    <div className="mb-4"><h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{title}</h3>
      {description && <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{description}</p>}</div>{children}
  </section>;
}

function Breakdown({ rows, keyName, valueName, labels, colors }) {
  const normalized = labels.map((label, index) => {
    const row = rows.find((item) => item[keyName] === label.key);
    return { ...label, value: amount(row?.[valueName]), color: colors[index] };
  });
  const total = normalized.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradient = total ? normalized.map((item) => {
    const start = total ? cursor / total * 100 : 0;
    cursor += item.value;
    const end = total ? cursor / total * 100 : 0;
    return `${item.color} ${start}% ${end}%`;
  }).join(", ") : "#e2e8f0 0% 100%";
  return <div className="grid gap-5 sm:grid-cols-[132px_1fr] sm:items-center">
    <div aria-label={`${integer(total)} total`} className="mx-auto grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(${gradient || "#e2e8f0 0% 100%"})` }}>
      <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center dark:bg-[#111113]"><strong className="text-xl tabular-nums text-slate-900 dark:text-white">{integer(total)}</strong><span className="text-[10px] text-slate-500">total</span></div>
    </div>
    <ul className="grid gap-3">{normalized.map((item) => <li key={item.key} className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-2 text-slate-600 dark:text-zinc-300"><i aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
      <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">{integer(item.value)}{total ? <span className="ml-1 font-normal text-slate-500">({Math.round(item.value / total * 100)}%)</span> : null}</span>
    </li>)}</ul>
  </div>;
}

export default function AdminReportOverview() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      const data = await adminService.platformReport();
      setReport(data || null);
      setError("");
    } catch (loadError) {
      setError(loadError?.message || "Could not load platform analytics.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await adminService.platformReport();
        if (active) { setReport(data || null); setError(""); }
      } catch (loadError) {
        if (active) setError(loadError?.message || "Could not load platform analytics.");
      } finally { if (active) setLoading(false); }
    };
    load();
    const interval = window.setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { active = false; window.clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  const summary = report?.summary || {};
  const growth = useMemo(() => list(summary.eventCreationGrowth), [summary.eventCreationGrowth]);
  const maxGrowth = Math.max(1, ...growth.map((item) => amount(item.created)));
  const revenueByCurrency = summary.revenueByCurrency || {};
  const tiersData = list(summary.subscriptionTiers);
  const transactions = list(report?.rows);
  if (loading) return <LoadingState label="Loading platform analytics..." />;
  if (error && !report) return <ErrorStateView message={error} onRetry={reload} />;

  return <div className="space-y-6">
    <AdminPageHeader eyebrow="PLATFORM ANALYTICS" title="Platform Reports" subtitle="Aggregated platform activity, revenue, and adoption metrics. No individual event or guest details are shown."
      actions={<ActionButton variant="ghost" size="sm" onClick={reload}><RefreshCw className="h-3.5 w-3.5" /><span>Refresh</span></ActionButton>} />
    {error && <p role="status" className="text-xs text-amber-700">Analytics could not refresh. Showing the last loaded snapshot.</p>}

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform totals">
      <StatCard label="Total events" value={integer(summary.totalInvitations)} note="All created events" icon={CalendarDays} tone="cyan" />
      <StatCard label="Active / Published" value={integer(summary.publishedInvitations)} note="Published events" icon={Activity} tone="emerald" />
      <StatCard label="Registered users" value={integer(summary.totalUsers)} note={`${integer(summary.activeUsers)} active users`} icon={Users} tone="purple" />
      <StatCard label="Platform check-ins" value={integer(summary.totalCheckIns)} note="Total QR check-ins" icon={CreditCard} tone="amber" />
    </section>

    <div className="grid gap-4 xl:grid-cols-2">
      <MetricPanel title="Platform events" description="Lifecycle totals and event creation by month.">
        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900"><p className="text-[11px] text-slate-500">Draft</p><strong className="mt-1 block text-lg text-slate-900 dark:text-white">{integer(summary.draftInvitations)}</strong></div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900"><p className="text-[11px] text-slate-500">Suspended</p><strong className="mt-1 block text-lg text-slate-900 dark:text-white">{integer(summary.suspendedInvitations)}</strong></div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900"><p className="text-[11px] text-slate-500">Published</p><strong className="mt-1 block text-lg text-slate-900 dark:text-white">{integer(summary.publishedInvitations)}</strong></div>
        </div>
        <div className="grid h-36 grid-cols-12 items-end gap-2" role="img" aria-label="Events created per month, last 12 months">
          {growth.map((item) => <div key={item.month} className="flex h-full min-w-0 flex-col items-center justify-end gap-1" title={`${item.month}: ${integer(item.created)} events`}>
            <span className="text-[9px] tabular-nums text-slate-500">{integer(item.created)}</span><div className="w-full rounded-t bg-cyan-500" style={{ height: `${Math.max(4, amount(item.created) / maxGrowth * 100)}%` }} />
            <span className="text-[9px] text-slate-500">{monthLabel(item.month)}</span>
          </div>)}
        </div>
      </MetricPanel>
      <MetricPanel title="Event categories" description="Platform-wide distribution by event type.">
        <Breakdown rows={list(summary.eventCategoryBreakdown)} keyName="category" valueName="count" labels={categories} colors={categories.map((item) => item.color)} />
      </MetricPanel>
      <MetricPanel title="Revenue & payments" description="Platform revenue totals by currency and source.">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900"><p className="text-xs text-slate-500">KHQR / payment orders</p>{Object.entries(summary.paymentRevenueByCurrency || revenueByCurrency).map(([code, value]) => <strong key={code} className="mt-1 block text-lg text-slate-900 dark:text-white">{currency(value, code)}</strong>)}</div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900"><p className="text-xs text-slate-500">Subscriptions</p>{Object.entries(summary.subscriptionRevenueByCurrency || {}).map(([code, value]) => <strong key={code} className="mt-1 block text-lg text-slate-900 dark:text-white">{currency(value, code)}</strong>)}{!Object.keys(summary.subscriptionRevenueByCurrency || {}).length && <strong className="mt-1 block text-lg text-slate-900 dark:text-white">—</strong>}</div>
        </div>
        <p className="mb-3 text-xs text-slate-500">{integer(summary.totalPayments)} payment orders · {integer(summary.failedPayments)} failed</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="text-[10px] uppercase text-slate-500"><tr><th className="py-2">Period</th><th>Source</th><th>Status</th><th className="text-right">Transactions</th><th className="text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{transactions.map((row, index) => <tr key={`${row.period}-${row.type}-${row.provider}-${row.status}-${index}`}><td className="py-2">{row.period || "—"}</td><td>{row.type === "SUBSCRIPTION" ? "Subscription" : row.provider || "KHQR"}</td><td>{row.status || "—"}</td><td className="text-right tabular-nums">{integer(row.transactionCount)}</td><td className="text-right tabular-nums">{row.totalAmount == null ? <span className="text-slate-500">Suppressed (&lt;5)</span> : currency(row.totalAmount, row.currency || "USD")}</td></tr>)}
          {!transactions.length && <tr><td colSpan={5} className="py-6 text-center text-slate-500">No aggregate transactions available.</td></tr>}</tbody></table></div>
      </MetricPanel>
      <MetricPanel title="Subscription packages" description="Active subscriptions by tier.">
        <Breakdown rows={tiersData} keyName="tier" valueName="activeSubscriptions" labels={tiers.map((key) => ({ key, label: key }))} colors={["#64748b", "#0ea5e9", "#a855f7"]} />
      </MetricPanel>
      <MetricPanel title="User analytics" description="Registered and active accounts with aggregate system usage.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[{ label: "Registered", value: summary.totalUsers }, { label: "Active", value: summary.activeUsers }, { label: "Total check-ins", value: summary.totalCheckIns }, { label: "Events created", value: summary.totalInvitations }].map((item) => <div key={item.label} className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900"><p className="text-[11px] text-slate-500">{item.label}</p><strong className="mt-1 block text-lg tabular-nums text-slate-900 dark:text-white">{integer(item.value)}</strong></div>)}
        </div>
      </MetricPanel>
    </div>
  </div>;
}
