import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const metadataUrl = 'https://nvd.nist.gov/feeds/json/cve/2.0/nvdcve-2.0-modified.meta';
const maxAgeMs = 4 * 60 * 60 * 1000;
const clockToleranceMs = 5 * 60 * 1000;

export function assertFreshMetadata(metadata, now = Date.now()) {
  const dates = metadata.split(/\r?\n/)
    .filter(line => line.startsWith('lastModifiedDate:'))
    .map(line => line.slice('lastModifiedDate:'.length).trim());
  if (dates.length !== 1 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(dates[0])) {
    throw new Error('NVD feed metadata must contain one valid lastModifiedDate with a timezone.');
  }
  const modified = Date.parse(dates[0]);
  const age = now - modified;
  if (!Number.isFinite(modified) || age < -clockToleranceMs || age > maxAgeMs) {
    throw new Error(`NVD feed timestamp ${dates[0]} is invalid, in the future, or older than four hours.`);
  }
  return dates[0];
}

export async function checkFeedFreshness(fetchMetadata = fetch) {
  const response = await fetchMetadata(metadataUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`NVD feed metadata download failed: HTTP ${response.status}.`);
  return assertFreshMetadata(await response.text());
}

export async function selectAuditSource(fetchMetadata = fetch) {
  try {
    return { source: 'feed', timestamp: await checkFeedFreshness(fetchMetadata) };
  } catch (error) {
    // A stale/unavailable feed cannot authorize a scan. CI must refresh through
    // the live API before evaluating dependencies instead.
    return { source: 'api', reason: error.message };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.includes('--select-source')) {
      const result = await selectAuditSource();
      console.log(result.source === 'feed'
        ? `Official NVD feed is current: ${result.timestamp}`
        : `NVD feed cannot authorize auditing: ${result.reason} A live NVD API refresh is required.`);
      if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `source=${result.source}\n`);
      }
    } else {
      console.log(`Official NVD feed is current: ${await checkFeedFreshness()}`);
    }
  } catch (error) {
    console.error(`NVD vulnerability audit cannot proceed: ${error.message}`);
    process.exitCode = 1;
  }
}
