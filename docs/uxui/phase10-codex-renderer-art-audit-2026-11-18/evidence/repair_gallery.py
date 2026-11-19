from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
p = ROOT / 'apps/frontend-user/src/features/templates/shared/Gallery/GalleryGrid.jsx'
p.write_text('''import { useState } from 'react';
import { IoCameraOutline } from 'react-icons/io5';
import InvitationLightbox from './InvitationLightbox';

export default function GalleryGrid({ images = [], className = '', itemClassName = '', onImageClick, emptyMessage = 'រូបភាពអនុស្សាវរីយ៍នឹងបង្ហាញនៅទីនេះ' }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const items = (images || []).filter(image => typeof image === 'string' ? image : image?.src || image?.url);
  if (!items.length) return <div className="gallery-empty-state" style={{ textAlign: 'center', padding: '32px 16px', color: 'inherit' }}>
    <IoCameraOutline size={32} style={{ margin: '0 auto 8px' }} aria-hidden="true" /><p style={{ fontSize: 14, margin: 0 }}>{emptyMessage}</p>
  </div>;
  return <>
    <div className={`gallery-grid-root ${className}`}>
      {items.map((image, index) => {
        const src = typeof image === 'string' ? image : image.src || image.url;
        const alt = image.alt || `Photo ${index + 1}`;
        return <button type="button" key={`${src}-${index}`} className={`gallery-item ${itemClassName}`} aria-label={`មើលរូបថត / View ${alt}`} onClick={() => onImageClick ? onImageClick(index, image) : setLightboxIndex(index)} style={{ cursor: 'pointer', padding: 0, border: 0, background: 'transparent', minHeight: 44 }}>
          <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </button>;
      })}
    </div>
    <InvitationLightbox images={items} index={lightboxIndex} onIndexChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} />
  </>;
}
''', encoding='utf-8')
p = ROOT / 'apps/frontend-user/src/features/templates/layouts/DigitalYes/DigitalYesLayout.jsx'
t = p.read_text(encoding='utf-8')
a = t.index('      {/* Lightbox Modal */}')
b = t.index('      {/* Gift QR Modal */}', a)
p.write_text(t[:a] + '      <InvitationLightbox images={tpl.gallery} index={lightboxIndex} onIndexChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} />\n\n' + t[b:], encoding='utf-8')
