import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { mediaApi } from "./api/mediaApi";
import { useMedia } from "./hooks/useMedia";

vi.mock("./api/mediaApi", () => ({
  mediaApi: {
    list: vi.fn().mockResolvedValue([
      { id: "1", name: "cover.jpg", url: "https://cdn.test/cover.jpg", mediaType: "IMAGE" },
      { id: "2", name: "video.mp4", url: "https://cdn.test/video.mp4", mediaType: "VIDEO" },
    ]),
    upload: vi.fn().mockResolvedValue({
      id: "3",
      name: "new.jpg",
      url: "https://cdn.test/new.jpg",
      mediaType: "IMAGE",
    }),
    delete: vi.fn().mockResolvedValue({}),
    updateMetadata: vi.fn().mockResolvedValue({}),
  },
}));

describe("useMedia", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads media list on mount when invitationId is provided", async () => {
    const { result } = renderHook(() => useMedia("101"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.files.length).toBe(2);
    expect(result.current.error).toBe("");
  });

  it("handles uploadFile action", async () => {
    const { result } = renderHook(() => useMedia("101"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.uploadFile).toBe("function");
    const file = new File(["fixture"], "event.jpg", { type: "image/jpeg" });
    await act(async () => { await result.current.uploadFile(file); });
    expect(mediaApi.upload).toHaveBeenCalledWith("101", file, expect.any(Function));
    expect(result.current.files.at(-1)).toMatchObject({ id: "3", url: "https://cdn.test/new.jpg", mediaType: "IMAGE" });
    expect(result.current.uploading).toBe(false);
  });

  it("handles deleteFile action", async () => {
    const { result } = renderHook(() => useMedia("101"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.deleteFile).toBe("function");
  });
});
