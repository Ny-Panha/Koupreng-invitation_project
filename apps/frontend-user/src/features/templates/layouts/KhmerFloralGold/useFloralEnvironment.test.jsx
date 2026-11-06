import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import useFloralEnvironment from './useFloralEnvironment';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('responds to data saving and page visibility and removes both listeners', () => {
  const connection = new EventTarget();
  connection.saveData = true;
  const original = Object.getOwnPropertyDescriptor(navigator, 'connection');
  Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  const removeConnection = vi.spyOn(connection, 'removeEventListener');
  const removeVisibility = vi.spyOn(document, 'removeEventListener');
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  try {
    const { result, unmount } = renderHook(useFloralEnvironment);
    expect(result.current).toEqual({ hidden: false, saveData: true, slow: false });
    act(() => { connection.saveData = false; connection.dispatchEvent(new Event('change')); });
    act(() => { hidden.mockReturnValue(true); document.dispatchEvent(new Event('visibilitychange')); });
    expect(result.current).toEqual({ hidden: true, saveData: false, slow: false });
    unmount();
    expect(removeConnection).toHaveBeenCalledWith('change', expect.any(Function));
    expect(removeVisibility).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  } finally {
    if (original) Object.defineProperty(navigator, 'connection', original);
    else delete navigator.connection;
  }
});

it('responds to slow display updates and releases its media-query listener', () => {
  const query = new EventTarget(); query.matches = false;
  vi.stubGlobal('matchMedia', () => query);
  const remove = vi.spyOn(query, 'removeEventListener');
  const { result, unmount } = renderHook(useFloralEnvironment);
  expect(result.current.slow).toBe(false);
  act(() => { query.matches = true; query.dispatchEvent(new Event('change')); });
  expect(result.current.slow).toBe(true);
  unmount();
  expect(remove).toHaveBeenCalledWith('change', expect.any(Function));
});
