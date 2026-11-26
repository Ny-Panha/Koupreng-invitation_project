import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const AUTH_KEY = "koupreng.auth";

const MOCK_INVITATION = {
  id: 42,
  eventId: 42,
  title: "សិរីមង្គលអាពាហ៍ពិពាហ៍ វណ្ណៈ និងកុលាប · Vannak & Kolab Royal Wedding",
  eventType: "WEDDING",
  status: "PUBLISHED",
  visibility: "PUBLIC",
  slug: "vannak-kolab-2027",
  eventDate: "2027-11-28",
  eventTime: "17:00",
  venueName: "Sokha Phnom Penh Hotel",
  venueAddress: "Chroy Changvar, Phnom Penh",
  groomName: "វណ្ណៈ (Vannak)",
  brideName: "កុលាប (Kolab)",
  hostName: "វណ្ណៈ (Vannak)",
  partnerName: "កុលាប (Kolab)",
  languageMode: "EN",
  templateId: 4,
  templateCode: "khmer-celestial",
  templateName: "Khmer Celestial",
  updatedAt: "2026-11-20T08:00:00Z",
};

async function installOwnerFixtures(page, { invitation = { ...MOCK_INVITATION }, lang = "en", colorMode = "light", capturePayloads = [] } = {}) {
  const token = "header.eyJzdWIiOiI3IiwiZXhwIjo0MTAyNDQ0ODAwfQ.sig";

  await page.addInitScript(({ authKey, authToken, langVal, modeVal }) => {
    window.localStorage.setItem("koupreng.lang", langVal);
    window.localStorage.setItem("koupreng.colorMode", modeVal);
    window.localStorage.setItem("theme", modeVal);
    const env = JSON.stringify({
      accessToken: authToken,
      tokenType: "Bearer",
      expiresAt: "2100-01-01T00:00:00Z",
      user: { id: 7, fullName: "Sokha Meas", email: "sokha@example.test", role: "USER" },
    });
    window.sessionStorage.setItem(authKey, env);
    window.localStorage.setItem(authKey, env);
  }, { authKey: AUTH_KEY, authToken: token, langVal: lang, modeVal: colorMode });

  await page.route("**/api/v1/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const pathname = url.pathname;
    const method = req.method();
    const json = (data, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });

    if (pathname.endsWith("/i18n/messages")) return json({ messages: {} });
    if (pathname.endsWith("/auth/me") || pathname.endsWith("/users/me")) {
      return json({ id: 7, fullName: "Sokha Meas", email: "sokha@example.test", role: "USER" });
    }
    if (pathname === "/api/v1/templates" || pathname === "/api/v1/templates/public") {
      return json([
        { id: 4, code: "khmer-celestial", slug: "khmer-celestial", name: "Khmer Celestial", category: "Khmer", status: "ACTIVE", price: 0, currency: "USD", premium: false },
      ]);
    }
    if (pathname.includes("/templates/public/")) {
      return json({ id: 4, code: "khmer-celestial", slug: "khmer-celestial", name: "Khmer Celestial", category: "Khmer", status: "ACTIVE", price: 0, currency: "USD", premium: false });
    }
    if (pathname === "/api/v1/templates/recommendations") return json([]);
    if (pathname.includes("/invitations/my")) return json([invitation]);
    if (pathname === "/api/v1/invitations/42" && method === "GET") return json(invitation);
    if (pathname === "/api/v1/invitations/42/preview" && method === "GET") return json(invitation);
    if (pathname === "/api/v1/invitations/42" && method === "PUT") {
      const body = req.postDataJSON();
      capturePayloads.push({ type: "update", body });
      Object.assign(invitation, { visibility: body.visibility || invitation.visibility, updatedAt: "2026-11-26T08:00:00Z" });
      return json({ ...invitation, updatedAt: "2026-11-26T08:00:00Z" });
    }
    if (pathname === "/api/v1/invitations/42/publish" && (method === "PATCH" || method === "POST")) {
      capturePayloads.push({ type: "publish" });
      invitation.status = "PUBLISHED";
      return json({ ...invitation, status: "PUBLISHED" });
    }
    if (pathname === "/api/v1/invitations/42/unpublish" && (method === "PATCH" || method === "POST")) {
      capturePayloads.push({ type: "unpublish" });
      invitation.status = "UNPUBLISHED";
      return json({ ...invitation, status: "UNPUBLISHED" });
    }
    if (pathname === "/api/v1/invitations/42/access") {
      return json({
        owner: true,
        permissions: ["VIEW_EVENT", "EDIT_EVENT", "MANAGE_SETTINGS", "MANAGE_INVITATION", "MANAGE_GUESTS", "MANAGE_BUDGET", "MANAGE_SEATING", "MANAGE_CHECKIN", "MANAGE_RSVP", "VIEW_REPORTS"],
        ownerFeatures: ["QR_INVITATIONS", "SEATING", "QR_CHECK_IN", "TEAM_MEMBERS"],
      });
    }
    if (pathname === "/api/v1/invitations/42/dashboard") {
      return json({ totalGuests: 240, totalInvited: 240, attending: 176, declined: 18, maybe: 12, pending: 34, deliverySent: 190 });
    }
    if (pathname === "/api/v1/invitations/42/seating") {
      return json({
        invitationId: 42,
        tables: [
          {
            id: 1,
            invitationId: 42,
            tableName: "VIP Table 1",
            tableLabel: "Family & Elders",
            capacity: 10,
            assignedSeats: 2,
            remainingSeats: 8,
            sortOrder: 1,
            notes: '{"x":25,"y":35}',
          },
          {
            id: 2,
            invitationId: 42,
            tableName: "Table 2",
            tableLabel: "Colleagues & Friends",
            capacity: 10,
            assignedSeats: 2,
            remainingSeats: 8,
            sortOrder: 2,
            notes: '{"x":75,"y":35}',
          },
        ],
        assignments: [
          {
            id: 10,
            invitationId: 42,
            tableId: 1,
            tableName: "VIP Table 1",
            guestId: 1,
            guestName: "Channa Sok",
            guestGroup: "Bride Side",
            seatLabel: "Seats 1-2",
            seatCount: 2,
            notes: "",
            assignedAt: "2026-11-18T14:25:00Z",
          },
          {
            id: 11,
            invitationId: 42,
            tableId: 2,
            tableName: "Table 2",
            guestId: 3,
            guestName: "Dara & Pisey",
            guestGroup: "Groom Side",
            seatLabel: "Seats 1-2",
            seatCount: 2,
            notes: "",
            assignedAt: "2026-11-18T14:30:00Z",
          },
        ],
        unassignedGuests: [
          {
            id: 2,
            invitationId: 42,
            guestName: "Visal Dara",
            guestGroup: "Groom Side",
            sideType: "Coworker",
            seatCount: 1,
          },
        ],
      });
    }
    if (pathname === "/api/v1/invitations/42/seating/layout") {
      return json({
        eventId: 42,
        version: 1,
        data: {
          schemaVersion: 1,
          positions: { 1: { x: 25, y: 35 }, 2: { x: 75, y: 35 } },
          venue: {
            stage: { x: 50, y: 9 },
            entrance: { x: 50, y: 92 },
            walkway: { x: 50, y: 51, orientation: "vertical", enabled: true },
          },
        },
        updatedAt: "2026-11-18T14:00:00Z",
      });
    }
    if (pathname === "/api/v1/invitations/42/seating/summary") {
      return json({ invitationId: 42, totalTables: 2, totalCapacity: 20, assignedSeats: 4, remainingSeats: 16 });
    }
    if (pathname === "/api/v1/invitations/42/budget-items") {
      return json([{ id: 1, category: "Venue & Catering", actualCost: 3500, estimatedCost: 4000, currency: "USD" }]);
    }
    if (pathname === "/api/v1/invitations/42/gifts") return json([]);
    if (pathname === "/api/v1/invitations/42/check-in/summary") return json({ totalCheckedIn: 112, checkedIn: 112 });
    if (pathname === "/api/v1/invitations/42/guests/page") {
      const items = [
        {
          guest: {
            id: 1,
            invitationId: 42,
            guestName: "Channa Sok",
            companionName: "Sophea",
            phone: "012 345 678",
            guestGroup: "Bride Side",
            sideType: "Family",
            tableNumber: "VIP Table 1",
            seatCount: 2,
            sendStatus: "SENT",
            inviteToken: "tok-channa-1",
          },
          rsvpStatus: "ATTENDING",
          attendeeCount: 2,
          respondedAt: "2026-11-18T12:30:00Z",
          checkedIn: true,
          checkedInAt: "2026-11-18T16:15:00Z",
        },
        {
          guest: {
            id: 2,
            invitationId: 42,
            guestName: "Visal Dara",
            companionName: "",
            phone: "077 889 900",
            guestGroup: "Groom Side",
            sideType: "Coworker",
            tableNumber: "",
            seatCount: 1,
            sendStatus: "PENDING",
            inviteToken: "tok-visal-2",
          },
          rsvpStatus: "PENDING",
          attendeeCount: 1,
          respondedAt: null,
          checkedIn: false,
          checkedInAt: null,
        },
      ];
      return json({ items, page: 0, size: 25, totalElements: items.length, totalPages: 1 });
    }
    if (pathname === "/api/v1/invitations/42/guests/overview") {
      return json({
        guestRecords: 2,
        reservedSeats: 3,
        attendingRecords: 1,
        declinedRecords: 0,
        maybeRecords: 0,
        unansweredRecords: 1,
        respondedRecords: 1,
        toInviteRecords: 1,
        checkedInRecords: 1,
        confirmedAttendees: 2,
        markedSentRecords: 1,
      });
    }
    if (pathname === "/api/v1/invitations/42/guests") {
      return json([
        { id: 1, invitationId: 42, guestName: "Channa Sok", companionName: "Sophea", phone: "012 345 678", guestGroup: "Bride Side", sideType: "Family", tableNumber: "VIP Table 1", seatCount: 2, sendStatus: "SENT", inviteToken: "tok-channa-1" },
        { id: 2, invitationId: 42, guestName: "Visal Dara", phone: "077 889 900", guestGroup: "Groom Side", sideType: "Coworker", tableNumber: "", seatCount: 1, sendStatus: "PENDING", inviteToken: "tok-visal-2" },
      ]);
    }
    if (pathname.includes("/notifications")) {
      return json(Array.from({ length: 10 }, (_, idx) => ({
        id: idx + 1,
        title: `Guest RSVP Update #${idx + 1}`,
        message: "Verified guest response and seating assignment recorded.",
        createdAt: "2026-11-18T14:20:00Z",
      })));
    }
    return json({});
  });
}

test.describe("Frontend User 2.0 cross-cutting architecture & Phase 15 acceptance", () => {
  test("desktop sidebar stays stationary across long scroll and supports independent short-viewport nav scrolling + collapse persistence", async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(!vp || vp.width < 1024, "Desktop sticky sidebar test");
    await installOwnerFixtures(page, { invitation: { ...MOCK_INVITATION, status: "PUBLISHED" } });
    await page.goto("/app/events/42", { waitUntil: "domcontentloaded" });

    const sidebar = page.locator(".event-workspace-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(page.locator(".overview-hero")).toBeVisible();
    const initialMetrics = await sidebar.evaluate((el) => ({
      position: getComputedStyle(el).position,
      top: Math.round(el.getBoundingClientRect().top),
    }));
    expect(initialMetrics.position).toBe("sticky");

    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    const afterScrollMetrics = await page.evaluate(() => ({
      scrollY: window.scrollY,
      top: Math.round(document.querySelector(".event-workspace-sidebar").getBoundingClientRect().top),
    }));
    expect(afterScrollMetrics.scrollY).toBeGreaterThan(400);
    expect(Math.abs(afterScrollMetrics.top - initialMetrics.top)).toBeLessThanOrEqual(4);

    // Short viewport nav overflow stays contained & scrollable inside nav body
    await page.setViewportSize({ width: 1024, height: 600 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const navStats = await page.evaluate(() => {
      const sb = document.querySelector(".event-workspace-sidebar");
      const body = document.querySelector(".event-navigation-body");
      return {
        sbBottom: sb.getBoundingClientRect().bottom,
        overflowY: getComputedStyle(body).overflowY,
        canScroll: body.scrollHeight > body.clientHeight,
      };
    });
    expect(navStats.sbBottom).toBeLessThanOrEqual(600);
    expect(["auto", "scroll"]).toContain(navStats.overflowY);
    expect(navStats.canScroll).toBe(true);

    // Collapse & reload persistence
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("button", { name: "Collapse navigation" }).click();
    await expect(page.locator(".event-workspace")).toHaveClass(/is-collapsed/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".event-workspace-sidebar")).toBeVisible();
    await expect(page.locator(".event-workspace")).toHaveClass(/is-collapsed/);
    await page.getByRole("button", { name: "Expand navigation" }).click();
    await expect(page.locator(".event-workspace")).not.toHaveClass(/is-collapsed/);
  });

  test("dark mode applies before first paint, protects card surfaces, respects scroll-padding-top, and passes WCAG AA axe", async ({ page }) => {
    await installOwnerFixtures(page, { invitation: { ...MOCK_INVITATION, status: "PUBLISHED" }, colorMode: "dark", lang: "km" });
    await page.goto("/app/events/42/guests", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".guest-list-panel")).toBeVisible();
    await expect(page.locator(".guest-record-row")).toHaveCount(2);
    await expect(page.getByText("Channa Sok")).toBeVisible();
    await expect(page.getByText("Visal Dara")).toBeVisible();
    await expect(page.getByText(/Something went wrong|Invalid guest page response|មានបញ្ហា/i)).toHaveCount(0);

    const rootState = await page.evaluate(() => {
      const parseRgb = (css) => {
        const m = String(css || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
      };
      const canvasBg = getComputedStyle(document.querySelector(".guest-workspace")).backgroundColor;
      const panelBg = getComputedStyle(document.querySelector(".guest-list-panel")).backgroundColor;
      const rail = document.querySelector(".event-workspace-sidebar");
      const railBg = rail ? getComputedStyle(rail).backgroundColor : null;
      return {
        dataMode: document.documentElement.dataset.colorMode,
        hasDarkClass: document.documentElement.classList.contains("dark"),
        scrollPadTop: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop || "0"),
        overflowPx: document.documentElement.scrollWidth - window.innerWidth,
        canvasBg,
        canvasRgb: parseRgb(canvasBg),
        panelBg,
        panelRgb: parseRgb(panelBg),
        railBg,
        railRgb: parseRgb(railBg),
      };
    });
    expect(rootState.dataMode).toBe("dark");
    expect(rootState.hasDarkClass).toBe(true);
    expect(rootState.scrollPadTop).toBeGreaterThanOrEqual(80);
    expect(rootState.overflowPx).toBe(0);
    expect(rootState.panelBg).not.toBe("rgb(255, 255, 255)");
    expect(rootState.canvasRgb[0]).toBe(rootState.canvasRgb[1]);
    expect(rootState.canvasRgb[1]).toBe(rootState.canvasRgb[2]);
    expect(rootState.panelRgb[0]).toBe(rootState.panelRgb[1]);
    expect(rootState.panelRgb[1]).toBe(rootState.panelRgb[2]);
    if (rootState.railRgb) {
      expect(rootState.railRgb[0]).toBe(rootState.railRgb[1]);
      expect(rootState.railRgb[1]).toBe(rootState.railRgb[2]);
    }

    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations).toEqual([]);
  });

  test("Phase 15 Studio supports visibility selection, password guard, QR/Share Atelier, and Unpublish", async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(!vp || vp.width < 1024, "Desktop Studio workflow");
    const payloads = [];
    const inv = { ...MOCK_INVITATION, status: "DRAFT", visibility: "PUBLIC" };
    await installOwnerFixtures(page, { invitation: inv, capturePayloads: payloads, lang: "en" });
    await page.goto("/app/events/42/invitation", { waitUntil: "domcontentloaded" });

    const publishBtn = page.getByRole("button", { name: "Publish", exact: true });
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();
    const dialog = page.getByRole("dialog", { name: "Review publication" });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/Password protected/i).click();
    const confirmBtn = dialog.getByRole("button", { name: "Confirm publication" });
    await expect(confirmBtn).toBeDisabled();

    const pwInput = dialog.getByLabel("Invitation access password");
    await pwInput.fill("royal-2027");
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    await expect(page.locator(".studio-share-atelier")).toBeVisible();
    expect(payloads.some((p) => p.type === "update" && p.body.visibility === "PASSWORD_PROTECTED" && p.body.accessPassword === "royal-2027")).toBe(true);
    expect(payloads.some((p) => p.type === "publish")).toBe(true);
    await expect(page.locator(".studio-qr-card > svg")).toBeVisible();
    await expect(page.getByRole("link", { name: /Telegram/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /WhatsApp/i })).toBeVisible();

    await page.getByRole("button", { name: /Visibility & password/i }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#publish-review-password")).toHaveValue("");
    await expect(dialog.getByText(/A password is already configured on the server/i)).toBeVisible();
    await dialog.getByLabel(/Public link/i).click();
    await dialog.getByRole("button", { name: "Save access settings" }).click();
    await expect.poll(() => payloads.some((p) => p.type === "update" && p.body.visibility === "PUBLIC" && !("accessPassword" in p.body))).toBe(true);
    await expect(page.locator(".studio-save-status")).toHaveAttribute("data-phase", "saved");

    await page.getByRole("button", { name: "Unpublish invitation" }).click();
    const confirmDialog = page.getByRole("dialog", { name: /Unpublish invitation/i });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: /Confirm|Continue|Unpublish|OK|បញ្ជាក់/i }).click();
    await expect.poll(() => payloads.some((p) => p.type === "unpublish")).toBe(true);
  });

  test("Phase 15 Event Settings (/settings) PublishReview wires visibility/password, confirmation dialog, and saved-password clearing", async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(!vp || vp.width < 1024, "Desktop Event Settings workflow");
    const payloads = [];
    const inv = { ...MOCK_INVITATION, status: "DRAFT", visibility: "PUBLIC" };
    await installOwnerFixtures(page, { invitation: inv, capturePayloads: payloads, lang: "en" });
    await page.goto("/app/events/42/settings", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Review publication", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Review publication" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("/i/vannak-kolab-2027");

    await dialog.getByLabel(/Password protected/i).click();
    const confirmBtn = dialog.getByRole("button", { name: "Confirm publication" });
    await expect(confirmBtn).toBeDisabled();

    await dialog.getByLabel(/Invitation access password/i).fill("settings-pass-2027");
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    const confirmChangeDialog = page.getByRole("dialog", { name: /Confirm Action/i });
    await expect(confirmChangeDialog).toBeVisible();
    await confirmChangeDialog.getByRole("button", { name: /Confirm|Continue|OK/i }).click();

    await expect(page.locator(".studio-share-atelier")).toBeVisible();
    expect(payloads.some((p) =>
      p.type === "update"
      && p.body.visibility === "PASSWORD_PROTECTED"
      && p.body.accessPassword === "settings-pass-2027"
      && p.body.expectedUpdatedAt === "2026-11-20T08:00:00Z"
    )).toBe(true);
    expect(payloads.some((p) => p.type === "publish")).toBe(true);

    await page.getByRole("button", { name: /Visibility & password/i }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#publish-review-password")).toHaveValue("");
    await expect(dialog.getByText(/A password is already configured on the server/i)).toBeVisible();
  });

  test("ProtectedInvitationGate clears stale token, renders visible password input + eye toggle, and respects 429 rate-limit feedback", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("koupreng.lang", "km");
      window.sessionStorage.setItem("koupreng_invitation_access_protected-sample", "stale-expired-token");
    });
    await page.route("**/api/v1/**", async (route) => {
      const req = route.request();
      const pathname = new URL(req.url()).pathname;
      if (pathname.startsWith("/api/v1/public/invitations/protected-sample")) {
        if (req.url().includes("/access") || req.method() === "POST") {
          return route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ message: "Too many attempts" }) });
        }
        return route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "Invitation password required" }) });
      }
      if (pathname.endsWith("/i18n/messages")) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { messages: {} } }) });
      }
      if (pathname === "/api/v1/templates" || pathname === "/api/v1/templates/public") {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: null }) });
    });

    await page.goto("/i/protected-sample", { waitUntil: "domcontentloaded" });
    const card = page.locator(".protected-gate-card");
    await expect(card).toBeVisible();
    const input = card.locator("input");
    await expect(input).toBeVisible();

    const clearedToken = await page.evaluate(() => window.sessionStorage.getItem("koupreng_invitation_access_protected-sample"));
    expect(clearedToken).toBeNull();

    const boxStyle = await input.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { borderWidth: parseFloat(cs.borderTopWidth), bg: cs.backgroundColor };
    });
    expect(boxStyle.borderWidth).toBeGreaterThan(0);

    await card.locator(".protected-gate-toggle").click();
    await expect(input).toHaveAttribute("type", "text");
    await input.fill("wrong");
    await card.locator("button[type=submit]").click();
    await expect(card.locator("[role=alert]")).toContainText(/ព្យាយាមបញ្ចូលពាក្យសម្ងាត់|Too many attempts/i);
  });

  test("mobile 320px overflow & drawer Escape focus return & reduced motion & PWA manifest safety", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await installOwnerFixtures(page, { invitation: { ...MOCK_INVITATION, status: "PUBLISHED" }, lang: "en" });

    await page.setViewportSize({ width: 320, height: 640 });
    const mobileOverflowRoutes = [
      { url: "/", selector: ".kp-hero h1" },
      { url: "/templates", selector: ".tp-page .kp-design-grid.tp-grid" },
      { url: "/login", selector: ".auth-card form" },
      { url: "/app/events", selector: ".event-card" },
      { url: "/app/events/42", selector: ".overview-hero" },
    ];
    for (const { url, selector } of mobileOverflowRoutes) {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await expect(page.locator(selector).first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `zero horizontal overflow on ${url} at 320px`).toBe(0);
    }

    const reducedMotionState = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const mainEl = document.querySelector(".event-workspace-content > main");
      return {
        hasMain: Boolean(mainEl),
        matches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        revealDuration: cs.getPropertyValue("--ui-duration-reveal").trim(),
        pressDuration: cs.getPropertyValue("--ui-duration-press").trim(),
        mainAnimation: mainEl ? getComputedStyle(mainEl).animationName : "",
      };
    });
    expect(reducedMotionState.hasMain).toBe(true);
    expect(reducedMotionState.matches).toBe(true);
    expect(reducedMotionState.revealDuration).toMatch(/^0m?s$/);
    expect(reducedMotionState.pressDuration).toMatch(/^0m?s$/);
    expect(reducedMotionState.mainAnimation).toBe("none");

    const trigger = page.getByRole("button", { name: "Toggle modules menu" });
    await trigger.focus();
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();

    const manifestResp = await page.request.get("/manifest.webmanifest");
    expect(manifestResp.status()).toBe(200);
    const manifestJson = await manifestResp.json();
    expect(manifestJson.icons.length).toBeGreaterThanOrEqual(2);
    for (const icon of manifestJson.icons) {
      const iconResp = await page.request.get(icon.src);
      expect(iconResp.status()).toBe(200);
    }
    const swCount = await page.evaluate(async () => (navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0));
    expect(swCount).toBe(0);
  });

  test("dark mode covers Events toggle, Settings, Seating, Calendar, Budget, Studio & EventCreate without white leaks", async ({ page }) => {
    test.slow();
    const vp = page.viewportSize();
    test.skip(!vp || vp.width < 1024, "Desktop dark-mode route coverage");

    const parseRgb = (css) => {
      const m = String(css || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [255, 255, 255];
    };

    await installOwnerFixtures(page, { invitation: { ...MOCK_INVITATION, status: "PUBLISHED" }, colorMode: "dark", lang: "km" });

    const darkChecks = [
      { url: "/app/events", selector: ".events-view-btn.is-active" },
      { url: "/app/events?view=calendar", selector: ".event-calendar-toggle-btn.is-active" },
      { url: "/app/events/42/settings", selector: ".event-settings-section" },
      { url: "/app/events/42/seating", selector: ".seating-assignment-panel" },
      { url: "/app/events/42/budget", selector: ".exp-sum-card" },
      { url: "/app/events/new", selector: ".event-create .event-type-option" },
      { url: "/app/events/42/invitation", selector: ".studio-workflow-bar", skipAxe: true },
    ];
    for (const check of darkChecks) {
      await page.goto(check.url, { waitUntil: "domcontentloaded" });
      await expect(page.locator(check.selector).first()).toBeVisible({ timeout: 15000 });
      const bg = await page.locator(check.selector).first().evaluate((el) => getComputedStyle(el).backgroundColor);
      const [r, g, b] = parseRgb(bg);
      expect(Math.max(r, g, b), `${check.url} (${check.selector}) dark bg ${bg}`).toBeLessThan(85);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${check.url} horizontal overflow`).toBe(0);
      if (!check.skipAxe) {
        const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
        expect(axe.violations, `${check.url} axe violations`).toEqual([]);
      }
    }

    await page.goto("/app/events/42/seating", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".seating-table-card")).toHaveCount(2);
    await expect(page.locator(".seating-table-card").first()).toContainText("VIP Table 1");
    await expect(page.locator(".seating-table-card").first()).toContainText("Channa Sok");
    await expect(page.locator(".seating-table-card").first()).toContainText("2 / 10");
    await expect(page.locator(".seating-table-card").first()).not.toContainText(/undefined/i);
    await expect(page.locator(".workspace-summary")).toContainText("20");
  });

  test("scrolled desktop header seals top edge, mobile dashboard heading is start-aligned, and mobile hero/auth avoid overlap", async ({ page }) => {
    const vp = page.viewportSize();
    test.skip(!vp || vp.width < 1024, "Full desktop + mobile viewport verification");

    await installOwnerFixtures(page, { invitation: { ...MOCK_INVITATION, status: "PUBLISHED" }, colorMode: "dark", lang: "km" });

    await page.goto("/app/events/42", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".overview-hero")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 700));
    const headerBg = await page.locator(".host-header-wrapper").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, img: cs.backgroundImage };
    });
    expect(headerBg.bg !== "rgba(0, 0, 0, 0)" || headerBg.img !== "none").toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/events/42", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".event-overview .dash-page-header h1")).toBeVisible();
    const h1Box = await page.locator(".event-overview .dash-page-header h1").boundingBox();
    expect(h1Box && h1Box.x < 60, `mobile dashboard H1 left=${h1Box?.x}`).toBe(true);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".kp-hero h1")).toBeVisible();
    await expect(page.locator(".kp-hero-category")).toHaveCount(0);

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator(".chatbot-wrapper")).toHaveCount(0);
  });
});
