import { expect, test } from "@playwright/test";
import { installIdentityFixtures, identityCatalog } from "./support/templateIdentityFixtures.js";

async function setup(page, { code = "khmer-celestial", address = "", nested = false, failSave = false, failPublish = false } = {}) {
  const fixture = await installIdentityFixtures(page);
  const event = fixture.events.get(101), template = identityCatalog.find(row => row.code === code);
  Object.assign(event, { templateId: template.id, templateCode: code, venueAddress: nested ? null : address,
    contentJson: nested ? JSON.stringify({ event: { venueAddress: address } }) : "{}" });
  const calls = [], published = [];
  await page.route("**/api/v1/invitations/101", async route => {
    if (route.request().method() !== "PUT") return route.fallback();
    calls.push(route.request().postDataJSON());
    if (failSave) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Save temporarily unavailable" }) });
    return route.fallback();
  });
  await page.route("**/api/v1/invitations/101/publish", async route => {
    const saved = fixture.events.get(101); published.push(saved.venueAddress);
    const message = !saved.venueAddress?.trim() ? "Publish requirements missing: venueAddress" : "Publication temporarily unavailable";
    if (failPublish || !saved.venueAddress?.trim()) return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ message }) });
    saved.status = "PUBLISHED";
    saved.updatedAt = "2026-10-24T08:00:00.123456Z";
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ data: saved }) });
  });
  await page.goto("/app/events/101/invitation", { waitUntil: 'domcontentloaded' });
  await expect(page.locator(".invitation-studio")).toBeVisible({ timeout: 15000 });
  return { ...fixture, calls, published };
}
async function venue(page) {
  if (page.viewportSize().width < 1024) await page.locator(".studio-section-select select").selectOption("venue");
  else await page.getByRole("button", { name: "Venue & map", exact: true }).click();
  return page.getByRole("textbox", { name: "Venue address", exact: true });
}

for (const code of ["khmer-celestial", "silk-heritage"]) {
  test(`address saves, refreshes and publishes with ${code}`, async ({ page }, info) => {
    const fixture = await setup(page, { code, address: "Old nested address", nested: true });
    const input = await venue(page); await expect(input).toHaveValue("Old nested address");
    await input.fill("  Riverside Road, Phnom Penh  ");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator(".studio-save-status")).toHaveAttribute("data-phase", "saved");
    await expect.poll(() => fixture.calls.at(-1)?.venueAddress).toBe("Riverside Road, Phnom Penh");
    expect(JSON.parse(fixture.calls.at(-1).contentJson).venueAddress).toBe("Riverside Road, Phnom Penh");
    await page.reload({ waitUntil: 'domcontentloaded' }); await expect(await venue(page)).toHaveValue("Riverside Road, Phnom Penh");
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Review publication" })).toBeVisible();
    expect(fixture.published).toEqual([]);
    await page.getByRole("button", { name: "Confirm publication", exact: true }).click();
    await expect.poll(() => fixture.events.get(101).status).toBe("PUBLISHED");
    expect(fixture.published).toEqual(["Riverside Road, Phnom Penh"]);
    await expect(page.getByRole("button", { name: "Publish", exact: true })).toHaveCount(0);
    await page.screenshot({ path: info.outputPath(`published-address-${code}.png`) });
    if (code === "khmer-celestial") {
      await page.getByRole("button", { name: "1 Event details", exact: true }).click();
      await page.getByRole("textbox", { name: "Main Title", exact: true }).fill("Edit after publication");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(page.locator(".studio-save-status")).toHaveAttribute("data-phase", "saved");
      expect(fixture.calls.at(-1).expectedUpdatedAt).toBe("2026-10-24T08:00:00.123456Z");
    }
  });
}

for (const address of ["", " \t "]) {
  test(`missing address ${JSON.stringify(address)} focuses its inline error without publishing`, async ({ page }) => {
    const fixture = await setup(page, { address });
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    const input = page.getByRole("textbox", { name: "Venue address", exact: true });
    await expect(input).toBeFocused(); await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("alert")).toContainText("Enter the venue address before publishing.");
    expect(fixture.published).toEqual([]);
    await input.fill("Corrected address"); await expect(input).toHaveAttribute("aria-invalid", "false");
  });
}

test("failed autosave preserves the address and blocks publication", async ({ page }) => {
  const fixture = await setup(page, { failSave: true });
  const input = await venue(page); await input.fill("Keep this address");
  await expect(page.locator(".studio-save-status")).toHaveAttribute("data-phase", "failed");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Confirm publication", exact: true }).click();
  await expect(page.locator(".studio-save-status")).toHaveAttribute("data-phase", "failed");
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(input).toHaveValue("Keep this address"); expect(fixture.published).toEqual([]);
});

test("failed publish keeps the saved address and never reports publication", async ({ page }) => {
  const fixture = await setup(page, { address: "Persisted address", failPublish: true });
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Confirm publication", exact: true }).click();
  await expect.poll(() => fixture.published.length).toBe(1);
  await expect(page.getByRole("alert")).toContainText("Publication temporarily unavailable");
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(page.getByRole("button", { name: "Publish", exact: true })).toBeEnabled();
  expect(fixture.events.get(101).status).toBe("DRAFT");
  await expect(await venue(page)).toHaveValue("Persisted address");
});
