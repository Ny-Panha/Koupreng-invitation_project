import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MarketingShell from '../../layouts/MarketingShell';
import { useContactDraft } from './contactDraft';

const auth = vi.hoisted(() => ({ user: { id: 1 } }));
vi.mock('../auth/hooks/useAuth', () => ({ useAuth: () => ({ user: auth.user, isAuthenticated: true, logout: vi.fn() }) }));
afterEach(cleanup);
function Probe() {
  const [draft, setDraft] = useContactDraft();
  return <input aria-label="Draft name" value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} />;
}
const tree = () => <MemoryRouter><Routes><Route element={<MarketingShell />}><Route path="/" element={<Probe />} /></Route></Routes></MemoryRouter>;

it('clears the shell draft at an account boundary and never persists contact data', () => {
  const view = render(tree());
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft name' }), { target: { value: 'Fictional Private Draft' } });
  expect(screen.getByRole('textbox')).toHaveValue('Fictional Private Draft');
  for (const storage of [localStorage, sessionStorage]) {
    for (let i=0;i<storage.length;i++) expect(storage.getItem(storage.key(i))).not.toContain('Fictional Private Draft');
  }
  auth.user = { id: 2 }; view.rerender(tree());
  expect(screen.getByRole('textbox')).toHaveValue('');
  auth.user = null; view.rerender(tree());
  expect(screen.getByRole('textbox')).toHaveValue('');
});
