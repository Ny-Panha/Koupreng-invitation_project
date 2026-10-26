import { useId } from 'react';
import { safeDirections } from './invitationFeatures';
import './invitation-features.css';
import { MAP_NODE_TYPES, MAP_THEMES, mapSize, bounded } from './illustratedMapModel';

function labelLines(value, count) {
  const segments = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(value)].map(part => part.segment) : Array.from(value);
  const lines = [];
  for (let index = 0; index < segments.length; index += count) lines.push(segments.slice(index, index + count).join(''));
  return lines.length > 3 ? [...lines.slice(0, 2), `${lines[2]}…`] : lines;
}
export function MapDrawing({ value, locale = 'km', selected, svgRef, grid, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown }) {
  const id = useId();
  const [width, height] = mapSize(value);
  const [background, ink] = MAP_THEMES[value?.theme] || MAP_THEMES.ivory;
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id} tabIndex={onKeyDown ? 0 : undefined} onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}>
    <title id={id}>{value?.description?.[locale] || (locale === 'en' ? 'Illustrative venue diagram' : 'ផែនទីទីតាំងជាគំនូរ')}</title>
    <rect width={width} height={height} rx="16" fill={background} />
    {grid && <g data-editor-only="true" stroke={ink} strokeWidth=".5" opacity=".15" pointerEvents="none">{Array.from({ length: 39 }, (_, i) => <path key={i} d={`M${(i + 1) * width / 40} 0V${height} M0 ${(i + 1) * height / 40}H${width}`} />)}</g>}
    {(value?.nodes || []).slice(0, 80).filter(node => MAP_NODE_TYPES.includes(node.type)).map(node => {
      const x = bounded(node.x, .05, .95) * width, y = bounded(node.y, .05, .95) * height;
      const w = bounded(node.width, .02, .8) * width, h = bounded(node.height, .02, .8) * height;
      const fontSize = Math.max(22, width * .034);
      const labelWidth = Math.max(70, Math.min(width * .18, 2 * x - 20, 2 * (width - x) - 20));
      return <g key={node.id} data-map-node={node.id} transform={`translate(${x} ${y}) rotate(${bounded(node.rotation, -180, 180, 0)})`} stroke={ink} strokeWidth="3" fill="none" style={onPointerDown ? { cursor: 'grab' } : undefined}>
        {node.label?.[locale] && <title>{node.label[locale]}</title>}
        {onPointerDown && <rect data-editor-only="true" x={-Math.max(w, 44) / 2} y={-Math.max(h, 80) / 2} width={Math.max(w, 44)} height={Math.max(h, 80)} fill="transparent" stroke="none" pointerEvents="all" />}
        {node.type === 'road' ? <><path d={`M${-w / 2} ${-h / 2}H${w / 2} M${-w / 2} ${h / 2}H${w / 2}`} /><path d={`M${-w / 2} 0H${w / 2}`} strokeDasharray="12 10" strokeWidth="1" /></>
          : node.type === 'arrow' ? <path d={`M${-w / 2} 0H${w / 2}l-16 -12m16 12-16 12`} />
          : node.type === 'intersection' ? <path d={`M${-w / 2} 0H${w / 2} M0 ${-h / 2}V${h / 2}`} strokeWidth="12" />
          : node.type === 'destination' ? <g transform={`scale(${Math.min(w, h) / 60})`}><path d="M0 28C-40-12-30-38 0-38S40-12 0 28Z" fill={background} /><circle cy="-10" r="9" /></g>
          : node.type === 'label' ? null : <><rect x={-w / 2} y={-h / 2} width={w} height={h} fill={background} /><path d={`M${-w / 2} ${-h / 2}L0 ${-h / 2 - 16} ${w / 2} ${-h / 2}`} />
            {node.type === 'market' && <path d={`M${-w / 2} 0H${w / 2} M${-w / 4} 0V${h / 2} M${w / 4} 0V${h / 2}`} />}
            {node.type === 'school' && <path d="M-20-8H0V18H-20ZM0-8H20V18H0M0-8V18" />}
            {node.type === 'pagoda' && <path d={`M${-w / 2 - 8} ${-h / 2}L0 ${-h / 2 - 26} ${w / 2 + 8} ${-h / 2} M${-w / 4} 0H${w / 4}V${h / 2}H${-w / 4}Z`} />}
            {node.type === 'parking' && <text y="6" fill={ink} stroke="none" textAnchor="middle" fontSize="24">P</text>}</>}
        {node.label?.[locale] && <text x="0" y={node.type === 'label' ? 0 : Math.max(h / 2 + 36, 60)} textAnchor="middle" stroke={background} strokeWidth="5" paintOrder="stroke" fill={ink} fontFamily="Kantumruy Pro, sans-serif" fontSize={fontSize}>{labelLines(node.label[locale], Math.max(3, Math.floor(labelWidth / (fontSize * .7)))).map((line, index) => <tspan key={index} x="0" y={(node.type === 'label' ? 0 : Math.max(h / 2 + 36, 60)) + index * Math.max(36, width * .05)}>{line}</tspan>)}</text>}
        {node.id === selected && <g data-editor-only="true"><rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} stroke="#2675bc" strokeDasharray="6 4" /><rect data-map-resize="true" x={w / 2 - 6} y={h / 2 - 6} width="16" height="16" stroke="#2675bc" fill="#fff" style={{ cursor: 'nwse-resize' }} /></g>}
      </g>;
    })}
  </svg>;
}
export default function IllustratedMap({ content = {} }) {
  const value = content.illustratedMap;
  if (!value?.enabled) return null;
  const locale = String(content.languageMode).toLowerCase() === 'en' ? 'en' : 'km';
  const directions = safeDirections(content.googleMapUrl || content.googleMapsUrl || content.venue?.mapLink);
  return <figure className="kp-illustrated-map" lang={locale}>
    <MapDrawing value={value} locale={locale} />
    <figcaption>{locale === 'en' ? 'Illustrative diagram. Use directions for navigation.' : 'ផែនទីជាគំនូរ។ សូមប្រើតំណទីតាំងសម្រាប់ការធ្វើដំណើរ។'}{value.description?.[locale] && <p>{value.description[locale]}</p>}
      <ul aria-label={locale === 'en' ? 'Diagram labels' : 'ស្លាកលើគំនូរ'}>{value.nodes.filter(node => node.label?.[locale]).map(node => <li key={node.id}>{node.label[locale]}</li>)}</ul>
      {directions && <a href={directions} target="_blank" rel="noreferrer">{locale === 'en' ? 'Open directions' : 'បើកទីតាំង'}</a>}</figcaption>
  </figure>;
}
