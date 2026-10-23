import "./StatusBadge.css";
import { useLanguageStore } from "../../stores/useLanguageStore";

const KHMER_LABELS = {
  PUBLISHED: "បានផ្សព្វផ្សាយ", DRAFT: "ព្រាង", PAID: "បានបង់ប្រាក់", CREATED: "បានបង្កើត",
  CONFIRMED: "បានបញ្ជាក់", PAID_PENDING_REVIEW: "រង់ចាំការត្រួតពិនិត្យ", QR_CREATED: "បានបង្កើតកូដ",
  CHECKOUT_CREATED: "បានបង្កើតការទូទាត់", PENDING: "រង់ចាំ", FAILED: "បរាជ័យ", REJECTED: "បានបដិសេធ",
  ACTIVE: "កំពុងដំណើរការ", INVITED: "បានអញ្ជើញ", CHECKED_IN: "បានកត់ត្រាវត្តមាន", ATTENDING: "ចូលរួម",
  NOT_ATTENDING: "មិនចូលរួម", MAYBE: "ប្រហែលចូលរួម", DECLINED: "បានបដិសេធ", CANCELLED: "បានបោះបង់",
  EXPIRED: "ផុតកំណត់", SENT: "បានផ្ញើ", OPENED: "បានបើក", RESPONDED: "បានឆ្លើយតប", UNKNOWN: "មិនស្គាល់",
};
const LEGACY_STATUSES = { "មិនទាន់ផ្ញើ": "PENDING", "បានផ្ញើ": "SENT", "បានបើក": "OPENED", "បានឆ្លើយតប": "RESPONDED" };

const STATUS_MAP = {
  PUBLISHED: { label: "Published", variant: "success" },
  DRAFT: { label: "Draft", variant: "neutral" },
  PAID: { label: "Paid", variant: "success" },
  CREATED: { label: "Created", variant: "neutral" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  PAID_PENDING_REVIEW: { label: "Pending review", variant: "warning" },
  QR_CREATED: { label: "QR created", variant: "info" },
  CHECKOUT_CREATED: { label: "Checkout created", variant: "info" },
  PENDING: { label: "Pending", variant: "warning" },
  FAILED: { label: "Failed", variant: "danger" },
  REJECTED: { label: "Rejected", variant: "danger" },
  ACTIVE: { label: "Active", variant: "success" },
  INVITED: { label: "Invited", variant: "info" },
  CHECKED_IN: { label: "Checked In", variant: "success" },
  ATTENDING: { label: "Attending", variant: "success" },
  NOT_ATTENDING: { label: "Not attending", variant: "danger" },
  MAYBE: { label: "Maybe", variant: "warning" },
  DECLINED: { label: "Declined", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  EXPIRED: { label: "Expired", variant: "neutral" },
  SENT: { label: "Sent", variant: "info" },
  OPENED: { label: "Opened", variant: "info" },
  RESPONDED: { label: "Responded", variant: "success" },
};

export default function StatusBadge({ status, label, variant, className = "" }) {
  const lang = useLanguageStore(state => state.lang);
  const normalizedKey = LEGACY_STATUSES[status] || (typeof status === "string" ? status.toUpperCase() : "");
  const config = STATUS_MAP[normalizedKey] || {
    label: label || status || "Unknown",
    variant: variant || "neutral",
  };

  const badgeVariant = variant || config.variant;
  const badgeText = label || (lang === "km" ? KHMER_LABELS[normalizedKey] || status || KHMER_LABELS.UNKNOWN : config.label);

  return (
    <span className={`k-status-badge k-badge-${badgeVariant} ${className}`}>
      <span className="k-badge-dot" aria-hidden="true" />
      <span>{badgeText}</span>
    </span>
  );
}
