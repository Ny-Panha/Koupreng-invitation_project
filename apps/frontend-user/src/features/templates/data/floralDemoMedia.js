// Explicit marketing-demo assets. Owner/public content never inherits this collection.
export const FLORAL_DEMO_PHOTOS = [5729053, 5729034, 5729052, 5729046, 5729048, 5729035, 5729141, 5729155, 5729156, 5729196, 5729225, 5729054].map((sourceId, index) => {
  const file = `/templates/khmer-floral-gold/romantic-${String(index + 1).padStart(2, '0')}`;
  return { id: `floral-demo-${sourceId}`, src: `${file}.webp`, thumbnail: `${file}-thumb.webp`, alt: `Romantic wedding demonstration photograph ${index + 1} by Jin Wedding / Pexels` };
});
