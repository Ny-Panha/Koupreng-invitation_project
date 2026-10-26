import { useRef, useState } from 'react';
import { MapDrawing } from '../../templates/shared/IllustratedMap';
import { MAP_NODE_TYPES, mapSize, bounded, fitMapNode } from '../../templates/shared/illustratedMapModel';
const blank = () => ({ version: 1, enabled: false, aspectRatio: 'landscape', theme: 'ivory', description: { km: '', en: '' }, nodes: [] });
const snap = value => Math.round(bounded(value, .05, .95) * 40) / 40;
export default function IllustratedMapEditor({ value, onChange, entitled, locale, onUndo, onRedo }) {
  const [selection, setSelection] = useState(''), [type, setType] = useState('destination'), [zoom, setZoom] = useState(1), [drag, setDrag] = useState(null);
  const svg = useRef(null), gesture = useRef(null);
  const [exportStatus, setExportStatus] = useState('');
  const config = value || blank();
  const selected = config.nodes.find(node => node.id === selection);
  const patch = values => onChange({ ...config, ...values });
  const edit = values => patch({ nodes: config.nodes.map(node => node.id === selection ? fitMapNode({ ...node, ...values }) : node) });
  const add = () => {
    const id = crypto.randomUUID(); setSelection(id);
    patch({ nodes: [...config.nodes, { id, type, x: .5, y: .5, width: type === 'road' ? .35 : .12, height: .08, rotation: 0, label: { km: '', en: '' } }] });
  };
  const down = event => {
    const id = event.target.closest('[data-map-node]')?.dataset.mapNode;
    if (!id) return; const node = config.nodes.find(item => item.id === id);
    setSelection(id); const box = svg.current.getBoundingClientRect();
    gesture.current = { id, x: event.clientX, y: event.clientY, node, box, resize: event.target.hasAttribute('data-map-resize') }; setDrag(node);
    event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
  };
  const move = event => {
    const g = gesture.current; if (!g) return;
    const dx = (event.clientX - g.x) / g.box.width, dy = (event.clientY - g.y) / g.box.height;
    setDrag(fitMapNode(g.resize ? { ...g.node, width: bounded(g.node.width + 2 * dx, .02, .8), height: bounded(g.node.height + 2 * dy, .02, .8) } : { ...g.node, x: snap(g.node.x + dx), y: snap(g.node.y + dy) }));
  };
  const finish = () => { if (drag) patch({ nodes: config.nodes.map(node => node.id === drag.id ? drag : node) }); gesture.current = null; setDrag(null); };
  const exportSvg = async () => {
    setExportStatus('Preparing font-embedded SVG…');
    try {
    const copy = svg.current.cloneNode(true); copy.querySelectorAll('[data-editor-only]').forEach(node => node.remove()); copy.removeAttribute('tabindex');
    const font = await fetch('/fonts/silk-heritage/KantumruyPro.woff2', { credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!font.ok) throw new Error('The local Khmer font could not be loaded. Retry exporting.');
    const bytes = new Uint8Array(await font.arrayBuffer()); let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style'); style.textContent = `@font-face{font-family:'Kantumruy Pro';src:url(data:font/woff2;base64,${btoa(binary)}) format('woff2');}`; copy.prepend(style);
    const licenseResponse = await fetch('/fonts/silk-heritage/KantumruyPro-OFL.txt', { credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!licenseResponse.ok) throw new Error('The font license could not be loaded. Retry exporting.');
    const license = document.createElementNS('http://www.w3.org/2000/svg', 'metadata'); license.textContent = await licenseResponse.text(); copy.prepend(license);
    const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'illustrative-venue-map.svg'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportStatus('SVG exported with the local Khmer font.');
    } catch (error) { setExportStatus(error.message); }
  };
  if (!entitled) return <section className="studio-design-panel"><h4>Illustrated venue map · Premium</h4><p>Create an editable diagram with a Premium owner package. Existing designs stay saved.</p>{value?.enabled && <button type="button" onClick={() => onChange({ ...value, enabled: false })}>Disable public diagram</button>}</section>;
  const display = drag ? { ...config, nodes: config.nodes.map(node => node.id === drag.id ? drag : node) } : config;
  const [width, height] = mapSize(config);
  return <section className="studio-design-panel" aria-label="Illustrated venue map editor">
    <h4>Illustrated venue map · Premium</h4><p>This is an illustration, not a geographic map. Add your own landmarks and keep the official directions link.</p>
    <label><span>Show diagram publicly</span><input type="checkbox" checked={config.enabled} onChange={e => patch({ enabled: e.target.checked })} /></label>
    <div className="pe-grid-2"><label>Aspect ratio<select value={config.aspectRatio} onChange={e => patch({ aspectRatio: e.target.value })}>{['landscape', 'portrait', 'square'].map(key => <option key={key}>{key}</option>)}</select></label><label>Map palette<select value={config.theme} onChange={e => patch({ theme: e.target.value })}>{['ivory', 'ink', 'rose'].map(key => <option key={key}>{key}</option>)}</select></label></div>
    <label>Map description ({locale})<textarea maxLength={1500} value={config.description[locale]} onChange={e => patch({ description: { ...config.description, [locale]: e.target.value } })} /></label>
    <div className="studio-design-tools"><select aria-label="Map element type" value={type} onChange={e => setType(e.target.value)}>{MAP_NODE_TYPES.map(key => <option key={key}>{key}</option>)}</select><button type="button" disabled={config.nodes.length >= 80} onClick={add}>Add element</button><button type="button" onClick={onUndo}>Undo design</button><button type="button" onClick={onRedo}>Redo design</button><button type="button" onClick={() => { if (window.confirm('Clear the illustrated map? Undo can restore it.')) onChange(blank()); }}>Reset map</button><button type="button" onClick={exportSvg}>Export safe SVG</button></div>
    <label>Editor zoom<input type="range" min="1" max="3" step=".25" value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label>
    {exportStatus && <p role="status">{exportStatus}</p>}
    <p id="map-keyboard-help">Select an element in the layer list. Use arrow keys on the canvas, or edit its position, size and rotation below. The scrollable canvas supports panning when zoomed.</p>
    <div className="studio-map-stage" aria-describedby="map-keyboard-help"><div style={{ width: `${zoom * 100}%`, minWidth: 280, aspectRatio: `${width}/${height}` }}>
      <MapDrawing svgRef={svg} value={display} locale={locale} selected={selection} onPointerDown={down} onPointerMove={move} onPointerUp={finish} onPointerCancel={() => { gesture.current = null; setDrag(null); }} onKeyDown={event => {
        if (!selected || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault(); edit({ x: snap(selected.x + (event.key === 'ArrowLeft' ? -.025 : event.key === 'ArrowRight' ? .025 : 0)), y: snap(selected.y + (event.key === 'ArrowUp' ? -.025 : event.key === 'ArrowDown' ? .025 : 0)) });
      }} />
    </div></div>
    <div className="studio-map-layers" aria-label="Map layers">{config.nodes.map((node, index) => <button key={node.id} type="button" aria-pressed={selection === node.id} onClick={() => setSelection(node.id)}>{index + 1}. {node.type} {node.label[locale]}</button>)}</div>
    {selected && <fieldset><legend>Selected {selected.type}</legend><label>Element label ({locale})<input maxLength={150} value={selected.label[locale]} onChange={e => edit({ label: { ...selected.label, [locale]: e.target.value } })} /></label>
      <div className="pe-grid-2">{[['x', .05, .95, .025], ['y', .05, .95, .025], ['width', .02, .8, .01], ['height', .02, .8, .01], ['rotation', -180, 180, 1]].map(([key, min, max, step]) => <label key={key}>{key}<input type="number" min={min} max={max} step={step} value={selected[key]} onChange={e => edit({ [key]: bounded(e.target.valueAsNumber, min, max, selected[key]) })} /></label>)}</div>
      <div className="studio-design-tools"><button type="button" onClick={() => edit({ x: .5 })}>Center horizontally</button><button type="button" onClick={() => edit({ y: .5 })}>Center vertically</button><button type="button" disabled={config.nodes.length >= 80} onClick={() => { const id = crypto.randomUUID(); patch({ nodes: [...config.nodes, { ...selected, id, x: snap(selected.x + .025), y: snap(selected.y + .025) }] }); setSelection(id); }}>Duplicate element</button>{[-1, 1].map(delta => <button key={delta} type="button" disabled={!config.nodes[config.nodes.indexOf(selected) + delta]} onClick={() => { const nodes = [...config.nodes], index = nodes.indexOf(selected); [nodes[index], nodes[index + delta]] = [nodes[index + delta], nodes[index]]; patch({ nodes }); }}>{delta < 0 ? 'Send backward' : 'Bring forward'}</button>)}<button type="button" onClick={() => { patch({ nodes: config.nodes.filter(node => node.id !== selection) }); setSelection(''); }}>Remove element</button></div>
    </fieldset>}
  </section>;
}
