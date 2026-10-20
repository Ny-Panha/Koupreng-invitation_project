import { createServer } from "../../apps/frontend-user/node_modules/vite/dist/node/index.js";
import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import { fixtures } from "../../apps/frontend-user/tests/e2e/support/studioFixtures.js";
import { execFileSync } from "node:child_process";
import process from "node:process";
import path from "node:path";
const root = process.cwd();
const server = await createServer({ root: path.join(root, "apps/frontend-user"), cacheDir: path.join(root, ".cache/studio-before-vite"), configFile: path.join(root, "apps/frontend-user/vite.config.js"),
  plugins: [{ name: "audited-editor-baseline", enforce: "pre", load(id) {
    const suffix = id.replaceAll("\\", "/").split("?")[0];
    for (const file of ["InvitationForm.jsx", "LivePhoneSimulator.jsx"]) if (suffix.endsWith(`/features/invitations/${file}`))
      return execFileSync("git", ["show", `715b85ef:apps/frontend-user/src/features/invitations/${file}`], { cwd: root, encoding: "utf8", maxBuffer: 5_000_000 });
  } }], server: { host: "127.0.0.1", port: 5185, strictPort: true }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch();
process.chdir(path.join(root, "apps/frontend-user"));
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.on("pageerror", error => console.log("Baseline browser error:", error.message));
  page.on("console", message => { if (message.type() === "error") console.log("Baseline console:", message.text().slice(0, 200)); });
  await fixtures(page);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("http://127.0.0.1:5185/app/events/101/invitation");
    await page.locator(".pe-editor-root").waitFor({ timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(root, `docs/qa/studio-tickets/before-editor-${width}.png`), fullPage: true });
    console.log(`Captured original editor at ${width}px from 715b85ef`);
  }
} finally { await browser.close(); await server.close(); }
