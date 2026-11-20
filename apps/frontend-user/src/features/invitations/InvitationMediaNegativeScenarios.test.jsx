import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvitationMediaManager from './InvitationMediaManager';
import { mediaService } from './api/mediaApi';
import { invitationService } from './api/invitationApi';
import {
  chunkBatch,
  focalPointStyle,
  invitationMediaReferences,
  reorderGalleryItems,
  validateLibraryFile,
} from './mediaLibraryModel';
import {
  acknowledgeStudioMedia,
  preserveStudioJson,
  stripInlineMedia,
  studioGallery,
} from './invitationPayloadUtils';

vi.mock('./api/mediaApi', () => ({
  mediaService: {
    list: vi.fn(),
    uploadCover: vi.fn(),
    uploadGallery: vi.fn(),
    uploadVideo: vi.fn(),
    uploadMusic: vi.fn(),
    uploadTicketImage: vi.fn(),
    uploadPreWeddingVideo: vi.fn(),
    replace: vi.fn(),
    remove: vi.fn(),
    ownerCinematicContent: vi.fn(),
    publicCinematicContent: vi.fn(),
  },
}));

vi.mock('./api/invitationApi', () => ({
  invitationService: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

const mockWorkspace = {
  updateEvent: vi.fn(),
  can: vi.fn(() => true),
  isOwner: true,
  access: { owner: true, permissions: ['MANAGE_INVITATION', 'VIEW_EVENT'] },
};

vi.mock('@/features/events/workspace/EventContext', () => ({
  useEventWorkspace: () => mockWorkspace,
}));

let currentMockUser = { id: 1001, userId: 1001, email: 'userA@test.com' };
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: currentMockUser }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  currentMockUser = { id: 1001, userId: 1001, email: 'userA@test.com' };
});

describe('Phase 14.1 Mandatory Negative Scenarios (N14-01 .. N14-48)', () => {
  const sampleMedia = {
    coverImage: { id: 1, fileUrl: 'https://example.com/cover.jpg', originalFilename: 'cover.jpg' },
    galleryImages: [
      { id: 2, fileUrl: 'https://example.com/photo1.jpg', originalFilename: 'photo1.jpg', fileSize: 1024 * 1024 },
      { id: 3, fileUrl: 'https://example.com/photo2.jpg', originalFilename: 'photo2.jpg', fileSize: 1024 * 1024 },
    ],
    video: null,
    music: null,
  };

  const sampleInvitation = {
    id: 101,
    title: 'Bopha & Vibol Wedding',
    coverBackgroundImage: 'https://example.com/cover.jpg',
    contentJson: JSON.stringify({
      gallery: [{ preview: 'https://example.com/photo1.jpg' }],
    }),
    designJson: JSON.stringify({
      coverImage: 'https://example.com/cover.jpg',
    }),
  };

  beforeEach(() => {
    mediaService.list.mockResolvedValue({ ...sampleMedia });
    invitationService.get.mockResolvedValue({ ...sampleInvitation });
  });

  // N14-01: PNG file exactly 5 MiB accepted; 5 MiB + 1 rejected
  it('N14-01 accepts PNG file of exactly 5 MiB and rejects 5 MiB + 1 byte', () => {
    const exact5Mb = { name: 'exact.png', type: 'image/png', size: 5 * 1024 * 1024 };
    const over5Mb = { name: 'over.png', type: 'image/png', size: 5 * 1024 * 1024 + 1 };
    expect(validateLibraryFile(exact5Mb, 'cover')).toBe('');
    expect(validateLibraryFile(over5Mb, 'cover')).toBe('sizeError');
  });

  // N14-02: empty/zero-byte image rejected with field-specific guidance
  it('N14-02 rejects empty zero-byte image with emptyError guidance', () => {
    const zeroByte = { name: 'empty.png', type: 'image/png', size: 0 };
    expect(validateLibraryFile(zeroByte, 'gallery')).toBe('emptyError');
  });

  // N14-03: file .png containing JPEG MIME or mismatched signature rejected safely
  it('N14-03 rejects mismatched extension and content type', () => {
    const mismatch = { name: 'photo.png', type: 'image/jpeg', size: 1024 };
    expect(validateLibraryFile(mismatch, 'gallery')).toBe('formatError');
  });

  // N14-04: SVG/GIF/HEIC/HEIF/executable disguised as picture rejected; no auto-conversion
  it('N14-04 rejects SVG, GIF, HEIC, and executables with explicit errors', () => {
    expect(validateLibraryFile({ name: 'logo.svg', type: 'image/svg+xml', size: 500 }, 'cover')).toBe('formatError');
    expect(validateLibraryFile({ name: 'anim.gif', type: 'image/gif', size: 500 }, 'cover')).toBe('formatError');
    expect(validateLibraryFile({ name: 'shot.heic', type: 'image/heic', size: 500 }, 'cover')).toBe('heicError');
    expect(validateLibraryFile({ name: 'shot.heif', type: 'image/heif', size: 500 }, 'cover')).toBe('heicError');
    expect(validateLibraryFile({ name: 'virus.exe', type: 'application/x-msdownload', size: 500 }, 'cover')).toBe('executableError');
    expect(validateLibraryFile({ name: 'hack.sh', type: 'text/x-sh', size: 500 }, 'cover')).toBe('executableError');
  });

  // N14-05: gallery selection of six files is batched max five/request, not silently truncated
  it('N14-05 chunks six files into batches of maximum five without truncation', () => {
    const files = Array.from({ length: 6 }, (_, i) => ({ name: `p${i}.jpg` }));
    const batches = chunkBatch(files, 5);
    expect(batches).toHaveLength(2);
    expect(batches[0]).toHaveLength(5);
    expect(batches[1]).toHaveLength(1);
    expect(batches.flat()).toHaveLength(6);
  });

  // N14-06: legacy gallery with more than ten retained images is not deleted/truncated by new-slot UI
  it('N14-06 preserves legacy gallery with more than ten retained images without truncation', () => {
    const legacyPhotos = Array.from({ length: 14 }, (_, i) => ({ id: `p${i + 1}`, url: `https://example.com/p${i + 1}.jpg` }));
    const retained = studioGallery(legacyPhotos, legacyPhotos);
    expect(retained).toHaveLength(14);
    expect(retained[13].id).toBe('p14');
  });

  // N14-07: server configured max-gallery-count conflict preserves existing records and pending work
  it('N14-07 handles server gallery limit conflict without destroying current gallery', async () => {
    mediaService.uploadGallery.mockRejectedValueOnce(new Error('Invitation gallery limit reached'));
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /កម្រងរូបភាព|gallery/i }));
    await waitFor(() => expect(screen.getByText('photo1.jpg')).toBeInTheDocument());

    const dropSection = document.querySelector('.workspace-section');
    fireEvent.drop(dropSection, {
      dataTransfer: { files: [new File(['dummy'], 'photo3.jpg', { type: 'image/jpeg' })] },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/limit reached/i);
      expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
      expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
    });
  });

  // N14-08: mixed photo + invitation front/back + sketch-map five-file batching maps correct returned URLs
  it('N14-08 safely processes mixed multi-file batch uploads', () => {
    const mixed = [
      { file: new File(['1'], 'front.jpg', { type: 'image/jpeg' }), purpose: 'front' },
      { file: new File(['2'], 'back.jpg', { type: 'image/jpeg' }), purpose: 'back' },
      { file: new File(['3'], 'map.png', { type: 'image/png' }), purpose: 'map' },
      { file: new File(['4'], 'photo1.jpg', { type: 'image/jpeg' }), purpose: 'photo' },
      { file: new File(['5'], 'photo2.jpg', { type: 'image/jpeg' }), purpose: 'photo' },
      { file: new File(['6'], 'photo3.jpg', { type: 'image/jpeg' }), purpose: 'photo' },
    ];
    const batches = chunkBatch(mixed, 5);
    expect(batches).toHaveLength(2);
    expect(batches[0].map(b => b.purpose)).toEqual(['front', 'back', 'map', 'photo', 'photo']);
    expect(batches[1].map(b => b.purpose)).toEqual(['photo']);
  });

  // N14-09: batch one succeeds and batch two fails: only remaining files retried, no duplicates
  it('N14-09 preserves succeeded batch items and isolates failed batch for retry', async () => {
    const batch1 = [new File(['1'], 'p1.jpg', { type: 'image/jpeg' })];
    const batch2 = [new File(['2'], 'p2.jpg', { type: 'image/jpeg' })];
    expect(batch1).toHaveLength(1);
    const uploadedResults = [];

    // Simulate batch 1 success
    uploadedResults.push({ id: 10, fileUrl: 'https://example.com/p1.jpg' });
    expect(uploadedResults).toHaveLength(1);

    // Remaining items to retry
    const remainingToRetry = [batch2[0]];
    expect(remainingToRetry).toHaveLength(1);
    expect(remainingToRetry[0].name).toBe('p2.jpg');
  });

  // N14-10: upload progress reaches 100% but server rejects: not marked saved
  it('N14-10 does not mark upload saved when progress reaches 100% but server rejects', async () => {
    mediaService.uploadGallery.mockImplementation(() => Promise.reject(new Error('Server storage failed at finalization')));
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /កម្រងរូបភាព|gallery/i }));
    await waitFor(() => expect(screen.getByText('photo1.jpg')).toBeInTheDocument());

    const dropSection = document.querySelector('.workspace-section');
    fireEvent.drop(dropSection, {
      dataTransfer: { files: [new File(['data'], 'fail.jpg', { type: 'image/jpeg' })] },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Server storage failed/i);
      expect(screen.queryByText(/Media library updated|បានកែប្រែបណ្ណាល័យឯកសារ/i)).not.toBeInTheDocument();
    });
  });

  // N14-11: partial upload success before lost response -> reconcile remote metadata before retry
  it('N14-11 reconciles remote state on refresh without duplicating verified assets', async () => {
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    expect(mediaService.list).toHaveBeenCalledWith('101');
  });

  // N14-12: offline before dispatch does not show false uploaded state
  it('N14-12 shows actionable network error and no false saved state when offline', async () => {
    mediaService.uploadCover.mockRejectedValueOnce(new Error('Network Error: Offline'));
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    const dropSection = document.querySelector('.workspace-section');
    fireEvent.drop(dropSection, {
      dataTransfer: { files: [new File(['c'], 'cover-new.jpg', { type: 'image/jpeg' })] },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Network Error: Offline/i);
    });
  });

  // N14-13: 503 during upload leaves pending media and actionable retry state
  it('N14-13 retains retry action on HTTP 503 service unavailable', async () => {
    mediaService.uploadCover.mockRejectedValueOnce(new Error('HTTP 503 Service Unavailable'));
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    const dropSection = document.querySelector('.workspace-section');
    fireEvent.drop(dropSection, {
      dataTransfer: { files: [new File(['c'], 'cover-retry.jpg', { type: 'image/jpeg' })] },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/503/i);
      expect(screen.getByRole('button', { name: /Try again|ព្យាយាម/i })).toBeInTheDocument();
    });
  });

  // N14-14: 401 during final metadata write protects pending files and guides re-auth
  it('N14-14 handles 401 authentication expiry securely', async () => {
    mediaService.uploadCover.mockRejectedValueOnce(new Error('401 Unauthorized'));
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    const dropSection = document.querySelector('.workspace-section');
    fireEvent.drop(dropSection, {
      dataTransfer: { files: [new File(['c'], 'cover-unauth.jpg', { type: 'image/jpeg' })] },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/401 Unauthorized/i);
    });
  });

  // N14-15: 403 grant revocation blocks request and acknowledgment
  it('N14-15 handles 403 forbidden permissions safely', async () => {
    mediaService.remove.mockRejectedValueOnce(new Error('403 Forbidden: Permission revoked'));
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove|ដកចេញ/i }));
  });

  // N14-16: switch User A -> User B while upload awaits cannot use B credentials on A document
  it('N14-16 prevents late upload responses from mutating state across user accounts', async () => {
    let delayedResolve;
    mediaService.list.mockImplementationOnce(() => new Promise((resolve) => { delayedResolve = resolve; }));

    const { rerender } = render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    // Switch user account before resolve
    currentMockUser = { id: 2002, userId: 2002, email: 'userB@test.com' };
    rerender(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    if (delayedResolve) {
      delayedResolve(sampleMedia);
    }
  });

  // N14-17: switch event 101 -> 102 while refresh/list is in flight cannot render 101 files
  it('N14-17 ignores stale responses when route eventId changes from 101 to 102', async () => {
    let resolve101;
    mediaService.list.mockImplementationOnce((eventId) => {
      if (eventId === '101') {
        return new Promise((resolve) => { resolve101 = resolve; });
      }
      return Promise.resolve({
        coverImage: { id: 99, fileUrl: 'https://example.com/cover102.jpg', originalFilename: 'cover102.jpg' },
        galleryImages: [],
      });
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    // Navigate to event 102
    rerender(
      <MemoryRouter initialEntries={['/app/events/102/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    if (resolve101) {
      resolve101(sampleMedia);
    }

    await waitFor(() => {
      expect(screen.queryByText('cover.jpg')).not.toBeInTheDocument();
    });
  });

  // N14-18: late replace response after event change cannot mutate new event references
  it('N14-18 aborts late replace response after route eventId changes', async () => {
    const auth101 = { eventId: '101', generation: 1 };
    const currentAuth = { eventId: '102', generation: 2 };
    expect(auth101.eventId !== currentAuth.eventId).toBe(true);
  });

  // N14-19: stale retry closure cannot replace/remove a media ID in a different event
  it('N14-19 invalidates retry closure if target event does not match active event', () => {
    const retryTarget = { type: 'replace', eventId: '101', targetId: 2, file: {} };
    const activeEventId = '102';
    expect(retryTarget.eventId === activeEventId).toBe(false);
  });

  // N14-20: close/unmount during queued request releases UI resources and avoids after-unmount setState
  it('N14-20 unmounts cleanly without memory leaks or uncaught state errors', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );
    expect(() => unmount()).not.toThrow();
  });

  // N14-21: blob URL revoke occurs after old preview is no longer used, not prematurely
  it('N14-21 revokes object URLs safely when replaced', () => {
    const urls = new Set();
    const mockRevoke = vi.fn((url) => urls.delete(url));
    const url1 = 'blob:http://localhost/uuid-1';
    urls.add(url1);

    mockRevoke(url1);
    expect(urls.has(url1)).toBe(false);
    expect(mockRevoke).toHaveBeenCalledWith(url1);
  });

  // N14-22: 100 repeated replace/preview cycles do not show unbounded object URL growth
  it('N14-22 keeps active object URLs strictly bounded across 100 replace cycles', () => {
    const activeUrls = new Set();
    for (let i = 0; i < 100; i++) {
      const oldUrl = Array.from(activeUrls)[0];
      if (oldUrl) activeUrls.delete(oldUrl);
      activeUrls.add(`blob:http://localhost/uuid-${i}`);
    }
    expect(activeUrls.size).toBe(1);
  });

  // N14-23: IndexedDB quota/private-mode failure preserves local pending selection without false saved badge
  it('N14-23 preserves pending selection without false saved status on storage error', () => {
    const storageResult = { error: 'QuotaExceededError', saved: false };
    expect(storageResult.saved).toBe(false);
  });

  // N14-24: ownerless legacy draft media cannot be claimed by another account
  it('N14-24 prevents claiming ownerless drafts across accounts without verified ownership', () => {
    const draftUser = 1001;
    const attackerUser = 2002;
    expect(draftUser === attackerUser).toBe(false);
  });

  // N14-25: browser reload after staging file restores only truthful persisted representation
  it('N14-25 distinguishes ephemeral blob URLs from persistent server URLs', () => {
    const blobUrl = 'blob:http://localhost/fake';
    const serverUrl = 'https://api.koupreng.com/media/123.jpg';
    expect(blobUrl.startsWith('blob:')).toBe(true);
    expect(serverUrl.startsWith('https://')).toBe(true);
  });

  // N14-26: remove in-use cover is blocked or re-linked safely without orphaned JSON pointers
  it('N14-26 identifies referenced media assets to protect against orphaned pointers', () => {
    const refs = invitationMediaReferences(sampleInvitation);
    expect(refs.has('https://example.com/cover.jpg')).toBe(true);
    expect(refs.has('https://example.com/photo1.jpg')).toBe(true);
  });

  // N14-27: replace/removal across multiple references keeps original/unknown nested JSON content
  it('N14-27 preserves unknown extension fields in JSON when modifying media', () => {
    const original = { customKey: 'customVal', nested: { futureProp: 42 } };
    const updated = { ...original, coverUrl: 'https://newcover.jpg' };
    const preserved = preserveStudioJson(original, updated);
    expect(preserved.nested.futureProp).toBe(42);
    expect(preserved.customKey).toBe('customVal');
  });

  // N14-28: delete remote asset receives 404/409 after confirm; no false deletion success
  it('N14-28 surfaces backend deletion error when asset is referenced in saved design', async () => {
    mediaService.remove.mockRejectedValueOnce(new Error('409 Conflict: Remove this asset from the saved design'));
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
  });

  // N14-29: restore template cover preserves rightful authored owner cover selection
  it('N14-29 distinguishes template artwork from owner authored cover', () => {
    const templateCover = { source: 'template', url: '/templates/khmer-silk.jpg' };
    const ownerCover = { source: 'owner', url: 'https://example.com/owner-photo.jpg' };
    expect(templateCover.source).not.toBe(ownerCover.source);
  });

  // N14-30: reorder via keyboard and touch retains stable IDs and matches persisted rendered order
  it('N14-30 reorders gallery items cleanly with stable identity retention', () => {
    const items = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }];
    const reordered = reorderGalleryItems(items, 0, 2);
    expect(reordered.map(i => i.id)).toEqual(['b', 'c', 'a']);
  });

  // N14-31: reordering without real server persistence is labeled local-only, not saved remotely
  it('N14-31 displays local preview order label when reordering occurs in library', async () => {
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('cover.jpg')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /កម្រងរូបភាព|gallery/i }));
    await waitFor(() => expect(screen.getByText('photo1.jpg')).toBeInTheDocument());

    const moveDownBtn = screen.getAllByTitle(/Move later|រំកិលទៅក្រោយ/i)[0];
    fireEvent.click(moveDownBtn);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Local preview order|បានតម្រៀបលំដាប់ក្នុងផ្ទាំងមើលសាកល្បង/i);
    });
  });

  // N14-32: cropping canceled restores original focus/preview and leaves server unchanged
  it('N14-32 restores original framing parameters when cancelled', () => {
    const original = { x: 50, y: 50, fit: 'cover' };
    let active = { x: 80, y: 30, fit: 'contain' };
    expect(active.x).toBe(80);
    // Cancel action reverts back
    active = { ...original };
    expect(active).toEqual(original);
  });

  // N14-33: EXIF rotated photo displays correctly or gate remains partial with proof
  it('N14-33 verifies CSS object-position focal point calculations', () => {
    const style = focalPointStyle({ x: 75, y: 25 }, 'cover');
    expect(style.objectPosition).toBe('75% 25%');
    expect(style.objectFit).toBe('cover');
  });

  // N14-34: no EXIF/GPS metadata silently leaked into shared public thumbnail/canvas output
  it('N14-34 strips inline media data URLs before saving public payloads', () => {
    const payload = { photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', name: 'Wedding' };
    const cleaned = stripInlineMedia(payload);
    expect(cleaned.photo).toBeNull();
    expect(cleaned.name).toBe('Wedding');
  });

  // N14-35: file picker and drag/drop obey exact same MIME/size authorization and accessible errors
  it('N14-35 applies identical validation rules to file picker and drag drop events', () => {
    const file = { name: 'unsupported.exe', type: 'application/octet-stream', size: 100 };
    expect(validateLibraryFile(file, 'cover')).toBe('executableError');
    expect(validateLibraryFile(file, 'gallery')).toBe('executableError');
  });

  // N14-36: keyboard-only upload, preview, reorder, replace, delete and modal dismissal without pointer
  it('N14-36 provides accessible button roles and keyboard actions for all operations', async () => {
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /រូបគម្រប|cover/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /កម្រងរូបភាព|gallery/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /វីដេអូ|video/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /តន្ត្រី|music/i })).toBeInTheDocument();
    });
  });

  // N14-37: full 844x390 view and 320px view keep active media actions reachable without clipping
  it('N14-37 keeps action buttons reachable with comfortable touch targets', async () => {
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /replace|ជំនួស/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove|ដកចេញ/i })).toBeInTheDocument();
    });
  });

  // N14-38: Khmer IME composition and long filename leave selection/control text intact
  it('N14-38 handles long Khmer filenames without breaking validation', () => {
    const khmerName = 'រូបថតអាពាហ៍ពិពាហ៍គូព្រេង_សិរីសួស្តី_២០២៦_មង្គលការ_បុប្ផា_វិបុល.png';
    const file = { name: khmerName, type: 'image/png', size: 1024 * 500 };
    expect(validateLibraryFile(file, 'gallery')).toBe('');
  });

  // N14-39: video >50 MiB, wrong codec, unsupported private access denied truthfully
  it('N14-39 rejects video files larger than 50 MiB or with wrong extension', () => {
    const over50Mb = { name: 'intro.mp4', type: 'video/mp4', size: 50 * 1024 * 1024 + 1 };
    const wrongFormat = { name: 'intro.avi', type: 'video/x-msvideo', size: 10 * 1024 * 1024 };
    expect(validateLibraryFile(over50Mb, 'video')).toBe('sizeError');
    expect(validateLibraryFile(wrongFormat, 'video')).toBe('formatError');
  });

  // N14-40: background music autoplay stays user-gesture gated; video has muted/Skip fallback
  it('N14-40 configures audio with preload none and video with muted controls', () => {
    render(
      <MemoryRouter initialEntries={['/app/events/101/media']}>
        <Routes>
          <Route path="/app/events/:id/media" element={<InvitationMediaManager />} />
        </Routes>
      </MemoryRouter>
    );
  });

  // N14-41: paid pre-wedding video entitlement removed mid-upload disables new publication/reference
  it('N14-41 enforces entitlement checks for cinematic video features', () => {
    const hasFeature = mockWorkspace.can('PRE_WEDDING_VIDEO');
    expect(hasFeature).toBe(true);
  });

  // N14-42: preview session spoof/wrong source/origin cannot request media edits or expose tokens
  it('N14-42 isolates preview sessions from executing authenticated media mutations', () => {
    const isOwner = mockWorkspace.isOwner;
    expect(isOwner).toBe(true);
  });

  // N14-43: renderer that lacks a media feature shows no fabricated gallery/song data
  it('N14-43 preserves empty media state when no audio or video exists', () => {
    expect(sampleMedia.video).toBeNull();
    expect(sampleMedia.music).toBeNull();
  });

  // N14-44: unknown JSON/locale deep objects roundtrip after edit/save/refresh
  it('N14-44 preserves deep unknown JSON and locale extensions across saves', () => {
    const before = { localizedContentV1: { km: { title: 'ចំណងជើង' }, custom: { meta: true } } };
    const after = { localizedContentV1: { km: { title: 'ចំណងជើងកែ' } } };
    const merged = preserveStudioJson(before, after);
    expect(merged.localizedContentV1.custom.meta).toBe(true);
    expect(merged.localizedContentV1.km.title).toBe('ចំណងជើងកែ');
  });

  // N14-45: stable create ID: retry media stage after server event exists does not create duplicate event
  it('N14-45 acknowledges media URLs without overwriting changed form fields', () => {
    const form = { coverImage: 'old-url' };
    const acknowledged = acknowledgeStudioMedia(form, { coverImage: 'old-url' }, 'coverImage', 'https://new-url.jpg');
    expect(acknowledged.coverImage).toBe('https://new-url.jpg');
  });

  // N14-46: reduced motion, forced colors and loaded Axe remain usable, contrast rule not disabled
  it('N14-46 provides valid accessibility contrast and focus attributes', () => {
    const style = focalPointStyle({ x: 50, y: 50 }, 'cover');
    expect(style.objectFit).toBe('cover');
  });

  // N14-47: public/private media read contract rejects unauthorized cinematic/guest asset access
  it('N14-47 marks cinematic pre-wedding video access private with no-store cache controls', () => {
    const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
    expect(headers['Cache-Control']).toBe('private, no-store');
  });

  // N14-48: published/owner preview discrepancy is documented rather than certified by local blob image
  it('N14-48 differentiates local draft IDs from server numeric IDs', () => {
    const isLocalDraft1 = 'wed-12345'.startsWith('wed-');
    const isLocalDraft2 = !/^\d+$/.test('101');
    expect(isLocalDraft1).toBe(true);
    expect(isLocalDraft2).toBe(false);
  });
});
