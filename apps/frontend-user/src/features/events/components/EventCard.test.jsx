import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EventCard } from './EventCard';
import { useLanguageStore } from '@/stores/useLanguageStore';
afterEach(cleanup);
it.each(['DRAFT', 'PUBLISHED'])('prioritizes management for the %s event and keeps event identity explicit', status => {
  useLanguageStore.setState({lang:'en'});
  const onEdit=vi.fn(), onManage=vi.fn();
  const draft={id:123,title:'Dara and Sokha',templateCode:'silk-heritage',status};
  render(<EventCard draft={draft} onEdit={onEdit} onManage={onManage} />);
  expect(screen.getByRole('heading',{name:'Dara and Sokha'})).toBeInTheDocument();
  expect(screen.getByText('Silk Heritage')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Manage event'}));
  expect(onManage).toHaveBeenCalledWith(draft);
});

it('falls back from a broken owner image and resets the image when switching events', () => {
  const { rerender } = render(<EventCard draft={{ id: 1, title: 'One', coverUrl: '/missing.png', templateCode: 'khmer-celestial' }} />);
  const image = screen.getByRole('img');
  fireEvent.error(image);
  expect(image).toHaveAttribute('src', '/facebook/all/06-card/cover-card.jpg');
  rerender(<EventCard draft={{ id: 2, title: 'Two', coverUrl: '/two.png' }} />);
  expect(screen.getByRole('img')).toHaveAttribute('src', '/two.png');
});
