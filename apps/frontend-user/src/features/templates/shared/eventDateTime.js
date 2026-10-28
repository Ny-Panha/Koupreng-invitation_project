import { validProgramDate } from './program';

export const DEFAULT_EVENT_TIMEZONE = 'Asia/Phnom_Penh';
export const CALENDAR_FALLBACK_MINUTES = 120;
export const validEventTime = value => /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value || '');
const formatters = new Map();

export function validTimezone(zone) {
  if (typeof zone !== 'string' || !/^(?:[A-Za-z_+-]+\/)+[A-Za-z_+\d-]+$|^UTC$/.test(zone)) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true; } catch { return false; }
}

function zonedParts(instant, zone) {
  if (!formatters.has(zone)) formatters.set(zone, new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }));
  return Object.fromEntries(formatters.get(zone).formatToParts(new Date(instant)).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}

// Sample surrounding offsets, then round-trip each candidate. Gaps are invalid;
// repeated wall times select the earlier occurrence (documented in the editor).
export function wallTimeToInstant(date, time, zone = DEFAULT_EVENT_TIMEZONE) {
  if (!validProgramDate(date) || !validEventTime(time) || !validTimezone(zone)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second = 0] = time.split(':').map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsets = new Set();
  for (let h = -36; h <= 36; h += 6) {
    const sample = wall + h * 3600000;
    const p = zonedParts(sample, zone);
    offsets.add(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - sample);
  }
  const matches = [...offsets].map(offset => wall - offset).filter(candidate => {
    const p = zonedParts(candidate, zone);
    return `${p.year}-${p.month}-${p.day}` === date && +p.hour === hour && +p.minute === minute && +p.second === second;
  });
  return matches.length ? Math.min(...matches) : null;
}

export function absoluteInstant(value) {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    if (!validProgramDate(value.slice(0, 10)) || !validEventTime(value.slice(11, 19).replace(/(?:Z|[+-]).*$/, ''))) return null;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  // Legacy wall-clock targets also use an IANA zone, never the browser's zone.
  return wallTimeToInstant(value.slice(0, 10), value.slice(11), DEFAULT_EVENT_TIMEZONE);
}

export function resolveEvent(content = {}) {
  const timezone = content.eventTimezone || DEFAULT_EVENT_TIMEZONE;
  const legacy = content.machineEventDate || content.targetDate || '';
  let date = content.eventDate || '';
  let time = content.eventTime || '';
  if (!date && legacy) {
    const instant = absoluteInstant(legacy);
    if (instant !== null && validTimezone(timezone)) {
      const p = zonedParts(instant, timezone);
      date = `${p.year}-${p.month}-${p.day}`;
      time = `${p.hour}:${p.minute}`;
    } else if (validProgramDate(String(legacy).slice(0, 10))) {
      date = String(legacy).slice(0, 10);
      time = String(legacy).slice(11, 16);
    }
  }
  const instant = wallTimeToInstant(date, time, timezone);
  return { date, time, timezone, instant, validDate: validProgramDate(date), allDay: !time };
}

export function countdownParts(target, now = Date.now()) {
  const instant = absoluteInstant(target);
  const total = instant === null ? 0 : Math.max(0, Math.ceil((instant - now) / 1000));
  const pad = n => String(n).padStart(2, '0');
  return { d: pad(Math.floor(total / 86400)), h: pad(Math.floor(total / 3600) % 24), m: pad(Math.floor(total / 60) % 60), s: pad(total % 60), valid: instant !== null, expired: instant !== null && instant <= now };
}

export function formatNumerals(value, numerals = 'latin') {
  return numerals === 'khmer' ? String(value).replace(/\d/g, digit => '០១២៣៤៥៦៧៨៩'[Number(digit)]) : String(value);
}

// Format a saved wall time without involving the device timezone. Legacy time
// wording remains authored text; midnight is a real time, not a missing value.
export function formatEventTime(time, english = false, numerals = english ? 'latin' : 'khmer') {
  if (!validEventTime(time)) return formatNumerals(time || '', numerals);
  const [hour, minute] = time.split(':').map(Number);
  const period = english ? (hour < 12 ? 'AM' : 'PM') : hour < 12 ? 'ព្រឹក' : hour < 17 ? 'រសៀល' : 'ល្ងាច';
  return formatNumerals(`${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${period}`, numerals);
}

export function eventToday(timezone = DEFAULT_EVENT_TIMEZONE, now = Date.now()) {
  const p = zonedParts(now, validTimezone(timezone) ? timezone : DEFAULT_EVENT_TIMEZONE);
  return `${p.year}-${p.month}-${p.day}`;
}

export function formatEventDate(date, english = false, numerals = english ? 'latin' : 'khmer', options = {}) {
  if (!validProgramDate(date)) return '';
  if (!english) {
    // Some browser/OS ICU builds fall back to English for km-KH. Keep the
    // Gregorian Khmer month and weekday vocabulary deterministic everywhere.
    const months = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
    const weekdays = ['ថ្ងៃអាទិត្យ','ថ្ងៃចន្ទ','ថ្ងៃអង្គារ','ថ្ងៃពុធ','ថ្ងៃព្រហស្បតិ៍','ថ្ងៃសុក្រ','ថ្ងៃសៅរ៍'];
    const [year, month, day] = date.split('-').map(Number);
    const weekday = options.weekday ? weekdays[new Date(`${date}T12:00:00Z`).getUTCDay()] + ' ' : '';
    const included = field => !Object.hasOwn(options, field) || options[field] !== undefined;
    return formatNumerals(`${weekday}${[included('day') ? `ទី${day}` : '', included('month') ? `ខែ${months[month - 1]}` : '', included('year') ? `ឆ្នាំ${year}` : ''].filter(Boolean).join(' ')}`.trim(), numerals);
  }
  return formatNumerals(new Intl.DateTimeFormat(english ? 'en-GB' : 'km-KH', {
    calendar: 'gregory', numberingSystem: 'latn', timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', ...options,
  }).format(new Date(`${date}T12:00:00Z`)), numerals);
}

export function calendarMonth(date) {
  if (!validProgramDate(date)) return [];
  const [year, month] = date.split('-').map(Number);
  const leading = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [...Array(Math.ceil((leading + length) / 7) * 7)].map((_, i) => i < leading || i >= leading + length ? null : `${date.slice(0, 7)}-${String(i - leading + 1).padStart(2, '0')}`);
}

export function shiftMonth(date, delta) {
  const [year, month] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 + delta, 1)).toISOString().slice(0, 10);
}
