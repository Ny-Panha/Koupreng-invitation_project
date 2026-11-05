import { KHMER_FLORAL_GOLD_TEMPLATE as artwork } from './khmerFloralGoldTemplate';

// Called only when constructing the marketing catalog, never by owner/public adapters.
export function floralDemoFromCelestial(source) {
  const date = source.machineEventDate.slice(0, 10);
  const km = { ...artwork.localizedContentV1.km,
    title: source.title, groomName: source.groom, brideName: source.bride,
    groomFather: source.family.groomParents[0], groomMother: source.family.groomParents[1],
    brideFather: source.family.brideParents[0], brideMother: source.family.brideParents[1],
    messageTitle: source.messageTitle, messageText: source.message,
    venueName: source.venueName, venueAddress: source.venueAddress,
    thankYouTitle: source.thankYouTitle, thankYouText: source.thankYouText,
    apologyTitle: source.apologyTitle, apologyText: source.apologyText,
  };
  const en = { ...artwork.localizedContentV1.en,
    groomName: source.groomEn, brideName: source.brideEn,
    groomFather: 'Khun Sivkheng', groomMother: 'Kuy Daly', brideFather: 'Lam Kimlong', brideMother: 'Leng Young',
    venueName: 'Himawari Hotel, Phnom Penh', venueAddress: 'Sisowath Quay, Phnom Penh',
  };
  const englishProgram = ['Krong Peali blessing', 'Gathering of guests', 'Groom’s procession', 'Ring ceremony', 'Monk blessing', 'Hair-cutting ceremony', 'Sompeas Ptem and blessings', 'Lunch', 'Reception and dinner'];
  return { ...artwork, ...km, groom: source.groom, bride: source.bride, groomEn: source.groomEn, brideEn: source.brideEn,
    family: structuredClone(source.family), monogramText: [source.groom, source.bride].map(name => Array.from(name.split(' ').at(-1))[0]).join(' '),
    dateText: source.dateText, dateTextEn: source.dateTextEn, eventDate: date, eventTime: '17:00', targetDate: source.machineEventDate,
    schedule: source.schedule.map((item, index) => ({ ...item, titleKm: item.title, titleEn: englishProgram[index] || item.title })),
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(source.mapQuery)}`,
    localizedContentV1: { version: 1, defaultLocale: 'km', enabledLocales: ['km', 'en'], km, en },
  };
}
