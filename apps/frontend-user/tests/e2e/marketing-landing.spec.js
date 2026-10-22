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
    if (url.pathname === "/api/v1/templates/recommendations") return json(route, catalog.map(template => ({template, styleMatch:true})));
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

test("real invitation opens on demand and keyboard FAQ works with reduced motion", async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator('meta[name="viewport"]')).not.toHaveAttribute("content", /user-scalable=no|maximum-scale=1/);
  await expect(page.locator('iframe')).toHaveCount(0);
  const open=page.getByRole('button',{name:'Try the invitation',exact:true});
  await open.focus();await page.keyboard.press('Enter');
  const frame=page.frameLocator('iframe.public-demo-iframe');
  await expect(frame.locator('[data-template-renderer="silk-heritage"]')).toBeAttached();
  await frame.getByRole('button',{name:/Skip opening/}).click();
  await expect(frame.locator('.sh-hero')).toBeVisible();
  await page.locator('iframe.public-demo-iframe').focus();await page.keyboard.press('Escape');
  await expect(open).toBeFocused();await expect(page.locator('iframe')).toHaveCount(0);
  const faq=page.locator('.kp-faq summary').first();await faq.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.kp-faq details').first()).toHaveAttribute('open','');
  await expect(page.locator('.kp-site-preloader')).toHaveCount(0);
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

test("public demo selection survives the login form and reloads into continuous creation", async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem('koupreng.lang','en'));
  await page.route('**/api/v1/templates/recommendations**',route=>json(route,catalog.map(template=>({template,styleMatch:true}))));
  await page.goto('/templates');await page.locator('[data-template="silk-heritage"]').getByRole('link',{name:'Preview',exact:true}).click();
  await page.locator('.sh-toolbar a[href^="/login"]').click();
  expect(new URL(page.url()).searchParams.get('next')).toBe('/app/events/new?template=silk-heritage');
  await page.locator('input[autocomplete="username"]').fill('host@example.test');
  await page.locator('input[autocomplete="current-password"]').fill('fixture-password');
  await page.locator('button[type="submit"]').click();await expect(page).toHaveURL(/\/app\/events\/new/);
  const choice=page.getByRole('button',{name:'Select សូត្រមង្គល',exact:true});
  await expect(choice).toHaveAttribute('aria-pressed','true');await page.reload();
  await expect(choice).toHaveAttribute('aria-pressed','true');await expect(page.locator('.event-create form')).toHaveCount(1);
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

test("paid premium preserves its canonical creation intent", async ({ page }) => {
  await fixture(page, { signedIn: true, paid: [{ templateId: 81 }] });
  await page.addInitScript(() => localStorage.setItem("koupreng.lang", "en"));
  await page.goto("/templates/browse?template=emerald-canva-luxe-wedding");
  await page.getByRole("button", { name: "Use Template", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/events\/new/);
  await expect(page.getByRole("button",{name:"Select Emerald Luxe",exact:true})).toHaveAttribute("aria-pressed","true");
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

for (const lang of ["km", "en"]) test(`${lang} hero keeps creation and opt-in demo controls in the mobile fold`, async ({ page }) => {
  await fixture(page);
  await page.addInitScript(value => localStorage.setItem("koupreng.lang", value), lang);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const selector of [".kp-hero .kp-actions .kp-button", ".public-demo-launch"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.y).toBeGreaterThan(64);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  }
  const headings = await page.locator(".kp-landing > section").evaluateAll(nodes => nodes.map(node => node.className));
  expect(headings.findIndex(name => name.includes("kp-collection"))).toBeLessThan(headings.findIndex(name => name.includes("kp-product")));
  await expect(page.locator(".kp-hero-chips")).toHaveCount(0);
});

for (const signedIn of [false, true]) test(`full demo preserves Silk selection with signedIn=${signedIn}`, async ({ page }) => {
  await fixture(page,{signedIn});await page.addInitScript(()=>localStorage.setItem('koupreng.lang','en'));
  await page.goto('/');await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('link',{name:'View the full demo',exact:true}).click();
  await expect(page).toHaveURL(/\/templates\/silk-heritage$/);
  const action=page.locator('.sh-toolbar a').last();
  const href=await action.getAttribute('href');
  expect(signedIn?href:new URL(href,page.url()).searchParams.get('next')).toBe('/app/events/new?template=silk-heritage');
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

test("live demo Escape restores the activation control and removes the frame", async ({ page }) => {
  await fixture(page);await page.addInitScript(()=>localStorage.setItem('koupreng.lang','en'));
  await page.goto('/');const open=page.getByRole('button',{name:'Try the invitation',exact:true});
  await open.focus();await page.keyboard.press('Enter');await page.locator('iframe.is-ready').waitFor();
  await page.locator('iframe').focus();await page.keyboard.press('Escape');
  await expect(open).toBeFocused();await expect(open).toHaveAttribute('aria-expanded','false');await expect(page.locator('iframe')).toHaveCount(0);
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
