import { mkdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { expect, test } from "@playwright/test";

const SAMPLE_GUEST = "លោក រ៉ាន់ ណារ៉ាត់ ព្រមទាំងគ្រួសារ";
const PERSONALIZED_GUEST = "លោក សុខ ដារ៉ា";
const VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
  { width: 768, height: 900 },
  { width: 820, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
  { width: 1600, height: 900 },
];

function json(route, data, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  });
}

async function waitForOpening(page) {
  await expect(page.locator(".kc-opening__guest-banner")).toBeVisible();
  await expect(page.locator(".kc-opening__button")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

test("Khmer Celestial guest banner stays balanced in every required viewport", async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const outputDirectory = join(testInfo.config.rootDir, "test-results", "khmer-celestial-guest-banner");
  mkdirSync(outputDirectory, { recursive: true });

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.goto("/templates/khmer-celestial");
    await waitForOpening(page);

    const banner = page.locator(".kc-opening__guest-banner");
    const guestName = banner.locator(".kc-opening__guest-name");
    await expect(guestName).toHaveText(SAMPLE_GUEST);

    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const bounds = document.querySelector(selector)?.getBoundingClientRect();
        return bounds ? {
          top: bounds.top,
          right: bounds.right,
          bottom: bounds.bottom,
          left: bounds.left,
          width: bounds.width,
          height: bounds.height,
        } : null;
      };
      const openingContent = document.querySelector(".kc-opening__content");
      const guestNameElement = document.querySelector(".kc-opening__guest-name");
      const guestNameStyle = guestNameElement ? getComputedStyle(guestNameElement) : null;
      return {
        banner: rect(".kc-opening__guest-banner"),
        bannerImage: rect(".kc-opening__guest-banner-image"),
        guestContent: rect(".kc-opening__guest-banner-content"),
        guestLabel: rect(".kc-opening__guest-label"),
        guestName: rect(".kc-opening__guest-name"),
        eventTime: rect(".kc-opening__time"),
        brand: rect(".kc-opening__brand"),
        button: rect(".kc-opening__button"),
        contentClientHeight: openingContent?.clientHeight || 0,
        contentScrollHeight: openingContent?.scrollHeight || 0,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        guestNameFontFamily: guestNameStyle?.fontFamily || "",
        guestNameLineHeight: Number.parseFloat(guestNameStyle?.lineHeight || "0"),
        bayonLoaded: document.fonts.check("12px Bayon", guestNameElement?.textContent || ""),
      };
    });

    expect(metrics.banner.left).toBeGreaterThanOrEqual(0);
    expect(metrics.banner.right).toBeLessThanOrEqual(metrics.viewportWidth + 0.5);
    expect(Math.abs((metrics.banner.left + metrics.banner.right) / 2 - metrics.viewportWidth / 2)).toBeLessThanOrEqual(0.5);
    expect(metrics.bannerImage.width).toBeCloseTo(metrics.banner.width, 0);
    expect(metrics.bannerImage.height).toBeCloseTo(metrics.banner.height, 0);
    expect(metrics.banner.height).toBe(viewport.width <= 768 ? 76 : 80);
    if (viewport.width <= 430) {
      expect(metrics.banner.width / viewport.width).toBeGreaterThanOrEqual(0.82);
      expect(metrics.banner.width / viewport.width).toBeLessThanOrEqual(0.88);
    } else if (viewport.width === 768) {
      expect(metrics.banner.width).toBe(520);
    } else if (viewport.width <= 1023) {
      expect(metrics.banner.width).toBeCloseTo(Math.min(520, Math.max(440, viewport.width * 0.68)), 0);
    } else {
      expect(metrics.banner.width).toBeCloseTo(Math.min(560, Math.max(440, viewport.width * 0.36)), 0);
    }
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
    expect(metrics.guestName.left).toBeGreaterThanOrEqual(metrics.guestContent.left - 0.5);
    expect(metrics.guestName.right).toBeLessThanOrEqual(metrics.guestContent.right + 0.5);
    expect(metrics.guestName.top).toBeGreaterThanOrEqual(metrics.banner.top);
    expect(metrics.guestName.bottom).toBeLessThanOrEqual(metrics.banner.bottom);
    expect(metrics.guestLabel.top).toBeGreaterThanOrEqual(metrics.eventTime.bottom - 0.5);
    expect(metrics.guestLabel.bottom).toBeLessThanOrEqual(metrics.banner.top + 0.5);
    expect(metrics.banner.width).toBeGreaterThan(metrics.banner.height * 2.4);
    expect(metrics.guestNameFontFamily).toContain("Bayon");
    expect(metrics.bayonLoaded).toBe(true);
    expect(metrics.guestName.height).toBeLessThanOrEqual(metrics.guestNameLineHeight * 1.25);
    expect(metrics.brand.height).toBeGreaterThan(metrics.banner.height);
    expect(metrics.button.bottom).toBeLessThanOrEqual(metrics.viewportHeight + 0.5);
    expect(metrics.contentScrollHeight).toBeLessThanOrEqual(metrics.contentClientHeight + 1);

    await page.screenshot({
      path: join(outputDirectory, `preview-${viewport.width}x${viewport.height}.png`),
    });
  }
});

test("long Khmer guest names stay inside the ornamental safe area", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/templates/khmer-celestial");
  await waitForOpening(page);

  const longGuestName = "ឯកឧត្តម លោកជំទាវ សុខ សុវណ្ណារ៉ា ព្រមទាំងក្រុមគ្រួសារ និងញាតិមិត្ត";
  await page.evaluate((guestName) => {
    window.postMessage({ type: "LIVE_PREVIEW_SYNC", data: { guestName } }, window.location.origin);
  }, longGuestName);

  const guestName = page.locator(".kc-opening__guest-name");
  await expect(guestName).toHaveText(longGuestName);
  await expect(guestName).toHaveClass(/kc-opening__guest-name--very-long/);

  const containment = await page.evaluate(() => {
    const name = document.querySelector(".kc-opening__guest-name").getBoundingClientRect();
    const content = document.querySelector(".kc-opening__guest-banner-content").getBoundingClientRect();
    const banner = document.querySelector(".kc-opening__guest-banner").getBoundingClientRect();
    return {
      insideHorizontalSafeArea: name.left >= content.left - 0.5 && name.right <= content.right + 0.5,
      insideBanner: name.top >= banner.top && name.bottom <= banner.bottom,
    };
  });

  expect(containment.insideHorizontalSafeArea).toBe(true);
  expect(containment.insideBanner).toBe(true);
});

test("public invite token reaches the existing Khmer Celestial guest-name destination", async ({ page }) => {
  let observedToken = "";

  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/public/invitations/celestial-browser-qa") {
      observedToken = url.searchParams.get("token") || "";
      return json(route, {
        id: 42,
        slug: "celestial-browser-qa",
        templateCode: "khmer-celestial",
        title: "សិរីសួស្តីអាពាហ៍ពិពាហ៍",
        groomName: "កឿង វីរៈ",
        brideName: "ឡុង សុម៉ាលី",
        eventDate: "2026-12-20",
        eventTime: "17:00:00",
        venueName: "ភ្នំពេញ",
        designJson: JSON.stringify({ openingVideoEnabled: false }),
        contentJson: JSON.stringify({
          opening: { genericGuestText: "ភ្ញៀវកិត្តិយស", openButtonText: "បើកធៀបការ" },
        }),
        enabledSections: JSON.stringify({ music: false, rsvp: false }),
        layoutSettings: JSON.stringify({ openingVideoEnabled: false }),
        guest: observedToken === "qa-guest-token" ? { guestName: PERSONALIZED_GUEST } : null,
      });
    }
    if (url.pathname === "/api/v1/public/invitations/celestial-browser-qa/media") {
      return json(route, null);
    }
    if (url.pathname === "/api/v1/templates") {
      return json(route, []);
    }
    return json(route, { message: "Not found" }, 404);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/w/celestial-browser-qa?token=qa-guest-token");
  await waitForOpening(page);

  const banner = page.locator(".kc-opening__guest-banner");
  expect(observedToken).toBe("qa-guest-token");
  await expect(banner.locator(".kc-opening__guest-name")).toHaveText(PERSONALIZED_GUEST);
  await expect(banner).not.toContainText(SAMPLE_GUEST);
  await page.locator(".kc-opening__button").click();
  await expect(page.locator(".kc-opening")).toHaveCount(0);

  await page.goto("/w/celestial-browser-qa");
  await waitForOpening(page);
  await expect(page.locator(".kc-opening__guest-name")).toHaveText("ភ្ញៀវកិត្តិយស");
  await expect(page.locator(".kc-opening__guest-banner")).not.toContainText(SAMPLE_GUEST);
});

test("live local backend personalizes the real Khmer Celestial public link", async ({ page }, testInfo) => {
  test.skip(!process.env.QA_PUBLIC_INVITATION_PATH, "Run with a temporary local invitation created through the real API.");
  const browserErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`http://127.0.0.1:5173${process.env.QA_PUBLIC_INVITATION_PATH}`);
  await waitForOpening(page);

  const banner = page.locator(".kc-opening__guest-banner");
  await expect(banner.locator(".kc-opening__guest-name")).toHaveText(process.env.QA_GUEST_NAME);

  const outputDirectory = join(testInfo.config.rootDir, "test-results", "khmer-celestial-guest-banner");
  mkdirSync(outputDirectory, { recursive: true });
  await page.screenshot({ path: join(outputDirectory, "real-personalized-390x844.png") });

  await page.locator(".kc-opening__button").click();
  await expect(page.locator(".kc-opening")).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});
