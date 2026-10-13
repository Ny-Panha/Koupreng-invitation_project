import { useMemo, useState } from "react";
import { Clock, Layers, ArrowRight, Database, AlertTriangle, ExternalLink } from "lucide-react";

function getStatusColor(status) {
  if (status >= 200 && status < 300) return "bg-emerald-500 hover:bg-emerald-600";
  if (status >= 300 && status < 400) return "bg-sky-500 hover:bg-sky-600";
  if (status >= 400 && status < 500) return "bg-amber-500 hover:bg-amber-600";
  return "bg-rose-500 hover:bg-rose-600";
}

export function RequestWaterfall({ events, onSelectEvent, selectedEventId, lang }) {
  const [groupByAction, setGroupByAction] = useState(true);

  // Take chronological slice of events (oldest to newest for timeline presentation)
  const sortedEvents = useMemo(() => {
    return [...events]
      .reverse()
      .slice(-40); // show up to 40 most recent events in waterfall
  }, [events]);

  const timelineStats = useMemo(() => {
    if (sortedEvents.length === 0) return { minTime: 0, maxTime: 0, totalWindowMs: 1 };

    const times = sortedEvents.map((e) => new Date(e.timestamp).getTime());
    const minTime = Math.min(...times);
    // Find maximum endpoint = start timestamp + max(durationMs, clientDurationMs)
    const endTimes = sortedEvents.map((e) => {
      const dur = Math.max(e.durationMs || 0, e.clientDurationMs || 0, 10);
      return new Date(e.timestamp).getTime() + dur;
    });
    const maxTime = Math.max(...endTimes);
    const totalWindowMs = Math.max(100, maxTime - minTime);

    return { minTime, maxTime, totalWindowMs };
  }, [sortedEvents]);

  // Group events by actionId if enabled
  const actionGroups = useMemo(() => {
    if (!groupByAction) {
      return [{ actionId: "chronological", actionName: "All Requests", events: sortedEvents }];
    }

    const groups = new Map();
    for (const ev of sortedEvents) {
      const key = ev.actionId || "no-action";
      const name = ev.clientAction || (ev.actionId ? ev.actionId : "Direct / Standalone Requests");
      if (!groups.has(key)) {
        groups.set(key, { actionId: key, actionName: name, events: [] });
      }
      groups.get(key).events.push(ev);
    }
    return Array.from(groups.values());
  }, [sortedEvents, groupByAction]);

  if (!sortedEvents || sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-zinc-800">
        <Clock className="h-8 w-8 text-slate-300 dark:text-zinc-600" />
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-300">
          {lang === "km" ? "មិនទាន់មានទិន្នន័យសម្រាប់គំនូសតាង Waterfall នៅឡើយទេ" : "No requests available for Waterfall view"}
        </p>
      </div>
    );
  }

  const { minTime, totalWindowMs } = timelineStats;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200">
            {lang === "km" ? "គំនូសតាងលំដាប់សំណើ (Interactive Request Waterfall)" : "Interactive Request Waterfall & Action Groups"}
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
            {sortedEvents.length} {lang === "km" ? "សំណើ" : "traces"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="flex cursor-pointer items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={groupByAction}
              onChange={(e) => setGroupByAction(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <span className="text-[11px] font-medium">
              {lang === "km" ? "បែងចែកតាមសកម្មភាព (Group by Action ID)" : "Group by Action ID"}
            </span>
          </label>
        </div>
      </div>

      {/* Waterfall Body */}
      <div className="mt-4 space-y-5">
        {actionGroups.map((group) => (
          <div key={group.actionId} className="space-y-1.5">
            {groupByAction && (
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                <ArrowRight className="h-3 w-3 text-amber-500" />
                <span className="font-mono text-slate-800 dark:text-zinc-200">{group.actionName}</span>
                {group.actionId !== "no-action" && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {group.actionId}
                  </span>
                )}
                <span className="text-[10px] text-slate-400">({group.events.length} calls)</span>
              </div>
            )}

            <div className="space-y-1">
              {group.events.map((event) => {
                const eventStart = new Date(event.timestamp).getTime();
                const offsetMs = Math.max(0, eventStart - minTime);
                const leftPercent = Math.min(95, Math.max(0, (offsetMs / totalWindowMs) * 100));

                const dur = Math.max(10, event.durationMs || event.clientDurationMs || 10);
                const widthPercent = Math.max(2, Math.min(100 - leftPercent, (dur / totalWindowMs) * 100));

                const isSelected = selectedEventId === event.id;

                return (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={`group relative flex cursor-pointer items-center rounded-lg py-1 px-2 text-xs transition-colors ${
                      isSelected
                        ? "bg-amber-500/10 ring-1 ring-amber-500/30 dark:bg-amber-500/15"
                        : "hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    {/* Method & Path Tag */}
                    <div className="w-56 shrink-0 truncate pr-2">
                      <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                        {event.method}
                      </span>{" "}
                      <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400" title={event.path}>
                        {event.path}
                      </span>
                    </div>

                    {/* Timeline Bar Track */}
                    <div className="relative h-6 flex-1 rounded bg-slate-100/70 dark:bg-zinc-800/50">
                      <div
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        className={`absolute top-1 bottom-1 flex items-center justify-between rounded px-1.5 transition-all shadow-xs ${getStatusColor(
                          event.status
                        )}`}
                        title={`${event.method} ${event.path} — Status: ${event.status}, Server: ${event.durationMs}ms${
                          event.clientDurationMs ? `, Client: ${event.clientDurationMs}ms` : ""
                        }`}
                      >
                        <span className="truncate text-[10px] font-bold text-white drop-shadow-xs">
                          {event.status} {event.durationMs}ms
                        </span>
                      </div>
                    </div>

                    {/* Badges / Extra Metrics on Right */}
                    <div className="ml-3 flex w-36 shrink-0 items-center justify-end gap-1.5 text-right font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                      {event.sqlQueryCount > 0 && (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 ${
                            event.nPlusOneDetected
                              ? "bg-rose-100 text-rose-700 font-bold dark:bg-rose-950/60 dark:text-rose-400"
                              : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                          title={event.nPlusOneDetected ? "Potential N+1 Query Warning" : `${event.sqlQueryCount} SQL Queries`}
                        >
                          <Database className="h-2.5 w-2.5" />
                          <span>{event.sqlQueryCount}</span>
                          {event.nPlusOneDetected && "!"}
                        </span>
                      )}
                      <span>+{offsetMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

