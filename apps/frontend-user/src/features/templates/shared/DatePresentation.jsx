import { formatEventDate, formatEventTime, formatNumerals, resolveEvent } from './eventDateTime';
import { invitationStyles } from './invitationStyles';
import './invitation-styles.css';

export default function DatePresentation({ content, english, calendar }) {
  const event = resolveEvent(content), style = invitationStyles(content).date;
  if (!event.validDate) return null;
  const numerals = content.saveTheDate?.numerals || (english ? 'latin' : 'khmer');
  const short = ['tear-off', 'typographic', 'horizontal', 'floral'].includes(style);
  return <div className={`kp-date-presentation kp-date--${style}`} data-date-style={style}>
    {short ? <div className="kp-date-card">
      <span className="kp-date-month">{formatEventDate(event.date, english, numerals, { day: undefined, year: undefined })}</span>
      <strong>{formatNumerals(Number(event.date.slice(-2)), numerals)}</strong>
      <time dateTime={event.date}>{formatEventDate(event.date, english, numerals, { weekday: 'long' })}</time>
      {content.saveTheDate?.showTime !== false && event.time && <span>{formatEventTime(event.time, english, numerals)}</span>}
      {content.eventEndDate && content.eventEndDate !== event.date && <time dateTime={content.eventEndDate}>{formatEventDate(content.eventEndDate, english, numerals)}</time>}
    </div> : calendar}
  </div>;
}
