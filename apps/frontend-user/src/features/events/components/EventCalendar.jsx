import { useState, useMemo, useCallback } from "react";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { formatLocalDate, localDateString } from "@/shared/utils/localDate";
import { EVENT_TYPES } from "../onboarding/eventFields";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Eye,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import "./EventCalendar.css";

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];

const KHMER_DAYS_SHORT = ["ច", "អ", "ព", "ព្រ", "សុ", "ស", "អា"];
const EN_DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns index 0-6 where 0 = Monday, 6 = Sunday.
 */
function getFirstDayOfWeekMondayFirst(year, month) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

export function EventCalendar({
  events = [],
  onManage,
  onPreview,
}) {
  const en = useLanguageStore((s) => s.lang) === "en";
  const todayDateString = localDateString(new Date());

  // Determine initial month from current date or first upcoming event
  const initialDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, []);

  const [viewDate, setViewDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarSubView, setCalendarSubView] = useState("month"); // "month" | "agenda"

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const monthLabel = useMemo(() => {
    if (en) {
      return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(viewDate);
    }
    return `${KHMER_MONTHS[viewMonth]} ${viewYear}`;
  }, [en, viewDate, viewMonth, viewYear]);

  // Index events by "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach((evt) => {
      const rawDate = evt.eventDate || evt.event?.date;
      if (!rawDate) return;
      const dateKey = String(rawDate).slice(0, 10);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(evt);
    });
    return map;
  }, [events]);

  // Navigation handlers
  const prevMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const jumpToToday = useCallback(() => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayDateString);
  }, [todayDateString]);

  // Calendar cells computation (Monday first)
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const startDayOffset = getFirstDayOfWeekMondayFirst(viewYear, viewMonth);

  const prevMonthDays = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  );

  const cells = useMemo(() => {
    const list = [];

    // Leading days from previous month
    for (let i = startDayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateKey = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      list.push({
        dayNumber: dayNum,
        dateKey,
        isCurrentMonth: false,
        isToday: dateKey === todayDateString,
        events: eventsByDate.get(dateKey) || [],
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      list.push({
        dayNumber: dayNum,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === todayDateString,
        events: eventsByDate.get(dateKey) || [],
      });
    }

    // Trailing days from next month to complete 35 or 42 grid cells
    const remaining = (7 - (list.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateKey = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      list.push({
        dayNumber: dayNum,
        dateKey,
        isCurrentMonth: false,
        isToday: dateKey === todayDateString,
        events: eventsByDate.get(dateKey) || [],
      });
    }

    return list;
  }, [daysInMonth, eventsByDate, prevMonthDays, startDayOffset, todayDateString, viewMonth, viewYear]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    if (selectedDate) {
      return eventsByDate.get(selectedDate) || [];
    }
    return [];
  }, [eventsByDate, selectedDate]);

  // Chronological agenda list for all events
  const sortedAgendaEvents = useMemo(() => {
    const list = [...events];
    return list.sort((a, b) => {
      const dateA = a.eventDate || a.event?.date || "9999-99-99";
      const dateB = b.eventDate || b.event?.date || "9999-99-99";
      return dateA.localeCompare(dateB);
    });
  }, [events]);

  const dayHeaders = en ? EN_DAYS_SHORT : KHMER_DAYS_SHORT;

  return (
    <section className="event-calendar-container" aria-label={en ? "Event Calendar" : "ប្រតិទិនកម្មវិធី"}>
      {/* Calendar Top Controls */}
      <div className="event-calendar-header">
        <div className="event-calendar-title-wrap">
          <h2 className="event-calendar-month-heading">{monthLabel}</h2>
          <span className="event-calendar-event-count">
            {events.length} {en ? (events.length === 1 ? "event" : "events") : "កម្មវិធី"}
          </span>
        </div>

        <div className="event-calendar-actions">
          {/* Subview Toggle: Month vs Agenda */}
          <div className="event-calendar-subview-toggle" role="group" aria-label={en ? "Calendar view" : "ទិដ្ឋភាពប្រតិទិន"}>
            <button
              type="button"
              className={`event-calendar-toggle-btn ${calendarSubView === "month" ? "is-active" : ""}`}
              onClick={() => setCalendarSubView("month")}
              aria-pressed={calendarSubView === "month"}
            >
              <CalendarDays size={15} aria-hidden="true" />
              <span>{en ? "Month" : "ខែ"}</span>
            </button>
            <button
              type="button"
              className={`event-calendar-toggle-btn ${calendarSubView === "agenda" ? "is-active" : ""}`}
              onClick={() => setCalendarSubView("agenda")}
              aria-pressed={calendarSubView === "agenda"}
            >
              <CalendarIcon size={15} aria-hidden="true" />
              <span>{en ? "Agenda" : "កាលវិភាគ"}</span>
            </button>
          </div>

          {/* Month Navigation */}
          {calendarSubView === "month" && (
            <div className="event-calendar-nav-buttons">
              <button
                type="button"
                className="event-calendar-nav-btn"
                onClick={prevMonth}
                aria-label={en ? "Previous month" : "ខែមុន"}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="event-calendar-today-btn"
                onClick={jumpToToday}
              >
                {en ? "Today" : "ថ្ងៃនេះ"}
              </button>
              <button
                type="button"
                className="event-calendar-nav-btn"
                onClick={nextMonth}
                aria-label={en ? "Next month" : "ខែបន្ទាប់"}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {calendarSubView === "month" ? (
        <>
          {/* Month Grid */}
          <div className="event-calendar-grid" role="grid" aria-label={monthLabel}>
            {/* Weekday Headers */}
            <div className="event-calendar-weekdays" role="row">
              {dayHeaders.map((day, idx) => (
                <div key={idx} className="event-calendar-weekday" role="columnheader">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="event-calendar-days">
              {cells.map((cell) => {
                const isSelected = selectedDate === cell.dateKey;
                const hasEvents = cell.events.length > 0;

                return (
                  <div
                    key={cell.dateKey}
                    tabIndex={cell.isCurrentMonth ? 0 : -1}
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-label={`${formatLocalDate(cell.dateKey, en ? "en-US" : "km-KH")}${
                      hasEvents ? `, ${cell.events.length} ${en ? "event(s)" : "កម្មវិធី"}` : ""
                    }`}
                    className={`event-calendar-cell ${
                      !cell.isCurrentMonth ? "event-calendar-cell--muted" : ""
                    } ${cell.isToday ? "event-calendar-cell--today" : ""} ${
                      isSelected ? "event-calendar-cell--selected" : ""
                    } ${hasEvents ? "event-calendar-cell--has-events" : ""}`}
                    onClick={() => {
                      setSelectedDate(cell.dateKey);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedDate(cell.dateKey);
                      }
                    }}
                  >
                    <div className="event-calendar-cell-top">
                      <span className="event-calendar-day-number">{cell.dayNumber}</span>
                      {hasEvents && (
                        <span className="event-calendar-event-badge" title={`${cell.events.length} events`}>
                          {cell.events.length}
                        </span>
                      )}
                    </div>

                    {/* Mobile Indicator Dots */}
                    {hasEvents && (
                      <div className="event-calendar-dots-mobile" aria-hidden="true">
                        {cell.events.slice(0, 3).map((evt, idx) => (
                          <span
                            key={idx}
                            className={`event-calendar-dot ${
                              evt.status === "PUBLISHED" ? "is-published" : "is-draft"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Desktop Event Chips */}
                    {hasEvents && (
                      <div className="event-calendar-chips">
                        {cell.events.slice(0, 2).map((evt) => {
                          const typeName =
                            EVENT_TYPES.find((t) => t[0] === evt.eventType)?.[en ? 2 : 1] ||
                            evt.eventType ||
                            "Event";

                          return (
                            <button
                              key={evt.id}
                              type="button"
                              className={`event-calendar-chip ${
                                evt.status === "PUBLISHED" ? "is-published" : "is-draft"
                              }`}
                              title={`${evt.title || typeName}${evt.eventTime ? ` · ${evt.eventTime}` : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onManage) onManage(evt);
                              }}
                            >
                              <span className="event-calendar-chip-bullet" />
                              <span className="event-calendar-chip-title truncate">
                                {evt.title || typeName}
                              </span>
                            </button>
                          );
                        })}
                        {cell.events.length > 2 && (
                          <span className="event-calendar-more-count">
                            +{cell.events.length - 2} {en ? "more" : "ទៀត"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Card */}
          {selectedDate && (
            <div className="event-calendar-selected-details" role="region" aria-label={en ? "Selected date events" : "កម្មវិធីថ្ងៃដែលបានជ្រើសរើស"}>
              <div className="event-calendar-selected-header">
                <div className="event-calendar-selected-kicker">
                  <CalendarDays size={16} aria-hidden="true" />
                  <span>
                    {en ? "Events on" : "កម្មវិធីនៅថ្ងៃទី"}{" "}
                    <strong>{formatLocalDate(selectedDate, en ? "en-US" : "km-KH")}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="event-calendar-clear-selection-btn"
                  onClick={() => setSelectedDate(null)}
                >
                  {en ? "Close details" : "បិទ"}
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <p className="event-calendar-no-events">
                  {en
                    ? "No events scheduled for this day."
                    : "គ្មានកម្មវិធីគ្រោងទុកនៅថ្ងៃនេះទេ។"}
                </p>
              ) : (
                <div className="event-calendar-selected-list">
                  {selectedDateEvents.map((evt) => {
                    const typeName =
                      EVENT_TYPES.find((t) => t[0] === evt.eventType)?.[en ? 2 : 1] ||
                      evt.eventType ||
                      (en ? "Wedding" : "អាពាហ៍ពិពាហ៍");

                    return (
                      <article key={evt.id} className="event-calendar-detail-card">
                        <div className="event-calendar-detail-main">
                          <div className="event-calendar-detail-tags">
                            <span className="event-calendar-detail-type">{typeName}</span>
                            <span
                              className={`event-calendar-detail-status ${
                                evt.status === "PUBLISHED" ? "is-published" : "is-draft"
                              }`}
                            >
                              {evt.status === "PUBLISHED"
                                ? en ? "Published" : "បានផ្សាយ"
                                : en ? "Draft" : "ព្រាង"}
                            </span>
                            {evt.eventTime && (
                              <span className="event-calendar-detail-time">
                                <Clock size={13} aria-hidden="true" />
                                <span>{evt.eventTime.slice(0, 5)}</span>
                              </span>
                            )}
                          </div>
                          <h3 className="event-calendar-detail-title">
                            {evt.title || (en ? "Celebration" : "កម្មវិធី")}
                          </h3>
                          {evt.venueName && (
                            <p className="event-calendar-detail-venue">
                              <MapPin size={14} aria-hidden="true" />
                              <span>{evt.venueName}</span>
                            </p>
                          )}
                        </div>

                        <div className="event-calendar-detail-actions">
                          <button
                            type="button"
                            className="event-calendar-action-btn primary"
                            onClick={() => onManage && onManage(evt)}
                          >
                            <LayoutDashboard size={14} aria-hidden="true" />
                            <span>{en ? "Manage" : "គ្រប់គ្រង"}</span>
                          </button>
                          {onPreview && (
                            <button
                              type="button"
                              className="event-calendar-action-btn secondary"
                              onClick={() => onPreview(evt)}
                            >
                              <Eye size={14} aria-hidden="true" />
                              <span>{en ? "Preview" : "មើលជាមុន"}</span>
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Agenda View */
        <div className="event-calendar-agenda" role="feed" aria-label={en ? "Upcoming event agenda" : "កាលវិភាគកម្មវិធី"}>
          {sortedAgendaEvents.length === 0 ? (
            <div className="event-calendar-agenda-empty">
              <Sparkles size={28} aria-hidden="true" />
              <p>{en ? "No upcoming events scheduled." : "មិនទាន់មានកម្មវិធីបានកំណត់កាលបរិច្ឆេទនៅឡើយទេ។"}</p>
            </div>
          ) : (
            <div className="event-calendar-agenda-list">
              {sortedAgendaEvents.map((evt) => {
                const rawDate = evt.eventDate || evt.event?.date;
                const typeName =
                  EVENT_TYPES.find((t) => t[0] === evt.eventType)?.[en ? 2 : 1] ||
                  evt.eventType ||
                  (en ? "Wedding" : "អាពាហ៍ពិពាហ៍");

                return (
                  <article key={evt.id} className="event-calendar-agenda-item">
                    <div className="event-calendar-agenda-date-box">
                      <CalendarDays size={16} aria-hidden="true" />
                      <strong>
                        {rawDate
                          ? formatLocalDate(rawDate, en ? "en-US" : "km-KH")
                          : en ? "Unscheduled" : "មិនទាន់កំណត់"}
                      </strong>
                      {evt.eventTime && (
                        <span className="event-calendar-agenda-time">
                          {evt.eventTime.slice(0, 5)}
                        </span>
                      )}
                    </div>

                    <div className="event-calendar-agenda-info">
                      <div className="event-calendar-agenda-badges">
                        <span className="event-calendar-detail-type">{typeName}</span>
                        <span
                          className={`event-calendar-detail-status ${
                            evt.status === "PUBLISHED" ? "is-published" : "is-draft"
                          }`}
                        >
                          {evt.status === "PUBLISHED"
                            ? en ? "Published" : "បានផ្សាយ"
                            : en ? "Draft" : "ព្រាង"}
                        </span>
                      </div>
                      <h3 className="event-calendar-agenda-title">
                        {evt.title || (en ? "Celebration" : "កម្មវិធី")}
                      </h3>
                      {evt.venueName && (
                        <p className="event-calendar-agenda-venue">
                          <MapPin size={13} aria-hidden="true" />
                          <span>{evt.venueName}</span>
                        </p>
                      )}
                    </div>

                    <div className="event-calendar-agenda-actions">
                      <button
                        type="button"
                        className="event-calendar-action-btn primary"
                        onClick={() => onManage && onManage(evt)}
                      >
                        <LayoutDashboard size={14} aria-hidden="true" />
                        <span>{en ? "Manage" : "គ្រប់គ្រង"}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default EventCalendar;
