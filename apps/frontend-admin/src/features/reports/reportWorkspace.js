import { addDays, reportText, reportValue } from "./reportModel";
import { EVENT_CATEGORIES, eventTypeLabel } from "./reportConstants";

export const reportGroups = [
  { key: "overview", codes: ["executive"] },
  { key: "finance", codes: ["payments", "reconciliation"] },
  { key: "events", codes: ["invitations", "engagement"] },
  { key: "customers", codes: ["users", "subscriptions"] },
  { key: "performance", codes: ["templates"] },
  { key: "operations", codes: ["system", "dictionary"] },
];

const copy = {
  overview: ["ទិដ្ឋភាពទូទៅ", "Overview"],
  finance: ["ហិរញ្ញវត្ថុ", "Finance"],
  events: ["កម្មវិធី", "Events"],
  customers: ["អតិថិជន", "Customers"],
  performance: ["ប្រសិទ្ធភាព", "Performance"],
  operations: ["ប្រតិបត្តិការ", "Operations"],
  chooseReport: ["ជ្រើសរបាយការណ៍", "Choose a report"],
  workspace: ["កន្លែងធ្វើការរបាយការណ៍", "Reporting workspace"],
  exportReport: ["នាំចេញរបាយការណ៍", "Export report"],
  moreFilters: ["លក្ខខណ្ឌបន្ថែម", "More filters"],
  clearFilters: ["សម្អាតលក្ខខណ្ឌ", "Clear filters"],
  applyFilters: ["អនុវត្តលក្ខខណ្ឌ", "Apply filters"],
  cancel: ["បោះបង់", "Cancel"],
  advancedHint: [
    "កែប្រែលក្ខខណ្ឌ រួចចុចអនុវត្ត។ ទិន្នន័យមិនផ្លាស់ប្តូរមុនពេលអនុវត្តទេ។",
    "Adjust these controls, then apply. Your report stays unchanged until you apply.",
  ],
  periodHint: [
    "រួមបញ្ចូលថ្ងៃចាប់ផ្ដើម និងថ្ងៃបញ្ចប់ · ម៉ោងភ្នំពេញ",
    "Both dates included · Phnom Penh time",
  ],
  dateScope: ["កាលបរិច្ឆេទដែលបានប្រើ", "Dates based on"],
  customHint: [
    "ជ្រើសរើសថ្ងៃចាប់ផ្ដើម និងថ្ងៃបញ្ចប់",
    "Choose a complete date range",
  ],
  createdAtHint: [
    "រាប់តែកំណត់ត្រាដែលបានបង្កើតក្នុងរយៈពេលនេះ។",
    "Records created during this reporting period.",
  ],
  paidAtHint: [
    "ប្រើថ្ងៃដែលបានកត់ត្រាថាទូទាត់ មិនមែនថ្ងៃបង្កើតបញ្ជាទិញទេ។",
    "Uses the recorded payment date, rather than the order creation date.",
  ],
  eventDateHint: [
    "ជ្រើសកម្មវិធីតាមថ្ងៃប្រារព្ធ។",
    "Selects events by their scheduled event date.",
  ],
  publishedAtHint: [
    "ប្រើថ្ងៃផ្សាយធៀប។",
    "Uses the invitation publication date.",
  ],
  confirmedAtHint: [
    "ប្រើថ្ងៃបញ្ជាក់ការទូទាត់ដែលបានរក្សាទុក។",
    "Uses the persisted payment confirmation date.",
  ],
  activityHint: [
    "ប្រើថ្ងៃទូទាត់សម្រាប់កំណត់ត្រាបានទូទាត់ និងថ្ងៃបង្កើតសម្រាប់កំណត់ត្រាផ្សេង។ សូមមើលនិយមន័យតាមរបាយការណ៍។",
    "For payments: payment date for paid orders, creation date otherwise. Other reports use their documented activity basis.",
  ],
  activePeriodHint: [
    "សមាជិកភាពដែលរយៈពេលសុពលភាពត្រួតគ្នាជាមួយរយៈពេលនេះ។",
    "Subscriptions whose validity window overlaps this period.",
  ],
  metricHint: [
    "ប្រាក់ទទួលប្រើថ្ងៃទូទាត់។ កម្មវិធីប្រើថ្ងៃបង្កើត។ ចំនួនគណនី និងសមាជិកភាពសកម្មជាស្ថានភាពបច្ចុប្បន្ន។",
    "Receipts use payment dates; events use creation dates. Account and active-subscription totals are current snapshots.",
  ],
  definitionHint: [
    "និយមន័យបច្ចុប្បន្ន មិនមែនទិន្នន័យសកម្មភាពតាមរយៈពេលទេ។",
    "Current metric definitions, rather than period activity.",
  ],
  removeFilter: ["ដកលក្ខខណ្ឌ", "Remove filter"],
  xlsxHint: [
    "កំណត់ត្រាទាំងអស់តាមលក្ខខណ្ឌ រួមនឹងសេចក្តីសង្ខេប និងនិយមន័យ",
    "Every filtered record, summary and metric definitions",
  ],
  csvAllHint: [
    "កំណត់ត្រាទាំងអស់តាមលក្ខខណ្ឌ មិនមែនត្រឹមទំព័រនេះទេ",
    "Every matching record, across all pages",
  ],
  csvPageHint: [
    "តែកំណត់ត្រានៅទំព័របច្ចុប្បន្ន",
    "Only the records on this page",
  ],
  pdfHint: [
    "មើលឯកសារ A4 ជាមុន រួចបោះពុម្ព ឬរក្សាទុកជា PDF",
    "Preview an A4 document, then print or save as PDF",
  ],
  workbookHint: [
    "របាយការណ៍ទាំង ១០ តាមរយៈពេល។ មិនប្រើលក្ខខណ្ឌរបស់របាយការណ៍នេះទេ។",
    "All 10 reports for this period. Other report filters do not apply.",
  ],
  records: ["កំណត់ត្រា", "Records"],
  selectHint: [
    "ជ្រើសកំណត់ត្រា ដើម្បីចម្លងទៅសៀវភៅបញ្ជី",
    "Select records to copy into a spreadsheet",
  ],
  selected: ["បានជ្រើស", "selected"],
  noRecords: ["មិនមានកំណត់ត្រាក្នុងរយៈពេលនេះទេ", "No records in this period"],
  emptyHint: [
    "សាកល្បងរយៈពេលផ្សេង ឬសម្អាតលក្ខខណ្ឌ។",
    "Try another reporting period or clear your filters.",
  ],
  dataTable: ["មើលទិន្នន័យ", "View data"],
  moreBreakdowns: ["ការវិភាគបន្ថែម", "More breakdowns"],
  countAxis: ["ចំនួនកំណត់ត្រា", "Number of records"],
  monthAxis: ["ខែ · ម៉ោងភ្នំពេញ", "Month · Phnom Penh time"],
  onePoint: [
    "មានតែមួយខែ។ មិនអាចសន្និដ្ឋានអំពីនិន្នាការបានទេ។",
    "One recorded month; a trend cannot be inferred.",
  ],
  currentSnapshot: [
    "ស្ថានភាពនៅពេលបង្កើតរបាយការណ៍",
    "At the time this report was generated",
  ],
  cashHint: [
    "តែប្រាក់បានផ្ទៀងផ្ទាត់ និងត្រូវគ្នាប៉ុណ្ណោះ",
    "Trusted, matched receipts only",
  ],
  pendingHint: [
    "តម្លៃបញ្ជាទិញ · មិនមែនប្រាក់បានទទួល",
    "Order value · not confirmed cash",
  ],
  exceptionHint: [
    "ប្រៀបធៀបស្ថានភាពទូទាត់ និងលទ្ធផលផ្ទៀងផ្ទាត់ក្នុងព័ត៌មានលម្អិត។",
    "Compare payment status with reconciliation outcome. Open a record for its audit metadata.",
  ],
  loadingReport: ["កំពុងទាញយករបាយការណ៍", "Loading report"],
  refreshing: ["កំពុងផ្ទុកទិន្នន័យថ្មី…", "Refreshing this report…"],
  snapshotInfo: ["ព័ត៌មានអំពីទិន្នន័យ", "About this snapshot"],
  executivePurpose: [
    "មើលប្រាក់បានទទួល ការបង្កើតកម្មវិធី និងស្ថានភាពគណនីក្នុងរយៈពេលតែមួយ។",
    "Review verified receipts, event creation and account health in one place.",
  ],
  paymentsPurpose: [
    "ស្វែងរកការទូទាត់ និងប្រៀបធៀបតម្លៃបញ្ជាទិញជាមួយប្រាក់បានទទួល។",
    "Find a payment and compare order value with verified receipts.",
  ],
  reconciliationPurpose: [
    "ពិនិត្យការទូទាត់រង់ចាំ និងករណីមិនត្រូវគ្នា ដោយមិនកែប្រែប្រតិបត្តិការ។",
    "Investigate review queues and mismatches without changing payment records.",
  ],
  invitationsPurpose: [
    "ស្វែងរកកម្មវិធី ពិនិត្យការផ្សាយ និងមើលសកម្មភាពភ្ញៀវ។",
    "Find an event, check its publication status and inspect guest activity.",
  ],
  engagementPurpose: [
    "តាមដានការឆ្លើយតប និងការចូលរួមរបស់ភ្ញៀវក្នុងកម្មវិធីដែលបានជ្រើស។",
    "Understand guest responses and check-ins for the selected event cohort.",
  ],
  usersPurpose: [
    "មើលគណនីក្នុងរយៈពេលចុះឈ្មោះ និងប្រវត្តិទិញដែលបានផ្ទៀងផ្ទាត់។",
    "Review a registration cohort and its verified purchase history.",
  ],
  subscriptionsPurpose: [
    "ពិនិត្យសមាជិកភាព សុពលភាពកញ្ចប់ និងស្ថានភាពទូទាត់។",
    "Inspect subscriptions, package validity and payment status.",
  ],
  templatesPurpose: [
    "មើលគំរូដែលបានប្រើ និងបានទិញ ដោយរក្សារូបិយប័ណ្ណដាច់ពីគ្នា។",
    "Compare template usage and verified purchases, with currencies kept separate.",
  ],
  systemPurpose: [
    "ពិនិត្យព្រឹត្តិការណ៍ និងករណីលើកលែងដែលប្រព័ន្ធបានរក្សាទុក។",
    "Inspect persisted operational events and exceptions.",
  ],
  dictionaryPurpose: [
    "ស្វែងយល់ពីរបៀបគណនា ប្រភពទិន្នន័យ និងដែនកំណត់របស់សូចនាករ។",
    "Understand each metric’s calculation, source and limitations.",
  ],
};
const statuses = {
  ACTIVE: ["សកម្ម", "Active"],
  INACTIVE: ["អសកម្ម", "Inactive"],
  DISABLED: ["បានបិទ", "Disabled"],
  PUBLISHED: ["បានផ្សាយ", "Published"],
  DRAFT: ["ព្រាង", "Draft"],
  UNPUBLISHED: ["មិនទាន់ផ្សាយ", "Unpublished"],
  ARCHIVED: ["បណ្ណសារ", "Archived"],
  PENDING: ["រង់ចាំ", "Pending"],
  PENDING_PAYMENT: ["រង់ចាំទូទាត់", "Awaiting payment"],
  PAID_PENDING_REVIEW: ["រង់ចាំពិនិត្យ", "Pending review"],
  REVIEW_REQUIRED: ["ត្រូវពិនិត្យ", "Review required"],
  PENDING_REVIEW: ["រង់ចាំពិនិត្យ", "Pending review"],
  PAID: ["បានកត់ត្រាថាទូទាត់", "Marked paid"],
  MATCHED: ["ផ្ទៀងផ្ទាត់ត្រូវគ្នា", "Verified match"],
  UNMATCHED: ["មិនទាន់ផ្ទៀងផ្ទាត់", "Unmatched"],
  AMOUNT_MISMATCH: ["ចំនួនប្រាក់មិនត្រូវគ្នា", "Amount mismatch"],
  DUPLICATE: ["ស្ទួន", "Duplicate"],
  FAILED: ["បរាជ័យ", "Failed"],
  REJECTED: ["បានបដិសេធ", "Rejected"],
  CANCELLED: ["បានលុបចោល", "Cancelled"],
  EXPIRED: ["ផុតកំណត់", "Expired"],
  REPLACED: ["បានជំនួស", "Replaced"],
  UNKNOWN: ["មិនស្គាល់", "Unknown"],
  QR_CREATED: ["បានបង្កើត QR", "QR created"],
  CHECKOUT_CREATED: ["បានបង្កើតការបញ្ជាទិញ", "Checkout created"],
  HIDDEN: ["បានលាក់", "Hidden"],
  REPORTED: ["មានរបាយការណ៍", "Reported"],
  SUSPENDED: ["បានផ្អាក", "Suspended"],
  WEDDING: ["មង្គលការ", "Wedding"],
  ENGAGEMENT: ["ភ្ជាប់ពាក្យ", "Engagement"],
  BIRTHDAY: ["ខួបកំណើត", "Birthday"],
  ANNIVERSARY: ["ខួបអនុស្សាវរីយ៍", "Anniversary"],
  CORPORATE: ["កម្មវិធីក្រុមហ៊ុន", "Corporate"],
  OTHER: ["ផ្សេងៗ", "Other"],
  TEMPLATE: ["គំរូធៀប", "Template"],
  SUBSCRIPTION: ["សមាជិកភាព", "Subscription"],
  FREE: ["ឥតគិតថ្លៃ", "Free"],
  PREMIUM: ["ពិសេស", "Premium"],
  PERSISTED_CONFIRMATION: [
    "មានការបញ្ជាក់បានរក្សាទុក",
    "Persisted confirmation",
  ],
  NOT_VERIFIED: ["មិនទាន់ផ្ទៀងផ្ទាត់", "Not verified"],
};
export const workspaceText = (key, lang = "km") =>
  copy[key]?.[lang === "en" ? 1 : 0] || reportText(key, lang);
export const valueLabel = (value, lang) =>
  EVENT_CATEGORIES.some((item) => item.key === value) ? eventTypeLabel(value, lang) : statuses[value]?.[lang === "en" ? 1 : 0] || String(value ?? "");
export function displayValue(value, column, lang, row) {
  return value != null &&
    /^(status|paymentStatus|moderationStatus|activeState|reconciliationOutcome|eventType|productType|classification|verificationResult|subscriptionStatus|category)$/.test(
      column.key,
    )
    ? valueLabel(value, lang)
    : reportValue(value, column, lang, row);
}
export function periodLabel(from, to, lang) {
  const normalize = (value) =>
    Array.isArray(value)
      ? value
          .map((part, index) => (index ? String(part).padStart(2, "0") : part))
          .join("-")
      : value;
  from = normalize(from);
  to = normalize(to);
  if (
    !from ||
    !to ||
    !addDays(to, -1) ||
    Number.isNaN(new Date(`${from}T00:00:00Z`).getTime())
  )
    return workspaceText("customHint", lang);
  const formatter = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "km-KH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    calendar: "gregory",
  });
  return `${formatter.format(new Date(`${from}T00:00:00Z`))} – ${formatter.format(new Date(`${addDays(to, -1)}T00:00:00Z`))}`;
}
export const priorityColumns = {
  executive: ["label", "value", "unit", "basis"],
  payments: [
    "orderCode",
    "productName",
    "paymentStatus",
    "expectedAmount",
    "paidAmount",
    "currency",
    "reconciliationOutcome",
  ],
  reconciliation: [
    "orderCode",
    "paymentStatus",
    "expectedAmount",
    "paidAmount",
    "currency",
    "reconciliationOutcome",
    "providerReference",
  ],
  invitations: [
    "title",
    "eventType",
    "status",
    "eventDate",
    "guestCount",
    "rsvpCount",
  ],
  engagement: [
    "title",
    "guestCount",
    "sentCount",
    "openedCount",
    "rsvpCount",
    "checkedInCount",
  ],
  users: [
    "displayName",
    "status",
    "createdAt",
    "invitationCount",
    "confirmedPurchases",
    "currentPackage",
  ],
  subscriptions: [
    "orderCode",
    "packageName",
    "paymentStatus",
    "activeState",
    "startDate",
    "endDate",
  ],
  templates: [
    "name",
    "category",
    "status",
    "usageCount",
    "verifiedPurchases",
    "receiptsUsd",
    "receiptsKhr",
  ],
  system: ["createdAt", "source", "severity", "action", "status", "message"],
  dictionary: [
    "labelKm",
    "labelEn",
    "definition",
    "calculation",
    "missingDataBehavior",
  ],
};
