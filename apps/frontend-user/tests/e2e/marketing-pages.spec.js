import { fixtureToken } from "./support/fixtureToken.js";
import { expect, test } from "@playwright/test";

// All endpoints are fixtures. POSTs are intercepted; nothing reaches SMTP/bank.
const token = fixtureToken;
const user = { id: 7, fullName: "Fixture Host", email: "host@example.test", role: "USER" };
const catalog = [{ id: 2, code: "silk-heritage", status: "ACTIVE", name: "Silk Heritage", premium: false, price: 0, currency: "USD", category: "TRADITIONAL", thumbnailUrl: "/templates/silk-heritage/preview.svg" }];
const offers = [
  { id: 1, code: "FIXTURE_USD", packageName: "USD fixture", price: "29", currency: "USD", durationDays: 90, maxInvitations: 3, maxGuestsPerInvitation: 300, premiumTemplatesEnabled: true, seatingEnabled: true, qrCheckInEnabled: false, active: true },
  { id: 2, code: "FIXTURE_KHR", packageName: "KHR fixture", price: "160000", currency: "KHR", durationDays: 120, maxInvitations: 5, maxGuestsPerInvitation: 500, premiumTemplatesEnabled: false, seatingEnabled: false, qrCheckInEnabled: true, active: true },
  { id: 3, code: "FIXTURE_MISSING", packageName: "Missing price fixture", price: null, currency: "USD", durationDays: 30, maxInvitations: 1, maxGuestsPerInvitation: 100, premiumTemplatesEnabled: false, seatingEnabled: false, qrCheckInEnabled: false, active: true },
];
const respond = (route, data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status >= 400 ? { message: data } : { data }) });

async function fixtures(page, { lang = "en", signedIn = false, packageStatus = 200, packages = offers } = {}) {
  const state = { packageStatus, packages, packageRequests: 0, contactRequests: [] };
  await page.addInitScript(({ lang, signedIn, token, user }) => {
    localStorage.setItem("koupreng.lang", lang);
    if (signedIn) {
      const auth = JSON.stringify({ accessToken: token, tokenType: "Bearer", user });
      localStorage.setItem("koupreng.auth", auth); sessionStorage.setItem("koupreng.auth", auth);
    }
  }, { lang, signedIn, token, user });
  await page.route("**/api/**", route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return respond(route, signedIn ? user : "No session", signedIn ? 200 : 401);
    if (path.endsWith("/packages")) { state.packageRequests++; return respond(route, state.packages, state.packageStatus); }
    if (path.endsWith("/templates")) return respond(route, catalog);
    if (path.endsWith("/i18n/messages")) return respond(route, { messages: {} });
    if (path.endsWith("/contact")) { state.contactRequests.push(route.request().postDataJSON()); return respond(route, { accepted: true, delivery: "SMTP_ACCEPTED" }); }
    if (route.request().method() !== "GET") return respond(route, "Unexpected fixture mutation", 405);
    return respond(route, []);
  });
  return state;
}

for (const lang of ["km", "en"]) for (const path of ["/", "/templates", "/pricing", "/contact"]) {
  test(`${path} ${lang} keeps shared chrome and fits all required widths`, async ({ page }) => {
    test.setTimeout(90_000);
    const state = await fixtures(page, { lang });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const externalFonts = [];
    page.on("request", request => { if (/fonts\.googleapis\.com/.test(request.url())) externalFonts.push(request.url()); });
    await page.goto(path);
    await expect(page.locator(".kp-marketing-shell")).toHaveAttribute("lang", lang);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator(".kp-header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator(`.kp-desktop-nav a[href="${path}"]`)).toHaveAttribute("aria-current", "page");
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const clipped = await page.locator("main h1, main h2, main h3, main p, main button, main a, main label").evaluateAll(nodes => nodes.filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 2).map(node => node.textContent));
      expect(clipped).toEqual([]);
    }
    expect(state.packageRequests).toBe(path === '/' || path === '/pricing' ? 1 : 0);
    expect(state.contactRequests).toHaveLength(0);
    expect(externalFonts).toEqual([]);
    if (path === "/contact") {
      await expect(page.locator('main a[href^="tel:"],main a[href^="mailto:"],main a[href*="t.me/"]')).toHaveCount(0);
      await expect(page.locator(".kp-support-toggle")).toHaveCount(0);
      await expect(page.locator("#contact-name")).toHaveAttribute("maxlength", "120");
      expect(await page.locator("#contact-email").evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
    }
  });
}

test("public discovery shows public catalog prices and requires authentication for package selection", async ({ page }) => {
  const state = await fixtures(page);
  await page.goto("/pricing");
  await expect(page.locator(".kp-plan-card")).toHaveCount(3);
  await expect(page.locator('.kp-plan-price').first()).toHaveText('$29.00');
  await expect(page.getByRole('link',{name:'Sign in to select package'}).first()).toHaveAttribute('href',/\/login\?next=/);
  expect(state.packageRequests).toBeGreaterThan(0);
});

test("authenticated offers retain currency, unavailable amounts and exact feature flags", async ({ page }) => {
  await fixtures(page, { signedIn: true });
  await page.goto("/pricing");
  await expect(page.locator(".kp-plan-card")).toHaveCount(3);
  await expect(page.locator(".kp-plan-card").nth(0).locator(".kp-plan-price")).toHaveText("$29.00");
  await expect(page.locator(".kp-plan-card").nth(1).locator(".kp-plan-price")).toHaveText(new Intl.NumberFormat("en-US", { style: "currency", currency: "KHR" }).format(160000));
  await expect(page.locator(".kp-plan-card").nth(2)).toContainText("Price unavailable");
  await expect(page.locator(".kp-plan-card").nth(2).getByRole("link")).toHaveAttribute("href", "/contact");
  await expect(page.getByText(/Most popular|Recommended/)).toHaveCount(0);
  await expect(page.getByText(/\$0\.00|\$0\.01/)).toHaveCount(0);
  await page.setViewportSize({ width: 430, height: 844 });
  const detail = page.locator(".kp-compare-mobile details").first();
  await detail.locator("summary").focus(); await page.keyboard.press("Enter");
  await expect(detail).toHaveAttribute("open", "");
  await expect(detail).toContainText("Not included");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("package loading, failure, retry and empty catalog have recoverable states", async ({ page }) => {
  const state = await fixtures(page, { signedIn: true, packageStatus: 503, packages: "Unavailable" });
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route("**/api/v1/public/packages", async route => { await pending; await route.fallback(); });
  await page.goto("/pricing");
  await expect(page.getByRole("status")).toHaveText(/Loading current packages/);
  await expect(page.locator('[data-loading-layout="pricing"][aria-busy="true"] .k-skeleton-card')).toHaveCount(3);
  release();
  await expect(page.getByRole("alert")).toContainText("Packages could not be loaded");
  state.packageStatus = 200; state.packages = [];
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("No packages are currently available");
  await expect(page.locator(".kp-plan-card")).toHaveCount(0);
});

test("an unauthorized package response never exposes offers or redirects into checkout", async ({ page }) => {
  await fixtures(page, { signedIn: true, packageStatus: 403, packages: "Access denied" });
  await page.goto("/pricing");
  await expect(page.getByRole("alert")).toContainText("Sign in to check your access");
  await expect(page.locator(".kp-plan-card")).toHaveCount(0);
  await expect(page).toHaveURL(/\/pricing$/);
});

const fillContact = async page => {
  await page.locator("#contact-name").fill("Fixture visitor");
  await page.locator("#contact-email").fill("visitor@example.test");
  await page.locator("#contact-message").fill("Please help with my invitation.");
};

test("contact focuses invalid fields and waits for acknowledged delivery without double submits", async ({ page }) => {
  const state = await fixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#contact-name")).toBeFocused();
  await expect(page.locator("#contact-name")).toHaveAttribute("aria-describedby", "contact-name-error");
  await page.locator("#contact-name").fill("Fixture visitor");
  await page.locator("#contact-email").fill("invalid-address");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#contact-email")).toBeFocused();
  await expect(page.locator("#contact-email-error")).toHaveText("Enter a valid email address.");
  expect(state.contactRequests).toHaveLength(0);
  await fillContact(page);
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  let posts = 0;
  await page.route("**/api/v1/contact", async route => { posts++; await pending; await respond(route, { accepted: true, delivery: "SMTP_ACCEPTED" }); });
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sending…", exact: true })).toBeDisabled();
  await page.locator("form").evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
  await expect.poll(() => posts).toBe(1);
  await expect(page.getByRole("status")).toHaveCount(0);
  finish();
  await expect(page.getByRole("status")).toContainText("accepted for delivery");
  await expect(page.getByRole("status")).toBeFocused();
  await page.getByRole("button", { name: "Send another message" }).click();
  await expect(page.locator("#contact-name")).toBeFocused();
});

for (const status of [429, 502, 503]) test(`contact HTTP ${status} keeps the draft and supports retry`, async ({ page }) => {
  await fixtures(page);
  let calls = 0;
  await page.route("**/api/v1/contact", route => respond(route, ++calls === 1 ? "Delivery failed" : { accepted: true, delivery: "SMTP_ACCEPTED" }, calls === 1 ? status : 200));
  await page.goto("/contact"); await fillContact(page);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(status === 429 ? "Please wait" : "could not send");
  await expect(page.locator("#contact-message")).toHaveValue("Please help with my invitation.");
  await expect(page.locator("#contact-email")).toHaveValue("visitor@example.test");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Message received");
});

test("contact rejects an unacknowledged response and translates the retained draft", async ({ page }) => {
  await fixtures(page);
  await page.route("**/api/v1/contact", route => respond(route, { accepted: true, delivery: "QUEUED" }));
  await page.goto("/contact"); await fillContact(page);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator(".kp-desktop-actions").getByRole("button", { name: "ខ្មែរ", exact: true }).click();
  await expect(page.locator(".kp-contact-page")).toHaveAttribute("lang", "km");
  await expect(page.locator("#contact-message")).toHaveValue("Please help with my invitation.");
  await expect(page.getByRole("alert")).not.toContainText("could not send");
  await expect(page.getByRole("button", { name: "ផ្ញើសារ", exact: true })).toBeEnabled();
});

test("home pricing/help and the guest fixture lead to real destinations without legacy resources", async ({ page }) => {
  await fixtures(page);
  const requests = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/");
  await expect(page.locator(".kp-guest-demo-note")).toContainText("demonstration");
  await page.getByRole("button", { name: "Pending", exact: true }).click();
  await expect(page.locator(".kp-guest-demo tbody tr")).toHaveCount(1);
  await expect(page.locator(".kp-collection .kp-design-card")).toHaveCount(catalog.length);
  await expect(page.locator(".kp-collection .kp-design-card a").first()).toHaveAttribute("href", /silk-heritage/);
  await page.locator(".kp-pricing-preview").getByRole("link", { name: "Understand packages & access" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await page.goto("/");
  await page.locator(".kp-help-preview").getByRole("link", { name: "Contact the team" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  expect(requests.some(url => /fonts\.googleapis|SiteAnimations-|ChatBot-|background-.*\.png/.test(url))).toBe(false);
});
