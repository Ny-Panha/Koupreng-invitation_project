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
  const clear = backgroundAsset => { request.current++; setReading(false); setError(''); set({ backgroundAsset }); };
  async function upload(file) {
    if (!file) return;
    const id = ++request.current; setReading(true); setError('');
    try {
      const normalized = await normalizeIntroUpload(file);
      const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(normalized); });
      if (id === request.current) latest.current.update('informationScene', { ...latest.current.value, backgroundAsset: source, enabled: true });
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
      <label className="studio-inline-check"><input type="checkbox" checked={settings.information.footer} onChange={e => set({ footerEnabled: e.target.checked })} />{t('Show information footer ornament', 'បង្ហាញលម្អខាងក្រោមព័ត៌មាន')}</label>
    </fieldset>
    <fieldset><legend>{t('Motion', 'ចលនា')}</legend>
      <p>{t('Shared by the entrance and information scenes. Motion pauses in hidden tabs and is disabled for reduced motion or Save-Data.', 'ប្រើសម្រាប់ទំព័របើក និងព័ត៌មាន។ ចលនាផ្អាកពេលប្ដូរផ្ទាំង និងបិទពេលកាត់បន្ថយចលនា ឬសន្សំទិន្នន័យ។')}</p>
      <label>{t('Effect intensity', 'កម្រិតចលនាលម្អ')}<select value={settings.motion.preset} onChange={e => set({ motionPreset: e.target.value })}>{MOTION_PRESETS.map((key, i) => <option key={key} value={key}>{t(['Off', 'Subtle', 'Balanced', 'Cinematic'][i], ['បិទ', 'ស្រាល', 'មធ្យម', 'បែបភាពយន្ត'][i])}</option>)}</select></label>
      {[['sparkles', 'Gold sparkles', 'ផ្កាយមាស'], ['petals', 'Floating petals', 'ផ្កាអណ្ដែត'], ['goldDust', 'Gold dust', 'លម្អមាស'], ['butterfly', 'Butterfly', 'មេអំបៅ']].map(([key, en, km]) => <label className="studio-inline-check" key={key}><input type="checkbox" checked={settings.motion[key]} onChange={e => set({ effects: { ...value.effects, [key]: e.target.checked } })} />{t(en, km)}</label>)}
    </fieldset>
  </section>;
}
