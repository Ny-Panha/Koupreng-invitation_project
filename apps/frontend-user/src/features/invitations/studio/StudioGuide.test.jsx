import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StudioGuide from './StudioGuide';
import PublishReview from './PublishReview';
import { publishReadiness } from './publishReadiness';

afterEach(cleanup);
const form = { title: 'Our day', groomName: 'Dara', brideName: 'Sophea', eventDate: '2027-01-10', eventTime: '17:30', venueName: 'Garden', venueAddress: 'Phnom Penh' };
describe('guided publication', () => {
  it('keeps story, gallery and other optional sections out of the publish gate', () => {
    expect(publishReadiness(form).every(check => check.complete)).toBe(true);
    expect(publishReadiness({ ...form, brideName: '' }).find(check => check.key === 'brideName').complete).toBe(false);
    const birthday = publishReadiness({ ...form, brideName: '', groomName: '', hostName: 'Host' }, 'BIRTHDAY');
    expect(birthday.every(check => check.complete)).toBe(true);
    expect(birthday.some(check => check.key === 'brideName')).toBe(false);
  });
  it('names all five steps and routes missing fields to their existing editor section', () => {
    const onField = vi.fn();
    render(<StudioGuide english mode="guided" step={3} sections={['eventInfo','venue','story']} checks={publishReadiness({ ...form, venueAddress: '' })} onField={onField} />);
    expect(screen.getByRole('navigation', { name: 'Creation steps' }).querySelectorAll('li')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Complete field' }));
    expect(onField).toHaveBeenCalledWith(expect.objectContaining({ field: 'venueAddress', section: 'venue' }));
    expect(screen.getByRole('button', { name: /Preview & review/ })).toHaveAttribute('aria-current', 'step');
  });
  it('requires explicit confirmation and never enables publication with missing required fields', () => {
    const confirm = vi.fn();
    const { rerender } = render(<PublishReview open english onClose={vi.fn()} onConfirm={confirm} checks={publishReadiness({ ...form, title: '' })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm publication' }));
    expect(confirm).not.toHaveBeenCalled();
    rerender(<PublishReview open english onClose={vi.fn()} onConfirm={confirm} checks={publishReadiness(form)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm publication' }));
    expect(confirm).toHaveBeenCalledOnce();
  });
  it('shows a usable link and truthful clipboard failure after server-confirmed publication', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) } });
    render(<StudioGuide english mode="guided" step={4} sections={[]} checks={publishReadiness(form)} published publishedUrl="https://example.test/i/our-day" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy invitation link' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Could not copy');
    expect(screen.getByRole('link', { name: 'View invitation' })).toHaveAttribute('href', 'https://example.test/i/our-day');
    vi.unstubAllGlobals();
  });
});
