import { safeIntroMedia } from './cinematicIntro';

const entries = rows => rows.map(([id, km, en]) => ({ id, km, en }));
// IDs are persisted content, independent of subscription and template identity.
export const DATE_STYLES = entries([
  ['traditional', 'ប្រតិទិនខ្មែរ', 'Khmer calendar'], ['minimal', 'ប្រតិទិនសាមញ្ញ', 'Minimal calendar'],
  ['gold-calendar', 'ប្រតិទិនមាស', 'Ornate gold calendar'], ['watercolor', 'ពណ៌ទឹក', 'Watercolor calendar'],
  ['tear-off', 'សន្លឹកកាលបរិច្ឆេទ', 'Tear-off date'], ['typographic', 'លេខធំ', 'Typographic date'],
  ['horizontal', 'កាលបរិច្ឆេទផ្ដេក', 'Horizontal date'], ['floral', 'កំណត់ថ្ងៃផ្កា', 'Floral Save the Date'],
]);
export const PROGRAM_STYLES = entries([
  ['classic', 'បន្ទាត់បញ្ឈរ', 'Classic timeline'], ['gold-curve', 'បន្ទាត់មាសកោង', 'Gold curved timeline'],
  ['alternating', 'ឆ្លាស់សងខាង', 'Alternating timeline'], ['ceremonial', 'កាតពិធីខ្មែរ', 'Ceremonial cards'],
  ['editorial', 'របៀបវារៈ', 'Editorial agenda'], ['numbered', 'កាតមានលេខ', 'Numbered ceremonies'],
  ['floral-list', 'បញ្ជីផ្កា', 'Floral schedule'], ['multi-day', 'កម្មវិធីច្រើនថ្ងៃ', 'Day folios'],
]);
export const GUEST_FRAMES = entries([
  ['khmer', 'ក្បាច់ខ្មែរ', 'Khmer ornament'], ['floral-gold', 'ផ្កាមាស', 'Floral gold'],
  ['engraved', 'ឆ្លាក់', 'Engraved'], ['double-gold', 'ស៊ុមមាសពីរជាន់', 'Double gold'],
  ['vintage', 'បុរាណ', 'Vintage'], ['royal', 'រាជវង្ស', 'Royal'], ['minimal', 'សាមញ្ញ', 'Minimal'], ['champagne', 'សាំប៉ាញ', 'Champagne'],
]);
export const MOTION_STYLES = entries([
  ['none', 'គ្មានចលនា', 'None'], ['subtle', 'តិចៗ', 'Subtle'], ['romantic', 'រ៉ូមែនទិក', 'Romantic'],
  ['elegant', 'ស្រទន់', 'Elegant'], ['cinematic', 'ភាពយន្ត', 'Cinematic'],
]);
export const MONOGRAM_FRAMES = entries([
  ['regal-scroll-gold', 'ស៊ុមមាសរាជសិរី', 'Regal Scroll Gold'],
  ['ornate', 'ក្បាច់មាស', 'Ornate'], ['oval', 'ពងក្រពើ', 'Oval'],
  ['diamond', 'ពេជ្រ', 'Diamond'], ['minimal', 'សាមញ្ញ', 'Minimal'],
]);
const pick = (value, options, fallback) => options.some(item => item.id === value) ? value : fallback;
const bounded = (value, min, max, fallback) => Number.isFinite(Number(value)) && value !== null ? Math.min(max, Math.max(min, Number(value))) : fallback;
const copy = (value, fallback, limit = 300) => typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : fallback;
export const FLORAL_COPY = {
  openButtonLabelKm: 'សូមគោរពអញ្ចើញ', openButtonLabelEn: 'Open our invitation',
  guestSalutationKm: 'សូមគោរពអញ្ជើញ', guestSalutationEn: 'Warmly inviting',
  genericGuestNameKm: 'លោកអ្នក និងក្រុមគ្រួសារ', genericGuestNameEn: 'You and your family',
  familyHeadingKm: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ', familyHeadingEn: 'Together with our families',
  familyIntroKm: 'ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងញាតិមិត្តរាប់អានទាំងឡាយ សូមអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យជូនកូនប្រុសកូនស្រីយើងខ្ញុំ ក្នុងកម្មវិធីមង្គលអាពាហ៍ពិពាហ៍ ដែលរៀបចំឡើងដោយក្តីរីករាយ។',
  familyIntroEn: 'We warmly invite our honored guests, relatives and friends to join our joyful wedding celebration and bless our son and daughter.',
};
export function invitationStyles(content = {}) {
  const raw = content.invitationStyleV1 || {};
  const floral = [content.code, content.variant, content.templateId, content.presetId].some(id => ['khmer-floral-gold', 'KHMER_FLORAL_GOLD'].includes(id));
  return {
    version: 1,
    date: pick(raw.date, DATE_STYLES, 'traditional'), program: pick(raw.program, PROGRAM_STYLES, 'classic'),
    guestFrame: pick(raw.guestFrame, GUEST_FRAMES, 'khmer'), motion: pick(raw.motion, MOTION_STYLES, 'elegant'),
    monogram: pick(raw.monogram, MONOGRAM_FRAMES, floral ? 'regal-scroll-gold' : 'ornate'),
    monogramMode: ['auto', 'text', 'names', 'short-names', 'image'].includes(raw.monogramMode) ? raw.monogramMode : 'text', monogramImage: safeIntroMedia(raw.monogramImage),
    ...Object.fromEntries(['groomShortName', 'brideShortName', 'groomShortNameEn', 'brideShortNameEn'].map(key => [key, copy(raw[key], '', 40)])),
    ...Object.fromEntries(Object.entries(FLORAL_COPY).map(([key, fallback]) => [key, copy(raw[key], fallback, key.startsWith('familyIntro') ? 1500 : key.startsWith('openButton') ? 80 : 300)])),
    openButtonPadding: bounded(raw.openButtonPadding, 4, 20, 8),
    openButtonTextSize: bounded(raw.openButtonTextSize, 14, 20, 16),
    guestTextSize: bounded(raw.guestTextSize, 14, 20, 16),
    welcomeSeconds: bounded(raw.welcomeSeconds, 5, 10, 7),
    petalCount: Math.round(bounded(raw.petalCount, 0, 15, 12)),
    butterflyCount: Math.round(bounded(raw.butterflyCount, 0, 15, 12)),
    sideFlorals: raw.sideFlorals !== false,
    sceneBranches: raw.sceneBranches !== false,
    sceneBackground: raw.sceneBackground !== false,
    showCoverDate: raw.showCoverDate !== false,
    showCoverVenue: raw.showCoverVenue !== false,
    showWelcomeContinue: raw.showWelcomeContinue === true,
    headingShape: raw.headingShape === 'straight' ? 'straight' : 'arched',
    monogramSize: bounded(raw.monogramSize, .8, 1.15, 1),
    monogramTextSize: bounded(raw.monogramTextSize, 16, 48, 36),
    monogramTextColor: /^#[a-f\d]{6}$/i.test(raw.monogramTextColor || '') ? raw.monogramTextColor : '#876326',
    monogramAlign: ['left', 'center', 'right'].includes(raw.monogramAlign) ? raw.monogramAlign : 'center',
    monogramTreatment: raw.monogramTreatment === 'champagne' ? 'champagne' : 'original',
    monogramTextLayout: raw.monogramTextLayout === 'staircase' ? 'staircase' : 'centered',
    monogramOpacity: bounded(raw.monogramOpacity, .5, 1, 1),
    monogramOffset: bounded(raw.monogramOffset, -12, 12, 0),
    headingMode: raw.headingMode === 'image' ? 'image' : 'text', headingImage: safeIntroMedia(raw.headingImage),
    headingSize: bounded(raw.headingSize, 20, 40, 30),
    headingAlign: ['left', 'center', 'right'].includes(raw.headingAlign) ? raw.headingAlign : 'center',
    backgroundFit: raw.backgroundFit === 'contain' ? 'contain' : 'cover',
    backgroundX: bounded(raw.backgroundX, 0, 100, 50), backgroundY: bounded(raw.backgroundY, 0, 100, 50),
    backgroundOverlay: bounded(raw.backgroundOverlay, 0, 1, .75), backgroundBlur: bounded(raw.backgroundBlur, 0, 12, 0),
    portraitFrame: ['torn', 'arch', 'gold'].includes(raw.portraitFrame) ? raw.portraitFrame : 'torn',
    gallery: ['carousel', 'grid', 'filmstrip'].includes(raw.gallery) ? raw.gallery : 'carousel',
    map: ['framed', 'plain', 'compact'].includes(raw.map) ? raw.map : 'framed',
    florals: raw.florals !== false,
  };
}
