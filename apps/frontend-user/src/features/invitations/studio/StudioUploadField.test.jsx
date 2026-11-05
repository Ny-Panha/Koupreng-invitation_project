import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StudioUploadField from './StudioUploadField';

afterEach(cleanup);

describe('StudioUploadField', () => {
  it('renders upload dropzone when no image is provided', () => {
    render(
      <StudioUploadField
        label="Cover background"
        image=""
        onUpload={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Cover background')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Click to upload image|ចុចបញ្ចូលរូបភាព/i })).toBeInTheDocument();
  });

  it('renders preview image and action buttons when image is provided', () => {
    const onRemove = vi.fn();
    render(
      <StudioUploadField
        label="Cover background"
        image="https://example.com/cover.webp"
        onUpload={vi.fn()}
        onRemove={onRemove}
      />
    );

    const img = screen.getByRole('img', { name: 'Cover background' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/cover.webp');

    const deleteBtn = screen.getByRole('button', { name: /Delete|លុប/i });
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('renders restore button when hasDefault is true', () => {
    const onRestoreDefault = vi.fn();
    render(
      <StudioUploadField
        label="Cover background"
        image="https://example.com/cover.webp"
        hasDefault={true}
        onRestoreDefault={onRestoreDefault}
        onUpload={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const restoreBtn = screen.getByRole('button', { name: /Original image|រូបដើម/i });
    expect(restoreBtn).toBeInTheDocument();

    fireEvent.click(restoreBtn);
    expect(onRestoreDefault).toHaveBeenCalledOnce();
  });
});
