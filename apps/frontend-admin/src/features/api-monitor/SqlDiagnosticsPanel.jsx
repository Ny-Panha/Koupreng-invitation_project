import { useMemo, useState } from "react";
import { Database, AlertTriangle, CheckCircle, Info, ChevronRight, Search, ShieldCheck } from "lucide-react";

export function SqlDiagnosticsPanel({ events, onSelectEvent, selectedEventId, lang }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [nPlusOneOnly, setNPlusOneOnly] = useState(false);

  const stats = useMemo(() => {
    let totalQueries = 0;
    let nPlusOneCount = 0;
    let requestsWithSql = 0;

    for (const ev of events || []) {
      const qCount = ev.sqlQueryCount || 0;
      if (qCount > 0) {
        totalQueries += qCount;
        requestsWithSql++;
      }
      if (ev.nPlusOneDetected) {
        nPlusOneCount++;
      }
    }

    const avgQueries = requestsWithSql > 0 ? (totalQueries / requestsWithSql).toFixed(1) : "0.0";
    return { totalQueries, nPlusOneCount, requestsWithSql, avgQueries };
  }, [events]);

  const sqlEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (events || [])
      .filter((ev) => (ev.sqlQueryCount || 0) > 0 || ev.nPlusOneDetected)
      .filter((ev) => {
        if (nPlusOneOnly && !ev.nPlusOneDetected) return false;
        if (q) {
          const match =
            ev.path?.toLowerCase().includes(q) ||
            ev.method?.toLowerCase().includes(q) ||
            ev.requestId?.toLowerCase().includes(q) ||
            ev.controller?.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });
  }, [events, searchTerm, nPlusOneOnly]);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total SQL Statements */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold">{lang === "km" ? "សំណួរ SQL សរុប" : "Total SQL Queries"}</span>
            <Database className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.totalQueries}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {stats.requestsWithSql} {lang === "km" ? "សំណើមានការសួរទិន្នន័យ" : "requests triggered DB queries"}
          </p>
        </div>

        {/* N+1 Warnings */}
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold">{lang === "km" ? "ទម្រង់ N+1 រកឃើញ" : "N+1 Query Patterns"}</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-300 tabular-nums">
              {stats.nPlusOneCount}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-400/80">
            {stats.nPlusOneCount > 0 ? (lang === "km" ? "ទាមទារការកែលម្អ JOIN FETCH" : "Needs JPA JOIN FETCH / EntityGraph") : (lang === "km" ? "គ្មានបញ្ហា N+1" : "No N+1 detected")}
          </p>
        </div>

        {/* Average Queries per DB Request */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold">{lang === "km" ? "មធ្យមភាគ / សំណើ" : "Avg Queries / Request"}</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.avgQueries}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {lang === "km" ? "សម្រាប់សំណើដែលចូល DB" : "For DB-active requests"}
          </p>
        </div>

        {/* Hibernate Statement Tracking Standard */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold">{lang === "km" ? "ស្តង់ដារត្រួតពិនិត្យ" : "Tracking Mechanism"}</span>
            <Info className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
              Hibernate StatementInspector
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            100% exact AST query count & template tracking
          </p>
        </div>
      </div>

      {/* Observability Architecture Notice */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold">
              {lang === "km" ? "ការកត់សម្គាល់អំពីការវាស់វែងថេរវេលា SQL" : "Observability Invariant: Statement Timing vs Count"}
            </strong>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Hibernate’s <code className="font-mono font-semibold">StatementInspector</code> intercepts queries during SQL string generation in the ORM layer. It accurately monitors the exact number of statements and detects repeated N+1 AST templates without fabricating execution roundtrip duration. Accurate per-query JDBC duration requires an external JDBC proxy wrapper (e.g. p6spy or datasource-proxy).
            </p>
          </div>
        </div>
      </div>

      {/* JPA N+1 Optimization Recipes */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
          {lang === "km" ? "វិធីសាស្ត្រដោះស្រាយ និងកែលម្អ N+1 (JPA Optimization Patterns)" : "JPA N+1 Mitigation Patterns"}
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-800/40">
            <span className="font-bold text-slate-800 dark:text-zinc-200">1. JPQL JOIN FETCH</span>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-400">
              Eagerly fetch associated collections or parent entities in a single inner/left join:
            </p>
            <code className="mt-1.5 block rounded bg-slate-200/60 p-1.5 font-mono text-[10px] text-slate-800 dark:bg-zinc-900 dark:text-zinc-200">
              SELECT i FROM Invitation i JOIN FETCH i.events WHERE i.id = :id
            </code>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-800/40">
            <span className="font-bold text-slate-800 dark:text-zinc-200">2. @EntityGraph</span>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-400">
              Declare fetch graph on Spring Data repository methods dynamically without query rewriting:
            </p>
            <code className="mt-1.5 block rounded bg-slate-200/60 p-1.5 font-mono text-[10px] text-slate-800 dark:bg-zinc-900 dark:text-zinc-200">
              @EntityGraph(attributePaths = &quot;weddingDetails&quot;) Optional&lt;Invitation&gt; findBySlug(String s);
            </code>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-800/40">
            <span className="font-bold text-slate-800 dark:text-zinc-200">3. @BatchSize</span>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-400">
              Configure batch loading on lazy collection fields to transform N separate selects into batched IN clauses:
            </p>
            <code className="mt-1.5 block rounded bg-slate-200/60 p-1.5 font-mono text-[10px] text-slate-800 dark:bg-zinc-900 dark:text-zinc-200">
              @BatchSize(size = 25) @OneToMany(...)
            </code>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === "km" ? "ស្វែងរកសំណើដែលមាន SQL..." : "Search SQL requests by path, controller..."}
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <label className="flex cursor-pointer select-none items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <input
            type="checkbox"
            checked={nPlusOneOnly}
            onChange={(e) => setNPlusOneOnly(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500 dark:border-rose-700"
          />
          <span>{lang === "km" ? "ត្រងយកតែ N+1 Warnings" : "N+1 Warnings Only"}</span>
        </label>
      </div>

      {/* SQL Requests Table */}
      {sqlEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-zinc-800">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-zinc-300">
            {lang === "km" ? "មិនទាន់មានសំណើដែលដំណើរការ SQL query ឡើយ" : "No SQL-active requests matching filter"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" role="table" aria-label="SQL Statements Table">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:text-zinc-400">
                <tr>
                  <th className="py-3 pl-4 pr-2">Queries</th>
                  <th className="px-2 py-3">Method</th>
                  <th className="px-3 py-3">Path & Pattern</th>
                  <th className="px-3 py-3">Spring Controller</th>
                  <th className="px-3 py-3 text-right">Server Latency</th>
                  <th className="px-3 py-3">N+1 Diagnosis</th>
                  <th className="py-3 pl-2 pr-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {sqlEvents.map((event) => {
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
                      className={`group cursor-pointer transition-colors focus:outline-none focus:bg-amber-500/10 ${
                        isSelected
                          ? "bg-amber-500/10 dark:bg-amber-500/15"
                          : "hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <td className="py-2.5 pl-4 pr-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold tabular-nums ${
                            event.nPlusOneDetected
                              ? "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                              : "bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800"
                          }`}
                        >
                          <Database className="h-3 w-3" />
                          <span>{event.sqlQueryCount} sql</span>
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
                          {event.matchedPattern && (
                            <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                              {event.matchedPattern}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400 max-w-xs truncate">
                        {event.controller || "Spring Controller"}
                      </td>

                      <td className="px-3 py-2.5 text-right whitespace-nowrap font-mono font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
                        {event.durationMs}ms
                      </td>

                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {event.nPlusOneDetected ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-800 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                            <AlertTriangle className="h-3 w-3" />
                            POTENTIAL_N_PLUS_ONE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <CheckCircle className="h-3 w-3" />
                            OPTIMAL
                          </span>
                        )}
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

