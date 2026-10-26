// A capability describes a renderer, independently of the account's plan.
import { getDedicatedTemplateComponent, templateRegistry } from './templateRegistry';

export function templateCapabilities(template = {}) {
  const key = String(template.code || template.slug || template.presetId || template.id || '').toLowerCase();
  const renderer = getDedicatedTemplateComponent(template);
  if (renderer === templateRegistry['royal-garden-cinematic']) return {
    cinematicIntro: true, familyLayout: true, monogram: true, illustratedMap: true, appearance: true, typography: true,
    party: false, faq: false, dressCode: false, story: false, couplePhoto: false, schedule: true, programDays: true,
    countdown: true, saveTheDate: true, calendar: true, sectionOrdering: true,
  };
  const withoutStory = ['the-digital-yes-wedding', 'emerald-canva-luxe-wedding', 'bliss-editorial-wedding', 'khmer-royal-lotus', 'template-boilerplate'].map(code => templateRegistry[code]);
  const noStory = renderer ? withoutStory.includes(renderer) : /digital-yes|emerald|bliss|royal-lotus|royal_lotus|boilerplate|custom-starter|gold_luxury/.test(key);
  const noSchedule = renderer ? renderer === templateRegistry['template-boilerplate'] : /boilerplate|custom-starter/.test(key);
  const appearance = renderer === templateRegistry['khmer-celestial'];
  const typography = [templateRegistry['khmer-celestial'], templateRegistry['silk-heritage'], templateRegistry['khmer-royal-lotus']].includes(renderer);
  const party = renderer === templateRegistry['khmer-celestial'];
  const detailedGuestSections = renderer !== templateRegistry['khmer-royal-lotus'] && !noSchedule;
  const familyLayout = key !== 'event-essential' && (!renderer || [templateRegistry['khmer-celestial'], templateRegistry['silk-heritage'], templateRegistry['khmer-royal-lotus'], templateRegistry['khmer-golden-canva-inspired-wedding']].includes(renderer));
  return { familyLayout, monogram: familyLayout && key !== 'event-essential', illustratedMap: !noSchedule, appearance, typography, party, faq: detailedGuestSections, dressCode: detailedGuestSections, story: !noStory, schedule: !noSchedule, programDays: !noSchedule, countdown: !noSchedule,
    saveTheDate: !noSchedule, calendar: !noSchedule, sectionOrdering: renderer === templateRegistry['silk-heritage'] };
}
