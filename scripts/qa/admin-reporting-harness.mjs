// Run AdminReportingTests first to generate isolated SQL/export fixtures in output/admin-reporting.
// Preview the built admin app on ADMIN_REPORT_URL (default http://127.0.0.1:4184).
import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import process from "node:process";
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
async function contextFor(width, lang = "en", theme = "light", options = {}) {
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
      if (options.failExport) return route.fulfill({ status: 503, json: { message: "Fixture export failure" } });
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
      if (options.delayMs) await new Promise((done) => setTimeout(done, options.delayMs));
      if (options.fail) return route.fulfill({ status: options.fail, json: { message: "Fixture network failure" } });
      const variant =
        code === "payments" &&
        ["USD", "KHR"].includes(url.searchParams.get("currency"))
          ? `${code}-${url.searchParams.get("currency")}${url.searchParams.get("sort") ? "-sorted" : ""}`
          : code;
      const result = structuredClone(fixtures[variant]);
      // Supplemental UI-only review scenario. It is never included in golden
      // financial export assertions or presented as production data.
      if (options.review && url.searchParams.get("paymentStatus") === "PAID_PENDING_REVIEW") {
        const pending = result.rows.find((row) => row.paymentStatus === "PENDING");
        result.rows = [{ ...pending, id: "UI-REVIEW-001", orderCode: "UI-REVIEW-001", paymentStatus: "PAID_PENDING_REVIEW", reconciliationOutcome: "PENDING_REVIEW", verificationResult: "NOT_VERIFIED", paidAmount: null, paidAt: null, confirmedAt: null }];
        result.filteredSummary = { ...result.filteredSummary, confirmedReceiptsByCurrency: { USD: 0, KHR: 0 } };
        result.totalElements = 1;
      }
      const search = url.searchParams.get("search")?.toLowerCase(), status = url.searchParams.get("status");
      if (search || status) {
        result.rows = result.rows.filter((row) => (!search || Object.values(row).some((value) => String(value).toLowerCase().includes(search))) && (!status || row.status === status));
        result.totalElements = result.rows.length;
      }
      if (options.empty) { result.rows = []; result.totalElements = 0; result.filteredSummary = {}; result.series = []; }
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

export {
  browser,
  contextFor,
  definitions,
  fixtures,
  evidence,
  directory,
  origin,
};
