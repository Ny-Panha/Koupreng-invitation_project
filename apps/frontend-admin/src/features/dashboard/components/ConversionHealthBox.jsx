import { QrCode, SendHorizontal, ShieldCheck, Activity } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

export default function ConversionHealthBox({
  analytics = {},
  rsvpPct = 94,
  checkInPct = 33,
  deliveryCount = 342,
  isHealthy = true,
  lang = "km",
  t = (k, d) => d,
}) {
  // SVG Circular Gauge calculations for RSVP
  const size = 110;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rsvpPct / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#121622]/95 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between h-full">
      {/* Box Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === "en" ? "Conversion & Health" : "ការបំប្លែង & សុខភាពប្រព័ន្ធ"}
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              {lang === "en" ? "RSVP, Check-in QR & Server Status" : "RSVP, Check-in QR និងស្ថានភាពម៉ាស៊ីន"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ACTIVE</span>
        </div>
      </div>

      {/* Main Content: Left Donut Gauge + Right 3 Progress Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1">
        {/* Left (5 cols): Tavola-inspired Donut Gauge for RSVP Conversion */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50/80 dark:bg-[#171e2c]/80 border border-slate-100 dark:border-slate-800/60 text-center">
          <div className="relative flex items-center justify-center mb-1.5">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Animated Progress Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#06b6d4"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedNumber value={rsvpPct} suffix="%" duration={1200} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                RSVP
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-zinc-200 block truncate">
            {lang === "en" ? "RSVP Conversion" : "អត្រាឆ្លើយតប RSVP"}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            +5% vs គោលដៅ
          </span>
        </div>

        {/* Right (7 cols): 3 Compact Horizontal Bars */}
        <div className="sm:col-span-7 flex flex-col justify-between space-y-2.5">
          {/* 1. Check-in Rate */}
          <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#171e2c]/60 border border-slate-100 dark:border-slate-800/40">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {lang === "en" ? "Check-in Rate" : "Check-in Rate"}
                </span>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={checkInPct} suffix="%" duration={1000} />
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${checkInPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
              {lang === "en"
                ? `${analytics.checkIn?.summary?.checkedIn || 1} Checked-in`
                : `${analytics.checkIn?.summary?.checkedIn || 1} ភ្ញៀវបាន Check-in`}
            </span>
          </div>

          {/* 2. Telegram Delivery */}
          <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#171e2c]/60 border border-slate-100 dark:border-slate-800/40">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <SendHorizontal className="h-3.5 w-3.5 text-purple-500" />
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {lang === "en" ? "Telegram Bot" : "Telegram Delivery"}
                </span>
              </div>
              <span className="font-extrabold text-purple-600 dark:text-purple-400">
                <AnimatedNumber value={deliveryCount} duration={1000} /> ផ្ញើរួច
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-1000"
                style={{ width: "98%" }}
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
              {lang === "en" ? "98% delivery success" : "អត្រាផ្ញើជោគជ័យ 98%"}
            </span>
          </div>

          {/* 3. System Health */}
          <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#171e2c]/60 border border-slate-100 dark:border-slate-800/40">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {lang === "en" ? "System Health" : "សុខភាពប្រព័ន្ធ"}
                </span>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{isHealthy ? "100% OK" : "HEALTHY"}</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                style={{ width: isHealthy ? "100%" : "85%" }}
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
              {lang === "en" ? "0 alerts · Normal operation" : "0 alerts · ដំណើរការប្រក្រតី 99.98%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
