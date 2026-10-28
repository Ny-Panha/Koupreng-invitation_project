import { useId, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import useCountdown from '../../wedding-site/hooks/useCountdown';
import { calendarMonth, formatEventDate, formatNumerals, resolveEvent, shiftMonth } from './eventDateTime';
import { buildEventCalendar } from './eventCalendarExport';
import './event-sections.css';

export function WeddingCountdown({ instant, english, numerals, style = 'theme' }) {
  const count = useCountdown(instant);
  if (!count.valid) return null;
  if (count.expired) return <p className="kp-event-started" role="status">{english ? 'The celebration has begun.' : 'កម្មវិធីបានចាប់ផ្ដើមហើយ។'}</p>;
  const labels = english ? ['Days', 'Hours', 'Minutes', 'Seconds'] : ['ថ្ងៃ', 'ម៉ោង', 'នាទី', 'វិនាទី'];
  return <div className={`kp-countdown kp-countdown--${style}`} role="timer" aria-live="off" aria-label={english ? 'Time until the celebration' : 'ពេលវេលារហូតដល់កម្មវិធី'}>
    {[count.d, count.h, count.m, count.s].map((value, index) => <div className="kp-countdown-unit" key={labels[index]}><strong style={{ '--kp-countdown-digits': value.length }}>{formatNumerals(value, numerals)}</strong><span>{labels[index]}</span></div>)}
  </div>;
}

export function EventCalendar({ date, english, numerals, navigation = false }) {
  const [browsing, setBrowsing] = useState(null);
  const month = browsing?.event === date ? browsing.date : date;
  const id = useId();
  const days = calendarMonth(month);
  if (!days.length) return null;
  const weekdays = english ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['អា', 'ច', 'អ', 'ពុ', 'ព្រ', 'សុ', 'ស'];
  const fullWeekdays = english ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  return <div className="kp-calendar">
    <div className="kp-calendar-nav">
      {navigation && <button type="button" aria-label={english ? 'Previous month' : 'ខែមុន'} onClick={() => setBrowsing({ event: date, date: shiftMonth(month, -1) })}><ChevronLeft size={18} aria-hidden="true" /></button>}
      <h3 id={id} aria-live="polite">{formatEventDate(month, english, numerals, { day: undefined })}</h3>
      {navigation && <button type="button" aria-label={english ? 'Next month' : 'ខែបន្ទាប់'} onClick={() => setBrowsing({ event: date, date: shiftMonth(month, 1) })}><ChevronRight size={18} aria-hidden="true" /></button>}
    </div>
    <table aria-labelledby={id}><thead><tr>{weekdays.map((day, index) => <th key={index} scope="col"><abbr title={fullWeekdays[index]}>{day}</abbr></th>)}</tr></thead>
      <tbody>{Array.from({ length: days.length / 7 }, (_, week) => <tr key={week}>{days.slice(week * 7, week * 7 + 7).map((day, index) => <td key={index}>{day && <time dateTime={day} className={day === date ? 'kp-calendar-event' : undefined} aria-label={`${formatEventDate(day, english, numerals)}${day === date ? (english ? ', event date' : ' ថ្ងៃកម្មវិធី') : ''}`}>{formatNumerals(Number(day.slice(-2)), numerals)}</time>}</td>)}</tr>)}</tbody>
    </table>
    {navigation && month.slice(0, 7) !== date.slice(0, 7) && <button type="button" onClick={() => setBrowsing(null)}>{english ? 'Return to event month' : 'ត្រឡប់ទៅខែកម្មវិធី'}</button>}
  </div>;
}

export function AddToCalendar({ content, english }) {
  const [error, setError] = useState('');
  const download = () => {
    try {
      const text = buildEventCalendar(content);
      const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'celebration.ics';
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError('');
    } catch { setError(english ? 'Calendar unavailable. Please check the event date and time.' : 'មិនអាចទាញយកប្រតិទិនបានទេ។ សូមពិនិត្យថ្ងៃ និងម៉ោងកម្មវិធី។'); }
  };
  return <><button type="button" className="kp-add-calendar" onClick={download}><CalendarDays size={20} aria-hidden="true" />{english ? 'Add to calendar' : 'បន្ថែមទៅប្រតិទិន'}</button>{error && <p role="alert">{error}</p>}</>;
}

// Lives in the existing countdown slot, with each template retaining its wrapper.
export default function SaveTheDate({ content = {}, english = String(content.languageMode).toLowerCase() === 'en', heading = true }) {
  const settings = content.saveTheDate || {};
  const event = resolveEvent(content);
  const numerals = settings.numerals || (english ? 'latin' : 'khmer');
  const id = useId();
  if (settings.enabled === false) return null;
  return <div className="kp-save-date" lang={english ? 'en' : 'km'} aria-labelledby={heading ? id : undefined}>
    {heading && <h2 id={id}>{settings.heading || (english ? 'Save the date' : 'កំណត់ថ្ងៃមង្គល')}</h2>}
    {settings.subtitle && <p className="kp-save-date-subtitle">{settings.subtitle}</p>}
    {event.validDate ? <>
      <p className="kp-save-date-date"><time dateTime={event.date}>{formatEventDate(event.date, english, numerals, { weekday: 'long' })}</time></p>
      {settings.showTime !== false && event.time && <p>{formatNumerals(event.time, numerals)} · {event.timezone}</p>}
      {settings.showVenue && <p>{content.venueName || content.venue?.name}</p>}
      {(settings.showCountdown ?? content.showCountdown ?? true) && event.instant !== null && <WeddingCountdown instant={event.instant} english={english} numerals={numerals} style={settings.countdownStyle || 'theme'} />}
      {event.time && event.instant === null && <p>{english ? 'Event time will be confirmed.' : 'ម៉ោងកម្មវិធីនឹងត្រូវបានបញ្ជាក់។'}</p>}
      {settings.showCalendar && <EventCalendar date={event.date} english={english} numerals={numerals} navigation={settings.calendarNavigation} />}
      {settings.showAddToCalendar && (event.allDay || event.instant !== null) && <AddToCalendar content={content} english={english} />}
    </> : <p>{english ? 'The date will be announced soon.' : 'កាលបរិច្ឆេទនឹងត្រូវប្រកាសឆាប់ៗនេះ។'}</p>}
  </div>;
}
