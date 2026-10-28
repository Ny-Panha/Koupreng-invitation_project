import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Images, Trash2 } from 'lucide-react';
import { introArtwork, INTRO_PALETTES, normalizeIntro, normalizeIntroUpload } from '../../templates/shared/cinematicIntro';

export default function CinematicIntroEditor({ value, onChange, photos = [], english }) {
  const intro = normalizeIntro(value);
  const artworkStyle = ['golden-calligraphy', 'royal-arch'].includes(intro.style);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [readingArtwork, setReadingArtwork] = useState(false);
  const artworkRequest = useRef(0);
  useEffect(() => () => { artworkRequest.current++; }, []);
  const t = (en, km) => english ? en : km;
  const set = patch => onChange(previous => ({ ...normalizeIntro(previous), ...patch }));
  const changeArtwork = patch => { artworkRequest.current++; setReadingArtwork(false); setError(''); set(patch); };
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
  async function replaceArtwork(source) {
    if (!source) return;
    const request = ++artworkRequest.current;
    setReadingArtwork(true); setError('');
    try {
      const file = await normalizeIntroUpload(source);
      const src = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Could not read artwork')); reader.readAsDataURL(file); });
      if (request === artworkRequest.current) set({ artworkSrc: src, ...(intro.style === 'royal-arch' ? { titleMode: 'artwork' } : {}) });
    } catch { if (request === artworkRequest.current) setError(t('Choose a readable JPEG, PNG or WebP artwork under 5 MB. Transparent PNG or WebP is best.', 'សូមជ្រើសរើសរូបភាព JPEG, PNG ឬ WebP ក្រោម 5 MB។ រូបភាព PNG ឬ WebP ដែលមានផ្ទៃថ្លាគឺល្អបំផុត។')); }
    finally { if (request === artworkRequest.current) setReadingArtwork(false); }
  }
  return <section className="studio-intro-editor" aria-label={t('Cinematic intro', 'ការបើកធៀបបែបភាពយន្ត')}>
    <label className="studio-inline-check"><input type="checkbox" checked={intro.enabled} onChange={e => set({ enabled: e.target.checked })} />{t('Enable cinematic intro', 'បើកការបើកធៀបបែបភាពយន្ត')}</label>
    <label>{t('Opening style', 'រចនាប័ទ្មការបើក')}<select value={intro.style} onChange={e => set({ style: e.target.value })}><option value="royal-arch">{t('Royal photographic arch', 'ស៊ុមមាសរាជជាមួយរូបថត')}</option><option value="golden-calligraphy">{t('Golden calligraphy', 'អក្សរផ្ចង់ពណ៌មាស')}</option><option value="oval">{t('Carved ivory oval', 'ស៊ុមពងក្រពើភ្លុក')}</option><option value="minimal">{t('Typography only', 'អក្សរតែប៉ុណ្ណោះ')}</option></select></label>
    {intro.style === 'royal-arch' && <fieldset className="studio-opening-artwork"><legend>{t('Entrance', 'ទំព័របើកធៀប')}</legend>
      <img className="studio-opening-artwork-preview" src="/templates/royal-garden/v3/opening/arch-640.webp" alt={t('Royal arch preset', 'គំរូស៊ុមរាជ')} />
      {[['entranceFrameEnabled', 'Show gold arch', 'បង្ហាញស៊ុមមាស'], ['guestFrameEnabled', 'Show guest-name frame', 'បង្ហាញស៊ុមឈ្មោះភ្ញៀវ']].map(([key, en, km]) => <label className="studio-inline-check" key={key}><input type="checkbox" checked={intro[key] !== false} onChange={e => set({ [key]: e.target.checked })} />{t(en, km)}</label>)}
      <label>{t('Ceremonial heading', 'ចំណងជើងមង្គលការ')}<select value={intro.titleMode || (introArtwork(intro) ? 'artwork' : 'text')} onChange={e => set({ titleMode: e.target.value })}><option value="text">{t('Editable Khmer title', 'ចំណងជើងខ្មែរដែលអាចកែបាន')}</option><option value="artwork">{t('Golden calligraphy artwork', 'រូបអក្សរផ្ចង់ពណ៌មាស')}</option></select></label>
      <label>{t('Arch scale', 'ទំហំស៊ុម')}<input type="range" min=".85" max="1.1" step=".05" value={intro.entranceFrameScale ?? 1} onChange={e => set({ entranceFrameScale: Number(e.target.value) })} /></label>
      <label>{t('Arch alignment', 'តម្រឹមស៊ុម')}<select value={intro.entranceFramePosition || 'center'} onChange={e => set({ entranceFramePosition: e.target.value })}>{['upper', 'center', 'lower'].map((value, i) => <option key={value} value={value}>{t(['Upper', 'Center', 'Lower'][i], ['ខាងលើ', 'កណ្ដាល', 'ខាងក្រោម'][i])}</option>)}</select></label>
      <label>{t('Cover horizontal focal point', 'ចំណុចផ្ដេករូបក្រប')}<input type="range" min="0" max="100" value={intro.coverX ?? 50} onChange={e => set({ coverX: Number(e.target.value) })} /></label>
      <label>{t('Cover vertical focal point', 'ចំណុចបញ្ឈររូបក្រប')}<input type="range" min="0" max="100" value={intro.coverY ?? 40} onChange={e => set({ coverY: Number(e.target.value) })} /></label>
      <label>{t('Couple photo zoom', 'ទំហំពង្រីករូបគូស្វាមីភរិយា')}<input type="range" min="1" max="1.4" step=".05" value={intro.coverZoom ?? 1.1} onChange={e => set({ coverZoom: Number(e.target.value) })} /></label>
      <label>{t('Title placement', 'ទីតាំងចំណងជើង')}<select value={intro.titlePlacement || 'center'} onChange={e => set({ titlePlacement: e.target.value })}><option value="upper">{t('Upper', 'ខាងលើ')}</option><option value="center">{t('Center', 'កណ្ដាល')}</option></select></label>
      <label>{t('Cover button style', 'រចនាប៊ូតុងក្រប')}<select value={intro.buttonStyle || (intro.buttonArtwork === false ? 'circle' : 'artwork')} onChange={e => set({ buttonStyle: e.target.value })}><option value="artwork">{t('Original gold invitation artwork', 'រូបប៊ូតុងអញ្ជើញពណ៌មាសដើម')}</option><option value="text">{t('Localized text button', 'ប៊ូតុងអក្សរតាមភាសា')}</option><option value="circle">{t('Circular play control', 'ប៊ូតុងចាក់រាងមូល')}</option></select></label>
      <label>{t('Opening button label', 'អក្សរប៊ូតុងបើក')}<input maxLength={100} value={intro.openButtonText ?? ''} placeholder={t('Open invitation', 'បើកធៀបអញ្ជើញ')} onChange={e => set({ openButtonText: e.target.value })} /></label>
    </fieldset>}
    {artworkStyle && <fieldset className="studio-opening-artwork"><legend>{t('Opening artwork', 'រូបសិល្បៈការបើក')}</legend>
      {introArtwork(intro) ? <img className="studio-opening-artwork-preview" src={introArtwork(intro)} alt={intro.artworkAlt || t('Golden opening artwork preview', 'មើលរូបសិល្បៈពណ៌មាសជាមុន')} /> : <p>{t('Artwork is cleared. Your names and date still appear as editable text.', 'បានលុបរូបសិល្បៈ។ ឈ្មោះ និងកាលបរិច្ឆេទនៅតែបង្ហាញជាអក្សរដែលអាចកែបាន។')}</p>}
      <label className="studio-intro-upload">{readingArtwork ? t('Reading artwork…', 'កំពុងអានរូបសិល្បៈ…') : t('Upload opening artwork', 'បញ្ចូលរូបសិល្បៈការបើក')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={readingArtwork} onChange={e => { replaceArtwork(e.target.files?.[0]); e.target.value = ''; }} /></label>
      <label>{t('Artwork description', 'ពិពណ៌នារូបសិល្បៈ')}<input maxLength={300} value={intro.artworkAlt} onChange={e => set({ artworkAlt: e.target.value })} /></label>
      <div className="studio-reorder"><button type="button" onClick={() => changeArtwork({ artworkSrc: '', artworkAlt: '' })}>{t('Remove opening artwork', 'លុបរូបសិល្បៈការបើក')}</button><button type="button" onClick={() => changeArtwork({ artworkSrc: undefined, artworkAlt: '' })}>{t('Use default golden artwork', 'ប្រើរូបសិល្បៈពណ៌មាសដើម')}</button></div>
      <label>{t('Artwork scale', 'ទំហំរូបសិល្បៈ')}<input type="range" min=".65" max="1.2" step=".05" value={intro.artworkScale} onChange={e => set({ artworkScale: Number(e.target.value) })} /></label>
      <label>{t('Artwork position', 'ទីតាំងរូបសិល្បៈ')}<select value={intro.artworkPosition} onChange={e => set({ artworkPosition: e.target.value })}><option value="upper">{t('Upper', 'ខាងលើ')}</option><option value="center">{t('Center', 'កណ្ដាល')}</option><option value="lower">{t('Lower', 'ខាងក្រោម')}</option></select></label>
      <label>{t('Opening animation', 'ចលនាការបើក')}<select value={intro.animationPreset} onChange={e => set({ animationPreset: e.target.value })}><option value="gentle">{t('Gentle butterfly float', 'ចលនាមេអំបៅស្រាល')}</option><option value="shimmer">{t('Soft light sweep', 'ពន្លឺឆ្លុះស្រាល')}</option><option value="still">{t('Still reveal', 'បង្ហាញស្ងប់')}</option></select></label>
    </fieldset>}
    {intro.style === 'golden-calligraphy' && <label>{t('Opening palette', 'ពណ៌ការបើក')}<select value={intro.palette} onChange={e => set({ palette: e.target.value })}>{INTRO_PALETTES.map((key, i) => <option key={key} value={key}>{t(['Ivory Royal', 'Emerald Gold', 'Burgundy Romance'][i], ['ភ្លុករាជ', 'បៃតងនិងមាស', 'ក្រហមប៊ឺហ្គុនឌី'][i])}</option>)}</select></label>}
    {(!artworkStyle || !introArtwork(intro) || (intro.style === 'royal-arch' && intro.titleMode === 'text')) && <label>{t('Intro heading', 'ចំណងជើងការបើក')}<input maxLength={300} value={intro.heading ?? ''} placeholder={t('Use invitation title', 'តាមចំណងជើងធៀប')} onChange={e => set({ heading: e.target.value })} /></label>}
    <label>{t('Intro subtitle', 'ចំណងជើងរង')}<input maxLength={500} value={intro.subtitle ?? ''} onChange={e => set({ subtitle: e.target.value })} /></label>
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
    {[...((!artworkStyle || !introArtwork(intro)) ? [['showSaveTheDate', 'Show Save the Date', 'បង្ហាញ Save the Date']] : []), ['music', 'Start selected music when opened', 'ចាប់ផ្ដើមតន្ត្រីនៅពេលបើក'], ['reducedMotion', 'Preview with reduced motion', 'មើលជាមុនដោយកាត់បន្ថយចលនា']].map(([key, en, km]) => <label className="studio-inline-check" key={key}><input type="checkbox" checked={intro[key]} onChange={e => set({ [key]: e.target.checked })} />{t(en, km)}</label>)}
  </section>;
}
