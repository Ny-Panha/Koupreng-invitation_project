import { readFile } from 'node:fs/promises';
import { installPhase4Fixtures } from './phase4Fixtures.js';

// Fictional, stateful browser contracts. Backend HTTP/JPA/MySQL certification runs separately.
export async function installPhase5Fixtures(page, { lang = 'en', empty = false, count = 8 } = {}) {
  const state = await installPhase4Fixtures(page, { lang, count: empty ? 0 : count });
  state.gifts = empty ? [] : [{ id: 601, name: 'Fictional contributor A', amount: 25, currency: 'USD', method: 'Cash', date: '2026-10-20', note: 'Fictional record' }, { id: 602, name: 'Fictional contributor B', amount: 40000, currency: 'KHR', method: 'ABA', date: '2026-10-21', note: 'Manual bookkeeping only' }];
  state.expenses = empty ? [] : [{ id: 801, itemName: 'Fictional venue', category: 'Venue & Transport', estimatedCost: 100, actualCost: 40, currency: 'USD', date: '2026-10-20' }, { id: 802, itemName: 'Fictional flowers', category: 'Decor & Flowers', estimatedCost: 200000, actualCost: 60000, currency: 'KHR', date: '2026-10-21' }];
  state.giftReceipts = new Map(); state.giftRequests = []; state.loseGiftResponse = false;
  const qr = `data:image/png;base64,${(await readFile(new URL('./fixtures/general-qr.png', import.meta.url))).toString('base64')}`;
  await page.route('**/api/v1/invitations/101/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname.replace('/api/v1/invitations/101/', '');
    const reply = (data, status = 200) => route.fulfill({ status, json: { data } });
    if (path === 'qr') return reply({ title: 'Fictional celebration', invitationUrl: 'https://koupreng.example/i/audit-event', qrPayload: 'https://koupreng.example/i/audit-event', tokenType: 'INVITATION', qrCodeDataUri: qr });
    if (path === 'gifts') {
      if (req.method() === 'GET') return reply(state.gifts);
      const body = req.postDataJSON(); state.giftRequests.push(body);
      if (!state.giftReceipts.has(body.clientRequestId)) {
        const gift = { ...body, id: 700 + state.gifts.length };
        state.gifts.unshift(gift); state.giftReceipts.set(body.clientRequestId, gift);
      }
      if (state.loseGiftResponse) { state.loseGiftResponse = false; return route.abort('failed'); }
      return reply(state.giftReceipts.get(body.clientRequestId), 201);
    }
    if (/^gifts\/\d+$/.test(path)) {
      const id = Number(path.split('/')[1]);
      if (req.method() === 'DELETE') { state.gifts = state.gifts.filter(gift => gift.id !== id); return reply(null); }
      const index = state.gifts.findIndex(gift => gift.id === id); state.gifts[index] = { ...state.gifts[index], ...req.postDataJSON() }; return reply(state.gifts[index]);
    }
    if (path === 'budget-items') {
      if (req.method() === 'GET') return reply(state.expenses);
      const expense = { ...req.postDataJSON(), id: 900 + state.expenses.length }; state.expenses.push(expense); return reply(expense, 201);
    }
    if (/^budget-items\/\d+$/.test(path)) {
      const id = Number(path.split('/')[1]);
      if (req.method() === 'DELETE') { state.expenses = state.expenses.filter(item => item.id !== id); return reply(null); }
      const index = state.expenses.findIndex(item => item.id === id); state.expenses[index] = { ...state.expenses[index], ...req.postDataJSON() }; return reply(state.expenses[index]);
    }
    if (path === 'budget') return reply({ items: state.expenses });
    return route.fallback();
  });
  await page.route('**/api/v1/invitations/101', async route => {
    if (route.request().method() !== 'PUT') return route.fallback();
    state.eventOverrides = { ...state.eventOverrides, ...route.request().postDataJSON() };
    return route.fulfill({ json: { data: { ...state.eventOverrides, id: 101 } } });
  });
  return state;
}
