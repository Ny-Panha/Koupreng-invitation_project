// Final emitted JS/CSS inventory. These totals are not initial route payloads.
// Run after the final capture rebuilds; timing samples remain in lab-summary.json.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const patch = execFileSync('git', ['diff', '--binary', '--', 'apps/frontend-user/src', 'apps/frontend-admin/src'], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
const records = [];
for (const stage of ['before', 'after']) for (const app of ['user', 'admin']) {
  const dir = path.join(root, 'output/playwright/uxui-phase05-2026-11-11', stage, `${app}-build`, 'assets');
  const assets = fs.readdirSync(dir, { recursive: true }).filter(name => /\.(?:js|css)$/.test(name)).sort().map(name => {
    const bytes = fs.readFileSync(path.join(dir, name));
    return { file: `assets/${name.replaceAll('\\', '/')}`, bytes: bytes.length,
      gzip: zlib.gzipSync(bytes).length, brotli: zlib.brotliCompressSync(bytes).length, sha256: hash(bytes) };
  });
  records.push({ stage, app, assetCount: assets.length,
    rawBytes: assets.reduce((sum, row) => sum + row.bytes, 0),
    gzipBytes: assets.reduce((sum, row) => sum + row.gzip, 0),
    brotliBytes: assets.reduce((sum, row) => sum + row.brotli, 0),
    assetListSha256: hash(JSON.stringify(assets)), entry: assets.filter(row => row.file.startsWith('assets/index-')) });
}
const result = {
  baseSha: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(),
  trackedAppPatchSha256: hash(patch),
  qualification: 'Final capture builds after drawer shadow and automatic admin entrance corrections. Navigation timing samples were measured before these final CSS changes; all emitted assets are not initial payload.',
  records,
};
fs.writeFileSync(path.join(import.meta.dirname, 'final-build-assets.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(records.map(({ stage, app, assetCount, rawBytes, gzipBytes, brotliBytes }) => ({ stage, app, assetCount, rawBytes, gzipBytes, brotliBytes }))));
