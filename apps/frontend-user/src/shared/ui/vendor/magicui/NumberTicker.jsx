/**
 * Magic UI Number Ticker Component (adapted for Koupreng E-Invitation)
 * Upstream Source: https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/number-ticker.tsx
 * License: MIT (Copyright (c) 2024 Magic UI)
 * Adapted to React 19 JSX, framer-motion, Khmer/English numbers, and prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import PropTypes from "prop-types";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className = "",
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const shouldReduceMotion = useReducedMotion();

  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (shouldReduceMotion) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Number(value).toFixed(decimalPlaces)}${suffix}`;
      }
      return;
    }

    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value, direction, shouldReduceMotion, prefix, suffix, decimalPlaces]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Number(latest).toFixed(decimalPlaces)}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [springValue, decimalPlaces, prefix, suffix, shouldReduceMotion]);

  return (
    <span
      ref={ref}
      className={`magic-number-ticker ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {shouldReduceMotion
        ? `${prefix}${Number(value).toFixed(decimalPlaces)}${suffix}`
        : direction === "down"
        ? `${prefix}${Number(value).toFixed(decimalPlaces)}${suffix}`
        : `${prefix}0${suffix}`}
    </span>
  );
}

NumberTicker.propTypes = {
  value: PropTypes.number.isRequired,
  direction: PropTypes.oneOf(["up", "down"]),
  delay: PropTypes.number,
  className: PropTypes.string,
  decimalPlaces: PropTypes.number,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
};
