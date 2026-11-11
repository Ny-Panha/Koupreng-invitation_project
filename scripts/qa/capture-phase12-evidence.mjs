import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";

const outDir = path.resolve("docs/phase12-analytics-settings-2026/evidence");
await fs.mkdir(outDir, { recursive: true });

const fixtureToken = [
  ...[{ alg: "none" }, { exp: 4102268800 }].map((part) =>
    Buffer.from(JSON.stringify(part)).toString("base64url"),
  ),
  "",
].join(".");

const mockInvitation = {
  id: 101,
  userId: 7,
  title: "អាពាហ៍ពិពាហ៍ តារា & សុភា",
  eventType: "WEDDING",
  hostName: "Dara",
  groomName: "តារា (Dara)",
  brideName: "សុភា (Sophea)",
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

const mockBudget = {
  items: [
    { id: 801, itemName: "កក់ទីតាំងសាលមង្គលការ (Venue Deposit)", category: "VENUE", estimatedCost: 1500, actualCost: 1500, currency: "USD", vendorName: "Tonle Bassac II" },
    { id: 802, itemName: "តុបតែងផ្កាស្រស់ និងភ្លើងលម្អ (Floral & Decor)", category: "DECORATION", estimatedCost: 800, actualCost: 750, currency: "USD", vendorName: "Floral Studio" },
    { id: 803, itemName: "ម្ហូបអាហារ និងភេសជ្ជៈ ៣០តុ (Food & Catering)", category: "FOOD", estimatedCost: 4500, actualCost: 4500, currency: "USD", vendorName: "Catering Service" },
    { id: 804, itemName: "តន្ត្រីបុរាណ និងសម័យ (Wedding Music)", category: "MUSIC", estimatedCost: 1200000, actualCost: 1200000, currency: "KHR", vendorName: "Traditional Band" },
    { id: 805, itemName: "ថតរូប និងវីដេអូអនុស្សាវរីយ៍ (Photo & Video)", category: "PHOTO_VIDEO", estimatedCost: 1000, actualCost: 950, currency: "USD", vendorName: "Koupreng Media" },
    { id: 806, itemName: "សម្លៀកបំពាក់កូនកំលោះកូនក្រមុំ (Wedding Attire)", category: "ATTIRE", estimatedCost: 600, actualCost: 600, currency: "USD", vendorName: "Khmer Bridal" },
  ],
};

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

const mockRsvps = [
  { id: 901, guestId: 501, guestName: "ឯកឧត្តម ចាន់ សុខ", responseStatus: "ATTENDING", attendeeCount: 2, message: "សូមជូនពរឱ្យមានសុភមង្គលជានិរន្តរ៍!", respondedAt: "2026-11-01T08:30:00Z" },
  { id: 902, guestId: 502, guestName: "លោកជំទាវ កែវ ម៉ាលី", responseStatus: "ATTENDING", attendeeCount: 2, message: "រីករាយថ្ងៃអាពាហ៍ពិពាហ៍!", respondedAt: "2026-11-01T09:30:00Z" },
  { id: 903, guestId: 503, guestName: "លោក សុខ វិបុល", responseStatus: "ATTENDING", attendeeCount: 1, message: "Congratulations!", respondedAt: "2026-11-02T10:00:00Z" },
];

const mockOrganizations = [
  { id: 1, name: "Koupreng Studio Wedding Team", role: "OWNER", membersCount: 4, createdAt: "2026-08-15T10:00:00Z" },
  { id: 2, name: "Royal Phnom Penh Event Planners", role: "COLLABORATOR", membersCount: 8, createdAt: "2026-09-01T12:00:00Z" },
];

const mockNotifications = [
  { id: 101, title: "ការឆ្លើយតប RSVP ថ្មី", content: "ភ្ញៀវ ឯកឧត្តម ចាន់ សុខ បានបញ្ជាក់ការចូលរួមចំនួន ២ នាក់", type: "RSVP", read: false, createdAt: "2026-11-10T09:30:00Z" },
  { id: 102, title: "ការទូទាត់ទទួលបានជោគជ័យ", content: "កញ្ចប់ Pro Package របស់អ្នកត្រូវបានដំណើរការរួចរាល់", type: "PAYMENT", read: true, createdAt: "2026-11-08T14:15:00Z" },
  { id: 103, title: "ភ្ញៀវបានបើកមើលសំបុត្រអញ្ជើញ", content: "កញ្ញា ម៉េង លីដា បានបើកមើលសំបុត្រអញ្ជើញរបស់អ្នក", type: "DELIVERY", read: true, createdAt: "2026-11-07T11:00:00Z" },
];

const mockNotificationSummary = {
  total: 3,
  unread: 1,
};

async function main() {
  console.log("=== Launching Vite Preview for Frontend User ===");
  const viteBin = path.resolve("apps/frontend-user/node_modules/vite/bin/vite.js");
  const previewProcess = spawn(process.execPath, [viteBin, "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
    cwd: path.resolve("apps/frontend-user"),
    stdio: "pipe",
    windowsHide: true,
  });

  // Wait for preview server to be ready
  await new Promise((resolve, reject) => {
    previewProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("4173") || msg.includes("Local:")) {
        resolve();
      }
    });
    previewProcess.stderr.on("data", (data) => {
      console.error("Vite preview stderr:", data.toString());
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
      if (p === "/api/v1/invitations/101" || p === "/api/v1/invitations/101/preview") {
        return reply(mockInvitation);
      }
      if (p.includes("/invitations/101/analytics")) {
        return reply(mockAnalytics);
      }
      if (p.includes("/invitations/101/budget-items") || p.includes("/invitations/101/budget")) {
        return reply(mockBudget);
      }
      if (p.includes("/invitations/101/gifts")) {
        return reply(mockGifts);
      }
      if (p.includes("/invitations/101/guests")) {
        return reply(mockGuests);
      }
      if (p.includes("/invitations/101/rsvps")) {
        return reply(mockRsvps);
      }
      if (p.includes("/invitations/101/check-in/summary") || p.includes("/invitations/101/check-in")) {
        return reply([]);
      }
      if (p.includes("/invitations/101/dashboard")) {
        return reply({ totalGuests: 120, totalInvited: 120, attending: 96, pending: 24, deliverySent: 120 });
      }
      if (p.includes("/organizations")) {
        return reply(mockOrganizations);
      }
      if (p.includes("/notifications/summary")) {
        return reply(mockNotificationSummary);
      }
      if (p.includes("/notifications")) {
        return reply(mockNotifications);
      }
      if (p.endsWith("/i18n/messages")) {
        return reply({ messages: {} });
      }
      return reply({});
    });

    return page;
  }

  const targets = [
    { name: "01-analytics-km.png", path: "/app/events/101/analytics", lang: "km", width: 1440, height: 900 },
    { name: "02-analytics-en.png", path: "/app/events/101/analytics", lang: "en", width: 1440, height: 900 },
    { name: "03-financial-reports-km.png", path: "/app/events/101/reports", lang: "km", width: 1440, height: 900 },
    { name: "04-financial-reports-en.png", path: "/app/events/101/reports", lang: "en", width: 1440, height: 900 },
    { name: "05-budget-planner-km.png", path: "/app/events/101/budget", lang: "km", width: 1440, height: 900 },
    { name: "06-budget-planner-en.png", path: "/app/events/101/budget", lang: "en", width: 1440, height: 900 },
    { name: "07-ai-assistant-km.png", path: "/app/events/101/assistant", lang: "km", width: 1440, height: 900 },
    { name: "08-ai-assistant-en.png", path: "/app/events/101/assistant", lang: "en", width: 1440, height: 900 },
    { name: "09-account-profile-km.png", path: "/app/profile", lang: "km", width: 1440, height: 900 },
    { name: "10-account-profile-en.png", path: "/app/profile", lang: "en", width: 1440, height: 900 },
    { name: "11-change-password-km.png", path: "/app/change-password", lang: "km", width: 1440, height: 900 },
    { name: "12-organizations-km.png", path: "/app/organizations", lang: "km", width: 1440, height: 900 },
    { name: "13-notifications-km.png", path: "/app/notifications", lang: "km", width: 1440, height: 900 },
    { name: "14-budget-tablet-768.png", path: "/app/events/101/budget", lang: "km", width: 768, height: 1024 },
    { name: "15-budget-mobile-375.png", path: "/app/events/101/budget", lang: "km", width: 375, height: 812 },
    { name: "16-reports-mobile-375.png", path: "/app/events/101/reports", lang: "km", width: 375, height: 812 },
    { name: "17-analytics-mobile-375.png", path: "/app/events/101/analytics", lang: "km", width: 375, height: 812 },
  ];

  for (const t of targets) {
    try {
      console.log(`Capturing: ${t.name} (${t.path})`);
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

  await browser.close();
  previewProcess.kill();
  console.log("=== Capture Complete ===");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
