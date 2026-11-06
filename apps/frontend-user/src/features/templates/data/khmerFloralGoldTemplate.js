import { FLORAL_DEMO_PHOTOS } from './floralDemoMedia';
const root = '/templates/khmer-floral-gold';
const km = {
  title: 'សិរីមង្គលអាពាហ៍ពិពាហ៍', subtitle: 'សូមគោរពអញ្ជើញ',
  messageTitle: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ',
  messageText: 'ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា អញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ ដើម្បីប្រសិទ្ធពរជ័យ សិរីសួស្តី និងជាសក្ខីភាពនៃសេចក្ដីស្រឡាញ់។',
  groomName: 'សុខ ដារ៉ា', brideName: 'លី សុភា',
  groomFather: 'សុខ វណ្ណា', groomMother: 'ចាន់ សុធា', brideFather: 'លី វិសាល', brideMother: 'ម៉ៅ សុភី',
  venueName: 'សាលមង្គល សួនផ្កា', venueAddress: 'រាជធានីភ្នំពេញ កម្ពុជា',
  thankYouTitle: 'សូមថ្លែងអំណរគុណ', thankYouText: 'វត្តមានដ៏មានតម្លៃរបស់លោកអ្នក ជាកិត្តិយស និងជាសេចក្ដីរីករាយដ៏ធំធេងសម្រាប់យើងខ្ញុំ និងក្រុមគ្រួសារទាំងសងខាង។',
  apologyTitle: 'លិខិតសូមអភ័យទោស', apologyText: 'យើងខ្ញុំសូមអភ័យទោស ប្រសិនបើពុំបានអញ្ជើញលោកអ្នកដោយផ្ទាល់។ សូមទទួលយកការអញ្ជើញនេះ ដោយក្ដីគោរព និងស្រឡាញ់។',
};
const en = {
  title: 'Our wedding celebration', subtitle: 'You are warmly invited', messageTitle: 'Together with our families',
  messageText: 'We warmly invite you to celebrate our wedding. Please join our families in sharing the joy, blessings and beautiful beginning of our life together.',
  groomName: 'Sok Dara', brideName: 'Ly Sophea', groomFather: 'Sok Vanna', groomMother: 'Chan Sothea', brideFather: 'Ly Visal', brideMother: 'Mao Sophy',
  venueName: 'Floral Garden Wedding Hall', venueAddress: 'Phnom Penh, Cambodia',
  thankYouTitle: 'With our sincere thanks', thankYouText: 'Your presence means so much to us. Thank you for sharing this joyful day with us and both of our families.',
  apologyTitle: 'A personal invitation', apologyText: 'Please accept this invitation with our warmest regards if we have been unable to invite you in person. We look forward to celebrating together.',
};

export const KHMER_FLORAL_GOLD_TEMPLATE = {
  ...km, id: 'khmer-floral-gold', code: 'khmer-floral-gold', slug: 'khmer-floral-gold', presetId: 'KHMER_FLORAL_GOLD',
  name: 'Khmer Floral Gold', nameKm: 'សិរីមង្គលផ្កាមាស', style: 'Khmer Floral Gold', category: 'TRADITIONAL',
  premium: false, isPremium: false, price: 0, currency: 'USD', languageMode: 'KH',
  supportedEventTypes: ['WEDDING'], supportedLanguages: ['KH', 'EN', 'BOTH'],
  image: `${root}/cover-preview-640.webp`, mainImage: `${root}/couple-960.webp`, phoneCoverImage: `${root}/couple-960.webp`,
  groom: km.groomName, bride: km.brideName, groomEn: en.groomName, brideEn: en.brideName,
  invitationImage: `${root}/groom.webp`, invitationImage2: `${root}/bride.webp`, backgroundImage: `${root}/couple-960.webp`,
  monogramText: 'ដ ស', guestName: 'លោក រ៉ាន់ ណារ៉ាត់ ព្រមទាំងគ្រួសារ',
  dateText: ['weekday', 'day', 'month', 'year'].map(part => new Intl.DateTimeFormat('km-KH', { [part]: ['day', 'year'].includes(part) ? 'numeric' : 'long', timeZone: 'UTC', numberingSystem: 'khmr' }).format(new Date('2027-02-14T12:00:00Z'))).join(' '),
  dateTextEn: 'Sunday, 14 February 2027',
  eventDate: '2027-02-14', eventTime: '17:00', eventTimezone: 'Asia/Phnom_Penh', targetDate: '2027-02-14T17:00:00+07:00',
  gallery: FLORAL_DEMO_PHOTOS,
  sketchMapImage: `${root}/demo-map.svg`, googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Phnom+Penh+Cambodia',
  schedule: [
    { id: 'welcome', time: '07:00', title: 'ពិធីហែជំនូន', titleKm: 'ពិធីហែជំនូន', titleEn: 'Groom’s procession', iconKey: 'procession' },
    { id: 'blessing', time: '09:00', title: 'ពិធីសូត្រមន្ត', titleKm: 'ពិធីសូត្រមន្ត', titleEn: 'Blessing ceremony', iconKey: 'blessing' },
    { id: 'reception', time: '17:00', title: 'ពិធីទទួលភ្ញៀវ និងពិសាភោជនាហារ', titleKm: 'ពិធីទទួលភ្ញៀវ និងពិសាភោជនាហារ', titleEn: 'Wedding reception and dinner', iconKey: 'reception' },
  ],
  localizedContentV1: { version: 1, defaultLocale: 'km', enabledLocales: ['km', 'en'], km, en },
  enabledSections: { family: true, invitation: true, couplePhoto: true, countdown: true, schedule: true, map: true, gallery: true, closing: true, rsvp: true, music: true, story: false, faq: false, gift: false, dressCode: false, party: false },
  design: { presetId: 'KHMER_FLORAL_GOLD', theme: 'KHMER_FLORAL_GOLD', openingStyle: 'floral-paper', primaryColor: '#876326', secondaryColor: '#d5b77a', backgroundColor: '#fffdf8' },
  music: '/music/Noly%20Record%20-%20wedding-Song.mp3',
};
