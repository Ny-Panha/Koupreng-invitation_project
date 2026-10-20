export const STUDIO_SECTIONS = {
  cover: ["ក្រប និងរចនា", "Cover & design"], family: ["មាតាបិតា", "Families"],
  invitation: ["សារអញ្ជើញ", "Invitation message"], couplePhoto: ["រូបគូស្វាមីភរិយា", "Couple photos"],
  countdown: ["រាប់ថយក្រោយ", "Countdown"], schedule: ["កាលវិភាគ", "Schedule"],
  venue: ["ទីតាំង", "Venue & map"], gallery: ["វិចិត្រសាល", "Gallery"],
  story: ["រឿងរ៉ាវ", "Our story"], dressCode: ["សម្លៀកបំពាក់", "Dress code"],
  party: ["ក្រុមអម", "Wedding party"], faq: ["សំណួរ និងចម្លើយ", "Guest notes"],
  khqr: ["ចំណងដៃ KHQR", "Gift KHQR"], closing: ["សារបញ្ចប់", "Closing messages"],
  languageMode: ["ភាសា", "Language"],
};

export default function StudioSections({ sections, active, onChange, english }) {
  const label = key => STUDIO_SECTIONS[key]?.[english ? 1 : 0] || key;
  return <nav className="studio-sections" aria-label={english ? "Invitation sections" : "ផ្នែកធៀបការ"}>
    <label className="studio-section-select">{english ? "Edit section" : "កែសម្រួលផ្នែក"}
      <select value={active} onChange={event => onChange(event.target.value)}>
        {sections.map(key => <option key={key} value={key}>{label(key)}</option>)}
      </select>
    </label>
    <div className="studio-section-list">
      <p>{english ? "YOUR INVITATION" : "ធៀបការរបស់អ្នក"}</p>
      {sections.map((key, index) => <button type="button" key={key} aria-current={active === key ? "step" : undefined}
        onClick={() => onChange(key)}><span>{String(index + 1).padStart(2, "0")}</span>{label(key)}</button>)}
    </div>
  </nav>;
}
