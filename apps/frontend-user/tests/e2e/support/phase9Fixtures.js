import { readFile } from 'node:fs/promises';
import { phase8Fixtures } from './phase8Fixtures';
export { chooseStudioSection } from './studioNavigationActions';

export async function phase9Fixtures(page, { premium = true, ...options } = {}) {
  const state = await phase8Fixtures(page, options);
  const image = '/invitations/khmer-celestial/burgundy-bokeh-poster.webp';
  const qr = `data:image/png;base64,${(await readFile(new URL('./fixtures/ticket-qr.png', import.meta.url))).toString('base64')}`;
  let design = { version: 0, layout: 'GOLD', accent: '#926c34', font: 'MOUL', frame: 'DOUBLE', header: 'Welcome', footer: 'Please present this ticket at the entrance', coverMediaId: null, backgroundMediaId: null, showGroup: true, showTable: true, showSeatCount: true };
  const media = [{ id: 90, mediaType: 'GALLERY_IMAGE', fileUrl: image, mimeType: 'image/webp', originalFilename: 'Existing gallery image' }];
  const uploads = [];
  await page.route('**/api/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const reply = (data, status = 200) => route.fulfill({ status, json: { data } });
    const appearance = () => ({ schemaVersion: 1, design, coverUrl: design.coverMediaId ? image : null, backgroundUrl: design.backgroundMediaId ? image : null });
    if (path === '/api/v1/invitations/101/access') return reply({ owner: true, permissions: ['MANAGE_INVITATION', 'MANAGE_GUESTS'], ownerFeatures: premium ? ['QR_INVITATIONS', 'PRE_WEDDING_VIDEO'] : ['QR_INVITATIONS'] });
    if (path === '/api/v1/invitations/101/media') return reply({ galleryImages: media.filter(item => item.mediaType === 'GALLERY_IMAGE'), all: media });
    if (/\/media\/(ticket-image|pre-wedding-video)$/.test(path)) {
      if (!premium && path.endsWith('pre-wedding-video')) return reply({ message: 'Premium required' }, 403);
      const video = path.endsWith('pre-wedding-video');
      const asset = { id: 100 + media.length, mediaType: video ? 'PRE_WEDDING_VIDEO' : 'TICKET_IMAGE', mimeType: video ? 'video/mp4' : 'image/png', fileUrl: video ? null : image, originalFilename: video ? 'Pre-wedding film.mp4' : 'Ticket artwork.png' };
      media.push(asset); uploads.push(path); return reply(asset, 201);
    }
    if (path.endsWith('/ticket-design')) {
      if (request.method() === 'PUT') design = { ...request.postDataJSON(), version: design.version + 1 };
      return reply(appearance());
    }
    if (path.endsWith('/ticket')) return reply({ kind: path.includes('/guests/') ? 'GUEST' : 'GENERAL', title: 'Phase 9 celebration', hostName: 'Fictional host', partnerName: 'Fictional partner', eventDate: '2027-12-05', eventTime: '17:30', venueName: 'Review venue', guestName: path.includes('/guests/') ? 'Personal guest' : null, tableName: 'Lotus 8', seatCount: 2, invitationUrl: 'https://fixture.invalid/i/review?token=fictional', qrPayload: 'https://fixture.invalid/i/review?token=fictional', qrCodeDataUri: qr, appearance: appearance() });
    if (path.endsWith('/cinematic-content')) return route.fulfill({ contentType: 'video/mp4', body: await readFile(new URL('../../../public/invitations/khmer-celestial/burgundy-bokeh.mp4', import.meta.url)) });
    return route.fallback();
  });
  return { ...state, media, uploads, design: () => design };
}
