import { useRef, useState } from 'react';
import { MapDrawing } from '../../templates/shared/IllustratedMap';
import { MAP_NODE_TYPES, mapSize, bounded, fitMapNode } from '../../templates/shared/illustratedMapModel';
import { MAP_PRESETS, createMapPreset } from '../../templates/shared/mapPresets';
import { exportVector } from '../../templates/shared/vectorExport';
const blank = () => ({ version: 1, enabled: false, aspectRatio: 'landscape', theme: 'ivory', description: { km: '', en: '' }, nodes: [] });
const snap = value => Math.round(bounded(value, .05, .95) * 40) / 40;
export default function IllustratedMapEditor({ value, onChange, entitled, locale, onUndo, onRedo }) {
  const [selection, setSelection] = useState(''), [type, setType] = useState('destination'), [zoom, setZoom] = useState(1), [drag, setDrag] = useState(null);
  const svg = useRef(null), gesture = useRef(null);
  const [exportStatus, setExportStatus] = useState('');
  const [preset, setPreset] = useState('main-road'), [snapping, setSnapping] = useState(true), [dragEnabled, setDragEnabled] = useState(() => !window.matchMedia?.('(pointer: coarse)')?.matches), [joinTarget, setJoinTarget] = useState('');
  const position = value => snapping ? snap(value) : bounded(value, .05, .95);
  const config = value || blank();
  const selected = config.nodes.find(node => node.id === selection);
  const target = config.nodes.find(node => node.id === joinTarget && node.id !== selection);
  const patch = values => onChange({ ...config, ...values });
  const edit = values => patch({ nodes: config.nodes.map(node => node.id === selection ? fitMapNode({ ...node, ...values }) : node) });
  const add = () => {
    const id = crypto.randomUUID(); setSelection(id);
    patch({ nodes: [...config.nodes, { id, type, x: .5, y: .5, width: type === 'road' ? .35 : .12, height: .08, rotation: 0, label: { km: '', en: '' } }] });
  };
  const down = event => {
    if (!dragEnabled || (event.button !== undefined && event.button !== 0)) return;
    const id = event.target.closest('[data-map-node]')?.dataset.mapNode;
    if (!id) return; const node = config.nodes.find(item => item.id === id);
    setSelection(id); const box = svg.current.getBoundingClientRect();
    gesture.current = { id, x: event.clientX, y: event.clientY, node, box, resize: event.target.hasAttribute('data-map-resize') }; setDrag(node);
    event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
  };
  const move = event => {
    const g = gesture.current; if (!g) return;
    const dx = (event.clientX - g.x) / g.box.width, dy = (event.clientY - g.y) / g.box.height;
    setDrag(fitMapNode(g.resize ? { ...g.node, width: bounded(g.node.width + 2 * dx, .02, .8), height: bounded(g.node.height + 2 * dy, .02, .8) } : { ...g.node, x: position(g.node.x + dx), y: position(g.node.y + dy) }));
  };
  const finish = () => { if (drag) patch({ nodes: config.nodes.map(node => node.id === drag.id ? drag : node) }); gesture.current = null; setDrag(null); };
  const exportImage = async (format = 'svg') => {
    setExportStatus(`Preparing ${format.toUpperCase()}…`);
    try {
    await exportVector(svg.current, { format });
    setExportStatus(`${format.toUpperCase()} exported with the local Khmer font.`);
    } catch (error) { setExportStatus(error.message); }
  };
  if (!entitled) return <section className="studio-design-panel"><h4>Illustrated venue map · Premium</h4><p>Create an editable diagram with a Premium owner package. Existing designs stay saved.</p>{value?.enabled && <button type="button" onClick={() => onChange({ ...value, enabled: false })}>Disable public diagram</button>}</section>;
  const display = drag ? { ...config, nodes: config.nodes.map(node => node.id === drag.id ? drag : node) } : config;
  const [width, height] = mapSize(config);
  return <section className="studio-design-panel" aria-label="Illustrated venue map editor">
    <h4>Illustrated venue map · Premium</h4><p>This is an illustration, not a geographic map. Add your own landmarks and keep the official directions link.</p>
    <label><span>Show diagram publicly</span><input type="checkbox" checked={config.enabled} onChange={e => patch({ enabled: e.target.checked })} /></label>
    <div className="pe-grid-2"><label>Aspect ratio<select value={config.aspectRatio} onChange={e => patch({ aspectRatio: e.target.value })}>{['landscape', 'portrait', 'square'].map(key => <option key={key}>{key}</option>)}</select></label><label>Map palette<select value={config.theme} onChange={e => patch({ theme: e.target.value })}>{['ivory', 'ink', 'rose'].map(key => <option key={key}>{key}</option>)}</select></label></div>
    <label>Map description ({locale})<textarea maxLength={1500} data-translation-key="map.description" value={config.description[locale]} onChange={e => patch({ description: { ...config.description, [locale]: e.target.value } })} /></label>
    <label>Diagram starting point<select value={preset} onChange={e => setPreset(e.target.value)}>{MAP_PRESETS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <button type="button" onClick={() => { if (config.nodes.length && !window.confirm('Replace your diagram with this starting point? Undo design restores your work.')) return; patch({ nodes: createMapPreset(preset) }); setSelection(''); }}>Apply diagram preset</button>
    <p>These fictional routes are editable starting points. Replace the labels and geometry with your own wayfinding details.</p>
    <div className="studio-design-tools"><select aria-label="Map element type" value={type} onChange={e => setType(e.target.value)}>{MAP_NODE_TYPES.map(key => <option key={key}>{key}</option>)}</select><button type="button" disabled={config.nodes.length >= 80} onClick={add}>Add element</button><button type="button" onClick={onUndo}>Undo design</button><button type="button" onClick={onRedo}>Redo design</button><button type="button" onClick={() => { if (window.confirm('Clear the illustrated map? Undo can restore it.')) onChange(blank()); }}>Reset map</button><button type="button" onClick={() => exportImage('svg')}>Export safe SVG</button><button type="button" onClick={() => exportImage('png')}>Export PNG</button><button type="button" onClick={() => exportImage('webp')}>Export WebP</button></div>
    <div className="studio-design-tools"><label><input type="checkbox" checked={snapping} onChange={e => setSnapping(e.target.checked)} />Snap to grid</label><label><input type="checkbox" checked={dragEnabled} onChange={e => { setDragEnabled(e.target.checked); gesture.current = null; setDrag(null); }} />Drag elements (turn off to scroll)</label><button type="button" onClick={() => { setZoom(1); svg.current?.parentElement?.parentElement?.scrollTo({ left: 0, top: 0 }); }}>Fit canvas</button></div>
    <label>Editor zoom<input type="range" min="1" max="3" step=".25" value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label>
    {exportStatus && <p role="status">{exportStatus}</p>}
    <p id="map-keyboard-help">Select an element in the layer list. Use arrow keys on the canvas, or edit its position, size and rotation below. The scrollable canvas supports panning when zoomed.</p>
    <div className="studio-map-stage" data-drag={dragEnabled} aria-describedby="map-keyboard-help"><div style={{ width: `${zoom * 100}%`, aspectRatio: `${width}/${height}` }}>
      <MapDrawing svgRef={svg} value={display} locale={locale} selected={selection} grid={snapping} onPointerDown={dragEnabled ? down : undefined} onPointerMove={move} onPointerUp={finish} onPointerCancel={() => { gesture.current = null; setDrag(null); }} onKeyDown={event => {
        if (!selected || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault(); edit({ x: snap(selected.x + (event.key === 'ArrowLeft' ? -.025 : event.key === 'ArrowRight' ? .025 : 0)), y: snap(selected.y + (event.key === 'ArrowUp' ? -.025 : event.key === 'ArrowDown' ? .025 : 0)) });
      }} />
    </div></div>
    <div className="studio-map-layers" aria-label="Map layers">{config.nodes.map((node, index) => <button key={node.id} data-map-layer={node.id} type="button" aria-pressed={selection === node.id} onClick={() => setSelection(node.id)}>{index + 1}. {node.type} {node.label[locale]}</button>)}</div>
    {selected && <fieldset><legend>Selected {selected.type}</legend><label>Element label ({locale})<input maxLength={150} data-translation-key={`map.${selected.id}.label`} value={selected.label[locale]} onChange={e => edit({ label: { ...selected.label, [locale]: e.target.value } })} /></label>
      <label>Align with element<select value={joinTarget} onChange={e => setJoinTarget(e.target.value)}><option value="">Choose another element</option>{config.nodes.filter(node => node.id !== selection).map((node, index) => <option key={node.id} value={node.id}>{index + 1}. {node.type} {node.label[locale]}</option>)}</select></label>
      <button type="button" disabled={!target || config.nodes.length >= 80} onClick={() => {
        const dx = (target.x - selected.x) * width, dy = (target.y - selected.y) * height;
        patch({ nodes: [...config.nodes, fitMapNode({ id: crypto.randomUUID(), type: 'road', x: (target.x + selected.x) / 2, y: (target.y + selected.y) / 2, width: bounded(Math.hypot(dx, dy) / width, .02, .8), height: .035, rotation: Math.atan2(dy, dx) * 180 / Math.PI, label: { km: '', en: '' } })] });
      }}>Connect with road</button>
      <div className="studio-design-tools"><button type="button" disabled={!config.nodes.some(node => node.id === joinTarget && node.id !== selection)} onClick={() => edit({ y: config.nodes.find(node => node.id === joinTarget).y })}>Align horizontal</button><button type="button" disabled={!config.nodes.some(node => node.id === joinTarget && node.id !== selection)} onClick={() => edit({ x: config.nodes.find(node => node.id === joinTarget).x })}>Align vertical</button><button type="button" onClick={() => edit({ rotation: Math.round(selected.rotation / 90) * 90 })}>Straighten to nearest right angle</button></div>
      <div className="pe-grid-2">{[['x', .05, .95, .025], ['y', .05, .95, .025], ['width', .02, .8, .01], ['height', .02, .8, .01], ['rotation', -180, 180, 1]].map(([key, min, max, step]) => <label key={key}>{key}<input type="number" min={min} max={max} step={step} value={selected[key]} onChange={e => edit({ [key]: bounded(e.target.valueAsNumber, min, max, selected[key]) })} /></label>)}</div>
      <div className="studio-design-tools"><button type="button" onClick={() => edit({ x: .5 })}>Center horizontally</button><button type="button" onClick={() => edit({ y: .5 })}>Center vertically</button><button type="button" disabled={config.nodes.length >= 80} onClick={() => { const id = crypto.randomUUID(); patch({ nodes: [...config.nodes, { ...selected, id, x: snap(selected.x + .025), y: snap(selected.y + .025) }] }); setSelection(id); }}>Duplicate element</button>{[-1, 1].map(delta => <button key={delta} type="button" disabled={!config.nodes[config.nodes.indexOf(selected) + delta]} onClick={() => { const nodes = [...config.nodes], index = nodes.indexOf(selected); [nodes[index], nodes[index + delta]] = [nodes[index + delta], nodes[index]]; patch({ nodes }); }}>{delta < 0 ? 'Send backward' : 'Bring forward'}</button>)}<button type="button" onClick={() => { patch({ nodes: config.nodes.filter(node => node.id !== selection) }); setSelection(''); }}>Remove element</button></div>
    </fieldset>}
  </section>;
}
