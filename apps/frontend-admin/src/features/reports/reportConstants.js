export const EVENT_CATEGORIES = [
  {
    key: "WEDDING",
    label: "អាពាហ៍ពិពាហ៍",
    subLabel: "Wedding",
    icon: "💍",
    color: "#f43f5e",
    barColor: "bg-rose-500",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    description: "ពិធីមង្គលការ និងអាពាហ៍ពិពាហ៍",
  },
  {
    key: "ENGAGEMENT",
    label: "ភ្ជាប់ពាក្យ",
    subLabel: "Engagement",
    icon: "💐",
    color: "#f59e0b",
    barColor: "bg-amber-500",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    description: "ពិធីស្តីដណ្តឹង និងភ្ជាប់ពាក្យ",
  },
  {
    key: "BIRTHDAY",
    label: "ខួបកំណើត",
    subLabel: "Birthday",
    icon: "🎂",
    color: "#a855f7",
    barColor: "bg-purple-500",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    description: "ពិធីជប់លៀងខួបកំណើត",
  },
  {
    key: "ANNIVERSARY",
    label: "ខួបអនុស្សាវរីយ៍",
    subLabel: "Anniversary",
    icon: "🥂",
    color: "#06b6d4",
    barColor: "bg-cyan-500",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    description: "ខួបអាពាហ៍ពិពាហ៍ និងការចងចាំ",
  },
  {
    key: "CORPORATE",
    label: "ស្ថាប័ន",
    subLabel: "Corporate",
    icon: "🏢",
    color: "#10b981",
    barColor: "bg-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "ពិធីសម្ពោធ និងកម្មវិធីស្ថាប័ន",
  },
  {
    key: "OTHER",
    label: "ផ្សេងៗ",
    subLabel: "Other",
    icon: "✨",
    color: "#94a3b8",
    barColor: "bg-slate-400",
    badgeColor: "bg-slate-500/10 text-slate-700 dark:text-zinc-400 border-slate-500/20",
    description: "កម្មវិធីជួបជុំ និងបុណ្យទានផ្សេងៗ",
  },
];

export function eventTypeLabel(type, lang = "km") {
  if (type === "ANNIVERSARY_BIRTHDAY") return lang === "en" ? "Birthday / Anniversary" : "ខួបកំណើត/អនុស្សាវរីយ៍";
  const match = EVENT_CATEGORIES.find((c) => c.key === type);
  if (match) return lang === "en" ? match.subLabel : match.label;
  const labelsKm = {
    WEDDING: "អាពាហ៍ពិពាហ៍",
    ENGAGEMENT: "ភ្ជាប់ពាក្យ",
    BIRTHDAY: "ខួបកំណើត",
    ANNIVERSARY: "ខួបអនុស្សាវរីយ៍",
    CORPORATE: "ស្ថាប័ន",
    OTHER: "ផ្សេងៗ",
  };
  const labelsEn = {
    WEDDING: "Wedding",
    ENGAGEMENT: "Engagement",
    BIRTHDAY: "Birthday",
    ANNIVERSARY: "Anniversary",
    CORPORATE: "Corporate",
    OTHER: "Other",
  };
  const labels = lang === "en" ? labelsEn : labelsKm;
  return labels[type] || type || (lang === "en" ? "Unspecified" : "មិនបានកំណត់");
}

export function formatMoney(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = Number(amount);
  if (!Number.isFinite(num)) return String(amount);
  const isKhr = currency === "KHR" || currency === "RIEL" || currency === "៛";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isKhr ? 0 : 2,
    maximumFractionDigits: isKhr ? 0 : 2,
  }).format(num);
  return isKhr ? `${formatted} ៛` : `$${formatted}`;
}

export function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

