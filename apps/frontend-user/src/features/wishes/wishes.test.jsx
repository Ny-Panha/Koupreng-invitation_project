import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach } from "vitest";
import { wishesApi } from "./api/wishesApi";
afterEach(cleanup);
import { useWishes } from "./hooks/useWishes";

vi.mock("./api/wishesApi", () => ({
  wishesApi: {
    listByInvitation: vi.fn().mockResolvedValue([
      { id: "1", guestName: "Sokha", message: "Congratulations!", createdAt: "2026-05-01" },
      { id: "2", guestName: "Bopha", message: "Wishing you best wishes", createdAt: "2026-05-02" },
    ]),
    deleteWish: vi.fn().mockResolvedValue({}),
  },
}));

describe("useWishes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads wishes list on mount", async () => {
    const { result } = renderHook(() => useWishes("101"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.wishes.length).toBe(2);
    expect(result.current.error).toBe("");
  });

  it("provides deleteWish action", async () => {
    const { result } = renderHook(() => useWishes("101"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.deleteWish).toBe("function");
  });
  it("removes only the selected wish after acknowledgement and retains it on failure", async () => {
    const { result } = renderHook(() => useWishes("101")); await waitFor(() => expect(result.current.loading).toBe(false));
    wishesApi.deleteWish.mockRejectedValueOnce(new Error("Permission denied"));
    await act(() => result.current.deleteWish("1")); expect(result.current.wishes).toHaveLength(2); expect(result.current.error).toBe("Permission denied");
    wishesApi.deleteWish.mockResolvedValueOnce({ message: "Wish removed" });
    await act(() => result.current.deleteWish("1")); expect(result.current.wishes).toHaveLength(1); expect(result.current.wishes[0].id).toBe("2");
    expect(wishesApi.deleteWish).toHaveBeenCalledWith("101", "1");
  });
});
