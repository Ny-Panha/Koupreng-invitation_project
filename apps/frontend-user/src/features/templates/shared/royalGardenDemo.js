import { createMapPreset, MAP_EXAMPLE_DESCRIPTION } from './mapPresets';
import { validProgramDate } from './program';
import { resolveEvent } from './eventDateTime';

// Marketing-only examples. Never merge this into host-authored Studio data.
export function royalGardenDemoContent(existing = {}) {
  const event = resolveEvent(existing);
  const date = validProgramDate(event.date) ? event.date : '2027-06-19';
  const previous = new Date(`${date}T00:00:00Z`); previous.setUTCDate(previous.getUTCDate() - 1);
  const previousDate = previous.toISOString().slice(0, 10);
  const time = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(event.time || '') ? event.time.slice(0, 5) : '17:00';
  return {
    isTemplateDemo: true,
    title: 'Sample wedding · ពិធីមង្គលការគំរូ',
    groomName: 'កឿង វីរៈ', brideName: 'ឡុង សុម៉ាលី', groomEn: 'Sovann', brideEn: 'Dalin',
    eventDate: date, machineEventDate: date, targetDate: date, eventTime: time, eventTimezone: existing.eventTimezone || 'Asia/Phnom_Penh',
    event: { date, receptionTime: time, timezone: existing.eventTimezone || 'Asia/Phnom_Penh' },
    saveTheDate: { version: 1, enabled: true, showCalendar: true, showCountdown: true, countdownStyle: 'circles', showAddToCalendar: true, calendarNavigation: true },
    venueName: 'សាលាឈូកគំរូ · Example Lotus Hall', venueAddress: 'ទីតាំងគំរូ · Illustrative location',
    venue: { name: 'សាលាឈូកគំរូ · Example Lotus Hall', address: 'ទីតាំងគំរូ · Illustrative location', mapLink: '' },
    googleMapUrl: '', googleMapsUrl: '', venueMapMode: 'illustrated',
    illustratedMap: { version: 2, enabled: true, aspectRatio: 'landscape', theme: 'royal-blue', description: { ...MAP_EXAMPLE_DESCRIPTION }, nodes: createMapPreset('royal-blue', { idPrefix: 'royal-demo-map' }), settings: { showLegend: true, showDirectionsButton: false } },
    programDays: [
      { id: 'sample-blessing', date: previousDate, titleKm: 'ពិធីសូត្រមន្ត', titleEn: 'Family blessings' },
      { id: 'sample-wedding', date, titleKm: 'ពិធីមង្គលការ', titleEn: 'Wedding celebration' },
    ],
    schedule: [
      { id: 'sample-monks', dayId: 'sample-blessing', date: previousDate, time: '16:00', titleKm: 'ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត', titleEn: 'Monk blessing ceremony', title: 'ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត' },
      { id: 'sample-procession', dayId: 'sample-wedding', date, time: '07:00', titleKm: 'ពិធីហែជំនូន', titleEn: 'Traditional procession', title: 'ពិធីហែជំនូន' },
      { id: 'sample-vows', dayId: 'sample-wedding', date, time: '09:00', titleKm: 'ពិធីសំពះផ្ទឹម', titleEn: 'Wedding blessings', title: 'ពិធីសំពះផ្ទឹម' },
      { id: 'sample-reception', dayId: 'sample-wedding', date, time, titleKm: 'ពិធីពិសាភោជនាហារ', titleEn: 'Wedding reception', title: 'ពិធីពិសាភោជនាហារ' },
    ],
  };
}
