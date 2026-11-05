import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvitationMediaManager from './InvitationMediaManager';
import { mediaService } from './api/mediaApi';
import { invitationService } from './api/invitationApi';

vi.mock('./api/mediaApi', () => ({
  mediaService: {
    list: vi.fn(),
    uploadCover: vi.fn(),
    uploadGallery: vi.fn(),
    uploadVideo: vi.fn(),
    uploadMusic: vi.fn(),
    replace: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('./api/invitationApi', () => ({
  invitationService: {
    get: vi.fn(),
  },
}));

vi.mock('@/features/events/workspace/EventContext', () => ({
  useEventWorkspace: () => ({
    updateEvent: vi.fn(),
    can: () => true,
    isOwner: true,
  }),
}));

afterEach(cleanup);

describe('InvitationMediaManager', () => {
  const sampleMedia = {
    coverImage: { id: 1, fileUrl: 'https://example.com/cover.jpg', originalFilename: 'cover.jpg' },
    galleryImages: [
      { id: 2, fileUrl: 'https://example.com/photo1.jpg', originalFilename: 'photo1.jpg', fileSize: 1048576 },
    ],
    video: null,
    music: null,
  };

  const sampleInvitation = {
    id: 101,
    title: 'Bopha & Vibol Wedding',
    coverBackgroundImage: 'https://example.com/cover.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mediaService.list.mockResolvedValue(sampleMedia);
    invitationService.get.mockResolvedValue(sampleInvitation);
  });

  it('renders media categories and assets', async () => {
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /រូបគម្រប|cover/i })).toBeInTheDocument();
    });

    expect(screen.getByText('cover.jpg')).toBeInTheDocument();
  });

  it('switches category when tab is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('cover.jpg')).toBeInTheDocument();
    });

    const galleryTab = screen.getByRole('button', { name: /កម្រងរូបភាព|gallery/i });
    fireEvent.click(galleryTab);

    await waitFor(() => {
      expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
    });
  });
});
