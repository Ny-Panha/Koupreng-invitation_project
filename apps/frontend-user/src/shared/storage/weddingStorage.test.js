import { beforeEach, describe, expect, it } from "vitest";
import {
  createDraft,
  getDraft,
  getDraftBySlug,
  listDrafts,
  saveDraft,
} from "./weddingStorage";

describe("weddingStorage retirement of legacy templates", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("normalizes garden-royal-khmer-wedding draft to silk-heritage upon retrieval", () => {
    const legacyDraft = {
      id: "draft-legacy-1",
      slug: "legacy-garden-slug",
      templateId: "garden-royal-khmer-wedding",
      templateCode: "garden-royal-khmer-wedding",
      couple: { groom: "Groom", bride: "Bride" },
    };
    localStorage.setItem(
      "koupreng.wedding.drafts",
      JSON.stringify({ "draft-legacy-1": legacyDraft })
    );

    const loaded = getDraft("draft-legacy-1");
    expect(loaded.templateId).toBe("silk-heritage");
    expect(loaded.templateCode).toBe("silk-heritage");

    const bySlug = getDraftBySlug("legacy-garden-slug");
    expect(bySlug.templateId).toBe("silk-heritage");

    const list = listDrafts();
    expect(list[0].templateId).toBe("silk-heritage");
  });

  it("normalizes khmer-royal-lotus draft to silk-heritage upon retrieval", () => {
    const lotusDraft = {
      id: "draft-lotus-1",
      slug: "lotus-slug",
      templateId: "khmer-royal-lotus",
      couple: { groom: "Groom", bride: "Bride" },
    };
    localStorage.setItem(
      "koupreng.wedding.drafts",
      JSON.stringify({ "draft-lotus-1": lotusDraft })
    );

    const loaded = getDraft("draft-lotus-1");
    expect(loaded.templateId).toBe("silk-heritage");
  });

  it("preserves active templates like silk-heritage and khmer-celestial", () => {
    const activeDraft = {
      id: "draft-active-1",
      slug: "active-slug",
      templateId: "khmer-celestial",
    };
    localStorage.setItem(
      "koupreng.wedding.drafts",
      JSON.stringify({ "draft-active-1": activeDraft })
    );

    const loaded = getDraft("draft-active-1");
    expect(loaded.templateId).toBe("khmer-celestial");
  });
});

