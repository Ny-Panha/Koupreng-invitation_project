import FeatureAccessCard from "@/shared/access/FeatureAccessCard";
import { generateSecureUuid } from '@/shared/utils/uuid';
import { COUPLE_LAYOUTS } from '../../templates/shared/invitationFeatures';
import { CoupleMonogram } from '../../templates/shared/FamilyNames';
import { useRef, useState } from 'react';
import { exportVector } from '../../templates/shared/vectorExport';
import { getFamilySectionConfig } from '@/shared/utils/eventPlaceholders';

const pair = () => ({ km: '', en: '' });

const LAYOUT_OPTIONS = {
  'template-default': ['Template default', 'តាមលំនាំដើមនៃគំរូ'],
  'groom-left': ['Groom left / bride right', 'កូនកំលោះខាងឆ្វេង / កូនក្រមុំខាងស្តាំ'],
  'bride-left': ['Bride left / groom right', 'កូនក្រមុំខាងឆ្វេង / កូនកំលោះខាងស្តាំ'],
  stacked: ['Vertically stacked', 'តម្រៀបលើក្រោម (បញ្ឈរ)'],
  centered: ['Centered couple', 'ចំកណ្តាលទំព័រ'],
};

export function FamilyDesignEditor({ form, locale = 'km', onChange, supported, english, eventType }) {
  const isEn = typeof english === 'boolean' ? english : (locale === 'en');
  const activeEventType = eventType || form.eventType || 'WEDDING';
  const familyConfig = getFamilySectionConfig(activeEventType, isEn ? 'en' : 'km');
  const groups = form.familyGroupsV1 || [];
  const patchGroup = (side, values) => {
    const group = groups.find(item => item.side === side) || { side, label: pair(), members: [] };
    onChange('familyGroupsV1', [...groups.filter(item => item.side !== side), { ...group, ...values }]);
  };

  if (!supported) {
    return <p>{isEn ? 'Family placement is unavailable in this template. Your saved layout and family data are retained.' : 'ការរៀបចំក្រុមគ្រួសារមិនមានក្នុងគំរូនេះទេ។ ទិន្នន័យរចនាសម្ព័ន្ធ និងគ្រួសារដែលបានរក្សាទុករបស់អ្នកនៅតែមាន។'}</p>;
  }

  const langLabel = isEn ? (locale === 'en' ? 'English' : 'Khmer') : (locale === 'en' ? 'អង់គ្លេស' : 'ខ្មែរ');

  return (
    <section className="studio-design-panel">
      <h4>{isEn ? 'Family and name arrangement' : 'ការរៀបចំក្រុមគ្រួសារ និងឈ្មោះ'}</h4>
      <label>
        {isEn ? 'Name placement' : 'ការរៀបចំទីតាំងឈ្មោះ'}
        <select value={form.coupleLayout || 'template-default'} onChange={e => onChange('coupleLayout', e.target.value)}>
          {COUPLE_LAYOUTS.map(key => (
            <option key={key} value={key}>{familyConfig.layouts?.[key] || LAYOUT_OPTIONS[key]?.[isEn ? 0 : 1] || key}</option>
          ))}
        </select>
      </label>

      {['groom', 'bride'].map(side => {
        const group = groups.find(item => item.side === side);
        const sideLegend = side === 'groom' ? familyConfig.sideGroomLegend : familyConfig.sideBrideLegend;
        const partnerHonorificLabel = isEn ? `Partner honorific (${locale})` : `ងារកិត្តិយសដៃគូ (${langLabel})`;
        const familyLabelText = isEn ? `Family label (${locale})` : `ស្លាកឈ្មោះក្រុមគ្រួសារ (${langLabel})`;
        const familyLabelPlaceholder = side === 'groom' ? familyConfig.sideGroomLabelPlaceholder : familyConfig.sideBrideLabelPlaceholder;
        const partnerHonorificPlaceholder = side === 'groom' ? familyConfig.sideGroomHonorificPlaceholder : familyConfig.sideBrideHonorificPlaceholder;

        return (
          <fieldset key={side}>
            <legend>{sideLegend}</legend>
            <label>
              {partnerHonorificLabel}
              <input
                maxLength={100}
                value={form.localizedContentV1?.[locale]?.[`${side}Honorific`] ?? (locale === 'km' ? form[`${side}Honorific`] || '' : '')}
                placeholder={partnerHonorificPlaceholder}
                onChange={e => onChange(`${side}Honorific`, e.target.value)}
              />
            </label>
            <label>
              {familyLabelText}
              <input
                data-translation-key={`family.${side}.label`}
                maxLength={300}
                value={group?.label?.[locale] || ''}
                placeholder={familyLabelPlaceholder}
                onChange={e => patchGroup(side, { label: { ...(group?.label || pair()), [locale]: e.target.value } })}
              />
            </label>

            {group?.members.map(member => (
              <fieldset key={member.id}>
                <legend>{familyConfig.hostLegend || (isEn ? 'Host' : 'អ្នករៀបចំ / អាណាព្យាបាល')}</legend>
                {['name', 'honorific', 'relationship'].map(key => {
                  const fieldLabel = isEn
                    ? `${key} (${locale})`
                    : `${key === 'name' ? 'ឈ្មោះ' : key === 'honorific' ? 'ងារកិត្តិយស' : 'ទំនាក់ទំនង'} (${langLabel})`;
                  const fieldPlaceholder = key === 'name'
                    ? familyConfig.hostNamePlaceholder
                    : key === 'honorific'
                      ? familyConfig.hostHonorificPlaceholder
                      : familyConfig.hostRelationshipPlaceholder;

                  return (
                    <label key={key}>
                      {fieldLabel}
                      <input
                        maxLength={300}
                        data-translation-key={`family.${member.id}.${key}`}
                        value={member[key]?.[locale] || ''}
                        placeholder={fieldPlaceholder}
                        onChange={e => patchGroup(side, {
                          members: group.members.map(item => item.id === member.id ? { ...member, [key]: { ...member[key], [locale]: e.target.value } } : item)
                        })}
                      />
                    </label>
                  );
                })}
                <button type="button" onClick={() => patchGroup(side, { members: group.members.filter(item => item.id !== member.id) })}>
                  {isEn ? 'Remove host' : 'លុបអ្នករៀបចំនេះ'}
                </button>
              </fieldset>
            ))}

            <button
              type="button"
              disabled={(group?.members.length || 0) >= 8}
              onClick={() => patchGroup(side, { members: [...(group?.members || []), { id: generateSecureUuid(), name: pair(), honorific: pair(), relationship: pair() }] })}
            >
              {isEn ? 'Add host' : '+ បន្ថែមអ្នករៀបចំ'}
            </button>
            {group && (
              <button type="button" onClick={() => onChange('familyGroupsV1', groups.filter(item => item.side !== side))}>
                {isEn ? 'Use existing parent fields' : 'ប្រើទម្រង់មាតាបិតាធម្មតាឡើងវិញ'}
              </button>
            )}
          </fieldset>
        );
      })}
    </section>
  );
}

const MONOGRAM_STYLES = [
  { en: 'Round initials', km: 'អក្សរកាត់រង្វង់មូល', layout: 'round', motif: 'none' },
  { en: 'Oval petals', km: 'ផ្កាពងក្រពើ', layout: 'oval', motif: 'petals' },
  { en: 'Minimal signature', km: 'ហត្ថលេខាសាមញ្ញ', layout: 'plain', motif: 'none' },
  { en: 'Diamond frame', km: 'ស៊ុមពេជ្រ', layout: 'round', motif: 'diamond' },
];

const MONOGRAM_FONTS = [
  { key: 'MOUL', en: 'Moul · Khmer ceremonial', km: 'មូល · ពិធីការខ្មែរ' },
  { key: 'KANTUMRUY', en: 'Kantumruy Pro · Khmer and English', km: 'កន្ទុំរុយ ប្រូ · ខ្មែរ និងអង់គ្លេស' },
  { key: 'SERIF', en: 'Cormorant Garamond · English serif', km: 'Cormorant Garamond · អក្សរអង់គ្លេសស៊េរីហ្វ' },
];

const MONOGRAM_FRAMES = [
  { key: 'round', en: 'Round', km: 'រង្វង់មូល (Round)' },
  { key: 'oval', en: 'Oval', km: 'ពងក្រពើ (Oval)' },
  { key: 'plain', en: 'Plain', km: 'សាមញ្ញគ្មានស៊ុម (Plain)' },
];

const MONOGRAM_MOTIFS = [
  { key: 'none', en: 'None', km: 'គ្មានក្បាច់ (None)' },
  { key: 'diamond', en: 'Diamond', km: 'ពេជ្រ (Diamond)' },
  { key: 'petals', en: 'Petals', km: 'ផ្កា (Petals)' },
];

export function MonogramEditor({ value, onChange, entitled, supported, english = true }) {
  const isEn = typeof english === 'boolean' ? english : true;
  const preview = useRef(null);
  const [exportStatus, setExportStatus] = useState('');
  const config = value || { version: 1, enabled: false, text: '', color: '#8c6932', motif: 'diamond', layout: 'round', size: 100, position: 'above', font: 'MOUL' };

  if (!supported) {
    return <p>{isEn ? 'This template keeps the monogram design saved for a compatible template.' : 'គំរូនេះរក្សាទុកការរចនាតែមអក្សរកាត់សម្រាប់គំរូដែលគាំទ្រ។'}</p>;
  }

  if (!entitled) {
    return (
      <FeatureAccessCard
        feature="COUPLE_MONOGRAM"
        permission="MANAGE_INVITATION"
        lockedContent={value?.enabled && (
          <button type="button" onClick={() => onChange({ ...value, enabled: false })}>
            {isEn ? 'Disable monogram' : 'បិទដំណើរការតែម'}
          </button>
        )}
      />
    );
  }

  const patch = values => onChange({ ...config, ...values });

  const exportImage = async format => {
    setExportStatus(isEn ? 'Preparing monogram…' : 'កំពុងរៀបចំតែម…');
    try {
      await exportVector(preview.current.querySelector('svg'), { format, name: 'decorative-couple-monogram', color: config.color });
      setExportStatus(isEn ? `${format.toUpperCase()} monogram exported.` : `បានទាញយកតែម ${format.toUpperCase()} ដោយជោគជ័យ។`);
    } catch (error) {
      console.error('Monogram export error:', error);
      setExportStatus(isEn ? 'Could not export monogram. Please try again.' : 'មិនអាចទាញយកតែមបានទេ សូមព្យាយាមម្ដងទៀត។');
    }
  };

  return (
    <section className="studio-design-panel">
      <h4>{isEn ? 'Couple monogram · Premium' : 'តែមអក្សរកាត់គូស្នេហ៍ · Premium'}</h4>
      <p>
        {isEn
          ? 'Decorative artwork stays separate from your names and guest identity. Enter your own initials or text.'
          : 'ក្បូរក្បាច់រចនាអក្សរកាត់គឺដាច់ដោយឡែកពីឈ្មោះ និងអត្តសញ្ញាណភ្ញៀវ។ សូមបញ្ចូលអក្សរកាត់ ឬអត្ថបទផ្ទាល់ខ្លួនរបស់អ្នក។'}
      </p>

      <div className="studio-design-tools" aria-label={isEn ? 'Monogram starting styles' : 'ម៉ូដចាប់ផ្តើមតែម'}>
        {MONOGRAM_STYLES.map(style => (
          <button
            type="button"
            key={style.en}
            onClick={() => patch({ layout: style.layout, motif: style.motif })}
          >
            {isEn ? style.en : style.km}
          </button>
        ))}
      </div>

      <label>
        {isEn ? 'Enable monogram' : 'បើកដំណើរការតែមអក្សរកាត់'}
        <input type="checkbox" checked={config.enabled} onChange={e => patch({ enabled: e.target.checked })} />
      </label>

      <label>
        {isEn ? 'Monogram text' : 'អត្ថបទអក្សរកាត់'}
        <input
          maxLength={60}
          value={config.text}
          placeholder={isEn ? 'e.g. V & S' : 'ឧ. វ & ស'}
          onChange={e => patch({ text: e.target.value })}
        />
      </label>

      <label>
        {isEn ? 'Monogram color' : 'ពណ៌តែម'}
        <input type="color" value={config.color} onChange={e => patch({ color: e.target.value })} />
      </label>

      <label>
        {isEn ? 'Monogram font' : 'ពុម្ពអក្សរតែម'}
        <select value={config.font || 'MOUL'} onChange={e => patch({ font: e.target.value })}>
          {MONOGRAM_FONTS.map(item => (
            <option key={item.key} value={item.key}>{isEn ? item.en : item.km}</option>
          ))}
        </select>
      </label>

      <label>
        {isEn ? 'Monogram position' : 'ទីតាំងតែម'}
        <select value={config.position || 'above'} onChange={e => patch({ position: e.target.value })}>
          <option value="above">{isEn ? 'Above the names' : 'ខាងលើឈ្មោះ'}</option>
          <option value="below">{isEn ? 'Below the names' : 'ខាងក្រោមឈ្មោះ'}</option>
        </select>
      </label>

      <label>
        {isEn ? 'Monogram frame' : 'ស៊ុមតែម'}
        <select value={config.layout} onChange={e => patch({ layout: e.target.value })}>
          {MONOGRAM_FRAMES.map(frame => (
            <option key={frame.key} value={frame.key}>{isEn ? frame.en : frame.km}</option>
          ))}
        </select>
      </label>

      <label>
        {isEn ? 'Monogram motif' : 'ក្បាច់លម្អតែម'}
        <select value={config.motif} onChange={e => patch({ motif: e.target.value })}>
          {MONOGRAM_MOTIFS.map(motif => (
            <option key={motif.key} value={motif.key}>{isEn ? motif.en : motif.km}</option>
          ))}
        </select>
      </label>

      <label>
        {isEn ? 'Monogram size' : 'ទំហំតែម'}
        <input type="range" min="60" max="180" step="5" value={config.size} onChange={e => patch({ size: Number(e.target.value) })} />
      </label>

      <div ref={preview}><CoupleMonogram value={{ ...config, enabled: true }} /></div>

      <div className="studio-design-tools">
        <button type="button" disabled={!config.text.trim()} onClick={() => exportImage('svg')}>
          {isEn ? 'Export monogram SVG' : 'ទាញយកតែម SVG'}
        </button>
        <button type="button" disabled={!config.text.trim()} onClick={() => exportImage('png')}>
          {isEn ? 'Export monogram PNG' : 'ទាញយកតែម PNG'}
        </button>
        <button type="button" onClick={() => patch({ enabled: false, text: '', size: 100 })}>
          {isEn ? 'Reset monogram' : 'កំណត់តែមឡើងវិញ'}
        </button>
      </div>

      {exportStatus && <p role="status">{exportStatus}</p>}
    </section>
  );
}
