import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { inventoryShells } from '../../../../scripts/qa/phase06ShellInventory.mjs';
import AppRouter from './router';

it('exports expanded customer leaf bindings and inherited shell chains for Phase 06 evidence', () => {
  const rows=inventoryShells(AppRouter(),'frontend-user');
  expect(rows).toHaveLength(111);
  const event=rows.find(row=>row.pattern==='/app/events/:eventId/guests');
  expect(event.shells.map(row=>row.name)).toEqual(expect.arrayContaining(['RequireAuth','HostShell','EventWorkspace']));
  expect(event.components.some(row=>row.module?.includes('GuestsPage'))).toBe(true);
  mkdirSync('../../.cache/phase06',{recursive:true});
  writeFileSync('../../.cache/phase06/user-shells.json',JSON.stringify(rows,null,2));
});
