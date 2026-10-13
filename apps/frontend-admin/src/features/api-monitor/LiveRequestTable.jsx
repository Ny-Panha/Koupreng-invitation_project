import { useState, useMemo } from "react";
import { ChevronRight, Shield, Zap, Database, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check, LayoutGrid, Rows } from "lucide-react";
import { validateApiContract } from "./apiContractValidator";

function getStatusBadge(status) {
  if (status === 0) {
    return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700";
  }
  if (status >= 200 && status < 300) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60";
  }
  if (status >= 300 && status < 400) {
    return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60";
  }
  if (status >= 400 && status < 500) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60";
  }
  return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60";
}

function getMethodBadge(method) {
  switch (method?.toUpperCase()) {
    case "GET":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
    case "POST":
      return "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800/60";
    case "PUT":
    case "PATCH":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
    case "DELETE":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/60";
    default:
      return "bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700";
  }
}

function getAppBadge(app) {
  if (app?.includes("user")) {
    return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60";
  }
  if (app?.includes("admin")) {
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60";
  }
  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
}

function formatTime(isoString) {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return isoString;
  }
}

function HighlightText({ text, query }) {
  if (!text || !query?.trim()) return text ?? "";
  const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-amber-200 px-0.5 font-bold text-amber-950 dark:bg-amber-800/80 dark:text-amber-100">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function LiveRequestTable({
  events,
  onSelectEvent,
  onFilterByAction,
  selectedEventId,
  searchQuery = "",
  lang,
}) {
  const [density, setDensity] = useState("comfortable"); // 'compact' | 'comfortable'
  const [sortField, setSortField] = useState("timestamp"); // 'status' | 'method' | 'path' | 'duration' | 'sql' | 'timestamp'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [copiedId, setCopiedId] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    return [...events].sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "status":
          valA = a.status ?? 0;
          valB = b.status ?? 0;
          break;
        case "method":
          valA = a.method || "";
          valB = b.method || "";
          break;
        case "path":
          valA = a.path || "";
          valB = b.path || "";
          break;
        case "duration":
          valA = a.durationMs ?? 0;
          valB = b.durationMs ?? 0;
          break;
        case "sql":
          valA = a.sqlQueryCount ?? 0;
          valB = b.sqlQueryCount ?? 0;
          break;
        case "timestamp":
        default:
          valA = new Date(a.timestamp || 0).getTime();
          valB = new Date(b.timestamp || 0).getTime();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [events, sortField, sortOrder]);

  const handleCopyCurl = (event, e) => {
    e.stopPropagation();
    const curl = `curl -X ${event.method} "${window.location.origin}${event.path}" -H "X-Request-Id: ${event.requestId}"`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(curl);
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-zinc-800">
        <Zap className="h-8 w-8 text-slate-300 dark:text-zinc-600" />
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-300">
          {lang === "km" ? "មិនទាន់មានសំណើ HTTP នៅឡើយទេ" : "No HTTP requests observed yet"}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
          {lang === "km"
            ? "សូមធ្វើសកម្មភាពនៅលើ User Web ឬ Admin Dashboard ដើម្បីមើលឃើញទិន្នន័យជាក់ស្ដែងភ្លាមៗ"
            : "Perform actions in User Web or Admin Dashboard to see real-time requests streamed here."}
        </p>
      </div>
    );
  }

  const isCompact = density === "compact";
  const rowPadding = isCompact ? "py-1.5" : "py-2.5";

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-80" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-amber-500 font-bold" />
    ) : (
      <ArrowDown className="h-3 w-3 text-amber-500 font-bold" />
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
      {/* Table Top Controls: Density & Sorter Info */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-2 text-xs dark:border-zinc-800/60 dark:bg-zinc-800/30">
        <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
          {sortedEvents.length} {lang === "km" ? "សំណើបានកត់ត្រា" : "requests recorded"}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                density === "comfortable"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              title="Comfortable row density"
            >
              <Rows className="h-3 w-3 inline mr-1" />
              <span>Comfortable</span>
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                density === "compact"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              title="Compact row density"
            >
              <LayoutGrid className="h-3 w-3 inline mr-1" />
              <span>Compact</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" role="table" aria-label="Live HTTP Requests">
          <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:text-zinc-400 select-none">
            <tr>
              <th
                onClick={() => handleSort("status")}
                className="group cursor-pointer py-2.5 pl-4 pr-2 hover:text-slate-900 dark:hover:text-zinc-100"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === "km" ? "ស្ថានភាព" : "Status"}</span>
                  {renderSortIndicator("status")}
                </div>
              </th>
              <th
                onClick={() => handleSort("method")}
                className="group cursor-pointer px-2 py-2.5 hover:text-slate-900 dark:hover:text-zinc-100"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === "km" ? "វិធី" : "Method"}</span>
                  {renderSortIndicator("method")}
                </div>
              </th>
              <th
                onClick={() => handleSort("path")}
                className="group cursor-pointer px-3 py-2.5 hover:text-slate-900 dark:hover:text-zinc-100"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === "km" ? "ផ្លូវ & គោលដៅ" : "Path & Contract"}</span>
                  {renderSortIndicator("path")}
                </div>
              </th>
              <th className="px-3 py-2.5">{lang === "km" ? "កម្មវិធី & សកម្មភាព" : "App / Action ID"}</th>
              <th
                onClick={() => handleSort("duration")}
                className="group cursor-pointer px-3 py-2.5 text-right hover:text-slate-900 dark:hover:text-zinc-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{lang === "km" ? "ថេរវេលា & SQL" : "Duration & SQL"}</span>
                  {renderSortIndicator("duration")}
                </div>
              </th>
              <th className="px-3 py-2.5">{lang === "km" ? "អ្នកប្រើ" : "User / Role"}</th>
              <th
                onClick={() => handleSort("timestamp")}
                className="group cursor-pointer px-3 py-2.5 hover:text-slate-900 dark:hover:text-zinc-100"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === "km" ? "ម៉ោង" : "Time"}</span>
                  {renderSortIndicator("timestamp")}
                </div>
              </th>
              <th className="py-2.5 pl-2 pr-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-sans">
            {sortedEvents.map((event) => {
              const isSelected = selectedEventId === event.id;
              const contract = validateApiContract(event.method, event.path);

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
                  className={`group cursor-pointer transition-colors focus:outline-none focus:bg-amber-500/10 motion-reduce:transition-none ${
                    isSelected
                      ? "bg-amber-500/10 dark:bg-amber-500/15"
                      : "hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {/* Status */}
                  <td className={`${rowPadding} pl-4 pr-2 whitespace-nowrap`}>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${getStatusBadge(
                        event.status
                      )}`}
                    >
                      {event.status === 0 ? "NET_ERR" : event.status}
                    </span>
                  </td>

                  {/* Method */}
                  <td className={`px-2 ${rowPadding} whitespace-nowrap`}>
                    <span
                      className={`inline-flex rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold ${getMethodBadge(
                        event.method
                      )}`}
                    >
                      {event.method}
                    </span>
                  </td>

                  {/* Path & OpenAPI Contract Badge */}
                  <td className={`px-3 ${rowPadding}`}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-100">
                          <HighlightText text={event.path} query={searchQuery} />
                        </span>
                        {/* Contract Badge */}
                        <span
                          className={`inline-flex rounded px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                            contract.status === "MATCHED"
                              ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : contract.status === "COMPATIBILITY_ALIAS"
                              ? "bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                          title={`OpenAPI Spec: ${contract.status} (${contract.tag})`}
                        >
                          {contract.status === "MATCHED" ? "OpenAPI" : contract.status === "COMPATIBILITY_ALIAS" ? "Alias" : "Untracked"}
                        </span>
                        {event.source === "CLIENT_OBSERVED" && (
                          <span className="rounded bg-rose-100 px-1 py-0.2 font-mono text-[9px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            Client Net Err
                          </span>
                        )}
                      </div>
                      {event.matchedPattern && event.matchedPattern !== event.path && (
                        <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                          {event.matchedPattern}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* App & Action Context */}
                  <td className={`px-3 ${rowPadding} whitespace-nowrap`}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium ${getAppBadge(
                            event.clientApp
                          )}`}
                        >
                          {event.clientApp || "external"}
                        </span>
                        {event.clientAction && (
                          <span className="font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            {event.clientAction}
                          </span>
                        )}
                      </div>
                      {event.actionId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFilterByAction) onFilterByAction(event.actionId);
                          }}
                          className="text-left font-mono text-[10px] text-slate-400 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-amber-400"
                          title="Click to filter by action"
                        >
                          {event.actionId}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Duration & Dev SQL Count */}
                  <td className={`px-3 ${rowPadding} text-right whitespace-nowrap`}>
                    <div className="flex flex-col items-end gap-0.5 font-mono text-xs">
                      <div className="flex items-center gap-1">
                        {event.slow && <span className="text-amber-500 font-bold" title="Slow request (>=500ms)">⚡</span>}
                        <span
                          className={`font-semibold tabular-nums ${
                            event.slow
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-800 dark:text-zinc-200"
                          }`}
                        >
                          {event.durationMs}ms
                        </span>
                      </div>
                      {event.sqlQueryCount > 0 && (
                        <div
                          className={`flex items-center gap-1 text-[10px] tabular-nums ${
                            event.nPlusOneDetected
                              ? "rounded bg-rose-100 px-1 py-0.2 font-bold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              : "text-slate-400 dark:text-zinc-500"
                          }`}
                          title={event.nPlusOneDetected ? "POTENTIAL_N_PLUS_ONE detected" : `${event.sqlQueryCount} SQL queries`}
                        >
                          <Database className="h-2.5 w-2.5" />
                          <span>
                            {event.sqlQueryCount} sql
                            {event.nPlusOneDetected && " (N+1!)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* User / Principal */}
                  <td className={`px-3 ${rowPadding} whitespace-nowrap`}>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-zinc-300">
                      {event.authenticated && <Shield className="h-3 w-3 text-emerald-500" />}
                      <span className="truncate max-w-[120px]">
                        {event.userPrincipal || "anonymous"}
                      </span>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className={`px-3 ${rowPadding} whitespace-nowrap font-mono text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums`}>
                    {formatTime(event.timestamp)}
                  </td>

                  {/* Actions: Copy cURL & Chevron */}
                  <td className={`${rowPadding} pl-2 pr-4 text-right whitespace-nowrap`}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleCopyCurl(event, e)}
                        className="rounded p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200/60 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition"
                        title="Copy as cURL"
                      >
                        {copiedId === event.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-zinc-600 dark:group-hover:text-zinc-300" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
