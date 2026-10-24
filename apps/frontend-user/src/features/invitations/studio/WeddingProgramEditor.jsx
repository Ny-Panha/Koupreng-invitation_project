import { normalizeProgram, programDate, PROGRAM_PERIODS } from '../../templates/shared/program';

export default function WeddingProgramEditor({ value, masterDate, onChange, english }) {
  const rows = normalizeProgram(value);
  const copy = (kh, en) => english ? en : kh;
  const change = (index, key, value) => onChange(rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
  const add = day => onChange([...rows, { id: crypto.randomUUID(), day, date: '', time: '', title: '', description: '' }]);
  return <section className="pe-section-card studio-program" aria-label={copy('កម្មវិធីមង្គលការ', 'Wedding program')}>
    <h4 className="pe-section-heading">{copy('កម្មវិធីមង្គលការ', 'Wedding program')}</h4>
    <p>{copy('កាលបរិច្ឆេទទទេតាមថ្ងៃកម្មវិធី។ ថ្ងៃទី ២ តាមថ្ងៃបន្ទាប់។ កាលបរិច្ឆេទផ្ទាល់ខ្លួនមិនប្ដូរតាមថ្ងៃកម្មវិធីទេ។', 'Blank dates follow the event date; Day 2 follows the next day. Custom dates stay independent when the event date changes.')}</p>
    {[1, ...(rows.some(r => Number(r.day) === 2) ? [2] : [])].map(day => <fieldset key={day} className="studio-program-day">
      <legend>{copy(`ថ្ងៃទី ${day === 1 ? '១' : '២'}`, `Day ${day}`)}</legend>
      {rows.map((row, index) => (Number(row.day) === 2 ? 2 : 1) === day && <div className="studio-program-row" key={row.id}>
        <div className="pe-grid-2">
          <label className="pe-label">{copy('កាលបរិច្ឆេទ', 'Date')}<input className="pe-input" aria-label={copy('កាលបរិច្ឆេទ', 'Date')} type="date" value={row.date || ''} onChange={e => change(index, 'date', e.target.value)} /><small>{row.date ? copy('កាលបរិច្ឆេទផ្ទាល់ខ្លួន', 'Custom date') : `${copy('តាមថ្ងៃកម្មវិធី', 'Linked date')}: ${programDate(row, masterDate) || '—'}`}</small></label>
          <label className="pe-label">{copy('ថ្ងៃ', 'Program day')}<select className="pe-input" aria-label={copy('ថ្ងៃ', 'Program day')} value={day} onChange={e => change(index, 'day', Number(e.target.value))}><option value="1">{copy('ថ្ងៃទី ១', 'Day 1')}</option><option value="2">{copy('ថ្ងៃទី ២', 'Day 2')}</option></select></label>
          <label className="pe-label">{copy('ម៉ោងចាប់ផ្ដើម', 'Start time')}<input className="pe-input" value={row.time} onChange={e => change(index, 'time', e.target.value)} placeholder="07:00" /></label>
          <label className="pe-label">{copy('ម៉ោងបញ្ចប់', 'End time')}<input className="pe-input" value={row.endTime || ''} onChange={e => change(index, 'endTime', e.target.value)} placeholder="08:00" /></label>
          <label className="pe-label">{copy('ពេល', 'Period')}<select className="pe-input" aria-label={copy('ពេល', 'Period')} value={row.period || ''} onChange={e => change(index, 'period', e.target.value)}><option value="">{copy('តាមអត្ថបទម៉ោង', 'Use time wording')}</option>{Object.entries(PROGRAM_PERIODS).map(([key, labels]) => <option key={key} value={key}>{labels[english ? 1 : 0]}</option>)}</select></label>
          <label className="pe-label">{copy('ពិធី', 'Ceremony')}<input className="pe-input" value={row.title} onChange={e => change(index, 'title', e.target.value)} /></label>
        </div>
        <label className="pe-label">{copy('ពិពណ៌នា', 'Description')}<textarea className="pe-input" value={row.description} onChange={e => change(index, 'description', e.target.value)} /></label>
        <div className="studio-reorder">{[-1, 1].map(delta => <button key={delta} type="button" disabled={!rows[index + delta]} aria-label={`Move schedule ${index + 1} ${delta < 0 ? 'up' : 'down'}`} onClick={() => { const next = [...rows]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; onChange(next); }}>{delta < 0 ? '↑' : '↓'}</button>)}<button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))}>{copy('លុបពិធី', 'Remove ceremony')}</button></div>
      </div>)}
      <button type="button" className="pe-btn-upload-action" onClick={() => add(day)}>{copy('បន្ថែមពិធី', 'Add ceremony')}</button>
    </fieldset>)}
    {!rows.some(r => Number(r.day) === 2) && <button type="button" className="pe-btn-upload-action" onClick={() => add(2)}>{copy('បន្ថែមថ្ងៃទី ២', 'Add Day 2')}</button>}
  </section>;
}
