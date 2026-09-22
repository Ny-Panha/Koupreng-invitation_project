import { motion } from "framer-motion";

const PALETTES = {
  ivory: { wing: "#fffdf8", wingAlt: "#e9eee4", detail: "#789578", body: "#50664e" },
  gold: { wing: "#d5ae67", wingAlt: "#f1dcae", detail: "#8d642d", body: "#654922" },
  sage: { wing: "#9db79a", wingAlt: "#dbe7d7", detail: "#477052", body: "#355943" },
  rose: { wing: "#e9bfc2", wingAlt: "#f7dddd", detail: "#a46b70", body: "#6e3f46" },
  blue: { wing: "#bdd6dc", wingAlt: "#e8f1ef", detail: "#5d8990", body: "#42646a" },
  champagne: { wing: "#ead9b6", wingAlt: "#fff4d7", detail: "#b58b4b", body: "#795c32" },
  burgundy: { wing: "#8a3e4b", wingAlt: "#c8787f", detail: "#5d2531", body: "#4d2029" },
};

const SHAPES = {
  ivory: ["M57 43C48 17 26 7 8 18c2 20 16 31 43 34l6-9Z", "M52 47C32 46 17 41 8 31c3 24 18 34 45 24l-1-8Z", "M63 43C72 17 94 7 112 18c-2 20-16 31-43 34l-6-9Z", "M68 47c20-1 35-6 44-16-3 24-18 34-45 24l1-8Z"],
  gold: ["M57 43C48 15 31 6 10 12c1 15 11 25 39 36l8-5Z", "M53 48C32 50 18 45 7 36c6 23 24 30 46 18v-6Z", "M63 43C72 15 89 6 110 12c-1 15-11 25-39 36l-8-5Z", "M67 48c21 2 35-3 46-12-6 23-24 30-46 18v-6Z"],
  sage: ["M57 43C45 21 30 10 13 8c-1 18 12 30 38 43l6-8Z", "M52 48C34 43 20 39 10 30c2 22 16 34 42 26v-8Z", "M63 43C75 21 90 10 107 8c1 18-12 30-38 43l-6-8Z", "M68 48c18-5 32-9 42-18-2 22-16 34-42 26v-8Z"],
  rose: ["M57 43C50 18 29 12 12 23c5 17 18 25 40 29l5-9Z", "M52 48C34 48 19 45 10 37c5 20 21 27 43 17l-1-6Z", "M63 43C70 18 91 12 108 23c-5 17-18 25-40 29l-5-9Z", "M68 48c18 0 33-3 42-11-5 20-21 27-43 17l1-6Z"],
  blue: ["M57 43C44 20 27 13 7 17c4 16 17 27 44 34l6-8Z", "M52 48C31 44 17 40 6 31c4 24 20 34 47 24l-1-7Z", "M63 43C76 20 93 13 113 17c-4 16-17 27-44 34l-6-8Z", "M68 48c21-4 35-8 46-17-4 24-20 34-47 24l1-7Z"],
  champagne: ["M57 43C47 16 34 5 15 11c-4 15 8 28 36 41l6-9Z", "M52 48C35 44 19 43 9 35c4 19 19 29 44 20l-1-7Z", "M63 43C73 16 86 5 105 11c4 15-8 28-36 41l-6-9Z", "M68 48c17-4 33-5 43-13-4 19-19 29-44 20l1-7Z"],
  burgundy: ["M57 43C51 15 37 6 17 14c-4 18 8 28 34 38l6-9Z", "M52 48C31 51 17 48 8 41c7 20 24 25 45 13l-1-6Z", "M63 43C69 15 83 6 103 14c4 18-8 28-34 38l-6-9Z", "M68 48c21 3 35 0 44-7-7 20-24 25-45 13l1-6Z"],
};

export default function CelestialButterfly({
  variant = "gold",
  size = 48,
  className = "",
  wingSpeed = 280,
  reduced = false,
}) {
  const palette = PALETTES[variant] || PALETTES.gold;
  const shape = SHAPES[variant] || SHAPES.gold;

  return (
    <svg
      className={`kc-butterfly ${className}`}
      viewBox="0 0 120 90"
      width={size}
      height={size * 0.75}
      style={{ "--kc-wing-speed": `${wingSpeed}ms`, "--kc-wing": palette.wing, "--kc-wing-alt": palette.wingAlt, "--kc-wing-detail": palette.detail, "--kc-wing-body": palette.body }}
      aria-hidden="true"
      focusable="false"
    >
      <motion.g className="kc-butterfly__wing kc-butterfly__wing--left" animate={reduced ? undefined : { scaleX: [1, 0.42, 1] }} transition={{ duration: wingSpeed / 1000, repeat: Infinity, ease: "easeInOut" }}>
        <path d={shape[0]} fill="var(--kc-wing)" />
        <path d={shape[1]} fill="var(--kc-wing-alt)" opacity=".92" />
        <path d="M16 22c13 2 25 9 35 21M13 31c13 4 24 9 35 16" fill="none" stroke="var(--kc-wing-detail)" strokeWidth="2" strokeLinecap="round" opacity=".7" />
        <circle cx="25" cy="25" r="3.5" fill="var(--kc-wing-detail)" opacity=".8" />
      </motion.g>
      <motion.g className="kc-butterfly__wing kc-butterfly__wing--right" animate={reduced ? undefined : { scaleX: [1, 0.42, 1] }} transition={{ duration: wingSpeed / 1000, delay: wingSpeed / -2400, repeat: Infinity, ease: "easeInOut" }}>
        <path d={shape[2]} fill="var(--kc-wing)" />
        <path d={shape[3]} fill="var(--kc-wing-alt)" opacity=".92" />
        <path d="M104 22C91 24 79 31 69 43M107 31c-13 4-24 9-35 16" fill="none" stroke="var(--kc-wing-detail)" strokeWidth="2" strokeLinecap="round" opacity=".7" />
        <circle cx="95" cy="25" r="3.5" fill="var(--kc-wing-detail)" opacity=".8" />
      </motion.g>
      <path d="M57 36c-3 8-3 17 3 25 6-8 6-17 3-25Z" fill="var(--kc-wing-body)" />
      <path d="M59 37c-5-7-8-9-12-11M61 37c5-7 8-9 12-11" fill="none" stroke="var(--kc-wing-body)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="34" r="3" fill="var(--kc-wing-body)" />
    </svg>
  );
}
