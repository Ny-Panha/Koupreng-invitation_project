// Stable section IDs only. No selectors or URLs are accepted from the iframe.
export const STUDIO_EDIT_SECTIONS = ['cover', 'family', 'invitation', 'countdown', 'schedule', 'venue', 'gallery', 'story', 'dressCode', 'party', 'faq', 'khqr', 'closing'];
export const STUDIO_EDIT_TARGETS = {
  cover: '.kc-opening, .kc-hero, [data-tx-section="hero"]',
  family: '.kc-family, [data-kc-section="family"], [data-tx-section="couple"]',
  invitation: '.kc-invitation, [data-tx-section="message"]',
  countdown: '.kc-countdown, [data-tx-section="countdown"]',
  schedule: '.kc-schedule, [data-tx-section="schedule"]',
  venue: '.kc-venue, [data-tx-section="venue"], [data-tx-section="map"]',
  gallery: '.kc-gallery, [data-tx-section="gallery"]', story: '.kc-story, [data-tx-section="story"]',
  dressCode: '.kc-dress, [data-tx-section="dressCode"]', party: '.kc-party, [data-tx-section="party"]',
  faq: '.kc-faq, [data-tx-section="faq"]', khqr: '.kc-gift, [data-tx-section="gift"]', closing: '.kc-closing',
};
