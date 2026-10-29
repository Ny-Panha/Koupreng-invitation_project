import { lazy, Suspense, useId, useState } from 'react';
import { safeDirections } from './invitationFeatures';
import './invitation-features.css';
import { MAP_SYMBOL_PATHS } from './mapSymbols';
import { MAP_NODE_TYPES, MAP_THEME_TOKENS, MAP_FONTS, mapSize, bounded } from './illustratedMapModel';

const MapViewerModal = lazy(() => import('@/shared/ui/Modal'));

function labelLines(value, count, locale) {
  const segments = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(value)].map(part => part.segment) : Array.from(value);
  const lines = [];
  if (locale === 'en') {
    let line = '';
    for (const word of value.trim().split(/\s+/).filter(Boolean)) {
      if (line && line.length + word.length + 1 > count) { lines.push(line); line = ''; }
      if (word.length > count) {
        const letters = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(word)].map(part => part.segment) : [word];
        for (let i = 0; i < letters.length; i += count) lines.push(letters.slice(i, i + count).join(''));
      } else line += (line ? ' ' : '') + word;
    }
    if (line) lines.push(line);
  } else if (typeof Intl.Segmenter !== 'function') {
    if (value) lines.push(value); // Keep Khmer clusters intact on older engines.
  } else for (let index = 0; index < segments.length; index += count) lines.push(segments.slice(index, index + count).join(''));
  return lines.length > 3 ? [...lines.slice(0, 2), `${lines[2]}…`] : lines;
}

export function MapDrawing({ value, locale = 'km', selected, svgRef, grid, guides = [], onSelect, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown, transparent = false, ariaHidden = false }) {
  const id = useId();
  const [width, height] = mapSize(value);
  const { background, ink, road, accent, divider } = MAP_THEME_TOKENS[value?.theme] || MAP_THEME_TOKENS.ivory;
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden={ariaHidden || undefined} aria-labelledby={id} tabIndex={onKeyDown ? 0 : undefined} onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}>
    <title id={id}>{value?.description?.[locale] || (locale === 'en' ? 'Illustrative venue diagram' : 'ផែនទីទីតាំងជាគំនូរ')}</title>
    {!transparent && <rect width={width} height={height} rx="16" fill={background} />}
    {['royal-blue', 'royal-gold', 'botanical'].includes(value?.theme) && <g pointerEvents="none" fill="none" stroke={divider} strokeWidth="2">
      <rect x="14" y="14" width={width - 28} height={height - 28} rx="12" />
      {[[30,30,0],[width-30,30,90],[width-30,height-30,180],[30,height-30,270]].map(([x,y,r]) => <path key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`} d={value.theme === 'botanical' ? 'M0 50Q0 0 50 0M2 30Q-12 14 2 10M8 15Q14-5 30 2' : 'M0 40V0H40M7 23V7H23M0 0 14 14'} />)}
    </g>}
    {grid && <g data-editor-only="true" stroke={ink} strokeWidth=".5" opacity=".15" pointerEvents="none">{Array.from({ length: 39 }, (_, i) => <path key={i} d={`M${(i + 1) * width / 40} 0V${height} M0 ${(i + 1) * height / 40}H${width}`} />)}</g>}
    {(value?.nodes || []).slice(0, 80).filter(node => MAP_NODE_TYPES.includes(node.type)).map(node => {
      const x = bounded(node.x, .05, .95) * width, y = bounded(node.y, .05, .95) * height;
      const w = bounded(node.width, .02, .8) * width, h = bounded(node.height, .02, .8) * height;
      const validColor = color => /^#[0-9a-f]{6}$/i.test(color || '') ? color : undefined;
      const color = validColor(node.color) || (['road', 'curve', 'intersection', 't-junction', 'bridge', 'roundabout'].includes(node.type) ? road : accent);
      const fontSize = bounded(node.fontSize, 12, 60, Math.max(22, width * .032));
      const labelWidth = Math.max(75, Math.min(width * .3, 2 * x - 28, 2 * (width - x) - 28));
      const labelX = bounded(node.labelX, -.3, .3, 0) * width;
      const lines = labelLines(node.label?.[locale] || '', Math.max(4, Math.floor(labelWidth / (fontSize * .6))), locale);
      const defaultY = node.type === 'label' ? 0 : Math.max(h / 2 + 36, 52);
      const labelY = (y+defaultY+Math.max(0,lines.length-1)*fontSize*1.65+fontSize*.35>height-20 ? -h/2-16-(lines.length-1)*fontSize*1.65 : defaultY) + bounded(node.labelY, -.3, .3, 0) * height;
      const route = node.type === 'curve' ? `M${-w/2} 0Q0 ${bounded(node.curvature, -1, 1, .6)*h} ${w/2} 0` : `M${-w/2} 0H${w/2}`;
      const roadPath = node.type === 'intersection' ? `M${-w/2} 0H${w/2}M0 ${-h/2}V${h/2}` : node.type === 't-junction' ? `M${-w/2} 0H${w/2}M0 0V${h/2}` : route;
      const roadWidth = ['intersection', 't-junction'].includes(node.type) ? Math.max(12, Math.min(w,h)*.23) : node.type === 'curve' ? Math.max(12, height * .035) : h;
      const arrowHead = Math.min(w*.22,Math.max(12,h*.8));
      return <g key={node.id} data-map-node={node.id} transform={`translate(${x} ${y}) rotate(${bounded(node.rotation, -180, 180, 0)})`} stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" onClick={onSelect ? () => onSelect(node.id) : undefined} style={onPointerDown ? { cursor: 'grab' } : undefined}>
        {node.label?.[locale] && <title>{node.label[locale]}</title>}
        {onSelect && <rect data-editor-only="true" x={-Math.max(w, 44)/2} y={-Math.max(h, 60)/2} width={Math.max(w,44)} height={Math.max(h,60)} fill="transparent" stroke="none" pointerEvents="all" />}
        {['road','curve','intersection','t-junction','bridge'].includes(node.type) ? <>
          <path d={roadPath} strokeWidth={roadWidth + 5} />
          <path d={roadPath} stroke={background} strokeWidth={Math.max(3,roadWidth - 1)} />
          {node.roadStyle !== 'boundary' && <path d={roadPath} strokeWidth="2" strokeDasharray={node.roadStyle === 'solid' ? undefined : '14 12'} />}
          {node.type === 'bridge' && <path d={`M${-w*.35} ${-h}V${h}M${w*.35} ${-h}V${h}`} />}
        </> : node.type === 'roundabout' ? <><path d={`M${-w/2} 0H${w/2}M0 ${-h/2}V${h/2}`} strokeWidth="15" /><circle r={Math.min(w,h)*.34} fill={background} strokeWidth="15" /><circle r={Math.min(w,h)*.34} stroke={background} strokeWidth="9" /><circle r={Math.min(w,h)*.12} fill={color} stroke="none" /></>
          : node.type === 'arrow' ? <path d={`M${-w/2} 0H${w/2}l-${arrowHead} -${arrowHead*.7}m${arrowHead} ${arrowHead*.7}-${arrowHead} ${arrowHead*.7}`} strokeWidth="5" />
          : node.type === 'label' ? null : <g transform={`translate(${-w/2} ${-h/2}) scale(${w/24} ${h/24})`} strokeWidth="1.4"><path d={MAP_SYMBOL_PATHS[node.type] || MAP_SYMBOL_PATHS.landmark} /></g>}
        {lines.length > 0 && <g transform={`translate(${labelX} ${labelY}) rotate(${bounded(node.labelRotation,-180,180,0)})`}>
          {validColor(node.labelBackground) && <rect x={-labelWidth/2} y={-fontSize*1.25} width={labelWidth} height={lines.length*fontSize*1.65} rx="8" fill={node.labelBackground} stroke="none" />}
          <text textAnchor={['start','end'].includes(node.textAlign) ? node.textAlign : 'middle'} stroke={validColor(node.labelBackground) || background} strokeWidth="5" paintOrder="stroke" fill={validColor(node.textColor) || ink} fontFamily={MAP_FONTS[node.font] || MAP_FONTS.KANTUMRUY} fontSize={fontSize}>
            {lines.map((line,index) => <tspan key={index} x="0" y={index*fontSize*1.65}>{line}</tspan>)}
          </text>
        </g>}
        {node.id === selected && <g data-editor-only="true" stroke={accent}><rect x={-w/2-8} y={-h/2-8} width={w+16} height={h+16} strokeDasharray="6 4" /><path d={`M0 ${-h/2-8}V${-h/2-30}`} /><circle data-map-rotate="true" cy={-h/2-36} r="10" fill={background} style={{ cursor: 'crosshair' }} /><rect data-map-resize="true" x={w/2-9} y={h/2-9} width="20" height="20" fill={background} style={{ cursor: 'nwse-resize' }} /></g>}
      </g>;
    })}
    {guides.length > 0 && <g data-editor-only="true" stroke={accent} strokeDasharray="5 5" pointerEvents="none">{guides.map((g,i) => <path key={i} d={g.axis==='x' ? `M${g.value*width} 0V${height}` : `M0 ${g.value*height}H${width}`} />)}</g>}
  </svg>;
}

export default function IllustratedMap({ content = {} }) {
  const [expanded, setExpanded] = useState(false);
  const value = content.illustratedMap;
  if (!value?.enabled) return null;
  const locale = String(content.languageMode).toLowerCase() === 'en' ? 'en' : 'km';
  const en = locale === 'en';
  const directions = safeDirections(content.googleMapUrl || content.googleMapsUrl || content.venue?.mapLink);
  return <figure className="kp-illustrated-map" lang={locale}>
    <MapDrawing value={value} locale={locale} />
    <figcaption><span className="kp-map-notice">{en ? 'Illustrative venue map' : 'ផែនទីទីតាំងជាគំនូរ'}</span>{value.description?.[locale] && <p>{value.description[locale]}</p>}
      {value.settings?.showLegend !== false && <ul aria-label={en ? 'Diagram labels' : 'ស្លាកលើគំនូរ'}>{(value.nodes || []).filter(node => node.label?.[locale] && !['road','arrow','label','curve'].includes(node.type)).map(node => <li key={node.id}>{node.label[locale]}</li>)}</ul>}
      <div className="kp-map-actions"><button type="button" onClick={() => setExpanded(true)}>{en ? 'View larger map' : 'មើលផែនទីធំ'}</button>
        {directions && value.settings?.showDirectionsButton !== false && <a href={directions} target="_blank" rel="noreferrer">{en ? 'Open Google Maps' : 'បើក Google Maps'}</a>}</div>
    </figcaption>
    {expanded && <Suspense fallback={<p role="status">{en ? 'Opening map…' : 'កំពុងបើកផែនទី…'}</p>}><MapViewerModal isOpen onClose={() => setExpanded(false)} title={en ? 'Venue map' : 'ផែនទីទីតាំងកម្មវិធី'} size="xl" className="kp-map-viewer"><div className="kp-map-viewer-scroll" tabIndex={0} aria-label={en ? 'Scrollable venue map' : 'ផែនទីអាចអូសមើលបាន'}><MapDrawing value={value} locale={locale} /></div></MapViewerModal></Suspense>}
  </figure>;
}
