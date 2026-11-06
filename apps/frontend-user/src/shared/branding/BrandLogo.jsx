import "./BrandLogo.css";

const BASE = `${import.meta.env.BASE_URL}branding`;
const WIDTHS = [128, 160, 192, 256, 320, 384, 480, 640];
const SIZES = {
  header: "(max-width: 359px) 105px, (max-width: 767px) 128px, 168px",
  footer: "(max-width: 767px) 148px, 192px",
  compact: "(max-width: 359px) 105px, (max-width: 767px) 112px, 144px",
  hero: "(max-width: 767px) 240px, 300px",
  auth: "(max-width: 767px) 176px, 200px",
  invitation: "(max-width: 767px) 148px, 176px",
  welcome: "(max-width: 767px) 144px, 176px",
  icon: "40px",
};

/** Transparent official artwork. Wrap with the app's router Link when needed. */
export default function BrandLogo({
  variant = "header", size = variant, className = "", priority = false,
  decorative = false, label = "គូព្រេង · Koupreng", href, linkLabel, responsiveIcon = false,
}) {
  const preset = SIZES[size] ? size : variant;
  const icon = variant === "icon";
  const logo = (
    <picture className={`brand-logo brand-logo--${preset}${responsiveIcon ? " brand-logo--responsive-icon" : ""} ${className}`}>
      {responsiveIcon && <source media="(max-width: 359px)" type="image/png" srcSet={`${BASE}/icons/icon-48.png 48w, ${BASE}/icons/icon-192.png 192w`} sizes="40px" />}
      {!icon && <source type="image/webp" srcSet={WIDTHS.map(width => `${BASE}/webp/koupreng-logo-${width}w.webp ${width}w`).join(", ")} sizes={SIZES[preset]} />}
      <img
        src={icon ? `${BASE}/icons/icon-192.png` : `${BASE}/png/koupreng-logo-384w-transparent.png`}
        srcSet={icon ? `${BASE}/icons/icon-48.png 48w, ${BASE}/icons/icon-192.png 192w` : [192, 384, 640].map(width => `${BASE}/png/koupreng-logo-${width}w-transparent.png ${width}w`).join(", ")}
        sizes={SIZES[preset]}
        width={icon ? 192 : 1968} height={icon ? 192 : 724}
        alt={decorative ? "" : label} aria-hidden={decorative || undefined}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async"
      />
    </picture>
  );
  return href ? <a href={href} className="brand-logo-link" aria-label={linkLabel || label}>{logo}</a> : logo;
}
