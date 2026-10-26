// Editable starting points, inherited formal wording remains subject to Khmer editorial review.
export const WORDING_PRESETS = {
  formal: {
    km: { messageTitle: 'យើងខ្ញុំ និងក្រុមគ្រួសារទាំងសងខាង', messageText: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ លោក លោកស្រី និងក្រុមគ្រួសារ ចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។', thankYouTitle: 'សូមថ្លែងអំណរគុណ', thankYouText: 'សូមអរគុណចំពោះវត្តមានដ៏មានតម្លៃ និងការជូនពរដ៏ល្អប្រពៃរបស់លោកអ្នក។', apologyTitle: 'សូមអភ័យទោស', apologyText: 'យើងខ្ញុំសូមអភ័យទោសចំពោះកំហុសឆ្គង ឬការខ្វះខាតដោយអចេតនា។' },
    en: { messageTitle: 'Together with our families', messageText: 'We warmly invite you to celebrate our wedding. Your presence will make our day complete.', thankYouTitle: 'With heartfelt thanks', thankYouText: 'Thank you for sharing this special day with us and for your warm wishes.', apologyTitle: 'Our sincere apologies', apologyText: 'Please accept our apologies for any unintentional omission or inconvenience.' },
  },
  neutral: {
    km: { messageTitle: 'សូមគោរពអញ្ជើញ', messageText: 'សូមអញ្ជើញចូលរួមកម្មវិធីរបស់យើងខ្ញុំ នៅ [venue_name]។', thankYouTitle: 'សូមអរគុណ', thankYouText: 'សូមអរគុណចំពោះការចូលរួម។', apologyTitle: '', apologyText: '' },
    en: { messageTitle: 'You are invited', messageText: 'Please join us for our event at [venue_name].', thankYouTitle: 'Thank you', thankYouText: 'Thank you for joining us.', apologyTitle: '', apologyText: '' },
  },
};
// Reuse the separately editable closing/apology pair; invitation styles never infer titles.
const invitationStyles = {
  modern: {
    km: { messageTitle: 'សូមអញ្ជើញចូលរួមថ្ងៃពិសេសរបស់យើង', messageText: 'យើងខ្ញុំរីករាយសូមអញ្ជើញលោកអ្នកចូលរួមអបអរសាទរមង្គលការរបស់យើងខ្ញុំ នៅ [venue_name]។' },
    en: { messageTitle: 'Celebrate with us', messageText: 'Join us as we begin our next chapter together. We look forward to celebrating with you at [venue_name].' },
  },
  family: {
    km: { messageTitle: 'យើងខ្ញុំ និងក្រុមគ្រួសារទាំងសងខាង', messageText: 'យើងខ្ញុំ និងក្រុមគ្រួសារទាំងសងខាង មានកិត្តិយសសូមគោរពអញ្ជើញលោកអ្នក ចូលរួមពិធីមង្គលការរបស់ [groom_name] និង [bride_name] នៅ [venue_name]។' },
    en: { messageTitle: 'Together with our families', messageText: 'Our families warmly invite you to the wedding of [groom_name] and [bride_name] at [venue_name]. We would be honoured by your presence.' },
  },
  welcome: {
    km: { messageTitle: 'សូមស្វាគមន៍', messageText: 'យើងខ្ញុំសូមស្វាគមន៍លោកអ្នក និងសូមអរគុណចំពោះការចូលរួមចែករំលែកថ្ងៃពិសេសនេះជាមួយយើងខ្ញុំ។' },
    en: { messageTitle: 'Welcome', messageText: 'Welcome to our celebration. Thank you for sharing this special day with us.' },
  },
  rsvp: {
    km: { messageTitle: 'សូមអញ្ជើញចូលរួម', messageText: 'សូមអញ្ជើញចូលរួមកម្មវិធីរបស់យើងខ្ញុំ។ សូមជួយបញ្ជាក់ការចូលរួមតាមទម្រង់ឆ្លើយតបខាងក្រោម ដើម្បីឱ្យយើងខ្ញុំអាចត្រៀមទទួលលោកអ្នកបានល្អ។' },
    en: { messageTitle: 'We hope you can join us', messageText: 'Please let us know whether you can attend using the response form below, so we can prepare to welcome you.' },
  },
};
for (const [id, pair] of Object.entries(invitationStyles)) {
  WORDING_PRESETS[id] = Object.fromEntries(['km', 'en'].map(locale => [locale, { ...WORDING_PRESETS.formal[locale], ...pair[locale] }]));
}
export const WORDING_PRESET_LABELS = { formal: 'Traditional formal wedding', modern: 'Warm modern invitation', family: 'Formal family invitation', welcome: 'Welcome / introduction', rsvp: 'RSVP guidance', neutral: 'Neutral event wording' };
export const wordingPresetId = value => Object.hasOwn(WORDING_PRESETS, value) ? value : 'formal';
export function interpolateWording(template, values) {
  const missing = [];
  const text = String(template).replace(/\[([a-z_]+)\]/g, (token, key) => {
    const allowed = ['guest_honorific', 'guest_name', 'groom_name', 'bride_name', 'event_date', 'event_time', 'venue_name', 'venue_address'];
    const value = allowed.includes(key) && typeof values[key] === 'string' ? values[key].trim() : '';
    if (!value) { missing.push(key); return token; }
    return value;
  });
  return { text, missing };
}
