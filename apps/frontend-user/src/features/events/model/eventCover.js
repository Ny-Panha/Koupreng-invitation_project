import { getTemplateById } from '../../templates/data/templatesData';

export const EVENT_COVER_FALLBACK = '/templates/event-essential.svg';

function asset(value) {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  // Unsaved object/data URLs must never become a server-backed event identity.
  return /^(https?:\/\/|\/(?!\/))/.test(url) ? url : '';
}

export function eventCoverCandidates(event = {}) {
  let design = {};
  try { design = typeof event.designJson === 'string' ? JSON.parse(event.designJson) : event.designJson || {}; } catch { /* Invalid legacy design falls back to its template. */ }
  const template = getTemplateById(event.templateCode || event.templateId || design.templateId || design.presetId || event.presetId);
  const candidates = [
    { url: event.coverSource === 'template' ? '' : event.coverUrl, source: 'owner' },
    { url: event.media?.coverImage?.fileUrl, source: 'owner' },
    { url: design.coverImage, source: 'invitation' },
    { url: event.templateThumbnailUrl || (event.coverSource === 'template' ? event.coverUrl : ''), source: 'template' },
    { url: template?.thumbnailUrl || template?.image || template?.defaultImage || template?.phoneCoverImage || template?.mainImage, source: 'template' },
    { url: EVENT_COVER_FALLBACK, source: 'fallback' },
  ];
  // Local-only drafts may show their own persisted draft image, but never override a server response.
  if (!event.backendInvitationId && typeof event.id === 'string' && event.id.startsWith('wed-')) {
    candidates.splice(2, 0, { url: event.coverImage, source: 'owner' });
  }
  const seen = new Set();
  return candidates.map(item => ({ ...item, url: asset(item.url) })).filter(item => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url); return true;
  });
}

export function resolveEventCover(event) {
  return eventCoverCandidates(event)[0];
}
