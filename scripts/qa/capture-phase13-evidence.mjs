import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";

const outDir = path.resolve("docs/phase13-responsive-a11y-performance-2026/evidence");
await fs.mkdir(outDir, { recursive: true });

const fixtureToken = [
  ...[{ alg: "none" }, { exp: 4102268800 }].map((part) =>
    Buffer.from(JSON.stringify(part)).toString("base64url"),
  ),
  "",
].join(".");

const mockInvitation = {
  id: 70,
  userId: 7,
  title: "អាពាហ៍ពិពាហ៍ តារា & សុភា",
  eventType: "WEDDING",
  hostName: "Dara Rath",
  groomName: "ជា តារា",
  brideName: "ស៊ូ សុភា",
  status: "PUBLISHED",
  templateId: 30,
  templateCode: "event-essential",
  eventDate: "2026-12-20",
  eventTime: "17:30:00",
  venueName: "ភោជនីយដ្ឋានទន្លេបាសាក់ ២",
  visibility: "PUBLIC",
  languageMode: "BOTH",
  slug: "dara-sophea-2026",
};

const mockAnalytics = {
  from: "2026-10-15",
  to: "2026-11-13",
  timezone: "Asia/Phnom_Penh",
  current: {
    guestRecords: 120,
    reservedSeats: 150,
    respondedRecords: 96,
    confirmedAttendees: 135,
    checkedInRecords: 88,
  },
  days: [
    { date: "2026-11-01", guestRecordsCreated: 15, latestRsvpRecords: 12, attendingRecords: 10, declinedRecords: 1, maybeRecords: 1, activeCheckInRecords: 0 },
    { date: "2026-11-02", guestRecordsCreated: 20, latestRsvpRecords: 18, attendingRecords: 16, declinedRecords: 0, maybeRecords: 2, activeCheckInRecords: 0 },
    { date: "2026-11-03", guestRecordsCreated: 10, latestRsvpRecords: 25, attendingRecords: 22, declinedRecords: 2, maybeRecords: 1, activeCheckInRecords: 0 },
    { date: "2026-11-04", guestRecordsCreated: 5, latestRsvpRecords: 30, attendingRecords: 28, declinedRecords: 1, maybeRecords: 1, activeCheckInRecords: 0 },
    { date: "2026-11-05", guestRecordsCreated: 12, latestRsvpRecords: 11, attendingRecords: 10, declinedRecords: 1, maybeRecords: 0, activeCheckInRecords: 0 },
  ],
};

const mockMixedBudget = {
  totalBudget: 5000,
  currency: null,
  totalsComparable: false,
  totalEstimated: null,
  totalActual: null,
  remainingBudget: null,
  estimatedByCurrency: { USD: 3000, KHR: 4800000 },
  actualByCurrency: { USD: 3200, KHR: 5600000 },
  items: [
    { id: 801, itemName: "កក់ទីតាំងសាលមង្គលការ", category: "VENUE", estimatedCost: 1500, actualCost: 1500, currency: "USD", vendorName: "Tonle Bassac II" },
    { id: 802, itemName: "តុបតែងផ្កាស្រស់ និងភ្លើងលម្អ", category: "DECORATION", estimatedCost: 800, actualCost: 750, currency: "USD", vendorName: "Floral Studio" },
    { id: 803, itemName: "ម្ហូបអាហារ និងភេសជ្ជៈ ៣០តុ", category: "FOOD", estimatedCost: 4800000, actualCost: 5600000, currency: "KHR", vendorName: "Catering Service" },
    { id: 804, itemName: "សម្លៀកបំពាក់កូនកំលោះកូនក្រមុំ", category: "ATTIRE", estimatedCost: 700, actualCost: 950, currency: "USD", vendorName: "Khmer Bridal" },
  ],
};

const mockExpenses = [
  { id: 701, title: "ប្រាក់កក់ភោជនីយដ្ឋាន", category: "VENUE", actualCost: 1500, currency: "USD", expenseDate: "2026-10-15" },
  { id: 702, title: "គ្រឿងតុបតែងផ្កា", category: "DECORATION", actualCost: 750, currency: "USD", expenseDate: "2026-10-20" },
  { id: 703, title: "ម្ហូប និងភេសជ្ជៈ", category: "FOOD", actualCost: 5600000, currency: "KHR", expenseDate: "2026-11-01" },
];

const mockGifts = [
  { id: 601, guestId: 501, guestName: "ឯកឧត្តម ចាន់ សុខ", amount: 100, currency: "USD", method: "ABA", giftType: "MONEY", recordedAt: "2026-11-01" },
  { id: 602, guestId: 502, guestName: "លោកជំទាវ កែវ ម៉ាលី", amount: 200000, currency: "KHR", method: "CASH", giftType: "MONEY", recordedAt: "2026-11-01" },
  { id: 603, guestId: 503, guestName: "លោក សុខ វិបុល", amount: 50, currency: "USD", method: "ABA", giftType: "MONEY", recordedAt: "2026-11-02" },
  { id: 604, guestId: 504, guestName: "កញ្ញា ម៉េង លីដា", amount: 120000, currency: "KHR", method: "ABA", giftType: "MONEY", recordedAt: "2026-11-02" },
];

const mockGuests = [
  { id: 501, guestName: "ឯកឧត្តម ចាន់ សុខ", seatCount: 2, rsvpStatus: "ATTENDING", sendStatus: "SENT" },
  { id: 502, guestName: "លោកជំទាវ កែវ ម៉ាលី", seatCount: 2, rsvpStatus: "ATTENDING", sendStatus: "SENT" },
  { id: 503, guestName: "លោក សុខ វិបុល", seatCount: 1, rsvpStatus: "ATTENDING", sendStatus: "SENT" },
  { id: 504, guestName: "កញ្ញា ម៉េង លីដា", seatCount: 1, rsvpStatus: "ATTENDING", sendStatus: "OPENED" },
];

async function main() {
  console.log("=== Launching Vite Preview for Frontend User ===");
  const viteBin = path.resolve("apps/frontend-user/node_modules/vite/bin/vite.js");
  const previewProcess = spawn(process.execPath, [viteBin, "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
    cwd: path.resolve("apps/frontend-user"),
    stdio: "pipe",
    windowsHide: true,
  });

  await new Promise((resolve) => {
    previewProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("4173") || msg.includes("Local:")) {
        resolve();
      }
    });
    setTimeout(resolve, 3000);
  });

  console.log("=== Launching Playwright Chromium ===");
  const browser = await chromium.launch();

  async function createConfiguredPage(lang = "km", width = 1440, height = 900) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    await page.addInitScript(
      ({ token, lang }) => {
        sessionStorage.setItem(
          "koupreng.auth",
          JSON.stringify({
            accessToken: token,
            user: { id: 7, fullName: "Dara Rath", email: "dara@example.test", role: "USER" },
          }),
        );
        localStorage.setItem("koupreng.lang", lang);
      },
      { token: fixtureToken, lang },
    );

    await page.route("**/api/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const p = url.pathname;
      const reply = (data, status = 200) =>
        route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });

      if (p.includes("/auth/me") || p.includes("/users/profile") || p.includes("/users/me")) {
        return reply({ id: 7, fullName: "Dara Rath", email: "dara@example.test", phone: "012 345 678", role: "USER" });
      }
      if (p.endsWith("/invitations/my")) {
        return reply([mockInvitation]);
      }
      if (p.includes("/invitations/70/preview") || p === "/api/v1/invitations/70") {
        return reply(mockInvitation);
      }
      if (p.includes("/invitations/70/analytics") || p.includes("/analytics/events/70")) {
        return reply(mockAnalytics);
      }
      if (p.includes("/invitations/70/budget-items") || p.includes("/invitations/70/budget")) {
        return reply(mockMixedBudget);
      }
      if (p.includes("/invitations/70/expenses")) {
        return reply(mockExpenses);
      }
      if (p.includes("/invitations/70/gifts")) {
        return reply(mockGifts);
      }
      if (p.includes("/invitations/70/guests")) {
        return reply(mockGuests);
      }
      if (p.includes("/invitations/70/dashboard")) {
        return reply({ totalGuests: 120, totalInvited: 120, attending: 96, pending: 24, deliverySent: 120 });
      }
      if (p.endsWith("/i18n/messages")) {
        return reply({ messages: {} });
      }
      return reply({});
    });

    return page;
  }

  const targets = [
    { name: "01-marketing-desktop-1440-km.png", path: "/", lang: "km", width: 1440, height: 900 },
    { name: "02-marketing-mobile-375-km.png", path: "/", lang: "km", width: 375, height: 812 },
    { name: "03-marketing-narrow-320-km.png", path: "/", lang: "km", width: 320, height: 600 },
    { name: "04-dashboard-desktop-1440-km.png", path: "/app/events/70", lang: "km", width: 1440, height: 900 },
    { name: "05-dashboard-tablet-768-km.png", path: "/app/events/70", lang: "km", width: 768, height: 1024 },
    { name: "06-dashboard-narrow-320-km.png", path: "/app/events/70", lang: "km", width: 320, height: 700 },
    { name: "07-budget-mixed-km-1440.png", path: "/app/events/70/budget", lang: "km", width: 1440, height: 900 },
    { name: "08-budget-mixed-en-1440.png", path: "/app/events/70/budget", lang: "en", width: 1440, height: 900 },
    { name: "09-budget-mobile-320-km.png", path: "/app/events/70/budget", lang: "km", width: 320, height: 700 },
    { name: "10-analytics-desktop-1440-km.png", path: "/app/events/70/attendance-analytics", lang: "km", width: 1440, height: 900 },
    { name: "11-analytics-narrow-360-km.png", path: "/app/events/70/attendance-analytics", lang: "km", width: 360, height: 740 },
    { name: "12-analytics-fold-280-km.png", path: "/app/events/70/attendance-analytics", lang: "km", width: 280, height: 653 },
    { name: "13-expenses-narrow-320-km.png", path: "/app/events/70/expenses", lang: "km", width: 320, height: 700 },
    { name: "14-gifts-narrow-320-km.png", path: "/app/events/70/gifts", lang: "km", width: 320, height: 700 },
    { name: "15-studio-desktop-1440-km.png", path: "/app/events/70/invitation", lang: "km", width: 1440, height: 900 },
    { name: "16-studio-tablet-768-km.png", path: "/app/events/70/invitation", lang: "km", width: 768, height: 1024 },
    { name: "17-studio-mobile-375-km.png", path: "/app/events/70/invitation", lang: "km", width: 375, height: 812 },
    { name: "18-studio-ultrawide-2560-km.png", path: "/app/events/70/invitation", lang: "km", width: 2560, height: 1080 },
  ];

  for (const t of targets) {
    try {
      console.log(`Capturing: ${t.name} (${t.path} @ ${t.width}x${t.height})`);
      const page = await createConfiguredPage(t.lang, t.width, t.height);
      await page.goto(`http://127.0.0.1:4173${t.path}`, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(600);
      const filePath = path.join(outDir, t.name);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved: ${filePath}`);
      await page.context().close();
    } catch (err) {
      console.error(`Failed to capture ${t.name}:`, err.message);
    }
  }

  // Also capture focused skip link
  try {
    console.log("Capturing: 19-marketing-skip-link-focused.png");
    const page = await createConfiguredPage("km", 1440, 900);
    await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    await page.waitForTimeout(300);
    const filePath = path.join(outDir, "19-marketing-skip-link-focused.png");
    await page.screenshot({ path: filePath });
    console.log(`Saved: ${filePath}`);
    await page.context().close();
  } catch (err) {
    console.error("Failed to capture skip link:", err.message);
  }

  await browser.close();
  previewProcess.kill();
  console.log("=== Capture Complete ===");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
