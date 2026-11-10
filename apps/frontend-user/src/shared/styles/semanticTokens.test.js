// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { expect, test } from 'vitest';

test('isolated frontend build contexts ship the canonical application token exports', () => {
  const root = fileURLToPath(new URL('../../../../../', import.meta.url));
  const source = readFileSync(path.join(root, 'apps/frontend-user/src/shared/styles/semantic-tokens.css'), 'utf8').replace(/\r\n/g, '\n');
  for (const file of ['apps/frontend-user/src/shared/styles/semantic-tokens.css', 'apps/frontend-admin/src/styles/application-tokens.css']) {
    const compiled = readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
    expect(compiled.slice(compiled.indexOf('\n') + 1), `Run node scripts/sync-design-tokens.cjs for ${file}`).toBe(source.slice(source.indexOf('\n') + 1));
  }
});

test('management text and focus roles retain contrast on their intended surfaces', () => {
  const root = fileURLToPath(new URL('../../../../../', import.meta.url));
  const tokens = readFileSync(path.join(root, 'apps/frontend-user/src/shared/styles/semantic-tokens.css'), 'utf8');
  const admin = readFileSync(path.join(root, 'apps/frontend-admin/src/styles/index.css'), 'utf8');
  const values = source => Object.fromEntries([...source.matchAll(/(--[\w-]+):\s*(#[\da-f]{6})/gi)].map(match => [match[1], match[2]]));
  const light = values(tokens);
  const dark = { ...light, ...values(admin.match(/\.dark\s*\{([^}]+)\}/)[1]) };
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const [name, foreground, background] of [
    ['light muted text', light['--ui-muted'], light['--ui-canvas']],
    ['light warning badge', light['--ui-warning'], light['--ui-warning-soft']],
    ['dark warning badge', dark['--ui-warning'], dark['--ui-warning-soft']],
    ['dark footer', light['--ui-on-dark-muted'], '#121214'],
  ]) expect(ratio(foreground, background), name).toBeGreaterThanOrEqual(4.5);
  expect(ratio(light['--ui-on-dark-focus'], '#18181b')).toBeGreaterThanOrEqual(3);
});
