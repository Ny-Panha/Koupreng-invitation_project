const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'apps/frontend-user/src/shared/styles/semantic-tokens.css'), 'utf8').replace(/\r\n/g, '\n').split('\n').slice(1).join('\n');
const output = '/* Shared application tokens. Edit apps/frontend-user/src/shared/styles/semantic-tokens.css; sync with node scripts/sync-design-tokens.cjs. */\n' + source;
const targets = ['apps/frontend-user/src/shared/styles/semantic-tokens.css', 'apps/frontend-admin/src/styles/application-tokens.css'];
for (const target of targets) {
  const filename = path.join(root, target);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(filename) || fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== output.replace(/\r\n/g, '\n')) throw new Error(`Design tokens drifted: ${target}. Run node scripts/sync-design-tokens.cjs.`);
  } else fs.writeFileSync(filename, output);
}
console.log(`${process.argv.includes('--check') ? 'Verified' : 'Generated'} ${targets.length} application token exports.`);
