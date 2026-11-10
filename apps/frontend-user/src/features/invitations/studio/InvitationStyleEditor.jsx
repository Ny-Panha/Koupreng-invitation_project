import { useRef, useState } from 'react';
import { DATE_STYLES, PROGRAM_STYLES, GUEST_FRAMES, MOTION_STYLES, MONOGRAM_FRAMES, invitationStyles } from '../../templates/shared/invitationStyles';
import DatePresentation from '../../templates/shared/DatePresentation';
import { EventCalendar } from '../../templates/shared/SaveTheDate';
import ProgramTimeline from '../../templates/shared/ProgramTimeline';
import { resolveEvent } from '../../templates/shared/eventDateTime';
import { FloralMonogram } from '../../templates/layouts/KhmerFloralGold/FloralArtwork';
import { mediaService } from '../api/mediaApi';
import { validateLibraryFile } from '../mediaLibraryModel';
import { stylePreviewContent } from './stylePreviewContent';
import { normalizeStudioImage } from './studioMedia';
import FloralPresentationEditor from './FloralPresentationEditor';
import '../../templates/layouts/KhmerFloralGold/khmer-floral-gold.css';
import './invitation-style-editor.css';

export default function InvitationStyleEditor({ form, update, capabilities, english, eventId }) {
  const style = invitationStyles({ ...form, ...(capabilities.coverStyles ? { code: 'khmer-floral-gold' } : {}), invitationStyleV1: { ...(capabilities.coverStyles ? { program: 'gold-curve' } : {}), ...form.invitationStyleV1 } }), latest = useRef({ form, update, eventId });
  latest.current = { form, update, eventId };
  const [busy, setBusy] = useState(''), [error, setError] = useState('');
  const text = (en, km) => english ? en : km;
  const set = (key, value) => update('invitationStyleV1', { ...form.invitationStyleV1, version: 1, [key]: value });
  const examples = stylePreviewContent(form, english);
  const event = resolveEvent(examples.date);
  const picker = (title, field, options, preview, sample = false) => <fieldset className="studio-style-picker"><legend>{title}</legend>{sample && <p className="studio-style-example">{text('Sample preview. Add your date and program to see your own details here.', 'ឧទាហរណ៍សម្រាប់មើលជាមុន។ បន្ថែមកាលបរិច្ឆេទ និងកម្មវិធី ដើម្បីមើលព័ត៌មានរបស់អ្នកនៅទីនេះ។')}</p>}<div className="studio-style-options">{options.map(option => <label key={option.id} className="studio-style-option">
    <input type="radio" name={`invitation-style-${field}`} value={option.id} checked={style[field] === option.id} onChange={() => set(field, option.id)} />
    <span className="studio-style-label">{english ? option.en : option.km}</span>
    <span className="studio-style-mini" aria-hidden="true" inert>{preview(option.id)}</span>
  </label>)}</div></fieldset>;
  async function upload(event, key) {
    let file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    let invalid = false;
    try { file = await normalizeStudioImage(file); } catch { invalid = true; }
    if (invalid || validateLibraryFile(file, 'gallery')) {
      setError(text('Choose a JPG, PNG or WebP image up to 5 MB.', 'សូមជ្រើសរើសរូប JPG PNG ឬ WebP មិនលើស 5 MB។')); return;
    }
    setBusy(key); setError('');
    try {
      const uploaded = await mediaService.uploadGallery(eventId, [file]);
      const url = uploaded?.[0]?.fileUrl;
      if (!url) throw new Error(text('The image was not returned. Try again.', 'មិនបានទទួលរូបភាព។ សូមព្យាយាមម្ដងទៀត។'));
      const current = latest.current;
      if (current.eventId !== eventId) return;
      if (key === 'coverBackgroundImage') current.update(key, url);
      else current.update('invitationStyleV1', { ...current.form.invitationStyleV1, version: 1, [key]: url });
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  const imageField = (key, title, value) => <div className="studio-style-image"><label className="pe-label">{title}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(busy) || !/^[1-9]\d*$/.test(String(eventId))} onChange={e => upload(e, key)} /></label>{value && <><img src={value} alt={title} /><button type="button" className="workspace-button" onClick={() => key === 'coverBackgroundImage' ? update(key, '') : set(key, '')}>{text('Remove image', 'ដករូបភាព')}</button></>}{busy === key && <p role="status">{text('Uploading image…', 'កំពុងបញ្ចូលរូបភាព…')}</p>}</div>;
  const select = (field, title, options) => <label className="pe-label">{title}<select className="pe-input" value={style[field]} onChange={e => set(field, e.target.value)}>{options.map(([id, en, km]) => <option key={id} value={id}>{text(en, km)}</option>)}</select></label>;
  return <section className="pe-section-card studio-invitation-styles">
    <h4 className="pe-section-heading">{text('Invitation styles', 'រចនាប័ទ្មសំបុត្រអញ្ជើញ')}</h4>
    <p>{text('Preview your saved details in each style. Use the phone preview to see the complete invitation.', 'មើលព័ត៌មានរបស់អ្នកក្នុងរចនាប័ទ្មនីមួយៗ។ ប្រើការមើលជាមុនតាមទូរស័ព្ទ ដើម្បីមើលសំបុត្រអញ្ជើញទាំងមូល។')}</p>
    {error && <p role="alert">{error}</p>}
    {capabilities.coverStyles && <>
      {select('headingMode', text('Cover heading', 'ចំណងជើងក្រប'), [['text', 'Live text', 'អក្សរផ្ទាល់'], ['image', 'Uploaded artwork', 'រូបអក្សរ']])}
      {style.headingMode === 'text' ? <><label className="pe-label">{text('Heading text', 'អក្សរចំណងជើង')}<input className="pe-input" value={form.title || ''} placeholder={text('e.g. Wedding Celebration', 'ឧ. ពិធីសិរីសួស្តីអាពាហ៍ពិពាហ៍')} onChange={e => update('title', e.target.value)} /></label><label className="pe-label">{text('Heading size', 'ទំហំចំណងជើង')}<input type="range" min="20" max="40" value={style.headingSize} onChange={e => set('headingSize', Number(e.target.value))} /></label>{select('headingAlign', text('Heading alignment', 'តម្រឹមចំណងជើង'), [['left', 'Left', 'ឆ្វេង'], ['center', 'Center', 'កណ្ដាល'], ['right', 'Right', 'ស្ដាំ']])}</> : imageField('headingImage', text('Heading artwork', 'រូបចំណងជើង'), style.headingImage)}
      {select('monogramMode', text('Couple initials / logo', 'អក្សរកាត់ ឬរូបតំណាង'), [['auto', 'Automatic initials', 'អក្សរកាត់ស្វ័យប្រវត្តិ'], ['text', 'Custom initials', 'អក្សរកាត់ផ្ទាល់ខ្លួន'], ['names', 'Couple names', 'ឈ្មោះគូស្វាមីភរិយា'], ['short-names', 'Short couple names', 'ឈ្មោះខ្លីគូស្វាមីភរិយា'], ['image', 'Uploaded logo', 'រូបតំណាង']])}
      {select('headingShape',text('Heading shape','ទម្រង់ចំណងជើង'),[['arched','Gentle arch','កោងស្រទន់'],['straight','Straight','ត្រង់']])}
      {style.monogramMode === 'short-names' && <fieldset className="studio-floral-settings-body"><legend>{text('Short names for the cover only', 'ឈ្មោះខ្លីសម្រាប់ក្របប៉ុណ្ណោះ')}</legend><p className="studio-style-example">{text('Use familiar short names when full names are long. Full names in the wedding details stay unchanged. Leave a short name empty to use the full name.', 'ប្រើឈ្មោះខ្លីនៅពេលឈ្មោះពេញវែង។ ឈ្មោះពេញនៅព័ត៌មានមង្គលការរក្សាដដែល។ ទុកឈ្មោះខ្លីទទេដើម្បីប្រើឈ្មោះពេញ។')}</p>{[['groomShortName','Groom short name (Khmer)','ឈ្មោះខ្លីកូនកំលោះ (ខ្មែរ)', 'ឧ. សុខ'],['brideShortName','Bride short name (Khmer)','ឈ្មោះខ្លីកូនក្រមុំ (ខ្មែរ)', 'ឧ. ចាន់'],['groomShortNameEn','Groom short name (English)','ឈ្មោះខ្លីកូនកំលោះ (អង់គ្លេស)', 'e.g. Sok'],['brideShortNameEn','Bride short name (English)','ឈ្មោះខ្លីកូនក្រមុំ (អង់គ្លេស)', 'e.g. Chann']].map(([key,en,km,placeholder]) => <label className="pe-label" key={key}>{text(en,km)}<input className="pe-input" maxLength={40} value={style[key] || ''} placeholder={placeholder} onChange={event => set(key,event.target.value)} /></label>)}</fieldset>}
      {style.monogramMode === 'image' ? imageField('monogramImage', text('Couple logo', 'រូបតំណាងគូស្វាមីភរិយា'), style.monogramImage) : style.monogramMode === 'text' && <label className="pe-label">{text('Initials', 'អក្សរកាត់')}<input className="pe-input" maxLength={24} value={form.monogramText || ''} placeholder={text('e.g. K & C', 'ឧ. ក & គ')} onChange={e => update('monogramText', e.target.value)} /></label>}
      {picker(text('Monogram frame', 'ស៊ុមអក្សរកាត់'), 'monogram', MONOGRAM_FRAMES, id => <FloralMonogram text={form.monogramText || 'ក ខ'} variant={id} />)}
      {style.monogram === 'regal-scroll-gold' && <>
        {[['monogramSize', 'Frame size', 'ទំហំស៊ុម', .8, 1.15, .05], ['monogramTextSize', 'Center text size', 'ទំហំអក្សរកណ្ដាល', 16, 48, 1], ['monogramOpacity', 'Frame opacity', 'ភាពស្រអាប់ស៊ុម', .5, 1, .05], ['monogramOffset', 'Frame vertical offset', 'ទីតាំងបញ្ឈរស៊ុម', -12, 12, 1]].map(([key, en, km, min, max, step]) => <label className="pe-label" key={key}>{text(en, km)}<input type="range" min={min} max={max} step={step} value={style[key]} onChange={e => set(key, Number(e.target.value))} /></label>)}
        <label className="pe-label">{text('Center text color', 'ពណ៌អក្សរកណ្ដាល')}<input type="color" value={style.monogramTextColor} onChange={e => set('monogramTextColor', e.target.value)} /></label>
        {select('monogramAlign', text('Center text alignment', 'តម្រឹមអក្សរកណ្ដាល'), [['left', 'Left', 'ឆ្វេង'], ['center', 'Center', 'កណ្ដាល'], ['right', 'Right', 'ស្ដាំ']])}
        {select('monogramTextLayout', text('Center text layout', 'ប្លង់អក្សរកណ្ដាល'), [['centered', 'Centered', 'កណ្ដាល'], ['staircase', 'Staircase', 'លំដាប់ជណ្ដើរ']])}
        {select('monogramTreatment', text('Gold treatment', 'ពណ៌មាស'), [['original', 'Original gold', 'មាសដើម'], ['champagne', 'Soft champagne', 'មាសសាំប៉ាញ']])}
      </>}
      {picker(text('Guest frame', 'ស៊ុមឈ្មោះភ្ញៀវ'), 'guestFrame', GUEST_FRAMES, id => <div className={`kfg-guest-frame kfg-guest-frame--${id}`}><span>{text('You and your family', 'លោកអ្នក និងក្រុមគ្រួសារ')}</span></div>)}
      <FloralPresentationEditor style={style} set={set} english={english} />
      {imageField('coverBackgroundImage', text('Cover background image', 'រូបផ្ទៃក្រប'), form.coverBackgroundImage)}
      {select('backgroundFit', text('Background fit', 'ទំហំរូបផ្ទៃក្រោយ'), [['cover', 'Fill cover', 'បំពេញក្រប'], ['contain', 'Show whole image', 'បង្ហាញរូបពេញ']])}
      {[['backgroundX', 'Horizontal focus', 'ទីតាំងផ្ដេក', 0, 100, 1], ['backgroundY', 'Vertical focus', 'ទីតាំងបញ្ឈរ', 0, 100, 1], ['backgroundOverlay', 'Paper overlay', 'ស្រទាប់ក្រដាស', 0, 1, .05], ['backgroundBlur', 'Background softness', 'ភាពស្រទន់ផ្ទៃក្រោយ', 0, 12, 1]].map(([key, en, km, min, max, step]) => <label className="pe-label" key={key}>{text(en, km)}<input type="range" min={min} max={max} step={step} value={style[key]} onChange={e => set(key, Number(e.target.value))} /></label>)}
      {select('portraitFrame', text('Portrait frame', 'ស៊ុមរូបថត'), [['torn', 'Hand torn paper', 'ក្រដាសហែក'], ['arch', 'Arch', 'ស៊ុមកោង'], ['gold', 'Gilded', 'ស៊ុមមាស']])}
      {select('gallery', text('Photo layout', 'ប្លង់រូបថត'), [['carousel', 'Peeking carousel', 'រូបរំកិល'], ['grid', 'Photo grid', 'ក្រឡារូបថត'], ['filmstrip', 'Filmstrip', 'ខ្សែរូបថត']])}
      {select('map', text('Venue diagram frame', 'ស៊ុមគំនូសទីតាំង'), [['framed', 'Gold frame', 'ស៊ុមមាស'], ['plain', 'Plain diagram', 'គំនូសសាមញ្ញ'], ['compact', 'Compact directions card', 'កាតទិសដៅតូច']])}
      {select('motion', text('Motion', 'ចលនា'), MOTION_STYLES.map(item => [item.id, item.en, item.km]))}
      <label className="pe-label studio-inline-check"><input type="checkbox" checked={style.florals} onChange={e => set('florals', e.target.checked)} />{text('Botanical decorations', 'លម្អផ្កា')}</label>
    </>}
    {capabilities.dateStyles && picker(text('Date / calendar', 'កាលបរិច្ឆេទ / ប្រតិទិន'), 'date', DATE_STYLES, id => <DatePresentation content={{ ...examples.date, invitationStyleV1: { ...style, date: id } }} english={english} calendar={<EventCalendar date={event.date} english={english} numerals={english ? 'latin' : 'khmer'} />} />, examples.dateIsSample)}
    {capabilities.programStyles && picker(text('Wedding program', 'កម្មវិធីមង្គលការ'), 'program', PROGRAM_STYLES, id => <ProgramTimeline content={{ ...examples.program, invitationStyleV1: { ...style, program: id } }} english={english} naturalTime />, examples.programIsSample)}
  </section>;
}
