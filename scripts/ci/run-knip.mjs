import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const cliPath = path.resolve(process.cwd(), "node_modules", "knip", "bin", "knip.js");
const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
  env: { ...process.env, KNIP_DISABLE_RAW_TRANSFER: "1" },
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
