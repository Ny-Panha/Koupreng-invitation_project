import { useEffect, useRef, useState } from 'react';
import { normalizeIntroUpload } from '../../templates/shared/cinematicIntro';
import { MOTION_PRESETS, ROYAL_ASSETS, royalGardenPresentation } from '../../templates/layouts/RoyalGardenCinematic/model/royalGardenPresentation';
const EMPTY = {};

export default function RoyalGardenSceneEditor({ form, update, english }) {
  const value = form.informationScene || EMPTY, settings = royalGardenPresentation(form);
  const [error, setError] = useState(''), [reading, setReading] = useState(false), request = useRef(0);
  const latest = useRef({ value, update });
  useEffect(() => { latest.current = { value, update }; }, [value, update]);
  useEffect(() => () => { request.current++; }, []);
  const t = (en, km) => english ? en : km;
  const set = patch => update('informationScene', { ...value, ...patch });
  const cancelUpload = patch => { request.current++; setReading(false); setError(''); set(patch); };
  const clear = backgroundAsset => cancelUpload({ backgroundAsset });
  async function upload(file, target = 'background') {
    if (!file) return;
    const id = ++request.current; setReading(true); setError('');
    try {
      const normalized = await normalizeIntroUpload(file);
      const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(normalized); });
      if (id === request.current) {
        const current = latest.current.value;
        const patch = target === 'monogram' ? { monogram: { ...current.monogram, mode: 'custom', asset: source } } : target === 'videoArtwork' ? { video: { ...current.video, artworkSrc: source, artworkEnabled: true } } : { backgroundAsset: source, enabled: true };
        latest.current.update('informationScene', { ...current, ...patch });
      }
    } catch { if (id === request.current) setError(t('Choose a readable JPEG, PNG or WebP image under 5 MB.', 'សូមជ្រើសរើសរូបភាព JPEG, PNG ឬ WebP ក្រោម 5 MB។')); }
    finally { if (id === request.current) setReading(false); }
  }
  return <section className="studio-royal-scenes" aria-label={t('Royal Garden scenes', 'ទិដ្ឋភាពសួនរាជ')}>
    <fieldset><legend>{t('Information background', 'ផ្ទៃក្រោយព័ត៌មាន')}</legend>
      <div className="studio-royal-presets"><button type="button" aria-pressed={settings.information.enabled && value.backgroundAsset === undefined} onClick={() => set({ enabled: true, backgroundAsset: undefined, fixedBackground: true })}><img src={ROYAL_ASSETS.informationSmall} alt="" width="80" height="142" />{t('Royal blue & gold', 'ខៀវរាជ និងមាស')}</button><button type="button" aria-pressed={!settings.information.enabled} onClick={() => set({ enabled: false })}>{t('Original ivory', 'ភ្លុកដើម')}</button></div>
      <label className="studio-inline-check"><input type="checkbox" checked={settings.information.enabled} onChange={e => set({ enabled: e.target.checked })} />{t('Use royal information background', 'ប្រើផ្ទៃក្រោយព័ត៌មានរាជ')}</label>
      <label className="studio-inline-check"><input type="checkbox" checked={settings.information.fixed} onChange={e => set({ fixedBackground: e.target.checked })} />{t('Keep background fixed while scrolling', 'រក្សាផ្ទៃក្រោយនៅថេរពេលរំកិល')}</label>
      <label>{t('Upload information background', 'បញ្ចូលផ្ទៃក្រោយព័ត៌មាន')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={reading} onChange={event => { upload(event.target.files?.[0]); event.target.value = ''; }} /></label>
      <div className="studio-reorder"><button type="button" onClick={() => clear('')}>{t('Remove background art', 'ដករូបផ្ទៃក្រោយ')}</button><button type="button" onClick={() => clear(undefined)}>{t('Restore royal background', 'ស្ដារផ្ទៃក្រោយរាជ')}</button></div>
      {reading && <p role="status">{t('Reading image…', 'កំពុងអានរូបភាព…')}</p>}{error && <p role="alert">{error}</p>}
      <label>{t('Background alignment', 'តម្រឹមផ្ទៃក្រោយ')}<select value={settings.information.position} onChange={e => set({ backgroundPosition: e.target.value })}>{['top', 'center', 'bottom'].map((key, i) => <option value={key} key={key}>{t(['Top', 'Center', 'Bottom'][i], ['ខាងលើ', 'កណ្ដាល', 'ខាងក្រោម'][i])}</option>)}</select></label>
      <label>{t('Background shade', 'ស្រមោលផ្ទៃក្រោយ')}<input type="range" min="0" max=".8" step=".05" value={settings.information.overlay} onChange={e => set({ contentOverlay: Number(e.target.value) })} /></label>
      <label>{t('Text shade', 'កម្រិតផ្ទៃអត្ថបទ')}<input type="range" min="0" max="1" step=".05" value={settings.information.panelOpacity} onChange={e => set({ panelOpacity: Number(e.target.value) })} /></label>
      <label>{t('Section reveal', 'ការបង្ហាញផ្នែក')}<select value={settings.information.reveal} onChange={e => set({ sectionReveal: e.target.value })}>{['rise', 'fade', 'none'].map((key, i) => <option value={key} key={key}>{t(['Gentle rise', 'Fade', 'Still'][i], ['ឡើងស្រាល', 'បង្ហាញស្រាល', 'គ្មានចលនា'][i])}</option>)}</select></label>
      <label>{t('Information spacing', 'គម្លាតព័ត៌មាន')}<select value={settings.information.spacing} onChange={e => set({ spacing: e.target.value })}><option value="compact">{t('Compact', 'បង្រួម')}</option><option value="balanced">{t('Balanced', 'សមរម្យ')}</option><option value="airy">{t('Spacious', 'ទូលាយ')}</option></select></label>
      <label>{t('Closing signature', 'សញ្ញាសម្គាល់ចុងក្រោយ')}<select value={settings.information.brandStyle} onChange={e => set({ brandStyle: e.target.value })}><option value="logo">{t('Koupreng logo and text', 'រូបសញ្ញា Koupreng និងអក្សរ')}</option><option value="text">{t('Koupreng text', 'អក្សរ Koupreng')}</option></select></label>
    </fieldset>
    <fieldset><legend>{t('Wedding monogram', 'រូបសញ្ញាគូស្វាមីភរិយា')}</legend>
      <label>{t('Monogram mode', 'របៀបរូបសញ្ញា')}<select value={settings.monogram.mode} onChange={e => set({ monogram: { ...value.monogram, mode: e.target.value } })}>{[['auto','Automatic: owner initials / approved demo art','ស្វ័យប្រវត្តិ៖ អក្សរដើមឈ្មោះម្ចាស់ធៀប'],['artwork','Supplied gold រ ល artwork','រូបអក្សរមាស រ ល'],['custom','Uploaded monogram','រូបសញ្ញាដែលបានបញ្ចូល'],['initials','Live initials','អក្សរដើមឈ្មោះ'],['hidden','Hidden','លាក់']].map(([mode,en,km]) => <option value={mode} key={mode}>{t(en,km)}</option>)}</select></label>
      <p>{t('The supplied crest contains fixed រ ល initials. Other couples use their own initials unless they deliberately choose that artwork.', 'រូបសញ្ញាដើមមានអក្សរ រ ល ជាប់លាប់។ គូផ្សេងប្រើអក្សរដើមឈ្មោះរបស់ខ្លួន លុះត្រាតែជ្រើសរើសរូបនេះដោយចេតនា។')}</p>
      <label>{t('Upload custom monogram', 'បញ្ចូលរូបសញ្ញាផ្ទាល់ខ្លួន')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={reading} onChange={event => { upload(event.target.files?.[0], 'monogram'); event.target.value=''; }} /></label>
      <button type="button" onClick={() => cancelUpload({ monogram: { ...value.monogram, mode:'custom', asset:'' } })}>{t('Clear custom monogram', 'លុបរូបសញ្ញាផ្ទាល់ខ្លួន')}</button>
      <label>{t('Monogram scale', 'ទំហំរូបសញ្ញា')}<input type="range" min=".7" max="1.2" step=".05" value={settings.monogram.scale} onChange={e => set({ monogram: { ...value.monogram, scale:Number(e.target.value) } })} /></label>
      <label>{t('Video crest vertical position', 'ទីតាំងបញ្ឈររូបសញ្ញាលើវីដេអូ')}<input type="range" min="0" max="18" value={settings.monogram.positionY} onChange={e => set({ monogram: { ...value.monogram, positionY:Number(e.target.value) } })} /></label>
    </fieldset>
    <fieldset><legend>{t('Film calligraphy and event date', 'អក្សរផ្ចង់ និងកាលបរិច្ឆេទលើវីដេអូ')}</legend>
      <label className="studio-inline-check"><input type="checkbox" checked={settings.video.artworkEnabled} onChange={e => set({ video:{...value.video,artworkEnabled:e.target.checked} })} />{t('Show film calligraphy','បង្ហាញអក្សរផ្ចង់លើវីដេអូ')}</label>
      <label>{t('Upload film calligraphy','បញ្ចូលអក្សរផ្ចង់វីដេអូ')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={reading} onChange={event => { upload(event.target.files?.[0],'videoArtwork'); event.target.value=''; }} /></label>
      <div className="studio-reorder"><button type="button" onClick={() => cancelUpload({ video:{...value.video,artworkSrc:''} })}>{t('Clear film artwork','លុបរូបអក្សរផ្ចង់វីដេអូ')}</button><button type="button" onClick={() => cancelUpload({ video:{...value.video,artworkSrc:undefined,artworkEnabled:true} })}>{t('Restore supplied film artwork','ស្ដាររូបអក្សរផ្ចង់វីដេអូដើម')}</button></div>
      <label className="studio-inline-check"><input type="checkbox" checked={settings.video.dateEnabled} onChange={e => set({ video:{...value.video,dateEnabled:e.target.checked} })} />{t('Show event date beneath calligraphy','បង្ហាញកាលបរិច្ឆេទក្រោមអក្សរផ្ចង់')}</label>
      <label>{t('Film date typography','ពុម្ពអក្សរកាលបរិច្ឆេទវីដេអូ')}<select value={settings.video.dateFont} onChange={e => set({ video:{...value.video,dateFont:e.target.value} })}><option value="moul">Moul</option><option value="battambang">Battambang</option><option value="kantumruy">Kantumruy Pro</option></select></label>
      <label className="studio-inline-check"><input type="checkbox" checked={settings.video.showTime} onChange={e => set({ video:{...value.video,showTime:e.target.checked} })} />{t('Include event time','បង្ហាញម៉ោងកម្មវិធី')}</label>
      <p>{t('Date and time follow Event Information; there is no separate film date.', 'កាលបរិច្ឆេទ និងម៉ោងយកតាមព័ត៌មានកម្មវិធី។ គ្មានកាលបរិច្ឆេទវីដេអូដាច់ដោយឡែកទេ។')}</p>
    </fieldset>
    <fieldset><legend>{t('Motion', 'ចលនា')}</legend>
      <p>{t('Shared by the entrance and information scenes. Motion pauses in hidden tabs and is disabled for reduced motion or Save-Data.', 'ប្រើសម្រាប់ទំព័របើក និងព័ត៌មាន។ ចលនាផ្អាកពេលប្ដូរផ្ទាំង និងបិទពេលកាត់បន្ថយចលនា ឬសន្សំទិន្នន័យ។')}</p>
      <label>{t('Effect intensity', 'កម្រិតចលនាលម្អ')}<select value={settings.motion.preset} onChange={e => set({ motionPreset: e.target.value })}>{MOTION_PRESETS.map((key, i) => <option key={key} value={key}>{t(['Off', 'Subtle', 'Balanced', 'Cinematic'][i], ['បិទ', 'ស្រាល', 'មធ្យម', 'បែបភាពយន្ត'][i])}</option>)}</select></label>
      {[['sparkles', 'Gold sparkles', 'ផ្កាយមាស'], ['petals', 'Floating petals', 'ផ្កាអណ្ដែត'], ['goldDust', 'Gold dust', 'លម្អមាស'], ['butterfly', 'Butterfly', 'មេអំបៅ']].map(([key, en, km]) => <label className="studio-inline-check" key={key}><input type="checkbox" checked={settings.motion[key]} onChange={e => set({ effects: { ...value.effects, [key]: e.target.checked } })} />{t(en, km)}</label>)}
    </fieldset>
  </section>;
}
