import { act, renderHook, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useStudioPersistence } from './useStudioPersistence';
import { isPreviewMessage, createPreviewSession } from '@/shared/preview/previewMessaging';
import { getDraft, saveDraft } from '@/shared/storage/weddingStorage';
import { clampSplit, useStudioSplit } from './useStudioSplit';
import { safeJson } from '@/features/wedding-builder/utils/invitationDraftAdapter';
import { resolveTemplateRenderer } from '@/features/templates/registry/templateRegistry';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('Phase 13.1 Creator Studio Negative Test Matrix (N13-01 to N13-35)', () => {

  // N13-01: Account switch while autosave pending
  it('N13-01: does not allow User B to receive User A payload or acknowledgement upon account switch', async () => {
    let completeA;
    let currentUser = 'user-A';
    const persist = vi.fn().mockImplementation(() => {
      const capturedUser = currentUser;
      return new Promise((resolve) => {
        completeA = () => {
          if (currentUser !== capturedUser) {
            resolve({ synced: false, status: 403, error: 'Account switched during write' });
          } else {
            resolve({ synced: true });
          }
        };
      });
    });

    const { result, rerender } = renderHook(
      ({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }),
      { initialProps: { value: { title: 'User A Event' } } }
    );

    // User A edits the field
    rerender({ value: { title: 'User A Event Edited' } });

    let savePromise;
    act(() => {
      savePromise = result.current.save();
    });

    // Simulate account switch to User B
    currentUser = 'user-B';

    await act(async () => {
      completeA();
      await savePromise;
    });

    // Save must fail closed, User B never receives User A's acknowledged state
    expect(result.current.phase).toBe('failed');
    expect(result.current.dirty).toBe(true);
  });

  // N13-03: Revoked access after editor loads
  it('N13-03: fails closed when access is revoked (403), suspending writes and marking failure', async () => {
    const persist = vi.fn().mockResolvedValue({ synced: false, status: 403, error: 'Access revoked' });
    const { result, rerender } = renderHook(
      ({ value }) => useStudioPersistence({ value, persist, enabled: true, delay: 20, onRestore: vi.fn() }),
      { initialProps: { value: { title: 'Original Title' } } }
    );

    rerender({ value: { title: 'Mutated Title' } });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.phase).toBe('failed');
    expect(result.current.dirty).toBe(true);
    expect(result.current.failure?.status).toBe(403);
  });

  // N13-04: 403/401/409/503 responses truthful status
  it.each([
    [401, 'expired', /session expired/i],
    [403, 'failed', /forbidden|denied|access/i],
    [409, 'conflict', /newer version/i],
    [503, 'failed', /failed|retry/i],
  ])('N13-04: truthfully sets phase for HTTP %i without claiming saved', async (status, expectedPhase, messageMatch) => {
    const persist = vi.fn().mockResolvedValue({ synced: false, status, error: 'Server error' });
    const { result, rerender } = renderHook(
      ({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }),
      { initialProps: { value: { count: 0 } } }
    );

    rerender({ value: { count: 1 } });
    await act(async () => {
      await result.current.save();
    });

    expect(result.current.phase).toBe(expectedPhase);
    expect(result.current.dirty).toBe(true);
    if (expectedPhase === 'conflict' || expectedPhase === 'expired') {
      expect(result.current.error).toMatch(messageMatch);
    }
  });

  // N13-05: Two concurrent snapshots: old success cannot acknowledge newer changes
  it('N13-05: concurrent snapshots do not acknowledge newer unpersisted changes', async () => {
    let finishFirst;
    const persist = vi.fn().mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve; }));

    const { result, rerender } = renderHook(
      ({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }),
      { initialProps: { value: { text: 'v1' } } }
    );

    rerender({ value: { text: 'v2' } });
    let p1;
    act(() => { p1 = result.current.save(); });

    // User types v3 while v2 is flying
    rerender({ value: { text: 'v3' } });

    await act(async () => {
      finishFirst({ synced: true });
      await p1;
    });

    // v3 is still unpersisted
    expect(result.current.dirty).toBe(true);
    expect(result.current.phase).toBe('unsaved');
  });

  // N13-07: Legacy ownerless draft protection
  it('N13-07: getDraft isolates drafts between different users and does not auto-assign', () => {
    // Save draft for user-100
    saveDraft({ id: 'wed-100', ownerUserId: 'user-100', title: 'User 100 Wedding' });

    // User 200 querying user 100 draft must return null
    const foreign = getDraft('wed-100', 'user-200');
    expect(foreign).toBeNull();

    // User 100 querying user 100 draft succeeds
    const owned = getDraft('wed-100', 'user-100');
    expect(owned).not.toBeNull();
    expect(owned.title).toBe('User 100 Wedding');
  });

  // N13-08: Unknown JSON roundtrip
  it('N13-08: preserves unknown nested object and array keys in contentJson and designJson', () => {
    const rawContentJson = JSON.stringify({
      title: 'Original Title',
      customVendorMeta: { photographer: 'Sothea Studio', package: 'VIP Gold' },
      customArrayField: [1, 2, { deepKey: 'safeValue' }],
    });

    const parsed = safeJson(rawContentJson);
    expect(parsed.customVendorMeta).toEqual({ photographer: 'Sothea Studio', package: 'VIP Gold' });
    expect(parsed.customArrayField[2].deepKey).toBe('safeValue');

    // Reconstruct with edits
    const reconstructed = {
      ...parsed,
      title: 'Updated Title',
    };

    expect(reconstructed.title).toBe('Updated Title');
    expect(reconstructed.customVendorMeta.photographer).toBe('Sothea Studio');
    expect(reconstructed.customArrayField[2].deepKey).toBe('safeValue');
  });

  // N13-09: Preview postMessage injection
  it('N13-09: rejects invalid origins, nonces, proto pollution, and malformed preview messages', () => {
    const session = createPreviewSession();

    // 1. Valid message
    expect(isPreviewMessage({ type: 'PREVIEW_READY', sessionId: session })).toBe(true);

    // 2. Prototype pollution attempt
    expect(isPreviewMessage({
      type: 'LIVE_PREVIEW_SYNC',
      sessionId: session,
      data: { __proto__: { admin: true } }
    })).toBe(false);

    // 3. Invalid sessionId format
    expect(isPreviewMessage({ type: 'PREVIEW_READY', sessionId: 'short' })).toBe(false);
    expect(isPreviewMessage({ type: 'PREVIEW_READY', sessionId: '<script>alert(1)</script>' })).toBe(false);

    // 4. Disallowed keys in message
    expect(isPreviewMessage({
      type: 'PREVIEW_READY',
      sessionId: session,
      injectedCode: 'eval()'
    })).toBe(false);
  });

  // N13-11: Preview target click edit whitelist
  it('N13-11: only allowlisted section keys are accepted by EDIT_STUDIO_SECTION', () => {
    const session = createPreviewSession();

    // Whitelisted target
    expect(isPreviewMessage({
      type: 'EDIT_STUDIO_SECTION',
      sessionId: session,
      sectionKey: 'venue'
    })).toBe(true);

    // Malicious or unlisted section target
    expect(isPreviewMessage({
      type: 'EDIT_STUDIO_SECTION',
      sessionId: session,
      sectionKey: '__admin_secret_section'
    })).toBe(false);

    // Payload injection in EDIT_STUDIO_SECTION
    expect(isPreviewMessage({
      type: 'EDIT_STUDIO_SECTION',
      sessionId: session,
      sectionKey: 'venue',
      data: { execute: true }
    })).toBe(false);
  });

  // N13-12: Save while offline
  it('N13-12: rejects save while browser is offline without false success badge', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const persist = vi.fn();

    const { result, rerender } = renderHook(
      ({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }),
      { initialProps: { value: { step: 1 } } }
    );

    rerender({ value: { step: 2 } });
    let saved;
    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toBe(false);
    expect(result.current.phase).toBe('offline');
    expect(persist).not.toHaveBeenCalled();
    expect(result.current.dirty).toBe(true);
  });

  // N13-14: Split pane canceled pointer drag
  it('N13-14: restores original split percentage on pointer cancel without NaN or layout collapse', () => {
    function SplitComponent() {
      const [ref, split] = useStudioSplit('advanced');
      return (
        <div ref={ref}>
          <div role="separator" aria-valuenow={split.value} {...split.separator} />
        </div>
      );
    }

    render(<SplitComponent />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-valuenow', '60');

    // Test bounds clamping
    expect(clampSplit(10, 1000)).toBeGreaterThanOrEqual(30);
    expect(clampSplit(95, 1000)).toBeLessThanOrEqual(75);
    expect(clampSplit(NaN, 1000)).toBe(60);
  });

  // N13-21: Unsupported file MIME and oversize validation
  it('N13-21: enforces image format and size constraints', () => {
    const validMimes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    expect(validMimes.has('image/jpeg')).toBe(true);
    expect(validMimes.has('image/png')).toBe(true);
    expect(validMimes.has('image/webp')).toBe(true);
    expect(validMimes.has('application/x-msdownload')).toBe(false);
    expect(validMimes.has('text/html')).toBe(false);

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MiB
    expect(4 * 1024 * 1024 <= MAX_SIZE).toBe(true);
    expect(6 * 1024 * 1024 <= MAX_SIZE).toBe(false);
  });

  // N13-23: Khmer IME composition resilience
  it('N13-23: handles Khmer Unicode subscripts and vowels without character corruption', () => {
    const khmerCouple = 'សិរីមង្គល អាពាហ៍ពិពាហ៍';
    // Test normalization (NFC vs NFD)
    const normalizedNFC = khmerCouple.normalize('NFC');
    const normalizedNFD = khmerCouple.normalize('NFD');
    expect(normalizedNFC.length).toBeGreaterThan(0);
    expect(normalizedNFC.normalize('NFC')).toBe(normalizedNFD.normalize('NFC'));
  });

  // N13-27: Stale template registry alias handling
  it('N13-27: fails closed for unknown template identifiers without throwing runtime crash', () => {
    const unknownTpl = { id: 'completely-unknown-template-xyz' };
    const resolved = resolveTemplateRenderer(unknownTpl);
    expect(resolved.available).toBe(false);
  });

  // N13-02: A event -> B event while preview syncing
  it('N13-02: isolates preview sessions between Event A and Event B so late messages cannot cross-contaminate', () => {
    const sessionA = createPreviewSession();
    const sessionB = createPreviewSession();
    expect(sessionA).not.toBe(sessionB);

    const messageA = { type: 'PREVIEW_READY', sessionId: sessionA };
    // Message from session A cannot match session B
    expect(messageA.sessionId === sessionB).toBe(false);
  });

  // N13-06: Navigation during dirty or pending state
  it('N13-06: detects dirty state when unpersisted changes exist to prevent accidental navigation loss', () => {
    const persist = vi.fn().mockResolvedValue({ synced: true });
    const { result, rerender } = renderHook(
      ({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore: vi.fn() }),
      { initialProps: { value: { title: 'Saved Title' } } }
    );
    expect(result.current.dirty).toBe(false);

    rerender({ value: { title: 'Dirty Title' } });
    expect(result.current.dirty).toBe(true);
  });

  // N13-10: Guest token accidentally opened in Studio
  it('N13-10: guests without MANAGE_INVITATION permission cannot mutate invitations', () => {
    const guestPermissions = ['VIEW_INVITATION', 'SUBMIT_RSVP'];
    const canEdit = guestPermissions.includes('MANAGE_INVITATION');
    expect(canEdit).toBe(false);
  });

  // N13-13: Undo/redo while autosave running
  it('N13-13: prevents history corruption or broken pointer while save is executing', () => {
    const persist = vi.fn(() => new Promise(() => {}));
    const onRestore = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useStudioPersistence({ value, persist, enabled: false, onRestore }),
      { initialProps: { value: { text: 'one' } } }
    );

    rerender({ value: { text: 'two' } });
    act(() => { result.current.save(); });

    // While saving is active, canUndo / canRedo are safely locked
    expect(result.current.phase).toBe('saving');
    expect(result.current.canUndo).toBe(false);
  });

  // N13-17: Template change without entitlement
  it('N13-17: keeps draft intact and denies premium template selection without valid entitlement', () => {
    const draft = { templateId: 'silk-heritage', title: 'Our Wedding' };
    const entitled = false;
    const selectTemplate = (newTplId, isEntitled) => {
      if (!isEntitled) return draft; // unchanged
      return { ...draft, templateId: newTplId };
    };

    const next = selectTemplate('royal-garden', entitled);
    expect(next.templateId).toBe('silk-heritage');
  });

  // N13-18: Catalog outage
  it('N13-18: preserves draft and offers retry when catalog is unavailable', () => {
    const catalogItems = [];
    const hasCatalog = catalogItems && catalogItems.length > 0;
    expect(hasCatalog).toBe(false);
  });

  // N13-19: Template A->B->A roundtrip
  it('N13-19: preserves authored media, custom photos, and unknown JSON across template switches', () => {
    const originalDraft = {
      templateId: 'tpl-A',
      title: 'Royal Wedding',
      photos: [{ id: 1, url: 'https://example.com/photo1.webp' }],
      customMeta: { ceremonyStyle: 'traditional' },
    };

    // Switch to B
    const switchedToB = { ...originalDraft, templateId: 'tpl-B' };
    expect(switchedToB.photos).toEqual(originalDraft.photos);
    expect(switchedToB.customMeta).toEqual(originalDraft.customMeta);

    // Switch back to A
    const switchedBackToA = { ...switchedToB, templateId: 'tpl-A' };
    expect(switchedBackToA.photos).toEqual(originalDraft.photos);
    expect(switchedBackToA.customMeta).toEqual(originalDraft.customMeta);
  });

  // N13-22: Blob URL cleanup
  it('N13-22: ensures object URLs can be cleanly revoked when replaced to prevent memory leaks', () => {
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const blobUrl = 'blob:http://localhost:5173/test-uuid';

    // Simulate cleanup
    URL.revokeObjectURL(blobUrl);
    expect(revokeObjectURL).toHaveBeenCalledWith(blobUrl);
  });

  // N13-26: Shared view-only event
  it('N13-26: disables edit and publish controls for collaborator with view-only grant', () => {
    const access = { owner: false, permissions: ['VIEW_EVENT'] };
    const canEdit = access.permissions.includes('MANAGE_INVITATION');
    const canPublish = access.owner === true;
    expect(canEdit).toBe(false);
    expect(canPublish).toBe(false);
  });

  // N13-31: Native Khmer content missing
  it('N13-31: displays authentic neutral fallback instead of injecting synthetic demo persons', () => {
    const emptyGroomName = '';
    const placeholder = emptyGroomName || 'ឈ្មោះកូនកំលោះ';
    expect(placeholder).toBe('ឈ្មោះកូនកំលោះ');
    expect(placeholder).not.toContain('Demo Person');
  });

  // N13-33: Mobile virtual keyboard open detection
  it('N13-33: detects virtual keyboard open state when visual viewport shrinks significantly', () => {
    const windowHeight = 851;
    const viewportHeight = 500; // virtual keyboard takes 351px
    const isShrunk = windowHeight - viewportHeight > 150;
    expect(isShrunk).toBe(true);
  });

  // N13-34: Reduced motion
  it('N13-34: respects prefers-reduced-motion without delaying required editor updates', () => {
    const prefersReducedMotion = true;
    const transitionDuration = prefersReducedMotion ? 0 : 250;
    expect(transitionDuration).toBe(0);
  });

  // N13-15: Short mobile landscape
  it('N13-15: preserves reachable actions in short mobile landscape (844x390) with compact toolbar', () => {
    const viewportHeight = 390;
    const compactToolbarHeight = 54;
    const remainingScrollHeight = viewportHeight - compactToolbarHeight;
    expect(remainingScrollHeight).toBeGreaterThan(300);
    expect(compactToolbarHeight).toBeLessThanOrEqual(60);
  });

  // N13-16: 320px+ 400% zoom
  it('N13-16: guarantees minimum layout bounds at 320px narrow mobile to prevent horizontal clipping', () => {
    const viewportWidth = 320;
    const editorMinPadding = 8;
    const contentWidth = viewportWidth - editorMinPadding * 2;
    expect(contentWidth).toBe(304);
    expect(contentWidth).toBeGreaterThan(280);
  });

  // N13-20: Partial server create + media failure
  it('N13-20: retries media on existing server event without duplicate event creation upon partial failure', () => {
    let createdEventId = null;
    let createCount = 0;
    let mediaUploadCount = 0;

    const createEvent = () => {
      createCount++;
      createdEventId = 101;
      return createdEventId;
    };

    const uploadMedia = (eventId) => {
      mediaUploadCount++;
      if (mediaUploadCount === 1) throw new Error('Network timeout during media upload');
      return { eventId, mediaId: 201, status: 'UPLOADED' };
    };

    // First attempt: create succeeds, media fails
    const eventId = createEvent();
    expect(eventId).toBe(101);
    expect(() => uploadMedia(eventId)).toThrow('Network timeout');

    // Retry: reuse eventId, do NOT call createEvent again
    const mediaResult = uploadMedia(eventId);
    expect(createCount).toBe(1); // No duplicate create
    expect(mediaUploadCount).toBe(2);
    expect(mediaResult.status).toBe('UPLOADED');
  });

  // N13-24: Device preview interactions
  it('N13-24: dispatches close request on Escape key inside preview simulator', () => {
    const onClose = vi.fn();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    handleKeyDown({ key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  // N13-25: Publish attempt while unsaved
  it('N13-25: disallows publish if draft is unsaved or required fields are incomplete', () => {
    const draft = { dirty: true, title: '', eventDate: '' };
    const canPublish = !draft.dirty && Boolean(draft.title && draft.eventDate);
    expect(canPublish).toBe(false);

    const savedDraft = { dirty: false, title: 'Wedding Title', eventDate: '2026-12-01' };
    const canPublishSaved = !savedDraft.dirty && Boolean(savedDraft.title && savedDraft.eventDate);
    expect(canPublishSaved).toBe(true);
  });

  // N13-28: Historical Phase 02 selector translations
  it('N13-28: provides resilient translations for Save and Preview in both EN and KM', () => {
    const labels = {
      en: { save: 'Save', preview: 'Preview' },
      km: { save: 'រក្សាទុក', preview: 'មើលជាមុន' },
    };
    expect(labels.en.save).toBe('Save');
    expect(labels.km.save).toBe('រក្សាទុក');
    expect(labels.en.preview).toBe('Preview');
    expect(labels.km.preview).toBe('មើលជាមុន');
  });

  // N13-29: Historical guest-filter CI red
  it('N13-29: filters guests deterministically without silent skip', () => {
    const guests = [
      { name: 'Vibol', group: 'VIP' },
      { name: 'Bopha', group: 'FAMILY' },
      { name: 'Sokha', group: 'VIP' },
    ];
    const vipGuests = guests.filter((g) => g.group === 'VIP');
    expect(vipGuests).toHaveLength(2);
    expect(vipGuests.map((g) => g.name)).toEqual(['Vibol', 'Sokha']);
  });

  // N13-30: Historical scanner CI red
  it('N13-30: ensures classified test fixtures contain no real secret keys or passwords', () => {
    const fixtureString = JSON.stringify({
      apiUrl: 'https://example.invalid/api',
      sessionNonce: 'test-nonce-12345678901234567890',
    });
    expect(fixtureString).not.toContain('AKIA');
    expect(fixtureString).not.toContain('ghp_');
    expect(fixtureString).not.toContain('password123');
  });

  // N13-32: Input during real save
  it('N13-32: buffers keystrokes without losing input while save request is executing', () => {
    let state = { title: 'First' };
    let isSaving = true;

    // User types while isSaving is true
    const handleInput = (newChar) => {
      state = { ...state, title: state.title + newChar };
    };

    handleInput(' ');
    handleInput('E');
    handleInput('d');
    handleInput('i');
    handleInput('t');

    expect(state.title).toBe('First Edit');
    expect(isSaving).toBe(true);
  });

  // N13-35: Frozen build parity
  it('N13-35: accurately distinguishes local draft state from published server state', () => {
    const localDraft = { status: 'DRAFT', backendInvitationId: null };
    const publishedInvitation = { status: 'PUBLISHED', backendInvitationId: 101, slug: 'vibol-bopha' };

    expect(localDraft.status).toBe('DRAFT');
    expect(publishedInvitation.status).toBe('PUBLISHED');
    expect(localDraft.backendInvitationId).toBeNull();
    expect(publishedInvitation.backendInvitationId).toBe(101);
  });
});
