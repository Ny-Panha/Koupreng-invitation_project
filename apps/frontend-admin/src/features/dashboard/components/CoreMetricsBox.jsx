import {
  Users,
  Palette,
  Mail,
  UserCheck,
  CreditCard,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

export default function CoreMetricsBox({ data = {}, lang = "km", t = (k, d) => d, formatRevenue }) {
  const metrics = [
    {
      id: "users",
      label: t("dashboard.totalUsers", "អ្នកប្រើសរុប"),
      value: data.totalUsers ?? 0,
      note: lang === "en" ? `${data.activeUsers ?? 0} Active` : `${data.activeUsers ?? 0} Active`,
      icon: Users,
      tone: "cyan",
      trend: "+12%",
    },
    {
      id: "templates",
      label: t("dashboard.totalTemplates", "គំរូធៀបការ"),
      value: data.totalTemplates ?? 0,
      note: `${data.premiumTemplates ?? 0} Premium`,
      icon: Palette,
      tone: "purple",
      badge: "TEMPLATES",
    },
    {
      id: "invitations",
      label: t("dashboard.totalInvitations", "ធៀបការសរុប"),
      value: data.totalInvitations ?? 0,
      note: lang === "en" ? `${data.publishedInvitations ?? 0} Published` : `${data.publishedInvitations ?? 0} បានផ្សាយ`,
      icon: Mail,
      tone: "amber",
      trend: "+8.5%",
    },
    {
      id: "guests",
      label: t("dashboard.totalGuests", "ភ្ញៀវសរុប (Guests)"),
      value: data.totalGuests ?? 0,
      note: t("dashboard.allGuestsNote", "ភ្ញៀវក្នុងធៀបការ"),
      icon: UserCheck,
      tone: "emerald",
      badge: "GUESTS",
    },
    {
      id: "payments",
      label: t("dashboard.totalPayments", "ការទូទាត់សរុប"),
      value: data.totalPayments ?? 0,
      note: lang === "en" ? `${data.failedPayments ?? 0} Failed` : `${data.failedPayments ?? 0} បរាជ័យ`,
      icon: CreditCard,
      tone: "rose",
      trend: "+16%",
    },
    {
      id: "revenue",
      label: t("dashboard.totalRevenue", "ចំណូលសរុប"),
      value: data.totalRevenue || 0,
      isMoney: true,
      note: "ABA PayWay",
      icon: TrendingUp,
      tone: "amber",
      badge: "ABA",
    },
  ];

  const toneMap = {
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#121622]/95 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between h-full">
      {/* Box Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === "en" ? "System Core Metrics" : "ស្ថិតិទូទៅនៃប្រព័ន្ធ"}
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              {lang === "en" ? "Overview of users, invitations & revenue" : "ទិដ្ឋភាពទូទៅនៃអ្នកប្រើប្រាស់ ធៀបការ និងចំណូល"}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1f2738] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          6 METRICS
        </span>
      </div>

      {/* 3x2 Compact Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          const toneClass = toneMap[m.tone] || toneMap.cyan;

          return (
            <div
              key={m.id}
              style={{ animationDelay: `${0.30 + idx * 0.04}s` }}
              className="group relative flex flex-col justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-[#171e2c]/80 border border-slate-100 dark:border-slate-800/60 hover:border-amber-500/40 transition-all duration-200 animate-zoom-in"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg border ${toneClass}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {m.trend && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
                    {m.trend}
                  </span>
                )}
                {m.badge && (
                  <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                    {m.badge}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  {m.label}
                </span>
                <strong className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight block">
                  {m.isMoney ? (
                    typeof m.value === "number" ? (
                      <AnimatedNumber value={m.value} prefix="$" decimals={2} duration={1000} />
                    ) : (
                      formatRevenue ? formatRevenue(data) : `$${m.value}`
                    )
                  ) : (
                    <AnimatedNumber value={m.value} duration={1000} />
                  )}
                </strong>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                  {m.note}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
