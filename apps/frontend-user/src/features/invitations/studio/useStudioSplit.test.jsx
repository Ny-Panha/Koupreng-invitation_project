import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { STUDIO_SPLIT_KEY, clampSplit, useStudioSplit } from './useStudioSplit';

function Workspace() {
  const [ref, split] = useStudioSplit('advanced');
  return <div ref={ref} data-testid="grid"><div className="studio-sections" /><div role="separator" tabIndex={0} aria-valuenow={split.value} {...split.separator} /><button onClick={() => split.apply(60)}>Reset</button></div>;
}
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () { return { width: this.className === 'studio-sections' ? 200 : 1214, left: 0 }; });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('defaults to 60%, supports keyboard bounds, persists and resets', () => {
  const view = render(<Workspace />), handle = screen.getByRole('separator');
  expect(handle).toHaveAttribute('aria-valuenow', '60');
  fireEvent.keyDown(handle, { key: 'ArrowRight' });
  expect(handle).toHaveAttribute('aria-valuenow', '62');
  fireEvent.keyDown(handle, { key: 'Home' });
  expect(handle).toHaveAttribute('aria-valuenow', '36');
  fireEvent.keyDown(handle, { key: 'End' });
  expect(handle).toHaveAttribute('aria-valuenow', '72');
  view.unmount(); render(<Workspace />);
  expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '72');
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(JSON.parse(localStorage.getItem(STUDIO_SPLIT_KEY))).toBe(60);
});
it.each(['null', '"70"', '{"ratio":70}', '999', '-1', 'bad'])('rejects invalid stored preference %s', stored => {
  localStorage.setItem(STUDIO_SPLIT_KEY, stored); render(<Workspace />);
  expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '60');
});
it('remains usable with blocked local storage and clamps narrow screens', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  render(<Workspace />);
  act(() => fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' }));
  expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '58');
  expect(clampSplit(70, 700)).toBe(60);
  expect(clampSplit(NaN, 1000)).toBe(60);
});
