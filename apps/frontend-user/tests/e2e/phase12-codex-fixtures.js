const TEST_TOKEN = [
  "eyJhbGciOiJub25lIn0",
  "eyJleHAiOjQxMDIyNjg4MDB9",
  "",
].join(".");

export const mockServerEvents = [
  {
    id: 42,
    title: "Vannak & Kolab Royal Wedding",
    groomName: "Vannak",
    brideName: "Kolab",
    eventType: "WEDDING",
    eventDate: "2027-11-28",
    eventTime: "17:00",
    venueName: "Sokha Hotel Grand Ballroom",
    status: "PUBLISHED",
    slug: "vannak-kolab-2027",
    coverUrl: "/templates/royal-garden.svg",
    templateThumbnailUrl: "/templates/royal-garden.svg",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-18T15:30:00Z",
  },
  {
    id: 105,
    title: "Channary 30th Birthday Gala",
    celebrantName: "Channary",
    eventType: "BIRTHDAY",
    eventDate: "2027-04-12",
    eventTime: "18:30",
    venueName: "Rosewood Phnom Penh",
    status: "DRAFT",
    slug: "channary-30th",
    coverUrl: "/templates/event-essential.svg",
    templateThumbnailUrl: "/templates/event-essential.svg",
    createdAt: "2026-11-10T12:00:00Z",
    updatedAt: "2026-11-15T09:00:00Z",
  },
  {
    id: 201,
    title: "Piseth Tech Leadership Summit",
    eventType: "CORPORATE",
    eventDate: "2027-08-20",
    eventTime: "09:00",
    venueName: "Koh Pich Convention Center",
    status: "PUBLISHED",
    shared: true,
    ownerName: "Piseth Tech Ltd",
    slug: "tech-leadership-2027",
    coverUrl: "/templates/bliss-editorial.svg",
    templateThumbnailUrl: "/templates/bliss-editorial.svg",
    createdAt: "2026-11-05T08:00:00Z",
    updatedAt: "2026-11-12T14:00:00Z",
  },
];

export async function establishUserSession(page, { userId = 7, lang = "en", theme = "light", drafts = [] } = {}) {
  await page.addInitScript(({ token, userId, lang, theme, drafts }) => {
    const authEnvelope = JSON.stringify({
      accessToken: token,
      tokenType: "Bearer",
      expiresAt: "2100-01-01T00:00:00Z",
      user: { id: userId, fullName: "Audit Owner", email: "owner@example.test", role: "HOST" },
    });
    window.sessionStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.lang", lang);
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("koupreng.colorMode", theme);

    if (drafts && drafts.length > 0) {
      window.localStorage.setItem("koupreng.wedding.drafts", JSON.stringify(Object.fromEntries(drafts.map(draft=>[draft.id,draft]))));
    } else {
      window.localStorage.removeItem("koupreng.wedding.drafts");
    }
  }, { token: TEST_TOKEN, userId, lang, theme, drafts });
}

export function setupMockApis(page, { emptyEvents = false, events = mockServerEvents } = {}) {
  return page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    if (method !== 'GET') return route.fulfill({ status:503, contentType:'application/json', body:JSON.stringify({message:'Offline test fixture; local changes retained'}) });

    if (path.includes("/invitations/my") || path.includes("/invitations/mine") || (path === "/api/v1/invitations" && method === "GET")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyEvents ? [] : events),
      });
    }

    if (path === "/api/v1/invitations/42" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockServerEvents[0]),
      });
    }

    if (path === "/api/v1/invitations/201" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockServerEvents[2]),
      });
    }

    if (path.includes("/invitations/42/access")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          owner: true,
          role: "OWNER",
          canManage: true,
          permissions: ["VIEW_EVENT", "EDIT_EVENT", "MANAGE_SETTINGS", "MANAGE_INVITATION", "MANAGE_GUESTS", "MANAGE_BUDGET"],
          ownerFeatures: ["QR_INVITATIONS", "CUSTOM_DOMAIN"],
        }),
      });
    }

    if (path.includes("/invitations/201/access")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          owner: false,
          role: "VIEWER",
          canManage: false,
          permissions: ["VIEW_EVENT"],
          ownerFeatures: [],
        }),
      });
    }

    if (path === "/api/v1/invitations/42/dashboard") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalGuests: 250,
          totalInvited: 250,
          attending: 185,
          declined: 15,
          pending: 50,
          maybe: 0,
          totalResponded: 200,
          rsvpRate: 74,
          checkedInCount: 120,
        }),
      });
    }

    if (path === "/api/v1/invitations/42/budget-items") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, category: "Venue & Catering", actualCost: 3500, estimatedCost: 4000, currency: "USD" },
          { id: 2, category: "Traditional Music", actualCost: 2000000, estimatedCost: 2500000, currency: "KHR" },
          { id: 3, category: "Floral & Decor", actualCost: 1500, estimatedCost: 1500, currency: "USD" },
        ]),
      });
    }

    if (path === "/api/v1/invitations/42/gifts") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, guestName: "Lok Chumteav Bopha", amount: 200, currency: "USD" },
          { id: 2, guestName: "Oknha Rithy", amount: 800000, currency: "KHR" },
          { id: 3, guestName: "Meng & Srey", amount: 100, currency: "USD" },
        ]),
      });
    }

    if (path === "/api/v1/invitations/42/check-in/summary") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalCheckedIn: 120,
          checkedIn: 120,
        }),
      });
    }

    if (path.includes("/notifications/invitation")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, title: "RSVP Accepted", message: "Visal confirmed attendance.", createdAt: "2026-11-18T14:20:00Z" },
          { id: 2, title: "Gift Received", message: "Lok Chumteav Bopha sent $200.", createdAt: "2026-11-18T15:00:00Z" },
        ]),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });
}

export const sampleDrafts = [
  {
    id: "wed-local-offline-1", ownerUserId: 7,
    title: "Dara & Rathana Riverside Wedding",
    eventType: "WEDDING",
    status: "DRAFT",
    syncStatus: "LOCAL_ONLY",
    isLocal: true,
    eventDate: "2027-05-15",
    eventTime: "16:30",
    venueName: "Sofitel Phnom Penh Phokeethra",
    updatedAt: "2026-11-19T08:00:00Z",
  },
  {
    id: "wed-sync-failed-1", ownerUserId: 7,
    title: "Sreypov Golden Anniversary",
    eventType: "ANNIVERSARY",
    status: "DRAFT",
    syncStatus: "SYNC_FAILED",
    eventDate: "2027-06-20",
    eventTime: "18:00",
    venueName: "Hyatt Regency Phnom Penh",
    updatedAt: "2026-11-17T11:00:00Z",
  },
];

