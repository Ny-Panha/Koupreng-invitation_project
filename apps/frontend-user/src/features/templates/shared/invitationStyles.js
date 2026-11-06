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
export function invitationStyles(content = {}) {
  const raw = content.invitationStyleV1 || {};
  const floral = [content.code, content.variant, content.templateId, content.presetId].some(id => ['khmer-floral-gold', 'KHMER_FLORAL_GOLD'].includes(id));
  return {
    version: 1,
    date: pick(raw.date, DATE_STYLES, 'traditional'), program: pick(raw.program, PROGRAM_STYLES, 'classic'),
    guestFrame: pick(raw.guestFrame, GUEST_FRAMES, 'khmer'), motion: pick(raw.motion, MOTION_STYLES, 'elegant'),
    monogram: pick(raw.monogram, MONOGRAM_FRAMES, floral ? 'regal-scroll-gold' : 'ornate'),
    monogramMode: ['auto', 'text', 'names', 'image'].includes(raw.monogramMode) ? raw.monogramMode : 'text', monogramImage: safeIntroMedia(raw.monogramImage),
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
