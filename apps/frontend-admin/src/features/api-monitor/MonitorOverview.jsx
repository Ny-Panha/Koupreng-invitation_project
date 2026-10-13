import { Activity, CheckCircle2, AlertTriangle, XCircle, Clock, Zap, Pause, Play, Wifi } from "lucide-react";

export function MonitorOverview({ stats, status, isPaused, onTogglePause, onReconnect, onClear, lang }) {
  const total = stats?.totalRequests ?? 0;
  const success = stats?.successCount ?? 0;
  const clientErr = stats?.clientErrorCount ?? 0;
  const serverErr = stats?.serverErrorCount ?? 0;
  const slow = stats?.slowRequestsCount ?? 0;
  const avgDuration = stats?.avgDurationMs ?? 0;
  const p95Duration = stats?.p95DurationMs ?? 0;

  const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : "100.0";

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {status === "connected" && !isPaused ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </>
              ) : isPaused ? (
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
              ) : (
                <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
              )}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              {status === "connected" && !isPaused
                ? lang === "km"
                  ? "កំពុងភ្ជាប់ផ្ទាល់ (Live Stream)"
                  : "Live Stream Active"
                : isPaused
                ? lang === "km"
                  ? "ផ្អាកជាបណ្ដោះអាសន្ន"
                  : "Streaming Paused"
                : status === "connecting"
                ? lang === "km"
                  ? "កំពុងតភ្ជាប់..."
                  : "Connecting..."
                : lang === "km"
                ? "ដាច់ការតភ្ជាប់"
                : "Disconnected"}
            </span>
          </div>

          <span className="hidden text-xs text-slate-400 dark:text-zinc-600 sm:inline">•</span>

          <span className="text-xs text-slate-500 dark:text-zinc-400">
            {lang === "km" ? "ច្រកត្រួតពិនិត្យ" : "Endpoint"}:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
              /api/v1/admin/dev-monitor/stream
            </code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              isPaused
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {isPaused
              ? lang === "km"
                ? "បន្តផ្សាយ"
                : "Resume"
              : lang === "km"
              ? "ផ្អាក"
              : "Pause"}
          </button>

          {status !== "connected" && (
            <button
              type="button"
              onClick={onReconnect}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Wifi className="h-3.5 w-3.5" />
              {lang === "km" ? "តភ្ជាប់ឡើងវិញ" : "Reconnect"}
            </button>
          )}

          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {lang === "km" ? "សម្អាតប្រវត្តិ" : "Clear History"}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Requests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">{lang === "km" ? "សំណើទាំងអស់" : "Total Requests"}</span>
            <Activity className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">{total}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {stats?.userAppCount ?? 0} user / {stats?.adminAppCount ?? 0} admin
          </p>
        </div>

        {/* Success Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">{lang === "km" ? "អត្រាជោគជ័យ" : "Success Rate"}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{successRate}%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {success} {lang === "km" ? "ជោគជ័យ" : "2xx / 3xx ok"}
          </p>
        </div>

        {/* Client Errors */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">{lang === "km" ? "កំហុសអ្នកប្រើ (4xx)" : "Client Errors"}</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{clientErr}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {clientErr > 0 ? (lang === "km" ? "ទាមទារការពិនិត្យ" : "4xx validation/auth") : (lang === "km" ? "គ្មានកំហុស" : "None")}
          </p>
        </div>

        {/* Server Errors */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">{lang === "km" ? "កំហុសប្រព័ន្ធ (5xx)" : "Server Errors"}</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${serverErr > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-zinc-100"}`}>
              {serverErr}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {serverErr > 0 ? (lang === "km" ? "ត្រូវការដោះស្រាយជាបន្ទាន់" : "Immediate attention") : (lang === "km" ? "មានស្ថេរភាព" : "Zero errors")}
          </p>
        </div>

        {/* Slow Requests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">{lang === "km" ? "សំណើយឺត (≥500ms)" : "Slow Requests"}</span>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${slow > 0 ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-zinc-100"}`}>
              {slow}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {slow > 0 ? (lang === "km" ? "កម្រិតខ្ពស់ជាងធម្មតា" : "Above threshold") : (lang === "km" ? "ដំណើរការលឿន" : "Optimal")}
          </p>
        </div>

        {/* Latency Avg / P95 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">{lang === "km" ? "ល្បឿនមធ្យម / P95" : "Avg / P95 Latency"}</span>
            <Zap className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">{avgDuration}ms</span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">/ {p95Duration}ms</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {lang === "km" ? "រង្វាស់ Monotonic clock" : "Monotonic clock ms"}
          </p>
        </div>
      </div>
    </div>
  );
}

