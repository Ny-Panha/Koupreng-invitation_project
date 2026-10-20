import { expect, test } from "@playwright/test";
import { fixtureToken } from "./support/fixtureToken";

const host = { id: 7, role: "USER", fullName: "Event Host" };
const templates = [{ id: 30, code: "event-essential", name: "Event Essential", category: "MINIMALIST", thumbnailUrl: "/templates/event-essential.svg", status: "ACTIVE", premium: false, price: 0, currency: "USD", supportedEventTypes: ["WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER"], supportedLanguages: ["KH", "EN", "BOTH"] }];
const events = [
  { id: 101, title: "Wedding A", eventType: "WEDDING", status: "DRAFT", templateCode: "event-essential", eventDate: "2026-12-20", venueName: "Hall A" },
  { id: 102, title: "Birthday B", eventType: "BIRTHDAY", status: "DRAFT", templateCode: "event-essential", eventDate: "2026-12-22", venueName: "Hall B" },
];
async function setup(page) {
  const requests = [];
  const created = [];
  await page.addInitScript(({ fixtureToken, host }) => {
    const envelope = JSON.stringify({ accessToken: fixtureToken, user: host });
    sessionStorage.setItem("koupreng.auth", envelope);
    localStorage.setItem("koupreng.lang", "en");
    localStorage.setItem("koupreng.host.activeEventId", "102");
  }, { fixtureToken, host });
  await page.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    requests.push(path);
    const reply = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
    if (path.endsWith("/i18n/messages")) return reply({ messages: {} });
    if (path === "/api/v1/templates/recommendations") return reply(templates.map(template => ({ template, score: 100, styleMatch: true })));
    if (path === "/api/v1/templates") return reply(templates);
    if (path === "/api/v1/invitations/my") return reply([...events, ...created]);
    if (path === "/api/v1/invitations" && route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      created.push({ ...payload, id: 103, status: "DRAFT", templateCode: "event-essential" });
      return reply(created.at(-1), 201);
    }
    const match = path.match(/^\/api\/v1\/invitations\/(\d+)(?:\/(.*))?$/);
    if (match) {
      const event = [...events, ...created].find(event => String(event.id) === match[1]);
      if (!event) return reply(null, 403);
      if (!match[2] || match[2] === "preview") return reply(event);
      if (match[2] === "guests") return reply([{ id: event.id * 10, guestName: `Guest of ${event.title}`, seatCount: 1 }]);
      if (match[2] === "gifts") return reply([{ id: event.id, name: `Gift of ${event.title}`, amount: 10, currency: "USD" }]);
      if (match[2].includes("budget")) return reply({ items: [] });
      if (match[2].includes("summary") || match[2].includes("dashboard")) return reply({});
      return reply([]);
    }
    return reply([]);
  });
  return { requests, created };
}

test("explicit event, switching, refresh, legacy links and denial preserve isolation", async ({ page }, testInfo) => {
  const { requests } = await setup(page);
  await page.goto("/app/events/101/guests");
  await expect(page.getByText("Guest of Wedding A", { exact: true })).toBeVisible();
  await expect(page.getByText("Guest of Birthday B", { exact: true })).toHaveCount(0);
  await page.getByRole("combobox").first().selectOption("102");
  await expect(page).toHaveURL(/\/app\/events\/102\/guests$/);
  await expect(page.getByText("Guest of Birthday B", { exact: true })).toBeVisible();
  await expect(page.getByText("Guest of Wedding A", { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Guest of Birthday B", { exact: true })).toBeVisible();
  await page.goto("/dashboard/invitations/101/reports");
  await expect(page).toHaveURL(/\/app\/events\/101\/reports$/);
  await expect.poll(() => requests.includes("/api/v1/invitations/101/gifts")).toBe(true);
  await page.goto("/app/events/999/guests");
  await expect(page.getByRole("alert")).toBeVisible();
  expect(requests).not.toContain("/api/v1/invitations/999/guests");
  await page.goto("/dashboard/guests");
  await expect(page).toHaveURL(/\/app\/events\?module=guests$/);
  await expect(page.getByText("Wedding A", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("my-events.png"), fullPage: true });
});

test("single form creates a typed backend draft once and opens its exact workspace", async ({ page }, testInfo) => {
  const { created } = await setup(page);
  await page.goto("/app/events/new");
  await page.getByRole("button", { name: /Birthday|ខួបកំណើត/ }).click();
  await page.getByRole("button", { name: /Select.*Event Essential|ជ្រើសរើស.*Event Essential/ }).click();
  await expect(page.getByRole("button", { name: /Continue|បន្ត/, exact: true })).toHaveCount(0);
  await expect(page.getByLabel(/Groom|កូនកំលោះ/)).toHaveCount(0);
  await page.locator('[name="title"]').fill("Birthday C");
  await page.locator('[name="hostName"]').fill("Sokha");
  await page.locator('[name="eventDate"]').fill("2026-12-25");
  await page.locator('[name="eventTime"]').fill("17:30");
  await page.locator('[name="venueName"]').fill("Home C");
  await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector(".dash-main-scroll")?.scrollTo(0, 0); });
  await page.screenshot({ path: testInfo.outputPath("birthday-details.png"), fullPage: true });
  await page.getByRole("button", { name: /Create event|រក្សាទុកកម្មវិធី/, exact: true }).click();
  await expect(page).toHaveURL(/\/app\/events\/103$/);
  expect(created).toHaveLength(1);
  expect(created[0]).toMatchObject({ eventType: "BIRTHDAY", hostName: "Sokha", templateId: 30, visibility: "PRIVATE" });
  expect(created[0].clientRequestId).toMatch(/^[a-f0-9-]{36}$/);
});

test("workspace and event form fit supported mobile and desktop widths", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await setup(page);
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/login", "/register", "/app/events", "/app/events/new", "/app/events/101", "/app/events/101/gifts", "/app/events/101/rsvp", "/app/events/101/guests"]) {
      await page.goto(path);
      if (path.endsWith("/guests")) await expect(page.getByText("Guest of Wedding A", { exact: true })).toBeVisible();
      else if (path.endsWith("/new")) await expect(page.getByRole("button", { name: /Birthday|ខួបកំណើត/ })).toBeVisible();
      else if (path === "/login" || path === "/register") await expect(page.locator('input[type="password"]').first()).toBeVisible();
      else if (path.endsWith("/gifts")) await expect(page.getByText("Gift of Wedding A", { exact: true })).toBeVisible();
      else if (path.endsWith("/rsvp")) await expect(page.locator(".rsvp-page, .pe-rsvp-page, main").last()).toBeVisible();
      else if (path === "/app/events/101") await expect(page.locator(".dash-main")).toBeVisible();
      else await expect(page.getByText("Wedding A", { exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    if ([320, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath(`workspace-${width}.png`), fullPage: true });
  }
});
