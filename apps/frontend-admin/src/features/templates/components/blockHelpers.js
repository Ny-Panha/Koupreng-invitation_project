/**
 * blockHelpers.js — Pure utility functions for managing modular CMS blocks in the Admin Studio.
 * Enforces schema integrity, immutability, and validation rules.
 */
import { DEFAULT_SECTIONS_LIST } from "./templateSections";

export const CMS_BLOCK_TYPES = Object.freeze({
  CUSTOM_IMAGE: "CUSTOM_IMAGE",
  CUSTOM_TEXT: "CUSTOM_TEXT",
  HORIZONTAL_SCROLL_SHOWCASE: "HORIZONTAL_SCROLL_SHOWCASE",
  LEGACY_SECTION: "LEGACY_SECTION",
});

export const DEFAULT_SECTION_KEYS = Object.freeze(
  DEFAULT_SECTIONS_LIST.map((s) => s.key)
);

/**
 * Generate a unique block ID.
 * Format: `block-<timestamp>-<random>`
 */
export function generateBlockId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `block-${Date.now()}-${rand}`;
}

/**
 * Create default data payload for a newly added block.
 *
 * @param {string} type
 * @returns {Object}
 */
export function getDefaultBlockData(type) {
  switch (type) {
    case CMS_BLOCK_TYPES.CUSTOM_IMAGE:
      return {
        imageUrl: "",
        caption: "",
        alt: "",
      };
    case CMS_BLOCK_TYPES.CUSTOM_TEXT:
      return {
        heading: "",
        body: "",
        align: "center",
      };
    case CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE:
      return {
        heading: "",
        cards: [
          {
            id: `card-${Date.now()}-1`,
            img: "",
            title: "",
            subtitle: "",
          },
        ],
      };
    case CMS_BLOCK_TYPES.LEGACY_SECTION:
      return {
        sectionKey: "family",
        enabled: true,
      };
    default:
      return {};
  }
}

/**
 * Add a new block to the blocks array.
 *
 * @param {Array<Object>} blocks
 * @param {string} type
 * @returns {Array<Object>}
 */
export function addBlock(blocks = [], type) {
  const list = Array.isArray(blocks) ? [...blocks] : [];
  const newBlock = {
    id: generateBlockId(),
    type,
    data: getDefaultBlockData(type),
  };
  return [...list, newBlock];
}

/**
 * Move a block up or down by one position.
 *
 * @param {Array<Object>} blocks
 * @param {number} index
 * @param {"up" | "down" | -1 | 1} dir
 * @returns {Array<Object>}
 */
export function moveBlock(blocks = [], index, dir) {
  if (!Array.isArray(blocks) || blocks.length <= 1) return Array.isArray(blocks) ? [...blocks] : [];
  if (index < 0 || index >= blocks.length) return [...blocks];

  const targetIndex = dir === "up" || dir === -1 ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= blocks.length) {
    return [...blocks];
  }

  const next = [...blocks];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export const moveUnifiedItem = moveBlock;

/**
 * Remove a block by its unique id.
 *
 * @param {Array<Object>} blocks
 * @param {string} id
 * @returns {Array<Object>}
 */
export function removeBlock(blocks = [], id) {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((b) => b.id !== id);
}

/**
 * Build unified sections list from legacy section configuration and custom blocks.
 *
 * @param {Object} params
 * @param {Array<string>} [params.sectionOrder] - Ordered keys for legacy sections
 * @param {Object} [params.enabledSections] - Visibility map { [sectionKey]: boolean }
 * @param {Array<Object>} [params.customBlocks] - Additional custom blocks
 * @returns {Array<Object>} unified list of sections
 */
export function buildUnifiedSections({
  sectionOrder = [],
  enabledSections = {},
  customBlocks = [],
} = {}) {
  const validOrder = (Array.isArray(sectionOrder) ? sectionOrder : []).filter((k) =>
    DEFAULT_SECTION_KEYS.includes(k)
  );
  const missing = DEFAULT_SECTION_KEYS.filter((k) => !validOrder.includes(k));
  const fullOrder = [...validOrder, ...missing];

  const legacyItems = fullOrder.map((key) => ({
    id: `sec-${key}`,
    type: CMS_BLOCK_TYPES.LEGACY_SECTION,
    data: {
      sectionKey: key,
      enabled: enabledSections?.[key] !== false,
    },
  }));

  const customItems = Array.isArray(customBlocks) ? customBlocks : [];
  return [...legacyItems, ...customItems];
}

/**
 * Parse saved sections array into unifiedSections, sectionOrder, enabledSections, and customBlocks.
 * Handles 3 cases:
 *  (a) Contains at least one LEGACY_SECTION → restore as-is
 *  (b) Contains custom blocks only (Phase-2 format) → migrate by appending custom blocks to legacy sections
 *  (c) Empty or absent → return default 11 legacy sections
 *
 * @param {Array<Object>} [sections] - Stored sections array
 * @param {Array<string>} [savedSectionOrder] - Fallback legacy sectionOrder
 * @param {Object} [savedEnabledSections] - Fallback legacy enabledSections
 * @returns {{ unifiedSections: Array<Object>, sectionOrder: Array<string>, enabledSections: Object, customBlocks: Array<Object> }}
 */
export function parseUnifiedSections(
  sections,
  savedSectionOrder = [],
  savedEnabledSections = {}
) {
  // Case (a): Sections array already contains LEGACY_SECTION items
  if (
    Array.isArray(sections) &&
    sections.some((b) => b?.type === CMS_BLOCK_TYPES.LEGACY_SECTION)
  ) {
    const legacyKeysInUnified = [];
    const enabledMap = {};
    const custom = [];

    sections.forEach((b) => {
      if (b.type === CMS_BLOCK_TYPES.LEGACY_SECTION && b.data?.sectionKey) {
        legacyKeysInUnified.push(b.data.sectionKey);
        enabledMap[b.data.sectionKey] = b.data.enabled !== false;
      } else {
        custom.push(b);
      }
    });

    const missingDefaults = DEFAULT_SECTION_KEYS.filter((k) => !legacyKeysInUnified.includes(k));
    const fullSectionOrder = [...legacyKeysInUnified, ...missingDefaults];

    // Ensure all missing defaults are represented in enabledMap
    missingDefaults.forEach((k) => {
      if (enabledMap[k] === undefined) {
        enabledMap[k] = savedEnabledSections?.[k] !== false;
      }
    });

    return {
      unifiedSections: sections,
      sectionOrder: fullSectionOrder,
      enabledSections: enabledMap,
      customBlocks: custom,
    };
  }

  // Case (b): Sections array has custom blocks only (Phase 2 format)
  if (Array.isArray(sections) && sections.length > 0) {
    const unified = buildUnifiedSections({
      sectionOrder: savedSectionOrder,
      enabledSections: savedEnabledSections,
      customBlocks: sections,
    });
    return parseUnifiedSections(unified, savedSectionOrder, savedEnabledSections);
  }

  // Case (c): Absent or empty sections
  const defaultUnified = buildUnifiedSections({
    sectionOrder: savedSectionOrder,
    enabledSections: savedEnabledSections,
    customBlocks: [],
  });
  return parseUnifiedSections(defaultUnified, savedSectionOrder, savedEnabledSections);
}

/**
 * Toggle the enabled property of a LEGACY_SECTION block by ID.
 *
 * @param {Array<Object>} list
 * @param {string} id
 * @returns {Array<Object>}
 */
export function toggleUnifiedSectionEnabled(list = [], id) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    if (item.id !== id) return item;
    const currentEnabled = item.data?.enabled !== false;
    return {
      ...item,
      data: {
        ...item.data,
        enabled: !currentEnabled,
      },
    };
  });
}

/**
 * Validate blocks against CMS rules.
 * Rules:
 *  1. ≤ 30 total items
 *  2. LEGACY_SECTION requires known sectionKey
 *  3. CUSTOM_IMAGE requires imageUrl
 *  4. CUSTOM_TEXT requires heading or body
 *  5. HORIZONTAL_SCROLL_SHOWCASE requires ≥ 1 card, and each card requires img (title optional)
 *
 * @param {Array<Object>} blocks
 * @returns {Array<string>} list of validation error messages
 */
export function validateBlocks(blocks = []) {
  const errors = [];
  if (!Array.isArray(blocks)) return errors;

  if (blocks.length > 30) {
    errors.push("Sections exceed maximum limit of 30 items total.");
  }

  blocks.forEach((block, index) => {
    const blockNum = index + 1;
    const type = block?.type;
    const data = block?.data || {};

    if (type === CMS_BLOCK_TYPES.LEGACY_SECTION) {
      if (!data.sectionKey || !DEFAULT_SECTION_KEYS.includes(data.sectionKey)) {
        errors.push(`Section ${blockNum} (Legacy): Unknown or missing sectionKey "${data.sectionKey}".`);
      }
    } else if (type === CMS_BLOCK_TYPES.CUSTOM_IMAGE) {
      if (!data.imageUrl || typeof data.imageUrl !== "string" || !data.imageUrl.trim()) {
        errors.push(`Block ${blockNum} (Custom Image): Image URL or upload is required.`);
      }
    } else if (type === CMS_BLOCK_TYPES.CUSTOM_TEXT) {
      const hasHeading = typeof data.heading === "string" && Boolean(data.heading.trim());
      const hasBody = typeof data.body === "string" && Boolean(data.body.trim());
      if (!hasHeading && !hasBody) {
        errors.push(`Block ${blockNum} (Custom Text): Either heading or body text is required.`);
      }
    } else if (type === CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE) {
      const cards = data.cards;
      if (!Array.isArray(cards) || cards.length === 0) {
        errors.push(`Block ${blockNum} (Showcase): At least 1 card is required.`);
      } else {
        cards.forEach((card, cardIndex) => {
          const cardNum = cardIndex + 1;
          if (!card?.img || typeof card.img !== "string" || !card.img.trim()) {
            errors.push(`Block ${blockNum} (Showcase): Card ${cardNum} requires an image.`);
          }
        });
      }
    }
  });

  return errors;
}
