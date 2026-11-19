import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PublicRsvpForm from '../invitations/PublicRsvpForm';
import { invitationService } from '../invitations/api/invitationApi';
import { rsvpService } from '../rsvp/api/rsvpApi';

vi.mock('../invitations/api/invitationApi', () => ({ invitationService: { publicGuestView: vi.fn() } }));
vi.mock('../rsvp/api/rsvpApi', () => ({ rsvpService: { publicWishes: vi.fn().mockResolvedValue([]), submitPublic: vi.fn(), submitPublicWithToken: vi.fn() } }));
beforeEach(() => { vi.resetAllMocks(); rsvpService.publicWishes.mockResolvedValue([]); localStorage.clear(); window.history.replaceState(null, '', '/w/fictional'); });
afterEach(cleanup);

it('C10 privacy: changing token cannot retain another guest response', async () => {
  invitationService.publicGuestView.mockResolvedValueOnce({ guestName: 'Guest Alpha', rsvpStatus: 'ATTENDING', seatCount: 1 }).mockResolvedValueOnce({ guestName: 'Guest Beta', rsvpStatus: 'PENDING' });
  const { rerender } = render(<PublicRsvpForm slug="fictional" inviteToken="fixture-alpha" languageMode="EN" showPublicWishes={false} />);
  await screen.findByText('Guest Alpha');
  rerender(<PublicRsvpForm slug="fictional" inviteToken="fixture-beta" languageMode="EN" showPublicWishes={false} />);
  await waitFor(() => expect(screen.queryByText('Guest Alpha')).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Submit RSVP' })).toBeInTheDocument();
});

it('C10 privacy: denied token cannot resurrect a matching cached receipt', async () => {
  localStorage.setItem('koupreng_guest_rsvp_fictional', JSON.stringify({ guestName: 'Revoked guest', inviteToken: 'fixture-revoked', responseStatus: 'ATTENDING' }));
  invitationService.publicGuestView.mockRejectedValue(new Error('403 denied'));
  render(<PublicRsvpForm slug="fictional" inviteToken="fixture-revoked" languageMode="EN" showPublicWishes={false} />);
  await act(async () => { await Promise.resolve(); });
  expect(screen.queryByText('Revoked guest')).not.toBeInTheDocument();
});

it('C10 privacy: late submission from an old token cannot rewrite the new URL or receipt', async () => {
  let acknowledge;
  invitationService.publicGuestView.mockResolvedValue({ guestName: 'Fixture guest', rsvpStatus: 'PENDING' });
  rsvpService.submitPublicWithToken.mockImplementation(() => new Promise(resolve => { acknowledge = resolve; }));
  const { rerender } = render(<PublicRsvpForm slug="fictional" inviteToken="fixture-alpha" languageMode="EN" showPublicWishes={false} />);
  await act(async () => { await Promise.resolve(); });
  fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));
  expect(rsvpService.submitPublicWithToken).toHaveBeenCalledWith('fictional', 'fixture-alpha', expect.any(Object));
  rerender(<PublicRsvpForm slug="fictional" inviteToken="fixture-beta" languageMode="EN" showPublicWishes={false} />);
  await act(async () => acknowledge({ guestName: 'Late private guest', inviteToken: 'fixture-alpha', responseStatus: 'ATTENDING' }));
  expect(screen.queryByText('Late private guest')).not.toBeInTheDocument();
  expect(window.location.search).not.toContain('fixture-alpha');
  expect(localStorage.getItem('koupreng_guest_rsvp_fictional')).toBeNull();
});

for (const status of [401,403,409,429,500]) it(`real RSVP ${status} is an error, retains input, retries only on acknowledgement`, async () => {
  invitationService.publicGuestView.mockResolvedValue({ guestName: 'Fixture guest', rsvpStatus: 'PENDING' });
  rsvpService.submitPublic.mockRejectedValueOnce(new Error(`${status}: retry response`)).mockResolvedValueOnce({ guestName: 'Fixture guest', responseStatus: 'ATTENDING', attendeeCount: 1 });
  render(<PublicRsvpForm slug="fictional" languageMode="EN" showPublicWishes={false} />);
  fireEvent.change(screen.getByLabelText('Guest name'), { target: { value: 'Fixture guest' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));
  await screen.findByText(`${status}: retry response`);
  expect(screen.queryByText('RSVP received')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Guest name')).toHaveValue('Fixture guest');
  fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));
  await screen.findByText('RSVP received');
  expect(rsvpService.submitPublic).toHaveBeenCalledTimes(2);
});
