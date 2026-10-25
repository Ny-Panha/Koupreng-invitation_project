import { celestialFont } from '@/features/templates/layouts/KhmerCelestial/celestialTypography';

const KHMER = ['Moul', 'Bayon', 'Kantumruy Pro', 'Battambang'];
const LATIN = ['Cormorant Garamond', 'DM Sans'];
export default function StudioFontPreview({ form, update, english }) {
  return <div className="studio-font-preview">
    {[
      ['fontKhmer', KHMER, english ? 'Khmer heading' : 'អក្សរចំណងជើងខ្មែរ'],
      ['fontLatin', LATIN, english ? 'Latin heading' : 'អក្សរចំណងជើងឡាតាំង'],
    ].map(([key, fonts, label]) => <label className="pe-label" key={key}>{label}<select className="pe-input" value={form[key] || ''} onChange={event => update(key, event.target.value)}>
      <option value="">{english ? 'Template default' : 'តាមគំរូដើម'}</option>
      {form[key] && !fonts.includes(form[key]) && <option value={form[key]}>{form[key]} · {english ? 'Saved font' : 'អក្សរដែលបានរក្សាទុក'}</option>}
      {fonts.map(font => <option key={font}>{font}</option>)}
    </select></label>)}
    <figure aria-label={english ? 'Font preview' : 'មើលអក្សរជាមុន'}>
      <p lang="km" style={{ fontFamily: celestialFont(form.fontKhmer || 'Moul') }}>សិរីសួស្តីអាពាហ៍ពិពាហ៍</p>
      <p lang="km" style={{ fontFamily: celestialFont(form.fontKhmer || 'Moul') }}>{form.groomName || 'សុវណ្ណ វិសាល'} និង {form.brideName || 'សុភ័ក្រ ស្រីពេជ្រ'}</p>
      <p lang="en" style={{ fontFamily: `${JSON.stringify(form.fontLatin || 'Cormorant Garamond')}, Georgia, serif` }}>Together with our families · ១២ / 12</p>
      <figcaption>{english ? 'Your saved choice stays intact if a font is unavailable. A local Khmer font provides the fallback.' : 'ជម្រើសអក្សរដែលរក្សាទុកនៅដដែល ទោះមិនអាចផ្ទុកអក្សរបានក៏ដោយ។'}</figcaption>
    </figure>
  </div>;
}
