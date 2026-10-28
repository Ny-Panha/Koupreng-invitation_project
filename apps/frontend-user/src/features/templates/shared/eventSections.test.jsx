import { feedback } from "@/shared/feedback/feedback";
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WeddingProgramEditor from '../../invitations/studio/WeddingProgramEditor';
import SaveTheDateEditor from '../../invitations/studio/SaveTheDateEditor';
import ProgramTimeline from './ProgramTimeline';
import SaveTheDate, { EventCalendar, WeddingCountdown } from './SaveTheDate';
import { groupProgram } from './program';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const content = { eventDate: '2027-12-05', eventTime: '17:00', languageMode: 'EN', saveTheDate: { enabled: true, showCalendar: true, showAddToCalendar: true }, programDays: [{ id: 'one', title: 'ពិធី', titleEn: 'Our first day' }, { id: 'two', date: '2027-12-07' }], schedule: [{ id: 'a', dayId: 'one', time: '07:00', title: 'ពិធី', titleEn: 'Ceremony', note: 'retain extension', description: 'line one\nline two' }, { id: 'b', dayId: 'two', title: 'Reception', enabled: false }] };
function Editor() {
  const [state, setState] = useState(content);
  return <><WeddingProgramEditor english masterDate={state.eventDate} value={state.schedule} programDays={state.programDays} onChange={(schedule, programDays) => setState({ ...state, schedule, programDays })} /><output data-testid="state">{JSON.stringify(state)}</output></>;
}

vi.mock("@/shared/feedback/feedback", () => ({ feedback: { confirm: vi.fn().mockResolvedValue(false) } }));

describe('multi-day editing and preservation', () => {
  it('adds arbitrary days/ceremonies, edits and reorders while retaining extensions', () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: 'Add program day' }));
    const days = screen.getAllByRole('group', { name: /^Day \d/ }); expect(days).toHaveLength(3);
    fireEvent.click(within(days[2]).getByRole('button', { name: 'Add ceremony' }));
    fireEvent.change(within(days[2]).getByLabelText('Ceremony / Khmer'), { target: { value: 'ពិធីថ្មី' } });
    fireEvent.click(screen.getByRole('button', { name: 'Move day 3 up' }));
    const saved = JSON.parse(screen.getByTestId('state').textContent);
    expect(saved.programDays).toHaveLength(3); expect(saved.schedule.find(row => row.title === 'ពិធីថ្មី').day).toBe(2);
    expect(saved.schedule.find(row => row.id === 'a').note).toBe('retain extension');
    expect(groupProgram(saved.schedule, saved.eventDate, saved.programDays)[1].resolvedDate).toBe('2027-12-06');
  });
  it('requires confirmation to replace authored content or remove a day', () => {
    const confirm = feedback.confirm; confirm.mockClear(); render(<Editor />);
    fireEvent.change(screen.getByLabelText('Program preset'), { target: { value: 'two-day' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply preset' }));
    expect(JSON.parse(screen.getByTestId('state').textContent).schedule[0].id).toBe('a');
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove program day' })[0]);
    expect(confirm).toHaveBeenCalledTimes(2); expect(screen.getAllByRole('group', { name: /^Day \d/ })).toHaveLength(2);
  });
  it('renders grouped dates, authored multiline text, and hides disabled entries without mutating input', () => {
    render(<ProgramTimeline content={content} />);
    expect(screen.getByRole('heading', { name: /Our first day/ })).toBeInTheDocument();
    expect(screen.getByText('Ceremony')).toBeInTheDocument(); expect(screen.queryByText('Reception')).not.toBeInTheDocument();
    expect(content.schedule).toHaveLength(2); expect(screen.getByText(/line one/).textContent).toContain('\n');
  });
});

describe('date controls and accessible calendar', () => {
  it('shows the event day as a nonselectable date and navigates months', () => {
    render(<EventCalendar date="2026-12-05" english numerals="latin" navigation />);
    expect(screen.getByLabelText('5 December 2026, event date').tagName).toBe('TIME');
    expect(screen.getByRole('table').querySelectorAll('td')).toHaveLength(35);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('heading', { name: 'January 2027' })).toBeInTheDocument();
    expect(document.querySelector('.kp-calendar-event')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Return to event month' }));
    expect(screen.getByLabelText('5 December 2026, event date')).toBeInTheDocument();
  });
  it('keeps controls independent, reports invalid zones and uses canonical event fields', () => {
    const change = vi.fn(); const { rerender } = render(<SaveTheDateEditor english form={content} onChange={change} />);
    fireEvent.click(screen.getByLabelText('Show calendar')); expect(change).toHaveBeenCalledWith({ saveTheDate: { ...content.saveTheDate, showCalendar: false } });
    fireEvent.change(screen.getByLabelText('Event date'), { target: { value: '2028-02-29' } }); expect(change).toHaveBeenCalledWith({ eventDate: '2028-02-29' });
    rerender(<SaveTheDateEditor english form={{ ...content, eventTimezone: 'invalid' }} onChange={change} />);
    expect(screen.getByRole('alert')).toHaveTextContent('IANA timezone');
  });
  it('disabling a section removes its display while retaining the input object', () => {
    const { rerender } = render(<SaveTheDate content={content} />); expect(screen.getByRole('table')).toBeInTheDocument();
    rerender(<SaveTheDate content={{ ...content, saveTheDate: { ...content.saveTheDate, enabled: false } }} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument(); expect(content.saveTheDate.showCalendar).toBe(true);
  });
  it('uses a static date for an all-day event and never invents a countdown', () => {
    render(<SaveTheDate content={{ ...content, eventTime: '' }} />);
    expect(screen.queryByRole('timer')).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Add to calendar' })).toBeInTheDocument();
  });
});

describe('live clocks', () => {
  it('recalculates suspended tabs, supports simultaneous timers and clears timers on unmount', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2027-01-01T00:00:00Z'));
    const target = Date.now() + 86400000;
    const view = render(<><WeddingCountdown instant={target} english numerals="latin" /><WeddingCountdown instant={target + 3600000} english numerals="latin" /></>);
    expect(screen.getAllByRole('timer')).toHaveLength(2);
    expect(screen.getAllByRole('timer')[0]).toHaveAttribute('aria-live', 'off');
    act(() => { vi.setSystemTime(new Date(target + 1)); document.dispatchEvent(new Event('visibilitychange')); });
    expect(screen.getByRole('status')).toHaveTextContent('The celebration has begun');
    expect(screen.getAllByRole('timer')).toHaveLength(1);
    view.unmount(); expect(vi.getTimerCount()).toBe(0);
  });
});
