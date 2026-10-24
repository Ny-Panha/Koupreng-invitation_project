// Date-only values are local calendar dates, never UTC instants.
export function validProgramDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function programDate(item, master = '') {
  if (validProgramDate(item?.date)) return item.date;
  const base = String(master || '').slice(0, 10);
  if (!validProgramDate(base)) return '';
  const [y, m, d] = base.split('-').map(Number);
  const date = new Date(y, m - 1, d + (Number(item?.day) === 2 ? 1 : 0));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function normalizeProgram(value) {
  return Array.isArray(value) ? value.filter(s => s && typeof s === 'object' && !Array.isArray(s)).map((s, i) => ({
    ...s, id: s.id || `schedule-${i}`, time: s.time || s.startTime || s.timeText || '',
    title: s.title || s.name || s.label || '', description: s.description || s.desc || '',
  })) : [];
}

export function legacyProgram(days) {
  if (!Array.isArray(days)) return [];
  return days.flatMap((day, index) => normalizeProgram(day?.items).map(row => ({
    ...row, id: `agenda-${index}-${row.id}`, day: row.day ?? (index < 2 ? index + 1 : undefined),
    date: row.date || day.date || '', dayTitle: row.dayTitle || day.title || '',
    period: row.period || day.period || '',
  })));
}

export const PROGRAM_PERIODS = { MORNING: ['ព្រឹក', 'Morning'], DAYTIME: ['ថ្ងៃ / រសៀល', 'Daytime'], EVENING: ['ល្ងាច', 'Evening'] };
