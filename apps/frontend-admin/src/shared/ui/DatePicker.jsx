import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";

export const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

export const KHMER_DAYS_SHORT = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];
export const KHMER_DAYS_FULL = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];

export const toKhmerNum = (num) =>
  String(num).replace(/[0-9]/g, (d) => "០១២៣៤៥៦៧៨៩"[d]);

export const fromKhmerNum = (str) =>
  String(str).replace(/[០-៩]/g, (d) => "0123456789"["០១២៣៤៥៦៧៨៩".indexOf(d)]);

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Parse date from ISO ("2026-01-28") or Khmer string ("ថ្ងៃពុធ ២៨ មករា ២០២៦" or "២៨ មករា ២០២៦")
 */
export function parseKhmerOrIsoDate(val) {
  if (!val || typeof val !== "string") return null;
  const clean = fromKhmerNum(val.trim());

  // Check ISO format YYYY-MM-DD
  const isoMatch = clean.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { year: y, month: m, day: d };
    }
  }

  // Check Khmer month name
  let foundMonth = -1;
  for (let i = 0; i < KHMER_MONTHS.length; i++) {
    if (val.includes(KHMER_MONTHS[i])) {
      foundMonth = i;
      break;
    }
  }

  const numbers = clean.match(/\d+/g);
  if (foundMonth !== -1 && numbers) {
    let day = null;
    let year = null;
    for (const n of numbers) {
      const num = parseInt(n, 10);
      if (num >= 1900 && num <= 2100) {
        year = num;
      } else if (num >= 1 && num <= 31 && !day) {
        day = num;
      }
    }
    if (day && year) {
      return { year, month: foundMonth, day };
    }
  }

  return null;
}

/**
 * Format year, month, day into full Khmer display string
 * e.g. "ថ្ងៃពុធ ២៨ មករា ២០២៦"
 */
export function formatToKhmerDate(year, month, day) {
  const dateObj = new Date(year, month, day);
  const dayOfWeek = KHMER_DAYS_FULL[dateObj.getDay()] || "ពុធ";
  const khDay = toKhmerNum(day);
  const khMonth = KHMER_MONTHS[month];
  const khYear = toKhmerNum(year);
  return `ថ្ងៃ${dayOfWeek} ${khDay} ${khMonth} ${khYear}`;
}

export function toIsoDate(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Admin Dark Theme DatePicker
 * Emits (khmerFormattedDate, isoDate) to onChange
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "ជ្រើសរើសថ្ងៃមង្គលការ",
  className = "",
}) {
  const today = useMemo(() => new Date(), []);
  const parsed = useMemo(() => parseKhmerOrIsoDate(value), [value]);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => parsed?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (parsed ? parsed.month : today.getMonth()));
  const ref = useRef(null);

  // Sync view when incoming value changes
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [parsed]);

  // Click outside to close
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedKhmer = formatToKhmerDate(viewYear, viewMonth, day);
    const iso = toIsoDate(viewYear, viewMonth, day);
    if (onChange) {
      onChange(formattedKhmer, iso);
    }
    setOpen(false);
  };

  const handleSelectToday = () => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    setViewYear(y);
    setViewMonth(m);
    const formattedKhmer = formatToKhmerDate(y, m, d);
    const iso = toIsoDate(y, m, d);
    if (onChange) {
      onChange(formattedKhmer, iso);
    }
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const isSelected = (day) =>
    parsed &&
    parsed.day === day &&
    parsed.month === viewMonth &&
    parsed.year === viewYear;

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const displayLabel = value || "";

  return (
    <div className="relative w-full" ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`h-8 w-full rounded-lg border bg-zinc-950 px-2.5 text-xs outline-none transition-all flex items-center justify-between gap-1.5 cursor-pointer select-none text-left ${
          open
            ? "border-amber-500 ring-1 ring-amber-500/30 text-zinc-100"
            : "border-zinc-800 hover:border-zinc-700 text-zinc-200"
        } ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className={`truncate text-xs ${displayLabel ? "text-zinc-100 font-medium" : "text-zinc-500"}`}>
            {displayLabel || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Calendar Popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Calendar picker"
          className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl shadow-black/90 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors cursor-pointer"
              title="ខែមុន"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-amber-400 tracking-wide">
                {KHMER_MONTHS[viewMonth]}
              </span>
              <span className="text-xs font-semibold text-zinc-300 ml-1.5">
                {toKhmerNum(viewYear)} ({viewYear})
              </span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors cursor-pointer"
              title="ខែបន្ទាប់"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {KHMER_DAYS_SHORT.map((dayName, idx) => (
              <span
                key={dayName}
                className={`text-[10px] font-semibold py-0.5 ${
                  idx === 0 ? "text-rose-400/90" : idx === 6 ? "text-amber-400/90" : "text-zinc-500"
                }`}
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset padding */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`offset-${i}`} className="h-7 w-7" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const selected = isSelected(day);
              const currentDay = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                    selected
                      ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/30 scale-105"
                      : currentDay
                      ? "border border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold hover:bg-amber-500/20"
                      : "text-zinc-300 hover:bg-zinc-800/90 hover:text-amber-300"
                  }`}
                >
                  {toKhmerNum(day)}
                  {selected && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-amber-500/10"
            >
              🗓️ ថ្ងៃនេះ
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-zinc-800/60"
            >
              បោះបង់
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
