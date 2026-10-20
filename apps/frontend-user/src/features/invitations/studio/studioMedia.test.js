import { describe, expect, it, vi } from "vitest";
import { replaceMediaReferences, uploadInlineReferences } from "./studioMedia";

describe("studio image references", () => {
  it("uploads nested story, gift, brand and gallery references once and preserves their structure", async () => {
    const inline = "data:image/png;base64,aGVsbG8=";
    const value = { photos: [{ url: inline }], storyChapters: [{ image: inline }], khqrDollar: { qrUrl: inline }, brandMarkUrl: inline, text: "Keep this wording" };
    const upload = vi.fn().mockResolvedValue([{ id: 55, fileUrl: "/uploads/event-10/image.png" }]);
    const replacements = await uploadInlineReferences(value, upload);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(replaceMediaReferences(value, replacements)).toEqual({ photos: [{ url: "/uploads/event-10/image.png" }], storyChapters: [{ image: "/uploads/event-10/image.png" }], khqrDollar: { qrUrl: "/uploads/event-10/image.png" }, brandMarkUrl: "/uploads/event-10/image.png", text: "Keep this wording" });
    expect(value.photos[0].url).toBe(inline);
  });
  it("does not acknowledge a response without a permanent URL", async () => {
    await expect(uploadInlineReferences({ image: "data:image/png;base64,aGVsbG8=" }, async () => [])).rejects.toThrow("saved URL");
  });
  it("rejects executable and unsupported image formats before upload", async () => {
    const upload = vi.fn();
    await expect(uploadInlineReferences({ image: "data:image/svg+xml;base64,aGVsbG8=" }, upload)).rejects.toThrow("JPEG");
    expect(upload).not.toHaveBeenCalled();
  });
});
