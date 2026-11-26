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
  const values = source => Object.fromEntries([...source.matchAll(/(--[\w-]+):\s*(#[\da-f]{6})/gi)].map(match => [match[1], match[2]]));
  const light = values(tokens.match(/:root\s*\{([^}]+)\}/)[1]);
  const dark = { ...light, ...values(tokens.match(/:root\.dark,[\s\S]*?\{([^}]+)\}/)[1]) };
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const [name, foreground, background] of [
    ['light muted text', light['--ui-muted'], light['--ui-canvas']],
    ['light warning badge', light['--ui-warning'], light['--ui-warning-soft']],
    ['light management body', light['--ui-theme-ink'], light['--ui-theme-canvas']],
    ['light management action', light['--ui-theme-on-action'], light['--ui-theme-action']],
    ['dark management body', dark['--ui-theme-ink'], dark['--ui-theme-canvas']],
    ['dark management muted', dark['--ui-theme-muted'], dark['--ui-theme-surface']],
    ['dark management action', dark['--ui-theme-on-action'], dark['--ui-theme-action']],
    ['dark management warning', dark['--ui-theme-warning'], dark['--ui-theme-warning-soft']],
    ['dark management danger', dark['--ui-theme-danger'], dark['--ui-theme-danger-soft']],
    ['studio selected control', light['--ui-studio-on-accent'], light['--ui-studio-accent']],
    ['dark footer', light['--ui-on-dark-muted'], '#121214'],
  ]) expect(ratio(foreground, background), name).toBeGreaterThanOrEqual(4.5);
  expect(ratio(dark['--ui-theme-focus'], dark['--ui-theme-surface'])).toBeGreaterThanOrEqual(3);
  expect(ratio(dark['--ui-theme-control-border'], dark['--ui-theme-raised'])).toBeGreaterThanOrEqual(3);
  for (const role of [
    '--ui-theme-canvas', '--ui-theme-surface', '--ui-theme-subtle', '--ui-theme-raised',
    '--ui-theme-hover', '--ui-theme-pressed', '--ui-theme-disabled-bg', '--ui-theme-ink',
    '--ui-theme-muted', '--ui-theme-border', '--ui-theme-control-border',
    '--ui-rail-bg', '--ui-rail-surface', '--ui-rail-hover', '--ui-rail-ink', '--ui-rail-muted', '--ui-rail-border',
    '--ui-studio-canvas', '--ui-studio-panel', '--ui-studio-ink', '--ui-studio-muted', '--ui-studio-border',
  ]) {
    const hex = dark[role];
    expect(hex, `${role} should be defined`).toMatch(/^#[\da-f]{6}$/i);
    expect(hex.slice(1, 3).toLowerCase(), `${role} R=G`).toBe(hex.slice(3, 5).toLowerCase());
    expect(hex.slice(3, 5).toLowerCase(), `${role} G=B`).toBe(hex.slice(5, 7).toLowerCase());
  }
});
