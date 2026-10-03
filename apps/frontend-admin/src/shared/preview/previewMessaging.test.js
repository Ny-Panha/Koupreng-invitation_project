import { describe, expect, it, vi } from "vitest";
import { buildPreviewUrl, createPreviewSession, isTrustedPreviewReply, postIframePreview } from "./previewMessaging";

const sessionId = "test-preview-session-1234567890123456";

describe("FE-010 admin preview boundary", () => {
  it("carries session and exact admin origin into cross-origin user previews", () => {
    expect(createPreviewSession()).toMatch(/^[a-f0-9]{32}$/);
    const url = new URL(buildPreviewUrl("https://user.example/templates/default/preview?embed=true", sessionId, "https://admin.example"));
    expect(url.origin).toBe("https://user.example");
    expect(url.searchParams.get("previewOrigin")).toBe("https://admin.example");
    expect(url.searchParams.get("previewSession")).toBe(sessionId);
  });

  it("sends updates to the exact user origin", () => {
    const source = { postMessage: vi.fn() };
    const iframe = { src: "https://user.example/templates/default/preview", contentWindow: source };
    postIframePreview(iframe, sessionId, { type: "LIVE_PREVIEW_SYNC", data: { groom: "Edited host" } });
    expect(source.postMessage).toHaveBeenCalledWith({ type: "LIVE_PREVIEW_SYNC", data: { groom: "Edited host" }, sessionId }, "https://user.example");
  });

  it("preserves trusted ready and typography selection replies", () => {
    const source = {};
    const iframe = { src: "https://user.example/templates/default/preview", contentWindow: source };
    const event = { source, origin: "https://user.example", data: { type: "PREVIEW_READY", sessionId } };
    expect(isTrustedPreviewReply(event, iframe, sessionId)).toBe(true);
    expect(isTrustedPreviewReply({ ...event, data: { type: "SELECT_TARGET_ELEMENT", elementId: "couple", sessionId } }, iframe, sessionId)).toBe(true);
    expect(isTrustedPreviewReply({ ...event, origin: "https://attacker.example" }, iframe, sessionId)).toBe(false);
    expect(isTrustedPreviewReply({ ...event, source: {} }, iframe, sessionId)).toBe(false);
    expect(isTrustedPreviewReply({ ...event, data: { ...event.data, sessionId: "other-preview-session-1234567890" } }, iframe, sessionId)).toBe(false);
    expect(isTrustedPreviewReply({ ...event, data: { type: "SELECT_TARGET_ELEMENT", elementId: {}, sessionId } }, iframe, sessionId)).toBe(false);
  });
});
