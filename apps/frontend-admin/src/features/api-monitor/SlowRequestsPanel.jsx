import { Clock, TrendingUp, AlertCircle } from "lucide-react";

export function SlowRequestsPanel({ topEndpoints, lang }) {
  if (!topEndpoints || topEndpoints.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center dark:border-zinc-800/80 dark:bg-zinc-900">
        <Clock className="mx-auto h-6 w-6 text-slate-300 dark:text-zinc-600" />
        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
          {lang === "km" ? "មិនទាន់មានទិន្នន័យស្ថិតិផ្លូវនៅឡើយទេ" : "No endpoint statistics recorded yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            {lang === "km" ? "ផ្លូវដែលត្រូវបានហៅញឹកញាប់ និងល្បឿនមធ្យម" : "Top Endpoints & Latency Profile"}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-zinc-500">
          {lang === "km" ? "តម្រៀបតាមចំនួនសំណើ" : "Sorted by request volume"}
        </span>
      </div>

      <div className="mt-4 divide-y divide-slate-100 dark:divide-zinc-800/60">
        {topEndpoints.map((ep, idx) => {
          const isHighLatency = ep.avgDurationMs >= 500;
          return (
            <div key={idx} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs">
              <div className="flex items-center gap-2.5 min-w-[200px]">
                <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-zinc-500 w-4">
                  #{idx + 1}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {ep.method}
                </span>
                <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                  {ep.pattern || "—"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">{lang === "km" ? "សំណើ" : "Calls"}:</span>{" "}
                  <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">{ep.count}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">{lang === "km" ? "មធ្យម" : "Avg"}:</span>{" "}
                  <span
                    className={`font-mono font-bold ${
                      isHighLatency
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-slate-800 dark:text-zinc-200"
                    }`}
                  >
                    {ep.avgDurationMs}ms
                  </span>
                </div>

                {ep.errorCount > 0 && (
                  <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-mono font-semibold">{ep.errorCount} err</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

