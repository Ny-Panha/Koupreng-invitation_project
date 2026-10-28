import { safeIntroMedia } from '../../../shared/cinematicIntro';

export function royalDressColors(content) {
  const colors = content.dressColors ?? content.dressCode?.colors;
  return (Array.isArray(colors) ? colors : []).map(color => typeof color === 'string' ? { hex: color, name: '' } : color)
    .filter(color => color && /^#[a-f\d]{6}$/i.test(color.hex || ''));
}

export function hasRoyalDressCode(content) {
  return Boolean(content.dressCode?.name || content.dressCode?.style || content.dressCode?.description || royalDressColors(content).length);
}

export function royalGiftItems(content, canonicalKhqr = false) {
  // Raw canonical KHQR fields win over an earlier preview's projected gift list.
  const source = canonicalKhqr || content.khqrDollar || content.khqrRiel
    ? [content.khqrDollar && { ...content.khqrDollar, id: 'usd', currency: 'USD' }, content.khqrRiel && { ...content.khqrRiel, id: 'khr', currency: 'KHR' }].filter(Boolean)
    : Array.isArray(content.gift) ? content.gift : [];
  return source.map((item, index) => ({ id: item.id || index, currency: item.currency || 'KHQR', bank: item.bankName || item.bank || '', name: item.accountName ?? item.account ?? '', number: item.accountNumber ?? item.number ?? '', src: safeIntroMedia(item.qrUrl ?? item.qrImage ?? '') })).filter(item => item.src);
}
