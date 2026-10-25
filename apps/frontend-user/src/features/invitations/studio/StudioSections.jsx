import { CalendarDays, MapPin, Images, Palette, Heart, Ticket } from 'lucide-react';
import { STUDIO_TABS, studioTabForSection, resolveStudioSection } from './studioNavigation';

const ICONS = [CalendarDays, MapPin, Images, Palette, Heart, Ticket];

export default function StudioSections({ sections, active, onChange, english }) {
  const current = studioTabForSection(active);
  const choose = id => onChange(resolveStudioSection(id, sections));
  return <nav className="studio-sections" aria-label={english ? 'Invitation sections' : 'ផ្នែកធៀបការ'}>
    <label className="studio-section-select">{english ? 'Edit section' : 'កែសម្រួលផ្នែក'}
      <select value={current.id} onChange={event => choose(event.target.value)}>
        {STUDIO_TABS.map(tab => <option key={tab.id} value={tab.id}>{tab.labels[english ? 1 : 0]}</option>)}
      </select>
    </label>
    <div className="studio-section-list">
      {STUDIO_TABS.map((tab, index) => {
        const Icon = ICONS[index];
        return <button type="button" key={tab.id} data-studio-tab={tab.id} aria-current={current.id === tab.id ? 'page' : undefined}
          onClick={() => choose(tab.id)}><Icon size={19} aria-hidden="true" />{tab.labels[english ? 1 : 0]}</button>;
      })}
    </div>
  </nav>;
}
