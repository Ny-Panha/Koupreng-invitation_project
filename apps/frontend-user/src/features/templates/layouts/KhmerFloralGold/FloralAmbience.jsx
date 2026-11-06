const root = '/templates/khmer-floral-gold/effects/realistic';
const butterflies = ['amber', 'blue', 'violet', 'ivory'];
const petals = [[5,17.2,2], [13,16.8,9], [22,17.2,14], [30,18,5], [39,17.2,11], [47,16.8,3], [55,18,15], [64,17.2,7], [72,16.8,12], [80,18,1], [89,17.2,10], [97,16.8,6], [18,18,4], [58,17.2,13], [84,16.8,8]];
const flights = [8,24,46,67,84,17,37,59,76,12,51,91,29,63,81];

export function FloralSceneBackdrop({ enabled }) {
  return enabled ? <div className="kfg-scene-backdrop" aria-hidden="true" inert><img src={`${root}/white-blossom-paper.jpg`} width="1600" height="1067" alt="" decoding="async" draggable={false} /></div> : null;
}

export function FloralSceneCorners({ enabled }) {
  return <div className="kfg-scene-blossoms" data-effect="blossom-wind" aria-hidden="true" inert hidden={!enabled}>
    {enabled && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => <div key={corner} className={`kfg-blossom-corner kfg-blossom-corner--${corner}`}><img src={`${root}/blossom-branch.webp`} width="1536" height="1024" alt="" decoding="async" draggable={false} /></div>)}
  </div>;
}

/** Three source-inspired, photorealistic raster effects; no decoded-video loop. */
export default function FloralAmbience({ enabled, paused = false, motion = 'elegant', petalCount = 12, butterflyCount = 12 }) {
  return <div className="kfg-petals kfg-ambience" aria-hidden="true" inert hidden={!enabled} data-intensity={motion} data-source-effects="realistic" data-source-paused={paused}>
    {enabled && <>
      <div className="kfg-realistic-petals" data-effect="petal-rain">{petals.slice(0,petalCount).map(([x, duration, delay], index) => <img key={index} className="kfg-realistic-petal" src={`${root}/petal-${index % 6 + 1}.webp`} width="512" height="512" alt="" decoding="async" draggable={false} style={{ '--petal-x': `${x}%`, '--petal-duration': `${duration}s`, '--petal-delay': `${-delay}s`, '--petal-size': `${22 + index % 3 * 4}px` }} />)}</div>
      <div className="kfg-realistic-butterflies" data-effect="butterfly-flight">{flights.slice(0,butterflyCount).map((y, index) => <div className="kfg-realistic-flight" key={index} data-side={index % 2 ? 'right' : 'left'} data-butterfly={butterflies[index % 4]} style={{ '--flight-y': y, '--flight-delay': `${-index * 1.34}s`, '--wing-delay': `${-index * .09}s`, '--flight-direction': index % 2 ? 'reverse' : 'normal', '--butterfly-size': `${26 + index % 4 * 3}px` }}>
        {['left', 'right', 'body'].map(part => <img key={part} className={`kfg-realistic-wing kfg-realistic-wing--${part}`} src={`${root}/butterfly-${butterflies[index % 4]}.webp`} width="768" height="512" alt="" decoding="async" draggable={false} />)}
      </div>)}</div>
    </>}
  </div>;
}
