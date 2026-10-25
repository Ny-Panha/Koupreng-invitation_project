import { RefreshCw, AlertCircle, Inbox } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

export { AnimatedNumber };

export function AdminPageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-cascade" style={{ animationDelay: "0.04s" }}>
      <div className="animate-zoom-in" style={{ animationDelay: "0.06s" }}>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 animate-text-reveal" style={{ animationDelay: "0.04s" }}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 leading-normal animate-text-reveal" style={{ animationDelay: "0.08s" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 animate-text-reveal" style={{ animationDelay: "0.14s" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap animate-zoom-in" style={{ animationDelay: "0.16s" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "amber",
  trend,
  badge,
  progress,
  className = "animate-cascade",
  style = {},
}) {
  const toneClasses = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20",
  };

  const selectedTone = toneClasses[tone] || toneClasses.amber;
  const displayValue =
    typeof value === "number" ? <AnimatedNumber value={value} /> : (value ?? "—");

  return (
    <article
      style={style}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs dark:border-zinc-850 dark:bg-[#111114]/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/40 cursor-default ${className}`.trim()}
    >
      {/* Top subtle rim highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-200/60 dark:via-white/10 to-transparent" />
      
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate animate-text-reveal" style={{ animationDelay: "0.08s" }}>
          {label}
        </span>
        {Icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${selectedTone} transition-all duration-300 group-hover:scale-110 shadow-xs animate-zoom-in`} style={{ animationDelay: "0.10s" }}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-2">
        <strong className="block text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400 animate-text-reveal" style={{ animationDelay: "0.14s" }}>
          {displayValue}
        </strong>
        {trend && (
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-zoom-in" style={{ animationDelay: "0.18s" }}>
            {trend}
          </span>
        )}
        {badge && (
          <span className="ml-auto rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 animate-zoom-in" style={{ animationDelay: "0.20s" }}>
            {badge}
          </span>
        )}
      </div>

      {progress != null && (
        <div className="mt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                tone === "cyan"
                  ? "from-cyan-500 to-blue-500"
                  : tone === "emerald"
                  ? "from-emerald-500 to-emerald-600"
                  : tone === "purple"
                  ? "from-purple-500 to-indigo-600"
                  : "from-amber-500 to-amber-600"
              }`}
              style={{
                width: `${Math.min(Math.max(Number(progress) || 0, 0), 100)}%`,
                transition: "width 1s cubic-bezier(0, 0, 0.2, 1) 0.2s",
                willChange: "width",
              }}
            />
          </div>
        </div>
      )}

      {note && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium truncate animate-text-reveal" style={{ animationDelay: "0.22s" }}>
          {note}
        </p>
      )}
    </article>
  );
}


export function StatusBadge({ status, tone }) {
  const value = status || "—";
  const normalized = String(value).toUpperCase();

  const variant =
    tone ||
    (["ACTIVE", "PAID", "DELIVERED", "OK", "PUBLISHED", "SUCCESS"].includes(normalized)
      ? "green"
      : ["FAILED", "REJECTED", "CANCELLED", "SUSPENDED", "ERROR", "CRITICAL"].includes(normalized)
      ? "red"
      : ["PENDING", "WARNING", "DRAFT", "REPORTED", "IN_PROGRESS"].includes(normalized)
      ? "amber"
      : normalized === "PREMIUM"
      ? "gold"
      : "gray");

  const badgeStyles = {
    green: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20",
    gold: "bg-amber-500/15 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300 border-amber-500/30 font-bold",
    gray: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
        badgeStyles[variant] || badgeStyles.gray
      }`}
    >
      {value}
    </span>
  );
}

export function ActionButton({ variant = "ghost", size, className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-semibold transition-all rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeStyles = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs sm:text-sm";

  const variants = {
    primary:
      "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 shadow-sm shadow-amber-500/20",
    ghost:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800",
    danger:
      "bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white dark:bg-rose-500/20 dark:text-rose-400",
  };

  return (
    <button
      className={`${base} ${sizeStyles} ${variants[variant] || variants.ghost} ${className}`.trim()}
      {...props}
    />
  );
}

export function SearchInput({ value, onChange, placeholder = "ស្វែងរក..." }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
    />
  );
}

export function FilterTabs({ items, active, onChange }) {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800" role="tablist">
      {items.map((item) => {
        const key = item.key ?? item.value ?? item;
        const label = item.label ?? item;
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function DataTable({ columns, rows, getRowKey, emptyLabel = "មិនមានទិន្នន័យទេ", className = "" }) {
  if (!rows?.length) return <EmptyState label={emptyLabel} />;

  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-[#111113] shadow-xs animate-cascade ${className}`.trim()} style={{ animationDelay: "0.15s" }}>
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/75 dark:border-zinc-800 dark:bg-zinc-900/50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 whitespace-nowrap"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {rows.map((row, index) => (
            <tr
              key={getRowKey ? getRowKey(row, index) : row.id ?? index}
              style={{ animationDelay: `${Math.min(0.06 + index * 0.03, 0.45)}s` }}
              className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                  {column.render ? column.render(row) : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LoadingState({ label = "កំពុងផ្ទុកទិន្នន័យ..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-500/20 border-t-amber-500 mb-3" />
      <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}

export function ErrorStateView({ message = "មិនអាចទាញយកទិន្នន័យបានទេ", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20">
      <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
      <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{message}</p>
      {onRetry && (
        <ActionButton
          variant="ghost"
          size="sm"
          className="mt-3 text-xs"
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>ព្យាយាមម្តងទៀត</span>
        </ActionButton>
      )}
    </div>
  );
}

export function EmptyState({ label = "មិនមានទិន្នន័យទេ" }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
      <Inbox className="h-8 w-8 text-slate-300 dark:text-zinc-600 mb-2" />
      <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">{label}</span>
    </div>
  );
}
