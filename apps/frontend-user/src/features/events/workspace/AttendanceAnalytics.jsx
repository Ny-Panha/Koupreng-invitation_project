import { PageSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { useEffect, useState } from 'react';
import AccessFailureState from '@/shared/access/AccessFailureState';
import { api } from '@/shared/api/httpClient';
import { unwrap } from '@/shared/api/helpers';
import { useUiCopy } from '@/shared/i18n/useUiCopy';
import { useEventWorkspace } from './EventContext';
import './AttendanceAnalytics.css';

function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function initialRange() { const to = today(), from = new Date(`${to}T00:00:00Z`); from.setUTCDate(from.getUTCDate() - 29); return { from: from.toISOString().slice(0,10), to }; }

export default function AttendanceAnalytics() {
  const { eventId } = useEventWorkspace(), copy = useUiCopy();
  const [draft, setDraft] = useState(initialRange), [range, setRange] = useState(initialRange);
  const [retry, setRetry] = useState(0), [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let active = true;
    setState(current => ({ ...current, loading: true, error: '' }));
    api.get(`/v1/invitations/${eventId}/analytics`, { params: range }).then(unwrap)
      .then(data => { if (!Array.isArray(data?.days) || !data.current) throw new Error('Invalid analytics response'); if (active) setState({ loading: false, data, error: '' }); })
      .catch(error => { if (active) setState({ loading: false, data: null, error: error.message, failure: error }); });
    return () => { active = false; };
  }, [eventId, range, retry]);
  const data = state.data, current = data?.current;
  const max = Math.max(1, ...(data?.days || []).map(day => day.latestRsvpRecords));
  const hasFacts = data?.days.some(day => day.guestRecordsCreated || day.latestRsvpRecords || day.activeCheckInRecords);
  const responseRate = current?.guestRecords ? `${(100 * current.respondedRecords / current.guestRecords).toFixed(1)}%` : '—';
  const labels = [copy('កាលបរិច្ឆេទ', 'Date'), copy('កំណត់ត្រាភ្ញៀវថ្មី', 'Guest records created'), copy('RSVP ចុងក្រោយ', 'Latest RSVP records'), copy('ចូលរួម', 'Attending records'), copy('មិនចូលរួម', 'Declined records'), copy('ប្រហែល', 'Maybe records'), copy('វត្តមានសកម្ម', 'Active check-in records')];
  return <main className="workspace-page attendance-analytics">
    <header className="workspace-heading"><h1>{copy('វិភាគការចូលរួម', 'Attendance analytics')}</h1><p>{copy('ទិន្នន័យភ្ញៀវ RSVP និងវត្តមានដែលបានរក្សាទុក។ ត្រូវការសិទ្ធិរបាយការណ៍ និងកញ្ចប់ម្ចាស់ដែលមានវិភាគកម្រិតខ្ពស់។', 'Stored guest, RSVP and check-in facts. Requires report permission and the owner’s Advanced Analytics entitlement.')}</p></header>
    <form className="workspace-section analytics-range" onSubmit={event => { event.preventDefault(); setRange({ ...draft }); }}>
      <label className="workspace-field">{copy('ចាប់ពី', 'From')}<input type="date" required value={draft.from} max={draft.to} onChange={event => setDraft(value => ({ ...value, from: event.target.value }))} /></label>
      <label className="workspace-field">{copy('ដល់', 'To')}<input type="date" required value={draft.to} min={draft.from} onChange={event => setDraft(value => ({ ...value, to: event.target.value }))} /></label>
      <button className="workspace-button primary" type="submit" disabled={state.loading}>{copy('មើលរបាយការណ៍', 'Apply dates')}</button><p>{copy('១–៣៦៦ ថ្ងៃ។ កាលបរិច្ឆេទទាំងពីរត្រូវបានរាប់បញ្ចូល តាមម៉ោងកម្ពុជា UTC+07។', '1–366 days, inclusive calendar dates in Asia/Phnom_Penh (UTC+07).')}</p>
    </form>
    {state.loading && (!data ? <PageSkeleton layout="chart" label={copy('កំពុងផ្ទុកទិន្នន័យ…', 'Loading attendance facts…')} /> : <LoadingRegion label={copy('កំពុងធ្វើបច្ចុប្បន្នភាព…', 'Refreshing…')} />)}
    {state.error && <AccessFailureState error={state.failure || state.error} feature="ADVANCED_ANALYTICS" permission="VIEW_REPORTS" onRetry={() => setRetry(value => value + 1)} />}
    {data && <>
      <section className="workspace-section"><h2>{copy('ស្ថានភាពបច្ចុប្បន្នទាំងកម្មវិធី', 'Current event totals')}</h2><p>{copy('ទាំងអស់នៅពេលផ្ទុក មិនត្រូវបានកំណត់ដោយកាលបរិច្ឆេទខាងលើ។', 'All current records when loaded; these totals are independent of the selected dates.')}</p>
        <dl className="analytics-totals">{[[copy('កំណត់ត្រាភ្ញៀវ', 'Guest records'), current.guestRecords], [copy('កៅអីកក់', 'Reserved seats'), current.reservedSeats], [copy('អត្រាឆ្លើយតប RSVP', 'RSVP response rate'), responseRate], [copy('អ្នកចូលរួមបញ្ជាក់', 'Confirmed attendees'), current.confirmedAttendees], [copy('កំណត់ត្រាវត្តមាន', 'Checked-in guest records'), current.checkedInRecords]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <p>{copy('អត្រាឆ្លើយតប = កំណត់ត្រាភ្ញៀវមាន RSVP / កំណត់ត្រាភ្ញៀវទាំងអស់។ វត្តមានរាប់កំណត់ត្រាភ្ញៀវ មិនមែនចំនួនមនុស្សមកដល់។', 'Response rate = guest records with a linked RSVP ÷ all guest records. Check-ins count guest records, not individual arrivals.')}</p>
      </section>
      <section className="workspace-section"><h2>{copy('RSVP ចុងក្រោយតាមថ្ងៃ', 'Latest stored RSVP records by date')}</h2><p>{data.from} – {data.to} · {data.timezone} · {copy('ឯកតា៖ កំណត់ត្រា', 'Unit: records')}</p>
        <p>{copy('ប្រភព៖ កំណត់ត្រាភ្ញៀវ RSVP និងវត្តមានសកម្មលើម៉ាស៊ីនមេ។ ការកែ RSVP ផ្លាស់ទៅថ្ងៃឆ្លើយតបចុងក្រោយ។ នេះមិនមែនប្រវត្តិរាល់ការកែ ឬអត្រាបម្លែងទេ។ ការលុបភ្ញៀវ និងដកវត្តមានអាចប្ដូរលទ្ធផល។', 'Source: server guest rows, current linked RSVPs and active check-ins. Editing an RSVP moves it to its latest response date. This is not a history of every change or a conversion chart. Guest deletion and check-in undo can change the results.')}</p>
        {!hasFacts && <p role="status">{copy('មិនមានកំណត់ត្រាក្នុងរយៈពេលនេះ។', 'No stored activity in this date range.')}</p>}
        {hasFacts && <div className="analytics-bars" aria-hidden="true">{data.days.map(day => <div key={day.date} title={`${day.date}: ${day.latestRsvpRecords}`}><span style={{ height: `${100 * day.latestRsvpRecords / max}%` }} /></div>)}</div>}
        <div className="analytics-table-scroll" role="region" aria-label={copy('ទិន្នន័យប្រចាំថ្ងៃ អាចរុញផ្ដេក', 'Daily data, scroll horizontally')} tabIndex={0}><table><caption>{copy('ទិន្នន័យតាមថ្ងៃ សម្រាប់ក្រាហ្វខាងលើ', 'Daily data equivalent for the chart above')}</caption><thead><tr>{labels.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{data.days.map(day => <tr key={day.date}><th scope="row">{day.date}</th>{['guestRecordsCreated','latestRsvpRecords','attendingRecords','declinedRecords','maybeRecords','activeCheckInRecords'].map(key => <td key={key}>{day[key]}</td>)}</tr>)}</tbody></table></div>
      </section>
    </>}
  </main>;
}
