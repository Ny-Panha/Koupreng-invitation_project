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

it('opens royal curtains once, pauses cloth timing, then hands off to media', () => {
  const { result } = renderHook(() => useIntroSequence({ ...options, royal: true }));
  act(() => { result.current.start(); result.current.start(); });
  expect(result.current.stage).toBe('COVER_EXITING');
  const token = result.current.run;
  tick(360); expect(result.current.stage).toBe('CURTAIN_PREPARING');
  tick(420); expect(result.current.stage).toBe('CURTAIN_OPENING');
  tick(500); act(() => result.current.setPaused(true)); tick(5000);
  expect(result.current.stage).toBe('CURTAIN_OPENING');
  act(() => result.current.setPaused(false)); tick(1300);
  expect(result.current.stage).toBe('CINEMATIC_MEDIA'); expect(result.current.run).toBe(token);
  act(() => result.current.beginPhotos()); tick(2000); expect(result.current.slide).toBe(1);
  tick(2000); tick(700); expect(result.current.stage).toBe('CONTENT');
});
it('cancels each royal stage and ignores stale and duplicate video completion', () => {
  const { result } = renderHook(() => useIntroSequence({ ...options, royal: true }));
  for (const waits of [[], [360], [360, 420], [360, 420, 1800]]) {
    act(() => result.current.restart()); act(() => result.current.start());
    waits.forEach(tick); act(() => result.current.finish()); tick(20000);
    expect(result.current.stage).toBe('CONTENT');
  }
  act(() => result.current.restart()); act(() => result.current.start()); tick(360); tick(420); tick(1800);
  const token = result.current.run;
  act(() => result.current.prepareVideo()); act(() => result.current.videoPlaying(token));
  act(() => result.current.afterVideo(false, token)); act(() => result.current.afterVideo(true, token));
  expect(result.current.stage).toBe('CONTENT');
  act(() => result.current.start(true)); act(() => result.current.afterVideo(false, token));
  expect(result.current.stage).toBe('COVER_EXITING');
});
it('supports curtain opt-out, empty media and live reduced-motion changes', () => {
  const { result, rerender, unmount } = renderHook(props => useIntroSequence(props), { initialProps: { ...options, royal: true, curtainEnabled: false, slideCount: 0 } });
  act(() => result.current.start()); tick(360); expect(result.current.stage).toBe('CINEMATIC_MEDIA');
  act(() => result.current.beginPhotos()); expect(result.current.stage).toBe('INVITATION_REVEAL');
  rerender({ ...options, royal: true, reduced: true }); expect(result.current.stage).toBe('CONTENT');
  unmount(); expect(vi.getTimerCount()).toBe(0);
});
