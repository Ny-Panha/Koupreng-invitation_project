async (page) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.getByRole("heading", { name: "Garden Royal Khmer Wedding", exact: true }).waitFor();
  await page.locator(".kp-site-preloader").waitFor({ state: "hidden" });
  await page.evaluate(() => document.fonts.ready);
  const results = [];
  const measure = () => page.evaluate(() => {
    const grid = document.querySelector(".pe-summary-grid");
    const main = document.querySelector(".pe-dashboard-page");
    const card = grid.firstElementChild;
    return {
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      gridDisplay: getComputedStyle(grid).display,
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      cardDisplay: getComputedStyle(card).display,
      cardBorder: getComputedStyle(card).borderWidth,
      mainPadding: getComputedStyle(main).padding,
      cardsOverflow: [...grid.children].some((node) => node.scrollWidth > node.clientWidth + 1),
      alerts: [...document.querySelectorAll('[role="alert"]')].map((node) => node.textContent),
    };
  });
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const metrics = await measure();
    const expectedColumns = width > 980 ? 4 : width > 640 ? 2 : 1;
    if (metrics.gridDisplay !== "grid" || metrics.columns !== expectedColumns
        || metrics.cardDisplay !== "flex" || metrics.cardBorder === "0px"
        || metrics.documentWidth > width || metrics.cardsOverflow || metrics.alerts.length) {
      throw new Error(`Dashboard layout failed: ${JSON.stringify(metrics)}`);
    }
    await page.screenshot({ path: `output/playwright/dashboard-after-${width}.png`, fullPage: true });
    results.push(metrics);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const beforeGuestsStyles = await measure();
  await page.evaluate(() => import("/src/features/guests/GuestsPage.css"));
  const afterGuestsStyles = await measure();
  if (JSON.stringify(beforeGuestsStyles) !== JSON.stringify(afterGuestsStyles)) {
    throw new Error(`Guests styles changed dashboard layout: ${JSON.stringify({ beforeGuestsStyles, afterGuestsStyles })}`);
  }
  return { viewports: results, unchangedAfterGuestsStyles: true };
}
