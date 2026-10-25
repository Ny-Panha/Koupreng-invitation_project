export async function chooseStudioSection(page, tab, section) {
  if (page.viewportSize().width < 1024) await page.locator('.studio-section-select select').selectOption(tab);
  else await page.locator(`[data-studio-tab="${tab}"]`).click();
  if (section) {
    const summary = page.locator('.pe-editor-scroll-body details > summary').filter({ hasText: section }).filter({ visible: true });
    if (await summary.locator('..').getAttribute('open') === null) await summary.click();
  }
}
