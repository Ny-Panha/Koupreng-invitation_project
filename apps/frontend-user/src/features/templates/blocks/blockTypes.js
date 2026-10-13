/**
 * BLOCK_TYPES — Canonical dictionary of supported CMS block type identifiers.
 * NOTE: Never rename or reassign a type after release — saved database JSON documents depend on these keys.
 */
export const BLOCK_TYPES = Object.freeze({
  HERO_COVER: "HERO_COVER",
  CUSTOM_IMAGE: "CUSTOM_IMAGE",
  CUSTOM_TEXT: "CUSTOM_TEXT",
  HORIZONTAL_SCROLL_SHOWCASE: "HORIZONTAL_SCROLL_SHOWCASE",
  SCHEDULE: "SCHEDULE",
  GALLERY: "GALLERY",
  BANK_QR: "BANK_QR",
  RSVP: "RSVP",
  MAP: "MAP",
  COUNTDOWN: "COUNTDOWN",
  LEGACY_TEMPLATE: "LEGACY_TEMPLATE",
  LEGACY_SECTION: "LEGACY_SECTION",
});
