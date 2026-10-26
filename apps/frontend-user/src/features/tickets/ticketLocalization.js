// Presentation only. Identity, guest credentials, QR bytes and purchased artwork stay server-owned.
export function localizeTicket(ticket, content) {
  if (!ticket || !content) return ticket;
  const wedding = ['WEDDING', 'ENGAGEMENT'].includes(content.eventType);
  return { ...ticket, title: content.title, hostName: wedding ? content.groomName : content.hostName,
    partnerName: wedding ? content.brideName : content.partnerName, venueName: content.venueName,
    languageMode: content.languageMode };
}
