import { useMemo } from "react";
import { EVENT_CATEGORIES } from "../reportConstants";

export default function CategoryBreakdownSection({
  categoryBreakdown = [],
  selectedCategory = null,
  onSelectCategory = () => {},
  lang = "km",
}) {
  // Merge authoritative backend breakdown with EVENT_CATEGORIES metadata
  const categoryStats = useMemo(() => {
    const backendMap = new Map();
    if (Array.isArray(categoryBreakdown)) {
      categoryBreakdown.forEach((item) => {
        const catKey = String(item.category || item.key || "").toUpperCase();
        backendMap.set(catKey, {
          total: Number(item.total ?? item.count ?? 0),
          published: Number(item.published ?? 0),
          draft: Number(item.draft ?? 0),
          publishRate: Number(item.publishRate ?? 0),
        });
      });
    }

    const totalAll = Array.from(backendMap.values()).reduce((sum, c) => sum + c.total, 0) || 1;

    return EVENT_CATEGORIES.map((cat) => {
      const stats = backendMap.get(cat.key) || { total: 0, published: 0, draft: 0, publishRate: 0 };
      const percent = totalAll > 0 ? Math.round((stats.total / totalAll) * 100) : 0;
      const publishRate =
        stats.total > 0
          ? stats.publishRate || Math.round((stats.published / stats.total) * 100)
          : 0;

      return {
        ...cat,
        total: stats.total,
        published: stats.published,
        draft: stats.draft,
        publishRate,
        percent,
      };
    });
  }, [categoryBreakdown]);

  const totalEvents = useMemo(
    () => categoryStats.reduce((sum, c) => sum + c.total, 0),
    [categoryStats]
  );

  // Compute SVG Donut Slices (Circumference: 2 * PI * 60 ~= 376.99)
  const donutSlices = useMemo(() => {
    if (totalEvents === 0) return [];
    const C = 2 * Math.PI * 60;
    let accumulated = 0;
    return categoryStats
      .filter((cat) => cat.total > 0)
      .map((cat) => {
        const fraction = cat.total / totalEvents;
        const dashLength = fraction * C;
        const dashSpace = C - dashLength;
        const dashOffset = -accumulated;
        accumulated += dashLength;
        return {
          key: cat.key,
          color: cat.color,
          dashLength,
          dashSpace,
          dashOffset,
        };
      });
  }, [categoryStats, totalEvents]);

  return (
    <div className="card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {lang === "en" ? "Event Categories & Distribution" : "ការបែងចែកតាមប្រភេទកម្មវិធី"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {lang === "en"
              ? "Authoritative breakdown across all 6 celebration types: totals, published counts, and publish rates"
              : "ទិន្នន័យជាក់ស្តែងលើគ្រប់ ៦ ប្រភេទកម្មវិធី៖ ចំនួនសរុប បានផ្សាយ ព្រាង និងអត្រាផ្សាយ (%)"}
          </p>
        </div>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            {lang === "en" ? "Clear Filter" : "ជម្រះការជ្រើសរើស"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Donut Chart (Print-safe, high contrast) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-zinc-800/80 analytics-chart">
          <div className="relative w-44 h-44">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                className="text-slate-100 dark:text-zinc-800"
              />
              {donutSlices.map((slice) => (
                <circle
                  key={slice.key}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="20"
                  strokeDasharray={`${slice.dashLength} ${slice.dashSpace}`}
                  strokeDashoffset={slice.dashOffset}
                  className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  onClick={() => onSelectCategory(slice.key)}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                {totalEvents}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                {lang === "en" ? "Total Events" : "កម្មវិធីសរុប"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categoryStats.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelectCategory(selectedCategory === cat.key ? null : cat.key)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  selectedCategory === cat.key
                    ? "ring-2 ring-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{lang === "en" ? cat.subLabel : cat.label}</span>
                <span className="text-slate-400">({cat.total})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categoryStats.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <div
                key={cat.key}
                onClick={() => onSelectCategory(isSelected ? null : cat.key)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                  isSelected
                    ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5"
                    : "border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {lang === "en" ? cat.subLabel : cat.label}
                      </h4>
                      <p className="text-[10px] text-slate-400">{cat.key}</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-zinc-100">
                    {cat.total}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>{lang === "en" ? "Publish rate" : "អត្រាផ្សាយ"}</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-200">
                      {cat.publishRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cat.barColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, cat.publishRate))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/60 pt-2">
                  <span>
                    {lang === "en" ? "Published:" : "បានផ្សាយ:"}{" "}
                    <strong className="text-emerald-600">{cat.published}</strong>
                  </span>
                  <span>
                    {lang === "en" ? "Drafts:" : "ព្រាង:"}{" "}
                    <strong className="text-slate-600 dark:text-zinc-300">{cat.draft}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

