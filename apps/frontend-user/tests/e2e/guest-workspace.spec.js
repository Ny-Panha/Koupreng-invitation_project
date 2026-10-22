import { expect, test } from "@playwright/test";

const user = { id: 7, fullName: "Dara Sok", email: "host@example.test", role: "USER" };
const invitation = { id: 42, title: "Dara & Sophea", status: "PUBLISHED", slug: "dara-sophea" };
const seedGuests = [
  { id: 501, guestName: "Sok Dara", companionName: "Srey Mom", phone: "012 345 678", guestGroup: "Groom Side", sideType: "Family", seatCount: 2, tableNumber: "A-01", sendStatus: "PENDING", note: "Vegetarian meal for one guest" },
  { id: 502, guestName: "Heng Thida", phone: "085 221 144", guestGroup: "Bride Side", sideType: "College Friend", seatCount: 1, sendStatus: "SENT" },
  { id: 503, guestName: "Chan Vicheka", phone: "096 788 009", guestGroup: "Groom Side", sideType: "Coworker", seatCount: 3, tableNumber: "B-04", sendStatus: "SENT" },
  { id: 504, guestName: "Meas Sopheak", phone: "070 445 566", guestGroup: "Bride Side", sideType: "Family", seatCount: 2, sendStatus: "RESPONDED" },
  { id: 505, guestName: "សុខ សុភា និងក្រុមគ្រួសារ", phone: "011 222 333", guestGroup: "Bride Side", sideType: "Family", seatCount: 4, sendStatus: "PENDING" },
  { id: 506, guestName: "Pich Rachana", phone: "", guestGroup: "Groom Side", sideType: "Friend", seatCount: 1, sendStatus: "OPENED" },
].map((guest) => ({ ...guest, inviteToken: `test-guest-${guest.id}` }));

async function setup(page, { lang = "en", empty = false, rejectFirstSave = false, eventType = "WEDDING" } = {}) {
  const state = { guests: empty ? [] : structuredClone(seedGuests), creates: 0 };
  await page.addInitScript(({ user, lang }) => {
    const auth = JSON.stringify({ accessToken: "eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDIyNjg4MDB9.", tokenType: "Bearer", expiresAt: "2100-01-01T00:00:00Z", user });
    sessionStorage.setItem("koupreng.auth", auth);
    localStorage.setItem("koupreng.auth", auth);
    localStorage.setItem("koupreng.lang", lang);
  }, { user, lang });
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
    if (path.endsWith("/auth/me")) return json(user);
    if (path.endsWith("/auth/csrf")) return json({ token: "test-csrf-token" });
    if (path.endsWith("/i18n/messages")) return json({ messages: {} });
    if (path.endsWith("/invitations/my")) return json([{ ...invitation, eventType }]);
    if (path.endsWith("/invitations/42")) return json({ ...invitation, eventType });
    if (path.endsWith("/42/rsvps")) return json(empty ? [] : [
      { id: 901, guestId: 503, responseStatus: "ATTENDING", attendeeCount: 3 },
      { id: 902, guestId: 504, responseStatus: "NOT_ATTENDING", attendeeCount: 0 },
    ]);
    if (path.endsWith("/42/check-in/list")) return json(empty ? [] : [{ guestId: 503, checkedInAt: "2026-12-15T10:00:00Z" }]);
    if (path.endsWith("/42/guests/export")) return route.fulfill({ contentType: "text/csv", body: "guestName,phone\nSok Dara,012345678\n" });
    if (path.endsWith("/42/guests")) {
      if (route.request().method() === "POST") {
        state.creates++;
        if (rejectFirstSave && state.creates === 1) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Guest service unavailable. Try again." }) });
        const created = { ...route.request().postDataJSON(), id: 600 + state.creates, inviteToken: `test-created-${state.creates}` };
        state.guests.push(created);
        return json(created);
      }
      return json(state.guests);
    }
    if (/\/42\/guests\/\d+$/.test(path) && route.request().method() === "PUT") {
      const id = Number(path.split("/").at(-1));
      const updated = { ...state.guests.find((guest) => guest.id === id), ...route.request().postDataJSON() };
      state.guests = state.guests.map((guest) => guest.id === id ? updated : guest);
      return json(updated);
    }
    return json({});
  });
  await page.goto("/dashboard/invitations/42/guests");
  await expect(page.locator(".guest-results-summary")).toContainText(empty ? "0" : "6");
  return state;
}

async function noOverflow(page) {
  const dimensions = await page.locator(".guest-workspace").evaluate((element) => ({ width: element.clientWidth, content: element.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.width + 1);
}

test("guest list filters intersect and reset; invitation and tools remain usable", async ({ page }, testInfo) => {
  await setup(page);
  const rows = page.locator(".guest-record-row");
  await expect(rows).toHaveCount(6);
  await expect(page.locator(".guest-list-panel")).toHaveCSS("opacity", "1");
  await expect(page.locator(".guest-header-actions").getByRole("button", { name: "Add guest", exact: true })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Guest check-in" })).toHaveAttribute("href", "/dashboard/invitations/42/check-in");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".guest-invite-button").first()).toHaveCSS("white-space", "nowrap");
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("guest-workspace.png"), fullPage: true });
  await page.getByRole("button", { name: /^To invite/ }).click();
  await expect(rows).toHaveCount(2);
  await page.getByRole("combobox", { name: "Group", exact: true }).selectOption("Bride Side");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("សុខ សុភា");
  await page.getByRole("searchbox", { name: "Search name, group, phone..." }).fill("not-in-the-list");
  await expect(page.getByRole("heading", { name: "No matching guests found" })).toBeVisible();
  await page.locator(".guest-empty-actions").getByRole("button", { name: "Clear filters" }).click();
  await expect(rows).toHaveCount(6);
  await page.getByRole("button", { name: /^Responded/ }).click();
  await expect(rows).toHaveCount(2);
  await page.getByRole("button", { name: /^Checked in/ }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Chan Vicheka");
  await page.getByRole("button", { name: /^All guests/ }).click();
  await rows.filter({ hasText: "Heng Thida" }).getByRole("button", { name: "Invitation", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("svg").first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("guest-invitation-sharing.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Manage Groups" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Manage Categories" })).toHaveCount(0);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await download).suggestedFilename()).toBe("guests-42.csv");
});

test("editing a guest and marking an invitation sent update the list", async ({ page }) => {
  const state = await setup(page);
  const row = page.locator(".guest-record-row").filter({ hasText: "Sok Dara" });
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Guest Name", exact: true }).fill("Sok Dara Updated");
  await expect(dialog.getByRole("textbox", { name: "Phone Number" })).toHaveValue("012 345 678");
  await expect(dialog.getByRole("textbox", { name: "Phone Number" })).toBeEnabled();
  await expect(dialog.getByRole("combobox", { name: "Status", exact: true })).toBeEnabled();
  await expect(dialog.getByRole("combobox", { name: "Group", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("combobox", { name: "Category", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("textbox", { name: "Table / seat", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("textbox", { name: "Companion / Plus-One" })).toHaveValue("Srey Mom");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(row).toContainText("Sok Dara Updated");
  expect(state.guests.find((guest) => guest.id === 501)).toMatchObject({ tableNumber: "A-01", guestGroup: "Groom Side", sideType: "Family" });
  await row.locator(".guest-row-menu > summary").click();
  await page.keyboard.press("Escape");
  await expect(row.locator(".guest-row-menu")).not.toHaveAttribute("open");
  await row.locator(".guest-row-menu > summary").click();
  await row.getByRole("button", { name: "Record manual sharing" }).click();
  await page.getByRole("button", { name: /^To invite/ }).click();
  await expect(page.locator(".guest-record-row")).toHaveCount(1);
  await expect(page.locator(".guest-record-row")).not.toContainText("Sok Dara Updated");
});

test("add guest keeps failed entries, validates seat count, and supports save and add another", async ({ page }, testInfo) => {
  const state = await setup(page, { rejectFirstSave: true });
  await page.locator(".guest-header-actions").getByRole("button", { name: "Add guest", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const name = dialog.getByRole("textbox", { name: "Guest Name", exact: true });
  await expect(name).toBeFocused();
  await expect(dialog.locator('input[type="tel"]')).toHaveCount(0);
  await dialog.getByRole("combobox", { name: "Group", exact: true }).selectOption("Bride Side");
  await dialog.getByRole("combobox", { name: "Category", exact: true }).selectOption("Family");
  await dialog.locator(".guest-form-details > summary").click();
  await expect(dialog.getByRole("combobox", { name: "Status", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("textbox", { name: "Table / seat", exact: true })).toHaveCount(0);
  await dialog.locator(".guest-form-details > summary").click();
  await name.fill("New Wedding Guest");
  const seats = dialog.getByRole("spinbutton");
  await seats.fill("0");
  await dialog.getByRole("button", { name: "Save & add another" }).click();
  expect(state.creates).toBe(0);
  await seats.fill("2");
  await page.screenshot({ path: testInfo.outputPath("guest-add-form.png"), fullPage: true });
  await dialog.getByRole("button", { name: "Add guest", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Guest service unavailable");
  await expect(name).toHaveValue("New Wedding Guest");
  await dialog.getByRole("button", { name: "Save & add another" }).click();
  await expect(name).toHaveValue("");
  await expect(name).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".guest-record-row").filter({ hasText: "New Wedding Guest" })).toHaveCount(1);
  expect(state.creates).toBe(2);
  expect(state.guests.find((guest) => guest.guestName === "New Wedding Guest")).toMatchObject({ phone: null, sendStatus: "មិនទាន់ផ្ញើ", guestGroup: "Bride Side", sideType: "Family" });
  await noOverflow(page);
});

test("meeting tables can be assigned when creating and editing a guest", async ({ page }) => {
  const state = await setup(page, { eventType: "CORPORATE" });
  await page.locator(".guest-header-actions").getByRole("button", { name: "Add guest", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Guest Name", exact: true }).fill("Meeting Guest");
  await dialog.locator(".guest-form-details > summary").click();
  const table = dialog.getByRole("textbox", { name: "Table / seat", exact: true });
  await expect(table).toBeEnabled();
  await table.fill("C-12");
  await expect(dialog.getByRole("combobox", { name: "Status", exact: true })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Add guest", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.guests.find((guest) => guest.guestName === "Meeting Guest").tableNumber).toBe("C-12");
  const row = page.locator(".guest-record-row").filter({ hasText: "Meeting Guest" });
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(table).toBeEnabled();
  await expect(table).toHaveValue("C-12");
  await expect(dialog.getByRole("combobox", { name: "Status", exact: true })).toBeEnabled();
  await table.fill("C-14");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(row).toContainText("C-14");
});

test("Khmer guest list and form remain readable without overflowing", async ({ page }, testInfo) => {
  await setup(page, { lang: "km" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ភ្ញៀវ");
  await noOverflow(page);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: testInfo.outputPath("guest-workspace-khmer.png"), fullPage: true });
  await page.locator(".guest-header-actions").getByRole("button", { name: "បន្ថែមភ្ញៀវ", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("textbox", { name: /ឈ្មោះភ្ញៀវ/ })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("guest-add-form-khmer.png"), fullPage: true });
});

test("empty guest list offers adding and importing", async ({ page }, testInfo) => {
  await setup(page, { empty: true });
  await expect(page.getByRole("heading", { name: "No guests added yet" })).toBeVisible();
  await expect(page.locator(".guest-empty-actions").getByRole("button", { name: "Add guest" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("guest-empty-state.png"), fullPage: true });
  await page.locator(".guest-empty-actions").getByRole("button", { name: "Import", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await noOverflow(page);
});

test("guest workspace adapts from small phones to wide desktops", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Viewport coverage uses the desktop browser with responsive widths.");
  await setup(page, { lang: "km" });
  for (const width of [375, 768, 1024, 1440, 1813, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    const header = await page.locator(".guest-page-header").boundingBox();
    for (const selector of [".pe-summary-grid", ".guest-list-panel"]) {
      const section = await page.locator(selector).boundingBox();
      expect(Math.abs(section.x - header.x), `${selector} left edge at ${width}px`).toBeLessThanOrEqual(1);
      expect(Math.abs(section.x + section.width - header.x - header.width), `${selector} right edge at ${width}px`).toBeLessThanOrEqual(1);
    }
    await expect(page.locator(".guest-list-panel")).toHaveCSS("opacity", "1");
    const box = await page.locator(".guest-record-row").first().boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.locator(".guest-list-heading").scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`guest-viewport-${width}.png`) });
  }
});
