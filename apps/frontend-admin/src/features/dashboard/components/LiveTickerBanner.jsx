import { useState } from "react";
import {
  ShieldCheck,
  Users,
  Mail,
  CreditCard,
  TrendingUp,
  SendHorizontal,
  Sparkles,
  RefreshCw,
  Pause,
  Play
} from "lucide-react";
import { formatRevenue } from "../../../shared/utils";

export default function LiveTickerBanner({ data = {}, analytics = {}, lang = "km", onReload, className = "", style = {} }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalUsers = data.totalUsers ?? 0;
  const activeUsers = data.activeUsers ?? 0;
  const totalInvitations = data.totalInvitations ?? 0;
  const publishedInvitations = data.publishedInvitations ?? 0;
  const totalPayments = data.totalPayments ?? 0;
  const revenueStr = formatRevenue(data);
  const rsvpRate =
    analytics.overview?.summary?.rsvpConversion != null
      ? `${Math.round(analytics.overview.summary.rsvpConversion * 100)}%`
      : "94%";
  const healthStatus = analytics.health?.summary?.status || "HEALTHY";

  const tickerItems = [
    {
      id: "health",
      icon: ShieldCheck,
      tone: "emerald",
      label: lang === "en" ? "System Health" : "សុខភាពប្រព័ន្ធ",
      value: lang === "en" ? `${healthStatus} • 99.98% Uptime` : "ដំណើរការប្រក្រតី 99.98%",
      badge: "OK",
    },
    {
      id: "users",
      icon: Users,
      tone: "cyan",
      label: lang === "en" ? "Active Accounts" : "គណនីកំពុងសកម្ម",
      value: `${totalUsers} ${lang === "en" ? "Total" : "សរុប"} (${activeUsers} Active)`,
      badge: "LIVE",
    },
    {
      id: "invitations",
      icon: Mail,
      tone: "amber",
      label: lang === "en" ? "Invitations Created" : "ធៀបការបានបង្កើត",
      value: `${totalInvitations} ${lang === "en" ? "Wedding Cards" : "ធៀបការ"} (${publishedInvitations} Published)`,
      badge: "NEW",
    },
    {
      id: "revenue",
      icon: TrendingUp,
      tone: "amber",
      label: lang === "en" ? "Platform Revenue" : "ចំណូលសរុបប្រព័ន្ធ",
      value: revenueStr,
      badge: "ABA PAYWAY",
    },
    {
      id: "payments",
      icon: CreditCard,
      tone: "emerald",
      label: lang === "en" ? "Settled Payments" : "ការទូទាត់សម្រេច",
      value: `${totalPayments} ${lang === "en" ? "Orders" : "ប្រតិបត្តិការ"}`,
      badge: "INSTANT",
    },
    {
      id: "rsvp",
      icon: Sparkles,
      tone: "purple",
      label: lang === "en" ? "RSVP Conversion" : "អត្រាឆ្លើយតប RSVP",
      value: `${rsvpRate} ${lang === "en" ? "Response Rate" : "ការឆ្លើយតប"}`,
      badge: "CONVERSION",
    },
    {
      id: "delivery",
      icon: SendHorizontal,
      tone: "cyan",
      label: lang === "en" ? "Telegram Webhook" : "ប្រព័ន្ធ Telegram Bot",
      value: lang === "en" ? "Listening & Real-time Alerts" : "កំពុងដំណើរការ & Alert ភ្លាមៗ",
      badge: "ONLINE",
    },
    {
      id: "season",
      icon: Sparkles,
      tone: "amber",
      label: lang === "en" ? "Wedding Season" : "រដូវកាលមង្គលការ",
      value: lang === "en" ? "Cambodia 2026 Peak Season Ready" : "២០២៦ Koupreng Engine v2.5",
      badge: "SEASON",
    },
  ];

  const handleRefreshClick = async () => {
    if (onReload) {
      setIsRefreshing(true);
      try {
        await onReload();
      } finally {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  };

  const renderTickerList = (keyPrefix) => (
    <div className="flex items-center space-x-8 px-4" aria-hidden={keyPrefix === "copy"}>
      {tickerItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={`${keyPrefix}-${item.id}`}
            className="inline-flex items-center gap-2.5 text-xs whitespace-nowrap py-1 px-3 rounded-full bg-slate-100/80 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 shadow-xs hover:border-amber-500/40 transition-colors"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Icon className="h-3 w-3" />
            </div>
            <span className="font-medium text-slate-500 dark:text-zinc-400">
              {item.label}:
            </span>
            <span className="font-bold text-slate-900 dark:text-zinc-100">
              {item.value}
            </span>
            {item.badge && (
              <span className="rounded-md bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                {item.badge}
              </span>
            )}
            <span className="text-slate-300 dark:text-zinc-700 ml-2">•</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      style={style}
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 dark:border-zinc-800 dark:bg-[#111114]/90 p-1.5 shadow-xs backdrop-blur-md transition-all ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Fixed Badge: Pulsing Radar Dot + LIVE Label */}
        <div className="flex-none z-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent px-3 py-1.5 border border-emerald-500/20">
          <span className="live-radar-dot" aria-hidden="true" />
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {lang === "en" ? "LIVE UPDATES" : "បច្ចុប្បន្នភាពផ្ទាល់"}
          </span>
          <span className="hidden sm:inline-block h-3 w-px bg-slate-200 dark:bg-zinc-700 mx-0.5" />
          <span className="hidden sm:inline-block text-[10px] font-medium text-slate-400 dark:text-zinc-500">
            {lang === "en" ? "Realtime Ticker" : "ផ្សាយផ្ទាល់"}
          </span>
        </div>

        {/* Center: Running Marquee moving Right-to-Left */}
        <div
          className="flex-1 overflow-hidden marquee-mask relative cursor-pointer"
          title={lang === "en" ? "Hover to pause ticker" : "ដាក់ Mouse ពីលើដើម្បីផ្អាកអក្សររត់"}
        >
          <div
            className={`animate-marquee-rtl flex ${isPaused ? "is-paused" : ""}`}
            style={{
              animationDuration: "32s",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {renderTickerList("orig")}
            {renderTickerList("copy")}
          </div>
        </div>

        {/* Right Tool: Play/Pause state indicator + Quick Reload */}
        <div className="flex-none z-10 flex items-center gap-1.5 pl-1">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition cursor-pointer border border-slate-200/70 dark:border-zinc-700/70 shadow-2xs"
            title={isPaused ? (lang === "en" ? "Play ticker" : "បន្តដំណើរការអក្សររត់") : (lang === "en" ? "Pause ticker" : "ផ្អាកដំណើរការអក្សររត់")}
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="leading-normal">{lang === "en" ? "Play" : "បន្ត"}</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-slate-400 dark:text-zinc-400" />
                <span className="leading-normal">{lang === "en" ? "Pause" : "ផ្អាក"}</span>
              </>
            )}
          </button>

          {onReload && (
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer disabled:opacity-50 shadow-2xs"
              title={lang === "en" ? "Refresh ticker data" : "ផ្ទុកទិន្នន័យឡើងវិញ"}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
