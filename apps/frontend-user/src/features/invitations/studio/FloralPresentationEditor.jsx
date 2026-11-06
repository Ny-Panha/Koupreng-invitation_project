import { useId } from 'react';

/** Template-specific presentation uses the same saved versioned style document. */
export default function FloralPresentationEditor({ style, set, english }) {
  const prefix = useId();
  const text = (en, km) => english ? en : km;
  const field = (key, en, km, multiline = false) => <div className="studio-floral-field" key={key}><label className="pe-label" htmlFor={`${prefix}-${key}`}>{text(en, km)}</label>{multiline
    ? <textarea id={`${prefix}-${key}`} className="pe-input" rows={5} maxLength={1500} value={style[key]} onChange={event => set(key,event.target.value)} />
    : <input id={`${prefix}-${key}`} className="pe-input" maxLength={key.startsWith('openButton') ? 80 : 300} value={style[key]} onChange={event => set(key,event.target.value)} />}</div>;
  const number = (key, en, km, min, max) => <div className="studio-floral-field" key={key}><label className="pe-label" htmlFor={`${prefix}-${key}`}>{text(en, km)}</label><div className="studio-floral-range"><input id={`${prefix}-${key}`} className="pe-input" type="range" min={min} max={max} step={1} value={style[key]} onChange={event => set(key,Number(event.target.value))} /><output aria-hidden="true">{style[key]}</output></div></div>;
  const toggle = (key, en, km) => <label className="pe-label studio-inline-check" key={key}><input type="checkbox" checked={style[key]} onChange={event => set(key,event.target.checked)} />{text(en, km)}</label>;
  return <>
    <details className="studio-floral-settings" open>
      <summary>{text('Guest and Open button', 'ភ្ញៀវ និងប៊ូតុងបើកសំបុត្រ')}</summary>
      <div className="studio-floral-settings-body">
        {field('openButtonLabelKm','Open button label (Khmer)','អក្សរប៊ូតុងបើក (ខ្មែរ)')}
        {field('openButtonLabelEn','Open button label (English)','អក្សរប៊ូតុងបើក (អង់គ្លេស)')}
        {number('openButtonPadding','Button side spacing','គម្លាតចំហៀងប៊ូតុង',4,20)}
        {number('openButtonTextSize','Button text size','ទំហំអក្សរប៊ូតុង',14,20)}
        {number('guestTextSize','Guest name text size','ទំហំអក្សរឈ្មោះភ្ញៀវ',14,20)}
        {toggle('showCoverDate','Show wedding date on cover','បង្ហាញថ្ងៃមង្គលការលើក្រប')}
        {toggle('showCoverVenue','Show venue on cover','បង្ហាញទីតាំងលើក្រប')}
        <p className="studio-style-example">{text('Text scales down to fit phones. Longer guest names wrap without being cut off.', 'អក្សរបង្រួមតាមអេក្រង់ទូរស័ព្ទ។ ឈ្មោះភ្ញៀវវែងចុះបន្ទាត់ ដោយមិនកាត់អក្សរ។')}</p>
        {field('guestSalutationKm','Guest salutation (Khmer)','ពាក្យអញ្ជើញភ្ញៀវ (ខ្មែរ)')}
        {field('guestSalutationEn','Guest salutation (English)','ពាក្យអញ្ជើញភ្ញៀវ (អង់គ្លេស)')}
        {field('genericGuestNameKm','General guest greeting (Khmer)','ពាក្យជំនួសឈ្មោះភ្ញៀវ (ខ្មែរ)')}
        {field('genericGuestNameEn','General guest greeting (English)','ពាក្យជំនួសឈ្មោះភ្ញៀវ (អង់គ្លេស)')}
        <p className="studio-style-example">{text('Personalized guest links always show that guest’s name. The general greeting is used when no individual name is supplied.', 'តំណភ្ញៀវផ្ទាល់ខ្លួនតែងបង្ហាញឈ្មោះភ្ញៀវនោះ។ ពាក្យទូទៅប្រើនៅពេលមិនមានឈ្មោះភ្ញៀវផ្ទាល់ខ្លួន។')}</p>
      </div>
    </details>
    <details className="studio-floral-settings">
      <summary>{text('Wedding details wording', 'អត្ថបទព័ត៌មានមង្គលការ')}</summary>
      <div className="studio-floral-settings-body">
        {field('familyHeadingKm','Invitation heading (Khmer)','ចំណងជើងអញ្ជើញ (ខ្មែរ)')}
        {field('familyHeadingEn','Invitation heading (English)','ចំណងជើងអញ្ជើញ (អង់គ្លេស)')}
        {field('familyIntroKm','Wedding invitation wording (Khmer)','អត្ថបទអញ្ជើញមង្គលការ (ខ្មែរ)',true)}
        {field('familyIntroEn','Wedding invitation wording (English)','អត្ថបទអញ្ជើញមង្គលការ (អង់គ្លេស)',true)}
      </div>
    </details>
    <details className="studio-floral-settings">
      <summary>{text('Flowers and welcome timing', 'ផ្កា និងរយៈពេលស្វាគមន៍')}</summary>
      <div className="studio-floral-settings-body">
        {number('welcomeSeconds','Welcome duration (seconds)','រយៈពេលស្វាគមន៍ (វិនាទី)',5,10)}
        {toggle('showWelcomeContinue','Show extra Continue button','បង្ហាញប៊ូតុងបន្តបន្ថែម')}
        {number('petalCount','Number of petals','ចំនួនស្រទាប់ផ្កា',0,15)}
        {number('butterflyCount','Number of butterflies','ចំនួនមេអំបៅ',0,15)}
        {toggle('sideFlorals','Side flower borders','ស៊ុមផ្កាសងខាង')}
        {toggle('sceneBranches','Corner blossom branches','មែកផ្កានៅជ្រុង')}
        {toggle('sceneBackground','Wedding details flower background','ផ្ទៃផ្កាព័ត៌មានមង្គលការ')}
      </div>
    </details>
  </>;
}
