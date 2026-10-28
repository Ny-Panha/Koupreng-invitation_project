import { feedback } from "@/shared/feedback/feedback";
import { useState } from 'react';
import { groupProgram, serializeProgramDays, PROGRAM_PERIODS } from '../../templates/shared/program';
import CeremonyIcon from '../../templates/shared/CeremonyIcon';
import { CEREMONY_ICONS } from '../../templates/shared/ceremonyIcons';

const newId = () => crypto.randomUUID();
const emptyRow = () => ({ id: newId(), time: '', title: '', titleEn: '', description: '', enabled: true });
const blankDay = () => ({ id: newId(), date: '', title: '', enabled: true, items: [] });

export default function WeddingProgramEditor({ value, programDays, masterDate, onChange, english, enabled = true, onEnabled }) {
  const [preset, setPreset] = useState('');
  const [error, setError] = useState('');
  const days = groupProgram(value, masterDate, programDays);
  const copy = (kh, en) => english ? en : kh;
  const commit = next => {
    if (next.length > 30 || next.reduce((sum, day) => sum + day.items.length, 0) > 200) { setError(copy('អតិបរមា ៣០ ថ្ងៃ និង ២០០ ពិធី។', 'Use at most 30 days and 200 ceremonies.')); return; }
    setError(''); const result = serializeProgramDays(next); onChange(result.schedule, result.programDays);
  };
  const editDay = (index, key, next) => commit(days.map((day, i) => i === index ? { ...day, [key]: next, ...(key === 'title' && day.titleKm !== undefined ? { titleKm: next } : {}) } : day));
  const editRow = (dayIndex, rowIndex, key, next) => commit(days.map((day, i) => i === dayIndex ? { ...day, items: day.items.map((row, j) => j === rowIndex ? { ...row, [key]: next, ...(['title','description'].includes(key) && row[key + 'Km'] !== undefined ? { [key + 'Km']: next } : {}) } : row) } : day));
  const move = (items, index, delta) => { const next = [...items]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; return next; };
  const confirm = async () => await feedback.confirm({ message: copy('លុបមាតិកានេះ?', 'Remove this content?'), destructive: true });
  const applyPreset = async () => {
    if (!preset || (days.some(day => day.items.length || day.title || day.date) && !await feedback.confirm({ message: copy('ជំនួសកម្មវិធីដែលមានស្រាប់ដោយគំរូ?', 'Replace the existing program with this preset?'), destructive: true }))) return;
    const day = blankDay();
    const ceremony = (time, title, titleEn) => ({ ...emptyRow(), time, title, titleEn });
    const traditional = () => [
      ceremony('07:00', 'ពិធីហែជំនូន', 'Gift procession'),
      ceremony('08:00', 'ពិធីបំពាក់ចិញ្ចៀន', 'Ring ceremony'),
      ceremony('09:00', 'ពិធីសូត្រមន្ត', 'Blessing ceremony'),
      ceremony('10:30', 'ពិធីសំពះផ្ទឹម', 'Sompeas Ptem'),
      ceremony('17:00', 'ពិធីទទួលភ្ញៀវ', 'Reception'),
    ];
    day.items = preset === 'blank' ? [] : preset === 'reception' ? [ceremony('17:00', 'ពិធីទទួលភ្ញៀវ', 'Reception')]
      : preset === 'one-day' ? [ceremony('07:00', 'ពិធីមង្គលការ', 'Wedding ceremony'), ceremony('17:00', 'ពិធីទទួលភ្ញៀវ', 'Reception')]
      : preset === 'two-day' ? [ceremony('15:00', 'ពិធីសូត្រមន្ត', 'Blessing ceremony'), ceremony('17:00', 'ជួបជុំគ្រួសារ', 'Family gathering')]
      : traditional();
    commit(preset === 'two-day' ? [day, { ...blankDay(), items: traditional() }] : [day]); setPreset('');
  };
  return <section className="pe-section-card studio-program" aria-label={copy('កម្មវិធីមង្គលការ', 'Wedding program')}>
    <h4 className="pe-section-heading">{copy('កម្មវិធីមង្គលការ', 'Wedding program')}</h4>
    {onEnabled && <label className="pe-label studio-inline-check"><input type="checkbox" checked={enabled} onChange={e => onEnabled(e.target.checked)} />{copy('បង្ហាញកម្មវិធី', 'Show program section')}</label>}
    <p>{copy('ថ្ងៃទទេតាមថ្ងៃកម្មវិធី។ ថ្ងៃបន្ទាប់តាមលំដាប់។ កាលបរិច្ឆេទផ្ទាល់ខ្លួននៅដដែល។', 'Blank dates follow the event date and day order. Custom dates stay independent.')}</p>
    <div className="studio-preset"><label className="pe-label">{copy('គំរូកម្មវិធី', 'Program preset')}<select className="pe-input" value={preset} onChange={e => setPreset(e.target.value)}>
      <option value="">{copy('ជ្រើសរើសគំរូជាជម្រើស', 'Choose an optional preset')}</option>
      <option value="traditional">{copy('មង្គលការខ្មែរប្រពៃណី', 'Traditional Khmer wedding')}</option><option value="two-day">{copy('មង្គលការពីរថ្ងៃ', 'Two-day Khmer wedding')}</option><option value="one-day">{copy('មង្គលការមួយថ្ងៃ', 'One-day wedding')}</option><option value="reception">{copy('ពិធីទទួលភ្ញៀវ', 'Wedding reception')}</option><option value="blank">{copy('កម្មវិធីទទេ', 'Custom blank schedule')}</option>
    </select></label><button type="button" className="pe-btn-upload-action" disabled={!preset} onClick={applyPreset}>{copy('ប្រើគំរូ', 'Apply preset')}</button></div>
    <p>{copy('គំរូជាចំណុចចាប់ផ្ដើមប៉ុណ្ណោះ។ សូមពិនិត្យឈ្មោះ និងលំដាប់ពិធីជាមួយគ្រួសារ។', 'Presets are starting points. Review ceremony names and order with your family.')}</p>
    {!days.length && <p>{copy('មិនទាន់មានកម្មវិធី។ បន្ថែមថ្ងៃដើម្បីចាប់ផ្ដើម។', 'No program yet. Add a day to begin.')}</p>}
    {days.map((day, dayIndex) => <fieldset key={day.id} className="studio-program-day">
      <legend>{copy('ថ្ងៃទី ', 'Day ')}{dayIndex + 1}</legend>
      <div className="pe-grid-2">
        <label className="pe-label">{copy('កាលបរិច្ឆេទ', 'Program date')}<input className="pe-input" type="date" value={day.date || ''} onChange={e => editDay(dayIndex, 'date', e.target.value)} /><small>{day.date ? copy('កាលបរិច្ឆេទផ្ទាល់ខ្លួន', 'Custom date') : copy('តាមថ្ងៃកម្មវិធី: ', 'Linked date: ') + (day.resolvedDate || '—')}</small></label>
        <label className="pe-label">{copy('ចំណងជើងថ្ងៃ', 'Day heading')}<input className="pe-input" maxLength={300} value={day.title || day.titleKm || ''} onChange={e => editDay(dayIndex, 'title', e.target.value)} /></label>
        <label className="pe-label">{copy('ចំណងជើងថ្ងៃជាអង់គ្លេស', 'Day heading in English')}<input className="pe-input" maxLength={300} data-translation-key={`programDays.${day.id}.titleEn`} value={day.titleEn || ''} onChange={e => editDay(dayIndex, 'titleEn', e.target.value)} /></label>
        <label className="pe-label studio-inline-check"><input type="checkbox" checked={day.enabled !== false} onChange={e => editDay(dayIndex, 'enabled', e.target.checked)} />{copy('បង្ហាញថ្ងៃនេះ', 'Show this day')}</label>
      </div>
      {day.items.map((row, rowIndex) => <fieldset className="studio-program-row" key={row.id}>
        <legend>{copy('ពិធី', 'Ceremony')} {rowIndex + 1}</legend>
        <div className="pe-grid-2">
          <label className="pe-label">{copy('រូបសញ្ញាពិធី', 'Ceremony icon')}<select className="pe-input" value={row.iconKey || 'calendar'} onChange={e => editRow(dayIndex, rowIndex, 'iconKey', e.target.value)}>{Object.entries(CEREMONY_ICONS).map(([key, labels]) => <option key={key} value={key}>{labels[english ? 1 : 0]}</option>)}</select><span className="studio-ceremony-preview"><CeremonyIcon iconKey={row.iconKey} />{CEREMONY_ICONS[row.iconKey || 'calendar']?.[english ? 1 : 0] || CEREMONY_ICONS.calendar[english ? 1 : 0]}</span></label>
          <label className="pe-label">{copy('ម៉ោងចាប់ផ្ដើម', 'Start time')}<input className="pe-input" maxLength={100} value={row.time} onChange={e => editRow(dayIndex, rowIndex, 'time', e.target.value)} placeholder="07:00" /><small>{copy('អាចរក្សាអត្ថបទម៉ោងខ្មែរដែលមានស្រាប់។', 'Existing Khmer time wording is supported.')}</small></label>
          <label className="pe-label">{copy('ម៉ោងបញ្ចប់', 'End time')}<input className="pe-input" maxLength={100} value={row.endTime || ''} onChange={e => editRow(dayIndex, rowIndex, 'endTime', e.target.value)} placeholder="08:00" /></label>
          <label className="pe-label">{copy('ពេល', 'Period')}<select className="pe-input" value={row.period || ''} onChange={e => editRow(dayIndex, rowIndex, 'period', e.target.value)}><option value="">{copy('តាមអត្ថបទម៉ោង', 'Use time wording')}</option>{Object.entries(PROGRAM_PERIODS).map(([key, labels]) => <option key={key} value={key}>{labels[english ? 1 : 0]}</option>)}</select></label>
          <label className="pe-label">{copy('ពិធី / ខ្មែរ', 'Ceremony / Khmer')}<input className="pe-input" maxLength={500} value={row.title} onChange={e => editRow(dayIndex, rowIndex, 'title', e.target.value)} /></label>
          <label className="pe-label">{copy('ពិធី / អង់គ្លេស', 'Ceremony in English')}<input className="pe-input" maxLength={500} data-translation-key={`schedule.${row.id}.titleEn`} value={row.titleEn || ''} onChange={e => editRow(dayIndex, rowIndex, 'titleEn', e.target.value)} /></label>
          <label className="pe-label">{copy('ទីតាំងពិធី', 'Ceremony location')}<input className="pe-input" maxLength={500} value={row.location || ''} onChange={e => editRow(dayIndex, rowIndex, 'location', e.target.value)} /></label>
          <label className="pe-label">{copy('ទីតាំងពិធីជាអង់គ្លេស', 'Ceremony location in English')}<input className="pe-input" maxLength={500} data-translation-key={`schedule.${row.id}.locationEn`} value={row.locationEn || ''} onChange={e => editRow(dayIndex, rowIndex, 'locationEn', e.target.value)} /></label>
        </div>
        <label className="pe-label">{copy('ពិពណ៌នា', 'Description')}<textarea className="pe-input" maxLength={5000} value={row.description} onChange={e => editRow(dayIndex, rowIndex, 'description', e.target.value)} /></label>
        <label className="pe-label">{copy('ពិពណ៌នាជាអង់គ្លេស', 'Description in English')}<textarea className="pe-input" maxLength={5000} data-translation-key={`schedule.${row.id}.descriptionEn`} value={row.descriptionEn || ''} onChange={e => editRow(dayIndex, rowIndex, 'descriptionEn', e.target.value)} /></label>
        <label className="pe-label studio-inline-check"><input type="checkbox" checked={row.enabled !== false} onChange={e => editRow(dayIndex, rowIndex, 'enabled', e.target.checked)} />{copy('បង្ហាញពិធីនេះ', 'Show this ceremony')}</label>
        <div className="studio-reorder">{[-1, 1].map(delta => <button key={delta} type="button" disabled={!day.items[rowIndex + delta]} aria-label={copy('ផ្លាស់ទីពិធី ', 'Move ceremony ') + (rowIndex + 1) + (delta < 0 ? copy(' ឡើង', ' up') : copy(' ចុះ', ' down'))} onClick={() => editDay(dayIndex, 'items', move(day.items, rowIndex, delta))}>{delta < 0 ? '↑' : '↓'}</button>)}<button type="button" onClick={async () => { if (await confirm()) editDay(dayIndex, 'items', day.items.filter((_, i) => i !== rowIndex)); }}>{copy('លុបពិធី', 'Remove ceremony')}</button></div>
      </fieldset>)}
      <button type="button" className="pe-btn-upload-action" onClick={() => editDay(dayIndex, 'items', [...day.items, emptyRow()])}>{copy('បន្ថែមពិធី', 'Add ceremony')}</button>
      <div className="studio-reorder">{[-1, 1].map(delta => <button key={delta} type="button" disabled={!days[dayIndex + delta]} aria-label={copy('ផ្លាស់ទីថ្ងៃទី ', 'Move day ') + (dayIndex + 1) + (delta < 0 ? copy(' ឡើង', ' up') : copy(' ចុះ', ' down'))} onClick={() => commit(move(days, dayIndex, delta))}>{delta < 0 ? '↑' : '↓'}</button>)}<button type="button" onClick={async () => { if (await confirm()) commit(days.filter((_, i) => i !== dayIndex)); }}>{copy('លុបថ្ងៃ', 'Remove program day')}</button></div>
    </fieldset>)}
    <button type="button" className="pe-btn-upload-action" onClick={() => commit([...days, blankDay()])}>{copy('បន្ថែមថ្ងៃកម្មវិធី', 'Add program day')}</button>
    {error && <p role="alert">{error}</p>}
  </section>;
}
