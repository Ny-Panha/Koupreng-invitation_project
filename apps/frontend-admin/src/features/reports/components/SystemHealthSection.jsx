import { ShieldAlert, CheckCircle2, AlertTriangle, Activity } from "lucide-react";

export default function SystemHealthSection({
  systemHealth = null,
  alerts = null,
  lang = "km",
}) {
  const isHealthy = systemHealth?.summary?.status !== "WARN";
  const failedNotifications = Number(systemHealth?.summary?.failedNotifications || 0);
  const pendingPayments = Number(systemHealth?.summary?.pendingPayments || 0);
  const rejectedPayments = Number(systemHealth?.summary?.rejectedPayments || 0);

  const alertRows = Array.isArray(alerts?.rows) ? alerts.rows : [];

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {lang === "en" ? "System Health & Operational Alerts" : "សុខភាពប្រព័ន្ធ & ការជូនដំណឹងប្រតិបត្តិការ"}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            isHealthy
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
          }`}
        >
          {isHealthy ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          <span>{isHealthy ? "OPERATIONAL (OK)" : "ATTENTION NEEDED (WARN)"}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 p-3 bg-slate-50/50 dark:bg-zinc-900/40">
          <span className="text-[11px] font-semibold text-slate-500">
            {lang === "en" ? "Failed Notifications" : "សារបញ្ជូនមិនជោគជ័យ"}
          </span>
          <div className="mt-1 text-xl font-bold text-slate-900 dark:text-zinc-100">
            {failedNotifications}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 p-3 bg-slate-50/50 dark:bg-zinc-900/40">
          <span className="text-[11px] font-semibold text-slate-500">
            {lang === "en" ? "Pending Payments" : "ការទូទាត់រង់ចាំ"}
          </span>
          <div className="mt-1 text-xl font-bold text-slate-900 dark:text-zinc-100">
            {pendingPayments}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 p-3 bg-slate-50/50 dark:bg-zinc-900/40">
          <span className="text-[11px] font-semibold text-slate-500">
            {lang === "en" ? "Rejected Payments" : "ការទូទាត់បដិសេធ"}
          </span>
          <div className="mt-1 text-xl font-bold text-slate-900 dark:text-zinc-100">
            {rejectedPayments}
          </div>
        </div>
      </div>

      {alertRows.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            {lang === "en" ? "Active Alerts & Exceptions" : "ការជូនដំណឹងសកម្ម"}
          </h4>
          <div className="space-y-1.5">
            {alertRows.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs"
              >
                <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-zinc-100">{alert.title}</div>
                  <div className="text-slate-500 dark:text-zinc-400">{alert.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

