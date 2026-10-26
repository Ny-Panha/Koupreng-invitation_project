import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import useIntroSequence from './useIntroSequence';
const options = { preview: false, enabled: true, reduced: false, duration: 2, slideCount: 2 };
beforeEach(() => { vi.useFakeTimers(); Object.defineProperty(document, 'hidden', { configurable: true, value: false }); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const tick = ms => act(() => vi.advanceTimersByTime(ms));
it('runs the full timed sequence and leaves no timer after unmount', () => {
  const { result, unmount } = renderHook(() => useIntroSequence(options));
  act(() => result.current.start()); expect(result.current.stage).toBe('ORNAMENT_REVEAL');
  tick(2400); expect(result.current.stage).toBe('TITLE_REVEAL');
  tick(4200); expect(result.current.stage).toBe('PHOTO_SLIDESHOW');
  tick(2000); expect(result.current.slide).toBe(1);
  tick(2000); expect(result.current.stage).toBe('INVITATION_REVEAL');
  tick(700); expect(result.current.stage).toBe('CONTENT');
  unmount(); expect(vi.getTimerCount()).toBe(0);
});
it('skip cancels pending transitions and replay starts a full new sequence', () => {
  const { result } = renderHook(() => useIntroSequence(options));
  act(() => result.current.start()); tick(1500); act(() => result.current.finish()); tick(50000);
  expect(result.current.stage).toBe('CONTENT');
  act(() => result.current.restart()); act(() => result.current.start()); tick(2399);
  expect(result.current.stage).toBe('ORNAMENT_REVEAL'); tick(1); expect(result.current.stage).toBe('TITLE_REVEAL');
});
it('pauses and resumes the remaining duration when the tab is hidden', () => {
  const { result } = renderHook(() => useIntroSequence(options));
  act(() => result.current.start()); tick(1000);
  act(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  tick(10000); expect(result.current.stage).toBe('ORNAMENT_REVEAL');
  act(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  tick(1400); expect(result.current.stage).toBe('TITLE_REVEAL');
});
it('bypasses animation with reduced motion and disabled intros', () => {
  const reduced = renderHook(() => useIntroSequence({ ...options, reduced: true }));
  act(() => reduced.result.current.start()); expect(reduced.result.current.stage).toBe('CONTENT');
  const disabled = renderHook(() => useIntroSequence({ ...options, enabled: false }));
  expect(disabled.result.current.stage).toBe('CONTENT');
});
