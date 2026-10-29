import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, Download, Eye, Hand, Layers, MapPinned, Minus, MousePointer2, Plus, Redo2, Route, Save, Scan, Shapes, SlidersHorizontal, Trash2, Undo2, X } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { feedback } from '@/shared/feedback/feedback';
import { MapDrawing } from '../../templates/shared/IllustratedMap';
import { MAP_TOOL_GROUPS, MAP_TYPE_NAMES, MAP_THEME_TOKENS, MAP_LIMIT, MAP_FONTS, blankMap, mapSize, normalizeMap, newMapNode, bounded, fitMapNode, moveMapNode, connectMapNodes } from '../../templates/shared/illustratedMapModel';
import { MAP_PRESETS, MAP_EXAMPLE_DESCRIPTION, MAP_PRESET_NAMES_KM, createMapPreset } from '../../templates/shared/mapPresets';
import { exportVector } from '../../templates/shared/vectorExport';

const rotation = value => ((value + 540) % 360) - 180;

export default function IllustratedMapDesignerModal({ value, onChange, locale = 'km', previewOnly = false, onClose, onUndo, onRedo, canUndo, canRedo, onSave, savedValue, savePhase, saveError, allowed, onReviewAccess }) {
  const en = locale === 'en', L = (km, english) => en ? english : km;
  const config = normalizeMap(value);
  const [selection, setSelection] = useState(''), [tab, setTab] = useState('roads'), [mobilePanel, setMobilePanel] = useState('canvas');
  const [zoom, setZoom] = useState(1), [tool, setTool] = useState('select'), [snapping, setSnapping] = useState(true), [transparent, setTransparent] = useState(false);
  const [guides, setGuides] = useState([]), [targetId, setTargetId] = useState('');
  const [preview, setPreview] = useState(previewOnly), [busy, setBusy] = useState(false), [status, setStatus] = useState('');
  const svg = useRef(null), viewport = useRef(null), gesture = useRef(null);
  const [opened, setOpened] = useState(() => JSON.stringify(value ?? null));
  const selected = config.nodes.find(node => node.id === selection);
  const target = config.nodes.find(node => node.id === targetId && node.id !== selection);
  const editable = allowed && !previewOnly;
  const activeEditing = editable && !preview;
  const saved = JSON.stringify(value ?? null) === (savedValue === undefined ? opened : JSON.stringify(savedValue ?? null));
  const patch = change => { if (editable) { setStatus(''); onChange({ ...config, ...change }); } };
  const edit = change => { if (selected) patch({ nodes: config.nodes.map(node => node.id === selection ? fitMapNode({ ...node, ...change }, config) : node) }); };
  const add = (type, geometry = {}) => { if (config.nodes.length >= MAP_LIMIT) return; const node = fitMapNode({ ...newMapNode(type, config), ...geometry }, config); patch({ enabled: true, nodes: [...config.nodes, node] }); setSelection(node.id); setMobilePanel('canvas'); };
  const remove = () => { patch({ nodes: config.nodes.filter(node => node.id !== selection) }); setSelection(''); };
  const duplicate = () => { if (!selected || config.nodes.length >= MAP_LIMIT) return; const node = fitMapNode({ ...selected, id: crypto.randomUUID(), label: { ...selected.label }, x: selected.x+.025, y: selected.y+.025 }, config); patch({ nodes: [...config.nodes,node] }); setSelection(node.id); };
  const close = async () => {
    if (!previewOnly && !saved && !await feedback.confirm({ title: L('បិទកម្មវិធីរចនា?','Close map designer?'), message: L('ការកែប្រែនៅតែក្នុងពង្រាង Studio។ មិនទាន់បញ្ជាក់ការរក្សាទុកលើម៉ាស៊ីនមេទេ។','Your changes stay in the Studio draft. They have not yet been confirmed saved by the server.'), confirmText: L('រក្សាពង្រាង និងបិទ','Keep draft and close'), cancelText: L('បន្តកែសម្រួល','Keep editing') })) return;
    onClose();
  };
  const applyPreset = async preset => {
    if (config.nodes.length && !await feedback.confirm({ title: L('ប្រើផែនទីគំរូនេះ?','Use this example map?'), message: L('ផែនទីបច្ចុប្បន្ននឹងត្រូវជំនួស។ អាចប្រើមិនធ្វើវិញ ដើម្បីស្ដារឡើងវិញ។','This replaces the current diagram. Undo restores your previous design.'), destructive: true })) return;
    patch({ nodes: createMapPreset(preset.id), theme: preset.theme || 'royal-gold', description: { ...MAP_EXAMPLE_DESCRIPTION }, enabled: true }); setSelection(''); setMobilePanel('canvas');
  };
  const save = async () => {
    if (!editable || !onSave) return;
    setBusy(true); setStatus('');
    try { if (await onSave()) { setOpened(JSON.stringify(value ?? null)); setStatus(L('បានរក្សាទុកលើម៉ាស៊ីនមេ','Saved to server')); } else setStatus(L('មិនទាន់រក្សាទុកទេ។ សូមពិនិត្យសារ Studio ហើយសាកម្តងទៀត។','Not saved. Review the Studio message and retry.')); }
    catch (error) { setStatus(error.message || L('មិនអាចរក្សាទុកបានទេ','Could not save the map.')); }
    finally { setBusy(false); }
  };
  const download = async format => {
    if (!editable) return;
    setBusy(true); setStatus(L('កំពុងរៀបចំការនាំចេញ…','Preparing export…'));
    try { await exportVector(svg.current, { format }); setStatus(L(`បាននាំចេញ ${format.toUpperCase()}`,`${format.toUpperCase()} exported with bundled fonts.`)); }
    catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  };
  const point = event => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  };
  const down = event => {
    if (!activeEditing || event.button > 0) return;
    const nodeId = event.target.closest('[data-map-node]')?.dataset.mapNode;
    if (tool === 'pan') gesture.current = { mode: 'pan', x: event.clientX, y: event.clientY, left: viewport.current.scrollLeft, top: viewport.current.scrollTop };
    else {
      if (!nodeId) { setSelection(''); return; }
      const node = config.nodes.find(item => item.id === nodeId), start = point(event);
      if (!node || !start) return;
      setSelection(nodeId);
      const [w,h] = mapSize(config);
      gesture.current = { mode: event.target.hasAttribute('data-map-rotate') ? 'rotate' : event.target.hasAttribute('data-map-resize') ? 'resize' : 'move', node, start, element: event.target.closest('[data-map-node]'), angle: Math.atan2(start.y-node.y*h,start.x-node.x*w) };
    }
    svg.current.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
  };
  const move = event => {
    const g = gesture.current; if (!g) return;
    if (g.mode === 'pan') { viewport.current.scrollLeft=g.left+g.x-event.clientX; viewport.current.scrollTop=g.top+g.y-event.clientY; return; }
    const current = point(event); if (!current) return;
    const [w,h] = mapSize(config), dx = current.x-g.start.x, dy = current.y-g.start.y;
    let next;
    if (g.mode === 'rotate') {
      const angle = Math.atan2(current.y-g.node.y*h,current.x-g.node.x*w);
      next=fitMapNode({ ...g.node, rotation: rotation(g.node.rotation+(angle-g.angle)*180/Math.PI) },config);
    } else if (g.mode === 'resize') {
      const a=g.node.rotation*Math.PI/180;
      next=fitMapNode({ ...g.node,width:bounded(g.node.width+2*(dx*Math.cos(a)+dy*Math.sin(a))/w,.02,.8),height:bounded(g.node.height+2*(-dx*Math.sin(a)+dy*Math.cos(a))/h,.02,.8) },config);
    } else {
      const result=moveMapNode(g.node,g.node.x+dx/w,g.node.y+dy/h,config.nodes,config,snapping);next=result.node;
      const signature=JSON.stringify(result.guides);
      if(g.guideSignature!==signature){g.guideSignature=signature;setGuides(result.guides);}
    }
    // A transient SVG transform keeps pointer traffic out of the Studio state,
    // React history and backend. The final normalized geometry is committed once.
    g.preview=next;
    g.element?.setAttribute('transform',`translate(${next.x*w} ${next.y*h}) rotate(${next.rotation}) scale(${next.width/g.node.width} ${next.height/g.node.height})`);
  };
  const finish = () => { const g=gesture.current,next=g?.preview;if(next){const[w,h]=mapSize(config);g.element?.setAttribute('transform',`translate(${next.x*w} ${next.y*h}) rotate(${next.rotation})`);patch({nodes:config.nodes.map(node=>node.id===next.id?next:node)});}gesture.current=null;setGuides([]); };
  const cancelGesture = () => { const g=gesture.current;if(g?.node){const[w,h]=mapSize(config);g.element?.setAttribute('transform',`translate(${g.node.x*w} ${g.node.y*h}) rotate(${g.node.rotation})`);}gesture.current=null;setGuides([]); };
  const keydown = event => {
    if (event.defaultPrevented || !activeEditing || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if ((event.ctrlKey || event.metaKey) && ['z','y'].includes(event.key.toLowerCase())) { event.preventDefault(); if (event.shiftKey || event.key.toLowerCase()==='y') onRedo?.(); else onUndo?.(); return; }
    if (!selected) return;
    if (event.key==='Delete' || event.key==='Backspace') { event.preventDefault();remove(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase()==='d') { event.preventDefault();duplicate(); }
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault();const step=event.shiftKey ? .025 : .005;edit(event.altKey ? { rotation:rotation(selected.rotation+(event.key==='ArrowLeft'?-5:5)) } : { x:selected.x+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),y:selected.y+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0) }); }
  };
  const display=config;
  const theme=MAP_THEME_TOKENS[config.theme] || MAP_THEME_TOKENS['royal-blue'];
  const statusLabel=busy ? L('កំពុងដំណើរការ…','Working…') : savePhase==='saving' ? L('កំពុងរក្សាទុក…','Saving…') : saved && value ? L('បានរក្សាទុក','Saved to server') : L('ពង្រាង Studio','Studio draft');
  const library = <aside className="map-library" aria-label={L('បណ្ណាល័យធាតុ','Element library')}>
    <div className="map-panel-heading"><h3>{L('បន្ថែមធាតុ','Add elements')}</h3><span>{config.nodes.length}/{MAP_LIMIT}</span></div>
    <div className="map-library-tabs">{[...MAP_TOOL_GROUPS,{ id:'presets',km:'គំរូ',en:'Presets' }].map(group=><button type="button" key={group.id} aria-pressed={tab===group.id} onClick={()=>setTab(group.id)}>{en?group.en:group.km}</button>)}</div>
    {tab==='roads' && <div className="map-road-directions">{[[0,L('ផ្ដេក','Horizontal road')],[90,L('បញ្ឈរ','Vertical road')],[35,L('បញ្ឆិត','Diagonal road')]].map(([angle,label])=><button key={angle} type="button" disabled={config.nodes.length>=MAP_LIMIT} onClick={()=>add('road',{rotation:angle})}><Route size={16} style={{transform:`rotate(${angle}deg)`}}/>{label}</button>)}</div>}
    {tab==='presets' ? <div className="map-presets">{MAP_PRESETS.map(preset=><button key={preset.id} type="button" onClick={()=>applyPreset(preset)}><MapDrawing ariaHidden value={{ ...config,theme:preset.theme||'royal-gold',nodes:preset.nodes.map((node,i)=>({...node,id:`thumb-${i}`})) }} locale={locale}/><span>{en ? preset.name : MAP_PRESET_NAMES_KM[preset.id]}</span><small>{L('ផែនទីគំរូ','Example layout')}</small></button>)}</div> : <div className="map-element-grid">{MAP_TOOL_GROUPS.find(group=>group.id===tab)?.types.map(type=><button type="button" key={type} disabled={config.nodes.length>=MAP_LIMIT} onClick={()=>add(type)}><MapDrawing ariaHidden value={{version:2,theme:config.theme,aspectRatio:'square',nodes:[{id:'icon',type,x:.5,y:.5,width:['road','curve','arrow','bridge'].includes(type)?.65:.5,height:type==='curve'?.3:['road','arrow','bridge'].includes(type)?.07:.5,rotation:0,label:{km:'',en:''}}]}}/><span>{MAP_TYPE_NAMES[type][en?1:0]}</span></button>)}</div>}
    <p className="map-object-count">{config.nodes.length} / {MAP_LIMIT} {L('ធាតុ','elements')}</p>
  </aside>;
  const properties = <aside className="map-properties" aria-label={L('លក្ខណៈសម្បត្តិផែនទី','Map properties')}>
    <h3><SlidersHorizontal size={16}/>{selected ? MAP_TYPE_NAMES[selected.type]?.[en?1:0] : L('ការកំណត់ផែនទី','Map settings')}</h3>
    {selected ? <>
      <div className="map-property-section"><h4>{L('ទីតាំង និងទំហំ','Position & size')}</h4><div className="map-field-grid">{[['x',.05,.95,.005],['y',.05,.95,.005],['width',.02,.8,.01],['height',.02,.8,.01],['rotation',-180,180,1]].map(([key,min,max,step])=><label key={key}>{({x:L('ទីតាំង X','Position X'),y:L('ទីតាំង Y','Position Y'),width:L('ទទឹង','Width'),height:L('កម្ពស់','Height'),rotation:L('បង្វិល','Rotation')})[key]}<input type="number" min={min} max={max} step={step} value={Number(selected[key].toFixed(4))} onChange={e=>edit({[key]:bounded(e.target.valueAsNumber,min,max,selected[key])})}/></label>)}</div></div>
      <div className="map-property-section"><h4>{L('អក្សរលើផែនទី','Map labels')}</h4>
      {['km','en'].map(lang=><label key={lang}>{lang==='km'?'អក្សរខ្មែរ':'English label'}<input lang={lang} maxLength={150} data-translation-key={`map.${selected.id}.label`} value={selected.label[lang]} onChange={e=>edit({label:{...selected.label,[lang]:e.target.value}})}/></label>)}
      </div><details className="map-property-section map-appearance"><summary>{L('រចនាបថអក្សរ និងពណ៌','Typography & color')}</summary>
      <div className="map-field-grid"><label>{L('ពណ៌ធាតុ','Element color')}<input type="color" value={selected.color||theme.road} onChange={e=>edit({color:e.target.value})}/></label><label>{L('ពណ៌អក្សរ','Text color')}<input type="color" value={selected.textColor||theme.ink} onChange={e=>edit({textColor:e.target.value})}/></label>
      <label>{L('ទំហំអក្សរ','Font size')}<input type="number" min="12" max="60" value={selected.fontSize||32} onChange={e=>edit({fontSize:bounded(e.target.valueAsNumber,12,60,32)})}/></label><label>{L('ពណ៌ផ្ទៃអក្សរ','Label background')}<input type="color" value={selected.labelBackground||theme.background} onChange={e=>edit({labelBackground:e.target.value})}/></label></div>
      <label>{L('ពុម្ពអក្សរ','Font')}<select value={selected.font||'KANTUMRUY'} onChange={e=>edit({font:e.target.value})}>{Object.keys(MAP_FONTS).map(font=><option key={font} value={font}>{font==='KANTUMRUY'?'Kantumruy Pro':font==='MOUL'?'Moul':'Cormorant Garamond'}</option>)}</select></label>
      <label>{L('តម្រឹមអក្សរ','Text alignment')}<select value={selected.textAlign||'middle'} onChange={e=>edit({textAlign:e.target.value})}>{['start','middle','end'].map(option=><option key={option} value={option}>{({start:L('ខាងឆ្វេង','Left'),middle:L('កណ្ដាល','Center'),end:L('ខាងស្ដាំ','Right')})[option]}</option>)}</select></label>
      <div className="map-field-grid">{[['labelX',-.3,.3,.01,0],['labelY',-.3,.3,.01,0],['labelRotation',-180,180,1,0]].map(([key,min,max,step,fallback])=><label key={key}>{({labelX:L('អក្សរ X','Label X'),labelY:L('អក្សរ Y','Label Y'),labelRotation:L('បង្វិលអក្សរ','Label rotation')})[key]}<input type="number" min={min} max={max} step={step} value={selected[key]??fallback} onChange={e=>edit({[key]:bounded(e.target.valueAsNumber,min,max,fallback)})}/></label>)}</div>
      {selected.type==='curve' && <label>{L('ភាពកោង','Curvature')}<input type="range" min="-1" max="1" step=".05" value={selected.curvature??.6} onChange={e=>edit({curvature:Number(e.target.value)})}/></label>}
      {['road','curve','bridge','intersection','t-junction'].includes(selected.type) && <label>{L('រចនាបថផ្លូវ','Road styling')}<select value={selected.roadStyle||'lanes'} onChange={e=>edit({roadStyle:e.target.value})}>{['lanes','solid','boundary'].map(option=><option key={option} value={option}>{({lanes:L('គំនូសគន្លងផ្លូវ','Lane markings'),solid:L('គំនូសជាប់','Solid line'),boundary:L('ព្រំផ្លូវ','Road boundaries')})[option]}</option>)}</select></label>}
      </details><div className="map-property-section"><h4>{L('ការរៀបចំធាតុ','Arrange elements')}</h4>
      <label>{L('ភ្ជាប់ ឬតម្រឹមជាមួយ','Connect or align with')}<select value={targetId} onChange={e=>setTargetId(e.target.value)}><option value="">{L('ជ្រើសធាតុ','Choose element')}</option>{config.nodes.filter(node=>node.id!==selection).map((node,i)=><option key={node.id} value={node.id}>{i+1}. {node.label[locale]||MAP_TYPE_NAMES[node.type]?.[en?1:0]}</option>)}</select></label>
      <div className="map-compact-actions"><button type="button" disabled={!target||config.nodes.length>MAP_LIMIT-3} onClick={()=>patch({nodes:[...config.nodes,...connectMapNodes(selected,target,config)]})}><Route size={16}/>{L('ភ្ជាប់ផ្លូវ','Connect road')}</button><button type="button" disabled={!target} onClick={()=>edit({y:target.y})}>{L('តម្រឹមផ្ដេក','Align horizontal')}</button><button type="button" disabled={!target} onClick={()=>edit({x:target.x})}>{L('តម្រឹមបញ្ឈរ','Align vertical')}</button></div>
      <div className="map-compact-actions"><button type="button" onClick={()=>edit({x:.5})}>{L('កណ្ដាលផ្ដេក','Center X')}</button><button type="button" onClick={()=>edit({y:.5})}>{L('កណ្ដាលបញ្ឈរ','Center Y')}</button><button type="button" disabled={config.nodes.length>=MAP_LIMIT} onClick={duplicate}><Copy size={16}/>{L('ចម្លង','Duplicate')}</button>
      {[-1,1].map(delta=><button key={delta} type="button" disabled={!config.nodes[config.nodes.indexOf(selected)+delta]} onClick={()=>{const nodes=[...config.nodes],index=nodes.indexOf(selected);[nodes[index],nodes[index+delta]]=[nodes[index+delta],nodes[index]];patch({nodes});}}>{delta<0?<ArrowDown size={16}/>:<ArrowUp size={16}/>} {delta<0?L('ទៅក្រោយ','Send backward'):L('ទៅមុខ','Bring forward')}</button>)}<button type="button" className="map-danger" onClick={remove}><Trash2 size={16}/>{L('លុប','Delete')}</button></div>
      </div>
    </> : <>
      <label className="map-checkbox"><input type="checkbox" checked={config.enabled} onChange={e=>patch({enabled:e.target.checked})}/>{L('បង្ហាញផែនទី','Show venue map')}</label>
      <label>{L('ទំហំផ្ទៃ','Canvas ratio')}<select value={config.aspectRatio} onChange={e=>patch({aspectRatio:e.target.value})}>{['landscape','portrait','square'].map(option=><option key={option} value={option}>{({landscape:L('ទទឹង','Landscape'),portrait:L('បញ្ឈរ','Portrait'),square:L('ការ៉េ','Square')})[option]}</option>)}</select></label>
      <label>{L('ក្ដារពណ៌','Map palette')}<select value={config.theme} onChange={e=>patch({theme:e.target.value})}>{Object.entries(MAP_THEME_TOKENS).map(([id,theme])=><option key={id} value={id}>{theme.name}</option>)}</select></label>
      {['km','en'].map(lang=><label key={lang}>{lang==='km'?'ការណែនាំជាភាសាខ្មែរ':'English directions note'}<textarea lang={lang} maxLength={1500} value={config.description[lang]} onChange={e=>patch({description:{...config.description,[lang]:e.target.value}})}/></label>)}
      {['showLegend','showDirectionsButton'].map(key=><label key={key} className="map-checkbox"><input type="checkbox" checked={config.settings[key]} onChange={e=>patch({settings:{...config.settings,[key]:e.target.checked}})}/>{key==='showLegend'?L('បង្ហាញស្លាកទីតាំង','Show landmark legend'):L('បង្ហាញប៊ូតុងទីតាំង','Show directions button')}</label>)}
      <button type="button" className="map-danger" onClick={async()=>{if(await feedback.confirm({title:L('លុបផែនទីបច្ចុប្បន្ន?','Reset this map?'),message:L('អាចប្រើមិនធ្វើវិញ ដើម្បីស្ដារផែនទី។','Undo can restore the current design.'),destructive:true})){onChange(blankMap());setSelection('');}}}>{L('កំណត់ផែនទីឡើងវិញ','Reset map')}</button>
    </>}
    <h3><Layers size={16}/>{L('ស្រទាប់','Layers')}</h3><div className="map-layer-list">{config.nodes.map((node,i)=><button key={node.id} type="button" aria-pressed={selection===node.id} onClick={()=>setSelection(node.id)}>{i+1}. {node.label[locale]||MAP_TYPE_NAMES[node.type]?.[en?1:0]}</button>)}</div>
    {selected && <button type="button" onClick={()=>setSelection('')}>{L('ការកំណត់ផែនទី','Map settings')}</button>}
  </aside>;
  return <Modal isOpen onClose={close} showHeader={false} ariaLabel={L('រចនាផែនទីទីតាំងកម្មវិធី','Illustrated map designer')} size="full" className="map-designer-modal" backdropClassName="map-designer-backdrop" closeOnBackdropClick={false} footer={<>
    <button type="button" onClick={close}>{L('បោះបង់','Cancel')}</button>
    <label className="map-checkbox"><input type="checkbox" checked={transparent} onChange={e=>setTransparent(e.target.checked)}/>{L('ផ្ទៃថ្លា','Transparent background')}</label>
    {editable && <div className="map-export-actions"><Download size={16} aria-hidden="true"/>{['svg','png','webp'].map(format=><button type="button" key={format} disabled={busy} onClick={()=>download(format)}>{format.toUpperCase()}</button>)}</div>}
    <button type="button" className="map-primary" disabled={busy||!editable||!onSave||!value} onClick={save}><Save size={16}/>{L('រក្សាទុកការរចនា','Save design')}</button>
  </>}>
    <div className="map-designer" data-panel={mobilePanel} data-preview={preview||undefined} onKeyDown={keydown}>
      <header className="map-designer-header"><span className="map-studio-mark" aria-hidden="true"><MapPinned size={24}/></span><div><h2>{L('ស្ទូឌីយោផែនទី','Map Studio')}</h2><span className="map-studio-subtitle">{L('ផែនទីទីតាំងកម្មវិធីរបស់អ្នក','Your celebration, mapped beautifully')}</span></div><span className="map-save-state" role="status" data-saved={saved&&value?true:undefined}><Check size={14}/>{statusLabel}</span>
        {editable && <><button type="button" title={L('មិនធ្វើវិញ','Undo design')} aria-label={L('មិនធ្វើវិញ','Undo design')} disabled={canUndo===false||busy} onClick={onUndo}><Undo2 size={18}/></button><button type="button" title={L('ធ្វើឡើងវិញ','Redo design')} aria-label={L('ធ្វើឡើងវិញ','Redo design')} disabled={canRedo===false||busy} onClick={onRedo}><Redo2 size={18}/></button></>}
        <button type="button" aria-label={L('បិទកម្មវិធីរចនា','Close designer')} onClick={close}><X size={20}/></button>
      </header>
      {!allowed && !previewOnly && <div role="alert" className="map-access-changed">{L('មិនទាន់អាចផ្ទៀងផ្ទាត់សិទ្ធិ។ ការកែប្រែនៅតែនៅទីនេះ។','Access is no longer verified. Your edits remain here.')}<button type="button" onClick={onReviewAccess}>{L('ពិនិត្យសិទ្ធិ','Review access')}</button></div>}
      {saveError && ['failed','conflict','expired','offline'].includes(savePhase) && <div role="alert" className="map-access-changed">{saveError}</div>}
      <div className="map-designer-workspace">
        {activeEditing && library}
        <section className="map-canvas-panel" aria-label={L('ផ្ទៃរចនាផែនទី','Map canvas')}>
          <div className="map-canvas-toolbar">{editable && <><button type="button" aria-label={L('ជ្រើស និងផ្លាស់ទី','Select and move')} aria-pressed={tool==='select'&&!preview} onClick={()=>{setTool('select');setPreview(false);}}><MousePointer2 size={17}/></button><button type="button" aria-label={L('អូសផ្ទៃរចនា','Pan canvas')} aria-pressed={tool==='pan'&&!preview} onClick={()=>{setTool('pan');setPreview(false);}}><Hand size={17}/></button><label className="map-checkbox"><input type="checkbox" checked={snapping} onChange={e=>setSnapping(e.target.checked)}/>{L('តម្រឹមក្រឡា','Snap')}</label></>}
            <button type="button" aria-label={L('បង្រួម','Zoom out')} disabled={zoom<=.5} onClick={()=>setZoom(z=>Math.max(.5,z-.25))}><Minus size={16}/></button><output>{Math.round(zoom*100)}%</output><button type="button" aria-label={L('ពង្រីក','Zoom in')} disabled={zoom>=3} onClick={()=>setZoom(z=>Math.min(3,z+.25))}><Plus size={16}/></button><button type="button" aria-label={L('បង្ហាញផ្ទៃទាំងមូល','Fit canvas')} onClick={()=>{setZoom(1);viewport.current?.scrollTo({left:0,top:0});}}><Scan size={16}/></button>
            {editable && <button type="button" aria-pressed={preview} onClick={()=>{cancelGesture();setPreview(p=>!p);}}><Eye size={16}/>{L('មើលជាមុន','Preview')}</button>}
          </div>
          <div ref={viewport} className="map-canvas-viewport" data-interactive={activeEditing||undefined}><div className="map-canvas-sheet" style={{width:`${zoom*100}%`}}><MapDrawing svgRef={svg} value={display} locale={locale} transparent={transparent} selected={activeEditing?selection:undefined} grid={activeEditing&&snapping} guides={guides} onSelect={activeEditing?setSelection:undefined} onPointerDown={activeEditing?down:undefined} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancelGesture} onKeyDown={activeEditing?keydown:undefined}/></div></div>
          <div className="map-canvas-meta"><span><Shapes size={14} aria-hidden="true"/>{config.nodes.length} {L('ធាតុ','elements')}</span><span className="map-canvas-hint">{L('ព្រួញ៖ ផ្លាស់ទី · Alt + ព្រួញ៖ បង្វិល','Arrow keys to move · Alt + arrow to rotate')}</span><span>{({landscape:L('ទទឹង','Landscape'),portrait:L('បញ្ឈរ','Portrait'),square:L('ការ៉េ','Square')})[config.aspectRatio]}</span></div>
          {status && <p role="status" className="map-export-status">{status}</p>}
        </section>
        {activeEditing && properties}
      </div>
      {activeEditing && <nav className="map-mobile-tabs" aria-label={L('ឧបករណ៍រចនា','Designer panels')}>{[['library',Layers,L('ធាតុ','Elements')],['canvas',Route,L('ផែនទី','Canvas')],['properties',SlidersHorizontal,L('កែសម្រួល','Properties')]].map(([id,Icon,label])=><button key={id} type="button" aria-pressed={mobilePanel===id} onClick={()=>setMobilePanel(id)}><Icon size={18}/>{label}</button>)}</nav>}
    </div>
  </Modal>;
}
