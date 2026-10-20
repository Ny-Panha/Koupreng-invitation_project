import { performance } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';

// GET-only, loopback-only experiment. Never point this at customer invitations.
const [url, output] = process.argv.slice(2);
const target = new URL(url);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.username || target.password || target.search) {
  throw new Error('Use a loopback URL without credentials or query tokens');
}
if (!output) throw new Error('Provide an output JSON path');
let expected;
async function request() {
  const start = performance.now();
  try {
    const response = await fetch(target, { signal: AbortSignal.timeout(10000) });
    const body = await response.json();
    if (!response.ok || !body.success || !body.data || !Number.isInteger(body.data.totalGuests)) {
      throw new Error(`Unexpected response status/body (${response.status})`);
    }
    const data = JSON.stringify(body.data);
    if (expected == null) expected = data;
    if (data !== expected) throw new Error('Summary changed during the read experiment');
    return { ms: performance.now() - start, error: null };
  } catch (error) {
    return { ms: performance.now() - start, error: error.message };
  }
}
for (let i = 0; i < 20; i++) {
  const result = await request();
  if (result.error) throw new Error(`Warm-up failed: ${result.error}`);
}
const measurements = [];
for (const concurrency of [1, 4, 8]) {
  for (let round = 0; round < 3; round++) {
    const results = [];
    let next = 0;
    const start = performance.now();
    await Promise.all(Array.from({ length: concurrency }, async () => {
      while (next++ < 100) results.push(await request());
    }));
    const durationSeconds = (performance.now() - start) / 1000;
    const timings = results.map(r => r.ms).sort((a, b) => a - b);
    const errors = results.filter(r => r.error).map(r => r.error);
    const measurement = { concurrency, round, requests: results.length, durationSeconds,
      requestsPerSecond: results.length / durationSeconds,
      p50Ms: timings[49], p95Ms: timings[94], p99Ms: timings[98],
      errorRate: errors.length / results.length, errors };
    measurements.push(measurement);
    console.log(JSON.stringify(measurement));
  }
}
await writeFile(output, JSON.stringify({ path: target.pathname, warmup: 20, expected: JSON.parse(expected), measurements }, null, 2));
if (measurements.some(m => m.errorRate !== 0)) process.exitCode = 1;
