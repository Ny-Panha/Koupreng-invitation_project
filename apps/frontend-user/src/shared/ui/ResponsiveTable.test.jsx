import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ResponsiveTable from './ResponsiveTable';

it('scrolls an overflowing region with horizontal keys while preserving child and modified keys', () => {
  render(<ResponsiveTable ariaLabel="Members"><tbody><tr><td><button type="button">Manage member</button></td></tr></tbody></ResponsiveTable>);
  const region = screen.getByRole('region', { name: 'Members' });
  Object.defineProperties(region, { scrollWidth: { configurable: true, value: 600 }, clientWidth: { configurable: true, value: 200 } });
  region.focus();
  expect(fireEvent.keyDown(region, { key: 'ArrowRight' })).toBe(false);
  expect(region.scrollLeft).toBe(40);
  fireEvent.keyDown(region, { key: 'ArrowLeft' });
  expect(region.scrollLeft).toBe(0);
  expect(fireEvent.keyDown(screen.getByRole('button'), { key: 'ArrowRight' })).toBe(true);
  expect(fireEvent.keyDown(region, { key: 'ArrowRight', ctrlKey: true })).toBe(true);
  expect(fireEvent.keyDown(region, { key: 'ArrowDown' })).toBe(true);
  expect(region.scrollLeft).toBe(0);
  Object.defineProperty(region, 'scrollWidth', { configurable: true, value: 200 });
  expect(fireEvent.keyDown(region, { key: 'ArrowRight' })).toBe(true);
  expect(region.scrollLeft).toBe(0);
});
