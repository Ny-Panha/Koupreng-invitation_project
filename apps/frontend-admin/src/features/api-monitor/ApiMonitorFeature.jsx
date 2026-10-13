import { useMemo, useState } from "react";
import { ExternalLink, Terminal, ShieldCheck, Zap } from "lucide-react";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import { useApiMonitorStream } from "./useApiMonitorStream";
import { MonitorOverview } from "./MonitorOverview";
import { RequestFilters } from "./RequestFilters";
import { LiveRequestTable } from "./LiveRequestTable";
import { RequestDetailsDrawer } from "./RequestDetailsDrawer";
import { SlowRequestsPanel } from "./SlowRequestsPanel";

export default function ApiMonitorFeature() {
  const { lang, t } = useAdminLanguage();

  const {
    events,
    stats,
    status,
    errorMessage,
    isPaused,
    selectedEvent,
    setSelectedEvent,
    togglePause,
    clearHistory,
    reconnect,
  } = useApiMonitorStream();

  // Filters state
  const [search, setSearch] = useState("");
  const [appFilter, setAppFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [slowOnly, setSlowOnly] = useState(false);

  // Compute filtered events
  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => {
      if (q) {
        const matches =
          ev.path?.toLowerCase().includes(q) ||
          ev.requestId?.toLowerCase().includes(q) ||
          ev.clientAction?.toLowerCase().includes(q) ||
          ev.userPrincipal?.toLowerCase().includes(q) ||
          ev.errorCode?.toLowerCase().includes(q) ||
          ev.controller?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (appFilter !== "ALL") {
        if (!ev.clientApp?.toLowerCase().includes(appFilter.toLowerCase())) {
          return false;
        }
      }

      if (methodFilter !== "ALL") {
        if (ev.method?.toUpperCase() !== methodFilter.toUpperCase()) {
          return false;
        }
      }

      if (statusFilter !== "ALL") {
        if (statusFilter === "2xx" && (ev.status < 200 || ev.status >= 300)) return false;
        if (statusFilter === "4xx" && (ev.status < 400 || ev.status >= 500)) return false;
        if (statusFilter === "5xx" && ev.status < 500) return false;
      }

      if (slowOnly && !ev.slow) {
        return false;
      }

      return true;
    });
  }, [events, search, appFilter, methodFilter, statusFilter, slowOnly]);

  const handleResetFilters = () => {
    setSearch("");
    setAppFilter("ALL");
    setMethodFilter("ALL");
    setStatusFilter("ALL");
    setSlowOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-moul">
                {lang === "km" ? "ឧបករណ៍តាមដានសំណើ API ផ្ទាល់ (Developer API Monitor)" : "Developer API Live Monitor"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {lang === "km"
                  ? "តាមដានរាល់សំណើ HTTP ជាក់ស្ដែងរវាង User Web, Admin Dashboard និង Backend ដោយប្រើ SSE Tracing"
                  : "End-to-end request tracing & real-time HTTP telemetry across User Web, Admin Dashboard, and Spring Boot"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Links */}
        <div className="flex items-center gap-2">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span>User Web (:5173)</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <a
            href="/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span>Swagger UI</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span>Scalar Docs</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Error alert if stream disconnected */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{errorMessage}</span>
            <button
              type="button"
              onClick={reconnect}
              className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {lang === "km" ? "ព្យាយាមម្ដងទៀត" : "Retry Connection"}
            </button>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      <MonitorOverview
        stats={stats}
        status={status}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onReconnect={reconnect}
        onClear={clearHistory}
        t={t}
        lang={lang}
      />

      {/* Latency Profile Top Endpoints */}
      {stats?.topEndpoints && stats.topEndpoints.length > 0 && (
        <SlowRequestsPanel topEndpoints={stats.topEndpoints} lang={lang} />
      )}

      {/* Filter Toolbar */}
      <RequestFilters
        search={search}
        onSearchChange={setSearch}
        appFilter={appFilter}
        onAppFilterChange={setAppFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        methodFilter={methodFilter}
        onMethodFilterChange={setMethodFilter}
        slowOnly={slowOnly}
        onSlowOnlyChange={setSlowOnly}
        onResetFilters={handleResetFilters}
        t={t}
        lang={lang}
      />

      {/* Real-time Requests Table */}
      <LiveRequestTable
        events={filteredEvents}
        onSelectEvent={setSelectedEvent}
        selectedEventId={selectedEvent?.id}
        lang={lang}
      />

      {/* Details Drawer */}
      {selectedEvent && (
        <RequestDetailsDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          lang={lang}
        />
      )}
    </div>
  );
}

