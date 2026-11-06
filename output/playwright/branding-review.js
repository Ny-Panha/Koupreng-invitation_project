async page => {
  const origin = 'http://127.0.0.1:4173';
  const evidence = [];
  const assetFailures = [];
  page.on('response', response => { if (response.url().includes('/branding/') && response.status() >= 400) assetFailures.push({ url: response.url(), status: response.status() }); });
  await page.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
  await page.addInitScript(() => {
    localStorage.setItem('koupreng.lang', 'en');
    localStorage.setItem('koupreng.colorMode', 'light');
    sessionStorage.removeItem('koupreng.auth');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin + '/');
    await page.locator('.kp-brand .brand-logo img').waitFor();
    await page.locator('.kp-footer .brand-logo').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.brand-logo img')].every(i => i.complete && i.naturalWidth));
    const logos = await page.locator('.brand-logo img').evaluateAll(images => images.map(i => ({ src: i.currentSrc, width: i.getBoundingClientRect().width, height: i.getBoundingClientRect().height, loaded: i.complete && i.naturalWidth > 0 })));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow || logos.some(i => i.width < 100 || Math.abs(i.width / i.height - 1968 / 724) > .05)) throw new Error(JSON.stringify({ width, logos, overflow }));
    await page.screenshot({ path: `output/playwright/branding-footer-${width}.png` });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `output/playwright/branding-header-${width}.png` });
    evidence.push({ surface: 'marketing', width, logos, overflow });
  }
  for (const route of ['/login', '/register', '/forgot-password', '/reset-password', '/brand-review-not-found']) {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(origin + route);
    await page.locator('.brand-logo img').first().waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('.brand-logo img')].every(i => i.complete && i.naturalWidth));
    await page.screenshot({ path: `output/playwright/branding-${route.slice(1)}.png` });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error('Overflow on ' + route);
    evidence.push({ surface: route, overflow });
  }
  // Dark marketing and the mobile menu were inspected separately through their
  // snapshotted controls. Auth retains its existing fixed light surface.
  return { evidence, assetFailures };
}
