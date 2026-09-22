const PALETTES = {
  white: { petal: "#fffdf8", shadow: "#dfe8dc", center: "#d7b76d" },
  jasmine: { petal: "#fefcf5", shadow: "#e8eee3", center: "#c9a45d" },
  lotus: { petal: "#f4d9d8", shadow: "#e9bfc2", center: "#c89265" },
  pink: { petal: "#edc2c5", shadow: "#dda3aa", center: "#aa6d58" },
  champagne: { petal: "#edd7a7", shadow: "#d3b373", center: "#9d7134" },
  sage: { petal: "#aec5aa", shadow: "#789578", center: "#45694d" },
};

const ROTATIONS = {
  white: [0, 45, 90, 135, 180, 225, 270, 315],
  jasmine: [0, 60, 120, 180, 240, 300],
  pink: [0, 72, 144, 216, 288],
  champagne: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324],
};

export default function CelestialFlower({ variant = "white", size = 64, className = "" }) {
  const palette = PALETTES[variant] || PALETTES.white;
  if (variant === "sage") {
    return (
      <svg className={`kc-flower ${className}`} viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false">
        <path d="M50 88C47 67 50 45 62 17" fill="none" stroke="#52795a" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="35" cy="57" rx="11" ry="26" transform="rotate(-42 35 57)" fill="#a8c2a5" />
        <ellipse cx="66" cy="39" rx="10" ry="24" transform="rotate(45 66 39)" fill="#789578" />
        <ellipse cx="49" cy="24" rx="9" ry="21" transform="rotate(-24 49 24)" fill="#c7d8c1" />
      </svg>
    );
  }
  if (variant === "lotus") {
    return (
      <svg className={`kc-flower ${className}`} viewBox="0 0 100 100" width={size} height={size} style={{ "--kc-flower-petal": palette.petal, "--kc-flower-shadow": palette.shadow, "--kc-flower-center": palette.center }} aria-hidden="true" focusable="false">
        <path d="M50 87C32 74 21 58 25 39c9 8 17 17 25 34 8-17 16-26 25-34 4 19-7 35-25 48Z" fill="var(--kc-flower-shadow)" />
        <path d="M50 80C37 65 36 49 50 25c14 24 13 40 0 55Z" fill="var(--kc-flower-petal)" stroke="var(--kc-flower-shadow)" strokeWidth="1.4" />
        <path d="M50 80C26 72 17 57 20 45c13 5 24 16 30 30ZM50 80c24-8 33-23 30-35-13 5-24 16-30 30Z" fill="var(--kc-flower-petal)" stroke="var(--kc-flower-shadow)" strokeWidth="1.4" />
        <ellipse cx="50" cy="78" rx="20" ry="6" fill="var(--kc-flower-center)" opacity=".86" />
      </svg>
    );
  }
  const rotations = ROTATIONS[variant] || ROTATIONS.white;
  const petalRx = variant === "jasmine" ? 14 : variant === "pink" ? 19 : 17;
  const petalRy = variant === "jasmine" ? 23 : variant === "pink" ? 22 : 27;
  return (
    <svg
      className={`kc-flower ${className}`}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ "--kc-flower-petal": palette.petal, "--kc-flower-shadow": palette.shadow, "--kc-flower-center": palette.center }}
      aria-hidden="true"
      focusable="false"
    >
      <g className="kc-flower__bloom">
        {rotations.map((rotation) => (
          <ellipse key={rotation} cx="50" cy="25" rx={petalRx} ry={petalRy} transform={`rotate(${rotation} 50 50)`} fill="var(--kc-flower-petal)" stroke="var(--kc-flower-shadow)" strokeWidth="1.2" />
        ))}
        <circle cx="50" cy="50" r="13" fill="var(--kc-flower-center)" />
        <circle cx="44" cy="46" r="2" fill="#fff7d8" opacity=".85" />
        <circle cx="57" cy="54" r="2" fill="#fff7d8" opacity=".75" />
      </g>
    </svg>
  );
}
