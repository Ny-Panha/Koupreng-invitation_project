// Summarize ignored PNG manifests before committing; never copy local images.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../../..');
const base = path.join(root, 'output/playwright/uxui-phase05-2026-11-11');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim();
const diff = execFileSync('git', ['diff', '--binary'], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
const result = {
  baseSha: sha,
  afterTrackedPatchSha256: crypto.createHash('sha256').update(diff).digest('hex'),
  provenance: 'before builds were produced from clean base SHA; after builds from listed tracked worktree patch before commit',
  stages: {},
};
for (const stage of ['before', 'after']) {
  const rows = JSON.parse(fs.readFileSync(path.join(base, stage, 'manifest.json'), 'utf8'));
  result.stages[stage] = {
    count: rows.length,
    pageErrors: rows.reduce((sum, row) => sum + row.errors.length, 0),
    writes: rows.reduce((sum, row) => sum + row.writes.length, 0),
    unexpectedReads: rows.reduce((sum, row) => sum + row.unexpectedReads.length, 0),
    screens: rows.map(row => ({ name: `${row.key || row.group}-${row.width}-${row.mode}.png`,
      app: row.application, pathname: row.pathname, width: row.width, locale: row.locale,
      motion: row.motion, fixture: row.fixture, screenshot: row.screenshot,
      capturedAt: row.capturedAt, pageErrors: row.errors.length, writes: row.writes.length,
      unexpectedReads: row.unexpectedReads.length })),
  };
}
fs.writeFileSync(path.join(import.meta.dirname, 'capture-index.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ baseSha: sha, patch: result.afterTrackedPatchSha256.slice(0, 12),
  before: result.stages.before.count, after: result.stages.after.count,
  errors: result.stages.before.pageErrors + result.stages.after.pageErrors }));
