// Run AdminReportingTests first to generate isolated SQL/export fixtures in output/admin-reporting.
// Preview the built admin app on ADMIN_REPORT_URL (default http://127.0.0.1:4184).
import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const origin = process.env.ADMIN_REPORT_URL || "http://127.0.0.1:4184";
const directory = resolve("output/admin-reporting");
await mkdir(directory, { recursive: true });
const definitions = JSON.parse(
  await readFile(resolve(directory, "definitions.json"), "utf8"),
);
const fixtures = Object.fromEntries(
  await Promise.all(
    definitions.definitions.map(async (definition) => [
      definition.code,
      JSON.parse(
        await readFile(resolve(directory, definition.code + ".json"), "utf8"),
      ),
    ]),
  ),
);
const browser = await chromium.launch();
for (const currency of ["USD", "KHR"])
  for (const suffix of ["", "-sorted"]) {
    const key = `payments-${currency}${suffix}`;
    fixtures[key] = JSON.parse(
      await readFile(resolve(directory, key + ".json"), "utf8"),
    );
  }
const evidence = {
  fixtureMode:
    "Isolated backend SQL + POI output replayed through the built UI; no production API or data",
  viewports: [],
  downloads: [],
  pdfs: [],
  requests: [],
  errors: [],
};
const token = `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from(JSON.stringify({ sub: "1", exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.fixture`;
async function contextFor(width, lang = "en", theme = "light") {
  const context = await browser.newContext({
    viewport: { width, height: 960 },
    acceptDownloads: true,
  });
  await context.addInitScript(
    ({ token, lang, theme }) => {
      localStorage.setItem(
        "koupreng.admin.auth",
        JSON.stringify({
          accessToken: token,
          user: { id: 1, fullName: "Report QA fixture", role: "ADMIN" },
        }),
      );
      localStorage.setItem("koupreng.admin.lang", lang);
      localStorage.setItem("theme", theme);
    },
    { token, lang, theme },
  );
  await context.route("**/api/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname;
    evidence.requests.push({
      path,
      query: Object.fromEntries(url.searchParams),
      method: request.method(),
    });
    if (!request.headers().authorization)
      return route.fulfill({
        status: 401,
        json: { message: "Authentication required" },
      });
    if (path.endsWith("/management/definitions"))
      return route.fulfill({ json: { success: true, data: definitions } });
    const match = path.match(/\/management\/([^/]+)\/export\/(xlsx|csv|html)$/);
    if (match) {
      const [, code, format] = match;
      const currencySuffix =
        code === "payments" &&
        ["USD", "KHR"].includes(url.searchParams.get("currency"))
          ? "-" + url.searchParams.get("currency")
          : "";
      const file = currencySuffix
        ? `payments${currencySuffix}.${format}`
        : format === "xlsx"
          ? code === "all"
            ? "all-reports.xlsx"
            : "payments.xlsx"
          : `${code}.${format}`;
      return route.fulfill({
        body: await readFile(resolve(directory, file)),
        headers: {
          "Content-Type":
            format === "xlsx"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : format === "csv"
                ? "text/csv;charset=utf-8"
                : "text/html;charset=utf-8",
          "X-Report-Snapshot-Id": "fixture-snapshot",
        },
      });
    }
    const code = path.endsWith("/reports/invitations")
      ? "invitations"
      : path.match(/\/management\/([^/]+)$/)?.[1];
    if (fixtures[code]) {
      const variant =
        code === "payments" &&
        ["USD", "KHR"].includes(url.searchParams.get("currency"))
          ? `${code}-${url.searchParams.get("currency")}${url.searchParams.get("sort") ? "-sorted" : ""}`
          : code;
      const result = structuredClone(fixtures[variant]);
      const page = Number(url.searchParams.get("page") || 0),
        size = Number(url.searchParams.get("size") || 20);
      result.page = page;
      result.size = size;
      result.rows = result.rows.slice(page * size, (page + 1) * size);
      result.totalPages = Math.ceil(result.totalElements / size);
      result.metadata.snapshotId = `fixture-${code}-${page}`;
      result.metadata.sort =
        url.searchParams.get("sort") || result.metadata.sort;
      result.metadata.direction =
        url.searchParams.get("direction") || result.metadata.direction;
      return route.fulfill({ json: { success: true, data: result } });
    }
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return context;
}
try {
  const anonymous = await browser.newPage();
  await anonymous.goto(origin + "/reports");
  await anonymous.waitForURL(/\/login\?next=/);
  await anonymous.close();
  evidence.anonymousRedirect = true;
  for (const width of [1440, 768, 390]) {
    const context = await contextFor(width),
      page = await context.newPage();
    page.on("pageerror", (error) => evidence.errors.push(error.message));
    await page.goto(
      origin + "/reports?report=executive&from=2026-10-15&to=2026-10-16",
    );
    const root = page.locator(".management-reports");
    for (const definition of definitions.definitions) {
      await root
        .getByRole("navigation")
        .getByRole("button", { name: definition.titleEn, exact: true })
        .click();
      await page
        .locator(`.report-ledger[aria-label="${definition.titleEn}"]`)
        .waitFor();
      await root
        .getByRole("button", { name: "Download Excel", exact: true })
        .waitFor();
      await assertEnabled(
        root.getByRole("button", { name: "Download Excel", exact: true }),
      );
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
  await assertEnabled(root.getByRole("button", { name: "Download Excel" }));
  assert.ok(await root.getByText("0 USD", { exact: true }).first().isVisible());
  assert.ok(
    await root.getByText("40,000 KHR", { exact: true }).first().isVisible(),
  );
  await root
    .locator(".report-filters")
    .getByLabel("Currency", { exact: true })
    .selectOption("USD");
  await assertEnabled(root.getByRole("button", { name: "Download Excel" }));
  assert.ok(await root.getByText("47 USD", { exact: true }).isVisible());
  await root.getByRole("button", { name: /Expected amount/ }).click();
  await assertEnabled(root.getByRole("button", { name: "Download Excel" }));
  assert.equal(new URL(page.url()).searchParams.get("sort"), "expectedAmount");
  await page.reload();
  await assertEnabled(root.getByRole("button", { name: "Download Excel" }));
  assert.equal(new URL(page.url()).searchParams.get("currency"), "USD");
  for (const [label, extension] of [
    ["Download Excel", "xlsx"],
    ["CSV · All filtered records", "csv"],
  ]) {
    const pending = page.waitForEvent("download");
    await root.getByRole("button", { name: label, exact: true }).click();
    const download = await pending;
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
    await assertEnabled(root.getByRole("button", { name: "Download Excel" }));
  }
  const beforePreview = page.url();
  const workbookPending = page.waitForEvent("download");
  await root
    .getByRole("button", {
      name: "Excel · All reports (period only)",
      exact: true,
    })
    .click();
  const workbook = await workbookPending;
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
  await assertEnabled(
    root.getByRole("button", { name: "Print preview", exact: true }),
  );
  await root
    .getByRole("button", { name: "Print preview", exact: true })
    .click();
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
  await assertEnabled(root.getByRole("button", { name: "Download Excel" }));
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
  await root
    .getByRole("button", { name: "CSV · Current page", exact: true })
    .click();
  const pageCsv = await pageCsvPending;
  await pageCsv.saveAs(resolve(directory, "browser-current-page.csv"));
  const pageCsvBytes = await readFile(
    resolve(directory, "browser-current-page.csv"),
  );
  assert.ok(pageCsvBytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])));
  assert.match(pageCsvBytes.toString("utf8"), /CURRENT PAGE 2/);
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
    await page.pdf({
      path: resolve(directory, name),
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
    });
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
        consoleErrors: evidence.errors.length,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
async function assertEnabled(locator) {
  for (let i = 0; i < 100; i++) {
    if (await locator.isEnabled()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.fail("Control remained disabled: " + (await locator.textContent()));
}
