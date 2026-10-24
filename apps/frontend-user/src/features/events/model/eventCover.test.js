import { describe, expect, it } from 'vitest';
import { resolveEventCover, eventCoverCandidates, EVENT_COVER_FALLBACK } from './eventCover';

describe('canonical event cover', () => {
  it('reads the saved Studio content cover and its summary projection before template artwork', () => {
    expect(resolveEventCover({ contentJson: '{"coverImage":"/studio.jpg"}', templateThumbnailUrl: '/template.jpg' })).toEqual({ source: 'invitation', url: '/studio.jpg' });
    expect(resolveEventCover({ invitationCoverUrl: '/saved-studio.jpg', coverUrl: '/template.jpg', coverSource: 'template' }).url).toBe('/saved-studio.jpg');
  });
  it('uses the exact selected template artwork for a draft', () => {
    expect(resolveEventCover({ templateCode: 'khmer-celestial' })).toEqual({ source: 'template', url: '/facebook/all/06-card/cover-card.jpg' });
  });
  it('owner cover precedes saved invitation and template covers', () => {
    expect(resolveEventCover({ coverUrl: '/owner.jpg', coverSource: 'owner', designJson: '{"coverImage":"/design.jpg"}', templateThumbnailUrl: '/template.jpg' }).url).toBe('/owner.jpg');
  });
  it('separates a legacy template-valued coverUrl from the saved invitation cover', () => {
    expect(resolveEventCover({ coverUrl: '/template.jpg', coverSource: 'template', designJson: '{"coverImage":"/design.jpg"}' })).toEqual({ source: 'invitation', url: '/design.jpg' });
  });
  it('removal uses the exact server template, never an unsaved local image', () => {
    expect(resolveEventCover({ id: 42, coverUrl: null, coverSource: 'template', coverImage: '/stale.jpg', templateThumbnailUrl: '/chosen.jpg' }).url).toBe('/chosen.jpg');
  });
  it('handles invalid JSON, object URLs, malicious schemes and missing templates', () => {
    expect(resolveEventCover({ coverUrl: 'blob:temporary', designJson: '{', templateCode: 'unknown' }).url).toBe(EVENT_COVER_FALLBACK);
    expect(eventCoverCandidates({ coverUrl: 'javascript:alert(1)' })).toEqual([{ url: EVENT_COVER_FALLBACK, source: 'fallback' }]);
  });
  it('resolves each event independently across replacements', () => {
    expect(resolveEventCover({ id: 1, coverUrl: '/a.jpg' }).url).toBe('/a.jpg');
    expect(resolveEventCover({ id: 2, coverUrl: '/b.jpg' }).url).toBe('/b.jpg');
    expect(resolveEventCover({ id: 1, coverUrl: '/replaced.jpg' }).url).toBe('/replaced.jpg');
  });
});
