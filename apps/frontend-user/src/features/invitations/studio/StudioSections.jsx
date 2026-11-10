import { CalendarDays, MapPin, Images, Palette, Heart, Ticket } from 'lucide-react';
import { STUDIO_TABS, studioTabForSection, resolveStudioSection } from './studioNavigation';

const ICONS = [CalendarDays, MapPin, Images, Palette, Heart, Ticket];

export default function StudioSections({ sections, active, onChange, english }) {
  const current = studioTabForSection(active);
  const choose = id => onChange(resolveStudioSection(id, sections));

  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (index + 1) % STUDIO_TABS.length;
      choose(STUDIO_TABS[next].id);
      const nextBtn = event.currentTarget.parentElement?.querySelectorAll('button')?.[next];
      nextBtn?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = (index - 1 + STUDIO_TABS.length) % STUDIO_TABS.length;
      choose(STUDIO_TABS[prev].id);
      const prevBtn = event.currentTarget.parentElement?.querySelectorAll('button')?.[prev];
      prevBtn?.focus();
    }
  };

  return <nav className="studio-sections" aria-label={english ? 'Invitation sections' : 'ផ្នែកសំបុត្រអញ្ចើញ'}>
    <label className="studio-section-select">{english ? 'Edit section' : 'កែសម្រួលផ្នែក'}
      <select value={current.id} onChange={event => choose(event.target.value)}>
        {STUDIO_TABS.map(tab => <option key={tab.id} value={tab.id}>{tab.labels[english ? 1 : 0]}</option>)}
      </select>
    </label>
    <div className="studio-section-list">
      {STUDIO_TABS.map((tab, index) => {
        const Icon = ICONS[index];
        const isCurrent = current.id === tab.id;
        return <button
          type="button"
          key={tab.id}
          data-studio-tab={tab.id}
          aria-current={isCurrent ? 'page' : undefined}
          className={`studio-section-tab-btn ${isCurrent ? 'is-active' : ''}`}
          onKeyDown={e => handleKeyDown(e, index)}
          onClick={() => choose(tab.id)}
        >
          <Icon size={19} className="studio-section-icon" aria-hidden="true" />
          <span className="studio-section-title">{tab.labels[english ? 1 : 0]}</span>
        </button>;
      })}
    </div>
  </nav>;
}
