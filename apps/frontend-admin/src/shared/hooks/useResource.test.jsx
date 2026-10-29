import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useResource } from './useResource';

function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }

it('retains records during refresh and ignores older overlapping responses', async () => {
  const initial = deferred(), slow = deferred(), fast = deferred();
  const fetcher = vi.fn().mockReturnValueOnce(initial.promise).mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);
  const { result } = renderHook(() => useResource(fetcher));
  expect(result.current.loading).toBe(true);
  await act(async () => initial.resolve(['verified']));
  let oldRequest, newRequest;
  act(() => { oldRequest = result.current.reload(); });
  expect(result.current.loading).toBe(false);
  expect(result.current.refreshing).toBe(true);
  expect(result.current.data).toEqual(['verified']);
  act(() => { newRequest = result.current.reload(); });
  await act(async () => { fast.resolve(['latest']); await newRequest; });
  await act(async () => { slow.resolve(['stale']); await oldRequest; });
  expect(result.current.data).toEqual(['latest']);
  expect(result.current.refreshing).toBe(false);
});

it('ends errors and permits retry to an explicit empty success', async () => {
  const fetcher = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([]);
  const { result } = renderHook(() => useResource(fetcher));
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(result.current.loading).toBe(false);
  await act(async () => { await result.current.reload(); });
  expect(result.current.error).toBe(false);
  expect(result.current.data).toEqual([]);
  expect(fetcher).toHaveBeenCalledTimes(2);
});

for (const status of [401, 403, 404]) it(`discards records after ${status}`, async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(['private']).mockRejectedValueOnce({ response: { status } });
  const { result } = renderHook(() => useResource(fetcher));
  await waitFor(() => expect(result.current.data).toEqual(['private']));
  await act(async () => { await result.current.reload(); });
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBe(true);
});

it('preserves verified records on transient refresh errors', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(['private']).mockRejectedValueOnce({ status: 503 });
  const { result } = renderHook(() => useResource(fetcher));
  await waitFor(() => expect(result.current.data).toEqual(['private']));
  await act(async () => { await result.current.reload(); });
  expect(result.current.data).toEqual(['private']);
  expect(result.current.refreshing).toBe(false);
});

it('ignores completions from a previous resource and after unmount', async () => {
  const old = deferred(), current = deferred();
  const first = vi.fn(() => old.promise), second = vi.fn(() => current.promise);
  const { result, rerender, unmount } = renderHook(({ fetcher }) => useResource(fetcher), { initialProps: { fetcher: first } });
  rerender({ fetcher: second });
  await act(async () => { old.resolve(['old']); });
  expect(result.current.data).toBeNull();
  unmount();
  await act(async () => { current.resolve(['current']); });
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
});
