export const STUDIO_TABS = [
  { id: 'eventInformation', labels: ['ព័ត៌មានកម្មវិធី', 'Event Information'], sections: ['eventInfo', 'family', 'invitation', 'closing', 'languageMode'] },
  { id: 'scheduleVenue', labels: ['កម្មវិធី និងទីតាំង', 'Schedule & Venue'], sections: ['schedule', 'countdown', 'venue'] },
  { id: 'mediaOpening', labels: ['មេឌៀ និងការបើកធៀប', 'Media & Opening'], sections: ['cinematicIntro', 'gallery', 'couplePhoto', 'music', 'preWeddingVideo'] },
  { id: 'designCover', labels: ['រចនា និងក្របធៀប', 'Design & Cover'], sections: ['cover', 'appearance'] },
  { id: 'guestExperience', labels: ['បទពិសោធន៍ភ្ញៀវ', 'Guest Experience'], sections: ['story', 'dressCode', 'party', 'faq', 'khqr'] },
  { id: 'ticketsQr', labels: ['កាតអញ្ជើញ និង QR', 'Tickets & QR'], sections: ['ticketsQr'] },
];

export const STUDIO_SECTION_LABELS = {
  cinematicIntro: ['ការបើកធៀបបែបភាពយន្ត', 'Cinematic intro'],
  eventInfo: ['ព័ត៌មានកម្មវិធី', 'Event details'], family: ['មាតាបិតា', 'Families'],
  invitation: ['សារអញ្ជើញ', 'Invitation message'], closing: ['សារបញ្ចប់', 'Closing messages'], languageMode: ['ភាសាមាតិកា', 'Invitation language'],
  schedule: ['កាលវិភាគ', 'Schedule'], countdown: ['កំណត់ថ្ងៃ និងប្រតិទិន', 'Save the date & calendar'], venue: ['ទីតាំង', 'Venue & map'],
  gallery: ['វិចិត្រសាល', 'Gallery'], couplePhoto: ['រូបគូស្វាមីភរិយា', 'Couple photos'], music: ['តន្ត្រី', 'Music'],
  preWeddingVideo: ['វីដេអូមុនអាពាហ៍ពិពាហ៍', 'Pre-wedding video'], cover: ['ក្របធៀប', 'Invitation cover'], appearance: ['ពណ៌ និងអក្សរ', 'Colors & typography'],
  story: ['រឿងរ៉ាវ', 'Our story'], dressCode: ['សម្លៀកបំពាក់', 'Dress code'], party: ['ក្រុមអម', 'Wedding party'], faq: ['សំណួរ និងចម្លើយ', 'Guest notes'], khqr: ['ចំណងដៃ KHQR', 'Gift KHQR'],
};

export function studioTabForSection(key) {
  return STUDIO_TABS.find(tab => tab.id === key || tab.sections.includes(key)) || STUDIO_TABS[0];
}

export function resolveStudioSection(key, sections) {
  if (sections.includes(key) || key === 'ticketsQr') return key;
  const tab = STUDIO_TABS.find(tab => tab.id === key || tab.sections.includes(key));
  return tab?.sections.find(section => sections.includes(section)) || tab?.id || sections[0] || 'eventInfo';
}
