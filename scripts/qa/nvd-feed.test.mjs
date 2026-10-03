import assert from 'node:assert/strict';
import test from 'node:test';
import { assertFreshMetadata, checkFeedFreshness } from '../ci/check-nvd-feed.mjs';

const now = Date.parse('2026-10-03T06:00:00Z');

test('NVD metadata accepts a current feed with an explicit timezone', () => {
  assert.equal(assertFreshMetadata('lastModifiedDate:2026-10-03T01:00:07-04:00\r\nsize:123\r\n', now),
    '2026-10-03T01:00:07-04:00');
});

test('NVD metadata rejects stale feeds and future timestamps', () => {
  assert.throws(() => assertFreshMetadata('lastModifiedDate:2026-10-03T01:59:59Z', now), /older than four hours/);
  assert.throws(() => assertFreshMetadata('lastModifiedDate:2026-10-03T06:05:01Z', now), /in the future/);
});

test('NVD metadata rejects missing, malformed, duplicate and timezone-free dates', () => {
  for (const metadata of ['', '<html>error</html>', 'lastModifiedDate:invalid',
    'lastModifiedDate:2026-10-03T05:00:00', 'lastModifiedDate:2026-99-03T05:00:00Z',
    'lastModifiedDate:2026-10-03T05:00:00Z\nlastModifiedDate:2026-10-03T05:01:00Z']) {
    assert.throws(() => assertFreshMetadata(metadata, now));
  }
});

test('NVD metadata download rejects HTTP failures and network errors', async () => {
  await assert.rejects(checkFeedFreshness(async () => ({ ok: false, status: 429 })), /HTTP 429/);
  await assert.rejects(checkFeedFreshness(async () => { throw new Error('Network unavailable'); }), /Network unavailable/);
});

test('NVD metadata download checks freshness after a successful HTTP response', async () => {
  await assert.rejects(checkFeedFreshness(async () => ({
    ok: true, text: async () => 'lastModifiedDate:2002-01-01T00:00:00Z',
  })), /older than four hours/);
  const current = new Date().toISOString();
  assert.equal(await checkFeedFreshness(async () => ({
    ok: true, text: async () => `lastModifiedDate:${current}`,
  })), current);
});
