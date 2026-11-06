async page => {
  const context = await page.context().browser().newContext({ deviceScaleFactor: 2 });
  const review = await context.newPage();
  await review.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
  const evidence = [];
  for (const width of [375, 1440]) {
    await review.setViewportSize({ width, height: 900 });
    await review.goto('http://127.0.0.1:4173/');
    await review.locator('.kp-brand .brand-logo img').waitFor();
    await review.waitForFunction(() => document.querySelector('.kp-brand img')?.naturalWidth > 0);
    evidence.push(await review.locator('.kp-brand img').evaluate(i => ({ dpr: devicePixelRatio, width: i.getBoundingClientRect().width, source: i.currentSrc })));
  }
  await review.locator('.kp-brand picture source').evaluateAll(sources => sources.forEach(source => source.remove()));
  await review.waitForFunction(() => document.querySelector('.kp-brand img')?.currentSrc.endsWith('.png') && document.querySelector('.kp-brand img').complete);
  evidence.push(await review.locator('.kp-brand img').evaluate(i => ({ fallback: i.currentSrc, loaded: i.naturalWidth > 0 })));
  await context.close();
  return evidence;
}
