import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePreviewSyncRetries } from "./usePreviewSyncRetries";

afterEach(() => vi.useRealTimers());

describe("preview synchronization retries", () => {
  it("uses the edited state for every pending load retry", () => {
    vi.useFakeTimers();
    const original = vi.fn();
    const edited = vi.fn();
    const { result, rerender, unmount } = renderHook(({ sync }) => usePreviewSyncRetries(sync), { initialProps: { sync: original } });
    act(() => result.current());
    rerender({ sync: edited });
    act(() => vi.advanceTimersByTime(2100));
    expect(original).toHaveBeenCalledTimes(1);
    expect(edited).toHaveBeenCalledTimes(5);
    unmount();
  });

  it("cancels pending retries when the editor unmounts", () => {
    vi.useFakeTimers();
    const sync = vi.fn();
    const { result, unmount } = renderHook(() => usePreviewSyncRetries(sync));
    act(() => result.current());
    unmount();
    act(() => vi.advanceTimersByTime(2100));
    expect(sync).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("replaces pending retries when the iframe loads again", () => {
    vi.useFakeTimers();
    const sync = vi.fn();
    const { result, unmount } = renderHook(() => usePreviewSyncRetries(sync));
    act(() => result.current());
    act(() => result.current());
    act(() => vi.advanceTimersByTime(2100));
    expect(sync).toHaveBeenCalledTimes(7);
    unmount();
  });
});

