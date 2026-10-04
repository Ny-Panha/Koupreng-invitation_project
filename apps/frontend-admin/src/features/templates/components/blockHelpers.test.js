import { describe, it, expect } from "vitest";
import {
  CMS_BLOCK_TYPES,
  addBlock,
  moveBlock,
  removeBlock,
  validateBlocks,
  generateBlockId,
} from "./blockHelpers";

describe("blockHelpers", () => {
  describe("generateBlockId", () => {
    it("generates an id starting with block- and containing timestamp and random part", () => {
      const id = generateBlockId();
      expect(id).toMatch(/^block-\d+-[a-z0-9]+$/);
    });
  });

  describe("addBlock", () => {
    it("adds a CUSTOM_IMAGE block with expected initial data", () => {
      const blocks = [];
      const updated = addBlock(blocks, CMS_BLOCK_TYPES.CUSTOM_IMAGE);
      expect(updated).toHaveLength(1);
      expect(updated[0].type).toBe(CMS_BLOCK_TYPES.CUSTOM_IMAGE);
      expect(updated[0].id).toMatch(/^block-/);
      expect(updated[0].data).toEqual({
        imageUrl: "",
        caption: "",
        alt: "",
      });
    });

    it("adds a CUSTOM_TEXT block with expected initial data", () => {
      const updated = addBlock([], CMS_BLOCK_TYPES.CUSTOM_TEXT);
      expect(updated).toHaveLength(1);
      expect(updated[0].type).toBe(CMS_BLOCK_TYPES.CUSTOM_TEXT);
      expect(updated[0].data).toEqual({
        heading: "",
        body: "",
        align: "center",
      });
    });

    it("adds a HORIZONTAL_SCROLL_SHOWCASE block with initial card", () => {
      const updated = addBlock([], CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE);
      expect(updated).toHaveLength(1);
      expect(updated[0].type).toBe(CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE);
      expect(updated[0].data.heading).toBe("");
      expect(updated[0].data.cards).toHaveLength(1);
      expect(updated[0].data.cards[0].img).toBe("");
    });
  });

  describe("moveBlock", () => {
    const b1 = { id: "1", type: "CUSTOM_TEXT" };
    const b2 = { id: "2", type: "CUSTOM_IMAGE" };
    const b3 = { id: "3", type: "HORIZONTAL_SCROLL_SHOWCASE" };

    it("moves a block up correctly", () => {
      const blocks = [b1, b2, b3];
      const moved = moveBlock(blocks, 1, "up");
      expect(moved.map((b) => b.id)).toEqual(["2", "1", "3"]);
    });

    it("moves a block down correctly", () => {
      const blocks = [b1, b2, b3];
      const moved = moveBlock(blocks, 1, "down");
      expect(moved.map((b) => b.id)).toEqual(["1", "3", "2"]);
    });

    it("does not move up past index 0", () => {
      const blocks = [b1, b2, b3];
      const moved = moveBlock(blocks, 0, "up");
      expect(moved.map((b) => b.id)).toEqual(["1", "2", "3"]);
    });

    it("does not move down past end index", () => {
      const blocks = [b1, b2, b3];
      const moved = moveBlock(blocks, 2, "down");
      expect(moved.map((b) => b.id)).toEqual(["1", "2", "3"]);
    });

    it("handles numeric directions (-1 / 1)", () => {
      const blocks = [b1, b2, b3];
      const movedUp = moveBlock(blocks, 2, -1);
      expect(movedUp.map((b) => b.id)).toEqual(["1", "3", "2"]);

      const movedDown = moveBlock(blocks, 0, 1);
      expect(movedDown.map((b) => b.id)).toEqual(["2", "1", "3"]);
    });
  });

  describe("removeBlock", () => {
    it("removes the target block by id", () => {
      const blocks = [
        { id: "b1", type: "CUSTOM_TEXT" },
        { id: "b2", type: "CUSTOM_IMAGE" },
      ];
      const updated = removeBlock(blocks, "b1");
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe("b2");
    });

    it("leaves array intact if id not found", () => {
      const blocks = [{ id: "b1", type: "CUSTOM_TEXT" }];
      const updated = removeBlock(blocks, "nonexistent");
      expect(updated).toHaveLength(1);
    });
  });

  describe("validateBlocks", () => {
    it("passes validation for valid blocks", () => {
      const blocks = [
        {
          id: "1",
          type: CMS_BLOCK_TYPES.CUSTOM_IMAGE,
          data: { imageUrl: "https://example.com/photo.jpg", caption: "Photo" },
        },
        {
          id: "2",
          type: CMS_BLOCK_TYPES.CUSTOM_TEXT,
          data: { heading: "Welcome", body: "Hello guests" },
        },
        {
          id: "3",
          type: CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE,
          data: {
            heading: "Gallery",
            cards: [
              { id: "c1", img: "https://example.com/c1.jpg", title: "C1" },
            ],
          },
        },
      ];

      const errors = validateBlocks(blocks);
      expect(errors).toHaveLength(0);
    });

    it("fails when CUSTOM_IMAGE is missing imageUrl", () => {
      const blocks = [
        {
          id: "1",
          type: CMS_BLOCK_TYPES.CUSTOM_IMAGE,
          data: { imageUrl: "   ", caption: "No image" },
        },
      ];
      const errors = validateBlocks(blocks);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Custom Image");
      expect(errors[0]).toContain("Image URL");
    });

    it("fails when CUSTOM_TEXT is missing both heading and body", () => {
      const blocks = [
        {
          id: "1",
          type: CMS_BLOCK_TYPES.CUSTOM_TEXT,
          data: { heading: "", body: "  " },
        },
      ];
      const errors = validateBlocks(blocks);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Custom Text");
    });

    it("passes when CUSTOM_TEXT has only heading or only body", () => {
      const blocks = [
        {
          id: "1",
          type: CMS_BLOCK_TYPES.CUSTOM_TEXT,
          data: { heading: "Only Heading", body: "" },
        },
        {
          id: "2",
          type: CMS_BLOCK_TYPES.CUSTOM_TEXT,
          data: { heading: "", body: "Only Body" },
        },
      ];
      const errors = validateBlocks(blocks);
      expect(errors).toHaveLength(0);
    });

    it("fails when HORIZONTAL_SCROLL_SHOWCASE has empty cards", () => {
      const blocks = [
        {
          id: "1",
          type: CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE,
          data: { heading: "Moments", cards: [] },
        },
      ];
      const errors = validateBlocks(blocks);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Showcase");
      expect(errors[0]).toContain("At least 1 card");
    });

    it("fails when HORIZONTAL_SCROLL_SHOWCASE card is missing img", () => {
      const blocks = [
        {
          id: "1",
          type: CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE,
          data: {
            heading: "Moments",
            cards: [
              { id: "c1", img: "https://example.com/valid.jpg" },
              { id: "c2", img: "  ", title: "Missing Image Card" },
            ],
          },
        },
      ];
      const errors = validateBlocks(blocks);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Card 2 requires an image");
    });

    it("fails when total blocks exceed 20", () => {
      const blocks = Array.from({ length: 21 }, (_, i) => ({
        id: `block-${i}`,
        type: CMS_BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: `Heading ${i}` },
      }));
      const errors = validateBlocks(blocks);
      expect(errors.some((e) => e.includes("exceed maximum limit of 20"))).toBe(true);
    });
  });
});
