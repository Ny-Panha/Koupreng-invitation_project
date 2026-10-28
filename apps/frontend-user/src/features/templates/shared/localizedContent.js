// Versioned authored text only. Dates, media, event/guest identity and credentials stay canonical.
export const LOCALIZED_FIELDS = ['title', 'subtitle', 'messageTitle', 'messageText', 'thankYouTitle', 'thankYouText', 'apologyTitle', 'apologyText', 'groomName', 'brideName', 'hostName', 'partnerName', 'groomHonorific', 'brideHonorific', 'groomFather', 'groomMother', 'brideFather', 'brideMother', 'venueName', 'venueAddress', 'eventDateText'];
const text = value => typeof value === 'string' ? value : '';
export const LOCALIZED_COLLECTIONS = { storyChapters: ['kicker', 'title', 'date', 'text'], party: ['name', 'role'], photos: ['alt', 'caption'], faq: ['q', 'a', 'question', 'answer'] };
const rowKey = (row, index) => row.id || `row-${index}`;
export const LOCALIZED_FIELD_LABELS = { title: 'Event title', subtitle: 'Subtitle', messageTitle: 'Invitation heading', messageText: 'Invitation message', thankYouTitle: 'Thank-you heading', thankYouText: 'Thank-you message', apologyTitle: 'Apology heading', apologyText: 'Apology message', groomName: 'First partner', brideName: 'Second partner', hostName: 'Host name', partnerName: 'Second host', groomFather: 'First partner’s father', groomMother: 'First partner’s mother', brideFather: 'Second partner’s father', brideMother: 'Second partner’s mother', groomHonorific: 'First partner’s honorific', brideHonorific: 'Second partner’s honorific', venueName: 'Venue name', venueAddress: 'Venue address' };
export function translationFieldLabel(key) {
  if (LOCALIZED_FIELD_LABELS[key]) return LOCALIZED_FIELD_LABELS[key];
  const section = ({ schedule: 'Program', programDays: 'Program day', family: 'Family', map: 'Map', photos: 'Gallery', storyChapters: 'Story', faq: 'Guest notes', saveTheDate: 'Calendar', dressCode: 'Dress code', party: 'Wedding party' })[key.split('.')[0]] || 'Translation';
  const field = ({ titleEn: 'title', descriptionEn: 'description', locationEn: 'location', q: 'question', a: 'answer', title: 'title', text: 'wording', name: 'name', label: 'label', heading: 'heading', subtitle: 'subtitle', date: 'date wording', alt: 'image description', caption: 'caption', honorific: 'honorific', relationship: 'relationship' })[key.split('.').at(-1)] || 'wording';
  return `${section}: ${field}`;
}
function sectionVisible(form, key) {
  const section = ({ storyChapters: 'story', dressCode: 'dressCode', dressColors: 'dressCode', saveTheDate: 'countdown', photos: 'gallery' })[key] || key;
  return form.enabledSections?.[section] !== false && form.translationCapabilities?.[section === 'countdown' ? 'calendar' : section] !== false
    && form[`show${section[0].toUpperCase()}${section.slice(1)}`] !== false && (key !== 'saveTheDate' || form.saveTheDate?.enabled !== false);
}
export function localeContent(form = {}) {
  const stored = form.localizedContentV1;
  const base = Object.fromEntries(LOCALIZED_FIELDS.map(key => [key, text(form[key])]));
  const legacyEnglish = !stored && String(form.languageMode).toUpperCase() === 'EN';
  return { ...stored, version: 1, km: stored ? { ...stored.km } : legacyEnglish ? {} : base, en: { ...(legacyEnglish ? base : {}), ...stored?.en }, enabledLocales: stored?.enabledLocales || ['km'], defaultLocale: stored?.defaultLocale === 'en' ? 'en' : 'km' };
}
export function editLocalizedField(form, locale, key, value) {
  if (!form.localizedContentV1 && String(form.languageMode).toUpperCase() === 'EN' && locale === 'en') return { ...form, [key]: value };
  if (LOCALIZED_COLLECTIONS[key] || ['dressCode', 'saveTheDate'].includes(key)) {
    const content = localeContent(form);
    const fields = LOCALIZED_COLLECTIONS[key] || (key === 'saveTheDate' ? ['heading', 'subtitle'] : ['name', 'style', 'description']);
    const rows = ['dressCode', 'saveTheDate'].includes(key) ? [value || {}] : value || [];
    const translated = Object.fromEntries(rows.map((row, i) => [rowKey(row, i), Object.fromEntries(fields.map(field => [field, text(row[field])]))]));
    return { ...form, ...(locale === 'km' ? { [key]: value } : {}), localizedContentV1: { ...content, [locale]: { ...content[locale], collections: { ...content[locale]?.collections, [key]: translated } } } };
  }
  if (!LOCALIZED_FIELDS.includes(key)) return { ...form, [key]: value };
  const content = localeContent(form);
  const values = { [key]: value };
  if (['WEDDING', 'ENGAGEMENT'].includes(form.eventType || 'WEDDING')) {
    if (['groomName', 'hostName'].includes(key)) { values.groomName = value; values.hostName = value; }
    if (['brideName', 'partnerName'].includes(key)) { values.brideName = value; values.partnerName = value; }
  }
  return { ...form, ...(locale === 'km' ? values : {}), localizedContentV1: { ...content, [locale]: { ...content[locale], ...values } } };
}
export function translationReadiness(form, locale = 'en') {
  const content = localeContent(form);
  const wedding = ['WEDDING', 'ENGAGEMENT'].includes(form.eventType || 'WEDDING');
  const required = new Set(['title', ...(wedding || text(content.km.messageText).trim() ? ['messageText'] : []), 'venueName', 'venueAddress', ...(wedding ? ['groomName', 'brideName'] : ['hostName'])]);
  for (const key of LOCALIZED_FIELDS) if (text(content.km[key]).trim() && !['eventDateText', ...(wedding ? ['hostName', 'partnerName'] : ['groomName', 'brideName'])].includes(key)) required.add(key);
  const missing = [...required].filter(key => !text(content[locale][key]).trim() || /^(?:todo|tbd|placeholder|translation pending)$/i.test(text(content[locale][key]).trim()));
  const checks = [];
  if (locale === 'en') for (const [key, fields] of Object.entries({ ...LOCALIZED_COLLECTIONS, dressCode: ['name', 'style', 'description'], saveTheDate: ['heading', 'subtitle'] })) {
    if (!sectionVisible(form, key)) continue;
    const rows = ['dressCode', 'saveTheDate'].includes(key) ? [form[key] || {}] : form[key] || [];
    rows.forEach((row, i) => fields.forEach(field => {
      if (text(row[field]).trim()) checks.push([`${key}.${rowKey(row, i)}.${field}`, text(content.en.collections?.[key]?.[rowKey(row, i)]?.[field])]);
    }));
  }
  if (locale === 'en') {
    for (const group of form.familyGroupsV1 || []) {
      if (text(group.label?.km).trim()) checks.push([`family.${group.side}.label`, text(group.label?.en)]);
      for (const member of group.members || []) for (const key of ['name', 'honorific', 'relationship']) if (text(member[key]?.km).trim()) checks.push([`family.${member.id}.${key}`, text(member[key]?.en)]);
    }
    if (form.illustratedMap?.enabled) {
      if (text(form.illustratedMap.description?.km).trim()) checks.push(['map.description', text(form.illustratedMap.description?.en)]);
      for (const node of form.illustratedMap.nodes || []) if (text(node.label?.km).trim()) checks.push([`map.${node.id}.label`, text(node.label?.en)]);
    }
  }
  if (locale === 'en' && sectionVisible(form, 'schedule')) {
    for (const item of form.schedule || []) if (item.enabled !== false) {
      checks.push([`schedule.${item.id}.titleEn`, text(item.titleEn)]);
      if (text(item.location).trim()) checks.push([`schedule.${item.id}.locationEn`, text(item.locationEn)]);
      if (text(item.description).trim()) checks.push([`schedule.${item.id}.descriptionEn`, text(item.descriptionEn)]);
    }
    for (const day of form.programDays || []) if (day.enabled !== false && text(day.title || day.titleKm).trim()) checks.push([`programDays.${day.id}.titleEn`, text(day.titleEn)]);
  }
  for (const [key, value] of checks) if (!value.trim()) missing.push(key);
  const baseMissing = [...required].filter(key => !text(content.km[key]).trim());
  return { baseMissing, baseReady: !baseMissing.length, missing, total: required.size + checks.length, complete: required.size + checks.length - missing.length, ready: !missing.length && (locale !== 'en' || !baseMissing.length) };
}
export function guestLocale(form, requested) {
  if (!form.localizedContentV1) return String(form.languageMode).toLowerCase() === 'en' ? 'en' : 'km';
  const content = localeContent(form);
  return (requested || content.defaultLocale) === 'en' && content.enabledLocales.includes('en') && translationReadiness(form).ready ? 'en' : 'km';
}
export function projectLocale(form, locale) {
  if (!form.localizedContentV1 && (String(form.languageMode).toUpperCase() === 'EN' ? locale === 'en' : locale !== 'en')) return { ...form, languageMode: locale === 'en' ? 'EN' : 'KH' };
  const content = localeContent(form);
  const values = Object.fromEntries(LOCALIZED_FIELDS.map(key => [key, text(content[locale]?.[key])]));
  const collections = {};
  if (locale === 'en') for (const [key, fields] of Object.entries({ ...LOCALIZED_COLLECTIONS, dressCode: ['name', 'style', 'description'], saveTheDate: ['heading', 'subtitle'] })) {
    const rows = ['dressCode', 'saveTheDate'].includes(key) ? [form[key] || {}] : form[key] || [];
    const projected = rows.map((row, i) => ({ ...row, ...Object.fromEntries(fields.map(field => [field, text(content.en.collections?.[key]?.[rowKey(row, i)]?.[field])])) }));
    collections[key] = ['dressCode', 'saveTheDate'].includes(key) ? projected[0] : projected;
  }
  return { ...form, ...values, ...collections, ...(locale === 'en' ? { schedule: (form.schedule || []).map(row => ({ ...row, title: text(row.titleEn), description: text(row.descriptionEn), location: text(row.locationEn) })) } : {}), message: values.messageText, languageMode: locale === 'en' ? 'EN' : 'KH', contentLocale: locale,
    couple: { ...form.couple, groom: values.groomName, bride: values.brideName },
    event: { ...form.event, title: values.title, venueName: values.venueName, venueAddress: values.venueAddress },
    groomParents: [values.groomFather, values.groomMother].filter(Boolean), brideParents: [values.brideFather, values.brideMother].filter(Boolean),
    family: { ...form.family, groomParents: [values.groomFather, values.groomMother].filter(Boolean), brideParents: [values.brideFather, values.brideMother].filter(Boolean) } };
}
