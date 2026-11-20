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

  it('triggers undo and redo shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y) when not in editable input', () => {
    const studio = { ...defaultStudio, undo: vi.fn(), redo: vi.fn(), canUndo: true, canRedo: true };
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

    // Document-level Ctrl+Z -> undo
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(studio.undo).toHaveBeenCalledOnce();

    // Document-level Ctrl+Shift+Z -> redo
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });
    expect(studio.redo).toHaveBeenCalledOnce();

    // Document-level Ctrl+Y -> redo
    fireEvent.keyDown(window, { key: 'y', ctrlKey: true });
    expect(studio.redo).toHaveBeenCalledTimes(2);
  });

  it('does NOT trigger document undo/redo shortcut when focused in a text input', () => {
    const studio = { ...defaultStudio, undo: vi.fn(), redo: vi.fn(), canUndo: true, canRedo: true };
    render(
      <div>
        <input type="text" data-testid="title-input" />
        <StudioToolbar
          title="Wedding"
          templateName="Template"
          english={true}
          studio={studio}
          saving={false}
          canEdit={true}
        />
      </div>
    );

    const input = screen.getByTestId('title-input');
    input.focus();

    // Native typing undo should be preserved
    fireEvent.keyDown(input, { key: 'z', ctrlKey: true });
    expect(studio.undo).not.toHaveBeenCalled();
  });

  it('renders conflict and expired statuses with clear labels', () => {
    const { rerender } = render(
      <StudioToolbar
        title="Wedding"
        templateName="Template"
        english={true}
        studio={{ ...defaultStudio, phase: 'conflict' }}
        saving={false}
        canEdit={true}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Newer version on server');

    rerender(
      <StudioToolbar
        title="Wedding"
        templateName="Template"
        english={true}
        studio={{ ...defaultStudio, phase: 'expired' }}
        saving={false}
        canEdit={true}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Session expired');
  });

  it.each(['composition', 'alt', 'handled', 'dialog', 'editable-child'])('preserves %s keyboard ownership', kind => {
    const studio = { ...defaultStudio, undo: vi.fn(), flush: vi.fn() };
    const { container } = render(<><div role="dialog"><button data-modal="true">Dialog action</button></div><div contentEditable suppressContentEditableWarning><span data-editable="true">Text</span></div><StudioToolbar english studio={studio} canEdit /></>);
    const target = kind === 'dialog' ? container.querySelector('[data-modal]') : kind === 'editable-child' ? container.querySelector('[data-editable]') : window;
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true, isComposing: kind === 'composition', altKey: kind === 'alt' });
    if (kind === 'handled') event.preventDefault();
    fireEvent(target, event);
    expect(studio.undo).not.toHaveBeenCalled();
    if (kind !== 'handled') expect(event.defaultPrevented).toBe(false);
  });

  it.each(['conflict', 'expired', 'denied'])('does not mutate document history in %s state', phase => {
    const studio = { ...defaultStudio, phase, undo: vi.fn() };
    render(<StudioToolbar english studio={studio} canEdit />);
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true });
    fireEvent(window, event);
    expect(studio.undo).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves unavailable Save shortcuts to the browser', () => {
    render(<StudioToolbar english studio={defaultStudio} canEdit={false} />);
    const event = new KeyboardEvent('keydown', { key: 's', metaKey: true, cancelable: true });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(false);
  });
});
