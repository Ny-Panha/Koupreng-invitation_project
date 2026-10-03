import { useState, useRef, useEffect, useId } from "react";
import { localDateString } from "@/shared/utils/localDate";
import "./DatePicker.css";

const KHMER_MONTHS = [
    "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
    "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

const KHMER_DAYS = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

/**
 * DatePicker — Khmer-language date picker that emits "YYYY-MM-DD" string.
 * Same UI style as TimePicker.
 */
export function DatePicker({ value, onChange, placeholder = "ជ្រើសកាលបរិច្ឆេទ" }) {
    const today = new Date();
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const ref = useRef();
    const triggerRef = useRef(null);
    const focusDayRef = useRef(true);
    const calendarId = useId();
    const [focusDate, setFocusDate] = useState(() => value ? new Date(`${value}T00:00:00`) : today);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!value) return;
        const [y, m] = value.split("-").map(Number);
        setViewYear(y);
        setViewMonth(m - 1);
        setFocusDate(new Date(y, m - 1, Number(value.split("-")[2])));
    }, [value]);

    const selectedDay = value ? parseInt(value.split("-")[2], 10) : null;
    const selectedMonth = value ? parseInt(value.split("-")[1], 10) - 1 : null;
    const selectedYear = value ? parseInt(value.split("-")[0], 10) : null;
    const [dropUp, setDropUp] = useState(false);

    useEffect(() => {
        if (open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 330 && rect.top > 330) {
                setDropUp(true);
            } else {
                setDropUp(false);
            }
        }
    }, [open]);

    const displayValue = value
        ? `${parseInt(value.split("-")[2], 10)} ${KHMER_MONTHS[parseInt(value.split("-")[1], 10) - 1]} ${value.split("-")[0]}`
        : "";

    const moveFocus = (date) => {
        setFocusDate(date); setViewYear(date.getFullYear()); setViewMonth(date.getMonth());
    };
    const navigateMonth = (delta) => {
        const next = new Date(viewYear, viewMonth + delta, 1);
        next.setDate(Math.min(focusDate.getDate(), getDaysInMonth(next.getFullYear(), next.getMonth())));
        focusDayRef.current = false; moveFocus(next);
    };
    const prevMonth = () => navigateMonth(-1);
    const nextMonth = () => navigateMonth(1);
    const closeCalendar = () => { setOpen(false); triggerRef.current?.focus(); };
    useEffect(() => {
        if (open && focusDayRef.current && !isNaN(focusDate.getTime())) {
            ref.current?.querySelector(`[data-date="${localDateString(focusDate)}"]`)?.focus();
        }
    }, [open, focusDate, viewYear, viewMonth]);

    const selectDay = (day) => {
        const mm = String(viewMonth + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        onChange(`${viewYear}-${mm}-${dd}`);
        closeCalendar();
    };

    const handleDayKey = (event, date) => {
        const next = new Date(date);
        const increments = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (event.key in increments) next.setDate(next.getDate() + increments[event.key]);
        else if (event.key === "Home") next.setDate(next.getDate() - next.getDay());
        else if (event.key === "End") next.setDate(next.getDate() + 6 - next.getDay());
        else if (event.key === "PageUp" || event.key === "PageDown") {
            const delta = (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1);
            const day = next.getDate(); next.setDate(1); next.setMonth(next.getMonth() + delta);
            next.setDate(Math.min(day, getDaysInMonth(next.getFullYear(), next.getMonth())));
        } else if (["Enter", " "].includes(event.key)) {
            event.preventDefault(); onChange(localDateString(date)); closeCalendar(); return;
        } else return;
        event.preventDefault(); focusDayRef.current = true; moveFocus(next);
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const isSelected = (day) =>
        selectedDay === day && selectedMonth === viewMonth && selectedYear === viewYear;

    const isToday = (day) =>
        day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

    return (
        <div className="dp-wrap" ref={ref} onBlur={(event) => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}>
            <button
                type="button"
                ref={triggerRef}
                className={`dp-trigger${open ? " open" : ""}`}
                onClick={() => { focusDayRef.current = true; setOpen((o) => !o); }}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={calendarId}
            >
                <svg className="dp-cal-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={displayValue ? "dp-value" : "dp-placeholder"}>
                    {displayValue || placeholder}
                </span>
                <svg className={`dp-caret ${open ? "open" : ""}`} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div id={calendarId} role="dialog" aria-label="Choose date" aria-modal="false" className={`dp-dropdown${dropUp ? " drop-up" : ""}`} onKeyDown={(event) => {
                    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeCalendar(); }
                }}>
                    <div className="dp-header">
                        <button type="button" aria-label="Previous month" className="dp-nav-btn" onClick={prevMonth}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="dp-month-year" aria-live="polite">
                            {KHMER_MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button type="button" aria-label="Next month" className="dp-nav-btn" onClick={nextMonth}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="dp-weekdays">
                        {KHMER_DAYS.map((d) => (
                            <span key={d} className="dp-weekday">{d}</span>
                        ))}
                    </div>

                    <div className="dp-grid" role="grid" aria-label={`${KHMER_MONTHS[viewMonth]} ${viewYear}`}>
                        {Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) }, (_, row) => (
                        <div key={row} role="row" style={{ display: "contents" }}>
                        {Array.from({ length: 7 }, (_, column) => row * 7 + column - firstDay + 1).map((day) => day < 1 || day > daysInMonth ? (
                            <span key={day} role="gridcell" className="dp-cell dp-empty" />
                        ) : (
                            <button
                                key={day}
                                type="button"
                                role="gridcell"
                                data-date={localDateString(new Date(viewYear, viewMonth, day))}
                                aria-label={new Intl.DateTimeFormat("km-KH", { dateStyle: "full" }).format(new Date(viewYear, viewMonth, day))}
                                aria-selected={isSelected(day)}
                                aria-current={isToday(day) ? "date" : undefined}
                                tabIndex={focusDate.getDate() === day ? 0 : -1}
                                className={`dp-cell dp-day${isSelected(day) ? " selected" : ""}${isToday(day) ? " today" : ""}`}
                                onClick={() => selectDay(day)}
                                onKeyDown={(event) => handleDayKey(event, new Date(viewYear, viewMonth, day))}
                            >
                                {day}
                            </button>
                        ))}
                        </div>
                        ))}
                    </div>

                    <div className="dp-actions">
                        <button type="button" className="dp-btn-today" onClick={() => {
                            const mm = String(today.getMonth() + 1).padStart(2, "0");
                            const dd = String(today.getDate()).padStart(2, "0");
                            onChange(`${today.getFullYear()}-${mm}-${dd}`);
                            closeCalendar();
                        }}>
                            ថ្ងៃនេះ
                        </button>
                        <button type="button" className="dp-btn-cancel" onClick={closeCalendar}>
                            បោះបង់
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DatePicker;
