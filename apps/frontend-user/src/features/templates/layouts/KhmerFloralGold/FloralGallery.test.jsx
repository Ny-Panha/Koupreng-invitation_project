import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FloralGallery from './FloralGallery';

afterEach(cleanup);
const photos = [1, 2, 3].map(id => ({ id, src: `/uploads/owner-${id}.webp`, alt: `Owner photograph ${id}` }));

describe('Floral fullscreen gallery', () => {
  it('supports swipe and keyboard paging, thumbnails, Escape and focus return', () => {
    render(<FloralGallery photos={photos} english motion="none" />);
    screen.getByRole('button', { name: 'Open photograph 1' }).focus();
    fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
    const viewer = screen.getByRole('dialog', { name: 'Wedding photo viewer' });
    expect(viewer.querySelector('[data-motion]')).toHaveAttribute('data-motion', 'none');
    const image = within(viewer).getByAltText('Owner photograph 1');
    fireEvent.pointerDown(image, { clientX: 220, clientY: 120 });
    fireEvent.pointerUp(image, { clientX: 100, clientY: 125 });
    expect(within(viewer).getByAltText('Owner photograph 2')).toBeInTheDocument();
    fireEvent.keyDown(viewer.querySelector('.kfg-lightbox-content'), { key: 'ArrowRight' });
    expect(within(viewer).getByAltText('Owner photograph 3')).toBeInTheDocument();
    fireEvent.click(within(viewer).getByRole('button', { name: 'Show photograph 1' }));
    expect(within(viewer).getByRole('button', { name: 'Show photograph 1' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open photograph 1' })).toHaveFocus();
  });

  it('releases the parent navigation lock when an expanded gallery unmounts', () => {
    const expanded = vi.fn();
    const { unmount } = render(<FloralGallery photos={photos} english onExpandedChange={expanded} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
    expect(expanded).toHaveBeenLastCalledWith(true);
    unmount();
    expect(expanded).toHaveBeenLastCalledWith(false);
  });
});
