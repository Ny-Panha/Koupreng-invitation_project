import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { inventoryShells } from '../../../../scripts/qa/phase06ShellInventory.mjs';
import App from './App';

it('exports admin shell chains while preserving standalone guarded Studio', () => {
  const rows=inventoryShells(App(),'frontend-admin');
  expect(rows).toHaveLength(24);
  const studio=rows.find(row=>row.pattern==='/templates/:templateId');
  expect(studio.components.map(row=>row.name)).toEqual(expect.arrayContaining(['RequireAdmin','AdminTemplateEditPage']));
  expect(studio.shells.some(row=>row.name==='AdminLayout')).toBe(false);
  mkdirSync('../../.cache/phase06',{recursive:true});
  writeFileSync('../../.cache/phase06/admin-shells.json',JSON.stringify(rows,null,2));
});
