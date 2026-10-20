async (page) => {
  const user = { id: 900001, fullName: "Dashboard QA", role: "USER" };
  const payload = Buffer.from(JSON.stringify({ exp: 4102444800 })).toString("base64url");
  const auth = { accessToken: `fixture.${payload}.fixture`, user };
  await page.addInitScript((auth) => {
    sessionStorage.setItem("koupreng.auth", JSON.stringify(auth));
    localStorage.setItem("koupreng.auth", JSON.stringify(auth));
    localStorage.setItem("koupreng.lang", "en");
  }, auth);
  await page.unroute("**/api/**");
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith("/api/")) return route.continue();
    let data = [];
    if (path.endsWith("/invitations/my")) {
      data = [{ id: 42, title: "Garden Royal Khmer Wedding", eventDate: "2026-11-28", venueName: "The Premier Center", status: "DRAFT", slug: "qa-wedding" }];
    } else if (path.endsWith("/invitations/42/dashboard")) {
      data = { totalInvited: 200, attending: 100, declined: 10, pending: 90 };
    } else if (path.endsWith("/dashboard/summary")) {
      data = { totalInvitations: 1, publishedInvitations: 0, totalGuests: 200 };
    } else if (path.includes("i18n")) {
      data = { messages: {} };
    } else if (path.endsWith("/auth/me")) {
      data = user;
    } else if (path.includes("check-in") && path.endsWith("/summary")) {
      data = { totalCheckedIn: 50 };
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://localhost:5173/dashboard?id=42");
  await page.getByRole("heading", { name: "Garden Royal Khmer Wedding", exact: true }).waitFor();
  await page.screenshot({ path: "output/playwright/dashboard-before-1440.png", fullPage: true });
  return await page.evaluate(() => {
    const grid = document.querySelector(".pe-summary-grid");
    const card = grid.firstElementChild;
    return {
      gridDisplay: getComputedStyle(grid).display,
      gridColumns: getComputedStyle(grid).gridTemplateColumns,
      cardDisplay: getComputedStyle(card).display,
      cardBorder: getComputedStyle(card).borderWidth,
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      alerts: [...document.querySelectorAll('[role="alert"]')].map((node) => node.textContent),
    };
  });
}
