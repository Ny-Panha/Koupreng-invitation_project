import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StudioToolbar from './StudioToolbar';

afterEach(cleanup);

describe('StudioToolbar', () => {
  const defaultStudio = {
    phase: 'saved',
    flush: vi.fn().mockResolvedValue(true),
    undo: vi.fn(),
    redo: vi.fn(),
    reset: vi.fn(),
    canUndo: true,
    canRedo: false,
  };

  it('renders title, template name and save status in English', () => {
    render(
      <StudioToolbar
        title="Bopha & Vibol Wedding"
        templateName="Khmer Floral Gold"
        english={true}
        studio={defaultStudio}
        saving={false}
        canEdit={true}
        onBack={vi.fn()}
        onPreview={vi.fn()}
        onTemplate={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Bopha & Vibol Wedding' })).toBeInTheDocument();
    expect(screen.getByText('Khmer Floral Gold')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('data-phase', 'saved');
    expect(screen.getByRole('status')).toHaveTextContent('Saved to server');
  });

  it('renders save status in Khmer when english is false', () => {
    render(
      <StudioToolbar
        title="អាពាហ៍ពិពាហ៍"
        templateName="ផ្កាមាសខ្មែរ"
        english={false}
        studio={{ ...defaultStudio, phase: 'unsaved' }}
        saving={false}
        canEdit={true}
      />
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-phase', 'unsaved');
    expect(screen.getByRole('status')).toHaveTextContent('មិនទាន់រក្សាទុក');
  });

  it('triggers save on save button click and on Ctrl+S shortcut', async () => {
    const studio = { ...defaultStudio, flush: vi.fn().mockResolvedValue(true) };
    render(
      <StudioToolbar
        title="Wedding"
        templateName="Template"
        english={true}
        studio={studio}
        saving={false}
        canEdit={true}
      />
    );

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);
    expect(studio.flush).toHaveBeenCalledWith({ deliberate: true });

    // Test Ctrl+S
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    await waitFor(() => {
      expect(studio.flush).toHaveBeenCalledTimes(2);
    });
  });

  it('calls onPreview when Preview button is clicked', () => {
    const onPreview = vi.fn();
    render(
      <StudioToolbar
        title="Wedding"
        templateName="Template"
        english={true}
        studio={defaultStudio}
        saving={false}
        canEdit={true}
        onPreview={onPreview}
      />
    );

    const previewBtn = screen.getByRole('button', { name: 'Preview invitation' });
    fireEvent.click(previewBtn);
    expect(onPreview).toHaveBeenCalledOnce();
  });

  it('allows undo and redo through the more menu', () => {
    const studio = { ...defaultStudio, undo: vi.fn(), redo: vi.fn(), canUndo: true, canRedo: true };
    const { container } = render(
      <StudioToolbar
        title="Wedding"
        templateName="Template"
        english={true}
        studio={studio}
        saving={false}
        canEdit={true}
      />
    );

    const moreSummary = container.querySelector('summary[aria-label="More studio actions"]');
    expect(moreSummary).toBeInTheDocument();
    fireEvent.click(moreSummary);

    const undoBtn = screen.getByRole('button', { name: 'Undo' });
    fireEvent.click(undoBtn);
    expect(studio.undo).toHaveBeenCalledOnce();

    const redoBtn = screen.getByRole('button', { name: 'Redo' });
    fireEvent.click(redoBtn);
    expect(studio.redo).toHaveBeenCalledOnce();
  });
});
