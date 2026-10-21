import { expect, test } from "@playwright/test";
import { fixtures } from "./support/studioFixtures.js";
import { installOverhaulFixtures } from "./support/overhaulFixtures.js";

test("studio allocates useful controls and preview space at nine viewport widths", async ({page}) => {
  test.setTimeout(120000);
  await fixtures(page,"en");
  const errors=[]; page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="error") errors.push(message.text());});
  for(const width of [320,375,390,430,768,1024,1366,1440,1920]) {
    await page.setViewportSize({width,height:900});
    await page.goto("/app/events/101/invitation");
    await expect(page.locator(".studio-toolbar")).toHaveCount(1);
    await expect(page.locator('input[placeholder="សិរីមង្គលអាពាហ៍ពិពាហ៍"]')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    if(width>=1024) {
      const controls=await page.locator(".pe-editor-column").boundingBox();
      const preview=await page.locator(".pe-preview-column").boundingBox();
      expect(controls.width).toBeGreaterThanOrEqual(340);
      expect(controls.width).toBeLessThanOrEqual(440);
      expect(preview.width).toBeGreaterThan(width>=1366?440:280);
      expect(Math.abs(controls.y-preview.y)).toBeLessThan(2);
    } else {
      await page.locator(".studio-mobile-tabs button").nth(1).click();
      await expect(page.locator(".pe-preview-column")).toBeVisible();
      await expect(page.locator(".pe-editor-column")).toBeHidden();
    }
  }
  expect(errors).toEqual([]);
});

test("featured event uses a compact horizontal card and actual type filters",async({page})=>{
  await installOverhaulFixtures(page,"en",{single:true});
  await page.setViewportSize({width:1440,height:900});
  await page.goto("/app/events");
  const card=page.locator(".event-card--featured");
  await expect(card).toBeVisible();
  const image=await card.locator(".event-card-img-wrap").boundingBox();
  const body=await card.locator(".event-card-body").boundingBox();
  expect(body.x).toBeGreaterThan(image.x+image.width-2);
  expect((await card.boundingBox()).height).toBeLessThan(480);
  await page.getByLabel("Event type",{exact:true}).selectOption("WEDDING");
  await expect(page.getByRole("heading",{name:"Dara & Sophea"})).toBeVisible();
});
