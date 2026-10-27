import { safeIntroMedia } from '../../../shared/cinematicIntro';

const ROOT = '/templates/royal-garden/v3';
const REFINEMENT = '/templates/royal-garden/v3-1';
export const ROYAL_ASSETS = Object.freeze({
  arch: `${REFINEMENT}/opening-frame-1200.webp`, archSmall: `${REFINEMENT}/opening-frame-640.webp`,
  calligraphy: `${ROOT}/opening/calligraphy.webp`, calligraphySmall: `${ROOT}/opening/calligraphy-640.webp`,
  guest: `${ROOT}/ornaments/guest-frame.webp`, footer: `${ROOT}/video/footer.webp`,
  information: `${ROOT}/information/background.webp`, informationSmall: `${ROOT}/information/background-640.webp`,
  butterfly: `${ROOT}/effects/butterfly.webp`,
  demoVideo: `${ROOT}/video/pre-wedding-demo.mp4`, poster: `${ROOT}/video/poster.webp`,
  demoPortrait: '/templates/silk-heritage/portrait.webp', demoPortraitSmall: `${ROOT}/opening/demo-portrait-640.webp`,
  monogram: `${REFINEMENT}/monogram-256.webp`, monogramSmall: `${REFINEMENT}/monogram-128.webp`, monogramLarge: `${REFINEMENT}/monogram-512.webp`,
  videoCalligraphy: `${REFINEMENT}/video-calligraphy-480.webp`, videoCalligraphyLarge: `${REFINEMENT}/video-calligraphy-960.webp`,
  openButton: `${REFINEMENT}/open-button-480.webp`, openButtonLarge: `${REFINEMENT}/open-button-960.webp`,
  brand: '/branding/koupreng-mark.png',
  archTiny: `${REFINEMENT}/opening-frame-480.webp`, demoPortraitTiny: `${REFINEMENT}/demo-portrait-480.webp`,
  calligraphyTiny: `${REFINEMENT}/opening-calligraphy-320.webp`, calligraphyMedium: `${REFINEMENT}/opening-calligraphy-800.webp`, guestSmall: `${REFINEMENT}/guest-frame-480.webp`,
});
export const ROYAL_CANVAS_SIZES = '(max-width: 639px) 100vw, (max-width: 1023px) min(88vw, 62vh), min(600px, 58vh)';
export const MOTION_PRESETS = ['off', 'subtle', 'balanced', 'cinematic'];
export const bounded = (value, min, max, fallback) => value == null || value === '' || !Number.isFinite(Number(value)) ? fallback : Math.min(max, Math.max(min, Number(value)));
const pick = (value, options, fallback) => options.includes(value) ? value : fallback;
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asset = (value, fallback) => value === undefined ? fallback : safeIntroMedia(value);

// Presentation only. Never stores canonical names, dates, guest identity or private video URLs.
export function royalGardenPresentation(content = {}, { hosted = content.hasHostContent === true } = {}) {
  const intro = record(content.cinematicIntro), information = record(content.informationScene);
  const royal = intro.style === 'royal-arch';
  const video = record(information.video), effects = record(information.effects);
  const monogram = record(information.monogram), monogramMode = pick(monogram.mode, ['auto', 'artwork', 'custom', 'initials', 'hidden'], 'auto');
  return {
    royal,
    entrance: {
      frame: asset(intro.entranceFrame === `${ROOT}/opening/arch.webp` ? undefined : intro.entranceFrame, ROYAL_ASSETS.arch), frameEnabled: intro.entranceFrameEnabled !== false,
      frameScale: bounded(intro.entranceFrameScale, .85, 1.1, 1),
      framePosition: pick(intro.entranceFramePosition, ['upper', 'center', 'lower'], 'center'),
      guestFrameEnabled: intro.guestFrameEnabled !== false,
      coverX: bounded(intro.coverX, 0, 100, 50), coverY: bounded(intro.coverY, 0, 100, 40),
      coverZoom: bounded(intro.coverZoom, 1, 1.4, 1.1),
      titlePlacement: pick(intro.titlePlacement, ['upper', 'center'], 'center'),
      openButtonText: typeof intro.openButtonText === 'string' ? intro.openButtonText.slice(0, 100) : undefined,
      buttonArtwork: intro.buttonArtwork !== false,
      buttonStyle: pick(intro.buttonStyle, ['artwork', 'circle', 'text'], intro.buttonArtwork === false ? 'circle' : 'artwork'),
    },
    monogram: {
      mode: monogramMode, hidden: monogramMode === 'hidden',
      source: monogramMode === 'custom' ? asset(monogram.asset, '') : monogramMode === 'artwork' || (monogramMode === 'auto' && !hosted) ? ROYAL_ASSETS.monogram : '',
      scale: bounded(monogram.scale, .7, 1.2, 1), positionY: bounded(monogram.positionY, 0, 18, 1),
    },
    information: {
      enabled: information.enabled === undefined ? royal : information.enabled === true,
      background: asset(information.backgroundAsset, ROYAL_ASSETS.information),
      fixed: information.fixedBackground !== false,
      position: pick(information.backgroundPosition, ['center', 'top', 'bottom'], 'center'),
      overlay: bounded(information.contentOverlay, 0, .8, .2),
      panelOpacity: bounded(information.panelOpacity, 0, 1, 0),
      reveal: pick(information.sectionReveal, ['fade', 'rise', 'none'], 'rise'),
      footer: false,
      spacing: pick(information.spacing, ['compact', 'balanced', 'airy'], 'balanced'),
      brandStyle: pick(information.brandStyle, ['logo', 'text'], 'logo'),
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
      artwork: asset(video.artworkSrc, ROYAL_ASSETS.videoCalligraphy), artworkEnabled: video.artworkEnabled !== false,
      dateEnabled: video.dateEnabled !== false, dateFont: pick(video.dateFont, ['moul', 'battambang', 'kantumruy'], 'moul'),
      showTime: video.showTime === undefined ? content.saveTheDate?.showTime === true : video.showTime === true,
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
