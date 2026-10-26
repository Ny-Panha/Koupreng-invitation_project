export function translationSection(key) {
  if (/^(schedule|programDays)\./.test(key)) return 'schedule';
  if (key.startsWith('map.') || /^venue/.test(key)) return 'venue';
  if (key.startsWith('family.') || /Father|Mother|Honorific/.test(key)) return 'family';
  if (/message/i.test(key)) return 'invitation';
  if (/thankYou|apology/.test(key)) return 'closing';
  return ({ saveTheDate: 'countdown', storyChapters: 'story', photos: 'gallery', faq: 'faq', party: 'party', dressCode: 'dressCode' })[key.split('.')[0]] || 'eventInfo';
}
