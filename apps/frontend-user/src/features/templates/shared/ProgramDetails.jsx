import { PROGRAM_PERIODS, programDate } from './program';
import { formatNumerals } from './eventDateTime';
import CeremonyIcon from './CeremonyIcon';

export default function ProgramDetails({ item, content = {} }) {
  const english = String(content.languageMode || '').toLowerCase() === 'en';
  const date = programDate(item, content.eventDate || content.machineEventDate || content.targetDate);
  const period = PROGRAM_PERIODS[item.period]?.[english ? 1 : 0] || item.period || '';
  return <span className="program-details" style={{ display: 'block', fontSize: '0.85em', lineHeight: 1.8, whiteSpace: 'normal' }}>
    {item.iconKey && <CeremonyIcon iconKey={item.iconKey} />}
    {item.day && <span>{english ? `Day ${item.day}` : `ថ្ងៃទី ${formatNumerals(item.day, 'khmer')}`} · </span>}
    {!item.day && item.dayTitle && <span>{item.dayTitle} · </span>}
    {date && <time dateTime={date}>{date}</time>}{period && <span> · {period}</span>}
    {item.endTime && <span> · {english ? 'Until' : 'ដល់'} {item.endTime}</span>}
  </span>;
}
