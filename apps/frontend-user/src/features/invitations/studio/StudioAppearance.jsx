import { feedback } from "@/shared/feedback/feedback";
import { useLanguageStore } from "@/stores/useLanguageStore";
import StudioFontPreview from './StudioFontPreview';
import RoyalGardenSceneEditor from './RoyalGardenSceneEditor';

const PALETTES = [
  ["Heritage gold", "#214f3b", "#a77d3e", "#2d332c", "#f7f2e8", "#c7aa71"],
  ["Royal burgundy", "#722f40", "#b38b48", "#342a2a", "#fff8ef", "#d7b991"],
  ["Emerald", "#164637", "#b49150", "#26392e", "#f3f6ef", "#a7bca9"],
  ["Lotus rose", "#8b4f67", "#b07d6a", "#433238", "#fff4f1", "#d8b4bd"],
  ["Midnight blue", "#243c60", "#aa8e54", "#233042", "#f4f5f9", "#acb9cb"],
  ["Ivory", "#665a43", "#9e804c", "#38352f", "#fffdf5", "#d8cbb0"],
];
const COLORS = [["primary", "ពណ៌ចម្បង", "Primary"], ["accent", "ពណ៌លម្អ", "Accent"], ["text", "អក្សរ", "Text"], ["background", "ផ្ទៃខាងក្រោយ", "Background"], ["border", "ស៊ុម", "Border"]];

export default function StudioAppearance({ form, update, supportsPalette }) {
  const en = useLanguageStore(state => state.lang) === "en";
  const text = (english, khmer) => en ? english : khmer;
  if (!supportsPalette) return <section className="pe-section-card studio-appearance"><StudioFontPreview form={form} update={update} english={en} /></section>;
  const style = form.studioStyle || {};
  const set = (key, value) => update("studioStyle", { ...style, [key]: value });
  return <section className="pe-section-card studio-appearance" aria-label="Appearance controls">
    <h4 className="pe-section-heading">{text("Appearance", "រចនា និងអក្សរ")}</h4>
    {supportsPalette && <>
      <label className="pe-label">{text("Palette", "ឈុតពណ៌")}<select className="pe-input" value="" onChange={e => {
        const palette = PALETTES[Number(e.target.value)];
        if (palette) update("studioStyle", { ...style, ...Object.fromEntries(COLORS.map(([key], index) => [key, palette[index + 1]])) });
      }}><option value="" disabled>{text("Choose a palette", "ជ្រើសរើសឈុតពណ៌")}</option>{PALETTES.map((palette, i) => <option key={palette[0]} value={i}>{palette[0]}</option>)}</select></label>
      <div className="studio-color-grid">{COLORS.map(([key, khmer, english], index) => <label key={key}>{text(english, khmer)}<input type="color" value={style[key] || PALETTES[0][index + 1]} onChange={e => set(key, e.target.value)} /></label>)}</div>
    </>}
    <StudioFontPreview form={form} update={update} english={en} />
    {supportsPalette && <>
      <label className="pe-label">{text("Body font", "អក្សរអត្ថបទ")}<select className="pe-input" value={style.bodyFont || ""} onChange={e => set("bodyFont", e.target.value)}><option value="">{text("Template default", "តាមគំរូដើម")}</option><option>Kantumruy Pro</option><option>DM Sans</option></select></label>
      <label className="pe-label">{text("Message size", "ទំហំសារ")}<select className="pe-input" value={style.messageSize || "normal"} onChange={e => set("messageSize", e.target.value)}><option value="small">{text("Small", "តូច")}</option><option value="normal">{text("Standard", "ធម្មតា")}</option><option value="large">{text("Large", "ធំ")}</option></select></label>
      <label className="pe-label">{text("Message alignment", "តម្រឹមសារ")}<select className="pe-input" value={style.align || "center"} onChange={e => set("align", e.target.value)}><option value="left">{text("Left", "ឆ្វេង")}</option><option value="center">{text("Center", "កណ្ដាល")}</option><option value="right">{text("Right", "ស្ដាំ")}</option></select></label>
      <label className="pe-label">{text("Portrait focal point", "ចំណុចរូបគូស្វាមីភរិយា")}<input type="range" min="0" max="100" value={style.portraitY ?? 50} onChange={e => set("portraitY", Number(e.target.value))} /></label>
      <label className="pe-label">{text('Garden motion', 'ចលនាលម្អសួន')}<select className="pe-input" value={style.motion || 'elegant'} onChange={e => set('motion', e.target.value)}><option value="minimal">{text('Minimal', 'តិចបំផុត')}</option><option value="elegant">{text('Elegant', 'ស្រទន់')}</option><option value="cinematic">{text('Cinematic', 'បែបភាពយន្ត')}</option></select></label>
      {form.templateCode === 'royal-garden-cinematic' || form.templateId === 'royal-garden-cinematic' ? <>
        <RoyalGardenSceneEditor form={form} update={update} english={en} />
        <label className="pe-label">{text('Pattern visibility', 'កម្រិតលំនាំផ្ទៃក្រោយ')}<input type="range" min="0" max="1" step=".05" value={style.patternOpacity ?? .8} onChange={e => set('patternOpacity', Number(e.target.value))} /></label>
        <label className="pe-label">{text('Ornament scale', 'ទំហំលំនាំលម្អ')}<input type="range" min=".6" max="1.5" step=".1" value={style.ornamentScale ?? 1} onChange={e => set('ornamentScale', Number(e.target.value))} /></label>
      </> : null}
    </>}
    <button type="button" className="pe-btn-upload-action" onClick={async () => { if (await feedback.confirm({ message: text("Restore the template's original appearance?", "ស្ដាររចនាដើមរបស់គំរូនេះឬ?"), destructive: true })) { update("studioStyle", {}); update("fontKhmer", ""); update("fontLatin", ""); } }}>{text("Reset appearance", "ស្ដាររចនាដើម")}</button>
  </section>;
}
