import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

test('local compose resolves to a non-bootstrap development stack', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'koupreng-config-test-'));
  try {
    const environmentFile = join(temporary, 'test.env');
    const isolated = {
      DB_PASSWORD: 'fixture-only', MYSQL_ROOT_PASSWORD: 'fixture-only', JWT_SECRET: 'x'.repeat(64),
      ADMIN_PAYMENT_SECRET: 'fixture-only', TELEGRAM_BOT_TOKEN: 'fixture-only',
      TELEGRAM_WEBHOOK_SECRET: 'fixture-only', ABA_PAYWAY_STATIC_LINK: 'https://example.test/pay',
    };
    writeFileSync(environmentFile, Object.entries(isolated).map(([name, value]) => `${name}=${value}`).join('\n'));
    // Capture resolved configuration privately; print no environment/config values.
    const composed = JSON.parse(execFileSync('docker', [
      'compose', '--env-file', environmentFile, '-f', join(root, 'docker-compose.yml'), 'config', '--format', 'json',
    ], { encoding: 'utf8', env: { ...process.env, ...isolated } }));
    assert.equal(composed.services.backend.environment.SPRING_PROFILES_ACTIVE, 'dev');
    assert.equal(String(composed.services.backend.environment.DEV_SAMPLE_DATA_ENABLED), 'false');
    assert.equal(String(composed.services.backend.environment.FIRST_USER_ADMIN_ENABLED), 'false');
    assert.equal(String(composed.services.backend.environment.AUTO_CONFIRM_TELEGRAM_DETECTED), 'false');
    assert.ok(composed.services.backend.depends_on.mysql);
    assert.ok(composed.services.backend.depends_on.redis);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test('gateway grants camera only to its own origin', () => {
  const config = readFileSync(join(root, 'infra/nginx/docker/gateway.conf.template'), 'utf8');
  const policies = [...config.matchAll(/add_header Permissions-Policy "([^"]+)" always;/g)].map(match => match[1]);
  assert.ok(policies.length > 0);
  for (const policy of policies) {
    assert.match(policy, /(?:^|,\s*)camera=\(self\)(?:,|$)/);
    assert.match(policy, /microphone=\(\)/);
    assert.doesNotMatch(policy, /camera=\(\*\)/);
  }
});

test('Windows launcher forwards supported help without starting services', { skip: process.platform !== 'win32' }, () => {
  const result = execFileSync('powershell.exe', ['-NoProfile', '-File', join(root, 'run-local-stack.ps1'), '-Help'], {
    encoding: 'utf8',
  });
  assert.match(result, /Usage:/);
  for (const option of ['AdminOnly', 'UserOnly', 'Ngrok', 'NoNgrok', 'Bot', 'NewWindow', 'Help']) {
    assert.match(result, new RegExp(option));
  }
  const target = join(root, 'scripts/maintenance/dev/dev.ps1');
  const targetSource = readFileSync(target, 'utf8');
  assert.match(targetSource, /Join-Path \$ScriptDir "\.\.\\\.\.\\\.\."/);
});
