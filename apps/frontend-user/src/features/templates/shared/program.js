// Date-only values are calendar dates, never event instants. UTC parts keep
// calendar arithmetic independent of the guest's timezone and DST transitions.
export function validProgramDate(value) {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function programDate(item, master = '') {
  if (validProgramDate(item?.date)) return item.date;
  const base = String(master || '').slice(0, 10);
  if (!validProgramDate(base)) return '';
  const [y, m, d] = base.split('-').map(Number);
  const offset = Number(item?.day);
  const date = new Date(Date.UTC(y, m - 1, d + (Number.isInteger(offset) && offset > 0 && offset <= 30 ? offset - 1 : 0)));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function normalizeProgram(value) {
  return Array.isArray(value) ? value.filter(s => s && typeof s === 'object' && !Array.isArray(s)).map((s, i) => ({
    ...s, id: s.id || `schedule-${i}`, time: s.time || s.startTime || s.timeText || '',
    title: s.title || s.titleKm || s.name || s.label || '', description: s.description || s.descriptionKm || s.desc || '',
  })) : [];
}

export function legacyProgram(days) {
  if (!Array.isArray(days)) return [];
  return days.flatMap((day, index) => normalizeProgram(day?.items).map(row => ({
    ...row, id: `agenda-${index}-${row.id}`, day: row.day ?? index + 1,
    date: row.date || day.date || '', dayTitle: row.dayTitle || day.title || '',
    period: row.period || day.period || '',
  })));
}

export function groupProgram(value, master = '', metadata = []) {
  const days = (Array.isArray(metadata) ? metadata : []).filter(day => day && typeof day === 'object' && typeof day.id === 'string').map(day => ({ ...day, items: [] }));
  for (const row of normalizeProgram(value)) {
    const titleHash = Array.from(String(row.dayTitle || '')).reduce((hash, char) => Math.imul(hash ^ char.codePointAt(0), 16777619), 2166136261) >>> 0;
    const id = row.dayId || `legacy-${row.day || 1}-${row.date || ''}-${titleHash.toString(16)}`;
    let day = days.find(item => item.id === id);
    if (!day) {
      day = { id, date: row.date || '', title: row.dayTitle || '', day: row.day || 1, items: [] };
      days.push(day);
    }
    day.items.push(row);
  }
  return days.map((day, index) => ({ ...day, resolvedDate: programDate({ date: day.date, day: day.day || index + 1 }, master) }));
}

// Array order is authoritative. Editing never projects away unknown properties.
export function serializeProgramDays(days) {
  return {
    programDays: days.map((source, index) => { const day = { ...source, day: index + 1 }; delete day.items; delete day.resolvedDate; return day; }),
    schedule: days.flatMap((day, index) => day.items.map(row => ({ ...row, dayId: day.id, day: index + 1, date: day.date || '', dayTitle: day.title || '' }))),
  };
}

export const PROGRAM_PERIODS = { MORNING: ['ព្រឹក', 'Morning'], DAYTIME: ['ថ្ងៃ / រសៀល', 'Daytime'], EVENING: ['ល្ងាច', 'Evening'] };
