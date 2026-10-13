import { useMemo, useState } from "react";
import {
  AlertTriangle,
  XCircle,
  WifiOff,
  ShieldAlert,
  Search,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

export function ErrorInvestigationPanel({ events, onSelectEvent, selectedEventId, lang }) {
  const [errorSearch, setErrorSearch] = useState("");
  const [errorTypeFilter, setErrorTypeFilter] = useState("ALL"); // ALL | 4xx | 5xx | net
  const [copiedId, setCopiedId] = useState(null);

  const errorEvents = useMemo(() => {
    return (events || []).filter((e) => e.status >= 400 || e.status === 0 || e.outcome === "NETWORK_ERROR");
  }, [events]);

  const stats = useMemo(() => {
    const total = events?.length || 0;
    const totalErrors = errorEvents.length;
    const clientErrors = errorEvents.filter((e) => e.status >= 400 && e.status < 500).length;
    const serverErrors = errorEvents.filter((e) => e.status >= 500).length;
    const netErrors = errorEvents.filter((e) => e.status === 0 || e.outcome === "NETWORK_ERROR").length;
    const errorRate = total > 0 ? ((totalErrors / total) * 100).toFixed(1) : "0.0";

    // Group errors by errorCode or status
    const errorCodesMap = new Map();
    for (const ev of errorEvents) {
      const code = ev.errorCode || (ev.status === 0 ? "NETWORK_FAILURE" : `HTTP_${ev.status}`);
      errorCodesMap.set(code, (errorCodesMap.get(code) || 0) + 1);
    }
    const topErrorCodes = Array.from(errorCodesMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalErrors, clientErrors, serverErrors, netErrors, errorRate, topErrorCodes };
  }, [events, errorEvents]);

  const filteredErrors = useMemo(() => {
    const q = errorSearch.trim().toLowerCase();
    return errorEvents.filter((ev) => {
      if (errorTypeFilter === "4xx" && (ev.status < 400 || ev.status >= 500)) return false;
      if (errorTypeFilter === "5xx" && ev.status < 500) return false;
      if (errorTypeFilter === "net" && ev.status !== 0 && ev.outcome !== "NETWORK_ERROR") return false;

      if (q) {
        const matches =
          ev.path?.toLowerCase().includes(q) ||
          ev.requestId?.toLowerCase().includes(q) ||
          ev.errorCode?.toLowerCase().includes(q) ||
          ev.errorMessage?.toLowerCase().includes(q) ||
          ev.clientAction?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [errorEvents, errorSearch, errorTypeFilter]);

  const handleCopy = (text, id) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Error KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Errors / Error Rate */}
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold">{lang === "km" ? "អត្រាកំហុសសរុប" : "Total Error Rate"}</span>
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-300 tabular-nums">
              {stats.errorRate}%
            </span>
            <span className="text-xs text-rose-500 font-mono">({stats.totalErrors} err)</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-400/80">
            {stats.totalErrors > 0 ? (lang === "km" ? "ទាមទារការស៊ើបអង្កេត" : "Active failures observed") : (lang === "km" ? "គ្មានកំហុស" : "Zero errors")}
          </p>
        </div>

        {/* 4xx Client Errors */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold">{lang === "km" ? "កំហុស 4xx (Client)" : "4xx Client Errors"}</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-300 tabular-nums">
              {stats.clientErrors}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600/80 dark:text-amber-400/80">
            {lang === "km" ? "Validation, Auth, Not Found" : "Auth, validation, resource missing"}
          </p>
        </div>

        {/* 5xx Server Errors */}
        <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span className="text-xs font-semibold">{lang === "km" ? "កំហុស 5xx (Server)" : "5xx Server Errors"}</span>
            <XCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-red-700 dark:text-red-300 tabular-nums">
              {stats.serverErrors}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-red-600/80 dark:text-red-400/80">
            {stats.serverErrors > 0 ? (lang === "km" ? "ត្រូវការដោះស្រាយជាបន្ទាន់" : "Immediate backend triage") : (lang === "km" ? "ប្រព័ន្ធដំណើរការធម្មតា" : "Healthy")}
          </p>
        </div>

        {/* Network / Client Drops */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold">{lang === "km" ? "ដាច់បណ្ដាញ / CORS" : "Network Drops (0)"}</span>
            <WifiOff className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.netErrors}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {lang === "km" ? "Client-observed drops / offline" : "Offline / CORS / abort"}
          </p>
        </div>
      </div>

      {/* Top Error Codes Breakdown */}
      {stats.topErrorCodes.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            {lang === "km" ? "ប្រភេទកំហុសដែលកើតមានច្រើនជាងគេ" : "Top Recurring Error Classifications"}
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.topErrorCodes.map((item) => (
              <div
                key={item.code}
                className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs dark:border-rose-900/60 dark:bg-rose-950/40"
              >
                <span className="font-mono font-bold text-rose-800 dark:text-rose-300">{item.code}</span>
                <span className="rounded-full bg-rose-200/80 px-2 py-0.2 font-mono text-[10px] font-bold text-rose-900 dark:bg-rose-900/80 dark:text-rose-200 tabular-nums">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remediation Guide & Diagnostic Tips */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
          <ExternalLink className="h-4 w-4 text-indigo-500" />
          <span>{lang === "km" ? "ការណែនាំដោះស្រាយបញ្ហា (Diagnostic Triage Guide)" : "Quick Remediation & Triage Guide"}</span>
        </h4>
        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-[11px] text-indigo-900 dark:text-indigo-300">
          <div className="rounded-xl bg-white/70 p-2.5 dark:bg-zinc-900/70">
            <strong className="font-mono text-amber-600 dark:text-amber-400">401 / 403 Security</strong>
            <p className="mt-0.5 text-slate-600 dark:text-zinc-400">
              Expired JWT, invalid bearer signature, or missing security role in Spring Security context.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 p-2.5 dark:bg-zinc-900/70">
            <strong className="font-mono text-amber-600 dark:text-amber-400">400 / 422 Validation</strong>
            <p className="mt-0.5 text-slate-600 dark:text-zinc-400">
              Request body violated Jakarta Bean Validation constraints (e.g. `@NotNull`, `@Pattern`, `@Size`).
            </p>
          </div>
          <div className="rounded-xl bg-white/70 p-2.5 dark:bg-zinc-900/70">
            <strong className="font-mono text-rose-600 dark:text-rose-400">500 Server Unhandled</strong>
            <p className="mt-0.5 text-slate-600 dark:text-zinc-400">
              Unhandled exception in service or JPA persistence layer. Inspect error code and stack trace.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar for Errors */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={errorSearch}
            onChange={(e) => setErrorSearch(e.target.value)}
            placeholder={lang === "km" ? "ស្វែងរកកំហុសតាមផ្លូវ, កូដកំហុស..." : "Search error path, code, message..."}
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setErrorTypeFilter("ALL")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              errorTypeFilter === "ALL" ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400"
            }`}
          >
            All Errors ({stats.totalErrors})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter("4xx")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              errorTypeFilter === "4xx" ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400"
            }`}
          >
            4xx ({stats.clientErrors})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter("5xx")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              errorTypeFilter === "5xx" ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400"
            }`}
          >
            5xx ({stats.serverErrors})
          </button>
          <button
            type="button"
            onClick={() => setErrorTypeFilter("net")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              errorTypeFilter === "net" ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400"
            }`}
          >
            Network ({stats.netErrors})
          </button>
        </div>
      </div>

      {/* Error Table */}
      {filteredErrors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-zinc-800">
          <Check className="h-8 w-8 text-emerald-500" />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-zinc-300">
            {lang === "km" ? "រកមិនឃើញកំហុសណាមួយឡើយ" : "No errors matching your criteria"}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            {lang === "km" ? "ប្រព័ន្ធដំណើរការបានយ៉ាងល្អឥតខ្ចោះ" : "The observed HTTP endpoints are executing smoothly."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" role="table" aria-label="Error Investigation Table">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:text-zinc-400">
                <tr>
                  <th className="py-3 pl-4 pr-2">Status</th>
                  <th className="px-2 py-3">Method</th>
                  <th className="px-3 py-3">Path & Error Code</th>
                  <th className="px-3 py-3">Message / Exception</th>
                  <th className="px-3 py-3">App / Action</th>
                  <th className="px-3 py-3">Request ID</th>
                  <th className="py-3 pl-2 pr-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {filteredErrors.map((event) => {
                  const isSelected = selectedEventId === event.id;
                  return (
                    <tr
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      tabIndex={0}
                      role="row"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectEvent(event);
                        }
                      }}
                      className={`group cursor-pointer transition-colors focus:outline-none focus:bg-rose-500/10 ${
                        isSelected
                          ? "bg-rose-500/10 dark:bg-rose-500/15"
                          : "hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <td className="py-2.5 pl-4 pr-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold ${
                            event.status >= 500
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400"
                              : event.status === 0
                              ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {event.status === 0 ? "NET_ERR" : event.status}
                        </span>
                      </td>

                      <td className="px-2 py-2.5 whitespace-nowrap font-mono text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                        {event.method}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-zinc-100">
                            {event.path}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            {event.errorCode || (event.status === 0 ? "NETWORK_FAILURE" : `HTTP_${event.status}`)}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 max-w-xs truncate text-[11px] text-slate-600 dark:text-zinc-400">
                        {event.errorMessage || event.outcome || "—"}
                      </td>

                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-slate-600 dark:text-zinc-400">
                            {event.clientApp || "external"}
                          </span>
                          {event.clientAction && (
                            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                              {event.clientAction}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[100px]">{event.requestId}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(event.requestId, event.id);
                            }}
                            className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                            title="Copy Request ID"
                          >
                            {copiedId === event.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 pl-2 pr-4 text-right">
                        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-zinc-600 dark:group-hover:text-zinc-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

