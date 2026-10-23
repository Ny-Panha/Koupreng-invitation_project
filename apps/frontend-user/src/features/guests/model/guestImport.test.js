import { expect, it } from 'vitest';
import { proposeImportMapping, mappingError, mapImportRows, importPayload, safeCsvCell } from './guestImport';
it('maps canonical/Khmer aliases and leaves ambiguous or unknown columns for explicit choices', () => {
  expect(proposeImportMapping(['ឈ្មោះភ្ញៀវ', 'Phone', 'Guest Count', 'Unknown'])).toEqual(['guestName', 'phone', 'seatCount', '']);
  expect(proposeImportMapping(['Name', 'Guest Name', 'Notes'])).toEqual(['', '', 'note']);
  expect(mappingError(['guestName', 'phone', 'phone'])).toMatch(/only once/);
});
it('preserves strings and excludes unsupported fields and source errors from write payloads', () => {
  const rows = mapImportRows({ rows: [{ rowNumber: 2, values: ['គំរូ', '012000001'], issues: [] }] }, ['guestName', 'phone']);
  expect(rows[0].guest.phone).toBe('012000001'); expect(rows[0].guest.seatCount).toBe('1');
  expect(importPayload('batch', rows).rows[0]).not.toHaveProperty('sourceIssues');
  expect(importPayload('batch', rows).rows[0].guest).not.toHaveProperty('inviteToken');
});
it('skips unsafe source rows and escapes formula-leading exports including whitespace', () => {
  expect(mapImportRows({ rows: [{ rowNumber: 3, values: [''], issues: ['Formula cell'] }] }, ['guestName'])[0].skip).toBe(true);
  expect(safeCsvCell(' =HYPERLINK("bad")')).toBe('"\' =HYPERLINK(""bad"")"');
  expect(safeCsvCell('គំរូ, "One"')).toBe('"គំរូ, ""One"""');
});
