import { useEffect, useState } from "react";

export default function AnimatedProgressBar({
  percentage = 0,
  tone = "amber",
  className = "",
  showLabel = false,
  delayMs = 200,
  durationMs = 1000,
}) {
  const [fillWidth, setFillWidth] = useState(0);
  const target = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFillWidth(target);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [target, delayMs]);

  const toneGradients = {
    amber: "from-amber-500 to-amber-600",
    emerald: "from-emerald-500 to-emerald-600",
    cyan: "from-cyan-500 to-blue-500",
    purple: "from-purple-500 to-indigo-600",
    rose: "from-rose-500 to-red-600",
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
          <span>Target</span>
          <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{Math.round(target)}%</span>
        </div>
      )}
      <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800/80 ${className}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneGradients[tone] || toneGradients.amber}`}
          style={{
            width: `${fillWidth}%`,
            transition: `width ${durationMs}ms cubic-bezier(0, 0, 0.2, 1)`,
            willChange: "width",
          }}
        />
      </div>
    </div>
  );
}
