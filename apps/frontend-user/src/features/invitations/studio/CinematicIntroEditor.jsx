import { useState } from 'react';
import { ArrowDown, ArrowUp, Images, Trash2 } from 'lucide-react';
import { normalizeIntro, normalizeIntroUpload } from '../../templates/shared/cinematicIntro';

export default function CinematicIntroEditor({ value, onChange, photos = [], english }) {
  const intro = normalizeIntro(value);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const t = (en, km) => english ? en : km;
  const set = patch => onChange(previous => ({ ...normalizeIntro(previous), ...patch }));
  const slides = intro.slides || [];
  const updateSlide = (index, patch) => onChange(previous => { const current = normalizeIntro(previous); return { ...current, slides: (current.slides || []).map((slide, i) => i === index ? { ...slide, ...patch } : slide) }; });
  const move = (index, delta) => { const next = [...slides]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; set({ slides: next }); };
  async function add(files) {
    if (!files.length) return;
    if (files.some(file => file.size > 5 * 1024 * 1024) || files.length + slides.length > 24) {
      setError(t('Choose up to 24 JPEG, PNG or WebP images, each under 5 MB.', 'ជ្រើសរើសរូបភាព JPEG, PNG ឬ WebP រហូតដល់ ២៤ រូប ដែលតូចជាង 5 MB។')); return;
    }
    setReading(true); setError('');
    try {
      const added = await Promise.all(files.map(async source => { const file = await normalizeIntroUpload(source); return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ id: crypto.randomUUID(), src: reader.result, alt: file.name.replace(/\.[^.]+$/, ''), x: 50, y: 50 }); reader.onerror = () => reject(new Error('Could not read image')); reader.readAsDataURL(file); }); }));
      onChange(previous => { const current = normalizeIntro(previous); return { ...current, slides: [...(current.slides || []), ...added].slice(0, 24) }; });
    } catch { setError(t('Choose a readable JPEG, PNG or WebP image under 5 MB.', 'សូមជ្រើសរើសរូបភាព JPEG, PNG ឬ WebP ដែលអាចអានបាន និងតូចជាង 5 MB។')); }
    finally { setReading(false); }
  }
  return <section className="studio-intro-editor" aria-label={t('Cinematic intro', 'ការបើកធៀបបែបភាពយន្ត')}>
    <p className="studio-intro-lead">{t('Create a quiet ceremonial opening, followed by your own wedding portraits. Names and date follow Event Information.', 'រចនាការបើកធៀបជាមួយរូបភាពមង្គលការរបស់អ្នក។ ឈ្មោះ និងថ្ងៃខែយកតាមព័ត៌មានកម្មវិធី។')}</p>
    <label className="studio-inline-check"><input type="checkbox" checked={intro.enabled} onChange={e => set({ enabled: e.target.checked })} />{t('Enable cinematic intro', 'បើកការបើកធៀបបែបភាពយន្ត')}</label>
    <label>{t('Opening style', 'រចនាប័ទ្មការបើក')}<select value={intro.style} onChange={e => set({ style: e.target.value })}><option value="oval">{t('Carved ivory oval', 'ស៊ុមពងក្រពើភ្លុក')}</option><option value="minimal">{t('Typography only', 'អក្សរតែប៉ុណ្ណោះ')}</option></select></label>
    <label>{t('Intro heading', 'ចំណងជើងការបើក')}<input maxLength={300} value={intro.heading ?? ''} placeholder={t('Use invitation title', 'តាមចំណងជើងធៀប')} onChange={e => set({ heading: e.target.value })} /></label>
    <label>{t('Intro subtitle', 'ចំណងជើងរង')}<input maxLength={500} value={intro.subtitle ?? ''} onChange={e => set({ subtitle: e.target.value })} /></label>
    <p className="studio-intro-help">{t('Cover artwork and video use the existing Design & Cover upload. Music uses the Music section.', 'រូបភាព និងវីដេអូក្របធៀបប្រើផ្នែករចនា និងក្របធៀប។ តន្ត្រីប្រើផ្នែកតន្ត្រី។')}</p>
    <div className="studio-intro-media-heading"><h3><Images size={18} aria-hidden="true" />{t('Portrait sequence', 'លំដាប់រូបភាព')}</h3><span>{slides.length} / 24</span></div>
    <label className="studio-intro-upload">{reading ? t('Reading images…', 'កំពុងអានរូបភាព…') : t('Add slideshow images', 'បន្ថែមរូបភាពការបើក')}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={reading} onChange={e => { add([...e.target.files]); e.target.value = ''; }} /></label>
    {error && <p role="alert">{error}</p>}
    {intro.slides === undefined && <p>{t('The intro currently follows your gallery order.', 'ការបើកធៀបកំពុងប្រើលំដាប់រូបភាពក្នុងវិចិត្រសាល។')}</p>}
    <div className="studio-reorder"><button type="button" onClick={() => set({ slides: photos.map((photo, i) => ({ id: photo.id || `photo-${i}`, src: photo.url || photo.src || photo.preview || photo, alt: photo.alt || '', x: 50, y: 50 })) })}>{t('Copy gallery order', 'ចម្លងលំដាប់វិចិត្រសាល')}</button><button type="button" onClick={() => set({ slides: [] })}>{t('Clear slideshow', 'លុបរូបភាពការបើក')}</button></div>
    <ol className="studio-intro-slides">{slides.map((slide, index) => <li key={slide.id}>
      <img src={slide.src} alt="" style={{ objectPosition: `${slide.x}% ${slide.y}%` }} />
      <div><label>{t('Image description', 'ពិពណ៌នារូបភាព')} {index + 1}<input maxLength={300} value={slide.alt} onChange={e => updateSlide(index, { alt: e.target.value })} /></label>
        <div className="studio-reorder"><button type="button" disabled={index === 0} aria-label={`Move slide ${index + 1} up`} onClick={() => move(index, -1)}><ArrowUp size={16} /></button><button type="button" disabled={index === slides.length - 1} aria-label={`Move slide ${index + 1} down`} onClick={() => move(index, 1)}><ArrowDown size={16} /></button><button type="button" aria-label={`Remove slide ${index + 1}`} onClick={() => set({ slides: slides.filter((_, i) => i !== index) })}><Trash2 size={16} /></button></div>
        <label>{t('Horizontal crop', 'ចំណុចផ្ដេក')} {index + 1}<input type="range" min="0" max="100" value={slide.x} onChange={e => updateSlide(index, { x: Number(e.target.value) })} /></label>
        <label>{t('Vertical crop', 'ចំណុចបញ្ឈរ')} {index + 1}<input type="range" min="0" max="100" value={slide.y} onChange={e => updateSlide(index, { y: Number(e.target.value) })} /></label>
      </div></li>)}</ol>
    <div className="studio-intro-options"><label>{t('Seconds per slide', 'វិនាទីក្នុងមួយរូប')}<input type="number" min="2" max="12" step=".1" value={intro.duration} onChange={e => set({ duration: Number(e.target.value) })} /></label>
      <label>{t('Transition', 'ចលនាប្ដូររូបភាព')}<select value={intro.transition} onChange={e => set({ transition: e.target.value })}><option value="ken-burns">{t('Slow zoom & crossfade', 'ពង្រីកយឺត និងប្ដូររលូន')}</option><option value="fade">{t('Crossfade', 'ប្ដូររលូន')}</option></select></label>
      <label>{t('Portrait shade', 'ស្រមោលរូបភាព')}<input type="range" min="0" max=".75" step=".05" value={intro.overlay} onChange={e => set({ overlay: Number(e.target.value) })} /></label>
      <label>{t('Text position', 'ទីតាំងអក្សរ')}<select value={intro.textPosition} onChange={e => set({ textPosition: e.target.value })}><option value="bottom">{t('Lower portrait', 'ខាងក្រោមរូបភាព')}</option><option value="center">{t('Center', 'កណ្ដាល')}</option></select></label>
    </div>
    {[['showSaveTheDate', 'Show Save the Date', 'បង្ហាញ Save the Date'], ['music', 'Start selected music when opened', 'ចាប់ផ្ដើមតន្ត្រីនៅពេលបើក'], ['reducedMotion', 'Preview with reduced motion', 'មើលជាមុនដោយកាត់បន្ថយចលនា']].map(([key, en, km]) => <label className="studio-inline-check" key={key}><input type="checkbox" checked={intro[key]} onChange={e => set({ [key]: e.target.checked })} />{t(en, km)}</label>)}
  </section>;
}
