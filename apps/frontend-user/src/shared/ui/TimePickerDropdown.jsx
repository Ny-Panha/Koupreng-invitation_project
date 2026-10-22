import { useRef, useEffect } from "react";
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const PRESETS = [
    { label: "07:00 ព្រឹក", hour: "07", minute: "00", period: "ព្រឹក", desc: "ពិធីពេលព្រឹក" },
    { label: "11:30 ព្រឹក", hour: "11", minute: "30", period: "ព្រឹក", desc: "អាហារថ្ងៃត្រង់" },
    { label: "05:00 ល្ងាច", hour: "05", minute: "00", period: "ល្ងាច", desc: "ទទួលភ្ញៀវពេលល្ងាច" },
    { label: "06:00 ល្ងាច", hour: "06", minute: "00", period: "ល្ងាច", desc: "ពិសារភោជនាហារ" },
];

export function TimePickerDropdown({
    id,
    english = false,
    hour,
    setHour,
    minute,
    setMinute,
    period,
    setPeriod,
    onConfirm,
    onCancel,
}) {
    const reduced = usePrefersReducedMotion();
    const behavior = reduced ? 'auto' : 'smooth';
    const root = useRef(null);
    const hourListRef = useRef(null);
    const minuteListRef = useRef(null);

    // Smooth scroll to selected items when dropdown opens
    useEffect(() => {
        const scrollToActive = () => {
            const activeHour = hourListRef.current?.querySelector(".tp-item.active");
            if (activeHour) {
                activeHour.scrollIntoView({ block: "center", behavior });
            }
            const activeMin = minuteListRef.current?.querySelector(".tp-item.active");
            if (activeMin) {
                activeMin.scrollIntoView({ block: "center", behavior });
            }
        };
        const timer = setTimeout(scrollToActive, 60);
        return () => clearTimeout(timer);
    }, [behavior]);
    useEffect(() => { root.current?.querySelector('.tp-period-btn.active')?.focus(); }, []);
    const arrowSelect = (event, values, value, setValue) => {
        const direction = ['ArrowDown','ArrowRight'].includes(event.key) ? 1 : ['ArrowUp','ArrowLeft'].includes(event.key) ? -1 : 0;
        if (!direction) return;
        event.preventDefault();
        const next = values[(values.indexOf(value) + direction + values.length) % values.length];
        setValue(next); event.currentTarget.parentElement.querySelector(`[data-value="${next}"]`)?.focus();
    };

    const handlePresetClick = (p) => {
        setHour(p.hour);
        setMinute(p.minute);
        setPeriod(p.period);
        setTimeout(() => {
            const activeHour = hourListRef.current?.querySelector(".tp-item.active");
            activeHour?.scrollIntoView({ block: "center", behavior });
            const activeMin = minuteListRef.current?.querySelector(".tp-item.active");
            activeMin?.scrollIntoView({ block: "center", behavior });
        }, 50);
    };

    return (
        <div ref={root} id={id} role="dialog" aria-label={english ? 'Choose time' : 'ជ្រើសម៉ោង'} aria-modal="false" className="tp-dropdown" onClick={(e) => e.stopPropagation()}>
            {/* 1. Header: Title & Digital Preview */}
            <div className="tp-header">
                <div className="tp-title-row">
                    <span className="tp-title">{english ? 'Choose time' : 'ជ្រើសម៉ោង'}</span>
                    <div className="tp-digital-preview">
                        <span className="tp-preview-num">{hour}:{minute}</span>
                        <span className="tp-preview-period">{english ? (period === 'ព្រឹក' ? 'AM' : 'PM') : period}</span>
                    </div>
                </div>

                {/* 2. Period Toggle Switch (ព្រឹក / ល្ងាច) */}
                <div className="tp-period-segmented">
                    <button
                        type="button"
                        className={`tp-period-btn ${period === "ព្រឹក" ? "active" : ""}`}
                        onClick={() => setPeriod("ព្រឹក")}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        <span>{english ? 'AM' : 'ព្រឹក'}</span>
                    </button>
                    <button
                        type="button"
                        className={`tp-period-btn ${period === "ល្ងាច" ? "active" : ""}`}
                        onClick={() => setPeriod("ល្ងាច")}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                        <span>{english ? 'PM' : 'ល្ងាច'}</span>
                    </button>
                </div>
            </div>

            {/* 3. Quick Minute Jump Chips */}
            <div className="tp-quick-minutes">
                <span className="tp-quick-label">{english ? 'Minutes:' : 'នាទី៖'}</span>
                {["00", "15", "30", "45"].map((m) => (
                    <button
                        key={m}
                        type="button"
                        className={`tp-quick-chip ${minute === m ? "active" : ""}`}
                        onClick={() => {
                            setMinute(m);
                            setTimeout(() => {
                                const activeMin = minuteListRef.current?.querySelector(".tp-item.active");
                                activeMin?.scrollIntoView({ block: "center", behavior });
                            }, 50);
                        }}
                    >
                        :{m}
                    </button>
                ))}
            </div>

            {/* 4. Two Scrollable Columns: Hour & Minute */}
            <div className="tp-columns-wrap">
                {/* Hours */}
                <div className="tp-col">
                    <div className="tp-col-header">{english ? 'Hour' : 'ម៉ោង'}</div>
                    <div className="tp-col-scroll" ref={hourListRef}>
                        {HOURS.map((h) => (
                            <button
                                key={h}
                                data-value={h}
                                aria-label={`${english ? 'Hour' : 'ម៉ោង'} ${h}`}
                                aria-pressed={hour === h}
                                tabIndex={hour === h ? 0 : -1}
                                onKeyDown={event => arrowSelect(event, HOURS, h, setHour)}
                                type="button"
                                className={`tp-item ${hour === h ? "active" : ""}`}
                                onClick={() => setHour(h)}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="tp-col-divider">:</div>

                {/* Minutes */}
                <div className="tp-col">
                    <div className="tp-col-header">{english ? 'Minute' : 'នាទី'}</div>
                    <div className="tp-col-scroll" ref={minuteListRef}>
                        {MINUTES.map((m) => (
                            <button
                                key={m}
                                data-value={m}
                                aria-label={`${english ? 'Minute' : 'នាទី'} ${m}`}
                                aria-pressed={minute === m}
                                tabIndex={minute === m ? 0 : -1}
                                onKeyDown={event => arrowSelect(event, MINUTES, m, setMinute)}
                                type="button"
                                className={`tp-item ${minute === m ? "active" : ""}`}
                                onClick={() => setMinute(m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Common Event Presets */}
            <div className="tp-presets-section">
                <div className="tp-presets-title">{english ? 'Common times' : 'ម៉ោងពេញនិយម'}</div>
                <div className="tp-presets-grid">
                    {PRESETS.map((p) => {
                        const isSelected = hour === p.hour && minute === p.minute && period === p.period;
                        return (
                            <button
                                key={p.label}
                                type="button"
                                className={`tp-preset-card ${isSelected ? "active" : ""}`}
                                onClick={() => handlePresetClick(p)}
                            >
                                <span className="tp-preset-time">{english ? p.label.replace('ព្រឹក','AM').replace('ល្ងាច','PM') : p.label}</span>
                                <span className="tp-preset-desc">{english ? ['Morning ceremony','Lunch','Evening reception','Dinner'][PRESETS.indexOf(p)] : p.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 6. Action Buttons */}
            <div className="tp-actions">
                <button type="button" className="tp-btn-cancel" onClick={onCancel}>
                    {english ? 'Cancel' : 'បោះបង់'}
                </button>
                <button type="button" className="tp-btn-confirm" onClick={onConfirm}>
                    {english ? 'Set time' : 'កំណត់ម៉ោង'}
                </button>
            </div>
        </div>
    );
}

export default TimePickerDropdown;
