import { backendEventId } from '../workspace/eventRoutes';

export function eventDay(event) {
  const value = String(event.eventDate || event.event?.date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === Number(value.slice(0,4)) && parsed.getMonth()+1 === Number(value.slice(5,7)) && parsed.getDate() === Number(value.slice(8,10)) ? value : null;
}

function timestamp(event) {
  for (const value of [event.updatedAt, event.createdAt]) {
    if (value == null || value === '') continue;
    const time = typeof value === 'number' ? value : Date.parse(value);
    if (Number.isFinite(time)) return time;
  }
  return -Infinity;
}

export function compareEvents(a, b, sort = 'newest', locale = 'en') {
  const tie = () => String(a.id ?? '').localeCompare(String(b.id ?? ''), 'en', {numeric:true});
  if (sort === 'title') return String(a.title || '').normalize('NFC').localeCompare(String(b.title || '').normalize('NFC'), locale) || tie();
  if (sort === 'date') return (eventDay(a) || '9999-12-31').localeCompare(eventDay(b) || '9999-12-31') || tie();
  const first = timestamp(a), second = timestamp(b);
  return first === second ? tie() : first > second ? -1 : 1;
}

export function eventProvenance(event) {
  const serverId = backendEventId(event);
  const failed = event.syncStatus === 'SYNC_FAILED';
  const local = !serverId || (event.syncStatus === 'LOCAL_ONLY' && !event.backendInvitationId);
  return { serverId, failed, local, resume: !event.shared && (failed || local), shared: event.shared === true };
}

export function pageItems(current, count) {
  return Array.from({length:count},(_,i)=>i).filter(i=>i===0 || i===count-1 || Math.abs(i-current)<=1)
    .flatMap((value,index,items)=>index && value-items[index-1]>1 ? ['gap-'+value,value] : [value]);
}
