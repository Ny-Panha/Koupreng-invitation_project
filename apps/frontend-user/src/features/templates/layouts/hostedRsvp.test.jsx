import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WithJoyPortalLayout from './WithJoyPortalLayout';
import BlissEditorialLayout from './BlissEditorialLayout';
import KhmerRoyalLotusLayout from './KhmerRoyalLotus/KhmerRoyalLotusLayout';
import { InvitationLocaleContext } from '../shared/invitationLocaleContext';
afterEach(cleanup);
it.each([['WithJoy', WithJoyPortalLayout], ['Bliss', BlissEditorialLayout]])('%s uses the canonical hosted RSVP and retains its input across language changes', (_, Layout) => {
  const make = languageMode => <MemoryRouter><Layout content={{ languageMode, groom: 'First partner', bride: 'Second partner', hasHostContent: true, enabledSections: { rsvp: true, map: false, schedule: false, gallery: false, story: false } }}><textarea aria-label="Canonical hosted RSVP" defaultValue="" /></Layout></MemoryRouter>;
  const { rerender } = render(make('KH'));
  const input = screen.getByLabelText('Canonical hosted RSVP'); fireEvent.change(input, { target: { value: 'Retained RSVP edit' } });
  rerender(make('EN')); expect(screen.getByLabelText('Canonical hosted RSVP')).toHaveValue('Retained RSVP edit');
  expect(screen.queryByRole('button', { name: /Submit RSVP|SUBMIT/ })).not.toBeInTheDocument();
});
it('Royal Lotus localizes system headings and preserves empty optional closing and authored honorifics', () => {
  const { container } = render(<MemoryRouter><InvitationLocaleContext.Provider value="EN"><KhmerRoyalLotusLayout preview content={{ languageMode: 'EN', groomName: 'First partner', brideName: 'Second partner', hasHostContent: true, groomFather: 'Guardian without inferred title', thankYouTitle: '', thankYouText: '', enabledSections: { rsvp: false, gallery: false, gift: false } }} /></InvitationLocaleContext.Provider></MemoryRouter>);
  expect(container.textContent).toContain('First partner’s family'); expect(container.textContent).toContain('Until our celebration');
  expect(container.textContent).not.toContain('រាប់ថយក្រោយដល់ថ្ងៃមង្គល'); expect(container.textContent).not.toContain('លោក Guardian');
  expect(container.querySelector('.krl-closing h2')).toBeEmptyDOMElement(); expect(container.querySelector('.krl-closing p')).toBeEmptyDOMElement();
});
