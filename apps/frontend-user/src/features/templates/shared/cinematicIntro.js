// Presentation only. Event identity, date and audio stay in canonical fields.
export const INTRO_STAGES = ['COVER', 'ORNAMENT_REVEAL', 'TITLE_REVEAL', 'PHOTO_SLIDESHOW', 'INVITATION_REVEAL', 'CONTENT'];
export async function normalizeIntroUpload(file) {
  if (!file || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPEG, PNG or WebP image under 5 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  const type = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'image/jpeg'
    : bytes[0] === 137 && ascii(1, 4) === 'PNG' && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10 ? 'image/png'
      : ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP' ? 'image/webp' : '';
  if (!type) throw new Error('Choose a JPEG, PNG or WebP image under 5 MB.');
  // Safari/Windows can report an empty or generic MIME for valid WebP files.
  return file.type === type ? file : new File([file], file.name, { type, lastModified: file.lastModified });
}
const bounded = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
export function safeIntroMedia(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  if (/^\/(?![\\/])/.test(value) && !value.includes('\\') && ![...value].some(char => char.charCodeAt(0) < 32)) return value;
  if (/^(blob:|data:image\/(?:png|jpeg|webp);base64,)/.test(value)) return value;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function normalizeIntro(value = {}) {
  const input = value && typeof value === 'object' ? value : {};
  return { version: 1, enabled: input.enabled !== false, style: input.style === 'minimal' ? 'minimal' : 'oval',
    heading: typeof input.heading === 'string' ? input.heading.slice(0, 300) : undefined,
    subtitle: typeof input.subtitle === 'string' ? input.subtitle.slice(0, 500) : undefined,
    slides: Array.isArray(input.slides) ? input.slides.slice(0, 24).map((slide, index) => ({
      id: String(slide?.id || `slide-${index}`), src: safeIntroMedia(slide?.src || slide?.url),
      alt: typeof slide?.alt === 'string' ? slide.alt.slice(0, 300) : '',
      x: bounded(slide?.x, 0, 100, 50), y: bounded(slide?.y, 0, 100, 50),
    })).filter(slide => slide.src) : undefined,
    duration: bounded(input.duration, 2, 12, 4.3), transition: input.transition === 'fade' ? 'fade' : 'ken-burns',
    overlay: bounded(input.overlay, 0, .75, .3), textPosition: input.textPosition === 'center' ? 'center' : 'bottom',
    showSaveTheDate: input.showSaveTheDate !== false, music: input.music !== false, reducedMotion: input.reducedMotion === true,
  };
}
export function introSlides(intro, gallery = []) {
  return intro.slides ?? gallery.map((slide, index) => ({ ...slide, id: slide.id || `gallery-${index}`, x: 50, y: 50 }));
}
export function nextIntroState(state, slideCount) {
  if (state.stage === 'PHOTO_SLIDESHOW') return state.slide + 1 < slideCount ? { ...state, slide: state.slide + 1 } : { stage: 'INVITATION_REVEAL', slide: 0 };
  const index = INTRO_STAGES.indexOf(state.stage);
  const stage = INTRO_STAGES[Math.min(index + 1, INTRO_STAGES.length - 1)];
  return { ...state, stage: stage === 'PHOTO_SLIDESHOW' && !slideCount ? 'INVITATION_REVEAL' : stage, slide: 0 };
}
