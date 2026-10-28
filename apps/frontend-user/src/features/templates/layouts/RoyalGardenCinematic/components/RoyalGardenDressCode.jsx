import { royalDressColors } from '../model/royalGardenGuestPresentation';

export default function RoyalGardenDressCode({ content, english }) {
  const code = content.dressCode || {};
  const colors = royalDressColors(content);
  return <div className="rg-dress-code">
    {(code.name || code.style) && <p className="rg-dress-style">{[code.name, code.style].filter(Boolean).join(' · ')}</p>}
    {code.description && <p className="rg-copy">{code.description}</p>}
    {colors.length > 0 && <ul aria-label={english ? 'Suggested clothing colors' : 'ពណ៌សម្លៀកបំពាក់ដែលបានណែនាំ'}>{colors.map((color, index) => <li key={index}><span className="rg-dress-swatch" style={{ backgroundColor: color.hex }} aria-hidden="true" /><span>{color.name || color.hex}</span></li>)}</ul>}
  </div>;
}
