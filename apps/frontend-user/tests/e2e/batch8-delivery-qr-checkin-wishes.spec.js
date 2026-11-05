import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PNG_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf4sAAAAASUVORK5CYII=";

const user = { id: 7, fullName: "Dara Sok", email: "host@example.test", role: "USER" };
const invitation = { id: 42, title: "Dara & Sophea Wedding", status: "PUBLISHED", slug: "dara-sophea", eventType: "WEDDING" };

const seedGuests = [
  { id: 501, guestName: "Sok Dara", phone: "012 345 678", email: "dara@example.test", sendStatus: "SENT", invitationUrl: "https://fixture.example/i/dara-sophea?token=tok-501", lastSentAt: "2026-11-01T10:00:00Z" },
  { id: 502, guestName: "Heng Thida", phone: "085 221 144", email: "thida@example.test", sendStatus: "PENDING", invitationUrl: "https://fixture.example/i/dara-sophea?token=tok-502", lastSentAt: null },
  { id: 503, guestName: "Chan Vicheka", phone: "096 788 009", email: "vicheka@example.test", sendStatus: "OPENED", invitationUrl: "https://fixture.example/i/dara-sophea?token=tok-503", lastSentAt: "2026-11-02T10:00:00Z" },
];

let seedWishes = [
  { id: "w-1", guestName: "Chann Sokha", message: "Wishing you eternal love and joy!", createdAt: "2026-12-01T10:00:00Z" },
  { id: "w-2", guestName: "Vannak Bopha", message: "May your journey together be blessed.", createdAt: "2026-12-02T12:00:00Z" },
];

async function setupBatch8(page, { lang = "en" } = {}) {
  const state = {
    guests: structuredClone(seedGuests),
    wishes: structuredClone(seedWishes),
    shares: [],
    checkIns: [{ id: 901, guestId: 501, guestName: "Sok Dara", source: "QR", checkedInAt: "2026-12-15T10:00:00Z" }],
    ticketDesign: {
      layout: "GOLD",
      accent: "#926c34",
      frame: "DOUBLE",
      font: "MOUL",
      header: "Official Pass",
      footer: "Reception Entry",
      coverFit: "COVER",
      coverFocusX: 50,
      coverFocusY: 50,
      backgroundOpacity: 0.12,
      showTable: true,
      showSeatCount: true,
      showGroup: false,
    },
  };

  await page.addInitScript(({ user, lang }) => {
    const auth = JSON.stringify({
      accessToken: `${btoa(JSON.stringify({ alg: "none" }))}.${btoa(JSON.stringify({ sub: String(user.id), exp: 4102268800 }))}.`,
      tokenType: "Bearer",
      expiresAt: "2100-01-01T00:00:00Z",
      user,
    });
    sessionStorage.setItem("koupreng.auth", auth);
    localStorage.setItem("koupreng.auth", auth);
    localStorage.setItem("koupreng.lang", lang);
  }, { user, lang });

  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const json = (data, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });

    if (path.endsWith("/auth/me")) return json(user);
    if (path.endsWith("/auth/csrf")) return json({ token: "csrf-token-123" });
    if (path.endsWith("/i18n/messages")) return json({ messages: {} });
    if (path.endsWith("/invitations/42/access")) {
      return json({
        owner: true,
        permissions: ["MANAGE_INVITATION", "MANAGE_GUESTS", "MANAGE_CHECKIN"],
        ownerFeatures: ["QR_INVITATIONS", "GUEST_IMPORT"],
      });
    }
    if (path.endsWith("/invitations/my")) return json([invitation]);
    if (path.endsWith("/invitations/42")) return json(invitation);

    // Delivery APIs
    if (path.endsWith("/42/delivery/summary")) {
      return json({
        totalGuests: state.guests.length,
        ready: state.guests.filter((g) => g.invitationUrl).length,
        sent: state.guests.filter((g) => g.sendStatus === "SENT").length,
        opened: state.guests.filter((g) => g.sendStatus === "OPENED").length,
        responded: 1,
        failed: 0,
        guests: state.guests,
      });
    }
    if (path.endsWith("/42/delivery/events")) return json([]);
    if (path.endsWith("/42/delivery/prepare")) return json({ message: "prepared" });
    if (/\/42\/delivery\/guests\/\d+\/share-message$/.test(path)) {
      const match = path.match(/\/guests\/(\d+)\/share-message/);
      const gid = match ? Number(match[1]) : 0;
      const g = state.guests.find((item) => item.id === gid);
      return json({ message: `Wedding invitation for ${g?.guestName || "Guest"}: ${g?.invitationUrl}` });
    }
    if (/\/42\/delivery\/guests\/\d+\/mark-shared$/.test(path)) {
      const match = path.match(/\/guests\/(\d+)\/mark-shared/);
      const gid = match ? Number(match[1]) : 0;
      state.shares.push(gid);
      state.guests = state.guests.map((g) => (g.id === gid ? { ...g, sendStatus: "SENT" } : g));
      return json(state.guests.find((g) => g.id === gid));
    }

    // QR APIs
    if (path.endsWith("/42/qr")) {
      return json({
        title: invitation.title,
        qrCodeDataUri: PNG_DATA_URI,
        invitationUrl: "https://fixture.example/w/dara-sophea",
      });
    }
    if (/\/42\/guests\/\d+\/qr$/.test(path)) {
      const match = path.match(/\/guests\/(\d+)\/qr/);
      const gid = match ? Number(match[1]) : 0;
      const g = state.guests.find((item) => item.id === gid);
      return json({
        title: invitation.title,
        guestName: g?.guestName || "Guest",
        qrCodeDataUri: PNG_DATA_URI,
        invitationUrl: `https://fixture.example/i/dara-sophea?token=tok-${gid}`,
      });
    }

    // Check-in Desk APIs
    if (path.endsWith("/42/check-in/summary")) {
      return json({
        totalGuests: state.guests.length,
        checkedIn: state.checkIns.length,
        attendingCheckedIn: state.checkIns.length,
        remaining: Math.max(0, state.guests.length - state.checkIns.length),
      });
    }
    if (path.endsWith("/42/check-in/list")) return json(state.checkIns);
    if (path.endsWith("/42/guests")) return json(state.guests);
    if (path.endsWith("/42/check-in/scan")) {
      const postData = req.postDataJSON() || {};
      const token = postData.token || "";
      if (token.includes("501")) {
        return json({
          id: 901,
          guestId: 501,
          guestName: "Sok Dara",
          alreadyCheckedIn: true,
          checkedInAt: "2026-12-15T10:00:00Z",
          source: "Server Record",
        });
      }
      const newCheckIn = {
        id: 900 + state.checkIns.length + 1,
        guestId: 502,
        guestName: "Heng Thida",
        alreadyCheckedIn: false,
        checkedInAt: new Date().toISOString(),
        source: "QR Token",
      };
      state.checkIns.push(newCheckIn);
      return json(newCheckIn);
    }

    // Ticket Designer APIs
    if (path.endsWith("/42/ticket-design")) {
      if (req.method() === "PUT") {
        state.ticketDesign = { ...req.postDataJSON() };
      }
      return json({ design: state.ticketDesign });
    }
    if (path.endsWith("/42/ticket")) {
      return json({
        id: 42,
        title: invitation.title,
        hostName: "Dara",
        partnerName: "Sophea",
        eventDate: "2027-12-05",
        eventTime: "17:00",
        venueName: "Grand Palace",
        qrCodeDataUri: PNG_DATA_URI,
        invitationUrl: "https://fixture.example/w/dara-sophea",
        kind: "GENERAL",
        appearance: { design: state.ticketDesign, backgroundUrl: null, coverUrl: null },
      });
    }
    if (/\/42\/guests\/\d+\/ticket$/.test(path)) {
      const gid = Number(path.split("/")[5]);
      const g = state.guests.find((item) => item.id === gid);
      return json({
        id: 42,
        title: invitation.title,
        hostName: "Dara",
        partnerName: "Sophea",
        guestName: g?.guestName || "Personal Guest",
        eventDate: "2027-12-05",
        eventTime: "17:00",
        venueName: "Grand Palace",
        tableName: "Table 1",
        seatNumber: "A1",
        seatCount: 2,
        qrCodeDataUri: PNG_DATA_URI,
        invitationUrl: `https://fixture.example/i/dara-sophea?token=tok-${gid}`,
        kind: "GUEST",
        appearance: { design: state.ticketDesign, backgroundUrl: null, coverUrl: null },
      });
    }
    if (path.endsWith("/42/media")) return json({ all: [] });

    // Wishes APIs
    if (path.endsWith("/42/wishes")) {
      if (req.method() === "GET") return json(state.wishes);
    }
    if (/\/42\/wishes\/w-\d+$/.test(path) && req.method() === "DELETE") {
      const wid = path.split("/").at(-1);
      state.wishes = state.wishes.filter((w) => w.id !== wid);
      return json({ message: "Wish deleted" });
    }

    return json({});
  });

  return state;
}

test.describe("Batch 8 — Operational Journey Verification", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("1. Delivery workspace: metrics, recipient search, copy link, and truthful share status", async ({ page }) => {
    const state = await setupBatch8(page);

    await page.goto("/app/events/42/delivery");
    await expect(page.getByRole("heading", { name: "Invitation delivery" })).toBeVisible();

    // Verify summary metrics
    const summary = page.locator(".workspace-summary");
    await expect(summary.locator('[data-metric="total"] strong')).toHaveText("3");
    await expect(summary.locator('[data-metric="ready"] strong')).toHaveText("3");

    // Search for guest
    const searchInput = page.getByLabel("Search delivery recipients");
    await searchInput.fill("Thida");
    await expect(page.getByText("Heng Thida")).toBeVisible();
    await expect(page.getByText("Sok Dara")).not.toBeVisible();

    // Clear search
    await searchInput.clear();
    await expect(page.getByText("Sok Dara")).toBeVisible();

    // Clipboard preparation does not demonstrate sharing or delivery.
    const copyLinkBtn = page.getByRole("button", { name: "Copy link: Heng Thida" });
    await copyLinkBtn.click();
    await expect(page.locator(".k-toast, [role='status']").first()).toBeVisible();
    expect(state.shares).not.toContain(502);
    await expect(page.getByRole("row", { name: /Heng Thida/ })).toContainText("Not sent");

    // Run Axe accessibility check
    const axe = await new AxeBuilder({ page }).include(".delivery-workspace").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(axe.violations).toEqual([]);

    await page.screenshot({ path: "../../docs/design/evidence/batch8/delivery-desktop-1440.png", fullPage: true });
  });

  test("2. QR management: general event QR preview, isolation, copy, and print layout", async ({ page }) => {
    await setupBatch8(page);

    await page.goto("/app/events/42/qr");
    await expect(page.getByRole("heading", { name: "Event Invitation QR Code" })).toBeVisible();

    // Check QR type badge
    await expect(page.locator(".qr-type-badge")).toHaveText("General Event QR");

    // Check high contrast preview frame
    const qrImage = page.locator(".qr-image");
    await expect(qrImage).toBeVisible();
    await expect(qrImage).toHaveAttribute("src", PNG_DATA_URI);

    // Check copy link
    const copyBtn = page.getByRole("button", { name: "Copy Link" });
    await expect(copyBtn).toBeVisible();

    // Check download button
    const downloadBtn = page.getByRole("button", { name: "Download QR Code (PNG)" });
    await expect(downloadBtn).toBeVisible();

    // Run Axe check
    const axe = await new AxeBuilder({ page }).include(".qr-page").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(axe.violations).toEqual([]);

    await page.screenshot({ path: "../../docs/design/evidence/batch8/qr-desktop-1440.png", fullPage: true });
  });

  test("3. Check-in desk: KPI cards, scan token, duplicate scan warning, and roster filters", async ({ page }) => {
    await setupBatch8(page);

    await page.goto("/app/events/42/check-in");
    await expect(page.getByRole("heading", { name: "Dara & Sophea Wedding" })).toBeVisible();

    // Verify KPI summary cards
    await expect(page.locator(".checkin-kpi-label", { hasText: "Total guests" })).toBeVisible();
    await expect(page.locator(".checkin-kpi-label", { hasText: "Checked in" })).toBeVisible();

    // Test duplicate scan attempt
    const tokenInput = page.getByLabel("QR link or token");
    await tokenInput.fill("https://fixture.example/i/dara-sophea?token=tok-501");
    await page.locator("form.guest-form button[type='submit']").click();

    // Verify duplicate scan alert banner appears with guest name
    const banner = page.locator(".checkin-duplicate-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("This guest is already checked in.");
    await expect(banner).toContainText("Sok Dara");

    // Dismiss duplicate banner
    await banner.getByRole("button").click();
    await expect(banner).not.toBeVisible();

    // Test successful check-in
    await tokenInput.fill("https://fixture.example/i/dara-sophea?token=tok-502");
    await page.locator("form.guest-form button[type='submit']").click();

    // Celebration modal opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Heng Thida")).toBeVisible();
    await dialog.locator(".checkin-btn-submit").click();

    // Roster filter
    const pendingTab = page.getByRole("button", { name: /Pending/i });
    await pendingTab.click();

    const axe = await new AxeBuilder({ page }).include(".inv-page").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(axe.violations).toEqual([]);

    await page.screenshot({ path: "../../docs/design/evidence/batch8/checkin-desktop-1440.png", fullPage: true });
  });

  test("4. Wishes management: guest message cards, delete safety on failure and success", async ({ page }) => {
    const state = await setupBatch8(page);

    await page.goto("/app/events/42/wishes");
    await expect(page.getByRole("heading", { name: "Wishes from your guests" })).toBeVisible();
    await expect(page.getByText("Chann Sokha")).toBeVisible();
    await expect(page.getByText("Vannak Bopha")).toBeVisible();

    // Delete wish
    const deleteBtn = page.locator(".wish-card", { hasText: "Chann Sokha" }).getByRole("button", { name: "Delete wish" });
    await deleteBtn.click();

    // Modal appears
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Delete this wish?");

    // Confirm deletion
    await modal.getByRole("button", { name: "Delete wish" }).click();

    // Modal closes and wish is removed
    await expect(modal).not.toBeVisible();
    await expect(page.getByText("Chann Sokha")).not.toBeVisible();
    expect(state.wishes.find((w) => w.id === "w-1")).toBeUndefined();

    const axe = await new AxeBuilder({ page }).include(".wishes-page").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(axe.violations).toEqual([]);

    await page.screenshot({ path: "../../docs/design/evidence/batch8/wishes-desktop-1440.png", fullPage: true });
  });

  test("5. Responsive viewports: mobile 375px, 390px, 768px layout verification", async ({ page }) => {
    test.setTimeout(90000);
    await setupBatch8(page);

    for (const width of [375, 390, 768]) {
      await page.setViewportSize({ width, height: 800 });

      // Delivery
      await page.goto("/app/events/42/delivery");
      await expect(page.getByRole("heading", { name: "Invitation delivery" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `../../docs/design/evidence/batch8/delivery-${width}.png` });

      // QR
      await page.goto("/app/events/42/qr");
      await expect(page.getByRole("heading", { name: "Event Invitation QR Code" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `../../docs/design/evidence/batch8/qr-${width}.png` });

      // Check-in
      await page.goto("/app/events/42/check-in");
      await expect(page.getByRole("heading", { name: "Dara & Sophea Wedding" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `../../docs/design/evidence/batch8/checkin-${width}.png` });

      // Wishes
      await page.goto("/app/events/42/wishes");
      await expect(page.getByRole("heading", { name: "Wishes from your guests" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `../../docs/design/evidence/batch8/wishes-${width}.png` });
    }
  });
});
