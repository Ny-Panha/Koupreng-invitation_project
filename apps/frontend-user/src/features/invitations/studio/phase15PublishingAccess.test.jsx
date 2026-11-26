import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PublishReview from './PublishReview';
import StudioGuide from './StudioGuide';
import { publishReadiness } from './publishReadiness';

vi.mock('@/features/invitations/api/invitationApi', () => ({
  invitationService: {
    listMine: vi.fn().mockResolvedValue([]),
    publicBySlug: vi.fn(),
    verifyPublicAccess: vi.fn(),
  },
}));

vi.mock('@/features/invitations/api/mediaApi', () => ({
  mediaService: {
    publicBySlug: vi.fn().mockResolvedValue(null),
    publicCinematicContent: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/features/templates/api/templateCatalogApi', () => ({
  templateCatalogService: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

import { invitationService } from '@/features/invitations/api/invitationApi';
import PublicInvitationPage from '@/features/wedding-site/PublicInvitationFeature';

const completeForm = {
  title: 'Vannak & Kolab Wedding',
  groomName: 'Vannak',
  brideName: 'Kolab',
  eventDate: '2027-11-28',
  eventTime: '17:00',
  venueName: 'Sokha Hotel',
  venueAddress: 'Chroy Changvar, Phnom Penh',
  visibility: 'PUBLIC',
  accessPassword: '',
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  invitationService.publicBySlug.mockReset();
  invitationService.verifyPublicAccess.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Phase 15 access control, share atelier, and protected guest gate', () => {
  it('requires an access password for PASSWORD_PROTECTED readiness unless already saved on server', () => {
    const missing = publishReadiness({ ...completeForm, visibility: 'PASSWORD_PROTECTED', accessPassword: '' });
    const pwCheck = missing.find((item) => item.key === 'accessPassword');
    expect(pwCheck?.complete).toBe(false);

    const typed = publishReadiness({ ...completeForm, visibility: 'PASSWORD_PROTECTED', accessPassword: 'secret-pass' });
    expect(typed.find((item) => item.key === 'accessPassword')?.complete).toBe(true);

    const saved = publishReadiness({ ...completeForm, visibility: 'PASSWORD_PROTECTED', hasSavedPassword: true, accessPassword: '' });
    expect(saved.find((item) => item.key === 'accessPassword')?.complete).toBe(true);
  });

  it('lets hosts select PRIVATE or PASSWORD_PROTECTED in PublishReview and blocks confirmation until password is set', () => {
    const onVisibilityChange = vi.fn();
    const onPasswordChange = vi.fn();
    const onConfirm = vi.fn();

    const { rerender } = render(
      <PublishReview
        open
        english
        onClose={vi.fn()}
        onConfirm={onConfirm}
        checks={publishReadiness(completeForm)}
        visibility="PUBLIC"
        onVisibilityChange={onVisibilityChange}
        accessPassword=""
        onPasswordChange={onPasswordChange}
        previewUrl="https://example.test/i/vannak-kolab"
      />
    );

    fireEvent.click(screen.getByLabelText(/Password protected/i));
    expect(onVisibilityChange).toHaveBeenCalledWith('PASSWORD_PROTECTED');

    rerender(
      <PublishReview
        open
        english
        onClose={vi.fn()}
        onConfirm={onConfirm}
        checks={publishReadiness({ ...completeForm, visibility: 'PASSWORD_PROTECTED', accessPassword: '' })}
        visibility="PASSWORD_PROTECTED"
        onVisibilityChange={onVisibilityChange}
        accessPassword=""
        onPasswordChange={onPasswordChange}
        previewUrl="https://example.test/i/vannak-kolab"
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Confirm publication' });
    expect(confirmBtn).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/Set an access password/i);

    const pwInput = screen.getByLabelText(/Invitation access password/i);
    expect(pwInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(pwInput).toHaveAttribute('type', 'text');

    rerender(
      <PublishReview
        open
        english
        onClose={vi.fn()}
        onConfirm={onConfirm}
        checks={publishReadiness({ ...completeForm, visibility: 'PASSWORD_PROTECTED', accessPassword: 'khmer-2027' })}
        visibility="PASSWORD_PROTECTED"
        onVisibilityChange={onVisibilityChange}
        accessPassword="khmer-2027"
        onPasswordChange={onPasswordChange}
        previewUrl="https://example.test/i/vannak-kolab"
      />
    );

    expect(screen.getByRole('button', { name: 'Confirm publication' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm publication' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('renders QR SVG preview, Telegram/WhatsApp share controls, Web Share, and Unpublish in StudioGuide step 4', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    const onUnpublish = vi.fn();
    vi.stubGlobal('navigator', {
      share: shareMock,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    const { container } = render(
      <StudioGuide
        english
        mode="guided"
        step={4}
        sections={[]}
        checks={publishReadiness(completeForm)}
        published
        visibility="PASSWORD_PROTECTED"
        publishedUrl="https://example.test/i/vannak-kolab"
        onUnpublish={onUnpublish}
      />
    );

    expect(container.querySelector('.studio-qr-card svg')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Telegram/i })).toHaveAttribute('href', expect.stringContaining('https://t.me/share/url'));
    expect(screen.getByRole('link', { name: /WhatsApp/i })).toHaveAttribute('href', expect.stringContaining('https://wa.me/'));
    expect(screen.getByText('Password protected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(shareMock).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://example.test/i/vannak-kolab' })));

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish invitation' }));
    expect(onUnpublish).toHaveBeenCalledOnce();
  });

  it('clears stale session access token on 403, localizes 429 rate limits, and provides password reveal on ProtectedInvitationGate', async () => {
    sessionStorage.setItem('koupreng_invitation_access_protected-slug', 'expired-token');
    invitationService.publicBySlug.mockRejectedValue(Object.assign(new Error('Invitation password required'), { status: 403 }));
    invitationService.verifyPublicAccess.mockRejectedValue(Object.assign(new Error('Too many attempts'), { status: 429 }));

    render(
      <MemoryRouter initialEntries={['/i/protected-slug?lang=en']}>
        <Routes>
          <Route path="/i/:slug" element={<PublicInvitationPage />} />
        </Routes>
      </MemoryRouter>
    );

    const passwordInput = await screen.findByPlaceholderText('Enter access password');
    expect(sessionStorage.getItem('koupreng_invitation_access_protected-slug')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter the invitation password.');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.change(passwordInput, { target: { value: 'wrong-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Invitation' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Too many attempts/i);
    });
  });

  it('allows published invitations to update visibility/password in PublishReview and renders Visibility & password button in StudioGuide', () => {
    const onConfirm = vi.fn();
    const { unmount } = render(
      <PublishReview
        open
        published
        english
        checks={publishReadiness(completeForm, true)}
        visibility="PUBLIC"
        accessPassword=""
        hasSavedPassword={false}
        onConfirm={onConfirm}
        onClose={vi.fn()}
        onCheck={vi.fn()}
        onField={vi.fn()}
        onVisibilityChange={vi.fn()}
        onPasswordChange={vi.fn()}
      />
    );

    const saveAccessBtn = screen.getByRole('button', { name: 'Save access settings' });
    expect(saveAccessBtn).toBeEnabled();
    fireEvent.click(saveAccessBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    unmount();

    const onOpenPublish = vi.fn();
    render(
      <StudioGuide
        mode="guided"
        step={4}
        onStep={vi.fn()}
        sections={['eventInfo', 'couple', 'venue', 'invitation', 'media']}
        activeSection="invitation"
        onSection={vi.fn()}
        english
        checks={publishReadiness(completeForm, true)}
        onField={vi.fn()}
        onPreview={vi.fn()}
        onGuests={vi.fn()}
        onRsvp={vi.fn()}
        onPublish={onOpenPublish}
        onUnpublish={vi.fn()}
        visibility="PASSWORD_PROTECTED"
        published
        publishedUrl="https://koupreng.example/i/vannak-kolab"
        saving={false}
        canPublish
      />
    );

    const editAccessBtn = screen.getByRole('button', { name: /Visibility & password/i });
    fireEvent.click(editAccessBtn);
    expect(onOpenPublish).toHaveBeenCalledTimes(1);
  });
});
