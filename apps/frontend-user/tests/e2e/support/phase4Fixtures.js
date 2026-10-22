import { installUxFixtures, uxEvents } from './uxFixtures.js';

// Stateful browser contract fixtures; mutations never reach a live service.
export async function installPhase4Fixtures(page, { count = 24, lang = 'en' } = {}) {
  await installUxFixtures(page, lang);
  const state = { writes: [], guests: Array.from({ length: count }, (_, i) => ({ id: 501 + i, invitationId: 101, guestName: `Review Guest ${i + 1}`, phone: `012340${String(i).padStart(3, '0')}`, email: `review${i}@example.test`, seatCount: i % 3 + 1, guestGroup: 'Bride Side', sideType: 'Family', note: 'Review note', sendStatus: 'PENDING', contributionStatus: 'NONE', totalContributed: 0 })), tables: [], assignments: [], media: [], rsvps: [{ id: 901, guestId: 501, guestName: 'Review Guest 1', responseStatus: 'ATTENDING', attendeeCount: 1, respondedAt: '2026-10-20T08:30:00Z', message: 'See you soon.' }] };
  const tables = () => state.tables.map(t => { const assignedSeats = state.assignments.filter(a => a.tableId === t.id).reduce((sum, a) => sum + a.seatCount, 0); return { ...t, assignedSeats, remainingSeats: t.capacity - assignedSeats }; });
  await page.route('**/api/v1/invitations/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname, method = req.method();
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
    const events = uxEvents.map(e => ({ ...e, ...(e.id === 101 ? state.eventOverrides : {}), status: 'PUBLISHED', coverUrl: e.id === 101 ? state.media.find(m => m.mediaType === 'COVER_IMAGE')?.fileUrl : null }));
    if (path.endsWith('/invitations/my')) return reply(events);
    if (/\/invitations\/102(?:\/|$)/.test(path)) return reply(path.endsWith('/102') ? events[1] : []);
    if (!path.startsWith('/api/v1/invitations/101')) return reply(null, 403);
    if (method !== 'GET') state.writes.push({ path, method, body: req.headers()['content-type']?.includes('json') ? req.postDataJSON() : null });
    const body = () => req.postDataJSON();
    if (/\/guests(?:\/\d+)?$/.test(path)) {
      const id = Number(path.split('/').at(-1));
      if (method === 'POST') { const guest = { ...body(), id: 800 + state.guests.length, invitationId: 101 }; state.guests.push(guest); return reply(guest, 201); }
      if (method === 'PUT') { const i = state.guests.findIndex(g => g.id === id); if (i < 0) return reply(null, 404); state.guests[i] = { ...state.guests[i], ...body() }; return reply(state.guests[i]); }
      if (method === 'DELETE') { state.guests = state.guests.filter(g => g.id !== id); return reply(null); }
      return reply(state.guests);
    }
    if (path.endsWith('/seating/tables') && method === 'POST') { const table = { ...body(), id: 100 + state.tables.length }; state.tables.push(table); return reply(table); }
    if (/\/seating\/tables\/\d+$/.test(path)) {
      const id = Number(path.split('/').at(-1));
      if (method === 'DELETE') { if (state.assignments.some(a => a.tableId === id)) return reply(null, 409); state.tables = state.tables.filter(t => t.id !== id); return reply(null); }
      const i = state.tables.findIndex(t => t.id === id); state.tables[i] = { ...state.tables[i], ...body() }; return reply(state.tables[i]);
    }
    if (path.endsWith('/seating/assignments') && method === 'POST') {
      const b = body(), table = tables().find(t => t.id === b.tableId), existing = state.assignments.find(a => a.guestId === b.guestId), guest = state.guests.find(g => g.id === b.guestId);
      if (!guest || !table) return reply(null, 404);
      if (b.seatCount > table.remainingSeats + (existing?.tableId === table.id ? existing.seatCount : 0)) return reply(null, 409);
      const assignment = { ...b, id: existing?.id || 1000 + state.assignments.length, guestName: guest.guestName, tableName: table.tableName };
      state.assignments = [...state.assignments.filter(a => a.guestId !== b.guestId), assignment]; return reply(assignment);
    }
    if (/\/seating\/assignments\/\d+$/.test(path) && method === 'DELETE') { state.assignments = state.assignments.filter(a => a.id !== Number(path.split('/').at(-1))); return reply(null); }
    if (path.endsWith('/seating')) return reply({ invitationId: 101, tables: tables(), assignments: state.assignments, unassignedGuests: state.guests.filter(g => !state.assignments.some(a => a.guestId === g.id)) });
    if (path.endsWith('/seating/summary')) return reply({ totalTables: state.tables.length, totalCapacity: state.tables.reduce((sum, t) => sum + t.capacity, 0), assignedSeats: state.assignments.reduce((sum, a) => sum + a.seatCount, 0) });
    if (path.endsWith('/rsvps')) return reply(state.rsvps);
    if (/\/rsvps\/\d+$/.test(path)) { const id = Number(path.split('/').at(-1)); if (method === 'DELETE') state.rsvps = state.rsvps.filter(r => r.id !== id); else state.rsvps = state.rsvps.map(r => r.id === id ? { ...r, ...body() } : r); return reply(state.rsvps.find(r => r.id === id)); }
    if (path.endsWith('/rsvps/summary')) return reply({ totalGuests: state.guests.length, attending: state.rsvps.filter(r => r.responseStatus === 'ATTENDING').length, notAttending: state.rsvps.filter(r => r.responseStatus === 'NOT_ATTENDING').length, pending: state.guests.length - state.rsvps.length, totalAttendeeCount: state.rsvps.filter(r => r.responseStatus === 'ATTENDING').reduce((sum, r) => sum + r.attendeeCount, 0) });
    if (path.endsWith('/media')) return reply({ coverImage: state.media.find(m => m.mediaType === 'COVER_IMAGE'), galleryImages: state.media.filter(m => m.mediaType === 'GALLERY_IMAGE'), all: state.media });
    if (path.includes('/media/') && method !== 'GET') {
      const mediaType = path.endsWith('/cover') ? 'COVER_IMAGE' : 'GALLERY_IMAGE';
      if (method === 'DELETE') { state.media = state.media.filter(m => m.id !== Number(path.split('/').at(-1))); return reply(null); }
      const m = { id: method === 'PUT' ? Number(path.split('/').at(-2)) : 700 + state.media.length, mediaType, fileUrl: '/templates/event-essential.svg', originalFilename: 'review-image.png', fileSize: 100, mimeType: 'image/png' };
      state.media = [...state.media.filter(item => item.id !== m.id), m]; return reply(path.endsWith('/gallery') ? [m] : m);
    }
    if (path.includes('/delivery/')) {
      if (path.endsWith('/email') || path.endsWith('/reminders')) return reply({ totalTargets: body().guestIds.length, successCount: 0, failedCount: body().guestIds.length });
      if (path.endsWith('/events')) return reply([]);
      if (path.endsWith('/share-message')) return reply({ message: 'Review invitation link', invitationUrl: 'https://koupreng.example/w/review' });
      return reply({ totalGuests: state.guests.length, ready: state.guests.length, sent: 0, failed: 0, guests: state.guests.map(g => ({ ...g, guestId: g.id, invitationUrl: `https://koupreng.example/w/review-${g.id}` })) });
    }
    if (path.endsWith('/101')) return reply({ ...events[0], coverUrl: undefined });
    return route.fallback();
  });
  return state;
}
