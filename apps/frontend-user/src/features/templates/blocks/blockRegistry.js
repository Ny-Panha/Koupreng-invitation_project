import { BLOCK_TYPES } from "./blockTypes";
import CustomImageBlock from "./CustomImageBlock";
import CustomTextBlock from "./CustomTextBlock";
import HorizontalScrollSection from "./HorizontalScrollSection";
import LegacyTemplateBlock from "./LegacyTemplateBlock";
import LegacySectionBlock from "./LegacySectionBlock";
import {
  HeroCoverBlock,
  ScheduleBlock,
  GalleryBlock,
  CountdownBlock,
  MapBlock,
  BankQrBlock,
  RsvpBlock,
} from "./StandardBlocks";

/**
 * BLOCK_COMPONENTS — Registry mapping every BLOCK_TYPES enum value to its UI renderer component.
 */
export const BLOCK_COMPONENTS = Object.freeze({
  [BLOCK_TYPES.HERO_COVER]: HeroCoverBlock,
  [BLOCK_TYPES.CUSTOM_IMAGE]: CustomImageBlock,
  [BLOCK_TYPES.CUSTOM_TEXT]: CustomTextBlock,
  [BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE]: HorizontalScrollSection,
  [BLOCK_TYPES.SCHEDULE]: ScheduleBlock,
  [BLOCK_TYPES.GALLERY]: GalleryBlock,
  [BLOCK_TYPES.BANK_QR]: BankQrBlock,
  [BLOCK_TYPES.RSVP]: RsvpBlock,
  [BLOCK_TYPES.MAP]: MapBlock,
  [BLOCK_TYPES.COUNTDOWN]: CountdownBlock,
  [BLOCK_TYPES.LEGACY_TEMPLATE]: LegacyTemplateBlock,
  [BLOCK_TYPES.LEGACY_SECTION]: LegacySectionBlock,
});
