import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('dependency false-positive suppression is scoped to the resolved Boot version and expires', () => {
  const pom = readFileSync(new URL('../../apps/backend/pom.xml', import.meta.url), 'utf8');
  const version = pom.match(/<parent>[\s\S]*?<version>([^<]+)<\/version>/)[1];
  const suppressions = readFileSync(new URL('../../apps/backend/dependency-check-suppressions.xml', import.meta.url), 'utf8');
  const rules = [...suppressions.matchAll(/<suppress until="([^"]+)">([\s\S]*?)<\/suppress>/g)];
  assert.equal(rules.length, 1, 'Every exception must have an explicit reviewed expiry');
  const [, until, rule] = rules[0];
  assert.ok(Date.parse(until) > Date.now(), 'Suppression expired: revalidate against the vendor advisory');
  const pattern = rule.match(/<packageUrl regex="true">([^<]+)<\/packageUrl>/)[1];
  const matcher = new RegExp(pattern);
  assert.ok(matcher.test(`pkg:maven/org.springframework.boot/spring-boot-devtools@${version}`));
  for (const other of ['spring-core', 'spring-boot', 'spring-boot-starter-web']) {
    assert.equal(matcher.test(`pkg:maven/org.springframework.boot/${other}@${version}`), false);
  }
  assert.equal(matcher.test('pkg:maven/org.springframework.boot/spring-boot-devtools@99.0.0'), false);
  assert.match(rule, /<cve>CVE-2022-31691<\/cve>/);
  assert.equal([...rule.matchAll(/<cve>/g)].length, 1);
  assert.match(rule, /https:\/\/spring.io\/security\/cve-2022-31691/);
  assert.match(pom, /<failBuildOnCVSS>8<\/failBuildOnCVSS>/);
  assert.match(pom, /<nvdValidForHours>0<\/nvdValidForHours>/);
});

test('only the canonical Scalar documentation UI is packaged', () => {
  const pom = readFileSync(new URL('../../apps/backend/pom.xml', import.meta.url), 'utf8');
  assert.match(pom, /<artifactId>springdoc-openapi-starter-webmvc-scalar<\/artifactId>/);
  assert.doesNotMatch(pom, /<artifactId>(?:springdoc-openapi-starter-webmvc-ui|swagger-ui)<\/artifactId>/);
});
