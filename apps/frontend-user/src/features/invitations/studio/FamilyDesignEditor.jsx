import FeatureAccessCard from "@/shared/access/FeatureAccessCard";
import { COUPLE_LAYOUTS } from '../../templates/shared/invitationFeatures';
import { CoupleMonogram } from '../../templates/shared/FamilyNames';
import { useRef, useState } from 'react';
import { exportVector } from '../../templates/shared/vectorExport';
const pair = () => ({ km: '', en: '' });
export function FamilyDesignEditor({ form, locale, onChange, supported }) {
  const groups = form.familyGroupsV1 || [];
  const patchGroup = (side, values) => {
    const group = groups.find(item => item.side === side) || { side, label: pair(), members: [] };
    onChange('familyGroupsV1', [...groups.filter(item => item.side !== side), { ...group, ...values }]);
  };
  if (!supported) return <p>Family placement is unavailable in this template. Your saved layout and family data are retained.</p>;
  return <section className="studio-design-panel"><h4>Family and name arrangement</h4>
    <label>Name placement<select value={form.coupleLayout || 'template-default'} onChange={e => onChange('coupleLayout', e.target.value)}>{COUPLE_LAYOUTS.map(key => <option key={key} value={key}>{({ 'template-default': 'Template default', 'groom-left': 'Groom left / bride right', 'bride-left': 'Bride left / groom right', stacked: 'Vertically stacked', centered: 'Centered couple' })[key]}</option>)}</select></label>
    {['groom', 'bride'].map(side => {
      const group = groups.find(item => item.side === side);
      return <fieldset key={side}><legend>{side === 'groom' ? 'First partner / groom family' : 'Second partner / bride family'}</legend>
        <label>Partner honorific ({locale})<input maxLength={100} value={form.localizedContentV1?.[locale]?.[`${side}Honorific`] ?? (locale === 'km' ? form[`${side}Honorific`] || '' : '')} onChange={e => onChange(`${side}Honorific`, e.target.value)} /></label>
        <label>Family label ({locale})<input data-translation-key={`family.${side}.label`} maxLength={300} value={group?.label?.[locale] || ''} onChange={e => patchGroup(side, { label: { ...group?.label || pair(), [locale]: e.target.value } })} /></label>
        {group?.members.map(member => <fieldset key={member.id}><legend>Host</legend>{['name', 'honorific', 'relationship'].map(key => <label key={key}>{key} ({locale})<input maxLength={300} data-translation-key={`family.${member.id}.${key}`} value={member[key]?.[locale] || ''} onChange={e => patchGroup(side, { members: group.members.map(item => item.id === member.id ? { ...member, [key]: { ...member[key], [locale]: e.target.value } } : item) })} /></label>)}<button type="button" onClick={() => patchGroup(side, { members: group.members.filter(item => item.id !== member.id) })}>Remove host</button></fieldset>)}
        <button type="button" disabled={(group?.members.length || 0) >= 8} onClick={() => patchGroup(side, { members: [...group?.members || [], { id: crypto.randomUUID(), name: pair(), honorific: pair(), relationship: pair() }] })}>Add host</button>
        {group && <button type="button" onClick={() => onChange('familyGroupsV1', groups.filter(item => item.side !== side))}>Use existing parent fields</button>}
      </fieldset>;
    })}
  </section>;
}
export function MonogramEditor({ value, onChange, entitled, supported }) {
  const preview = useRef(null), [exportStatus, setExportStatus] = useState('');
  const config = value || { version: 1, enabled: false, text: '', color: '#8c6932', motif: 'diamond', layout: 'round', size: 100, position: 'above', font: 'MOUL' };
  if (!supported) return <p>This template keeps the monogram design saved for a compatible template.</p>;
  if (!entitled) return <FeatureAccessCard feature="COUPLE_MONOGRAM" permission="MANAGE_INVITATION" lockedContent={value?.enabled && <button type="button" onClick={() => onChange({ ...value, enabled: false })}>Disable monogram</button>} />;
  const patch = values => onChange({ ...config, ...values });
  const exportImage = async format => {
    setExportStatus('Preparing monogram…');
    try { await exportVector(preview.current.querySelector('svg'), { format, name: 'decorative-couple-monogram', color: config.color }); setExportStatus(`${format.toUpperCase()} monogram exported.`); }
    catch (error) { setExportStatus(error.message); }
  };
  return <section className="studio-design-panel"><h4>Couple monogram · Premium</h4><p>Decorative artwork stays separate from your names and guest identity. Enter your own initials or text.</p>
    <div className="studio-design-tools" aria-label="Monogram starting styles">{[
      ['Round initials', 'round', 'none'], ['Oval petals', 'oval', 'petals'], ['Minimal signature', 'plain', 'none'], ['Diamond frame', 'round', 'diamond'],
    ].map(([label, layout, motif]) => <button type="button" key={label} onClick={() => patch({ layout, motif })}>{label}</button>)}</div>
    <label>Enable monogram<input type="checkbox" checked={config.enabled} onChange={e => patch({ enabled: e.target.checked })} /></label>
    <label>Monogram text<input maxLength={60} value={config.text} onChange={e => patch({ text: e.target.value })} /></label>
    <label>Monogram color<input type="color" value={config.color} onChange={e => patch({ color: e.target.value })} /></label>
    <label>Monogram font<select value={config.font || 'MOUL'} onChange={e => patch({ font: e.target.value })}>{[['MOUL', 'Moul · Khmer ceremonial'], ['KANTUMRUY', 'Kantumruy Pro · Khmer and English'], ['SERIF', 'Cormorant Garamond · English serif']].map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <label>Monogram position<select value={config.position || 'above'} onChange={e => patch({ position: e.target.value })}><option value="above">Above the names</option><option value="below">Below the names</option></select></label>
    <label>Monogram frame<select value={config.layout} onChange={e => patch({ layout: e.target.value })}>{['round', 'oval', 'plain'].map(key => <option key={key}>{key}</option>)}</select></label>
    <label>Monogram motif<select value={config.motif} onChange={e => patch({ motif: e.target.value })}>{['none', 'diamond', 'petals'].map(key => <option key={key}>{key}</option>)}</select></label>
    <label>Monogram size<input type="range" min="60" max="180" step="5" value={config.size} onChange={e => patch({ size: Number(e.target.value) })} /></label>
    <div ref={preview}><CoupleMonogram value={{ ...config, enabled: true }} /></div>
    <div className="studio-design-tools"><button type="button" disabled={!config.text.trim()} onClick={() => exportImage('svg')}>Export monogram SVG</button><button type="button" disabled={!config.text.trim()} onClick={() => exportImage('png')}>Export monogram PNG</button><button type="button" onClick={() => patch({ enabled: false, text: '', size: 100 })}>Reset monogram</button></div>
    {exportStatus && <p role="status">{exportStatus}</p>}
  </section>;
}
