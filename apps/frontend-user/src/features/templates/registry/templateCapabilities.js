// A capability describes a renderer, independently of the account's plan.
import { getDedicatedTemplateComponent, templateRegistry } from './templateRegistry';

export function templateCapabilities(template = {}) {
  const key = String(template.code || template.slug || template.presetId || template.id || '').toLowerCase();
  const renderer = getDedicatedTemplateComponent(template);
  const withoutStory = ['the-digital-yes-wedding', 'emerald-canva-luxe-wedding', 'bliss-editorial-wedding', 'khmer-royal-lotus', 'template-boilerplate'].map(code => templateRegistry[code]);
  const noStory = renderer ? withoutStory.includes(renderer) : /digital-yes|emerald|bliss|royal-lotus|royal_lotus|boilerplate|custom-starter|gold_luxury/.test(key);
  const noSchedule = renderer ? renderer === templateRegistry['template-boilerplate'] : /boilerplate|custom-starter/.test(key);
  return { story: !noStory, schedule: !noSchedule, programDays: [1, 2] };
}
