import { groupProgram, PROGRAM_PERIODS } from './program';
import { formatEventDate, formatNumerals } from './eventDateTime';
import './event-sections.css';

export default function ProgramTimeline({ content = {}, english = String(content.languageMode).toLowerCase() === 'en' }) {
  const numerals = content.saveTheDate?.numerals || (english ? 'latin' : 'khmer');
  const bilingual = ['both', 'bilingual'].includes(String(content.languageMode).toLowerCase());
  const days = groupProgram(content.schedule, content.eventDate || content.machineEventDate || content.targetDate, content.programDays)
    .filter(day => day.enabled !== false && day.items.some(item => item.enabled !== false));
  if (!days.length) return null;
  return <div className="kp-program" lang={english ? 'en' : 'km'}>{days.map((day, index) => <div className="kp-program-day" key={day.id}>
    <h3 className="kp-program-day-title">{(english ? day.titleEn : day.titleKm) || day.title || (english ? `Day ${index + 1}` : `ថ្ងៃទី ${formatNumerals(index + 1, numerals)}`)}
      {day.resolvedDate && <time dateTime={day.resolvedDate}>{formatEventDate(day.resolvedDate, english, numerals, { weekday: 'long' })}</time>}
      {bilingual && day.titleEn && <span lang="en">{day.titleEn}</span>}
    </h3>
    <ol className="kp-timeline">{day.items.filter(item => item.enabled !== false).map(item => <li key={item.id}>
      <span className="kp-timeline-time">{formatNumerals(item.time || '', numerals)}{item.endTime && <><span aria-hidden="true">–</span>{formatNumerals(item.endTime, numerals)}</>}{item.period && <small>{PROGRAM_PERIODS[item.period]?.[english ? 1 : 0] || item.period}</small>}</span>
      <span className="kp-timeline-marker" aria-hidden="true" />
      <div className="kp-timeline-copy"><h4>{(english ? item.titleEn : item.titleKm) || item.title || item.titleEn}</h4>
        {bilingual && item.titleEn && <p lang="en">{item.titleEn}</p>}
        {((english ? item.descriptionEn : item.descriptionKm) || item.description) && <p>{(english ? item.descriptionEn : item.descriptionKm) || item.description}</p>}
        {item.location && <p>{item.location}</p>}
        {bilingual && item.descriptionEn && <p lang="en">{item.descriptionEn}</p>}
      </div>
    </li>)}</ol>
  </div>)}</div>;
}
