import { useEffect, useState, useRef } from "react";

/**
 * easeOutExpo easing function:
 * f(t) = t === 1 ? 1 : 1 - 2^(-10 * t)
 */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function AnimatedNumber({
  value = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1200,
  className = "",
}) {
  const target =
    typeof value === "number"
      ? value
      : parseFloat(String(value ?? 0).replace(/[^0-9.-]/g, "")) || 0;

  const isTestEnv =
    typeof process !== "undefined" && process.env?.NODE_ENV === "test";

  const [current, setCurrent] = useState(isTestEnv ? target : 0);
  const startTimestampRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (isTestEnv) {
      setCurrent(target);
      return;
    }

    if (target === 0) {
      setCurrent(0);
      return;
    }

    startTimestampRef.current = null;

    const tick = (now) => {
      if (!startTimestampRef.current) startTimestampRef.current = now;
      const elapsed = now - startTimestampRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      setCurrent(target * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setCurrent(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, isTestEnv]);

  const formattedNumber =
    decimals > 0
      ? current.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(current).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}
