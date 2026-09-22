const COLORS = {
  rose: "#e8b7bb",
  champagne: "#d9b68e",
  ivory: "#fff8e8",
  sage: "#afc7aa",
  blue: "#bdd6dc",
};

export default function CelestialPetal({ variant = "rose", size = 12, className = "" }) {
  return (
    <svg
      className={`kc-petal ${className}`}
      viewBox="0 0 24 40"
      width={size}
      height={size * 1.65}
      style={{ "--kc-petal-color": COLORS[variant] || COLORS.rose }}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 1C22 10 24 20 17 31c-2 3-4 5-5 8-1-3-3-5-5-8C0 20 2 10 12 1Z" fill="var(--kc-petal-color)" opacity=".9" />
      <path d="M12 5c2 10 2 18 0 27" fill="none" stroke="#fffdf8" strokeWidth="1.2" strokeLinecap="round" opacity=".58" />
    </svg>
  );
}
