import { expect, test } from "@playwright/test";

test("Khmer Celestial unlocks document scrolling after opening", async ({ page }, testInfo) => {
  const mobile = testInfo.project.name.startsWith("mobile");
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  await page.goto("/templates/khmer-celestial");
  await expect(page.locator(".kc-opening__brand")).toBeVisible();
  await expect(page.locator(".kc-main")).toHaveAttribute("inert", "");
  await expect(page.locator(".kc-opening__button")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: testInfo.outputPath("opening.png") });

  await page.locator(".kc-opening__button").click();
  await expect(page.locator(".kc-main")).not.toHaveAttribute("inert", "");
  await expect(page.locator(".kc-opening")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("opened.png") });

  const dimensions = await page.evaluate(() => ({
    documentHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    overflow: getComputedStyle(document.documentElement).overflowY,
    horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(dimensions.documentHeight).toBeGreaterThan(dimensions.viewportHeight * 2);
  expect(dimensions.overflow).not.toBe("hidden");
  expect(dimensions.horizontalOverflow).toBeLessThanOrEqual(1);

  if (mobile) {
    const cdp = await page.context().newCDPSession(page);
    const x = Math.floor(page.viewportSize().width / 2);
    const dispatch = (type, y) => cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
    await dispatch("touchStart", 700);
    for (const y of [620, 540, 460, 380, 300, 220]) {
      await dispatch("touchMove", y);
      await page.waitForTimeout(20);
    }
    await dispatch("touchEnd", 220);
  } else {
    await page.mouse.wheel(0, 650);
  }

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect(page.locator(".kc-schedule__item")).toHaveCount(9);
});
