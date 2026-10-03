import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPreviewUrl, createPreviewSession, iframePreviewChannel, isPreviewMessage, isTrustedPreviewMessage, postPreviewMessage, readEmbeddedPreviewChannel } from "./previewMessaging";

const sessionId = "test-preview-session-1234567890123456";
const message = { type: "LIVE_PREVIEW_SYNC", sessionId, data: { groom: "Edited host", photos: [{ url: "/photo.jpg" }] } };

describe("FE-010 editor protocol", () => {
  afterEach(() => { vi.restoreAllMocks(); window.history.replaceState(null, "", "/"); });

  it("creates unguessable sessions and carries the exact parent origin into the preview URL", () => {
    expect(createPreviewSession()).toMatch(/^[a-f0-9]{32}$/);
    expect(createPreviewSession()).not.toEqual(createPreviewSession());
    const url = new URL(buildPreviewUrl("/templates/emerald/preview?embed=true", sessionId, "https://admin.example"));
    expect(url.searchParams.get("previewOrigin")).toBe("https://admin.example");
    expect(url.searchParams.get("previewSession")).toBe(sessionId);
    expect(url.searchParams.get("embed")).toBe("true");
  });

  it.each(["*", "https://admin.example/path", "null", "javascript:alert(1)"])("rejects invalid parent origins %s", (origin) => {
    expect(() => buildPreviewUrl("/templates/default/preview", sessionId, origin)).toThrow();
  });

  it("sends only to the expected iframe origin, never a wildcard", () => {
    const source = { postMessage: vi.fn() };
    const frame = { contentWindow: source, src: "https://user.example/templates/default/preview" };
    expect(postPreviewMessage({ type: "TOGGLE_GATE", open: true }, iframePreviewChannel(frame, sessionId))).toBe(true);
    expect(source.postMessage).toHaveBeenCalledWith({ type: "TOGGLE_GATE", open: true, sessionId }, "https://user.example");
  });

  it.each([
    { ...message, type: "UNKNOWN" },
    { ...message, data: { groom: [] } },
    { ...message, data: { photos: "wrong type" } },
    { ...message, data: JSON.parse('{"__proto__":{"polluted":true}}') },
    { type: "TOGGLE_GATE", sessionId, open: "true" },
    { type: "SELECT_TARGET_ELEMENT", sessionId, elementId: "<script>" },
    { type: "PREVIEW_READY", sessionId, data: {} },
  ])("rejects malformed or unexpected messages (%j)", (payload) => expect(isPreviewMessage(payload)).toBe(false));

  it("accepts a valid editor payload only from the expected window and session", () => {
    const source = {};
    const channel = { source, origin: "https://admin.example", sessionId };
    const event = { source, origin: channel.origin, data: message };
    expect(isTrustedPreviewMessage(event, channel)).toBe(true);
    expect(isTrustedPreviewMessage({ ...event, source: {} }, channel)).toBe(false);
    expect(isTrustedPreviewMessage({ ...event, origin: "https://attacker.example" }, channel)).toBe(false);
    expect(isTrustedPreviewMessage({ ...event, data: { ...message, sessionId: "other-preview-session-1234567890" } }, channel)).toBe(false);
  });

  it("does not activate a session for a top-level or published invitation", () => {
    window.history.replaceState(null, "", "/w/published?previewSession=" + sessionId + "&previewOrigin=https://admin.example");
    expect(readEmbeddedPreviewChannel()).toBe(null);
    expect(postPreviewMessage({ type: "PREVIEW_READY" })).toBe(false);
  });
});
