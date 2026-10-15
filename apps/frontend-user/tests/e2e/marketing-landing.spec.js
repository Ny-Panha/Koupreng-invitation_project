import { fixtureToken } from "./support/fixtureToken.js";
import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import process from "node:process";

const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const output = process.env.MARKETING_EVIDENCE_DIR || "../../output/playwright/cinematic";
const token = fixtureToken;
const user = { id: 7, fullName: "Fixture Host", email: "host@example.test", role: "USER" };
const catalog = [
  { id: 2, code: "silk-heritage", slug: "silk-heritage", name: "សូត្រមង្គល", nameEn: "Silk Heritage", category: "TRADITIONAL", premium: false, price: 0, currency: "USD", thumbnailUrl: "/templates/silk-heritage/preview.svg", description: JSON.stringify({ presetId: "SILK_HERITAGE", coverImage: "/templates/silk-heritage/portrait.webp" }) },
  { id: 80, code: "khmer-celestial", name: "ខ្មែរចន្ទតារា", nameEn: "Khmer Celestial", category: "TRADITIONAL", premium: true, price: null, currency: "USD", thumbnailUrl: "/facebook/all/06-card/cover-card.jpg" },
  { id: 81, code: "emerald-canva-luxe-wedding", name: "Emerald Luxe", category: "MODERN", premium: true, price: 20, currency: "USD", thumbnailUrl: "/templates/canva-luxury/emerald-luxury.jpg" },
];
const json = (route, data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status >= 400 ? { message: data } : { data }) });

async function fixture(page, { signedIn = false, paid = [], offline = false } = {}) {
  let authenticated = signedIn;
  let unavailable = offline;
  if (signedIn) await page.addInitScript(({ token, user }) => {
    const envelope = JSON.stringify({ accessToken: token, tokenType: "Bearer", user });
    sessionStorage.setItem("koupreng.auth", envelope);
    localStorage.setItem("koupreng.auth", envelope);
  }, { token, user });
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/auth/login") { authenticated = true; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accessToken: token, tokenType: "Bearer", user }) }); }
    if (url.pathname === "/api/auth/me") return authenticated ? json(route, user) : json(route, "No session", 401);
    if (url.pathname === "/api/v1/templates") return unavailable ? json(route, "Collection offline", 503) : json(route, catalog);
    if (url.pathname.includes("/templates/slug/")) {
      const design = catalog.find((item) => item.code === decodeURIComponent(url.pathname.split("/").at(-1)));
      return design ? json(route, design) : json(route, "Design not found", 404);
    }
    if (url.pathname === "/api/v1/me/templates/paid") return json(route, paid);
    if (url.pathname.endsWith("/access")) return json(route, { hasAccess: paid.length > 0 });
    if (url.pathname === "/api/v1/i18n/messages") return json(route, { messages: {} });
    return json(route, []);
  });
  return { recover: () => { unavailable = false; } };
}

for (const lang of ["km", "en"]) {
  test(`landing ${lang} fits all required widths with one footer`, async ({ page }, info) => {
    test.setTimeout(120_000);
    await fixture(page);
    await page.addInitScript((language) => localStorage.setItem("koupreng.lang", language), lang);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".kp-design-card")).toHaveCount(3);
    await page.evaluate(() => document.fonts.ready);
    await mkdir(output, { recursive: true });
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const outside = await page.locator(".kp-hero h1, .kp-hero .kp-button, .kp-stage-controls button, .kp-header-inner").evaluateAll((nodes) => nodes.filter((node) => { const box = node.getBoundingClientRect(); return box.left < -1 || box.right > innerWidth + 1; }).map((node) => node.className));
      expect(outside).toEqual([]);
      await page.screenshot({ path: `${output}/after-${lang}-${width}-${info.project.name}-hero.png` });
      if ([390, 1440].includes(width)) {
        for (const image of await page.locator('.kp-landing img[loading="lazy"]').all()) await image.scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `${output}/after-${lang}-${width}-${info.project.name}.png`, fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("preview stages, envelope and keyboard FAQ work with reduced motion", async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const envelope = page.getByRole("button", { name: "Open invitation preview" });
  await expect(page.locator('meta[name="viewport"]')).not.toHaveAttribute("content", /user-scalable=no|maximum-scale=1/);
  await envelope.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "View the full demo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close invitation preview" })).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: /The arrival/ }).click();
  await expect(page.locator(".kp-showcase-frame")).toHaveAttribute("data-stage", "closed");
  await page.getByRole("button", { name: /Your story/ }).click();
  await expect(page.getByRole("img", { name: "Sample couple portrait", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /The details/ }).click();
  await expect(page.locator("#kp-stage-copy")).toContainText("does not collect responses");
  const faq = page.locator(".kp-faq summary").first();
  await faq.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".kp-faq details").first()).toHaveAttribute("open", "");
  expect(await page.locator(".kp-enter").first().evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
  await expect(page.locator(".kp-site-preloader")).toHaveCount(0);
});

test("mobile drawer contains focus, changes language, closes and restores scrolling", async ({ page }) => {
  await fixture(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/");
  const trigger = page.locator(".kp-menu-trigger");
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await expect(drawer).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  for (let index = 0; index < 14; index++) { await page.keyboard.press("Tab"); expect(await drawer.evaluate((node) => node.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press("Shift+Tab");
  expect(await drawer.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await drawer.getByRole("button", { name: "ខ្មែរ", exact: true }).click();
  await expect(page.locator(".kp-marketing-shell")).toHaveAttribute("lang", "km");
  await page.keyboard.press("Escape");
  await expect(page.locator("#public-mobile-navigation")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await trigger.click();
  await page.getByRole("dialog").getByRole("link", { name: "គំរូសន្លឹកការ", exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.locator("#public-mobile-navigation")).not.toBeVisible();
});

test("live categories, search and offline retry stay truthful", async ({ page }) => {
  const state = await fixture(page, { offline: true });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/templates");
  await expect(page.getByText(/These are demo designs/)).toBeVisible();
  await expect(page.getByText("Free design", { exact: true })).toHaveCount(0);
  state.recover();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Free design", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Modern", exact: true }).click();
  await expect(page.locator(".kp-design-card")).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search designs" }).fill("silk");
  await expect(page.locator(".kp-design-card")).toHaveCount(1);
  await page.getByRole("searchbox", { name: "Search designs" }).fill("no-such-design");
  await expect(page.getByText(/No designs match/)).toBeVisible();
});

test("slow catalog shows a stable loading state before live availability", async ({ page }) => {
  await fixture(page);
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  await page.route("**/api/v1/templates", async (route) => { await pending; await json(route, catalog); });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/templates");
  await expect(page.getByRole("status").filter({ hasText: "Loading the invitation collection" })).toBeVisible();
  await expect(page.locator(".kp-design-skeleton")).toHaveCount(3);
  await expect(page.locator(".kp-design-card")).toHaveCount(0);
  release();
  await expect(page.locator(".kp-design-card")).toHaveCount(3);
});

test("public selection survives demo, real login form, reload and editor handoff", async ({ page }) => {
  test.setTimeout(60_000);
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/templates");
  const card = page.locator('[data-template="silk-heritage"]');
  await card.getByRole("link", { name: "Preview", exact: true }).click();
  await expect(page).toHaveURL(/\/templates\/silk-heritage$/);
  await page.locator('.sh-toolbar a[href^="/login"]').click();
  await expect(page).toHaveURL(/next=%2Ftemplates%2Fbrowse%3Ftemplate%3Dsilk-heritage/);
  await page.locator('input[autocomplete="username"]').fill("host@example.test");
  await page.locator('input[autocomplete="current-password"]').fill("fixture-password");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/templates\/browse\?template=silk-heritage$/);
  await expect(page.locator(".tb-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".tb-card-title")).toHaveText("សូត្រមង្គល");
  await page.getByRole("button", { name: "Use Template", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/invitations\/design\?templateId=2$/);
  await expect(page.locator(".pe-editor-root")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/template=silk-heritage$/);
  await expect(page.locator(".tb-card")).toHaveCount(1);
});

test("locked missing price goes to pricing; valid premium remains checkout gated", async ({ page }) => {
  await fixture(page, { signedIn: true });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/templates/browse?template=khmer-celestial");
  await expect(page.getByText(/\$0\.01/)).toHaveCount(0);
  await page.getByRole("button", { name: /View pricing — price unavailable/ }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await page.goto("/templates/browse?template=emerald-canva-luxe-wedding");
  await page.getByRole("button", { name: /Buy design.*20/ }).click();
  await expect(page).toHaveURL(/\/templates\/emerald-canva-luxe-wedding\/checkout$/);
  await expect(page.locator("h1")).toBeVisible();
});

test("paid premium keeps its server editor ID", async ({ page }) => {
  await fixture(page, { signedIn: true, paid: [{ templateId: 81 }] });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/templates/browse?template=emerald-canva-luxe-wedding");
  await page.getByRole("button", { name: "Use Template", exact: true }).click();
  await expect(page).toHaveURL(/templateId=81$/);
});

test("broken images and 200 percent CSS zoom preserve readable actions", async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.route("**/templates/silk-heritage/portrait.webp", (route) => route.abort());
  await page.route("**/images/marketing/silk-portrait-*.webp", (route) => route.abort());
  await page.route("**/templates/silk-heritage/preview.svg", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".kp-photo-fallback")).toBeVisible();
  await page.locator(".kp-collection").scrollIntoViewIfNeeded();
  await expect(page.locator(".kp-design-placeholder").first()).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; window.scrollTo(0, 0); });
  await expect(page.locator(".kp-hero").getByRole("link", { name: "Explore templates", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const lang of ["km", "en"]) test(`V5 ${lang} hero keeps exploration and manual opening in the mobile fold`, async ({ page }) => {
  await fixture(page);
  await page.addInitScript(value => localStorage.setItem("koupreng.lang", value), lang);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const selector of [".kp-hero .kp-button", ".kp-folio-cover"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.y).toBeGreaterThan(64);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  }
  const headings = await page.locator(".kp-landing > section").evaluateAll(nodes => nodes.map(node => node.className));
  expect(headings.findIndex(name => name.includes("kp-collection"))).toBeLessThan(headings.findIndex(name => name.includes("kp-product")));
  await expect(page.locator(".kp-hero-chips")).toHaveCount(0);
});

for (const signedIn of [false, true]) test(`hero preview preserves Silk selection with signedIn=${signedIn}`, async ({ page }) => {
  await fixture(page, { signedIn });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/");
  await expect(page.locator(".kp-folio-demo")).not.toBeVisible();
  await page.getByRole("button", { name: "Try the preview" }).click();
  await expect(page.getByRole("link", { name: "View the full demo" })).toBeFocused();
  await expect(page.getByRole("link", { name: "View the full demo" })).toHaveAttribute("href", "/templates/silk-heritage");
  await page.locator("#kp-folio-note").getByRole("link", { name: "Use this design" }).click();
  await expect(page).toHaveURL(signedIn ? /\/templates\/browse\?template=silk-heritage$/ : /\/login\?next=%2Ftemplates%2Fbrowse%3Ftemplate%3Dsilk-heritage$/);
});

test("an empty server catalog stays empty instead of offering demo designs", async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.route("**/api/v1/templates", route => json(route, []));
  await page.goto("/templates");
  await expect(page.getByRole("status")).toContainText("There are no designs in the collection yet");
  await expect(page.locator(".kp-design-card")).toHaveCount(0);
});

test("premium designs with invalid amounts or currencies keep the pricing gate", async ({ page }) => {
  await fixture(page, { signedIn: true });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  for (const invalid of [{ price: "bad", currency: "USD" }, { price: 20, currency: "invalid" }]) {
    await page.route("**/api/v1/templates", route => json(route, [{ ...catalog[2], ...invalid }]));
    await page.goto("/templates/browse?template=emerald-canva-luxe-wedding");
    await page.getByRole("button", { name: /View pricing — price unavailable/ }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await page.unroute("**/api/v1/templates");
  }
});

test("folio Escape and closing return focus to the control that opened it", async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/");
  const secondary = page.getByRole("button", { name: "Try the preview" });
  await secondary.focus(); await page.keyboard.press("Enter");
  await expect(page.locator(".kp-folio-demo")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(secondary).toBeFocused();
  await expect(page.locator(".kp-folio-paper")).toHaveAttribute("inert", "");
  await secondary.click();
  await page.getByRole("button", { name: "Close invitation preview" }).click();
  await expect(secondary).toBeFocused();
  const cover = page.getByRole("button", { name: "Open invitation preview" });
  await cover.focus(); await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(cover).toBeFocused();
  await expect(cover).toHaveAttribute("aria-expanded", "false");
});

test("public catalog loads responsive local artwork while unknown server URLs stay exact", async ({ page }) => {
  await fixture(page);
  const requests = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/templates");
  const localImage = page.locator('[data-template="khmer-celestial"] img');
  await localImage.scrollIntoViewIfNeeded();
  await expect.poll(() => localImage.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
  expect(await localImage.evaluate(node => node.currentSrc)).toMatch(/\/images\/marketing\/catalog\/khmer-celestial-(640|1280)\.webp$/);
  expect(requests.some(url => /\/(HostShell|InvitationScopedRedirect)-/.test(url))).toBe(false);
  expect(requests.some(url => url.endsWith("/facebook/all/06-card/cover-card.jpg"))).toBe(false);
  const unknown = "/uploads/custom-cover.jpg?revision=7";
  await page.route("**/api/v1/templates", route => json(route, [{ ...catalog[1], thumbnailUrl: unknown }]));
  await page.route("**/uploads/custom-cover.jpg?revision=7", route => route.abort());
  await page.reload();
  await expect(page.locator(".kp-design-placeholder")).toBeVisible();
  expect(requests.some(url => url.endsWith(unknown))).toBe(true);
  await expect(page.locator(".kp-design-actions a").first()).toHaveAttribute("href", /template%3Dkhmer-celestial/);
});
