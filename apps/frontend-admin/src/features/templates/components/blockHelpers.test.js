import { describe, it, expect } from "vitest";
import {
  CMS_BLOCK_TYPES,
  addBlock,
  moveBlock,
  removeBlock,
  validateBlocks,
  generateBlockId,
  buildUnifiedSections,
  parseUnifiedSections,
  moveUnifiedItem,
  toggleUnifiedSectionEnabled,
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

    it("fails when total blocks exceed 30", () => {
      const blocks = Array.from({ length: 31 }, (_, i) => ({
        id: `block-${i}`,
        type: CMS_BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: `Heading ${i}` },
      }));
      const errors = validateBlocks(blocks);
      expect(errors.some((e) => e.includes("exceed maximum limit of 30"))).toBe(true);
    });

    it("fails when LEGACY_SECTION has missing or invalid sectionKey", () => {
      const blocks = [
        {
          id: "sec-unknown",
          type: CMS_BLOCK_TYPES.LEGACY_SECTION,
          data: { sectionKey: "invalidKey", enabled: true },
        },
      ];
      const errors = validateBlocks(blocks);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Unknown or missing sectionKey");
    });
  });

  describe("Phase 3 - Unified Sections Helpers", () => {
    it("buildUnifiedSections creates full 11 legacy sections and appends custom blocks", () => {
      const customBlocks = [
        { id: "c1", type: CMS_BLOCK_TYPES.CUSTOM_TEXT, data: { heading: "Hi" } },
      ];
      const unified = buildUnifiedSections({
        sectionOrder: ["gallery", "schedule"],
        enabledSections: { gallery: true, schedule: false },
        customBlocks,
      });

      expect(unified).toHaveLength(12); // 11 legacy + 1 custom
      expect(unified[0].data.sectionKey).toBe("gallery");
      expect(unified[0].data.enabled).toBe(true);
      expect(unified[1].data.sectionKey).toBe("schedule");
      expect(unified[1].data.enabled).toBe(false);
      expect(unified[11].id).toBe("c1");
    });

    it("parseUnifiedSections case (a): retains unified list as-is", () => {
      const inputSections = [
        { id: "sec-gallery", type: CMS_BLOCK_TYPES.LEGACY_SECTION, data: { sectionKey: "gallery", enabled: true } },
        { id: "cust-1", type: CMS_BLOCK_TYPES.CUSTOM_TEXT, data: { heading: "Interleaved" } },
        { id: "sec-schedule", type: CMS_BLOCK_TYPES.LEGACY_SECTION, data: { sectionKey: "schedule", enabled: false } },
      ];

      const res = parseUnifiedSections(inputSections);
      expect(res.unifiedSections).toEqual(inputSections);
      expect(res.sectionOrder.slice(0, 2)).toEqual(["gallery", "schedule"]);
      expect(res.enabledSections.gallery).toBe(true);
      expect(res.enabledSections.schedule).toBe(false);
      expect(res.customBlocks).toHaveLength(1);
      expect(res.customBlocks[0].id).toBe("cust-1");
    });

    it("parseUnifiedSections case (b): migrates Phase-2 custom-only array by appending to legacy sections", () => {
      const phase2CustomBlocks = [
        { id: "cust-1", type: CMS_BLOCK_TYPES.CUSTOM_TEXT, data: { heading: "After all" } },
      ];
      const savedOrder = ["countdown", "schedule", "gallery"];
      const savedEnabled = { countdown: false };

      const res = parseUnifiedSections(phase2CustomBlocks, savedOrder, savedEnabled);
      expect(res.unifiedSections).toHaveLength(12); // 11 legacy + 1 custom
      expect(res.unifiedSections[0].data.sectionKey).toBe("countdown");
      expect(res.unifiedSections[0].data.enabled).toBe(false);
      expect(res.unifiedSections[11].id).toBe("cust-1");
      expect(res.customBlocks).toHaveLength(1);
    });

    it("parseUnifiedSections case (c): returns default 11 legacy sections when empty or absent", () => {
      const res = parseUnifiedSections(null);
      expect(res.unifiedSections).toHaveLength(11);
      expect(res.unifiedSections.every((s) => s.type === CMS_BLOCK_TYPES.LEGACY_SECTION)).toBe(true);
      expect(res.customBlocks).toHaveLength(0);
    });

    it("moveUnifiedItem moves across types (interleaving custom block between legacy sections)", () => {
      const list = [
        { id: "sec-gallery", type: CMS_BLOCK_TYPES.LEGACY_SECTION, data: { sectionKey: "gallery" } },
        { id: "sec-schedule", type: CMS_BLOCK_TYPES.LEGACY_SECTION, data: { sectionKey: "schedule" } },
        { id: "c1", type: CMS_BLOCK_TYPES.CUSTOM_TEXT, data: { heading: "Between" } },
      ];

      // Move c1 up by 1 position (from index 2 to index 1)
      const reordered = moveUnifiedItem(list, 2, "up");
      expect(reordered.map((i) => i.id)).toEqual(["sec-gallery", "c1", "sec-schedule"]);
    });

    it("toggleUnifiedSectionEnabled toggles enabled flag for target section", () => {
      const list = [
        { id: "sec-gallery", type: CMS_BLOCK_TYPES.LEGACY_SECTION, data: { sectionKey: "gallery", enabled: true } },
      ];

      const toggledOff = toggleUnifiedSectionEnabled(list, "sec-gallery");
      expect(toggledOff[0].data.enabled).toBe(false);

      const toggledOn = toggleUnifiedSectionEnabled(toggledOff, "sec-gallery");
      expect(toggledOn[0].data.enabled).toBe(true);
    });
  });
});

