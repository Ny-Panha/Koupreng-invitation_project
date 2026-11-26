import { Check, ArrowLeft, ArrowRight, Copy, Download, ExternalLink, Lock, Send, Share2, MessageCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import QRCode from 'react-qr-code';

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
  checks, onField, onPreview, onGuests, onRsvp, onPublish, onUnpublish, unpublishing = false, visibility = 'PUBLIC', published, publishedUrl, saving, canPublish = true, canManageGuests = true }) {
  const text = (en, km) => english ? en : km;
  const [copyState, setCopyState] = useState('');
  const qrContainerRef = useRef(null);
  async function copyLink() {
    try { await navigator.clipboard.writeText(publishedUrl); setCopyState(text('Link copied','បានចម្លងតំណ')); }
    catch { setCopyState(text('Could not copy. Select and copy the link below.','មិនអាចចម្លងបាន។ សូមជ្រើសរើស និងចម្លងតំណខាងក្រោម។')); }
  }
  async function shareNative() {
    if (!publishedUrl) return;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: text('Wedding Invitation', 'សំបុត្រអញ្ជើញ'), url: publishedUrl });
        setCopyState(text('Share sheet opened', 'បានបើកការចែករំលែក'));
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    await copyLink();
  }
  function downloadQrSvg() {
    const svg = qrContainerRef.current?.querySelector('svg');
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'koupreng-invitation-qr.svg';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const stepSections = step === 0 ? sections.filter(key => ['eventInfo', 'venue', 'family'].includes(key))
    : step === 1 ? sections.filter(key => !['eventInfo', 'venue'].includes(key)) : [];
  const names = { cinematicIntro: ['Cinematic intro', 'ការបើកសំបុត្រអញ្ជើញបែបភាពយន្ត'], eventInfo: ['Event details','ព័ត៌មានកម្មវិធី'], venue: ['Venue & map','ទីកន្លែង'], family: ['Families','គ្រួសារ'],
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
      {step === 4 && !canPublish && !published && <p>{text('The event owner reviews and publishes this invitation.','ម្ចាស់កម្មវិធីជាអ្នកពិនិត្យ និងផ្សព្វផ្សាយសំបុត្រអញ្ជើញនេះ។')}</p>}
      {step === 4 && (published ? <div className="studio-published-result studio-share-atelier">
        <div className="studio-published-status-row">
          <span className="studio-published-badge"><Check aria-hidden="true" size={16} /><strong>{text('Published','បានផ្សព្វផ្សាយ')}</strong></span>
          <span className="studio-visibility-tag"><Lock aria-hidden="true" size={14} />{visibility === 'PASSWORD_PROTECTED' ? text('Password protected', 'ការពារដោយពាក្យសម្ងាត់') : visibility === 'PRIVATE' ? text('Private links only', 'ឯកជន') : text('Public link', 'សាធារណៈ')}</span>
        </div>
        {publishedUrl && <div className="studio-share-grid">
          <div className="studio-qr-card" ref={qrContainerRef}>
            <QRCode value={publishedUrl} size={132} level="M" bgColor="#ffffff" fgColor="#141414" />
            <button type="button" className="studio-qr-download-btn" onClick={downloadQrSvg}><Download size={15} aria-hidden="true" />{text('Download QR', 'ទាញយក QR')}</button>
          </div>
          <div className="studio-share-details">
            <p className="studio-share-url">{publishedUrl}</p>
            <div className="studio-share-actions">
              <a href={publishedUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" />{text('View invitation','មើលសំបុត្រអញ្ជើញ')}</a>
              <button type="button" onClick={copyLink}><Copy size={15} aria-hidden="true" />{text('Copy invitation link','ចម្លងតំណសំបុត្រអញ្ជើញ')}</button>
              <button type="button" onClick={shareNative}><Share2 size={15} aria-hidden="true" />{text('Share', 'ចែករំលែក')}</button>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(publishedUrl)}`} target="_blank" rel="noreferrer"><Send size={15} aria-hidden="true" />Telegram</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(publishedUrl)}`} target="_blank" rel="noreferrer"><MessageCircle size={15} aria-hidden="true" />WhatsApp</a>
            </div>
            <p role="status" className="studio-copy-status">{copyState}</p>
          </div>
        </div>}
        {canPublish && (onPublish || onUnpublish) && (
          <div className="studio-unpublish-row">
            {onPublish && (
              <button type="button" className="studio-access-edit-btn" disabled={saving || unpublishing} onClick={onPublish}>
                <Lock aria-hidden="true" size={14} />
                {text('Visibility & password', 'ភាពមើលឃើញ និងពាក្យសម្ងាត់')}
              </button>
            )}
            {onUnpublish && (
              <button type="button" className="studio-unpublish-btn" disabled={saving || unpublishing} onClick={onUnpublish}>
                {unpublishing ? text('Unpublishing…', 'កំពុងផ្អាកផ្សព្វផ្សាយ…') : text('Unpublish invitation', 'ផ្អាកការផ្សព្វផ្សាយ')}
              </button>
            )}
          </div>
        )}
      </div> : <button type="button" disabled={saving || !canPublish} onClick={onPublish}>{text('Review publication','ពិនិត្យមុនផ្សព្វផ្សាយ')}</button>)}
      <div className="studio-guide-navigation"><button type="button" disabled={step === 0} onClick={() => onStep(step - 1)}><ArrowLeft aria-hidden="true" size={16}/>{text('Back','ត្រឡប់')}</button><span>{step + 1} / 5</span><button type="button" disabled={step === 4} onClick={() => onStep(step + 1)}>{text('Next','បន្ទាប់')}<ArrowRight aria-hidden="true" size={16}/></button></div>
    </>}
  </section>;
}
