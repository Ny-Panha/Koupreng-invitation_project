import { safeIntroMedia } from '../../../shared/cinematicIntro';

const ROOT = '/templates/royal-garden/v3';
export const ROYAL_ASSETS = Object.freeze({
  arch: `${ROOT}/opening/arch.webp`, archSmall: `${ROOT}/opening/arch-640.webp`,
  calligraphy: `${ROOT}/opening/calligraphy.webp`, calligraphySmall: `${ROOT}/opening/calligraphy-640.webp`,
  guest: `${ROOT}/ornaments/guest-frame.webp`, footer: `${ROOT}/video/footer.webp`,
  information: `${ROOT}/information/background.webp`, informationSmall: `${ROOT}/information/background-640.webp`,
  butterfly: `${ROOT}/effects/butterfly.webp`,
  demoVideo: `${ROOT}/video/pre-wedding-demo.mp4`, poster: `${ROOT}/video/poster.webp`,
  demoPortrait: '/templates/silk-heritage/portrait.webp', demoPortraitSmall: `${ROOT}/opening/demo-portrait-640.webp`,
});
export const MOTION_PRESETS = ['off', 'subtle', 'balanced', 'cinematic'];
export const bounded = (value, min, max, fallback) => value == null || value === '' || !Number.isFinite(Number(value)) ? fallback : Math.min(max, Math.max(min, Number(value)));
const pick = (value, options, fallback) => options.includes(value) ? value : fallback;
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asset = (value, fallback) => value === undefined ? fallback : safeIntroMedia(value);

// Presentation only. Never stores canonical names, dates, guest identity or private video URLs.
export function royalGardenPresentation(content = {}) {
  const intro = record(content.cinematicIntro), information = record(content.informationScene);
  const royal = intro.style === 'royal-arch';
  const video = record(information.video), effects = record(information.effects);
  return {
    royal,
    entrance: {
      frame: asset(intro.entranceFrame, ROYAL_ASSETS.arch), frameEnabled: intro.entranceFrameEnabled !== false,
      frameScale: bounded(intro.entranceFrameScale, .85, 1.1, 1),
      framePosition: pick(intro.entranceFramePosition, ['upper', 'center', 'lower'], 'center'),
      guestFrameEnabled: intro.guestFrameEnabled !== false,
      coverX: bounded(intro.coverX, 0, 100, 50), coverY: bounded(intro.coverY, 0, 100, 40),
      coverZoom: bounded(intro.coverZoom, 1, 1.4, 1.1),
      titlePlacement: pick(intro.titlePlacement, ['upper', 'center'], 'center'),
      openButtonText: typeof intro.openButtonText === 'string' ? intro.openButtonText.slice(0, 100) : undefined,
      buttonArtwork: intro.buttonArtwork !== false,
    },
    information: {
      enabled: information.enabled === undefined ? royal : information.enabled === true,
      background: asset(information.backgroundAsset, ROYAL_ASSETS.information),
      fixed: information.fixedBackground !== false,
      position: pick(information.backgroundPosition, ['center', 'top', 'bottom'], 'center'),
      overlay: bounded(information.contentOverlay, 0, .8, .2),
      panelOpacity: bounded(information.panelOpacity, 0, 1, 0),
      reveal: pick(information.sectionReveal, ['fade', 'rise', 'none'], 'rise'),
      footer: information.footerEnabled !== false,
    },
    motion: {
      preset: pick(information.motionPreset, MOTION_PRESETS, 'subtle'),
      sparkles: effects.sparkles !== false, petals: effects.petals !== false,
      butterfly: effects.butterfly === true, goldDust: effects.goldDust !== false,
    },
    video: {
      royal, fit: pick(video.fit, ['contain', 'cover'], 'cover'), footerSrc: ROYAL_ASSETS.footer,
      positionX: bounded(video.positionX, 0, 100, 50), positionY: bounded(video.positionY, 0, 100, 40),
      footer: video.footer !== false, replay: video.replay !== false,
      transition: pick(video.transition, ['fade', 'none'], 'fade'),
      sound: royal ? 'muted' : pick(video.sound, ['muted', 'on'], 'muted'),
      endBehavior: pick(video.endBehavior, ['collapse', 'poster'], 'collapse'),
      followUpPhotos: video.followUpPhotos === true,
      resumeMusic: video.resumeMusic !== false,
    },
  };
}

export function guestFrameText(content = {}, english = false) {
  // Only authorized public guest context may supply a personalized name.
  if (content.isPersonalizedGuest === true && typeof content.guestName === 'string' && content.guestName.trim()) return content.guestName.slice(0, 500);
  return english ? 'You and your family' : 'លោកអ្នក និងក្រុមគ្រួសារ';
}

export function motionBudget(preset, { reduced = false, saveData = false, mobile = false } = {}) {
  if (reduced || saveData || preset === 'off') return { particles: 0, butterflies: 0, duration: 0 };
  const count = { subtle: 6, balanced: 12, cinematic: mobile ? 16 : 18 }[preset] ?? 6;
  return { particles: count, butterflies: 1, duration: preset === 'cinematic' ? 18 : 28 };
}
