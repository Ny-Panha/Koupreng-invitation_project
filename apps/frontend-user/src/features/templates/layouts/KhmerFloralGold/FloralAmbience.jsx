const root = '/templates/khmer-floral-gold/effects';
// Downloaded CC0 raster sources; see V5_ASSETS.md and V5_EFFECT_SOURCES.json.
const textures = { heart: 'blush-heart.webp', star: 'gold-star.webp' };
const petalLanes = [[9,24,3], [24,29,17], [37,26,8], [52,31,23], [65,25,14], [79,28,5], [92,27,20]];
const particles = [
  ['butterfly', 12, 12, 'golden-butterfly.webp'], ['heart', 50, 58], ['star', 8, 72],
  ['butterfly', 34, 31, 'pink-butterfly.webp'], ['star', 70, 18], ['heart', 84, 42],
  ['butterfly', 61, 54, 'blue-butterfly.webp'], ['star', 92, 45], ['heart', 69, 20],
  ['butterfly', 83, 6, 'violet-butterfly.webp'],
];

export default function FloralAmbience({ enabled, motion = 'elegant' }) {
  return <div className="kfg-petals kfg-ambience" aria-hidden="true" inert hidden={!enabled} data-intensity={motion}>
    {enabled && <div className="kfg-lotus-rain" data-petal-count="7">{petalLanes.map(([x, duration, delay], index) => <img key={index} className="kfg-lotus-petal" src={`${root}/lotus-petal.webp`} alt="" width="44" height="128" decoding="async" draggable={false} style={{ '--petal-x': `${x}%`, '--petal-duration': `${duration}s`, '--petal-delay': `${-delay}s`, '--petal-size': `${14 + index % 4 * 2}px` }} />)}</div>}
    {enabled && particles.map(([kind, x, y, texture], index) => <span key={index} className={`kfg-ambient-particle kfg-ambient-${kind}`} data-zone={x > 28 && x < 72 ? 'center' : 'outer'}
      style={{ '--ambient-x': `${x}%`, '--ambient-delay': `${-index * 2.7}s`, '--ambient-duration': `${18 + index % 4 * 3}s`, '--ambient-top': `${y}%`, '--flight-direction': index % 2 ? -1 : 1 }}>
      <img src={`${root}/${texture || textures[kind]}`} alt="" width={kind === 'butterfly' ? 160 : 96} height={kind === 'butterfly' ? 120 : 96} decoding="async" draggable={false} />
    </span>)}
  </div>;
}
