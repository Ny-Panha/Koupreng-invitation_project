export const REPORT_ZONE = "Asia/Phnom_Penh";
const messages = {
  purchaseClassification: [
    "ការបែងចែកតាមប្រាក់ទទួលបានផ្ទៀងផ្ទាត់",
    "Verified purchase classification",
  ],
  paidUsers: [
    "គណនីមានប្រាក់ទទួលវិជ្ជមានបានផ្ទៀងផ្ទាត់",
    "Accounts with positive verified receipts",
  ],
  noVerifiedReceiptUsers: [
    "គណនីគ្មានប្រាក់ទទួលវិជ្ជមានបានផ្ទៀងផ្ទាត់",
    "Accounts without positive verified receipts",
  ],
  rsvpRate: ["អត្រាឆ្លើយតប RSVP", "RSVP response rate"],
  checkInRate: ["អត្រាចូលរួម", "Check-in rate"],
  guestPrivacy: [
    "បង្ហាញតែទិន្នន័យសរុបតាមកម្មវិធី។ មិនមានឈ្មោះ ឬព័ត៌មានទំនាក់ទំនងភ្ញៀវទេ។ ការផ្ញើមិនមានន័យថាបានដល់ទេ។",
    "Event aggregates only. Guest names and contact data are withheld. A send marker does not confirm delivery.",
  ],
  systemScope: [
    "បង្ហាញសកម្មភាព និងបញ្ហាដែលបានកត់ត្រា។ មិនមានទិន្នន័យសម្រាប់បញ្ជាក់ថាប្រព័ន្ធដំណើរការល្អគ្រប់ពេល ឬកំហុស API ទាំងអស់ទេ។",
    "Persisted operational events and exceptions only. Uptime and unpersisted API failures are unavailable; absence of events does not establish system health.",
  ],
  publishedInvitations: ["ធៀបការបានផ្សាយ", "Published invitations"],
  publishedRate: ["អត្រាផ្សាយ", "Published rate"],
  permission: [
    "ត្រូវការសិទ្ធិអ្នកគ្រប់គ្រងសម្រាប់របាយការណ៍នេះ",
    "Administrator report access is required",
  ],
  title: ["របាយការណ៍ និងវិភាគ", "Reports & Analytics"],
  subtitle: [
    "ទិន្នន័យពីម៉ាស៊ីនមេ • អានតែប៉ុណ្ណោះ • រូបិយប័ណ្ណបែងចែកច្បាស់",
    "Server-owned records · Read only · Separate currency ledgers",
  ],
  refresh: ["ផ្ទុកឡើងវិញ", "Refresh"],
  reset: ["កំណត់ឡើងវិញ", "Reset filters"],
  period: ["រយៈពេល", "Reporting period"],
  from: ["ចាប់ពី", "From"],
  through: ["ដល់ថ្ងៃ", "Through date"],
  today: ["ថ្ងៃនេះ", "Today"],
  last7: ["៧ ថ្ងៃចុងក្រោយ", "Last 7 days"],
  last30: ["៣០ ថ្ងៃចុងក្រោយ", "Last 30 days"],
  thisMonth: ["ខែនេះ", "This month"],
  previousMonth: ["ខែមុន", "Previous month"],
  thisYear: ["ឆ្នាំនេះ", "This year"],
  custom: ["កំណត់ផ្ទាល់", "Custom range"],
  dimension: ["ប្រភេទកាលបរិច្ឆេទ", "Date dimension"],
  apply: ["អនុវត្ត", "Apply"],
  search: ["ស្វែងរក", "Search records"],
  all: ["ទាំងអស់", "All"],
  eventType: ["ប្រភេទកម្មវិធី", "Event type"],
  status: ["ស្ថានភាព", "Status"],
  moderationStatus: ["ការត្រួតពិនិត្យ", "Moderation status"],
  paymentType: ["ប្រភេទការទិញ", "Product type"],
  paymentStatus: ["ស្ថានភាពទូទាត់", "Payment status"],
  provider: ["អ្នកផ្តល់សេវា", "Payment provider"],
  currency: ["រូបិយប័ណ្ណ", "Currency"],
  packageId: ["លេខកញ្ចប់", "Package ID"],
  createdAt: ["ថ្ងៃបង្កើត", "Created date"],
  paidAt: ["ថ្ងៃទូទាត់", "Paid date"],
  confirmedAt: ["ថ្ងៃបញ្ជាក់", "Verified date"],
  eventDate: ["ថ្ងៃកម្មវិធី", "Event date"],
  publishedAt: ["ថ្ងៃផ្សាយ", "Published date"],
  activePeriod: ["រយៈពេលសមាជិកភាព", "Active-period overlap"],
  activity: ["សកម្មភាពតាមនិយមន័យ", "Activity date (see definition)"],
  metric: ["តាមសូចនាករនីមួយៗ", "Per metric definition"],
  definition: ["កំណែវចនានុក្រម", "Definition version"],
  excel: ["ទាញយក Excel", "Download Excel"],
  csvAll: ["CSV ទិន្នន័យចម្រាញ់ទាំងអស់", "CSV · All filtered records"],
  csvPage: ["CSV ទំព័រនេះ", "CSV · Current page"],
  workbook: [
    "Excel គ្រប់របាយការណ៍តាមរយៈពេល",
    "Excel · All reports (period only)",
  ],
  preview: ["មើលមុនបោះពុម្ព", "Print preview"],
  print: ["បោះពុម្ព / រក្សាទុកជា PDF", "Print / Save as PDF"],
  close: ["បិទ", "Close"],
  orientation: ["ទិសក្រដាស", "Page orientation"],
  portrait: ["បញ្ឈរ A4", "A4 portrait"],
  landscape: ["ផ្តេក A4", "A4 landscape"],
  zoom: ["កម្រិតពង្រីក", "Preview zoom"],
  columns: ["ជួរឈរ", "Columns"],
  details: ["ព័ត៌មានលម្អិត", "View details"],
  select: ["ជ្រើសរើសជួរដេក", "Select row"],
  copy: ["ចម្លងជួរដេកដែលបានជ្រើស", "Copy selected rows"],
  copied: ["បានចម្លង", "Rows copied"],
  copyFailed: ["មិនអាចចម្លងបានទេ", "Clipboard unavailable"],
  previous: ["មុន", "Previous"],
  next: ["បន្ទាប់", "Next"],
  pageSize: ["ចំនួនក្នុងទំព័រ", "Rows per page"],
  count: ["ចំនួន", "Count"],
  matching: ["កំណត់ត្រាត្រូវនឹងលក្ខខណ្ឌ", "Matching records"],
  pageScope: ["ទិន្នន័យទំព័រនេះ", "Current-page rows"],
  fullScope: ["សរុបទិន្នន័យចម្រាញ់ទាំងអស់", "Full filtered totals"],
  loading: ["កំពុងផ្ទុករបាយការណ៍…", "Loading report…"],
  empty: ["មិនមានទិន្នន័យត្រូវនឹងលក្ខខណ្ឌទេ", "No records match these filters"],
  unavailable: ["មិនមានទិន្នន័យ", "Unavailable"],
  retry: ["សាកម្ដងទៀត", "Try again"],
  stale: [
    "កំពុងបង្ហាញទិន្នន័យដែលផ្ទុកជោគជ័យមុន។ ការនាំចេញត្រូវបានបិទរហូតដល់ផ្ទុកជោគជ័យ។",
    "Showing the last successful snapshot. Exports are disabled until refresh succeeds.",
  ],
  exporting: [
    "កំពុងបង្កើតឯកសារតាមលក្ខខណ្ឌនៅពេលចាប់ផ្តើម…",
    "Preparing export with filters captured when it began…",
  ],
  exported: ["បានទាញយកឯកសារ", "Report downloaded"],
  exportError: ["មិនអាចបង្កើតឯកសារបានទេ", "Could not create the report file"],
  totalUsers: ["អ្នកប្រើប្រាស់សរុប", "Registered users"],
  activeUsers: ["គណនីបានបើក", "Enabled accounts"],
  totalInvitations: ["ធៀបការក្នុងរយៈពេល", "Invitations in period"],
  totalGuests: ["ភ្ញៀវក្នុងក្រុមកម្មវិធី", "Guests in event cohort"],
  totalRsvps: ["ចម្លើយពីភ្ញៀវ", "Guest-linked responses"],
  totalCheckIns: ["ភ្ញៀវបានចូល", "Checked-in guests"],
  activeSubscriptions: [
    "សមាជិកភាពមានសុពលភាព",
    "Effective active subscriptions",
  ],
  periodGrowth: ["កំណើនរយៈពេលប្រៀបធៀប", "Comparable-period growth"],
  confirmedReceipts: ["ប្រាក់ទទួលបានផ្ទៀងផ្ទាត់", "Verified cash receipts"],
  pendingValue: ["តម្លៃបញ្ជាទិញរង់ចាំ", "Pending order value"],
  failedValue: ["តម្លៃបញ្ជាទិញបរាជ័យ", "Failed / rejected order value"],
  snapshot: ["កំណត់ត្រារបាយការណ៍", "Report snapshot"],
  notes: ["និយមន័យ និងកំណត់សម្គាល់", "Definitions & data notes"],
  noActivity: ["មិនមានរយៈពេលគោលសម្រាប់គណនា", "No comparable denominator"],
  transitionsUnavailable: [
    "មិនមានប្រវត្តិច្បាស់សម្រាប់គណនាការបន្ត ដំឡើង ឬទម្លាក់កញ្ចប់ទេ។",
    "Renewal, upgrade and downgrade metrics are unavailable without explicit transition history.",
  ],
  eventCreation: ["ការបង្កើតកម្មវិធី", "Event creation"],
  creation: ["កំណត់ត្រាបង្កើតថ្មី", "New records"],
  verifiedReceipts: ["ការទូទាត់បានផ្ទៀងផ្ទាត់", "Verified payments"],
  eventCategoryBreakdown: ["ប្រភេទកម្មវិធី", "Event categories"],
  categories: ["ប្រភេទគំរូ", "Template categories"],
  topUsage: ["គំរូប្រើច្រើន", "Most-used templates"],
  topPurchases: ["គំរូទិញច្រើន", "Top verified purchases"],
  accountStatuses: ["ស្ថានភាពគណនី", "Account statuses"],
  activeStates: ["ស្ថានភាពសមាជិកភាព", "Subscription states"],
  outcomes: ["លទ្ធផលផ្ទៀងផ្ទាត់", "Reconciliation outcomes"],
  statuses: ["ស្ថានភាពទូទាត់", "Payment statuses"],
  suppressed: [
    "ចំនួនទឹកប្រាក់ត្រូវបានលាក់៖ តិចជាង ៥ ប្រតិបត្តិការ",
    "Amount suppressed: fewer than 5 payments",
  ],
};
export const reportText = (key, lang = "km") =>
  messages[key]?.[lang === "en" ? 1 : 0] || key;
export function addDays(value, days) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function reportPreset(preset, now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const tomorrow = addDays(today, 1),
    month = `${today.slice(0, 7)}-01`;
  if (preset === "today") return { from: today, to: tomorrow };
  if (preset === "last7") return { from: addDays(today, -6), to: tomorrow };
  if (preset === "thisMonth") return { from: month, to: tomorrow };
  if (preset === "previousMonth")
    return { from: `${addDays(month, -1).slice(0, 7)}-01`, to: month };
  if (preset === "thisYear")
    return { from: `${today.slice(0, 4)}-01-01`, to: tomorrow };
  return { from: addDays(today, -29), to: tomorrow };
}
export function reportValue(value, column = {}, lang = "km", row = {}) {
  if (value === null || value === undefined || value === "")
    return reportText("unavailable", lang);
  if (column.type === "DATETIME") {
    const date = new Date(typeof value === "number" ? value * 1000 : value);
    return Number.isNaN(date.getTime())
      ? reportText("unavailable", lang)
      : new Intl.DateTimeFormat("en-GB", {
          timeZone: REPORT_ZONE,
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
  }
  if (column.type === "DATE" && Array.isArray(value))
    return value
      .map((part, index) => (index ? String(part).padStart(2, "0") : part))
      .join("-");
  if (column.type === "PERCENT")
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(Number(value));
  if (column.type === "MONEY")
    return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value))}${row.currency ? ` ${row.currency}` : column.key?.endsWith("Khr") ? " KHR" : column.key?.endsWith("Usd") ? " USD" : ""}`;
  if (column.type === "NUMBER")
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(
      Number(value),
    );
  return String(value);
}
export const reportLabel = (definition, lang) =>
  lang === "en" ? definition.titleEn : definition.titleKm;
export const columnLabel = (column, lang) =>
  lang === "en" ? column.labelEn : column.labelKm;
export function safeTsv(value) {
  let text = value == null ? "" : String(value);
  if (/^[\s\p{Cc}\p{Cf}]*[=+\-@＝＋－＠]/u.test(text) || /^[\t\r\n]/.test(text))
    text = `'${text}`;
  return text.replace(/[\t\r\n]/g, " ");
}
