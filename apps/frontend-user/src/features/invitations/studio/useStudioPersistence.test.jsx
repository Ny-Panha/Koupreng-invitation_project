import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStudioPersistence } from "./useStudioPersistence";

describe("studio server persistence", () => {
  it("flushes edits made during an earlier autosave before a dependent publish can proceed", async () => {
    let complete;
    const persist = vi.fn().mockImplementationOnce(() => new Promise(resolve => { complete = resolve; })).mockResolvedValue({ synced: true });
    const { result, rerender } = renderHook(({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }), { initialProps: { value: { venueAddress: "" } } });
    let first, flushing;
    act(() => { first = result.current.save(); });
    rerender({ value: { venueAddress: "New address" } });
    act(() => { flushing = result.current.flush(); });
    expect(persist).toHaveBeenCalledTimes(1);
    await act(async () => { complete({ synced: true }); await first; await flushing; });
    expect(persist).toHaveBeenCalledTimes(2);
    expect(result.current.dirty).toBe(false);
    expect(result.current.phase).toBe("saved");
  });
  it("does not label a browser-only draft as saved to the server", () => {
    const { result } = renderHook(() => useStudioPersistence({ value: { title: "Local draft" }, initialSaved: false, enabled: false, persist: vi.fn(), onRestore: vi.fn() }));
    expect(result.current.phase).toBe("unsaved");
    expect(result.current.dirty).toBe(true);
  });
  it("does not acknowledge edits made while the first request is pending", async () => {
    let complete;
    const persist = vi.fn(() => new Promise(resolve => { complete = resolve; }));
    const { result, rerender } = renderHook(({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }), { initialProps: { value: { title: "A" } } });
    rerender({ value: { title: "B" } });
    let saving;
    act(() => { saving = result.current.save(); });
    rerender({ value: { title: "C" } });
    act(() => { result.current.save(); });
    expect(persist).toHaveBeenCalledTimes(1);
    await act(async () => { complete({ synced: true }); await saving; });
    expect(result.current.dirty).toBe(true);
    expect(result.current.phase).toBe("unsaved");
  });
  it("retains unsaved state on server failure and permits explicit retry", async () => {
    const persist = vi.fn().mockResolvedValueOnce({ synced: false }).mockResolvedValue({ synced: true });
    const { result, rerender } = renderHook(({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }), { initialProps: { value: {} } });
    rerender({ value: { title: "New" } });
    await act(async () => { await result.current.save(); });
    expect(result.current.phase).toBe("failed");
    expect(result.current.dirty).toBe(true);
    await act(async () => { await result.current.save(); });
    expect(result.current.phase).toBe("saved");
    expect(result.current.dirty).toBe(false);
  });
  it("debounces actual writes", async () => {
    const persist = vi.fn().mockResolvedValue({ synced: true });
    const { rerender } = renderHook(({ value }) => useStudioPersistence({ value, persist, enabled: true, delay: 20, onRestore: vi.fn() }), { initialProps: { value: 0 } });
    rerender({ value: 1 }); rerender({ value: 2 });
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
  });
});
