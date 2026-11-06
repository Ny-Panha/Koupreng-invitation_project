import { guestLocale, localeContent, projectLocale, translationReadiness } from '../../shared/localizedContent';
import { safeIntroMedia } from '../../shared/cinematicIntro';

export const FLORAL_ORDER = ['invitation', 'family', 'couplePhoto', 'countdown', 'schedule', 'map', 'gallery', 'closing', 'rsvp'];
export const floralColor = value => /^#[a-f\d]{6}$/i.test(value || '') ? value : undefined;
export function floralLocales(content, hosted) {
  if (content.localizedContentV1) {
    const stored = localeContent(content);
    return stored.enabledLocales.includes('en') && translationReadiness(content).ready ? ['km', 'en'] : ['km'];
  }
  return hosted ? [String(content.languageMode).toLowerCase() === 'en' ? 'en' : 'km'] : ['km', 'en'];
}
export function floralContent(content, requested) {
  const locale = content.localizedContentV1 ? guestLocale(content, requested) : requested;
  const projected = content.localizedContentV1 ? projectLocale(content, locale) : content;
  return {
    ...content, ...projected, languageMode: locale === 'en' ? 'EN' : 'KH',
    // Projection supplies empty collections for absent fields; retain canonical gallery media.
    photos: Array.isArray(content.photos) ? projected.photos : undefined,
    groom: projected.groomName || (locale === 'en' ? content.groomEn : '') || projected.groom || '',
    bride: projected.brideName || (locale === 'en' ? content.brideEn : '') || projected.bride || '',
    // The diagram is an uploaded image, not a claim to an interactive map.
    sketchMapImage: safeIntroMedia(Object.hasOwn(content, 'sketchMapImage') ? content.sketchMapImage : content.venue?.sketchMapImage || content.venue?.image),
  };
}
export function floralSections(content) {
  const aliases = { venue: 'map', calendar: 'countdown', couple: 'family' };
  const requested = (content.sectionOrder || []).map(key => aliases[key] || key);
  return [...new Set([...requested, ...FLORAL_ORDER])].filter(key => FLORAL_ORDER.includes(key)
    && (key !== 'countdown' || content.saveTheDate?.enabled !== false)
    && content.enabledSections?.[key] !== false && content[`show${key[0].toUpperCase()}${key.slice(1)}`] !== false);
}
export function floralPhotos(content, english) {
  const photos = content.photos ?? content.gallery ?? [];
  return (Array.isArray(photos) ? photos : []).map((item, index) => ({
    id: item?.id || `photo-${index}`, src: safeIntroMedia(typeof item === 'string' ? item : item?.src || item?.url || item?.preview),
    alt: (typeof item === 'object' && item?.alt) || (english ? `Wedding photograph ${index + 1}` : `រូបអនុស្សាវរីយ៍ទី ${index + 1}`),
    caption: item?.caption || '',
    thumbnail: safeIntroMedia(item?.thumbnail),
  })).filter(item => item.src);
}
export function floralInitials(content) {
  if (content.monogramText?.trim()) return content.monogramText.trim().slice(0, 24);
  const first = value => typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(value || '')][0]?.segment || ''
    : Array.from(value || '')[0] || '';
  return [first(content.groom), first(content.bride)].filter(Boolean).join(' ');
}
export function floralMonogramText(content, mode) {
  if (mode === 'short-names') {
    const settings = content.invitationStyleV1 || {}, english = String(content.languageMode).toLowerCase() === 'en';
    const short = person => (english ? settings[`${person}ShortNameEn`]?.trim() : '') || settings[`${person}ShortName`]?.trim() || content[person];
    return [short('groom'), short('bride')].filter(Boolean).join('\n&\n');
  }
  if (mode === 'names') return [content.groom, content.bride].filter(Boolean).join('\n&\n');
  return floralInitials(mode === 'auto' ? { ...content, monogramText: '' } : content);
}
export function floralMusic(content) {
  if (content.enabledSections?.music === false || content.musicTrackId === 'none') return '';
  // Missing owner music stays silent; the marketing song never fills that gap.
  const value = Object.hasOwn(content, 'musicUrl') ? content.musicUrl : content.music;
  return safeIntroMedia(typeof value === 'string' ? value : value?.url || '');
}
