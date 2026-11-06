import { KHMER_FLORAL_GOLD_TEMPLATE as artwork } from './khmerFloralGoldTemplate';

// Called only when constructing the marketing catalog, never by owner/public adapters.
export function floralDemoFromCelestial(source) {
  const date = source.machineEventDate.slice(0, 10);
  const firstDay = new Date(`${date}T12:00:00Z`);
  firstDay.setUTCDate(firstDay.getUTCDate() - 1);
  const firstDate = firstDay.toISOString().slice(0, 10);
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
    family: structuredClone(source.family), monogramText: 'វីរៈ\n&\nសុម៉ាលី',
    invitationStyleV1: { version: 1, monogramTextLayout: 'staircase' },
    dateText: source.dateText, dateTextEn: source.dateTextEn, eventDate: date, eventTime: '17:00', targetDate: source.machineEventDate,
    programDays: [
      { id: 'floral-day-1', day: 1, date: firstDate, titleKm: 'ថ្ងៃទី ១', titleEn: 'Day 1' },
      { id: 'floral-day-2', day: 2, date, titleKm: 'ថ្ងៃទី ២', titleEn: 'Day 2' },
    ],
    schedule: source.schedule.map((item, index) => ({ ...item, day: index < 2 ? 1 : 2, dayId: index < 2 ? 'floral-day-1' : 'floral-day-2', date: index < 2 ? firstDate : date, titleKm: item.title, titleEn: englishProgram[index] || item.title })),
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(source.mapQuery)}`,
    localizedContentV1: { version: 1, defaultLocale: 'km', enabledLocales: ['km', 'en'], km, en },
  };
}
