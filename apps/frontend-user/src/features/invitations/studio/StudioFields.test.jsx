import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StudioField, StudioTextEditor, StudioValidationSummary } from './StudioFields';
afterEach(cleanup);
it('connects bilingual field guidance, required state and inline errors to the control', () => {
  render(<StudioField label="Venue name" help="Guests see this location." required english error="Enter the venue."><input /></StudioField>);
  const input = screen.getByRole('textbox', { name:'Venue name' });
  expect(input).toHaveAttribute('aria-required','true'); expect(input).toHaveAttribute('aria-invalid','true');
  expect(input).toHaveAccessibleDescription('Guests see this location. Enter the venue.');
});
it('keeps a text editor controlled and reports actual character count without changing authored content', () => {
  const change = vi.fn(); render(<StudioTextEditor english aria-label="Invitation text" value="Saved wording" onChange={change} />);
  expect(screen.getByRole('textbox')).toHaveValue('Saved wording'); expect(screen.getByText('13 characters')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox'), { target:{value:'Changed'} }); expect(change).toHaveBeenCalledOnce();
});
it('focuses a validation summary and links to the correct field without a popup', () => {
  const focus = vi.fn(); const issue = { field:'eventTimezone',section:'eventInfo',message:'Check the timezone.' };
  render(<StudioValidationSummary english issues={[issue]} onField={focus} />);
  expect(screen.getByRole('alert')).toHaveFocus(); fireEvent.click(screen.getByRole('button', { name:issue.message })); expect(focus).toHaveBeenCalledWith(issue);
});
