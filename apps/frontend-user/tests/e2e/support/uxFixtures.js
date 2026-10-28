import { fixtureToken } from "./fixtureToken.js";

// Browser-only contract fixtures. The application continues to use its real services.
export const uxTemplates = [{ id: 30, code: "event-essential", name: "Event Essential", category: "MINIMALIST", thumbnailUrl: "/templates/event-essential.svg", status: "ACTIVE", premium: false, price: 0, currency: "USD", supportedEventTypes: ["WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER"], supportedLanguages: ["KH", "EN", "BOTH"] }];
export const uxPlans = [
  { id: 1, code: "BASIC", packageName: "Basic", description: "For a small celebration with the people closest to you.", price: 0.01, currency: "USD", durationDays: 365, billingInterval: "YEARLY", maxInvitations: 1, maxGuestsPerInvitation: 40, maxTeamMembers: 1 },
  { id: 2, code: "PRO", packageName: "Pro", description: "More room for your events and invitation details.", price: 199, currency: "USD", durationDays: 365, billingInterval: "YEARLY", maxInvitations: 20, maxGuestsPerInvitation: 500, maxTeamMembers: 5, premiumTemplatesEnabled: true, qrCheckInEnabled: true, seatingEnabled: true },
  { id: 3, code: "PREMIUM", packageName: "Premium", description: "Higher event and guest limits for frequent hosts.", price: 499, currency: "USD", durationDays: 365, billingInterval: "CUSTOM", maxInvitations: 999, maxGuestsPerInvitation: 5000, maxTeamMembers: 25, premiumTemplatesEnabled: true, qrCheckInEnabled: true, seatingEnabled: true },
];
export const uxEvents = [
  { id: 101, userId: 7, title: "Dara & Sophea", eventType: "WEDDING", hostName: "Dara", groomName: "Dara", brideName: "Sophea", status: "DRAFT", templateId: 30, templateCode: "event-essential", eventDate: "2026-12-20", eventTime: "17:30:00", venueName: "Phnom Penh", visibility: "PRIVATE", languageMode: "EN" },
  { id: 102, userId: 7, title: "Sokha’s birthday", eventType: "BIRTHDAY", hostName: "Sokha", status: "DRAFT", templateId: 30, templateCode: "event-essential", eventDate: "2026-12-22", venueName: "Garden House", languageMode: "EN" },
];
export async function installUxFixtures(page, lang = "en", { preservePreferences = false } = {}) {
  const calls = [];
  const created = [];
  const purchased = [];
  await page.addInitScript(({ token, lang, preservePreferences }) => {
    sessionStorage.setItem("koupreng.auth", JSON.stringify({ accessToken: token, user: { id: 7, fullName: "Audit Host", email: "audit@example.test", role: "USER" } }));
    if (!preservePreferences || !localStorage.getItem("koupreng.lang")) localStorage.setItem("koupreng.lang", lang);
  }, { token: fixtureToken, lang, preservePreferences });
  await page.route("**/api/**", async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (!path.startsWith("/api/")) return route.fallback();
    calls.push({ path, method: request.method(), body: request.postData() });
    const reply = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
    if (path.endsWith("/i18n/messages")) return reply({ messages: {} });
    if (path.endsWith("/templates/recommendations")) return reply(uxTemplates.map(template => ({ template, score: 100, styleMatch: true })));
    if (path === "/api/v1/templates") return reply(uxTemplates);
    if (path.endsWith("/templates/paid")) return reply([]);
    const paid = { orderCode: "AUDIT", templateId: 30, templateName: "Event Essential", packageName: "Template", amount: 10, paidAmount: 10, currency: "USD", status: "PAID", provider: "ABA_PAYWAY", createdAt: "2026-10-20T08:30:00Z", paidAt: "2026-10-20T08:35:00Z" };
    if (path === "/api/v1/me/payments") return reply([paid]);
    if (path === "/api/v1/me/payments/AUDIT/receipt") return reply({ ...paid, receiptNumber: "RECEIPT-AUDIT", itemName: "Event Essential", customerName: "Audit Host", issuedAt: paid.paidAt });
    if (path === "/api/v1/templates/event-essential" || path === "/api/v1/templates/slug/event-essential" || path === "/api/v1/templates/30") return reply(uxTemplates[0]);
    if (path.endsWith("/packages")) return reply(uxPlans);
    if (path.endsWith("/subscriptions/current")) return reply(null);
    const pending = { id: 41, packagePlan: uxPlans[0], orderCode: "SUB-AUDIT-041", amount: 0.01, currency: "USD", status: "PENDING_PAYMENT", paymentStatus: "PENDING", active: false, createdAt: "2026-10-20T08:30:00Z", message: "Waiting for payment confirmation." };
    if (path.endsWith("/subscriptions")) return reply([pending, ...purchased]);
    if (path.endsWith("/subscriptions/purchase") && request.method() === "POST") {
      const body = request.postDataJSON();
      const plan = uxPlans.find(plan => plan.id === body.packageId);
      const order = { ...pending, ...body, id: 42 + purchased.length, packagePlan: plan, amount: plan.price, currency: plan.currency, orderCode: `SUB-AUDIT-${42 + purchased.length}`, paymentUrl: "https://payment.example.test/checkout" };
      purchased.push(order); return reply(order, 201);
    }
    if (path.includes("/subscriptions/orders/")) return reply(purchased.find(order => path.endsWith(order.orderCode)) || pending);
    if (path.startsWith("/api/v1/public/invitations/audit-event")) {
      if (path.endsWith("/guest-view")) return reply({ guestName: "Sokha", rsvpStatus: "PENDING", seatCount: 2 });
      if (path.endsWith("/media")) return reply({});
      if (path.endsWith("/wishes")) return reply([]);
      return reply({ ...uxEvents[0], slug: "audit-event", status: "PUBLISHED", visibility: "PUBLIC", enabledSections: JSON.stringify({ rsvp: true, wishes: true }), contentJson: JSON.stringify({ messageText: "Please join our celebration", schedule: [{ time: "17:30", title: "Guest welcome" }] }) });
    }
    if (path === "/api/v1/template-payments/AUDIT") return reply({ orderCode: "AUDIT", templateId: 30, templateName: "Event Essential", packageName: "Template", amount: 10, currency: "USD", status: "PENDING", paymentLink: "https://payment.example.test/checkout" });
    if (path.endsWith("/invitations/my")) return reply([...uxEvents, ...created]);
    if (path === "/api/v1/invitations" && request.method() === "POST") {
      const payload = request.postDataJSON();
      const existing = created.find(event => event.clientRequestId === payload.clientRequestId);
      if (existing) return reply(existing);
      const event = { ...payload, id: 103 + created.length, status: "DRAFT", templateCode: "event-essential" };
      created.push(event);
      return reply(event, 201);
    }
    const match = path.match(/^\/api\/v1\/invitations\/(\d+)(?:\/(.*))?$/);
    if (match) {
      const event = [...uxEvents, ...created].find(event => String(event.id) === match[1]);
      if (!event) return reply(null, 404);
      if (match[2] === "access") return reply({ owner: true, permissions: [], ownerFeatures: ["QR_INVITATIONS", "SEATING", "QR_CHECK_IN", "ADVANCED_ANALYTICS", "TEAM_MEMBERS"] });
      if (!match[2] || match[2] === "preview") return reply(event);
      if (match[2] === "guests") return reply([{ id: 501, guestName: "Sokha", phone: "012345678", seatCount: 2, sendStatus: "SENT", inviteToken: "audit-guest" }]);
      if (match[2] === "gifts") return reply([{ id: 601, name: "Sokha", amount: 25, currency: "USD" }]);
      if (match[2] === "rsvps") return reply([{ id: 901, guestId: 501, responseStatus: "ATTENDING", attendeeCount: 2 }]);
      if (match[2] === "check-in/summary") return reply({ totalGuests: 1, checkedIn: 0, remaining: 1 });
      if (match[2].includes("summary") || match[2].includes("dashboard")) return reply({});
      return reply([]);
    }
    if (path.includes("/organizations/")) return reply({ id: 11, name: "Audit organization", members: [] });
    if (path.endsWith("/me")) return reply({ id: 7, fullName: "Audit Host", email: "audit@example.test", role: "USER" });
    return reply([]);
  });
  return { calls, created };
}
