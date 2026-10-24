import { test, expect } from '@playwright/test';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';
import { fixtureToken } from './support/fixtureToken.js';
test.use({ reducedMotion: 'reduce' });

async function teams(page) {
  const fixture = await installIdentityFixtures(page);
  Object.assign(fixture.events.get(101), { organizationId: null, updatedAt: '2026-10-24T08:00:00Z' });
  const org = { id: 10, name: 'Fictional planning team', ownerUserId: 7, slug: 'fictional-team', status: 'ACTIVE', members: [{ id: 1, userId: 7, email: 'audit@example.test', role: 'OWNER', status: 'ACTIVE' }] };
  const links = [];
  await page.route('**/api/v1/organizations**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    let data = path === '/api/v1/organizations' ? [org] : org;
    if (request.method() === 'POST' && path.endsWith('/members')) {
      const input = request.postDataJSON();
      const member = { id: 2, email: input.email, role: input.role, status: 'INVITED' }; org.members.push(member);
      data = { ...member, invitationToken: '0'.repeat(64) };
    }
    await route.fulfill({ status: request.method() === 'POST' ? 201 : 200, contentType: 'application/json', body: JSON.stringify({ data }) });
  });
  await page.route('**/api/v1/invitations/101/access', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: { owner: true, permissions: ['VIEW_EVENT','MANAGE_MEMBERS'], ownerFeatures: ['TEAM_MEMBERS'] } }) }));
  await page.route('**/api/v1/invitations/101/team', async route => {
    const body = route.request().postDataJSON(); links.push(body);
    Object.assign(fixture.events.get(101), { organizationId: body.organizationId, updatedAt: '2026-10-24T09:00:00Z' });
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: fixture.events.get(101) }) });
  });
  return { ...fixture, org, links };
}

test('team invitation stays pending and exposes its code only in the creation result', async ({ page }, info) => {
  const fixture = await teams(page);
  await page.goto('/app/organizations/10', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Invite member', exact: true }).click();
  await page.getByLabel('Member email').fill('invited@example.test');
  await page.getByRole('button', { name: 'Create invitation code' }).click();
  const code = page.getByLabel('One-time invitation code');
  await expect(code).toHaveValue('0'.repeat(64));
  await expect(page.getByText(/No email has been sent/)).toBeVisible();
  expect(fixture.org.members.at(-1).status).toBe('INVITED');
  await page.screenshot({ path: info.outputPath('team-invitation-created.png'), mask: [code], fullPage: true });
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('invited@example.test', { exact: true })).toBeVisible();
  await expect(page.getByLabel('One-time invitation code')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('0'.repeat(64));
});

test('event team linking requires review and carries the server revision at 390px', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const fixture = await teams(page);
  await page.goto('/app/events/101/team', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Linked team').selectOption('10');
  await page.getByRole('button', { name: 'Review team change' }).click();
  await expect(page.getByRole('dialog', { name: 'Confirm team change' })).toBeVisible();
  expect(fixture.links).toHaveLength(0);
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Confirm team change' })).toHaveCount(0);
  expect(fixture.links).toEqual([{ organizationId: 10, expectedUpdatedAt: '2026-10-24T08:00:00Z' }]);
  await expect(page.getByRole('link', { name: 'View linked team' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('linked-event-team-390.png'), fullPage: true });
});

test('check-in staff use a limited roster and record attendance without private guest or gift tools', async ({ page }, info) => {
  await installIdentityFixtures(page);
  await page.addInitScript(token => sessionStorage.setItem('koupreng.auth', JSON.stringify({ accessToken: token, user: { id: 8, fullName: 'Fictional check-in staff', email: 'staff@example.test', role: 'USER' } })), fixtureToken);
  let privateGuestReads = 0;
  const checkIns = [];
  const reply = (route, data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/me')) return reply(route, { id: 8, fullName: 'Fictional check-in staff', role: 'USER' });
    if (path === '/api/v1/invitations/101/access') return reply(route, { owner: false, permissions: ['VIEW_EVENT','MANAGE_CHECKIN'], ownerFeatures: ['TEAM_MEMBERS','QR_CHECK_IN'] });
    if (path === '/api/v1/invitations/101/guests') { privateGuestReads++; return reply(route, null, 403); }
    if (path.endsWith('/check-in/roster')) return reply(route, { items: [{ id: 501, guestName: 'Roster-only guest', tableNumber: 'Lotus 4', seatCount: 2 }], page: 0, size: 50, totalElements: 1, totalPages: 1 });
    if (path.endsWith('/check-in/summary')) return reply(route, { totalGuests: 1, checkedIn: checkIns.length, remaining: 1 - checkIns.length });
    if (path.endsWith('/check-in/list')) return reply(route, checkIns);
    if (path.endsWith('/guests/501/check-in') && route.request().method() === 'POST') {
      const row = { id: 900, guestId: 501, guestName: 'Roster-only guest', source: 'MANUAL', alreadyCheckedIn: false }; checkIns.push(row); return reply(route, row);
    }
    return route.fallback();
  });
  await page.goto('/app/events/101/check-in', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('region', { name: 'Limited attendance roster' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add walk-in guest' })).toHaveCount(0);
  await expect(page.getByRole('spinbutton', { name: 'Gift amount (optional)' })).toHaveCount(0);
  await page.getByRole('row', { name: /Roster-only guest/ }).getByRole('button', { name: 'Check in', exact: true }).click();
  await expect.poll(() => checkIns.length).toBe(1);
  await expect(page.getByRole('spinbutton', { name: 'Gift amount', exact: true })).toHaveCount(0);
  expect(privateGuestReads).toBe(0);
  await page.screenshot({ path: info.outputPath('staff-attendance-without-finances.png'), fullPage: true });
});
