// Final emitted JS/CSS inventory. These totals are not initial route payloads.
// Run after the final capture rebuilds; timing samples remain in lab-summary.json.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../../..');
const base = path.join(root,'output/playwright/uxui-phase06-2026-11-17');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const patch = execFileSync('git', ['diff', '--binary', '--', 'apps/frontend-user/src', 'apps/frontend-admin/src'], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
const records = [];
for (const stage of ['before', 'after']) for (const app of ['user', 'admin']) {
  const dir = path.join(root, 'output/playwright/uxui-phase06-2026-11-17', stage, `${app}-build`, 'assets');
  const assets = fs.readdirSync(dir, { recursive: true }).filter(name => /\.(?:js|css)$/.test(name)).sort().map(name => {
    const bytes = fs.readFileSync(path.join(dir, name));
    return { file: `assets/${name.replaceAll('\\', '/')}`, bytes: bytes.length,
      gzip: zlib.gzipSync(bytes).length, brotli: zlib.brotliCompressSync(bytes).length, sha256: hash(bytes) };
  });
  records.push({ stage, app, assetCount: assets.length,
    rawBytes: assets.reduce((sum, row) => sum + row.bytes, 0),
    gzipBytes: assets.reduce((sum, row) => sum + row.gzip, 0),
    brotliBytes: assets.reduce((sum, row) => sum + row.brotli, 0),
    assetListSha256: hash(JSON.stringify(assets)), assets, entry: assets.filter(row => row.file.startsWith('assets/index-')) });
}
const result = {
  baseSha: '4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4',
  generatedAtSha: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(),
  afterProductionSourceSha: JSON.parse(fs.readFileSync(path.join(base,'after/manifest.json'),'utf8'))[0].sha,
  trackedAppPatchSha256: hash(patch),
  baselineSourceSha: '4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4',
  qualification: 'Phase 06 matched isolated before/after builds. Final timing run must follow the final after capture build. All emitted assets are distinct from per-navigation initial request bytes; see lab-results and performance-comparison.',
  records,
};
fs.writeFileSync(path.join(import.meta.dirname, 'final-build-assets.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(records.map(({ stage, app, assetCount, rawBytes, gzipBytes, brotliBytes }) => ({ stage, app, assetCount, rawBytes, gzipBytes, brotliBytes }))));
