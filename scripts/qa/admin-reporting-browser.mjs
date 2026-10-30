// Reporting regression journeys using isolated backend-generated synthetic fixtures.
import {
  browser,
  contextFor,
  definitions,
  fixtures,
  evidence,
  directory,
  origin,
  exportDialog,
  expect,
  captureFailure,
} from "./admin-reporting-harness.mjs";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const groups = {
  executive: "Overview",
  payments: "Finance",
  reconciliation: "Finance",
  invitations: "Events",
  engagement: "Events",
  users: "Customers",
  subscriptions: "Customers",
  templates: "Performance",
  system: "Operations",
  dictionary: "Operations",
};
async function chooseReport(page, code, title) {
  await page.locator(".report-navigation").waitFor();
  if (await page.locator(".report-mobile-selector").isVisible())
    await page.getByLabel("Choose a report").selectOption(code);
  else {
    await page
      .locator(".report-category-list")
      .getByRole("button", { name: groups[code], exact: true })
      .click();
    await page
      .locator(".report-subnavigation")
      .getByRole("button", { name: title, exact: true })
      .click();
  }
}
async function exportAction(root, name) {
  const dialog = await exportDialog(root.page());
  return dialog.getByRole("button", { name, exact: true });
}
try {
  const anonymous = await browser.newPage();
  await anonymous.goto(origin + "/reports");
  await anonymous.waitForURL(/\/login\?next=/);
  await anonymous.close();
  evidence.anonymousRedirect = true;
  for (const width of [1440, 1280, 768, 390]) {
    const context = await contextFor(width),
      page = await context.newPage();
    page.on("pageerror", (error) => evidence.errors.push(error.message));
    await page.goto(
      origin + "/reports?report=executive&from=2026-10-15&to=2026-10-16",
    );
    const root = page.locator(".management-reports");
    for (const definition of definitions.definitions) {
      await chooseReport(page, definition.code, definition.titleEn);
      await page
        .locator(`.report-ledger[aria-label="${definition.titleEn}"]`)
        .waitFor();
      const exports = await exportDialog(page);
      await assertEnabled(
        exports.getByRole("button", { name: "Download Excel", exact: true }),
      );
      await page.keyboard.press("Escape");
      await expect(exports).toBeHidden();
      assert.equal(await page.locator(".report-ledger").count(), 1);
      if (["executive", "payments", "invitations"].includes(definition.code))
        await page.screenshot({
          path: resolve(directory, `${definition.code}-${width}-en-light.png`),
          fullPage: true,
        });
    }
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Page overflow at ${width}`,
    );
    evidence.viewports.push({ width, tabs: 10, overflow: false });
    await context.close();
  }
  const context = await contextFor(1440),
    page = await context.newPage();
  page.on("pageerror", (error) => evidence.errors.push(error.message));
  await page.goto(
    origin +
      "/reports?report=payments&from=2026-10-15&to=2026-10-16&currency=KHR",
  );
  const root = page.locator(".management-reports");
  await page.locator(".report-ledger").waitFor();
  assert.ok(await root.getByText("0 USD", { exact: true }).first().isVisible());
  assert.ok(
    await root.getByText("40,000 KHR", { exact: true }).first().isVisible(),
  );
  await root.getByRole("button", { name: /More filters/ }).click();
  await root
    .locator(".report-filters")
    .getByLabel("Currency", { exact: true })
    .selectOption("USD");
  await root
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".management-reports")
        ?.getAttribute("aria-busy") === "false",
  );
  assert.ok(await root.getByText("47 USD", { exact: true }).isVisible());
  await root.getByRole("button", { name: /Expected amount/ }).click();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".management-reports")
        ?.getAttribute("aria-busy") === "false",
  );
  assert.equal(new URL(page.url()).searchParams.get("sort"), "expectedAmount");
  await page.reload();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".management-reports")
        ?.getAttribute("aria-busy") === "false",
  );
  assert.equal(new URL(page.url()).searchParams.get("currency"), "USD");
  for (const [label, extension] of [
    ["Download Excel", "xlsx"],
    ["CSV · All filtered records", "csv"],
  ]) {
    const responsePending = page.waitForResponse(response => new URL(response.url()).pathname.endsWith(`/payments/export/${extension}`));
    const pending = page.waitForEvent("download");
    await (await exportAction(root, label)).click();
    const download = await pending;
    const response = await responsePending;
    assert.equal(response.status(), 200);
    assert.ok(response.headers()["content-type"].startsWith(extension === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv"));
    assert.equal(download.suggestedFilename(), `koupreng-payments-2026-10-15-2026-10-16.${extension}`);
    const target = resolve(directory, "browser-" + extension + "." + extension);
    await download.saveAs(target);
    const bytes = await readFile(target);
    assert.ok(
      extension === "xlsx"
        ? bytes.subarray(0, 2).toString() === "PK"
        : bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])),
    );
    evidence.downloads.push({
      extension,
      bytes: bytes.length,
      filename: download.suggestedFilename(),
    });
    await page.waitForFunction(
      () =>
        document
          .querySelector(".management-reports")
          ?.getAttribute("aria-busy") === "false",
    );
  }
  const beforePreview = page.url();
  const workbookPending = page.waitForEvent("download");
  const workbookResponsePending = page.waitForResponse(response => new URL(response.url()).pathname.endsWith("/all/export/xlsx"));
  await (await exportAction(root, "Excel · All reports (period only)")).click();
  const workbook = await workbookPending;
  assert.equal((await workbookResponsePending).headers()["content-type"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  assert.equal(workbook.suggestedFilename(), "koupreng-all-2026-10-15-2026-10-16.xlsx");
  await workbook.saveAs(resolve(directory, "browser-all-reports.xlsx"));
  const workbookBytes = await readFile(
    resolve(directory, "browser-all-reports.xlsx"),
  );
  assert.equal(workbookBytes.subarray(0, 2).toString(), "PK");
  evidence.downloads.push({
    extension: "xlsx",
    scope: "all reports",
    bytes: workbookBytes.length,
    filename: workbook.suggestedFilename(),
  });
  await (await exportAction(root, "Print / Save as PDF")).click();
  const dialog = page.getByRole("dialog", {
    name: "Financial transaction ledger",
  });
  await dialog.waitFor();
  await assertEnabled(
    dialog.getByRole("button", { name: "Print / Save as PDF" }),
  );
  const iframe = page.frameLocator(".management-print-preview iframe");
  assert.ok(
    await iframe.getByText("ALL FILTERED RECORDS", { exact: true }).isVisible(),
  );
  await dialog.getByLabel("Page orientation").selectOption("portrait");
  assert.match(
    await iframe.locator("#preview-orientation").textContent(),
    /portrait/,
  );
  await dialog.getByLabel("Preview zoom").selectOption("125");
  await page.screenshot({
    path: resolve(directory, "print-preview.png"),
    fullPage: true,
  });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  assert.equal(page.url(), beforePreview);
  await page.goto(
    origin + "/reports?report=invitations&from=2026-10-15&to=2026-10-16&size=1",
  );
  await assertEnabled(root.getByRole("button", { name: "Next", exact: true }));
  await root.getByRole("button", { name: "Next", exact: true }).click();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".management-reports")
        ?.getAttribute("aria-busy") === "false",
  );
  assert.equal(new URL(page.url()).searchParams.get("page"), "1");
  const checked = root.getByRole("checkbox", {
    name: "Select row 2",
    exact: true,
  });
  await checked.check();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await root.getByRole("button", { name: /Copy selected rows/ }).click();
  assert.ok(
    (await page.evaluate(() => navigator.clipboard.readText())).includes(
      fixtures.invitations.rows[1].title,
    ),
  );
  const pageCsvPending = page.waitForEvent("download");
  const pageResponsePending = page.waitForResponse(response => new URL(response.url()).pathname.endsWith("/invitations/export/csv-page"));
  await (await exportAction(root, "CSV · Current page")).click();
  const pageCsv = await pageCsvPending;
  assert.ok((await pageResponsePending).headers()["content-type"].startsWith("text/csv"));
  assert.equal(pageCsv.suggestedFilename(), "koupreng-invitations-2026-10-15-2026-10-16-page.csv");
  await pageCsv.saveAs(resolve(directory, "browser-current-page.csv"));
  const pageCsvBytes = await readFile(
    resolve(directory, "browser-current-page.csv"),
  );
  assert.ok(pageCsvBytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])));
  const pageLines = pageCsvBytes.toString("utf8").trim().split(/\r?\n/);
  assert.equal(pageLines.length, 2, "Current-page CSV must contain exactly the header and one requested row");
  assert.match(pageLines[0], /^"Row","id",/);
  assert.ok(pageLines[1].startsWith(`"2","${fixtures.invitations.rows[1].id}",`), "CSV row must match the displayed second record under the server's default sort");
  assert.ok(evidence.requests.some(({ path, query }) => path.endsWith("/invitations/export/csv-page") && query.page === "1" && query.size === "1"));
  assert.ok(
    pageCsvBytes.toString("utf8").includes(fixtures.invitations.rows[1].title),
  );
  evidence.downloads.push({
    extension: "csv",
    scope: "current page",
    bytes: pageCsvBytes.length,
    filename: pageCsv.suggestedFilename(),
  });
  await context.close();
  for (const width of [1440, 390]) {
    const context = await contextFor(width, "km", "dark"),
      page = await context.newPage();
    await page.goto(
      origin + "/reports?report=invitations&from=2026-10-15&to=2026-10-16",
    );
    await page.locator(".report-ledger tbody tr").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: resolve(directory, `invitations-${width}-km-dark.png`),
      fullPage: true,
    });
    assert.ok(await page.locator("html.dark").count());
    await context.close();
  }
  for (const [file, orientation] of [
    ["large-invitations.html", "landscape"],
    ["large-invitations.html", "portrait"],
    ["invitations.html", "landscape"],
  ]) {
    const page = await browser.newPage();
    const html = await readFile(resolve(directory, file), "utf8");
    await page.route(origin + "/report-document", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.goto(origin + "/report-document");
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content: `@page{size:A4 ${orientation}}h2{break-after:avoid}`,
    });
    const name = `${file.replace(".html", "")}-${orientation}.pdf`;
    const pdf = await page.pdf({
      path: resolve(directory, name),
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
    });
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.ok(pdf.subarray(-32).toString().includes("%%EOF"));
    evidence.pdfs.push({
      name,
      orientation,
      khmerFontLoaded: await page.evaluate(() =>
        document.fonts.check("12px ReportKhmer"),
      ),
      chartCount: await page.locator("svg").count(),
    });
    await page.close();
  }
  assert.deepEqual(evidence.errors, []);
  await writeFile(
    resolve(directory, "browser-evidence.json"),
    JSON.stringify(evidence, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        passed: true,
        viewports: evidence.viewports,
        downloads: evidence.downloads,
        pdfs: evidence.pdfs,
        requests: evidence.requests.length,
        pageErrors: evidence.errors.length,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await captureFailure(error);
  throw error;
} finally {
  await browser.close();
}
async function assertEnabled(locator) {
  await expect(locator).toBeEnabled({ timeout: 10_000 });
}
