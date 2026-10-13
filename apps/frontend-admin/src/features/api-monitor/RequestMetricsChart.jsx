import { useMemo } from "react";
import { Activity, Gauge, BarChart2 } from "lucide-react";

export function RequestMetricsChart({ events, stats, lang }) {
  // Compute time buckets for RPM sparkline (last 10 buckets of 10-second intervals)
  const rpmPoints = useMemo(() => {
    if (!events || events.length === 0) return [];

    const now = Date.now();
    const bucketCount = 12;
    const bucketIntervalMs = 5000; // 5-second slices
    const buckets = new Array(bucketCount).fill(0);

    for (const ev of events) {
      const evTime = new Date(ev.timestamp).getTime();
      const ageMs = now - evTime;
      const index = Math.floor(ageMs / bucketIntervalMs);
      if (index >= 0 && index < bucketCount) {
        buckets[bucketCount - 1 - index]++;
      }
    }

    const maxVal = Math.max(...buckets, 1);
    const width = 240;
    const height = 48;
    const stepX = width / (bucketCount - 1);

    const coords = buckets.map((count, i) => {
      const x = i * stepX;
      const y = height - (count / maxVal) * (height - 8) - 4;
      return { x, y, count };
    });

    const pathD = coords.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");

    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    return { coords, pathD, areaD, currentRpm: buckets[bucketCount - 1] * 12 };
  }, [events]);

  const total = stats?.totalRequests || 0;
  const successCount = stats?.successCount || 0;
  const clientErrCount = stats?.clientErrorCount || 0;
  const serverErrCount = stats?.serverErrorCount || 0;

  const successPct = total > 0 ? (successCount / total) * 100 : 100;
  const clientErrPct = total > 0 ? (clientErrCount / total) * 100 : 0;
  const serverErrPct = total > 0 ? (serverErrCount / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 1. Live Traffic Velocity / RPM Sparkline */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {lang === "km" ? "ល្បឿនសំណើ (Request Rate / RPM)" : "Live Traffic Rate"}
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
            {rpmPoints.currentRpm || 0} req/m
          </span>
        </div>

        {/* SVG Sparkline */}
        <div className="mt-3 h-14 w-full">
          <svg viewBox="0 0 240 48" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="rpmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {rpmPoints.areaD && (
              <path d={rpmPoints.areaD} fill="url(#rpmGradient)" />
            )}
            {rpmPoints.pathD && (
              <path
                d={rpmPoints.pathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {rpmPoints.coords?.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="2.5"
                className="fill-amber-500 hover:r-4 transition-all"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 2. Latency Health & SLA Profile */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-sky-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {lang === "km" ? "ថេរវេលា & សុខភាព (Latency & p95)" : "Latency Profile"}
            </span>
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">
            Avg: <strong className="text-slate-800 dark:text-zinc-200">{stats?.avgDurationMs || 0}ms</strong>
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500">
              {lang === "km" ? "ថេរវេលាទី ៩៥% (p95 SLA)" : "95th Percentile"}
            </div>
            <div className="font-mono text-xl font-bold text-sky-600 dark:text-sky-400">
              {stats?.p95DurationMs || 0}
              <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 dark:text-zinc-500">
              {lang === "km" ? "សំណើយឺត (Slow > 500ms)" : "Slow Requests"}
            </div>
            <div className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
              {stats?.slowRequestsCount || 0}
            </div>
          </div>
        </div>

        {/* Progress Bar Gauge */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
          <div
            style={{ width: `${Math.min(100, ((stats?.avgDurationMs || 0) / 500) * 100)}%` }}
            className={`h-full rounded-full transition-all ${
              (stats?.avgDurationMs || 0) > 300 ? "bg-amber-500" : "bg-sky-500"
            }`}
          />
        </div>
      </div>

      {/* 3. HTTP Outcome Distribution */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {lang === "km" ? "លទ្ធផល HTTP Status" : "Status Distribution"}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {total > 0 ? Math.round(successPct) : 100}% OK
          </span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
          <div
            style={{ width: `${successPct}%` }}
            className="bg-emerald-500 transition-all"
            title={`2xx Success: ${successCount}`}
          />
          <div
            style={{ width: `${clientErrPct}%` }}
            className="bg-amber-500 transition-all"
            title={`4xx Client Errors: ${clientErrCount}`}
          />
          <div
            style={{ width: `${serverErrPct}%` }}
            className="bg-rose-500 transition-all"
            title={`5xx Server Errors: ${serverErrCount}`}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>2xx: {successCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>4xx: {clientErrCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>5xx: {serverErrCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

