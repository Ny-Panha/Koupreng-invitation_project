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
    expect(result.current).toEqual({ hidden: false, saveData: true });
    act(() => { connection.saveData = false; connection.dispatchEvent(new Event('change')); });
    act(() => { hidden.mockReturnValue(true); document.dispatchEvent(new Event('visibilitychange')); });
    expect(result.current).toEqual({ hidden: true, saveData: false });
    unmount();
    expect(removeConnection).toHaveBeenCalledWith('change', expect.any(Function));
    expect(removeVisibility).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  } finally {
    if (original) Object.defineProperty(navigator, 'connection', original);
    else delete navigator.connection;
  }
});
