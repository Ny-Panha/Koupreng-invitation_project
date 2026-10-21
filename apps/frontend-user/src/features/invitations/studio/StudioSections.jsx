import { Palette, Users, Mail, Images, Timer, CalendarDays, MapPin, BookOpen, Shirt, CircleHelp, QrCode, Heart, Languages } from "lucide-react";

const GROUPS = [
  { labels: ["រចនា", "Design"], keys: ["cover", "couplePhoto", "gallery"], icons: [Palette, Images, Images] },
  { labels: ["មាតិកា", "Content"], keys: ["family", "invitation", "schedule", "venue", "story", "closing"], icons: [Users, Mail, CalendarDays, MapPin, BookOpen, Heart] },
  { labels: ["បទពិសោធន៍ភ្ញៀវ", "Guest experience"], keys: ["countdown", "dressCode", "party", "faq", "khqr", "languageMode"], icons: [Timer, Shirt, Users, CircleHelp, QrCode, Languages] },
];
const STUDIO_SECTIONS = {
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
      {GROUPS.map(group => {
        const visible = group.keys.filter(key => sections.includes(key));
        return visible.length > 0 && <div className="studio-section-group" key={group.labels[1]}><p>{group.labels[english ? 1 : 0]}</p>
          {visible.map(key => { const Icon = group.icons[group.keys.indexOf(key)]; return <button type="button" key={key} aria-current={active === key ? "step" : undefined}
            onClick={() => onChange(key)}><Icon size={18} aria-hidden="true" />{label(key)}</button>; })}
        </div>;
      })}
    </div>
  </nav>;
}
