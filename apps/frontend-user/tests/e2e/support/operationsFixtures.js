import { installOverhaulFixtures } from "./overhaulFixtures.js";

// Synthetic browser DTOs for the populated management screens. These do not test live HTTP providers.
export async function installOperationsFixtures(page, lang = "en", { installBase=true } = {}) {
  if(installBase) await installOverhaulFixtures(page, lang);
  const state = { failExpense: false, failRsvp: false, calls: [] };
  const guests = [
    { id: 501, guestName: "Sokha", seatCount: 2, rsvpStatus: "ATTENDING", sendStatus: "SENT" },
    { id: 502, guestName: "Sophea", seatCount: 1, rsvpStatus: "MAYBE", sendStatus: "OPENED" },
  ];
  let responses = [
    { id: 901, guestId: 501, guestName: "Sokha", responseStatus: "ATTENDING", attendeeCount: 2, message: "Wishing you a beautiful celebration!", respondedAt: "2026-10-20T08:30:00Z" },
    { id: 902, guestId: 502, guestName: "Sophea", responseStatus: "MAYBE", attendeeCount: 1, message: "Congratulations!", respondedAt: "2026-10-20T09:30:00Z" },
  ];
  const expenses = [
    { id: 801, name: "Venue deposit", itemName: "Venue deposit", category: "Venue & Transport", estimatedCost: 100, actualCost: 40, currency: "USD", vendorName: "Garden venue", date: "2026-10-20" },
    { id: 802, name: "Flower arrangement", itemName: "Flower arrangement", category: "Decor & Flowers", estimatedCost: 200000, actualCost: 60000, currency: "KHR", vendorName: "Flower studio", date: "2026-10-21" },
  ];
  await page.route("**/api/v1/invitations/101/**", async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1/invitations/101/", "");
    const reply = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
    if (request.method() !== "GET") state.calls.push({ path, method: request.method(), body: request.postDataJSON() });
    if (path === "guests") return reply(guests);
    if (path === "rsvps") return reply(responses);
    if (path === "rsvps/summary") return reply({ attending: responses.filter(r => r.responseStatus === "ATTENDING").length, notAttending: 0, maybe: 1, pending: 0 });
    if (/^rsvps\/\d+$/.test(path)) {
      if (state.failRsvp) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Temporary fixture failure" }) });
      const id = Number(path.split("/")[1]);
      responses = request.method() === "DELETE" ? responses.filter(r => r.id !== id) : responses.map(r => r.id === id ? { ...r, ...request.postDataJSON() } : r);
      return reply(responses.find(r => r.id === id));
    }
    if (path === "budget-items") {
      if (request.method() === "GET") return reply(expenses);
      if (state.failExpense) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Temporary fixture failure" }) });
      const expense = { id: 803, ...request.postDataJSON() };
      expenses.push(expense);
      return reply(expense, 201);
    }
    if (path === "budget") return reply({ items: expenses });
    if (path === "gifts") return reply([
      { id: 601, guestId: 501, name: "Sokha", amount: 25, currency: "USD", method: "Cash", date: "2026-10-20" },
      { id: 602, guestId: 502, name: "Sophea", amount: 40000, currency: "KHR", method: "ABA", date: "2026-10-21" },
    ]);
    if (path === "reports/guests") return reply({ totalGuests: 2, sent: 2, opened: 1 });
    if (path === "reports/rsvp") return reply({ yesCount: 1, attendeeTotal: 2, pendingCount: 0 });
    return route.fallback();
  });
  return state;
}
