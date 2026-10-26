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
