import { expect, it } from 'vitest';
import { DefaultTemplateLayout, getDedicatedTemplateComponent, resolveTemplateRenderer, templateRegistry } from './registry/templateRegistry';

const groups = {
  'khmer-floral-gold': ['khmer-floral-gold','KHMER_FLORAL_GOLD'],
  'royal-garden-cinematic': ['royal-garden-cinematic','ROYAL_GARDEN_CINEMATIC'],
  'silk-heritage': ['silk-heritage','SILK_HERITAGE'],
  'template-boilerplate': ['template-boilerplate','custom-starter'],
  'khmer-celestial': ['khmer-celestial','KHMER_CELESTIAL','10','royal-khmer-wedding','1','royal-khmer','RUBY_RED','ROYAL_KHMER'],
  'the-digital-yes-wedding': ['the-digital-yes-wedding','7','digital-yes','GOLD_LUXURY'],
  'emerald-canva-luxe-wedding': ['emerald-canva-luxe-wedding','emerald_royal_luxe','emerald-royal-luxe','emerald royal luxe','emerald-luxe-wedding','9','2','emerald-luxe','EMERALD_GREEN'],
  'withjoy-modern-portal': ['withjoy-modern-portal','3'],
  'bliss-editorial-wedding': ['bliss-editorial-wedding','4'],
  'cover-khmer-golden-wedding': ['khmer-golden-canva-inspired-wedding','cover-khmer-golden-wedding','5','CHAMPAGNE','KHMER_GOLDEN'],
};
it('accounts for all 38 aliases without duplicates or omitted source keys', () => {
  const all=Object.values(groups).flat();
  expect(all).toHaveLength(38); expect(new Set(all).size).toBe(38);
  expect([...all].sort()).toEqual(Object.keys(templateRegistry).sort());
});
for (const [family, aliases] of Object.entries(groups)) {
  for (const alias of aliases) it(`${alias} preserves ${family} renderer identity`, () => {
    expect(getDedicatedTemplateComponent({ code:alias, id:99999 })).toBe(templateRegistry[family]);
  });
  it(`${family} wins over an unrelated legacy numeric identity`, () => {
    expect(getDedicatedTemplateComponent({ slug:family, id:family==='khmer-celestial'?7:1 })).toBe(templateRegistry[family]);
  });
}
it('unknown stable code cannot inherit numeric purchase identity or default variant', () => {
  expect(getDedicatedTemplateComponent({ code:'unmapped-owner-design', id:7 }, 'digital-yes')).toBeNull();
  expect(getDedicatedTemplateComponent({ code:'unmapped-owner-design', id:7 }, null, true)).toBe(DefaultTemplateLayout);
  expect(resolveTemplateRenderer({ code:'unmapped-owner-design', id:7 }).available).toBe(false);
  expect(getDedicatedTemplateComponent({ code:'unmapped-owner-design', id:7, presetId:'EMERALD_GREEN' })).toBe(templateRegistry['emerald-luxe']);
});
it.each(['event-essential','koupreng-demo-wedding'])('%s is an available shared identity without a dedicated duplicate', code => {
  expect(resolveTemplateRenderer({code})).toMatchObject({id:code,component:null,available:true});
});
