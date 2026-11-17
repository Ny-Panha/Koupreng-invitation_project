import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const mediaQuery = "(prefers-reduced-motion: reduce)";
const reduced = () => typeof window !== "undefined" &&
  Boolean(window.matchMedia?.(mediaQuery)?.matches);
const subscribe = (notify) => {
  const query = window.matchMedia?.(mediaQuery);
  query?.addEventListener("change", notify);
  return () => query?.removeEventListener("change", notify);
};

/**
 * Numeric display. Static by default so operational and financial totals
 * always show their authoritative value. `animate` is opt-in for nonfinancial
 * counts; runtime reduced-motion changes snap to the final value.
 */
export default function AnimatedNumber({
  value = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1200,
  animate = false,
  className = "",
}) {
  const target = typeof value === "number"
    ? value
    : parseFloat(String(value ?? 0).replace(/[^0-9.-]/g, "")) || 0;
  const prefersReducedMotion = useSyncExternalStore(subscribe, reduced, () => true);
  const shouldAnimate = animate && !prefersReducedMotion;
  const [current, setCurrent] = useState(() => shouldAnimate ? 0 : target);
  const currentRef = useRef(current);

  useEffect(() => {
    if (!shouldAnimate || duration <= 0) {
      currentRef.current = target;
      setCurrent(target);
      return undefined;
    }

    const from = currentRef.current;
    let frame;
    let started;
    const tick = (now) => {
      started ??= now;
      const progress = Math.min((now - started) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
      currentRef.current = from + (target - from) * eased;
      setCurrent(currentRef.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, shouldAnimate, target]);

  const displayed = shouldAnimate ? current : target;
  const formattedNumber = decimals > 0
    ? displayed.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    : Math.round(displayed).toLocaleString();

  return <span className={className}>{prefix}{formattedNumber}{suffix}</span>;
}
