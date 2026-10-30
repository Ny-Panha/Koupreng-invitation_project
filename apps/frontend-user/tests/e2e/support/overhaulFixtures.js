import { readFile } from "node:fs/promises";
import { installUxFixtures, uxEvents } from "./uxFixtures.js";
import { installGuestDashboardFixtures } from "./guestDashboardFixtures.js";

// Browser-only DTO fixtures. No live guest, payment, or provider data is changed.
export async function installOverhaulFixtures(page, lang = "en", { empty = false, single = false, published = false, wishes = [] } = {}) {
  const context = await installUxFixtures(page, lang);
  const qr = `data:image/png;base64,${(await readFile(new URL("./fixtures/general-qr.png", import.meta.url))).toString("base64")}`;
  const guests = empty ? [] : [{ id: 501, guestName: "Sokha", phone: "012345678", seatCount: 2, sendStatus: "PENDING", rsvpStatus: "PENDING", inviteToken: "audit-guest" }];
  const events = empty ? [] : uxEvents.slice(0, single ? 1 : 2).map(event => ({ ...event, slug: "audit-event", status: published ? "PUBLISHED" : event.status }));
  await page.route("**/api/v1/**", async route => {
    const path = new URL(route.request().url()).pathname;
    const reply = data => route.fulfill({ contentType: "application/json", body: JSON.stringify({ data }) });
    if (path.endsWith("/invitations/my")) return reply(events);
    if (path === "/api/v1/invitations/101" || path === "/api/v1/invitations/101/preview") return reply(events[0] || uxEvents[0]);
    if (path === "/api/v1/invitations/101/guests") return reply(guests);
    if (path === "/api/v1/invitations/101/rsvps") return reply([]);
    if (path === "/api/v1/invitations/101/dashboard") return reply({ totalGuests: guests.length, totalInvited: 0, attending: 0, pending: guests.length, deliverySent: 0 });
    if (path === "/api/v1/invitations/101/check-in/summary") return reply({ invitationId: 101, totalGuests: guests.length, checkedIn: 0, attendingCheckedIn: 0, remaining: guests.length });
    if (path === "/api/v1/invitations/101/gifts" && empty) return reply([]);
    if (path === "/api/v1/invitations/101/wishes") return reply(wishes);
    if (path === "/api/v1/invitations/101/qr") return reply({ title: uxEvents[0].title, invitationUrl: "https://koupreng.example/i/audit-event", qrPayload: "https://koupreng.example/i/audit-event", qrCodeDataUri: qr });
    if (path === "/api/v1/invitations/101/delivery/summary") return reply({ totalGuests: guests.length, readyGuests: published ? guests.length : 0, sent: 0, failed: 0, guests: guests.map(guest => ({ ...guest, invitationUrl: published ? "https://koupreng.example/i/audit-event?token=audit-guest" : null })) });
    return route.fallback();
  });
  await installGuestDashboardFixtures(page, { guests });
  return context;
}
