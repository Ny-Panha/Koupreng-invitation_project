import { useId, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeddingCountdown } from '../../../shared/SaveTheDate';
import { calendarMonth, eventToday, formatEventDate, formatEventTime, formatNumerals, resolveEvent, shiftMonth } from '../../../shared/eventDateTime';
import { programDayHeading, validProgramDate } from '../../../shared/program';

function CalendarExportActions({ content, english, mainAvailable, programAvailable }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const download = async mode => {
    setBusy(true);
    try {
      // Build and download only after a guest action; shared utilities may
      // already be cached by another template section.
      const { buildEventCalendar, buildProgramCalendar } = await import('../../../shared/eventCalendarExport');
      const result = mode === 'ceremonies' ? buildProgramCalendar(content, { english }) : { calendar: buildEventCalendar(content), skipped: 0 };
      if (!result.calendar) { setStatus(english ? 'No ceremonies have a valid date and time to export.' : 'មិនមានពិធីដែលមានថ្ងៃ និងម៉ោងត្រឹមត្រូវសម្រាប់នាំចេញទេ។'); return; }
      const url = URL.createObjectURL(new Blob([result.calendar], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = mode === 'ceremonies' ? 'wedding-ceremonies.ics' : 'celebration.ics';
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(result.skipped ? (english ? `${result.skipped} ceremonies excluded: check their dates, times or titles with the hosts.` : `${formatNumerals(result.skipped, 'khmer')} ពិធីមិនអាចនាំចេញបាន។ សូមពិនិត្យថ្ងៃ ម៉ោង និងចំណងជើងជាមួយម្ចាស់កម្មវិធី។`) : (english ? 'Calendar downloaded.' : 'បានទាញយកប្រតិទិន។'));
    } catch { setStatus(english ? 'Calendar unavailable. Please check the event details with the hosts.' : 'មិនអាចទាញយកប្រតិទិនបានទេ។ សូមពិនិត្យព័ត៌មានជាមួយម្ចាស់កម្មវិធី។'); }
    finally { setBusy(false); }
  };
  return <div className="rg-calendar-export" aria-busy={busy}>
    {mainAvailable && <button type="button" className="rg-button rg-calendar-primary" disabled={busy} onClick={() => download('main')}><CalendarDays size={20} aria-hidden="true" /><span><strong>{english ? 'Add to Calendar' : 'បន្ថែមទៅប្រតិទិន'}</strong><small>{english ? 'Main celebration' : 'ពិធីមង្គលការចម្បង'}</small></span></button>}
    {programAvailable && <button type="button" className="rg-button rg-calendar-secondary" disabled={busy} onClick={() => download('ceremonies')}>{english ? 'All wedding ceremonies' : 'ពិធីមង្គលការទាំងអស់'}</button>}
    <p role="status">{status}</p>
  </div>;
}

export default function RoyalGardenWeddingCalendar({ content = {}, days = [], english = false, onProgramDay }) {
  const settings = content.saveTheDate || {};
  const event = resolveEvent(content);
  const numerals = settings.numerals || (english ? 'latin' : 'khmer');
  const numeral = value => formatNumerals(value, numerals);
  const datedDays = days.filter(day => validProgramDate(day.resolvedDate));
  const anchor = event.validDate ? event.date : datedDays[0]?.resolvedDate || '';
  // Data edits invalidate local browsing/selection without writing defaults back.
  const signature = `${anchor}|${datedDays.map(day => `${day.id}:${day.resolvedDate}`).join('|')}`;
  const [browsing, setBrowsing] = useState(null);
  const [selection, setSelection] = useState(null);
  const month = browsing?.signature === signature ? browsing.date : anchor;
  const selected = selection?.signature === signature ? selection.date : anchor;
  const selectedDays = datedDays.filter(day => day.resolvedDate === selected);
  const cells = calendarMonth(month);
  const id = useId();
  const today = eventToday(event.timezone);
  const weekdays = english ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['អា', 'ច', 'អ', 'ពុ', 'ព្រ', 'សុ', 'ស'];
  const fullWeekdays = english ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  if (settings.enabled === false) return null;
  return <div className="rg-wedding-calendar kp-save-date" lang={english ? 'en' : 'km'}>
    <div className="rg-heading"><span className="rg-calendar-kicker">{english ? 'A DATE TO REMEMBER' : 'ថ្ងៃដ៏មានអត្ថន័យ'}</span><h2>{settings.heading || (english ? 'Save the date' : 'កំណត់ថ្ងៃមង្គល')}</h2><span className="rg-divider" aria-hidden="true" /></div>
    {settings.subtitle && <p className="rg-copy">{settings.subtitle}</p>}
    {event.validDate ? <p className="rg-calendar-date"><time dateTime={event.date}>{formatEventDate(event.date, english, numerals, { weekday: 'long' })}</time></p> : <p>{english ? 'The date will be announced soon.' : 'កាលបរិច្ឆេទនឹងត្រូវប្រកាសឆាប់ៗនេះ។'}</p>}
    {settings.showTime !== false && event.time && <p>{formatEventTime(event.time, english, numerals)}</p>}
    {settings.showVenue && (content.venueName || content.venue?.name) && <p>{content.venueName || content.venue?.name}</p>}
    {(settings.showCountdown ?? content.showCountdown ?? true) && event.instant !== null && <WeddingCountdown instant={event.instant} english={english} numerals={numerals} style={settings.countdownStyle || 'circles'} />}
    {event.time && event.instant === null && <p>{english ? 'Event time will be confirmed.' : 'ម៉ោងកម្មវិធីនឹងត្រូវបានបញ្ជាក់។'}</p>}
    {settings.showCalendar && cells.length > 0 && <div className="rg-month-calendar">
      <div className="rg-month-navigation">
        {settings.calendarNavigation !== false && <button type="button" aria-label={english ? 'Previous month' : 'ខែមុន'} disabled={month.slice(0, 7) === '1000-01'} onClick={() => setBrowsing({ signature, date: shiftMonth(month, -1) })}><ChevronLeft aria-hidden="true" /></button>}
        <h3 id={id} aria-live="polite">{formatEventDate(month, english, numerals, { day: undefined })}</h3>
        {settings.calendarNavigation !== false && <button type="button" aria-label={english ? 'Next month' : 'ខែបន្ទាប់'} disabled={month.slice(0, 7) === '9999-12'} onClick={() => setBrowsing({ signature, date: shiftMonth(month, 1) })}><ChevronRight aria-hidden="true" /></button>}
      </div>
      <table aria-labelledby={id}><thead><tr>{weekdays.map((day, index) => <th key={index} scope="col"><abbr title={fullWeekdays[index]}>{day}</abbr></th>)}</tr></thead>
        <tbody>{Array.from({ length: cells.length / 7 }, (_, week) => <tr key={week}>{cells.slice(week * 7, week * 7 + 7).map((date, index) => {
          const main = date === event.date, ceremony = datedDays.some(day => day.resolvedDate === date);
          return <td key={index}>{date && <button type="button" data-date={date} data-main={main || undefined} data-ceremony={ceremony || undefined} aria-current={date === today ? 'date' : undefined} aria-pressed={date === selected}
            aria-label={`${formatEventDate(date, english, numerals)}${main ? (english ? ', main celebration' : ' ពិធីចម្បង') : ''}${ceremony ? (english ? ', wedding ceremonies' : ' ពិធីមង្គលការ') : ''}`}
            onClick={() => setSelection({ signature, date })}><time dateTime={date} className={main ? 'kp-calendar-event' : undefined}>{numeral(Number(date.slice(-2)))}</time>{(main || ceremony) && <span className="rg-date-marker" aria-hidden="true">{main ? '◆' : '●'}</span>}</button>}</td>;
        })}</tr>)}</tbody>
      </table>
      {!content.isTemplateDemo && <p className="rg-calendar-legend"><span>◆ {english ? 'Main celebration' : 'ពិធីចម្បង'}</span><span>● {english ? 'Ceremonies' : 'ពិធីមង្គលការ'}</span></p>}
      {month.slice(0, 7) !== anchor.slice(0, 7) && <button type="button" className="rg-calendar-return" onClick={() => setBrowsing(null)}>{english ? 'Return to wedding month' : 'ត្រឡប់ទៅខែមង្គលការ'}</button>}
      {!content.isTemplateDemo && <div className="rg-selected-day" role="region" aria-label={english ? 'Selected day' : 'ថ្ងៃដែលបានជ្រើស'} aria-live="polite">
        <p><time dateTime={selected}>{formatEventDate(selected, english, numerals, { weekday: 'long' })}</time></p>
        {selectedDays.map(day => <div key={day.id}>
          <h4>{programDayHeading(day, days.indexOf(day), english, numeral)}</h4>
          <ul>{day.items.map(row => <li key={row.id}><span>{formatEventTime(row.time, english, numerals)}</span><span>{(english ? row.titleEn : row.titleKm) || row.title}</span></li>)}</ul>
          {onProgramDay && <button type="button" className="rg-calendar-return" onClick={() => onProgramDay(day.id)}>{english ? 'View this day’s programme' : 'មើលកម្មវិធីថ្ងៃនេះ'}</button>}
        </div>)}
        {!selectedDays.length && <p>{selected === event.date ? (english ? 'Main wedding celebration' : 'ពិធីមង្គលការចម្បង') : (english ? 'No ceremonies scheduled for this date.' : 'មិនមានពិធីសម្រាប់ថ្ងៃនេះទេ។')}</p>}
      </div>}
    </div>}
    {!content.isTemplateDemo && settings.showAddToCalendar !== false && <CalendarExportActions content={content} english={english} mainAvailable={event.validDate && (event.allDay || event.instant !== null)} programAvailable={days.length > 0} />}
  </div>;
}
