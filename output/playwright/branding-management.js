async page => {
  const user = { id: 7, fullName: 'Brand review host', email: 'review@example.test', role: 'USER' };
  const admin = { ...user, role: 'ADMIN' };
  await page.addInitScript(({ user, admin }) => {
    const token = [btoa(JSON.stringify({ alg: 'none' })), btoa(JSON.stringify({ exp: 4102268800 })), ''].join('.');
    sessionStorage.setItem('koupreng.auth', JSON.stringify({ accessToken: token, user }));
    localStorage.setItem('koupreng.admin.auth', JSON.stringify({ accessToken: token, user: admin }));
    localStorage.setItem('koupreng.lang', 'en');
  }, { user, admin });
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: path.endsWith('/me') ? user : [] }) });
  });
  const evidence = [];
  for (const [app, origin, route] of [['host', 'http://127.0.0.1:4173', '/app/events'], ['admin', 'http://127.0.0.1:4174', '/dashboard']]) {
    for (const width of [320, 375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + route);
      await page.locator('.brand-logo img').first().waitFor();
      await page.waitForFunction(() => [...document.querySelectorAll('.brand-logo img')].every(i => i.complete && i.naturalWidth));
      await page.screenshot({ path: `output/playwright/branding-${app}-${width}.png` });
      evidence.push(await page.evaluate(({ app, width }) => {
        const image = document.querySelector('.brand-logo img');
        return { app, width, logo: image.getBoundingClientRect().toJSON(), overflow: document.documentElement.scrollWidth > innerWidth,
          controls: [...document.querySelectorAll('header button,header select')].filter(e => e.getClientRects().length).map(e => ({ label: e.getAttribute('aria-label'), left: e.getBoundingClientRect().left, right: e.getBoundingClientRect().right })) };
      }, { app, width }));
    }
  }
  await page.goto('http://127.0.0.1:4174/login');
  await page.locator('.brand-logo img').waitFor();
  await page.screenshot({ path: 'output/playwright/branding-admin-login.png' });
  return evidence;
}
