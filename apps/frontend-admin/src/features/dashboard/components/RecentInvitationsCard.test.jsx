import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import RecentInvitationsCard from './RecentInvitationsCard';
afterEach(cleanup);
it('reports a real empty state without fictional invitation or host records', () => {
  render(<MemoryRouter><RecentInvitationsCard lang="en" invitations={[]} /></MemoryRouter>);
  expect(screen.getByRole('status')).toHaveTextContent('No recent invitations to display.');
  expect(screen.queryByText(/Sok & Chenda|INV-1061|PREVIEW/)).not.toBeInTheDocument();
});
it('renders only supplied records and does not invent a template name', () => {
  render(<MemoryRouter><RecentInvitationsCard lang="en" invitations={[{ id: 5, title: 'Real saved event', status: 'DRAFT' }]} /></MemoryRouter>);
  expect(screen.getByText('Real saved event')).toBeInTheDocument();
  expect(screen.getByText('Template not specified')).toBeInTheDocument();
  expect(screen.queryByText('Khmer Celestial Theme')).not.toBeInTheDocument();
});
