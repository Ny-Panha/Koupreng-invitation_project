import { test, expect } from '@playwright/test';
import { routeContracts, installRouteContractFixtures, assertRouteContract } from './support/batch12RouteContracts.js';

// Respect each project viewport: a mobile project must exercise mobile controls.
for (const contract of routeContracts) {
  test(`${contract.application} ${contract.pattern}: ${contract.group}`, async ({ page }, info) => {
    const state = await installRouteContractFixtures(page, contract);
    await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
      ? route.fallback() : route.request().resourceType() === 'stylesheet'
        ? route.fulfill({ body: '', contentType: 'text/css' }) : route.abort());
    const origin = `http://127.0.0.1:${contract.application === 'frontend-admin' ? 4174 : 4173}`;
    await page.goto(origin + contract.concreteUrl, { waitUntil: 'domcontentloaded' });
    await assertRouteContract(page, contract, state);
    expect(state.errors).toEqual([]);
    expect(state.unexpected).toEqual([]);
    await info.attach('leaf-contract', { body: JSON.stringify({ ...contract, smokeStatus: 'PASS', actualUrl: page.url(), api: 'fictional read-only contracts; unknown501/mutations405' }, null, 2), contentType: 'application/json' });
  });
}
