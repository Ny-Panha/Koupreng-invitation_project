import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const GUIDE_STEPS = [
  ['ព័ត៌មានកម្មវិធី', 'Event details'], ['រចនា និងមាតិកា', 'Design & content'],
  ['ភ្ញៀវ និង RSVP', 'Guests & RSVP'], ['ពិនិត្យមើល', 'Preview & review'], ['ផ្សព្វផ្សាយ និងចែករំលែក', 'Publish & share'],
];

export function ReadinessChecklist({ checks, english, onField }) {
  return <section className="studio-readiness" aria-label={english ? 'Publishing checklist' : 'បញ្ជីពិនិត្យមុនផ្សព្វផ្សាយ'}>
    <h2>{english ? 'Review required information' : 'ពិនិត្យព័ត៌មានចាំបាច់'}</h2>
    <p>{english ? 'The server validates these details before publication. Optional sections stay optional.' : 'ម៉ាស៊ីនមេផ្ទៀងផ្ទាត់ព័ត៌មានមុនផ្សព្វផ្សាយ។ ផ្នែកជាជម្រើសនៅតែជាជម្រើស។'}</p>
    <ul>{checks.map(check => <li key={check.key}>
      <span aria-hidden="true">{check.complete ? '✓' : '○'}</span>
      <span>{check[english ? 'en' : 'km']}</span>
      <span className="studio-check-state">{check.complete ? (english ? 'Ready' : 'រួចរាល់') : (english ? 'Required' : 'ចាំបាច់')}</span>
      {!check.complete && onField && <button type="button" onClick={() => onField(check)}>{english ? 'Complete field' : 'បំពេញវាល'}</button>}
    </li>)}</ul>
  </section>;
}

export default function StudioGuide({ mode, onMode, step, onStep, sections, activeSection, onSection, english,
  checks, onField, onPreview, onGuests, onRsvp, onPublish, published, publishedUrl, saving, canPublish = true, canManageGuests = true }) {
  const text = (en, km) => english ? en : km;
  const [copyState, setCopyState] = useState('');
  async function copyLink() {
    try { await navigator.clipboard.writeText(publishedUrl); setCopyState(text('Link copied','បានចម្លងតំណ')); }
    catch { setCopyState(text('Could not copy. Select and copy the link below.','មិនអាចចម្លងបាន។ សូមជ្រើសរើស និងចម្លងតំណខាងក្រោម។')); }
  }
  const stepSections = step === 0 ? sections.filter(key => ['eventInfo', 'venue', 'family'].includes(key))
    : step === 1 ? sections.filter(key => !['eventInfo', 'venue'].includes(key)) : [];
  const names = { cinematicIntro: ['Cinematic intro', 'ការបើកធៀបបែបភាពយន្ត'], eventInfo: ['Event details','ព័ត៌មានកម្មវិធី'], venue: ['Venue & map','ទីកន្លែង'], family: ['Families','គ្រួសារ'],
    cover:['Cover','ក្រប'], appearance:['Appearance','រូបរាង'], invitation:['Invitation message','សារអញ្ជើញ'], schedule:['Program','កម្មវិធី'],
    story:['Our story','រឿងរ៉ាវ'], gallery:['Gallery','រូបភាព'], music:['Music','តន្ត្រី'], couplePhoto:['Couple photos','រូបគូ'],
    countdown:['Save the date & calendar','កំណត់ថ្ងៃ និងប្រតិទិន'], dressCode:['Dress code','សម្លៀកបំពាក់'], party:['Wedding party','ក្រុមអម'], faq:['Guest notes','កំណត់សម្គាល់'],
    khqr:['Gift KHQR','ចំណងដៃ KHQR'], closing:['Closing messages','សារបញ្ចប់'], languageMode:['Content language','ភាសាមាតិកា'] };
  return <section className="studio-guide" aria-label={text('Editing workflow','លំហូររចនា')}>
    <div className="studio-guide-modes" role="group" aria-label={text('Editor mode','របៀបរចនា')}>
      <button type="button" aria-pressed={mode === 'guided'} onClick={() => onMode('guided')}>{text('Guided creation','រចនាតាមជំហាន')}</button>
      <button type="button" aria-pressed={mode === 'advanced'} onClick={() => onMode('advanced')}>{text('Advanced editor','រចនាលម្អិត')}</button>
    </div>
    {mode === 'guided' && <>
      <nav aria-label={text('Creation steps','ជំហានរចនា')}><ol className="studio-guide-steps">{GUIDE_STEPS.map((labels, index) => <li key={labels[1]}><button type="button" aria-current={step === index ? 'step' : undefined} onClick={() => onStep(index)}><span>{index + 1}</span>{labels[english ? 1 : 0]}</button></li>)}</ol></nav>
      <h2 tabIndex={-1} id="studio-guide-heading">{GUIDE_STEPS[step][english ? 1 : 0]}</h2>
      {step < 2 && <div className="studio-guide-sections">{stepSections.map(key => <button type="button" key={key} aria-pressed={activeSection === key} onClick={() => onSection(key)}>{names[key]?.[english ? 0 : 1] || key}</button>)}</div>}
      {step === 2 && <div className="studio-guide-panel"><button type="button" disabled={saving || !canManageGuests} onClick={onGuests}>{text('Save & open guests','រក្សាទុក និងបើកបញ្ជីភ្ញៀវ')}</button><button type="button" disabled={saving || !canManageGuests} onClick={onRsvp}>{text('Save & open RSVP','រក្សាទុក និងបើក RSVP')}</button></div>}
      {step >= 3 && <><ReadinessChecklist checks={checks} english={english} onField={onField} /><button type="button" onClick={onPreview}>{text('Open draft preview','បើកពង្រាងមើលជាមុន')}</button></>}
      {step === 4 && !canPublish && !published && <p>{text('The event owner reviews and publishes this invitation.','ម្ចាស់កម្មវិធីជាអ្នកពិនិត្យ និងផ្សព្វផ្សាយធៀបនេះ។')}</p>}
      {step === 4 && (published ? <div className="studio-published-result"><Check aria-hidden="true" /><strong>{text('Published','បានផ្សព្វផ្សាយ')}</strong>{publishedUrl && <><a href={publishedUrl} target="_blank" rel="noreferrer">{text('View invitation','មើលធៀបអញ្ជើញ')}</a><button type="button" onClick={copyLink}>{text('Copy invitation link','ចម្លងតំណធៀបអញ្ជើញ')}</button><p className="studio-share-url">{publishedUrl}</p><p role="status">{copyState}</p></>}</div> : <button type="button" disabled={saving || !canPublish} onClick={onPublish}>{text('Review publication','ពិនិត្យមុនផ្សព្វផ្សាយ')}</button>)}
      <div className="studio-guide-navigation"><button type="button" disabled={step === 0} onClick={() => onStep(step - 1)}><ArrowLeft aria-hidden="true" size={16}/>{text('Back','ត្រឡប់')}</button><span>{step + 1} / 5</span><button type="button" disabled={step === 4} onClick={() => onStep(step + 1)}>{text('Next','បន្ទាប់')}<ArrowRight aria-hidden="true" size={16}/></button></div>
    </>}
  </section>;
}
