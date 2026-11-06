import { expect, it } from 'vitest';
import { publicTemplateImage } from './publicTemplateImage';
import { KHMER_FLORAL_GOLD_TEMPLATE } from '../data/templatesData';

it('uses the rendered Floral opening cover for current and legacy catalog thumbnails', () => {
  for (const source of [KHMER_FLORAL_GOLD_TEMPLATE.image, '/templates/khmer-floral-gold/preview.svg']) {
    const image = publicTemplateImage(source);
    expect(image.src).toBe('/templates/khmer-floral-gold/cover-preview-640.webp');
    expect(image.srcSet).toContain('/templates/khmer-floral-gold/cover-preview-960.webp 960w');
  }
});
it('preserves a separately uploaded admin preview', () => {
  expect(publicTemplateImage('/uploads/owner-preview.webp')).toEqual({ src: '/uploads/owner-preview.webp' });
});
