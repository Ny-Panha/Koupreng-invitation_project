import { routeContracts, installRouteContractFixtures } from './batch12RouteContracts.js';

export async function openPhase06Fixture(page, group, { app = 'frontend-user', lang = 'en', path, mode = 'light', anonymous = false } = {}) {
  const contract = routeContracts.find(row => row.group === group && row.application === app);
  if (!contract) throw new Error(`No fixture for ${app}/${group}`);
  const state = await installRouteContractFixtures(page, contract, { lang });
  await page.addInitScript(({ mode, anonymous }) => {
    localStorage.setItem('theme', mode);
    localStorage.setItem('koupreng.colorMode', mode);
    if (anonymous) for (const store of [localStorage, sessionStorage]) {
      store.removeItem('koupreng.auth'); store.removeItem('koupreng.admin.auth');
    }
  }, { mode, anonymous });
  if (group === 'admin-template-edit') {
    const template = { id: 30, code: 'event-essential', name: 'Navigation fixture', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
      description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
    for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
      await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
    }
  }
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
    ? route.fallback() : route.request().resourceType() === 'stylesheet' ? route.fulfill({ body: '', contentType: 'text/css' }) : route.abort());
  await page.goto(`${app === 'frontend-admin' ? 'http://127.0.0.1:4174' : 'http://127.0.0.1:4173'}${path || contract.concreteUrl}`);
  return state;
}

export async function centerHit(locator) {
  await locator.scrollIntoViewIfNeeded();
  return locator.evaluate(element => {
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return !!hit && (hit === element || element.contains(hit));
  });
}
