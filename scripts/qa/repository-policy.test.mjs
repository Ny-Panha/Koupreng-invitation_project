import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

test('documentation entry point resolves local links and showcase assets', () => {
  const directory = join(root, 'docs');
  const document = readFileSync(join(directory, 'README.md'), 'utf8');
  const links = [...document.matchAll(/\]\(([^)]+)\)|\bsrc="([^"]+)"/g)]
    .map(match => match[1] ?? match[2]).filter(link => !/^(https?:|#|mailto:)/.test(link));
  assert.ok(links.length > 10);
  for (const link of links) {
    assert.ok(existsSync(resolve(directory, link.split('#')[0])), `Missing README target: ${link}`);
  }
});

test('CI action references are immutable and retain readable version comments', () => {
  const workflow = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');
  const references = [...workflow.matchAll(/^\s*uses:\s*([^\s]+)(.*)$/gm)];
  assert.ok(references.length > 10);
  for (const [, reference, comment] of references) {
    if (reference.startsWith('./')) continue;
    assert.match(reference, /^[\w.-]+\/[\w./-]+@[a-f0-9]{40}$/);
    assert.match(comment, /#\s*v\d/);
  }
});

test('scheduled dependency updates cover every application manifest', () => {
  const config = readFileSync(join(root, '.github/dependabot.yml'), 'utf8');
  const manifests = new Map([
    ['github-actions:/', '.github/workflows/ci.yml'],
    ['npm:/apps/frontend-user', 'apps/frontend-user/package.json'],
    ['npm:/apps/frontend-admin', 'apps/frontend-admin/package.json'],
    ['maven:/apps/backend', 'apps/backend/pom.xml'],
    ['pip:/apps/telegram-bot', 'apps/telegram-bot/requirements.txt'],
  ]);
  const blocks = config.split(/\n\s*- package-ecosystem:/).slice(1);
  assert.equal(blocks.length, manifests.size);
  for (const block of blocks) {
    const ecosystem = block.trim().split(/\s/)[0];
    const directory = block.match(/directory:\s*(\S+)/)?.[1];
    const key = `${ecosystem}:${directory}`;
    assert.ok(manifests.has(key), `Unexpected dependency target ${key}`);
    assert.ok(existsSync(join(root, manifests.get(key))));
    assert.match(block, /interval:\s*weekly/);
    assert.match(block, /open-pull-requests-limit:\s*5/);
  }
});
