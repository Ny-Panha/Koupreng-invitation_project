import { motion } from "framer-motion";

export default function CelestialVine({ side = "left", variant = "arc", className = "", reduced = false }) {
  const flip = side === "right" ? "scale(-1 1) translate(-160 0)" : undefined;
  const path = variant === "cascade"
    ? "M18 218C35 177 16 147 52 120c26-20 24-57 63-112"
    : "M18 218C20 160 66 143 53 100 45 74 66 38 112 8";
  return (
    <motion.svg
      className={`kc-vine kc-vine--${side} ${className}`}
      width="160"
      height="220"
      viewBox="0 0 160 220"
      aria-hidden="true"
      focusable="false"
    >
      <motion.path
        d={path}
        fill="none"
        stroke="#789578"
        strokeWidth="2.4"
        strokeLinecap="round"
        pathLength="1"
        initial={reduced ? { pathLength: 1, opacity: 0.42 } : { pathLength: 0, opacity: 0 }}
        whileInView={reduced ? undefined : { pathLength: 1, opacity: 0.55 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.7, ease: "easeOut" }}
        transform={flip}
      />
      <g fill={variant === "cascade" ? "#aec5aa" : "#9db79a"} opacity=".8" transform={flip}>
        <ellipse cx="51" cy="162" rx="7" ry="17" transform="rotate(-52 51 162)" />
        <ellipse cx="40" cy="132" rx="7" ry="17" transform="rotate(38 40 132)" />
        <ellipse cx="56" cy="101" rx="7" ry="17" transform="rotate(-46 56 101)" />
        <ellipse cx="70" cy="73" rx="7" ry="17" transform="rotate(45 70 73)" />
        <ellipse cx="94" cy="38" rx="7" ry="17" transform="rotate(-42 94 38)" />
      </g>
    </motion.svg>
  );
}
