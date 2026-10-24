// A capability describes a renderer, independently of the account's plan.
export function templateCapabilities(template = {}) {
  const key = String(template.code || template.slug || template.presetId || template.id || '').toLowerCase();
  const noStory = /digital-yes|emerald|bliss|royal-lotus|royal_lotus|boilerplate|custom-starter|gold_luxury/.test(key);
  return { story: !noStory, schedule: !/boilerplate|custom-starter/.test(key), programDays: [1, 2] };
}
