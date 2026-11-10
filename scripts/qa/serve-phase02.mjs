// Isolated, source-built fixtures for Phase 02. No backend or database is started.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const app = process.argv[2];
if (!['user', 'admin'].includes(app)) throw new Error('Expected user or admin');
const appRoot = path.join(root, `apps/frontend-${app}`);
const vite = path.join(appRoot, 'node_modules/vite/bin/vite.js');
const outDir = path.join(root, `output/playwright/phase02-foundations/${app}-build`);
const env = { ...process.env, VITE_USER_APP_URL: 'http://127.0.0.1:4173' };
let child;
const run = args => new Promise((resolve, reject) => {
  child = spawn(process.execPath, [vite, ...args], { cwd: appRoot, env, stdio: 'inherit', windowsHide: true });
  child.on('error', reject);
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Vite ${args[0]} exited ${code}`)));
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { child?.kill(); process.exit(0); });
await run(['build', '--outDir', outDir]);
await run(['preview', '--host', '127.0.0.1', '--port', app === 'user' ? '4173' : '4174', '--strictPort', '--outDir', outDir]);
