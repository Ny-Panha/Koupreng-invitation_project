import { Search, RotateCcw, Clock, AlertTriangle } from "lucide-react";

export function RequestFilters({
  search,
  onSearchChange,
  appFilter,
  onAppFilterChange,
  statusFilter,
  onStatusFilterChange,
  methodFilter,
  onMethodFilterChange,
  slowOnly,
  onSlowOnlyChange,
  timeRange = "ALL",
  onTimeRangeChange,
  nPlusOneOnly = false,
  onNPlusOneOnlyChange,
  onResetFilters,
  lang,
}) {
  const hasActiveFilters =
    Boolean(search) ||
    appFilter !== "ALL" ||
    methodFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    slowOnly ||
    timeRange !== "ALL" ||
    nPlusOneOnly;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/70">
      {/* Search Bar */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            lang === "km"
              ? "ស្វែងរកតាមផ្លូវ, Request ID, សកម្មភាព, ឬអ្នកប្រើ..."
              : "Search path, request ID, action, user..."
          }
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {/* Time Range Selector */}
      {onTimeRangeChange && (
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500" />
            <span>{lang === "km" ? "ពេល:" : "Window:"}</span>
          </label>
          <select
            aria-label="Time range filter"
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="ALL">{lang === "km" ? "ទាំងអស់ (All Time)" : "All Time"}</option>
            <option value="1m">{lang === "km" ? "១ នាទីចុងក្រោយ (1m)" : "Last 1 min"}</option>
            <option value="5m">{lang === "km" ? "៥ នាទីចុងក្រោយ (5m)" : "Last 5 mins"}</option>
            <option value="15m">{lang === "km" ? "១៥ នាទីចុងក្រោយ (15m)" : "Last 15 mins"}</option>
          </select>
        </div>
      )}

      {/* App Filter */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-slate-500 dark:text-zinc-400">
          {lang === "km" ? "កម្មវិធី:" : "App:"}
        </label>
        <select
          aria-label="App filter"
          value={appFilter}
          onChange={(e) => onAppFilterChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="ALL">{lang === "km" ? "ទាំងអស់" : "All Apps"}</option>
          <option value="frontend-user">frontend-user</option>
          <option value="frontend-admin">frontend-admin</option>
          <option value="external">{lang === "km" ? "ក្រៅប្រព័ន្ធ (External)" : "External"}</option>
        </select>
      </div>

      {/* Method Filter */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-slate-500 dark:text-zinc-400">
          {lang === "km" ? "វិធីសាស្ត្រ:" : "Method:"}
        </label>
        <select
          aria-label="Method filter"
          value={methodFilter}
          onChange={(e) => onMethodFilterChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="ALL">{lang === "km" ? "ទាំងអស់" : "All Methods"}</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-slate-500 dark:text-zinc-400">
          {lang === "km" ? "ស្ថានភាព:" : "Status:"}
        </label>
        <select
          aria-label="Status filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="ALL">{lang === "km" ? "ទាំងអស់" : "All Status"}</option>
          <option value="2xx">2xx (Success)</option>
          <option value="4xx">4xx (Client Error)</option>
          <option value="5xx">5xx (Server Error)</option>
        </select>
      </div>

      {/* Slow Requests Toggle */}
      <label className="flex cursor-pointer select-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
        <input
          type="checkbox"
          aria-label="Slow requests only"
          checked={slowOnly}
          onChange={(e) => onSlowOnlyChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-600"
        />
        <span>{lang === "km" ? "យឺតប៉ុណ្ណោះ (≥500ms)" : "Slow Only (≥500ms)"}</span>
      </label>

      {/* N+1 Warnings Toggle */}
      {onNPlusOneOnlyChange && (
        <label className="flex cursor-pointer select-none items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-2.5 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <input
            type="checkbox"
            checked={nPlusOneOnly}
            onChange={(e) => onNPlusOneOnlyChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500 dark:border-rose-700"
          />
          <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
          <span>N+1 Only</span>
        </label>
      )}

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{lang === "km" ? "កំណត់ឡើងវិញ" : "Reset"}</span>
        </button>
      )}
    </div>
  );
}
