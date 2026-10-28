export default function StudioSplitControls({ split, english, focusEditor, onFocusEditor }) {
  return <div className="studio-split-controls">
    {onFocusEditor && <button type="button" className="studio-editing-focus" aria-pressed={focusEditor} onClick={onFocusEditor}>{focusEditor ? (english ? 'Show editor & preview' : 'បង្ហាញការកែសម្រួល និងមើលជាមុន') : (english ? 'Focus on Editing' : 'ផ្ដោតលើការកែសម្រួល')}</button>}
    <label>{english ? 'Workspace layout' : 'ប្លង់កន្លែងកែសម្រួល'}<select value="" onChange={event => { split.apply(Number(event.target.value)); }}>
      <option value="" disabled>{english ? `Editor ${split.value}%` : `កន្លែងកែសម្រួល ${split.value}%`}</option>
      <option value="70">{english ? 'Focus Editor' : 'ផ្ដោតលើការកែសម្រួល'}</option>
      <option value="50">{english ? 'Balanced' : 'ស្មើគ្នា'}</option>
      <option value="40">{english ? 'Focus Preview' : 'ផ្ដោតលើការមើលជាមុន'}</option>
      <option value="60">{english ? 'Reset Layout' : 'ស្ដារប្លង់ដើម'}</option>
    </select></label>
  </div>;
}
