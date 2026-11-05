import { expect, it } from 'vitest';
import { serializeTemplateConfig } from './templatePersistence';

it('round-trips authored design fields and extensions without copying catalog privileges', () => {
  const design = { galleryImages: ['/fixture.png'], elementFonts: { couple: 'Moul' }, storyText: 'Fictional story', scheduleLayout: 'timeline', backgroundImage: '/fixture-bg.png', showCoverVideo: false, guestLabel: 'Dear guest', guestName: 'Fictional guest', extensionV2: { note: 'preserve' } };
  const value = JSON.parse(serializeTemplateConfig({ ...design, id: 30, name: 'Catalog', premium: true, price: 15, code: 'stable' }, { code: 'stable', sections: [] }));
  expect(value).toMatchObject(design);
  expect(value).toMatchObject({ code: 'stable', sections: [] });
  for (const field of ['id', 'name', 'premium', 'price']) expect(value).not.toHaveProperty(field);
});
