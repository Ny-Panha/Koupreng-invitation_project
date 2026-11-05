// A capability describes a renderer, independently of the account's plan.
import { getDedicatedTemplateComponent, templateRegistry } from './templateRegistry';

export function templateCapabilities(template = {}) {
  const key = String(template.code || template.slug || template.presetId || template.id || '').toLowerCase();
  const renderer = getDedicatedTemplateComponent(template);
  if (renderer === templateRegistry['khmer-floral-gold']) return {
    familyLayout: true, monogram: false, illustratedMap: false, preWeddingVideo: true, khqr: false, appearance: true, typography: true,
    coverStyles: true, dateStyles: true, programStyles: true,
    party: false, faq: false, dressCode: false, story: false, couplePhoto: true, schedule: true, programDays: true,
    countdown: true, saveTheDate: true, calendar: true, sectionOrdering: true,
  };
  if (renderer === templateRegistry['royal-garden-cinematic']) return {
    programStyles: true,
    cinematicIntro: true, familyLayout: true, monogram: true, illustratedMap: true, appearance: true, typography: true,
    party: false, faq: false, dressCode: true, story: false, couplePhoto: false, schedule: true, programDays: true,
    countdown: true, saveTheDate: true, calendar: true, sectionOrdering: true,
  };
  const withoutStory = ['the-digital-yes-wedding', 'emerald-canva-luxe-wedding', 'bliss-editorial-wedding', 'template-boilerplate'].map(code => templateRegistry[code]);
  const noStory = renderer ? withoutStory.includes(renderer) : /digital-yes|emerald|bliss|boilerplate|custom-starter|gold_luxury/.test(key);
  const noSchedule = renderer ? renderer === templateRegistry['template-boilerplate'] : /boilerplate|custom-starter/.test(key);
  const appearance = renderer === templateRegistry['khmer-celestial'];
  const typography = [templateRegistry['khmer-celestial'], templateRegistry['silk-heritage']].includes(renderer);
  const party = renderer === templateRegistry['khmer-celestial'];
  const detailedGuestSections = !noSchedule;
  const familyLayout = key !== 'event-essential' && (!renderer || [templateRegistry['khmer-celestial'], templateRegistry['silk-heritage'], templateRegistry['khmer-golden-canva-inspired-wedding']].includes(renderer));
  const sharedStyles = !renderer || ['khmer-celestial', 'silk-heritage', 'the-digital-yes-wedding', 'emerald-canva-luxe-wedding', 'withjoy-modern-portal', 'bliss-editorial-wedding', 'khmer-golden-canva-inspired-wedding'].some(code => renderer === templateRegistry[code]);
  return { dateStyles: sharedStyles && !noSchedule, programStyles: sharedStyles && !noSchedule, familyLayout, monogram: familyLayout && key !== 'event-essential', illustratedMap: !noSchedule, appearance, typography, party, faq: detailedGuestSections, dressCode: detailedGuestSections, story: !noStory, schedule: !noSchedule, programDays: !noSchedule, countdown: !noSchedule,
    saveTheDate: !noSchedule, calendar: !noSchedule, sectionOrdering: renderer === templateRegistry['silk-heritage'] };
}
