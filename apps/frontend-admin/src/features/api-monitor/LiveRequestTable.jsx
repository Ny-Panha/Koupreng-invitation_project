import { ChevronRight, Shield, Zap, AlertCircle } from "lucide-react";

function getStatusBadge(status) {
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

export function LiveRequestTable({ events, onSelectEvent, selectedEventId, lang }) {
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

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:text-zinc-400">
            <tr>
              <th className="py-3 pl-4 pr-2">{lang === "km" ? "ស្ថានភាព" : "Status"}</th>
              <th className="px-2 py-3">{lang === "km" ? "វិធី" : "Method"}</th>
              <th className="px-3 py-3">{lang === "km" ? "ផ្លូវ & គោលដៅ" : "Path & Route"}</th>
              <th className="px-3 py-3">{lang === "km" ? "កម្មវិធី & សកម្មភាព" : "App / Action"}</th>
              <th className="px-3 py-3 text-right">{lang === "km" ? "ថេរវេលា" : "Duration"}</th>
              <th className="px-3 py-3">{lang === "km" ? "អ្នកប្រើ" : "User / Role"}</th>
              <th className="px-3 py-3">{lang === "km" ? "ម៉ោង" : "Time"}</th>
              <th className="py-3 pl-2 pr-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-sans">
            {events.map((event) => {
              const isSelected = selectedEventId === event.id;
              return (
                <tr
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-amber-500/10 dark:bg-amber-500/15"
                      : "hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {/* Status */}
                  <td className="py-2.5 pl-4 pr-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-lg border px-2 py-0.5 font-mono text-[11px] font-bold ${getStatusBadge(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  </td>

                  {/* Method */}
                  <td className="px-2 py-2.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${getMethodBadge(
                        event.method
                      )}`}
                    >
                      {event.method}
                    </span>
                  </td>

                  {/* Path & Pattern */}
                  <td className="px-3 py-2.5 min-w-[200px] max-w-[360px]">
                    <div className="flex flex-col">
                      <span className="truncate font-mono font-medium text-slate-800 dark:text-zinc-200" title={event.target || event.path}>
                        {event.path}
                      </span>
                      {event.matchedPattern && event.matchedPattern !== event.path && (
                        <span className="truncate font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                          {event.matchedPattern}
                        </span>
                      )}
                      {event.errorCode && (
                        <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-rose-600 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {event.errorCode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* App & Action */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`inline-flex w-fit items-center rounded border px-1.5 py-0.2 text-[10px] font-medium ${getAppBadge(
                          event.clientApp
                        )}`}
                      >
                        {event.clientApp || "external"}
                      </span>
                      {event.clientAction && (
                        <span className="font-mono text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
                          {event.clientAction}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        event.slow
                          ? "rounded bg-orange-100 px-1.5 py-0.5 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                          : event.durationMs < 100
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {event.durationMs}ms
                    </span>
                  </td>

                  {/* User / Role */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex flex-col text-[11px]">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {event.userPrincipal || "anonymous"}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {event.userRole || "ANONYMOUS"}
                      </span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[11px] text-slate-400 dark:text-zinc-500">
                    {formatTime(event.timestamp)}
                  </td>

                  {/* Action */}
                  <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      aria-label="Inspect request"
                      className="rounded-lg p-1 text-slate-400 opacity-60 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
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

