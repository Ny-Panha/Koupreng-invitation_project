import { describe, expect, it } from 'vitest';
import { safeCsvCell, mapImportRows, importPayload } from './model/guestImport';
import { buildShareMessage, guestInviteUrl } from './model/guestMappers';

describe('Phase 09 — Guest Management, Delivery & Import Modernization', () => {
  it('prevents CSV formula injection by quoting and prepending apostrophe to dangerous characters', () => {
    // Tests formula prefixes: =, +, -, @, \t, \r
    expect(safeCsvCell('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
    expect(safeCsvCell('+cmd|/c calc')).toBe('"\'+cmd|/c calc"');
    expect(safeCsvCell(' -100')).toBe('"\' -100"');
    expect(safeCsvCell('@evil.com')).toBe('"\'@evil.com"');
    // Normal text is properly escaped without apostrophe prepended
    expect(safeCsvCell('Sok Dara, Groom Side')).toBe('"Sok Dara, Groom Side"');
    expect(safeCsvCell('គំរូ ភ្ញៀវ')).toBe('"គំរូ ភ្ញៀវ"');
  });

  it('preserves leading zeros in Cambodian phone numbers during import mapping', () => {
    const rawRows = {
      rows: [
        { rowNumber: 2, values: ['Sokha Mao', '012999888', '2'], issues: [] },
        { rowNumber: 3, values: ['Chantha Kem', '098123456', '1'], issues: [] },
      ],
    };
    const mapped = mapImportRows(rawRows, ['guestName', 'phone', 'seatCount']);
    expect(mapped[0].guest.phone).toBe('012999888');
    expect(mapped[0].guest.seatCount).toBe('2');
    expect(mapped[1].guest.phone).toBe('098123456');
    expect(mapped[1].guest.seatCount).toBe('1');
  });

  it('generates personalized invitation URLs with opaque tokens without leaking private data', () => {
    const draft = { slug: 'chhim-sophea-wedding' };
    const guest = { id: 888, name: 'Lok Chumteav Bopha', inviteToken: 'tok_sec_opaque_xyz' };
    const publicInvitation = { slug: 'chhim-sophea-wedding' };

    const url = guestInviteUrl(draft, guest, publicInvitation);
    expect(url).toContain('chhim-sophea-wedding?token=tok_sec_opaque_xyz');
    expect(url).not.toContain('Bopha');
    expect(url).not.toContain('888');
  });

  it('builds culturally respectful personalized invitation messages in Khmer and English', () => {
    const guest = { name: 'ឯកឧត្តម សុខា', inviteToken: 'tok_123' };
    const draft = { slug: 'wedding-2026', groomName: 'វិចិត្រ', brideName: 'បុប្ផា' };

    const kmMessage = buildShareMessage(guest, draft, null, 'km');
    expect(kmMessage).toContain('ឯកឧត្តម សុខា');
    expect(kmMessage).toContain('tok_123');

    const enMessage = buildShareMessage(guest, draft, null, 'en');
    expect(enMessage).toContain('ឯកឧត្តម សុខា');
    expect(enMessage).toContain('tok_123');
  });

  it('excludes client-only internal fields from server-bound import payloads', () => {
    const rawRows = {
      rows: [
        {
          rowNumber: 2,
          values: ['Samnang', '011222333', 'Groom Side', 'Friend'],
          issues: [],
        },
      ],
    };
    const mapped = mapImportRows(rawRows, ['guestName', 'phone', 'group', 'category']);
    const payload = importPayload('batch-unique-id-999', mapped);

    expect(payload.batchId).toBe('batch-unique-id-999');
    expect(payload.rows[0].guest.guestName).toBe('Samnang');
    expect(payload.rows[0].guest.phone).toBe('011222333');
    expect(payload.rows[0]).not.toHaveProperty('sourceIssues');
    expect(payload.rows[0].guest).not.toHaveProperty('inviteToken');
    expect(payload.rows[0].guest).not.toHaveProperty('id');
  });
});
