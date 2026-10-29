export const LEGACY_MAP_NODE_TYPES = ['destination', 'road', 'arrow', 'label', 'building', 'intersection', 'market', 'school', 'pagoda', 'parking'];
export const MAP_NODE_TYPES = [...LEGACY_MAP_NODE_TYPES, 'curve', 't-junction', 'roundabout', 'venue', 'house', 'hotel', 'restaurant', 'hospital', 'gas', 'bank', 'bridge', 'landmark', 'info', 'decoration'];
export const MAP_LIMIT = 80;
export const MAP_THEME_TOKENS = {
  ivory: { name: 'Ivory', background: '#fff8e8', ink: '#725425', road: '#997434', accent: '#35658a', divider: '#dac8a1' },
  ink: { name: 'Garden ink', background: '#f2f4f1', ink: '#304338', road: '#627564', accent: '#8c6635', divider: '#bdc9bc' },
  rose: { name: 'Rose', background: '#fff2ef', ink: '#7f3543', road: '#a87562', accent: '#6d7562', divider: '#e1c3b8' },
  'royal-gold': { name: 'Royal Gold', background: '#fff9eb', ink: '#654817', road: '#9b7135', accent: '#254e7a', divider: '#d6bf83' },
  botanical: { name: 'Botanical Wedding', background: '#fbfaf1', ink: '#354b3a', road: '#a28854', accent: '#6e8663', divider: '#c9d1b8' },
  'royal-blue': { name: 'Royal Blue', background: '#102c4c', ink: '#f1dfb0', road: '#c9a15a', accent: '#f8e6b4', divider: '#827047' },
};
export const MAP_THEMES = Object.fromEntries(Object.entries(MAP_THEME_TOKENS).map(([key, value]) => [key, [value.background, value.ink]]));
export const MAP_FONTS = { KANTUMRUY: 'Kantumruy Pro, sans-serif', MOUL: 'Moul, serif', SERIF: 'Cormorant Garamond, Kantumruy Pro, serif' };
export const MAP_TOOL_GROUPS = [
  { id: 'roads', en: 'Roads & routes', km: 'ផ្លូវ និងទិសដៅ', types: ['road', 'curve', 'intersection', 't-junction', 'roundabout', 'bridge', 'arrow'] },
  { id: 'places', en: 'Landmarks', km: 'ទីតាំងសម្គាល់', types: ['venue', 'destination', 'house', 'hotel', 'restaurant', 'school', 'hospital', 'market', 'pagoda', 'parking', 'gas', 'bank', 'building', 'landmark', 'info'] },
  { id: 'labels', en: 'Labels & details', km: 'អក្សរ និងការតុបតែង', types: ['label', 'decoration'] },
];
export const MAP_TYPE_NAMES = {
  road: ['ផ្លូវត្រង់', 'Straight road'], curve: ['ផ្លូវកោង', 'Curved road'], intersection: ['ផ្លូវប្រសព្វ', 'Cross intersection'], 't-junction': ['ផ្លូវបំបែកបី', 'T intersection'], roundabout: ['រង្វង់មូល', 'Roundabout'], bridge: ['ស្ពាន', 'Bridge'], arrow: ['ព្រួញទិសដៅ', 'Direction arrow'],
  venue: ['ទីតាំងមង្គលការ', 'Wedding venue'], destination: ['គោលដៅ', 'Destination pin'], house: ['ផ្ទះ', 'House'], hotel: ['សណ្ឋាគារ', 'Hotel'], restaurant: ['ភោជនីយដ្ឋាន', 'Restaurant'], school: ['សាលារៀន', 'School'], hospital: ['មន្ទីរពេទ្យ', 'Hospital'], market: ['ផ្សារ', 'Market'], pagoda: ['វត្ត', 'Pagoda'], parking: ['ចំណត', 'Parking'], gas: ['ស្ថានីយប្រេង', 'Gas station'], bank: ['ធនាគារ', 'Bank'], building: ['អគារ', 'Building'], landmark: ['សញ្ញាសម្គាល់', 'Landmark'], info: ['ព័ត៌មាន', 'Information'], label: ['អក្សរ', 'Text label'], decoration: ['ស្លឹកលម្អ', 'Botanical detail'],
};
export const mapSize = value => value?.aspectRatio === 'portrait' ? [600, 900] : value?.aspectRatio === 'square' ? [800, 800] : [1000, 600];
export const bounded = (value, min, max, fallback = min) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
export const blankMap = () => ({ version: 2, enabled: false, aspectRatio: 'landscape', theme: 'royal-blue', description: { km: '', en: '' }, nodes: [], settings: { showLegend: true, showDirectionsButton: true } });

// V1 coordinates, identities, order and text remain intact. Only an explicit edit
// upgrades the stored version; opening a saved map never mutates the draft.
export function normalizeMap(value) {
  if (!value || ![1, 2].includes(value.version)) return blankMap();
  return { ...value, version: 2, description: { km: '', en: '', ...value.description }, settings: { showLegend: true, showDirectionsButton: true, ...value.settings }, nodes: (value.nodes || []).slice(0, MAP_LIMIT).map(node => ({ ...node, label: { km: '', en: '', ...node.label } })) };
}
export function fitMapNode(node, map) {
  let width = bounded(node.width, .02, .8), height = bounded(node.height, .02, .8);
  const [w, h] = mapSize(map), angle = bounded(node.rotation, -180, 180, 0) * Math.PI / 180;
  const extent = () => [(Math.abs(Math.cos(angle)) * width * w + Math.abs(Math.sin(angle)) * height * h) / w, (Math.abs(Math.sin(angle)) * width * w + Math.abs(Math.cos(angle)) * height * h) / h];
  const [ex, ey] = extent(), scale = Math.min(1, .88 / ex, .88 / ey);
  width = Math.max(.02, width * scale); height = Math.max(.02, height * scale);
  const [rx, ry] = extent();
  return { ...node, width, height, x: bounded(node.x, Math.max(.05, rx / 2 + .01), Math.min(.95, 1 - rx / 2 - .01)), y: bounded(node.y, Math.max(.05, ry / 2 + .01), Math.min(.95, 1 - ry / 2 - .01)) };
}
export function newMapNode(type, map) {
  const route = ['road', 'curve', 'arrow', 'bridge'].includes(type);
  return fitMapNode({ id: crypto.randomUUID(), type, x: .5, y: .5, width: route ? .34 : .12, height: type === 'curve' ? .15 : route ? .035 : .13, rotation: 0, label: { km: '', en: '' }, ...(type === 'curve' ? { curvature: .6 } : {}) }, map);
}
export function roadEndpoints(node, map) {
  if (!['road', 'curve', 'bridge'].includes(node.type)) return [{ x: node.x, y: node.y }];
  const [w, h] = mapSize(map), angle = node.rotation * Math.PI / 180;
  return [-1, 1].map(sign => ({ x: node.x + sign * node.width / 2 * Math.cos(angle), y: node.y + sign * node.width * w / (2 * h) * Math.sin(angle) }));
}
export function moveMapNode(node, x, y, nodes, map, snap = true) {
  let next = fitMapNode({ ...node, x: snap ? Math.round(x * 40) / 40 : x, y: snap ? Math.round(y * 40) / 40 : y }, map);
  const guides = [];
  if (!snap) return { node: next, guides };
  const [w, h] = mapSize(map);
  let nearest;
  for (const other of nodes.filter(other => other.id !== node.id)) {
    for (const end of roadEndpoints(next, map)) for (const target of roadEndpoints(other, map)) {
      const distance = Math.hypot((end.x - target.x) * w, (end.y - target.y) * h);
      if (distance < 20 && (!nearest || distance < nearest.distance)) nearest = { distance, dx: target.x - end.x, dy: target.y - end.y };
    }
    for (const axis of ['x', 'y']) if (Math.abs(next[axis] - other[axis]) < .012) guides.push({ axis, value: other[axis] });
  }
  if (nearest) next = fitMapNode({ ...next, x: next.x + nearest.dx, y: next.y + nearest.dy }, map);
  else for (const guide of guides) next = fitMapNode({ ...next, [guide.axis]: guide.value }, map);
  return { node: next, guides };
}
export function connectMapNodes(first, second, map) {
  const [w, h] = mapSize(map);
  const pairs = roadEndpoints(first, map).flatMap(a => roadEndpoints(second, map).map(b => ({ a, b, length: Math.hypot((b.x - a.x) * w, (b.y - a.y) * h) })));
  const { a, b, length } = pairs.sort((a, b) => a.length - b.length)[0];
  if (length < w * .02) return [];
  const count = Math.ceil(length / (w * .7));
  return Array.from({ length: count }, (_, i) => ({ ...newMapNode('road', map), x: a.x + (b.x - a.x) * (i + .5) / count, y: a.y + (b.y - a.y) * (i + .5) / count, width: length / count / w, height: .035, rotation: Math.atan2((b.y - a.y) * h, (b.x - a.x) * w) * 180 / Math.PI }));
}
