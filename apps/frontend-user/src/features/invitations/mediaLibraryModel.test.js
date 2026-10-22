import { describe, expect, it } from 'vitest';
import { invitationMediaReferences, validateLibraryFile } from './mediaLibraryModel';
import { normalizeBackendGuest, toBackendGuestPayload } from '@/features/guests/model/guestMappers';

describe('media and guest contract preservation', () => {
  it('identifies saved artwork without turning template defaults or arbitrary links into uploaded records', () => {
    const refs = invitationMediaReferences({ templateThumbnailUrl: '/template.svg', designJson: JSON.stringify({ coverImage: '/cover.png', photos: [{ url: 'https://media.example.test/photo' }], googleMapUrl: 'https://maps.example.test' }), contentJson: JSON.stringify({ gallery: [{ preview: '/cover.png' }] }) });
    expect([...refs]).toEqual(['/cover.png', 'https://media.example.test/photo']);
    expect(invitationMediaReferences({ designJson: '{broken' }).size).toBe(0);
  });
  it('rejects oversized files and extension/MIME mismatches for the existing upload categories', () => {
    expect(validateLibraryFile({ name: 'cover.png', type: 'image/png', size: 5 * 1024 * 1024 + 1 }, 'cover')).toBe('sizeError');
    expect(validateLibraryFile({ name: 'cover.svg', type: 'image/svg+xml', size: 10 }, 'cover')).toBe('formatError');
    expect(validateLibraryFile({ name: 'cover.png', type: 'image/jpeg', size: 10 }, 'cover')).toBe('formatError');
    expect(validateLibraryFile({ name: 'cover.png', type: 'image/png', size: 10 }, 'cover')).toBe('');
  });
  it('preserves imported contact, contribution and delivery values when other guest fields change', () => {
    const raw = { id: 501, guestName: 'Guest', email: 'guest@example.test', phone: '012345678', seatCount: 3, sendStatus: 'OPENED', contributionStatus: 'RECORDED', totalContributed: '25.00' };
    const guest = normalizeBackendGuest(raw);
    const payload = toBackendGuestPayload({ ...guest, name: 'Renamed guest', sendStatus: 'RESPONDED' });
    expect(payload).toMatchObject({ guestName: 'Renamed guest', email: raw.email, phone: '012345678', seatCount: 3, contributionStatus: 'RECORDED', totalContributed: '25.00', sendStatus: 'OPENED' });
    expect(payload).not.toHaveProperty('inviteToken');
  });
});
