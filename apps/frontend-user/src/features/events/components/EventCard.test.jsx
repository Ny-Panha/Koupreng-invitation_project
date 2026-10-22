import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EventCard } from './EventCard';
import { useLanguageStore } from '@/stores/useLanguageStore';
afterEach(cleanup);
it.each(['DRAFT', 'PUBLISHED'])('prioritizes the appropriate %s event action and keeps event identity explicit', status => {
  useLanguageStore.setState({lang:'en'});
  const onEdit=vi.fn(), onManage=vi.fn();
  const draft={id:123,title:'Dara and Sokha',templateCode:'silk-heritage',status};
  render(<EventCard draft={draft} onEdit={onEdit} onManage={onManage} />);
  expect(screen.getByRole('heading',{name:'Dara and Sokha'})).toBeInTheDocument();
  expect(screen.getByText('Silk Heritage')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:status==='DRAFT'?'Continue editing':'Manage event'}));
  expect(status==='DRAFT'?onEdit:onManage).toHaveBeenCalledWith(draft);
});
