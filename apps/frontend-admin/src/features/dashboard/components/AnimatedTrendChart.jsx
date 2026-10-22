import { useState } from "react";
import { MoreHorizontal, ArrowUpRight, TrendingDown } from "lucide-react";
import AnimatedNumber from "../../../shared/ui/AnimatedNumber";

export default function AnimatedTrendChart({ lang = "km", totalRevenue = 4772 }) {
  const [activeTab, setActiveTab] = useState("revenue");
  const [hoverIndex, setHoverIndex] = useState(null);

  const revenuePoints = [
    { label: lang === "en" ? "Mon" : "ច័ន្ទ", valCurrent: 240, valPrev: 180 },
    { label: lang === "en" ? "Tue" : "អង្គារ", valCurrent: 380, valPrev: 210 },
    { label: lang === "en" ? "Wed" : "ពុធ", valCurrent: 520, valPrev: 390 },
    { label: lang === "en" ? "Thu" : "ព្រហ", valCurrent: 410, valPrev: 480 },
    { label: lang === "en" ? "Fri" : "សុក្រ", valCurrent: 890, valPrev: 620 },
    { label: lang === "en" ? "Sat" : "សៅរ៍", valCurrent: 1450, valPrev: 840 },
    { label: lang === "en" ? "Sun" : "អាទិត្យ", valCurrent: 1750, valPrev: 920 },
  ];

  const ticketsPoints = [
    { label: lang === "en" ? "Mon" : "ច័ន្ទ", valCurrent: 18, valPrev: 10 },
    { label: lang === "en" ? "Tue" : "អង្គារ", valCurrent: 25, valPrev: 15 },
    { label: lang === "en" ? "Wed" : "ពុធ", valCurrent: 38, valPrev: 22 },
    { label: lang === "en" ? "Thu" : "ព្រហ", valCurrent: 30, valPrev: 28 },
    { label: lang === "en" ? "Fri" : "សុក្រ", valCurrent: 65, valPrev: 40 },
    { label: lang === "en" ? "Sat" : "សៅរ៍", valCurrent: 98, valPrev: 55 },
    { label: lang === "en" ? "Sun" : "អាទិត្យ", valCurrent: 120, valPrev: 70 },
  ];

  const isRevenue = activeTab === "revenue";
  const pointsData = isRevenue ? revenuePoints : ticketsPoints;
  const maxVal = isRevenue ? 2000 : 140;
  const displayTotal = totalRevenue > 0 ? totalRevenue : 4772;

  // SVG dimensions
  const width = 640;
  const height = 210;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const getCoordinates = (index, value) => {
    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;
    const x = paddingLeft + (index / (pointsData.length - 1)) * usableWidth;
    const y = height - paddingBottom - (value / maxVal) * usableHeight;
    return { x, y };
  };

  const pointsCurrent = pointsData.map((d, i) => getCoordinates(i, d.valCurrent));
  const pointsPrev = pointsData.map((d, i) => getCoordinates(i, d.valPrev));

  // Build smooth bezier curves
  const buildBezierPath = (pts) =>
    pts.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      const prev = arr[i - 1];
      const cpX = (prev.x + point.x) / 2;
      return `${acc} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
    }, "");

  const linePathCurrent = buildBezierPath(pointsCurrent);
  const linePathPrev = buildBezierPath(pointsPrev);

  // Closed area under the coral line for subtle glow
  const areaPathCurrent = `${linePathCurrent} L ${
    pointsCurrent[pointsCurrent.length - 1].x
  } ${height - paddingBottom} L ${pointsCurrent[0].x} ${
    height - paddingBottom
  } Z`;

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#121622]/95 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300">
      {/* 1. Header Row with View Switcher, Options & Fullscreen */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {lang === "en" ? "Live service" : "និន្នាការចំណូល និងសកម្មភាពប្រព័ន្ធ"}
            </h3>
            <span className="text-[11px] font-bold text-amber-500/90 dark:text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {lang === "en" ? "Last 7 days" : "7 ថ្ងៃចុងក្រោយ"}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5">
            {lang === "en" ? "Live revenue trend vs comparative baseline" : "ទិន្នន័យចំណូលប្រចាំថ្ងៃ និងកំណើនប្រតិបត្តិការធៀបការ"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pill Switcher */}
          <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-[#1f2738] border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("revenue")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === "revenue"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#2e3952] dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {lang === "en" ? "Revenue" : "ចំណូល ($)"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === "tickets"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#2e3952] dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {lang === "en" ? "Tickets" : "ធៀបការ & RSVP"}
            </button>
          </div>

          {/* Option Menu Button */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-[#1f2738] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Expand Button */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-[#1f2738] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Expand"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Big Metric Display */}
      <div className="flex items-baseline gap-3 mb-2 flex-wrap">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          <AnimatedNumber
            value={isRevenue ? displayTotal : 186}
            prefix={isRevenue ? "$" : ""}
            suffix={isRevenue ? "" : ` ${lang === "en" ? "invitations" : "ធៀបការ & RSVP"}`}
            decimals={0}
          />
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>
            {isRevenue
              ? lang === "en"
                ? "Total 7-day revenue"
                : "ចំណូល 7 ថ្ងៃចុងក្រោយ"
              : lang === "en"
              ? "Active Invitations & RSVPs"
              : "ធៀបការ & RSVP សកម្ម"}
          </span>
          <span>·</span>
          <span className="inline-flex items-center text-emerald-500 font-bold">
            {isRevenue ? "+16% vs last week" : "+24% កំណើនឆ្លើយតប"}
          </span>
        </span>
      </div>

      {/* 3. Legend Row (• This Week   -- Last Week) */}
      <div className="flex items-center gap-4 text-xs font-semibold mb-4">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <span className="h-2 w-2 rounded-full bg-[#ff9b85]" />
          <span>{lang === "en" ? "This Week" : "សប្តាហ៍នេះ"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <span className="w-3.5 border-b-2 border-dashed border-slate-400 dark:border-slate-500" />
          <span>{lang === "en" ? "Last Week" : "សប្តាហ៍មុន"}</span>
        </div>
      </div>

      {/* 4. SVG Chart Graphic with Y-Axis, X-Axis & Dual Curves */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Coral Glow Gradient under Current curve */}
            <linearGradient id="tavolaCoralGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff9b85" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#ff9b85" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ff9b85" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Left Y-Axis Labels ($2K, $1K, $0 or 140, 70, 0) & Horizontal Guide Lines */}
          <g className="text-[10px] font-semibold fill-slate-400 dark:fill-slate-500">
            {/* Top Y-Axis */}
            <text x={paddingLeft - 8} y={paddingTop + 6} textAnchor="end">
              {isRevenue ? "$2K" : "140"}
            </text>
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={width - paddingRight}
              y2={paddingTop}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-slate-200/50 dark:text-slate-800/60"
            />

            {/* Mid Y-Axis */}
            <text
              x={paddingLeft - 8}
              y={paddingTop + (height - paddingTop - paddingBottom) / 2 + 4}
              textAnchor="end"
            >
              {isRevenue ? "$1K" : "70"}
            </text>
            <line
              x1={paddingLeft}
              y1={paddingTop + (height - paddingTop - paddingBottom) / 2}
              x2={width - paddingRight}
              y2={paddingTop + (height - paddingTop - paddingBottom) / 2}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-slate-200/50 dark:text-slate-800/60"
            />

            {/* Base Y-Axis */}
            <text x={paddingLeft - 8} y={height - paddingBottom + 4} textAnchor="end">
              {isRevenue ? "$0" : "0"}
            </text>
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight}
              y2={height - paddingBottom}
              stroke="currentColor"
              className="text-slate-200/80 dark:text-slate-800"
            />
          </g>

          {/* Area Fill under Current curve */}
          <path
            d={areaPathCurrent}
            fill="url(#tavolaCoralGlow)"
            className="animate-area-fade"
          />

          {/* Dashed Comparative Curve: Prev Week */}
          <path
            d={linePathPrev}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            strokeLinecap="round"
            className="opacity-70"
          />

          {/* Solid Coral Wave Curve: Current Week */}
          <path
            d={linePathCurrent}
            fill="none"
            stroke="#ff9b85"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="animate-line-reveal"
          />

          {/* Interactive Hover Nodes */}
          {pointsCurrent.map((pt, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    className="fill-[#ff9b85]/30 animate-ping"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "6" : "3.5"}
                  className="fill-white dark:fill-[#121622] stroke-[#ff9b85] transition-all duration-200"
                  strokeWidth="2.5"
                />
              </g>
            );
          })}

          {/* Bottom X-Axis Days Labels */}
          {pointsData.map((d, i) => {
            const pt = pointsCurrent[i];
            const isHovered = hoverIndex === i;
            return (
              <text
                key={i}
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                className={`text-[10px] font-semibold transition-colors ${
                  isHovered
                    ? "fill-[#ff9b85] font-bold"
                    : "fill-slate-400 dark:fill-slate-500"
                }`}
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoverIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-xl dark:border-slate-700 dark:bg-[#1a2233] backdrop-blur-md text-xs transition-all animate-in fade-in zoom-in-95"
            style={{
              left: `${(pointsCurrent[hoverIndex].x / width) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-bold text-slate-900 dark:text-white">
              {pointsData[hoverIndex].label}
            </p>
            <p className="text-[11px] font-semibold text-[#ff9b85]">
              {isRevenue
                ? `${lang === "en" ? "This week" : "សប្តាហ៍នេះ"}: $${pointsData[hoverIndex].valCurrent}`
                : `${lang === "en" ? "This week" : "សប្តាហ៍នេះ"}: ${pointsData[hoverIndex].valCurrent} ធៀបការ/RSVP`}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">
              {isRevenue
                ? `${lang === "en" ? "Last week" : "សប្តាហ៍មុន"}: $${pointsData[hoverIndex].valPrev}`
                : `${lang === "en" ? "Last week" : "សប្តាហ៍មុន"}: ${pointsData[hoverIndex].valPrev} ធៀបការ/RSVP`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
