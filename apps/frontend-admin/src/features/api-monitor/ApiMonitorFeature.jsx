import { useMemo, useState } from "react";
import {
  ExternalLink,
  Terminal,
  ShieldCheck,
  Zap,
  Layers,
  Table,
  Keyboard,
  Download,
} from "lucide-react";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import { useApiMonitorStream } from "./useApiMonitorStream";
import { useQaSessionRecorder } from "./useQaSessionRecorder";
import { MonitorOverview } from "./MonitorOverview";
import { RequestMetricsChart } from "./RequestMetricsChart";
import { QaSessionBar } from "./QaSessionBar";
import { RequestFilters } from "./RequestFilters";
import { LiveRequestTable } from "./LiveRequestTable";
import { RequestWaterfall } from "./RequestWaterfall";
import { RequestDetailsDrawer } from "./RequestDetailsDrawer";
import { SlowRequestsPanel } from "./SlowRequestsPanel";
import { ApiMonitorCommandPalette } from "./ApiMonitorCommandPalette";

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

  const {
    isRecording,
    activeSession,
    startSession,
    stopSession,
    addNote,
    exportSanitizedData,
  } = useQaSessionRecorder();

  // View state: 'table' | 'waterfall' | 'both'
  const [viewMode, setViewMode] = useState("table");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [appFilter, setAppFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [slowOnly, setSlowOnly] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => {
      if (q) {
        const matches =
          ev.path?.toLowerCase().includes(q) ||
          ev.requestId?.toLowerCase().includes(q) ||
          ev.actionId?.toLowerCase().includes(q) ||
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

  const handleFilterByAction = (actionId) => {
    setSearch(actionId);
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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-moul">
                  {lang === "km" ? "ឧបករណ៍តាមដានសំណើ API ផ្ទាល់ (Developer API Monitor V2.0)" : "Developer API Live Monitor V2.0"}
                </h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  V2.0 Tracing
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {lang === "km"
                  ? "តាមដានរាល់សំណើ HTTP ជាក់ស្ដែង គំនូសតាង Waterfall, Action Tracing, SQL Diagnostics និង QA Sessions"
                  : "End-to-end request tracing, waterfall timing, action correlation, SQL diagnostics & QA sessions"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Links & Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            title="Command Palette (Ctrl+K)"
          >
            <Keyboard className="h-3.5 w-3.5 text-amber-500" />
            <span>Command Palette</span>
            <kbd className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[10px] text-slate-500 dark:bg-zinc-700 dark:text-zinc-400">
              Ctrl+K
            </kbd>
          </button>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span>User Web (:5173)</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <a
            href="/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span>Swagger UI</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
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

      {/* QA Session Recording Bar */}
      <QaSessionBar
        isRecording={isRecording}
        activeSession={activeSession}
        onStartSession={startSession}
        onStopSession={stopSession}
        onAddNote={addNote}
        onExport={(format) => exportSanitizedData(events, format)}
        eventsCount={events.length}
        lang={lang}
      />

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

      {/* Interactive Charts: Velocity, Latency SLA, Status Distribution */}
      <RequestMetricsChart events={events} stats={stats} lang={lang} />

      {/* Latency Profile Top Endpoints */}
      {stats?.topEndpoints && stats.topEndpoints.length > 0 && (
        <SlowRequestsPanel topEndpoints={stats.topEndpoints} lang={lang} />
      )}

      {/* View Switcher & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>{lang === "km" ? "តារាងសំណើ (Live Table)" : "Live Table"}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("waterfall")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "waterfall"
                ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{lang === "km" ? "គំនូសតាង Waterfall" : "Request Waterfall"}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("both")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "both"
                ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>{lang === "km" ? "ទាំងពីរ (Combined)" : "Combined View"}</span>
          </button>
        </div>
      </div>

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

      {/* Waterfall Component (if mode is waterfall or both) */}
      {(viewMode === "waterfall" || viewMode === "both") && (
        <RequestWaterfall
          events={filteredEvents}
          onSelectEvent={setSelectedEvent}
          selectedEventId={selectedEvent?.id}
          lang={lang}
        />
      )}

      {/* Real-time Requests Table (if mode is table or both) */}
      {(viewMode === "table" || viewMode === "both") && (
        <LiveRequestTable
          events={filteredEvents}
          onSelectEvent={setSelectedEvent}
          onFilterByAction={handleFilterByAction}
          selectedEventId={selectedEvent?.id}
          lang={lang}
        />
      )}

      {/* Multi-Tab Request Details Drawer */}
      {selectedEvent && (
        <RequestDetailsDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onFilterByAction={handleFilterByAction}
          lang={lang}
        />
      )}

      {/* Command Palette */}
      <ApiMonitorCommandPalette
        isOpen={isPaletteOpen}
        onClose={setIsPaletteOpen}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onClear={clearHistory}
        showWaterfall={viewMode === "waterfall" || viewMode === "both"}
        onToggleWaterfall={() => setViewMode((m) => (m === "table" ? "waterfall" : "table"))}
        onSetAppFilter={setAppFilter}
        onSetStatusFilter={setStatusFilter}
        onSetSlowOnly={setSlowOnly}
        onResetFilters={handleResetFilters}
        onStartQaSession={startSession}
        onExport={(fmt) => exportSanitizedData(events, fmt)}
        lang={lang}
      />
    </div>
  );
}
