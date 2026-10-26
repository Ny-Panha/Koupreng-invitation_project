export const COUPLE_LAYOUTS = ['template-default', 'groom-left', 'bride-left', 'stacked', 'centered'];
export function invitationFeatureFields(source = {}) {
  return Object.fromEntries(['groomHonorific', 'brideHonorific', 'coupleLayout', 'familyGroupsV1', 'coupleMonogram', 'illustratedMap', 'cinematicIntro', 'venueMapMode'].filter(key => Object.hasOwn(source, key)).map(key => [key, source[key]]));
}
export const usesFamilyLayout = content => Boolean(content.familyGroupsV1?.length || content.coupleMonogram?.enabled || (content.coupleLayout && content.coupleLayout !== 'template-default'));
export function safeDirections(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && ['google.com', 'www.google.com', 'maps.google.com', 'google.com.kh', 'www.google.com.kh', 'maps.google.com.kh', 'goo.gl', 'maps.app.goo.gl'].includes(url.hostname) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
