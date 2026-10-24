import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { api } from '@/shared/api/httpClient';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { EventContext } from './EventContext';
import AttendanceAnalytics from './AttendanceAnalytics';
vi.mock('@/shared/api/httpClient', () => ({ api: { get: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); useLanguageStore.setState({ lang: 'en' }); });
const data = { from: '2026-10-23', to: '2026-10-23', timezone: 'Asia/Phnom_Penh',
  current: { guestRecords: 10, reservedSeats: 18, respondedRecords: 4, confirmedAttendees: 5, checkedInRecords: 2 },
  days: [{ date: '2026-10-23', guestRecordsCreated: 2, latestRsvpRecords: 1, attendingRecords: 1, declinedRecords: 0, maybeRecords: 0, activeCheckInRecords: 1 }] };
function mount() { render(<MemoryRouter><EventContext.Provider value={{ eventId: '42' }}><AttendanceAnalytics /></EventContext.Provider></MemoryRouter>); }
it('shows current totals separately from dates with a truthful accessible chart equivalent', async () => {
  api.get.mockResolvedValue({ data }); mount();
  await screen.findByText('40.0%');
  expect(screen.getByText(/independent of the selected dates/)).toBeInTheDocument();
  expect(screen.getByRole('table')).toHaveAccessibleName('Daily data equivalent for the chart above');
  expect(screen.getByText(/not a history of every change/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-10-22' } });
  fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-10-23' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply dates' }));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/v1/invitations/42/analytics', { params: { from: '2026-10-22', to: '2026-10-23' } }));
});
it('fails closed on permission denial without showing previous data', async () => {
  api.get.mockRejectedValue({ status: 403, message: 'Forbidden' }); mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Check your team role');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
it('has an empty state with a zero-record denominator', async () => {
  api.get.mockResolvedValue({ data: { ...data, current: { ...data.current, guestRecords: 0, respondedRecords: 0 }, days: [] } }); mount();
  await screen.findByText('No stored activity in this date range.');
  expect(screen.queryByText('NaN%')).not.toBeInTheDocument();
});
