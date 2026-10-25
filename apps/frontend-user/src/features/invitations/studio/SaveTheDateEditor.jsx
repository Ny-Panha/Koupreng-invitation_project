import { useId } from 'react';
import { resolveEvent, validTimezone } from '../../templates/shared/eventDateTime';

export default function SaveTheDateEditor({ form, onChange, english, supportsOrdering = false, showEventFields = true }) {
  const copy = (km, en) => english ? en : km;
  const settings = form.saveTheDate || {};
  const event = resolveEvent(form);
  const id = useId();
  const set = (key, value) => onChange({ saveTheDate: { enabled: settings.enabled ?? form.showCountdown !== false, ...settings, [key]: value } });
  const error = !validTimezone(event.timezone) ? copy('សូមបញ្ចូលតំបន់ម៉ោង IANA ត្រឹមត្រូវ។', 'Enter a valid IANA timezone.')
    : event.validDate && event.time && event.instant === null ? copy('ម៉ោងនេះមិនមានក្នុងតំបន់ម៉ោងនេះទេ។ សូមពិនិត្យការប្ដូរម៉ោងរដូវ។', 'This local time does not exist in the selected timezone. Check daylight saving time.') : '';
  return <section className="pe-section-card studio-date-editor" aria-label={copy('កំណត់ថ្ងៃមង្គល', 'Save the date')}>
    <h4 className="pe-section-heading">{copy('កំណត់ថ្ងៃមង្គល', 'Save the date')}</h4>
    <label className="pe-label studio-inline-check"><input type="checkbox" checked={settings.enabled ?? form.showCountdown !== false} onChange={e => onChange({ saveTheDate: { ...settings, enabled: e.target.checked }, showCountdown: e.target.checked })} />{copy('បង្ហាញផ្នែកកំណត់ថ្ងៃ', 'Show Save the Date section')}</label>
    <p>{copy('ថ្ងៃ និងម៉ោងនេះជាព័ត៌មានកម្មវិធីតែមួយ ដែលប្រើសម្រាប់រាប់ថយក្រោយ និងប្រតិទិន។', 'These are the event’s shared date and time, used for the countdown and calendar.')}</p>
    <div className="pe-grid-2">
      <label className="pe-label">{copy('ចំណងជើងផ្នែក', 'Section heading')}<input className="pe-input" maxLength={300} value={settings.heading || ''} onChange={e => set('heading', e.target.value)} /></label>
      <label className="pe-label">{copy('អត្ថបទរង', 'Subtitle')}<input className="pe-input" maxLength={1000} value={settings.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></label>
      {showEventFields && <><label className="pe-label">{copy('ថ្ងៃកម្មវិធី', 'Event date')}<input className="pe-input" type="date" value={form.eventDate || ''} onChange={e => onChange({ eventDate: e.target.value })} /></label>
      <label className="pe-label">{copy('ម៉ោងកម្មវិធី', 'Event time')}<input className="pe-input" type="time" value={form.eventTime || ''} onChange={e => onChange({ eventTime: e.target.value })} /></label></>}
      <label className="pe-label">{copy('តំបន់ម៉ោង', 'Event timezone')}<input className="pe-input" list={`${id}-zones`} maxLength={100} value={event.timezone} aria-invalid={Boolean(error)} aria-describedby={`${id}-help`} onChange={e => onChange({ eventTimezone: e.target.value })} /><datalist id={`${id}-zones`}>{['Asia/Phnom_Penh', 'Asia/Bangkok', 'Asia/Tokyo', 'Europe/Paris', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney', 'UTC'].map(zone => <option key={zone} value={zone} />)}</datalist></label>
      <label className="pe-label">{copy('លេខ', 'Numerals')}<select className="pe-input" value={settings.numerals || 'auto'} onChange={e => set('numerals', e.target.value === 'auto' ? undefined : e.target.value)}><option value="auto">{copy('តាមភាសា', 'Follow content language')}</option><option value="khmer">ខ្មែរ · ០១២៣</option><option value="latin">Latin · 0123</option></select></label>
      <label className="pe-label">{copy('រចនារាប់ថយក្រោយ', 'Countdown style')}<select className="pe-input" value={settings.countdownStyle || 'theme'} onChange={e => set('countdownStyle', e.target.value)}><option value="theme">{copy('តាមគំរូ', 'Template style')}</option><option value="circles">{copy('រង្វង់', 'Circles')}</option><option value="minimal">{copy('សាមញ្ញ', 'Minimal')}</option></select></label>
    </div>
    <p id={`${id}-help`}>{copy('ម៉ោងរដូវដែលកើតឡើងពីរដង ប្រើពេលដំបូង។ ទុកម៉ោងទទេសម្រាប់កម្មវិធីពេញមួយថ្ងៃ ដោយមិនរាប់ថយក្រោយ។', 'Repeated daylight-saving times use the earlier occurrence. Leave time blank for an all-day event without a countdown.')}</p>
    {error && <p role="alert">{error}</p>}
    <div className="studio-date-toggles">{[
      ['showCountdown', 'បង្ហាញរាប់ថយក្រោយ', 'Show countdown', true], ['showCalendar', 'បង្ហាញប្រតិទិន', 'Show calendar', false], ['showAddToCalendar', 'បង្ហាញប៊ូតុងប្រតិទិន', 'Show Add to Calendar', false], ['calendarNavigation', 'បើកប្ដូរខែ', 'Allow month navigation', false], ['showTime', 'បង្ហាញម៉ោង', 'Show event time', true], ['showVenue', 'បង្ហាញទីកន្លែង', 'Show venue summary', false],
    ].map(([key, km, en, fallback]) => <label className="pe-label studio-inline-check" key={key}><input type="checkbox" checked={settings[key] ?? fallback} onChange={e => set(key, e.target.checked)} />{copy(km, en)}</label>)}</div>
    <div className="pe-grid-2"><label className="pe-label">{copy('ថ្ងៃបញ្ចប់ (ជាជម្រើស)', 'End date (optional)')}<input className="pe-input" type="date" value={form.eventEndDate || ''} onChange={e => onChange({ eventEndDate: e.target.value })} /></label><label className="pe-label">{copy('ម៉ោងបញ្ចប់ (ជាជម្រើស)', 'End time (optional)')}<input className="pe-input" type="time" value={form.eventEndTime || ''} onChange={e => onChange({ eventEndTime: e.target.value })} /></label></div>
    <p>{copy('ប្រតិទិនប្រើរយៈពេល ២ ម៉ោង បើមិនបានកំណត់ម៉ោងបញ្ចប់។ កម្មវិធីគ្មានម៉ោងត្រូវនាំចេញជាពេញមួយថ្ងៃ។', 'Calendar exports use a two-hour duration unless you set an end time. Events without a time export as all-day events.')}</p>
    {supportsOrdering && <button type="button" className="pe-btn-upload-action" onClick={() => { const order = form.sectionOrder?.length ? form.sectionOrder : ['family', 'invitation', 'countdown', 'schedule', 'map', 'gallery', 'story', 'dressCode', 'gift', 'faq', 'rsvp']; const next = [...order]; const a = next.indexOf('countdown'), b = next.indexOf('schedule'); if (a >= 0 && b >= 0) { [next[a], next[b]] = [next[b], next[a]]; onChange({ sectionOrder: next }); } }}>{copy('ប្ដូរលំដាប់ថ្ងៃ និងកម្មវិធី', 'Swap date and program sections')}</button>}
  </section>;
}
