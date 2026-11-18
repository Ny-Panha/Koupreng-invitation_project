// Summarize ignored PNG manifests before committing; never copy local images.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../../..');
const base = path.join(root, 'output/playwright/uxui-phase06-2026-11-17');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim();
const diff = execFileSync('git', ['diff', '--binary'], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
const result = {
  baseSha: '4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4',
  generatedAtSha: sha,
  afterTrackedPatchSha256: crypto.createHash('sha256').update(diff).digest('hex'),
  provenance: 'Before clean baseline; after source is recorded per capture. Current patch hash describes index generation only.',
  stages: {},
};
for (const stage of ['before', 'after']) {
  const rows = JSON.parse(fs.readFileSync(path.join(base, stage, 'manifest.json'), 'utf8'));
  const probes = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `${stage}-shell-probes.json`), 'utf8'));
  fs.writeFileSync(path.join(import.meta.dirname, `${stage}-manifest.json`), JSON.stringify({stage,primary:rows,shellCaptures:probes.captures,actionCaptures:probes.actionCaptures||[],limits:['Paths point to ignored local PNGs; metadata is portable, images are not tracked','Primary captures freeze wall-clock date; shell captures are geometry/state observations, not exact pixel-timing fixtures','Static renderer demo reads intentionally fall back to local registry data after the recorded unmapped slug request; this is not live catalog proof']},null,2)+'\n');
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
console.log(JSON.stringify({ baseSha: result.baseSha, generatedAtSha: sha, patch: result.afterTrackedPatchSha256.slice(0, 12),
  before: result.stages.before.count, after: result.stages.after.count,
  errors: result.stages.before.pageErrors + result.stages.after.pageErrors }));
