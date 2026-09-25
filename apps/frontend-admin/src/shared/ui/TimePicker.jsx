import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Clock, ChevronDown, Sun, Moon, Check } from "lucide-react";
import { toKhmerNum, fromKhmerNum } from "./DatePicker";

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES_STEP = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const PRESETS = [
  { label24: "07:00", hour12: "07", minute: "00", period: "ព្រឹក", desc: "ពិធីពេលព្រឹក" },
  { label24: "11:30", hour12: "11", minute: "30", period: "ព្រឹក", desc: "អាហារថ្ងៃត្រង់" },
  { label24: "17:00", hour12: "05", minute: "00", period: "ល្ងាច", desc: "ទទួលភ្ញៀវល្ងាច" },
  { label24: "18:00", hour12: "06", minute: "00", period: "ល្ងាច", desc: "ពិសារភោជនាហារ" },
];

/**
 * Parse time string into { hour12, minute, period, val24 }
 */
export function parseTime(val) {
  if (!val || typeof val !== "string") {
    return { hour12: "05", minute: "00", period: "ល្ងាច", val24: "17:00" };
  }
  const clean = fromKhmerNum(val.trim());
  const isPm = clean.includes("ល្ងាច") || clean.toLowerCase().includes("pm");
  const isAm = clean.includes("ព្រឹក") || clean.toLowerCase().includes("am");
  const digitsColons = clean.replace(/[^0-9:]/g, "");

  if (!digitsColons.includes(":")) {
    return { hour12: "05", minute: "00", period: "ល្ងាច", val24: "17:00" };
  }

  const [hStr, mStr] = digitsColons.split(":");
  let h = parseInt(hStr, 10);
  if (isNaN(h)) h = 17;
  let m = parseInt(mStr || "0", 10);
  if (isNaN(m)) m = 0;
  m = Math.min(59, Math.max(0, m));
  const mPadded = String(m).padStart(2, "0");

  let period = isPm ? "ល្ងាច" : isAm ? "ព្រឹក" : h >= 12 ? "ល្ងាច" : "ព្រឹក";
  let h12 = h % 12 || 12;
  const h12Padded = String(h12).padStart(2, "0");

  let h24 = parseInt(h12Padded, 10);
  if (period === "ល្ងាច" && h24 !== 12) h24 += 12;
  if (period === "ព្រឹក" && h24 === 12) h24 = 0;
  const val24 = `${String(h24).padStart(2, "0")}:${mPadded}`;

  return {
    hour12: h12Padded,
    minute: mPadded,
    period,
    val24,
  };
}

export function to24HourString(hour12, minute, period) {
  let h = parseInt(hour12, 10);
  if (period === "ល្ងាច" && h !== 12) h += 12;
  if (period === "ព្រឹក" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

export function formatTimeDisplay(val) {
  if (!val) return "";
  const { hour12, minute, period, val24 } = parseTime(val);
  const khmer12 = `${toKhmerNum(hour12)}:${toKhmerNum(minute)} ${period}`;
  return `${val24} (${khmer12})`;
}

/**
 * Admin Dark Theme TimePicker
 * Emits 24h string ("HH:MM") to onChange
 */
export function TimePicker({
  value,
  onChange,
  placeholder = "ជ្រើសរើសម៉ោង",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const parsed = useMemo(() => parseTime(value), [value]);

  const [hour, setHour] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);
  const ref = useRef(null);

  const syncFromCurrentValue = useCallback(() => {
    const p = parseTime(value);
    setHour(p.hour12);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [value]);

  useEffect(() => {
    syncFromCurrentValue();
  }, [syncFromCurrentValue]);

  // Click outside handler
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        syncFromCurrentValue();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [syncFromCurrentValue]);

  const handleApply = (h = hour, m = minute, p = period) => {
    const val24 = to24HourString(h, m, p);
    if (onChange) {
      onChange(val24);
    }
    setOpen(false);
  };

  const handlePresetSelect = (preset) => {
    setHour(preset.hour12);
    setMinute(preset.minute);
    setPeriod(preset.period);
    handleApply(preset.hour12, preset.minute, preset.period);
  };

  const displayLabel = value ? formatTimeDisplay(value) : "";

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
            ? "border-amber-500 ring-1 ring-amber-500/30 text-amber-400 font-bold"
            : "border-zinc-800 hover:border-zinc-700 text-amber-400 font-bold"
        } ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className={`truncate text-xs ${displayLabel ? "text-amber-400" : "text-zinc-500 font-normal"}`}>
            {displayLabel || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Time picker"
          className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 shadow-2xl shadow-black/90 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Preview & Period Switch */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
            <div>
              <div className="text-[10px] text-zinc-400 font-medium">ម៉ោងដែលបានជ្រើស</div>
              <div className="text-base font-bold text-amber-400 tracking-wider">
                {hour}:{minute}{" "}
                <span className="text-xs font-semibold text-zinc-300">
                  ({toKhmerNum(hour)}:{toKhmerNum(minute)} {period})
                </span>
              </div>
            </div>

            {/* Segmented AM / PM */}
            <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              <button
                type="button"
                onClick={() => setPeriod("ព្រឹក")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  period === "ព្រឹក"
                    ? "bg-amber-500 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sun className="w-3 h-3" />
                ព្រឹក
              </button>
              <button
                type="button"
                onClick={() => setPeriod("ល្ងាច")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  period === "ល្ងាច"
                    ? "bg-amber-500 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Moon className="w-3 h-3" />
                ល្ងាច
              </button>
            </div>
          </div>

          {/* Quick Minute Jump Chips */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] text-zinc-400 shrink-0 font-medium">នាទី:</span>
            {["00", "15", "30", "45"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinute(m)}
                className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border ${
                  minute === m
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                :{m}
              </button>
            ))}
          </div>

          {/* Hours Grid */}
          <div className="mb-2.5">
            <div className="text-[10px] text-zinc-400 mb-1 font-medium">ជ្រើសរើសម៉ោង (Hour 1-12):</div>
            <div className="grid grid-cols-6 gap-1">
              {HOURS_12.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHour(h)}
                  className={`h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    hour === h
                      ? "bg-amber-500 text-zinc-950 shadow-sm scale-105"
                      : "bg-zinc-900/80 border border-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-amber-300"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes Step Grid */}
          <div className="mb-3">
            <div className="text-[10px] text-zinc-400 mb-1 font-medium">ជ្រើសរើសនាទី (Minutes):</div>
            <div className="grid grid-cols-6 gap-1">
              {MINUTES_STEP.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinute(m)}
                  className={`h-6 rounded-md text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer ${
                    minute === m
                      ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                      : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  :{m}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Presets */}
          <div className="mb-3 pt-2.5 border-t border-zinc-800/80">
            <div className="text-[10px] text-zinc-400 mb-1.5 font-medium">ម៉ោងពេញនិយម (Presets):</div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => {
                const isSelected =
                  hour === p.hour12 && minute === p.minute && period === p.period;
                return (
                  <button
                    key={p.label24}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-500/80 bg-amber-500/15 text-amber-300"
                        : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-300"
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label24} ({toKhmerNum(p.hour12)}:{toKhmerNum(p.minute)})</div>
                    <div className="text-[10px] text-zinc-400">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                syncFromCurrentValue();
                setOpen(false);
              }}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer rounded hover:bg-zinc-800"
            >
              បោះបង់
            </button>
            <button
              type="button"
              onClick={() => handleApply()}
              className="px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              កំណត់ម៉ោង
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimePicker;
