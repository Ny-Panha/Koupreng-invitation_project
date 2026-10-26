import { expect, it } from 'vitest';
import { localizeTicket } from './ticketLocalization';
it('localizes approved display text without replacing any ticket credential', () => {
  const ticket = { id: 3, guestId: 7, qrPayload: 'private-qr', qrCodeDataUri: 'data:server-qr', invitationUrl: 'https://example.test/i/event?token=private', kind: 'GUEST', title: 'Khmer title', guestName: 'Original guest', appearance: { design: { version: 3 } } };
  const localized = localizeTicket(ticket, { eventType: 'WEDDING', title: 'English title', groomName: 'First partner', brideName: 'Second partner', venueName: 'Venue', languageMode: 'EN', guestId: 999, qrPayload: 'forged' });
  expect(localized).toMatchObject({ title: 'English title', hostName: 'First partner', guestId: 7, guestName: 'Original guest', qrPayload: 'private-qr', qrCodeDataUri: ticket.qrCodeDataUri, invitationUrl: ticket.invitationUrl });
  expect(localized.appearance).toBe(ticket.appearance);
});
