import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";

const ACCOUNTS = [
  { tier: "FREE", name: "Free Demo", identifier: "free.demo@koupreng.test", pass: "Kp!n-G20xr0z7k-kczHcjD_CXqqVn5sQHhwLHmqNP8rR60", expectedPlan: "FREE" },
  { tier: "BASIC", name: "Daly", identifier: "kuydaly123@gmail.com", pass: "Kp!QQnC4SiBflhq-S803V2KbN4oTtmxWeterV9GEPpviFw", expectedPlan: "BASIC" },
  { tier: "PRO", name: "Long", identifier: "012345678", pass: "Kp!L4nn5IenKn0Thpd8SuI3JolVZTJOcJM5hCr25P5wqIc", expectedPlan: "PRO" },
  { tier: "PREMIUM", name: "Vireak", identifier: "060400652", pass: "Kp!B3BD9SPjaVFS7hnwLf1VZ3D5g6_BmNMUWjUeh9vtgFQ", expectedPlan: "PREMIUM" },
];

const BASE_URL = "http://localhost:5173";

async function main() {
  console.log(`Starting Playwright browser login verification on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const acc of ACCOUNTS) {
    console.log(`\nTesting UI login for [${acc.tier}] ${acc.name} (${acc.identifier})...`);
    const context = await browser.newContext();
    const page = await context.newPage();

    let pageErrors = [];
    page.on("pageerror", err => pageErrors.push(err.message));

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });

      // Check form fields
      await page.fill('input[autocomplete="username"]', acc.identifier);
      await page.fill('input[autocomplete="current-password"]', acc.pass);

      // Click submit button
      await page.click('button[type="submit"]');

      // Wait for navigation away from /login
      await page.waitForURL(url => !url.pathname.includes("/login"), { timeout: 20000 });

      const finalUrl = page.url();
      console.log(`  Redirected to: ${finalUrl}`);

      // Wait for page to stabilize
      await page.waitForTimeout(1000);

      // Inspect localStorage koupreng.auth
      const authState = await page.evaluate(() => {
        try {
          const raw = localStorage.getItem("koupreng.auth");
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return { error: e.message };
        }
      });

      const userInStorage = authState?.user;
      console.log(`  User in state: ${JSON.stringify(userInStorage)}`);

      // Verify entitlements by fetching through authenticated context
      const entResult = await page.evaluate(async (token) => {
        try {
          const res = await fetch("/api/v1/me/entitlements", {
            headers: { Authorization: `Bearer ${token}` }
          });
          return await res.json();
        } catch (e) {
          return { error: e.message };
        }
      }, authState?.accessToken);

      const planCode = entResult?.data?.packagePlan?.code;
      const source = entResult?.data?.source;
      const expiresAt = entResult?.data?.expiresAt;
      console.log(`  Entitlements from browser session: plan=${planCode}, source=${source}, expiresAt=${expiresAt}`);

      const pass = userInStorage?.fullName === acc.name && planCode === acc.expectedPlan;
      results.push({
        tier: acc.tier,
        name: acc.name,
        identifier: acc.identifier,
        finalUrl,
        loggedInUser: userInStorage?.fullName,
        role: userInStorage?.role,
        entitlementsPlan: planCode,
        entitlementsSource: source,
        expiresAt,
        pageErrors,
        status: pass ? "PASS" : "FAIL"
      });
    } catch (e) {
      console.error(`  ERROR testing ${acc.tier}:`, e.message);
      results.push({
        tier: acc.tier,
        name: acc.name,
        identifier: acc.identifier,
        error: e.message,
        pageErrors,
        status: "FAIL"
      });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log("\n=================================");
  console.log("PLAYWRIGHT BROWSER LOGIN SUMMARY");
  console.log("=================================");
  console.log(JSON.stringify(results, null, 2));

  const allPassed = results.every(r => r.status === "PASS");
  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
