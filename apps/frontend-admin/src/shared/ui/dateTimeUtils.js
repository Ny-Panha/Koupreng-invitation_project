export const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

export const KHMER_DAYS_SHORT = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];
export const KHMER_DAYS_FULL = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];

export const toKhmerNum = (num) =>
  String(num).replace(/[0-9]/g, (digit) => "០១២៣៤៥៦៧៨៩"[digit]);

export const fromKhmerNum = (value) =>
  String(value).replace(/[០-៩]/g, (digit) => "0123456789"["០១២៣៤៥៦៧៨៩".indexOf(digit)]);

export function parseKhmerOrIsoDate(value) {
  if (!value || typeof value !== "string") return null;
  const clean = fromKhmerNum(value.trim());
  const isoMatch = clean.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (isoMatch) {
    const year = Number.parseInt(isoMatch[1], 10);
    const month = Number.parseInt(isoMatch[2], 10) - 1;
    const day = Number.parseInt(isoMatch[3], 10);
    if (![year, month, day].some(Number.isNaN)) return { year, month, day };
  }

  const month = KHMER_MONTHS.findIndex((monthName) => value.includes(monthName));
  const numbers = clean.match(/\d+/g);
  if (month === -1 || !numbers) return null;

  let day = null;
  let year = null;
  for (const numberText of numbers) {
    const number = Number.parseInt(numberText, 10);
    if (number >= 1900 && number <= 2100) year = number;
    else if (number >= 1 && number <= 31 && day === null) day = number;
  }

  return day && year ? { year, month, day } : null;
}

export function formatToKhmerDate(year, month, day) {
  const date = new Date(year, month, day);
  const dayOfWeek = KHMER_DAYS_FULL[date.getDay()] || "ពុធ";
  return `ថ្ងៃ${dayOfWeek} ${toKhmerNum(day)} ${KHMER_MONTHS[month]} ${toKhmerNum(year)}`;
}

export function toIsoDate(year, month, day) {
  const paddedMonth = String(month + 1).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
}

export function parseTime(value) {
  if (!value || typeof value !== "string") {
    return { hour12: "05", minute: "00", period: "ល្ងាច", val24: "17:00" };
  }

  const clean = fromKhmerNum(value.trim());
  const isPm = clean.includes("ល្ងាច") || clean.toLowerCase().includes("pm");
  const isAm = clean.includes("ព្រឹក") || clean.toLowerCase().includes("am");
  const digitsAndColons = clean.replace(/[^0-9:]/g, "");
  if (!digitsAndColons.includes(":")) {
    return { hour12: "05", minute: "00", period: "ល្ងាច", val24: "17:00" };
  }

  const [hourText, minuteText] = digitsAndColons.split(":");
  const parsedHour = Number.parseInt(hourText, 10);
  const parsedMinute = Number.parseInt(minuteText || "0", 10);
  const hour = Number.isNaN(parsedHour) ? 17 : parsedHour;
  const minute = Math.min(59, Math.max(0, Number.isNaN(parsedMinute) ? 0 : parsedMinute));
  const minutePadded = String(minute).padStart(2, "0");
  const period = isPm ? "ល្ងាច" : isAm ? "ព្រឹក" : hour >= 12 ? "ល្ងាច" : "ព្រឹក";
  const hour12 = String(hour % 12 || 12).padStart(2, "0");

  return {
    hour12,
    minute: minutePadded,
    period,
    val24: to24HourString(hour12, minutePadded, period),
  };
}

export function to24HourString(hour12, minute, period) {
  let hour = Number.parseInt(hour12, 10);
  if (period === "ល្ងាច" && hour !== 12) hour += 12;
  if (period === "ព្រឹក" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function formatTimeDisplay(value) {
  if (!value) return "";
  const { hour12, minute, period, val24 } = parseTime(value);
  return `${val24} (${toKhmerNum(hour12)}:${toKhmerNum(minute)} ${period})`;
}
