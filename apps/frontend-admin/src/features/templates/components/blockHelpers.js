/**
 * blockHelpers.js — Pure utility functions for managing modular CMS blocks in the Admin Studio.
 * Enforces schema integrity, immutability, and validation rules.
 */

export const CMS_BLOCK_TYPES = Object.freeze({
  CUSTOM_IMAGE: "CUSTOM_IMAGE",
  CUSTOM_TEXT: "CUSTOM_TEXT",
  HORIZONTAL_SCROLL_SHOWCASE: "HORIZONTAL_SCROLL_SHOWCASE",
});

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
 * Validate blocks against CMS rules.
 * Rules:
 *  1. ≤ 20 blocks total
 *  2. CUSTOM_IMAGE requires imageUrl
 *  3. CUSTOM_TEXT requires heading or body
 *  4. HORIZONTAL_SCROLL_SHOWCASE requires ≥ 1 card, and each card requires img (title optional)
 *
 * @param {Array<Object>} blocks
 * @returns {Array<string>} list of validation error messages
 */
export function validateBlocks(blocks = []) {
  const errors = [];
  if (!Array.isArray(blocks)) return errors;

  if (blocks.length > 20) {
    errors.push("Blocks exceed maximum limit of 20 blocks total.");
  }

  blocks.forEach((block, index) => {
    const blockNum = index + 1;
    const type = block?.type;
    const data = block?.data || {};

    if (type === CMS_BLOCK_TYPES.CUSTOM_IMAGE) {
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
