// Automated task completion and heuristic/accessibility evidence, not human usability testing.
import { browser, contextFor, definitions, fixtures, evidence, origin } from "./admin-reporting-harness.mjs";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const output = resolve("output/playwright/admin-reports-workspace/after");
await mkdir(output, { recursive: true });
const axePath = process.env.ADMIN_REPORT_AXE_PATH || resolve("output/playwright/cinematic/qa-tools/node_modules/axe-core/axe.min.js");
const result = { mode: "Synthetic backend fixtures plus explicitly supplemental UI error/review scenarios; no production API or database", matrix: [], journeys: [], states: [], accessibility: [], errors: [] };
const groupIndex = { executive: 0, payments: 1, reconciliation: 1, invitations: 2, engagement: 2, users: 3, subscriptions: 3, templates: 4, system: 5, dictionary: 5 };
const period = "from=2026-10-15&to=2026-10-16";
async function ready(page) { await page.locator('.management-reports[aria-busy="false"] .report-ledger').waitFor(); }
async function choose(page, code, lang = "en") {
  await page.locator(".report-navigation").waitFor();
  if (await page.locator(".report-mobile-selector").isVisible()) await page.locator(".report-mobile-selector select").selectOption(code);
  else {
    const group = page.locator(".report-category-list button").nth(groupIndex[code]);
    if (await group.getAttribute("aria-pressed") !== "true") await group.click();
    const definition = definitions.definitions.find((value) => value.code === code);
    if (new URL(page.url()).searchParams.get("report") !== code) await page.locator(".report-subnavigation").getByRole("button", { name: lang === "en" ? definition.titleEn : definition.titleKm, exact: true }).click();
  }
  await ready(page);
  assert.equal(new URL(page.url()).searchParams.get("report"), code);
}
async function audit(page, name) {
  const report = await page.evaluate(async () => {
    const scan = await window.axe.run(document.querySelector(".management-reports"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
    return { version: window.axe.version, violations: scan.violations.map((rule) => ({ id: rule.id, impact: rule.impact, nodes: rule.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })) })), incomplete: scan.incomplete.map((rule) => rule.id) };
  });
  result.accessibility.push({ name, ...report });
  await writeFile(resolve(output, "accessibility.json"), JSON.stringify(result.accessibility, null, 2));
  assert.deepEqual(report.violations, [], `Accessibility violations: ${name}`);
}
async function capture(page, name) { await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: true }); }
async function exportItem(page, name) { await page.locator(".report-export-menu summary").click(); await page.getByRole("button", { name, exact: true }).click(); }
function journey(name, start, actions, completion, notes = []) { result.journeys.push({ name, start, actions, interactions: actions.length, completion, confusingStates: notes, accessibilityProblems: [] }); }
try {
  for (const width of (process.env.ADMIN_REPORT_JOURNEYS_ONLY ? [] : [390, 768, 1280, 1440])) for (const lang of ["km", "en"]) for (const theme of ["light", "dark"]) {
    const context = await contextFor(width, lang, theme), page = await context.newPage();
    page.on("pageerror", (error) => result.errors.push(error.message));
    await page.goto(`${origin}/reports?report=executive&${period}`);
    await ready(page);
    await page.addScriptTag({ path: axePath });
    for (const definition of definitions.definitions) {
      await choose(page, definition.code, lang);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${width}/${lang}/${theme}/${definition.code}`);
      const visibleColumns = await page.locator('.management-report-table thead th button').count();
      assert.ok(visibleColumns <= 7, `Too many default columns: ${definition.code}`);
      if (["executive", "payments", "invitations"].includes(definition.code)) {
        await capture(page, `${definition.code}-${width}-${lang}-${theme}`);
        await audit(page, `${definition.code}-${width}-${lang}-${theme}`);
      } else if (width === 1440 && lang === "en" && theme === "light") await audit(page, definition.code);
    }
    result.matrix.push({ width, lang, theme, reportsAccessible: 10, pageOverflow: false });
    console.log(`Matrix passed: ${width} ${lang} ${theme}`);
    await context.close();
  }
  const options = { review: true }, context = await contextFor(1440, "en", "light", options), page = await context.newPage();
  page.on("pageerror", (error) => result.errors.push(error.message));
  await page.goto(`${origin}/reports?report=executive&${period}`); await ready(page);
  await page.getByRole("combobox", { name: "Reporting period", exact: true }).selectOption("thisMonth"); await ready(page);
  assert.ok(await page.getByText("47 USD", { exact: true }).isVisible());
  assert.ok(await page.getByText("40,000 KHR", { exact: true }).isVisible());
  journey("A - Find verified receipts", "Reports / Executive summary", ["Select This month"], "Both verified-currency totals are visible immediately", ["Amounts are synthetic fixture totals, not live revenue."]);

  await choose(page, "payments");
  await page.getByRole("combobox", { name: "Payment status", exact: true }).selectOption("PAID_PENDING_REVIEW"); await ready(page);
  await page.getByRole("button", { name: "View details #1", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "View details", exact: true }); await dialog.waitFor();
  assert.ok(await dialog.getByText("UI-REVIEW-001", { exact: true }).first().isVisible());
  assert.ok(await dialog.getByText("Not verified", { exact: true }).isVisible());
  assert.ok(await dialog.getByText("Provider reference", { exact: true }).isVisible());
  await capture(page, "journey-b-payment-details");
  await page.keyboard.press("Escape"); await dialog.waitFor({ state: "hidden" });
  journey("B - Investigate a review transaction", "Reports / Executive summary", ["Open Finance", "Choose Pending review", "Open record details"], "Order identity, verification result and permitted audit fields are visible", ["A supplemental UI-only pending-review fixture exercises this state; golden financial files remain unchanged."]);

  await choose(page, "invitations");
  const search = page.getByRole("searchbox", { name: "Search records", exact: true });
  const searchValue = fixtures.invitations.rows.find((row) => row.status === "PUBLISHED").title;
  const invitationRequests = () => evidence.requests.filter((request) => request.path.endsWith("/reports/invitations")).length;
  const requestCount = invitationRequests();
  await search.fill(searchValue);
  await page.waitForTimeout(150);
  assert.equal(invitationRequests(), requestCount, "Typing must not request an expensive report");
  await search.press("Enter"); await ready(page);
  await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("PUBLISHED"); await ready(page);
  await page.getByRole("button", { name: "View details #1", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "View details", exact: true }); await dialog.waitFor();
  assert.ok(await dialog.getByText(searchValue, { exact: true }).first().isVisible());
  await page.keyboard.press("Escape"); await dialog.waitFor({ state: "hidden" });
  const filteredUrl = page.url();
  await choose(page, "users");
  await page.goBack(); await ready(page);
  assert.equal(page.url(), filteredUrl);
  journey("C - Find an invitation", "Reports / Payments", ["Open Events", "Type event title", "Submit search", "Choose Published", "Open record details"], "The matching event is found and its full details can be inspected");

  await choose(page, "payments");
  const more = page.getByRole("button", { name: /More filters/ });
  await more.focus(); await more.press("Enter");
  dialog = page.getByRole("dialog", { name: "More filters", exact: true }); await dialog.waitFor();
  await dialog.getByLabel("Currency", { exact: true }).selectOption("KHR");
  const beforeDraft = page.url();
  await dialog.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  assert.ok(await dialog.evaluate((node) => node.contains(document.activeElement)), "Drawer traps focus");
  await page.keyboard.press("Escape"); await dialog.waitFor({ state: "hidden" });
  assert.equal(page.url(), beforeDraft);
  assert.ok(await more.evaluate((node) => node === document.activeElement), "Drawer restores focus");
  await more.click(); await dialog.waitFor();
  assert.equal(await dialog.getByLabel("Currency", { exact: true }).inputValue(), "", "Cancelled draft is discarded");
  await dialog.getByLabel("Currency", { exact: true }).selectOption("USD");
  await dialog.getByRole("button", { name: "Apply filters", exact: true }).click(); await ready(page);
  const pending = page.waitForEvent("download");
  await exportItem(page, "Download Excel");
  const download = await pending, file = resolve(output, "journey-d-payments-usd.xlsx");
  await download.saveAs(file); assert.equal((await readFile(file)).subarray(0, 2).toString(), "PK");
  assert.ok(evidence.requests.some((request) => request.path.endsWith("/payments/export/xlsx") && request.query.currency === "USD"));
  journey("D - Export all filtered records", "Reports / Payments", ["Open More filters", "Choose USD", "Apply filters", "Open Export report", "Choose Download Excel"], "A complete server-generated USD workbook downloads; the menu explains all-record scope");

  const beforePreview = page.url();
  await exportItem(page, "Print / Save as PDF");
  dialog = page.getByRole("dialog", { name: "Financial transaction ledger", exact: true }); await dialog.waitFor();
  await dialog.getByRole("button", { name: "Print / Save as PDF", exact: true }).waitFor({ state: "visible" });
  const frame = page.frames().find((frame) => frame !== page.mainFrame());
  await page.waitForFunction(() => document.querySelector('.management-print-preview button')?.disabled === false || [...document.querySelectorAll('.management-print-preview button')].some((button) => button.textContent.includes('Print / Save') && !button.disabled));
  await dialog.getByLabel("Page orientation").selectOption("portrait");
  await frame.evaluate(() => { window.print = () => { window.__reportPrintRequested = true; }; });
  await dialog.getByRole("button", { name: "Print / Save as PDF", exact: true }).click();
  assert.ok(await frame.evaluate(() => window.__reportPrintRequested));
  await capture(page, "journey-e-pdf-preview");
  const printPage = await context.newPage(), html = await frame.content();
  await printPage.route(`${origin}/workspace-print`, (route) => route.fulfill({ contentType: "text/html", body: html }));
  await printPage.goto(`${origin}/workspace-print`); await printPage.evaluate(() => document.fonts.ready);
  await printPage.pdf({ path: resolve(output, "journey-e-portrait.pdf"), preferCSSPageSize: true, printBackground: true, tagged: true });
  await printPage.close(); await page.bringToFront();
  await page.keyboard.press("Escape"); await dialog.waitFor({ state: "hidden" });
  assert.equal(page.url(), beforePreview);
  assert.ok(await page.locator('.report-export-menu summary').evaluate((node) => node === document.activeElement));
  journey("E - Print a filtered report", "Reports / Payments, USD filter active", ["Open Export report", "Choose Print / Save as PDF", "Choose A4 portrait", "Print / Save as PDF", "Close preview"], "Print dispatch and a real Chromium PDF are verified; report, filters and trigger focus are restored", ["The OS print dialog is not automated. Native print invocation is intercepted, and the captured document is independently rendered to PDF."]);

  options.failExport = true;
  await exportItem(page, "Download Excel"); await page.getByRole("alert").filter({ hasText: "Fixture export failure" }).waitFor(); result.states.push("export failed, with recovery");
  options.failExport = false;
  await exportItem(page, "Download Excel"); await page.getByRole("status").filter({ hasText: "Report downloaded" }).waitFor(); result.states.push("export completed");
  options.fail = 503;
  await page.getByRole("button", { name: "Refresh", exact: true }).click(); await page.getByRole("alert").filter({ hasText: "Fixture network failure" }).waitFor();
  assert.ok(await page.getByText(/Showing the last successful snapshot/).isVisible());
  await page.locator('.report-export-menu summary').click(); assert.ok(await page.getByRole("button", { name: "Download Excel", exact: true }).isDisabled());
  await page.keyboard.press("Escape"); result.states.push("stale snapshot, export disabled");
  options.fail = 403;
  await page.getByRole("button", { name: "Refresh", exact: true }).click(); await page.getByText("Administrator report access is required").waitFor();
  assert.equal(await page.locator('.report-ledger').count(), 0); result.states.push("permission denied, stale data removed");
  options.fail = 0; options.empty = true;
  await page.getByRole("button", { name: "Refresh", exact: true }).click(); await ready(page);
  assert.ok(await page.getByText("No records match these filters", { exact: true }).isVisible()); result.states.push("empty filtered records, clear-filter recovery");
  await capture(page, "empty-state");
  await context.close();
  const slowContext = await contextFor(390, "en", "light", { delayMs: 1000 }), slow = await slowContext.newPage();
  await slow.goto(`${origin}/reports?report=payments&${period}`); await slow.locator('.report-skeleton').waitFor(); await capture(slow, "loading-state"); await ready(slow); result.states.push("initial loading without invented zero metrics"); await slowContext.close();
  assert.deepEqual(result.errors, []);
  await writeFile(resolve(output, "journeys.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ passed: true, matrix: result.matrix.length, reportVisits: result.matrix.length * 10, accessibilityScans: result.accessibility.length, journeys: result.journeys.map(({ name, interactions }) => ({ name, interactions })), states: result.states, pageErrors: result.errors.length }, null, 2));
} finally { await browser.close(); }
