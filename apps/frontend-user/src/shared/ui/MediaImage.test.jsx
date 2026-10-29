import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import MediaImage from './MediaImage';
import { useLanguageStore } from '@/stores/useLanguageStore';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('finishes successful images and isolates retry and replacement state', () => {
  useLanguageStore.setState({ lang: 'en' });
  const { container, rerender } = render(<MediaImage src="/first.jpg" alt="Review image" />);
  expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  fireEvent.error(screen.getByAltText('Review image'));
  expect(screen.getByText('Image could not be loaded.')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry image' }));
  fireEvent.load(screen.getByAltText('Review image'));
  expect(container.firstChild).toHaveAttribute('aria-busy', 'false');
  expect(container.querySelector('.k-skeleton')).toBeNull();
  rerender(<MediaImage src="/next.jpg" alt="Replacement" />);
  expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
});

it('bounds stalled requests and clears timeout after unmount', () => {
  vi.useFakeTimers();
  useLanguageStore.setState({ lang: 'en' });
  const { unmount } = render(<MediaImage src="/stalled.jpg" alt="Stalled" />);
  act(() => vi.advanceTimersByTime(15000));
  expect(screen.getByRole('button', { name: 'Retry image' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry image' }));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
