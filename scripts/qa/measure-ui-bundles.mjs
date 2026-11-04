import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const phase = process.argv[2];
if (!["before", "after"].includes(phase)) throw new Error("Usage: node scripts/qa/measure-ui-bundles.mjs before|after");
const report = {};
for (const app of ["frontend-user", "frontend-admin"]) {
  const directory = path.join(root, "apps", app, "dist", "assets");
  report[app] = [];
  for (const name of (await readdir(directory)).filter(name => /^index-.*\.(js|css)$/.test(name))) {
    const content = await readFile(path.join(directory, name));
    report[app].push({ name, bytes: content.length, gzipBytes: gzipSync(content).length });
  }
}
const destination = path.join(root, "docs/qa/premium-modernization", phase);
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, "bundle-sizes.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
