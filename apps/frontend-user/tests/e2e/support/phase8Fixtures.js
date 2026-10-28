import { installIdentityFixtures } from './templateIdentityFixtures';

export const phase8Content = {
  futureExtension: { preserve: 'authored metadata' }, eventTimezone: 'Asia/Phnom_Penh', calendarUid: 'phase8-fictional-event',
  saveTheDate: { enabled: true, showCountdown: true, showCalendar: true, showAddToCalendar: true, calendarNavigation: true, countdownStyle: 'circles', subtitle: 'We look forward to celebrating with you.' },
  programDays: [{ id: 'first', date: '2027-12-04', title: 'ពិធីថ្ងៃទី១', titleEn: 'The first day' }, { id: 'second', date: '2027-12-05', title: 'ពិធីថ្ងៃទី២', titleEn: 'The wedding day' }],
  schedule: [
    { id: 'first-ceremony', day: 1, dayId: 'first', time: '15:00', title: 'ពិធីមង្គលការ', titleEn: 'Family ceremony', description: 'សូមអញ្ជើញភ្ញៀវកិត្តិយសចូលរួមកម្មវិធីមង្គលការ។ '.repeat(5), descriptionEn: 'Our families gather to celebrate with us. '.repeat(4), note: 'preserve row extension' },
    { id: 'second-ceremony', day: 2, dayId: 'second', time: '06:30', title: 'ពិធីហែជំនូន', titleEn: 'Wedding ceremony', description: 'សូមអញ្ជើញភ្ញៀវកិត្តិយសចូលរួមពិធី។', descriptionEn: 'Please join our celebration.' },
  ],
};
export async function phase8Fixtures(page, { lang = 'en', code = 'khmer-celestial', content = phase8Content, preservePreferences = false } = {}) {
  const catalog = [{ id: 4, code, name: code, status: 'ACTIVE', supportedEventTypes: ['WEDDING'], supportedLanguages: ['KH','EN','BOTH'] }];
  const state = await installIdentityFixtures(page, { catalog, lang, preservePreferences });
  state.events.set(101, { ...state.events.get(101), templateCode: code, venueAddress: 'Fictional Phnom Penh address', eventDate: '2027-12-05', languageMode: lang === 'en' ? 'EN' : 'KH', contentJson: JSON.stringify(content), enabledSections: JSON.stringify({ story: false, gallery: false, gift: false, dressCode: false, faq: false, rsvp: false }) });
  return state;
}
