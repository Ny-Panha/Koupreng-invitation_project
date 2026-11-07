import { createMapPreset, MAP_EXAMPLE_DESCRIPTION } from './mapPresets';
import { validProgramDate } from './program';
import { resolveEvent } from './eventDateTime';
import { KHMER_CELESTIAL_PROGRAMME } from './khmerCelestialProgramme';

const PHOTO_ROOT = '/templates/royal-garden/v4/pich-pisey';
export const ROYAL_GARDEN_DEMO_PHOTOS = [3, 8, 1, 12, 9, 2, 4, 7, 6, 10, 11, 5].map(index => ({
  id: `pich-pisey-${index}`, src: `${PHOTO_ROOT}/photo-${String(index).padStart(2, '0')}-1280.webp`,
  thumbnail: `${PHOTO_ROOT}/photo-${String(index).padStart(2, '0')}-480.webp`,
  width: 1280, height: [3, 8, 11].includes(index) ? 1920 : 853,
  alt: `Pich and Pisey wedding memory ${index}`, fullWidth: index === 11,
}));

// Marketing-only examples. Never merge this into host-authored Studio data.
export function royalGardenDemoContent(existing = {}) {
  const event = resolveEvent(existing);
  const date = validProgramDate(event.date) ? event.date : '2027-06-19';
  const previous = new Date(`${date}T00:00:00Z`); previous.setUTCDate(previous.getUTCDate() - 1);
  const previousDate = previous.toISOString().slice(0, 10);
  const time = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(event.time || '') ? event.time.slice(0, 5) : '17:00';
  return {
    isTemplateDemo: true,
    couplePhoto: `${PHOTO_ROOT}/photo-03-1280.webp`, coverBackgroundImage: `${PHOTO_ROOT}/photo-03-1280.webp`,
    photos: ROYAL_GARDEN_DEMO_PHOTOS,
    sectionOrder: ['family', 'invitation', 'countdown', 'venue', 'schedule', 'gallery', 'gift', 'rsvp', 'wishes', 'closing'],
    cinematicIntro: { ...(existing.cinematicIntro || {}), style: 'royal-arch', heading:'សិរីមង្គលអាពាហ៍ពិពាហ៍', titleMode:'artwork',artworkSrc:'/templates/royal-garden/golden-calligraphy.webp',artworkAlt:'សិរីមង្គលអាពាហ៍ពិពាហ៍ · Save the Date', buttonStyle: 'circle', curtainEnabled: true, curtainSpeed: 'standard' },
    informationScene: { ...(existing.informationScene || {}), colorPreset: 'burgundy-heritage', galleryPresentation: 'collage', motionPreset:'cinematic', effects:{sparkles:true,petals:true,butterfly:true,goldDust:true,...existing.informationScene?.effects} },
    title: 'សិរីមង្គលអាពាហ៍ពិពាហ៍',
    groomName:'កឿង វីរៈ', brideName:'ឡុង សុម៉ាលី', groomEn:'Koeurng Vireak', brideEn:'Long Somaly',
    groomFather:'លោក ឃុន ស៊ីវខេង', groomMother:'លោកស្រី គុយ ដាលី', groomFatherEn:'Mr. Khun Sievkheng', groomMotherEn:'Mrs. Kuy Daly',
    brideFather:'លោក ឡាំ គីមឡុង', brideMother:'លោកស្រី ឡេង យ៉ុងស៊ី', brideFatherEn:'Mr. Lam Kimlong', brideMotherEn:'Mrs. Leng Yongsy',
    familyHeading:'គ្រួសារទាំងសងខាង', familyHeadingEn:'Our families',
    family:{...(existing.family || {}),groomTitle:'ខាងកូនប្រុស',groomTitleEn:'Groom’s family',brideTitle:'ខាងកូនស្រី',brideTitleEn:'Bride’s family',groomParents:['លោក ឃុន ស៊ីវខេង','លោកស្រី គុយ ដាលី'],groomParentsEn:['Mr. Khun Sievkheng','Mrs. Kuy Daly'],brideParents:['លោក ឡាំ គីមឡុង','លោកស្រី ឡេង យ៉ុងស៊ី'],brideParentsEn:['Mr. Lam Kimlong','Mrs. Leng Yongsy']},
    messageTitleEn:'Together with our families',scheduleEndingEn:'Thank you for celebrating with us!',
    thankYouTitleEn:'With heartfelt thanks',thankYouTextEn:'We and our families are grateful for your presence and blessings. Thank you for celebrating this special day with us.',
    apologyTitleEn:'A personal invitation',apologyTextEn:'Please accept our apologies if we could not deliver your invitation in person. We warmly welcome you to celebrate with our families.',
    eventDate: date, machineEventDate: date, targetDate: date, eventTime: time, eventTimezone: existing.eventTimezone || 'Asia/Phnom_Penh',
    event: { date, receptionTime: time, timezone: existing.eventTimezone || 'Asia/Phnom_Penh' },
    saveTheDate: { version: 1, enabled: true, showCalendar: true, showCountdown: true, countdownStyle: 'theme', showAddToCalendar: true, calendarNavigation: true },
    venueName:'ទីតាំងពិធីមង្គលការ',venueNameEn:'Wedding venue',venueAddress:'',venueAddressEn:'',
    venue:{name:'ទីតាំងពិធីមង្គលការ',address:'',mapLink:'https://maps.app.goo.gl/GwpoP4BhtsvgtUph9'},
    googleMapUrl:'https://maps.app.goo.gl/GwpoP4BhtsvgtUph9',googleMapsUrl:'https://maps.app.goo.gl/GwpoP4BhtsvgtUph9',venueMapMode:'illustrated',
    illustratedMap: { version: 2, enabled: true, aspectRatio: 'landscape', theme: 'royal-blue', description: { ...MAP_EXAMPLE_DESCRIPTION }, nodes: createMapPreset('royal-blue', { idPrefix: 'royal-demo-map' }).map(node=>({...node,label:{...node.label,en:node.label?.en?.replace(/^Example\s+/i,''),km:node.label?.km?.replace(/គំរូ/g,'').trim()}})), settings: { showLegend: false, showDirectionsButton: true } },
    programDays: [
      { id: 'sample-blessing', date: previousDate, titleKm: 'ពិធីសូត្រមន្ត', titleEn: 'Family blessings' },
      { id: 'sample-wedding', date, titleKm: 'ពិធីមង្គលការ', titleEn: 'Wedding celebration' },
    ],
    schedule: [
      { id: 'sample-monks', iconKey: 'blessing', dayId: 'sample-blessing', date: previousDate, time: '16:00', titleKm: 'ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត', titleEn: 'Monk blessing ceremony', title: 'ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត' },
      ...KHMER_CELESTIAL_PROGRAMME.map(row=>({...row,id:`sample-${row.id}`,dayId:'sample-wedding',date,time:row.id==='dinner' ? time : row.time,title:row.titleKm})),
    ],
  };
}
