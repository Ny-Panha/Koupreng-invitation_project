import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WithJoyPortalLayout from './WithJoyPortalLayout';
import BlissEditorialLayout from './BlissEditorialLayout';
afterEach(cleanup);
it.each([['WithJoy', WithJoyPortalLayout], ['Bliss', BlissEditorialLayout]])('%s uses the canonical hosted RSVP and retains its input across language changes', (_, Layout) => {
  const make = languageMode => <MemoryRouter><Layout content={{ languageMode, groom: 'First partner', bride: 'Second partner', hasHostContent: true, enabledSections: { rsvp: true, map: false, schedule: false, gallery: false, story: false } }}><textarea aria-label="Canonical hosted RSVP" defaultValue="" /></Layout></MemoryRouter>;
  const { rerender } = render(make('KH'));
  const input = screen.getByLabelText('Canonical hosted RSVP'); fireEvent.change(input, { target: { value: 'Retained RSVP edit' } });
  rerender(make('EN')); expect(screen.getByLabelText('Canonical hosted RSVP')).toHaveValue('Retained RSVP edit');
  expect(screen.queryByRole('button', { name: /Submit RSVP|SUBMIT/ })).not.toBeInTheDocument();
});
