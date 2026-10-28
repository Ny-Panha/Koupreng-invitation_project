import { expect, test } from "@playwright/test";
import { installIdentityFixtures, identityCatalog } from "./support/templateIdentityFixtures.js";

const live = page => page.frameLocator('iframe[title="Live User Template Preview"]');
async function openPreview(page) {
  if (page.viewportSize().width < 1024) await page.getByRole('button',{name:'Preview invitation',exact:true}).click();
}
async function closePreview(page) {
  if (page.viewportSize().width < 1024) await page.getByRole('button',{name:'Return to editing',exact:true}).click();
}
test("cold catalog, refresh, stale draft and public preview keep exact Celestial identity", async ({ page }) => {
  await installIdentityFixtures(page,{delay:350});
  await page.goto("/app/events/101/invitation");
  await expect(page.locator(".pe-template-tag")).toHaveText("Khmer Celestial");
  await openPreview(page);
  await expect(page.locator('iframe[title="Live User Template Preview"]')).toHaveAttribute("src",/\/templates\/khmer-celestial\/preview/);
  await expect(live(page).locator('[data-template-renderer="khmer-celestial"]')).toBeAttached({timeout:15000});
  await expect(live(page).locator(".kc-root")).toBeAttached({timeout:15000});
  await page.reload();
  await openPreview(page);
  await expect(live(page).locator(".kc-root")).toBeAttached({timeout:15000});
  await page.goto("/i/review-celestial");
  await expect(page.locator('[data-template-renderer="khmer-celestial"] .kc-root')).toBeAttached({timeout:15000});
});

test("switching events remounts controls and uses Digital Yes renderer", async ({ page }) => {
  await installIdentityFixtures(page);
  await page.goto("/app/events/101/invitation");
  await openPreview(page);
  await expect(live(page).locator(".kc-root")).toBeAttached({timeout:15000});
  await closePreview(page);
  await page.getByRole("button", { name: "Open event navigation", exact: true }).click();
  await page.locator(".event-switcher-select").selectOption("102");
  await expect(page.locator(".pe-template-tag")).toHaveText("The Digital Yes");
  await openPreview(page);
  await expect(live(page).locator('[data-template-renderer="the-digital-yes-wedding"]')).toBeAttached({timeout:15000});
  await expect(page.locator(".invitation-studio")).not.toContainText("Celestial host");
  await closePreview(page);
  await page.getByRole("button", { name: "Open event navigation", exact: true }).click();
  await page.locator(".event-switcher-select").selectOption("101");
  await openPreview(page);
  await expect(live(page).locator(".kc-root")).toBeAttached({timeout:15000});
});

test("template switch persists the actual association and preserves event details", async ({ page }) => {
  const {writes,events}=await installIdentityFixtures(page);
  const schedule=[{id:"owner-schedule",time:"17:30",title:"Owner ceremony",description:"Owner-authored ceremony note"}];
  events.set(101,{...events.get(101),contentJson:JSON.stringify({schedule,party:[],faq:[],storyChapters:[]})});
  await page.goto("/app/events/101/invitation");
  await page.getByRole("button",{name:/^Change template:/}).click();
  await page.locator('.tc-card[data-template="the-digital-yes-wedding"]').getByRole('button', { name:'Select',exact:true }).click();
  await page.getByRole('button', { name:'Use selected design' }).click();
  await page.getByRole('dialog', { name:'Confirm template change' }).getByRole('button', { name:'Confirm',exact:true }).click();
  await expect.poll(()=>writes.length).toBeGreaterThan(0);
  expect(writes.at(-1).payload.templateId).toBe(7);
  expect(events.get(101).title).toBe("Celestial celebration");
  expect(JSON.parse(writes.at(-1).payload.contentJson).schedule).toEqual(schedule);
  await page.reload();
  await openPreview(page);
  await expect(live(page).locator('[data-template-renderer="the-digital-yes-wedding"]')).toBeAttached({timeout:15000});
});

test("premium denial leaves the assigned template untouched", async ({ page }) => {
  const {writes}=await installIdentityFixtures(page,{denyPremium:true});
  await page.route("**/api/v1/me/templates/27/access",route=>route.fulfill({contentType:"application/json",body:JSON.stringify({data:{hasAccess:false}})}));
  await page.goto("/app/events/101/invitation");
  await page.getByRole("button",{name:/^Change template:/}).click();
  await page.locator('.tc-card[data-template="emerald-canva-luxe-wedding"]').getByRole('button', { name:'Select',exact:true }).click();
  await page.getByRole('button', { name:'Use selected design' }).click();
  await expect(page.getByRole("dialog", { name:"Explore eligible packages" })).toBeVisible();
  expect(writes).toEqual([]);
  await expect(page.locator(".pe-template-tag")).toHaveText("Khmer Celestial");
});

test("unregistered template does not fall back through a colliding ID", async ({ page }) => {
  await installIdentityFixtures(page,{catalog:identityCatalog.map(t=>t.id===4?{...t,code:"unregistered-design",description:null}:t)});
  await page.goto("/templates/unregistered-design/preview");
  await expect(page.locator(".public-state").getByRole("heading")).toBeVisible();
  await expect(page.locator("[data-template-renderer]")).toHaveCount(0);
  await expect(page.locator(".kc-root,.tx-root")).toHaveCount(0);
});

test("invalid assigned template blocks editing rather than selecting a fallback", async ({ page }) => {
  const {events}=await installIdentityFixtures(page);
  events.set(101,{...events.get(101),templateId:99999,templateCode:"missing-template"});
  await page.goto("/app/events/101/invitation");
  await expect(page.getByRole("alert").filter({hasText:"Template unavailable"})).toBeVisible();
  await expect(page.locator(".invitation-studio")).toHaveCount(0);
  await page.goto("/i/review-celestial");
  await expect(page.getByRole("alert").filter({hasText:"Template unavailable"})).toBeVisible();
});

test("empty catalog blocks editing instead of reusing historical database IDs", async ({page})=>{
  await installIdentityFixtures(page,{catalog:[]});
  await page.goto("/app/events/101/invitation");
  await expect(page.getByRole("alert").filter({hasText:"Template unavailable"})).toBeVisible();
  await expect(page.locator(".invitation-studio")).toHaveCount(0);
});

test("missing template image reports a recovery state without substituting designs", async ({ page }) => {
  await installIdentityFixtures(page);
  await page.route("**/invitations/khmer-celestial/**",route=>route.fulfill({status:404,body:"missing asset"}));
  await page.goto("/templates/khmer-celestial/preview");
  await expect(page.getByRole("alert").filter({hasText:"image could not be loaded"})).toBeVisible();
  await expect(page.locator(".kc-root")).toBeAttached({timeout:15000});
  await expect(page.locator('[data-template-renderer="khmer-celestial"]')).toBeAttached({timeout:15000});
});


