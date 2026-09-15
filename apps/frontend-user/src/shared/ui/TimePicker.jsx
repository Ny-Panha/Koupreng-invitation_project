import { useCallback, useState, useRef, useEffect } from "react";
import { TimePickerDropdown } from "./TimePickerDropdown";
import "./TimePicker.css";

/**
 * Format "HH:mm" (24h) string into Khmer 12h display string (e.g. "05:00 ល្ងាច")
 */
// eslint-disable-next-line react-refresh/only-export-components
export function formatTime24toKhmer(val24) {
    if (!val24 || typeof val24 !== "string") return "";
    const clean = val24.trim();
    if (clean.includes("ព្រឹក") || clean.includes("ល្ងាច")) return clean;
    if (!clean.includes(":")) return clean;
    const [h, m] = clean.split(":");
    const hNum = parseInt(h, 10);
    if (isNaN(hNum)) return clean;
    const p = hNum >= 12 ? "ល្ងាច" : "ព្រឹក";
    const h12 = hNum % 12 || 12;
    const min = (m || "00").slice(0, 2).padStart(2, "0");
    return `${String(h12).padStart(2, "0")}:${min} ${p}`;
}

/**
 * TimePicker — Khmer-language 12h time picker that emits a 24h "HH:MM" string.
 */
export function TimePicker({ value, onChange, placeholder = "ជ្រើសម៉ោង" }) {
    const [open, setOpen] = useState(false);
    const [hour, setHour] = useState("05");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState("ល្ងាច");
    const ref = useRef();

    // Parse incoming 24h or formatted value into local 12h state
    const syncFromValue = useCallback((val) => {
        const v = val !== undefined ? val : value;
        if (!v || typeof v !== "string") {
            setHour("05");
            setMinute("00");
            setPeriod("ល្ងាច");
            return;
        }
        const clean = v.trim();
        const isEvening = clean.includes("ល្ងាច") || clean.toLowerCase().includes("pm");
        const isMorning = clean.includes("ព្រឹក") || clean.toLowerCase().includes("am");
        const digitsColons = clean.replace(/[^0-9:]/g, "");
        if (!digitsColons.includes(":")) {
            setHour("05");
            setMinute("00");
            setPeriod("ល្ងាច");
            return;
        }
        const [hStr, mStr] = digitsColons.split(":");
        const hNum = parseInt(hStr, 10);
        if (isNaN(hNum)) return;
        const p = isEvening ? "ល្ងាច" : isMorning ? "ព្រឹក" : (hNum >= 12 ? "ល្ងាច" : "ព្រឹក");
        const h12 = hNum % 12 || 12;
        setHour(String(h12).padStart(2, "0"));
        setMinute((mStr || "00").slice(0, 2).padStart(2, "0"));
        setPeriod(p);
    }, [value]);

    useEffect(() => {
        syncFromValue(value);
    }, [value, syncFromValue]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                syncFromValue(value);
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [value, syncFromValue]);

    const displayValue = formatTime24toKhmer(value);

    const handleOpenToggle = () => {
        if (!open) {
            syncFromValue(value);
        }
        setOpen((o) => !o);
    };

    const handleConfirm = () => {
        let h = parseInt(hour, 10);
        if (period === "ល្ងាច" && h !== 12) h += 12;
        if (period === "ព្រឹក" && h === 12) h = 0;
        const val24 = `${String(h).padStart(2, "0")}:${minute}`;
        onChange(val24);
        setOpen(false);
    };

    const handleCancel = () => {
        syncFromValue(value);
        setOpen(false);
    };

    return (
        <div className="tp-wrap" ref={ref}>
            <button
                type="button"
                className={`tp-trigger${open ? " open" : ""}`}
                onClick={handleOpenToggle}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <svg className="tp-clock-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 3" />
                </svg>
                <span className={displayValue ? "tp-value" : "tp-placeholder"}>
                    {displayValue || placeholder}
                </span>
                <svg className={`tp-caret ${open ? "open" : ""}`} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <TimePickerDropdown
                    hour={hour}
                    setHour={setHour}
                    minute={minute}
                    setMinute={setMinute}
                    period={period}
                    setPeriod={setPeriod}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}

export default TimePicker;
