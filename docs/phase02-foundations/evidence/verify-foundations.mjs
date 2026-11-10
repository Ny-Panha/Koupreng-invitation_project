// Read-only verification of the retained Phase 01 migration inventory and build artifacts.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file));
const inventory = JSON.parse(read('docs/audits/phase01-2026-11-10/evidence/migration-inventory.json'));
const migrations = inventory.map(row => ({ file: row.file, unchanged: createHash('sha256').update(read(row.file)).digest('hex') === row.sha256 }));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const base = 'output/playwright/phase02-foundations';
const built = app => {
  const folder = `${base}/${app}-build`;
  const html = read(`${folder}/index.html`).toString();
  const js = html.match(/assets\/(index-[\w-]+\.js)/)[1];
  const css = html.match(/assets\/(index-[\w-]+\.css)/)[1];
  const source = read(`${folder}/assets/${js}`).toString();
  return { folder, js, css, studio: source.match(/AdminTemplateEditPage-[\w-]+\.js/)?.[0], studioCss: source.match(/AdminTemplateEditPage-[\w-]+\.css/)?.[0] };
};
const user = built('user'), admin = built('admin');
const artifact = (folder, file) => {
  if (!file) return { file: null, bytes: 0, gzipBytes: 0 };
  const data = read(`${folder}/assets/${file}`);
  return { file, bytes: data.length, gzipBytes: gzipSync(data).length };
};
const comparison = (label, folder, before, after) => {
  const previous = artifact(folder, before), current = artifact(folder, after);
  return { label, before: previous, after: current, deltaBytes: current.bytes - previous.bytes, deltaGzipBytes: current.gzipBytes - previous.gzipBytes };
};
const result = {
  branch: git('branch', '--show-current'), commit: git('rev-parse', 'HEAD'),
  migrationCount: migrations.length, changedMigrations: migrations.filter(row => !row.unchanged),
  protectedTrackedChanges: git('diff', '--name-only', '--', 'apps/backend', 'apps/telegram-worker', '**/package.json', '**/package-lock.json'),
  bundleConditions: 'Same Vite production build mode and loopback preview configuration. Before assets are the retained first source build used by the six failing baseline tests; after assets are resolved from the current built HTML/entry. Compressed with Node gzipSync defaults, not measured transfer or field CWV. Cached older hashed files are excluded.',
  bundles: [
    comparison('user entry JS', user.folder, 'index-pJe8AV10.js', user.js),
    comparison('user global CSS', user.folder, 'index-C5b9iP70.css', user.css),
    comparison('admin entry JS', admin.folder, 'index-DMmPypWZ.js', admin.js),
    comparison('admin global CSS', admin.folder, 'index-C4jY52LC.css', admin.css),
    comparison('admin Studio lazy JS', admin.folder, 'AdminTemplateEditPage-Cuv-H32z.js', admin.studio),
    comparison('admin Studio lazy CSS', admin.folder, null, admin.studioCss),
  ],
};
fs.writeFileSync(path.join(root, 'docs/phase02-foundations/evidence/compatibility-and-bundles.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (result.changedMigrations.length || result.protectedTrackedChanges) process.exitCode = 1;
