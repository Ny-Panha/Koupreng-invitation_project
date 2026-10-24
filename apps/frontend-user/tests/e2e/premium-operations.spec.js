import { expect, test } from "@playwright/test";
import { installOperationsFixtures } from "./support/operationsFixtures.js";
import { installOverhaulFixtures } from "./support/overhaulFixtures.js";

test("RSVP cards filter real responses and retain failed edits", async ({ page }, info) => {
  const state = await installOperationsFixtures(page);
  await page.goto("/app/events/101/rsvp");
  await expect(page.getByRole("heading", { name: "RSVP management" })).toBeVisible();
  const rows = page.locator(".rsvp-table tbody tr");
  await expect(rows).toHaveCount(2);
  await page.getByLabel("Response status", { exact: true }).selectOption("MAYBE");
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText("Sophea");
  await page.getByLabel("Response status", { exact: true }).selectOption("ALL");
  await page.getByRole("searchbox", { name: "Search RSVP responses" }).fill("Sokha");
  await expect(rows).toHaveCount(1);
  const edit = rows.getByRole("button", { name: "Edit RSVP", exact: true });
  await edit.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Wish message").fill("An edited wish retained on failure");
  state.failRsvp = true;
  await dialog.getByRole("button", { name: "Save RSVP", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Your response is retained");
  await expect(dialog.getByLabel("Wish message")).toHaveValue("An edited wish retained on failure");
  state.failRsvp = false;
  await dialog.getByRole("button", { name: "Save RSVP", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(rows).toContainText("An edited wish retained on failure");
  expect(state.calls.filter(call => call.path === "rsvps/901")).toHaveLength(2);
  const table = page.locator(".rsvp-table");
  const box = await table.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width + 1);
  await page.screenshot({ path: info.outputPath("rsvp-responses.png"), fullPage: true });
});

test("expense dialog contains focus, preserves KHR entries after failure and saves the actual payload", async ({ page }, info) => {
  const state = await installOperationsFixtures(page);
  await page.goto("/app/events/101/budget");
  const add = page.getByRole("button", { name: "Add Expense", exact: true });
  await add.click();
  const dialog = page.getByRole("dialog", { name: "Add New Expense" });
  await expect(dialog).toBeVisible();
  await expect(page.locator("#root")).toHaveAttribute("inert", "");
  await dialog.getByLabel("Expense Item Name").fill("KHR meal deposit");
  await dialog.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Save Expense", exact: true })).toBeFocused();
  await dialog.getByLabel("Currency", { exact: true }).selectOption("KHR");
  await dialog.getByLabel(/Estimated Budget/).fill("200000");
  await dialog.getByRole("button", { name: "Add Payment Entry" }).click();
  await dialog.locator(".exp-payment-amount").fill("40000");
  expect((await dialog.locator(".exp-payment-amount").boundingBox()).width).toBeGreaterThanOrEqual(100);
  await expect(dialog.locator(".exp-payment-amount")).toHaveCSS("font-size", "16px");
  await expect(dialog.getByLabel("Actual Amount")).toHaveValue("40000");
  await expect(dialog.getByLabel("Remaining Balance")).toHaveValue("160000");
  state.failExpense = true;
  await dialog.getByRole("button", { name: "Save Expense", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Your entries are retained");
  await expect(dialog.getByRole("alert")).toBeInViewport();
  await expect(dialog.getByLabel("Expense Item Name")).toHaveValue("KHR meal deposit");
  await page.screenshot({ path: info.outputPath("expense-retained-error.png"), fullPage: true });
  state.failExpense = false;
  await dialog.getByRole("button", { name: "Save Expense", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(add).toBeFocused();
  await expect(page.locator(".exp-table")).toContainText("KHR meal deposit");
  expect(state.calls.at(-1).body).toMatchObject({ name: "KHR meal deposit", currency: "KHR", budget: 200000, amount: 40000 });
});

test("financial report preserves currencies and has keyboard-accessible printable preview", async ({ page }, info) => {
  await installOperationsFixtures(page);
  await page.goto("/app/events/101/reports");
  const summary = page.getByRole("region", { name: "Financial summary" });
  await expect(summary).toContainText("$25.00");
  await expect(summary).toContainText("40,000 ៛");
  const preview = page.getByRole("button", { name: "Print Preview", exact: true });
  await preview.click();
  const dialog = page.getByRole("dialog", { name: "Print Preview", exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.locator("#root")).toHaveAttribute("inert", "");
  await dialog.getByRole("button", { name: "Exit preview", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Zoom out", exact: true })).toBeFocused();
  await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#root")).toHaveCSS("display", "none");
  await expect(dialog.locator(".reports-content-container")).toHaveCSS("transform", "none");
  await expect(dialog.getByRole("heading", { name: "Event financial report" })).toBeVisible();
  expect((await dialog.locator(".reports-content-container").boundingBox()).y).toBeLessThan(100);
  await page.screenshot({ path: info.outputPath("event-financial-report-print.png"), fullPage: true });
  await page.pdf({ path: info.outputPath("event-financial-report.pdf"), format: "A4", printBackground: true });
  await page.emulateMedia({ media: "screen" });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(preview).toBeFocused();
});

test("empty expense workspace prioritizes one add action and no zero summaries", async ({ page }) => {
  await installOverhaulFixtures(page, "en", { empty: true });
  // The verified event is present; its expense ledger has no records.
  await page.route("**/api/v1/invitations/my", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [{ id: 101, title: "Dara & Sophea" }] }) }));
  await page.goto("/app/events/101/budget");
  await expect(page.getByRole("button", { name: "Add Expense", exact: true })).toHaveCount(1);
  await expect(page.locator(".exp-summary")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No expense records yet" })).toBeVisible();
});

test("Khmer operations use translated labels while preserving category values", async ({ page }) => {
  await installOperationsFixtures(page, "km");
  await page.goto("/app/events/101/rsvp");
  await expect(page.getByRole("heading", { name: "គ្រប់គ្រងការឆ្លើយតប RSVP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "កែប្រែ RSVP", exact: true })).toHaveCount(2);
  await page.goto("/app/events/101/budget");
  await page.getByRole("button", { name: "បន្ថែមចំណាយ", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("option", { name: "Food & Catering", exact: true })).toHaveCount(0);
  await expect(dialog.locator('select option[value="Food & Catering"]')).toHaveText("ម្ហូប & ភេសជ្ជៈ");
  await expect(dialog.getByLabel("រូបិយប័ណ្ណ", { exact: true })).toHaveValue("USD");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("currency summaries and the gift entry form fit a 320px phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await installOperationsFixtures(page, "km");
  for (const module of ["budget", "gifts"]) {
    await page.goto(`/app/events/101/${module}`);
    await expect(page.locator(module === "budget" ? ".exp-summary" : ".wg-summary").first()).toBeVisible();
    const outside = await page.locator(".exp-sum-card, .wg-sum-card").evaluateAll(elements => elements.filter(element => element.checkVisibility()).filter(element => {
      const box = element.getBoundingClientRect();
      const cell = element.closest("td")?.getBoundingClientRect();
      return box.left < -1 || box.right > innerWidth + 1 || (cell && (box.left < cell.left - 1 || box.right > cell.right + 1));
    }).length);
    expect(outside).toBe(0);
  }
  await page.locator('.wg-page .dash-page-header button').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('button[type="submit"]')).toHaveText('កត់ត្រា');
  const outside = await dialog.locator('input, select, textarea, button').evaluateAll(elements => elements.filter(element => element.checkVisibility()).filter(element => {
    const box = element.getBoundingClientRect();
    return box.left < -1 || box.right > innerWidth + 1;
  }).length);
  expect(outside).toBe(0);
});
