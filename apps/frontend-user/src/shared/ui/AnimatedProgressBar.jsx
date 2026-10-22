import { useEffect, useState } from "react";

export default function AnimatedProgressBar({
  percentage = 0,
  tone = "gold",
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

  return (
    <div className={`animated-progress-track ${className}`}>
      {showLabel && (
        <div className="animated-progress-label">
          <span>Progress</span>
          <span>{Math.round(target)}%</span>
        </div>
      )}
      <div
        className="animated-progress-fill"
        style={{
          width: `${fillWidth}%`,
          transition: `width ${durationMs}ms cubic-bezier(0, 0, 0.2, 1)`,
          willChange: "width",
        }}
      />
    </div>
  );
}
