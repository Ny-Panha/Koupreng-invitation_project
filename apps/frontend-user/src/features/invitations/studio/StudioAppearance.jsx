const PALETTES = [
  ["Heritage gold", "#214f3b", "#a77d3e", "#2d332c", "#f7f2e8", "#c7aa71"],
  ["Royal burgundy", "#722f40", "#b38b48", "#342a2a", "#fff8ef", "#d7b991"],
  ["Emerald", "#164637", "#b49150", "#26392e", "#f3f6ef", "#a7bca9"],
  ["Lotus rose", "#8b4f67", "#b07d6a", "#433238", "#fff4f1", "#d8b4bd"],
  ["Midnight blue", "#243c60", "#aa8e54", "#233042", "#f4f5f9", "#acb9cb"],
  ["Ivory", "#665a43", "#9e804c", "#38352f", "#fffdf5", "#d8cbb0"],
];
const COLORS = [["primary", "ពណ៌ចម្បង · Primary"], ["accent", "ពណ៌លម្អ · Accent"], ["text", "អក្សរ · Text"], ["background", "ផ្ទៃខាងក្រោយ · Background"], ["border", "ស៊ុម · Border"]];

export default function StudioAppearance({ form, update, supportsPalette }) {
  if (!supportsPalette) return null;
  const style = form.studioStyle || {};
  const set = (key, value) => update("studioStyle", { ...style, [key]: value });
  return <section className="pe-section-card studio-appearance" aria-label="Appearance controls">
    <h4 className="pe-section-heading">រចនា និងអក្សរ · Appearance</h4>
    {supportsPalette && <>
      <label className="pe-label">ឈុតពណ៌ · Palette<select className="pe-input" value="" onChange={e => {
        const palette = PALETTES[Number(e.target.value)];
        if (palette) update("studioStyle", { ...style, ...Object.fromEntries(COLORS.map(([key], index) => [key, palette[index + 1]])) });
      }}><option value="" disabled>Choose a palette</option>{PALETTES.map((palette, i) => <option key={palette[0]} value={i}>{palette[0]}</option>)}</select></label>
      <div className="studio-color-grid">{COLORS.map(([key, label], index) => <label key={key}>{label}<input type="color" value={style[key] || PALETTES[0][index + 1]} onChange={e => set(key, e.target.value)} /></label>)}</div>
    </>}
    <label className="pe-label">អក្សរចំណងជើងខ្មែរ · Khmer heading<select className="pe-input" value={form.fontKhmer || ""} onChange={e => update("fontKhmer", e.target.value)}><option value="">Template default</option><option>Moul</option><option>Bayon</option><option>Kantumruy Pro</option></select></label>
    <label className="pe-label">Latin heading<select className="pe-input" value={form.fontLatin || ""} onChange={e => update("fontLatin", e.target.value)}><option value="">Template default</option><option>Cormorant Garamond</option><option>DM Sans</option></select></label>
    {supportsPalette && <>
      <label className="pe-label">អក្សរអត្ថបទ · Body font<select className="pe-input" value={style.bodyFont || ""} onChange={e => set("bodyFont", e.target.value)}><option value="">Template default</option><option>Kantumruy Pro</option><option>DM Sans</option></select></label>
      <label className="pe-label">ទំហំសារ · Message size<select className="pe-input" value={style.messageSize || "normal"} onChange={e => set("messageSize", e.target.value)}><option value="small">Small</option><option value="normal">Standard</option><option value="large">Large</option></select></label>
      <label className="pe-label">តម្រឹមសារ · Message alignment<select className="pe-input" value={style.align || "center"} onChange={e => set("align", e.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
      <label className="pe-label">ចំណុចរូបគូស្វាមីភរិយា · Portrait focal point<input type="range" min="0" max="100" value={style.portraitY ?? 50} onChange={e => set("portraitY", Number(e.target.value))} /></label>
    </>}
    <button type="button" className="pe-btn-upload-action" onClick={() => { if (window.confirm("Restore the template's original appearance?")) { update("studioStyle", {}); update("fontKhmer", ""); update("fontLatin", ""); } }}>Reset appearance</button>
  </section>;
}
