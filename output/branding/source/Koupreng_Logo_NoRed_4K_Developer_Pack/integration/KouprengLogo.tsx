import React from "react";

type KouprengLogoProps = {
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
};

// Assets are expected under /public/assets/brand/koupreng/
const BASE = "/assets/brand/koupreng";
const widths = [160, 256, 320, 384, 480, 512, 640, 768, 960, 1024, 1280, 1536, 1920];

export function KouprengLogo({ className, style, priority = false }: KouprengLogoProps) {
  return (
    <img
      className={className}
      src={`${BASE}/koupreng-logo-512w.webp`}
      srcSet={widths.map((w) => `${BASE}/koupreng-logo-${w}w.webp ${w}w`).join(", ")}
      sizes="(max-width: 600px) 180px, (max-width: 1024px) 220px, 260px"
      alt="គូព្រេង"
      width={512}
      height={Math.round(512 * 0.3678861788617886)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ maxWidth: "100%", height: "auto", objectFit: "contain", ...style }}
    />
  );
}
