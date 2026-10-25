import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import StudioFontPreview from './StudioFontPreview';
afterEach(cleanup);
it('retains unknown saved fonts and previews authored Khmer without rewriting it', () => {
  const update = vi.fn();
  render(<StudioFontPreview english form={{ fontKhmer: 'Legacy Family Font', fontLatin: 'Cinzel', groomName: 'សុវណ្ណ វិសាល', brideName: 'សុភ័ក្រ ស្រីពេជ្រ' }} update={update} />);
  expect(screen.getByLabelText('Khmer heading')).toHaveValue('Legacy Family Font');
  expect(screen.getByLabelText('Latin heading')).toHaveValue('Cinzel');
  expect(screen.getByText(/សុវណ្ណ វិសាល និង សុភ័ក្រ ស្រីពេជ្រ/)).toHaveStyle({ fontFamily: '"Legacy Family Font", "Noto Sans Khmer", serif' });
  expect(update).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Khmer heading'), { target: { value: 'Battambang' } });
  expect(update).toHaveBeenCalledWith('fontKhmer', 'Battambang');
});
