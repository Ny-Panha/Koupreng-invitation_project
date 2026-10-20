// Exact local source URLs only. Uploaded/server images retain their original URL;
// no assumed CDN transformations or template-ID-based artwork substitution.
const derivatives = {
  "/facebook/all/06-card/cover-card.jpg": {
    name: "khmer-celestial", widths: [320, 640, 1280],
    sizes: "(max-width: 600px) 450px, 510px",
    compactSizes: "(max-width: 600px) 240px, 510px",
  },
  "/images/wedding/couple-hero-meadow.webp": {
    name: "khmer-celestial", widths: [320, 640, 1280],
    sizes: "(max-width: 600px) 450px, 510px",
    compactSizes: "(max-width: 600px) 240px, 510px",
  },
  "/templates/canva-luxury/emerald-luxury.jpg": {
    name: "emerald-luxe", widths: [240, 480, 768],
    sizes: "(max-width: 600px) 168px, 190px",
    compactSizes: "(max-width: 600px) 90px, 190px",
  },
  "/images/wedding/couple-banquet-night.webp": {
    name: "emerald-luxe", widths: [240, 480, 768],
    sizes: "(max-width: 600px) 168px, 190px",
    compactSizes: "(max-width: 600px) 90px, 190px",
  },
};

export function publicTemplateImage(source, compact = false) {
  const asset = Object.hasOwn(derivatives, source) ? derivatives[source] : null;
  if (!asset) return { src: source };
  const path = (width) => `/images/marketing/catalog/${asset.name}-${width}.webp`;
  return {
    src: path(asset.widths[1]),
    srcSet: asset.widths.map((width) => `${path(width)} ${width}w`).join(", "),
    // Account for the painted image area (including cover cropping), not just
    // card width. Originals keep their aspect ratio; CSS still controls framing.
    sizes: compact ? asset.compactSizes : asset.sizes,
  };
}
