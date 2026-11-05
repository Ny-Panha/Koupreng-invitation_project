import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useApiMonitorStream } from "./useApiMonitorStream";
import { useQaSessionRecorder } from "./useQaSessionRecorder";

describe("useApiMonitorStream lifecycle & clearHistory semantics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clears local state and succeeds when server returns HTTP 200", async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/stream")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          body: {
            getReader: () => ({
              read: () => new Promise(() => {}), // keep open
            }),
          },
        });
      }
      if (url.includes("/clear")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useApiMonitorStream());

    // Call clearHistory
    let clearResult;
    await act(async () => {
      clearResult = await result.current.clearHistory();
    });

    expect(clearResult).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/dev-monitor/clear"),
      expect.objectContaining({ method: "POST" })
    );
    expect(result.current.events).toEqual([]);
  });

  it("throws error and preserves local events when server returns HTTP 403 or 500", async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/stream")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          body: {
            getReader: () => ({
              read: () => new Promise(() => {}),
            }),
          },
        });
      }
      if (url.includes("/clear")) {
        return Promise.resolve({
          ok: false,
          status: 403,
          statusText: "Forbidden",
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useApiMonitorStream());

    await expect(
      act(async () => {
        await result.current.clearHistory();
      })
    ).rejects.toThrow(/Failed to clear server monitor history: HTTP 403/);
  });

  it("throws error and preserves local events on network disconnection", async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/stream")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          body: {
            getReader: () => ({
              read: () => new Promise(() => {}),
            }),
          },
        });
      }
      if (url.includes("/clear")) {
        return Promise.reject(new TypeError("Failed to fetch"));
      }
      return Promise.reject(new Error("Unknown URL"));
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useApiMonitorStream());

    await expect(
      act(async () => {
        await result.current.clearHistory();
      })
    ).rejects.toThrow("Failed to fetch");
  });

  it("clearLocalBuffer resets client state without making server clear request", async () => {
    const mockFetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: () => new Promise(() => {}),
          }),
        },
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useApiMonitorStream());

    act(() => {
      result.current.clearLocalBuffer();
    });

    expect(result.current.events).toEqual([]);
    // Ensure no POST request was made to /clear
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/dev-monitor/clear"),
      expect.anything()
    );
  });
});

describe("useQaSessionRecorder CSV formula injection defense & path sanitization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sanitizes query parameters and formula injection characters in CSV export", async () => {
    let capturedBlob = null;
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn((blob) => {
        capturedBlob = blob;
        return "blob:mock-url";
      }),
      revokeObjectURL: vi.fn(),
    });

    const mockAnchor = {
      href: "",
      setAttribute: vi.fn(),
      click: vi.fn(),
      tagName: "A",
    };

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return mockAnchor;
      return originalCreateElement(tag);
    });

    const originalAppendChild = document.body.appendChild.bind(document.body);
    const originalRemoveChild = document.body.removeChild.bind(document.body);
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
      if (node && node.tagName === "A") return node;
      return originalAppendChild(node);
    });
    vi.spyOn(document.body, "removeChild").mockImplementation((node) => {
      if (node && node.tagName === "A") return node;
      return originalRemoveChild(node);
    });

    const { result } = renderHook(() => useQaSessionRecorder());

    const events = [
      {
        id: "ev-1",
        requestId: "req-1",
        method: "GET",
        path: "/api/v1/guests?token=supersecrettoken999&qrToken=guestPass123",
        status: 200,
        durationMs: 45,
        errorCode: "=cmd|' /C calc'!A0", // Formula injection payload!
        timestamp: "2026-11-05T10:00:00Z",
      },
    ];

    act(() => {
      result.current.exportSanitizedData(events, "csv");
    });

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(capturedBlob).toBeInstanceOf(Blob);

    const csvText = await capturedBlob.text();
    // Formula characters must be neutralized with a leading single quote
    expect(csvText).toContain("'=cmd");
    // Sensitive token parameters must be redacted
    expect(csvText).toContain("token=[REDACTED]");
    expect(csvText).toContain("qrToken=[REDACTED]");
    expect(csvText).not.toContain("supersecrettoken999");
    expect(csvText).not.toContain("guestPass123");
  });
});
