// Original fictitious schematics. No real geography, tiles or copied topology.
const label = (km = '', en = '') => ({ km, en });
const node = (type, x, y, width, height, rotation = 0, km = '', en = '') => ({ type, x, y, width, height, rotation, label: label(km, en) });
const road = (x, y, width = .6, rotation = 0) => node('road', x, y, width, .035, rotation);
const destination = () => node('destination', .76, .3, .1, .12, 0, 'ទីតាំងកម្មវិធី', 'Event venue');
export const MAP_PRESETS = [
  { id: 'main-road', name: 'Main road to venue', nodes: [road(.43, .7, .66), road(.76, .5, .24, 90), node('arrow', .56, .7, .16, .04), destination(), node('parking', .5, .3, .08, .1, 0, 'ចំណត', 'Parking')] },
  { id: 'multi-turn', name: 'Multi-turn route', nodes: [road(.25, .75, .3), road(.4, .55, .24, 90), road(.58, .35, .36), node('arrow', .4, .55, .12, .04, -90), destination()] },
  { id: 'landmarks', name: 'Landmark route', nodes: [road(.5, .65, .75), road(.76, .45, .24, 90), node('market', .24, .43, .12, .12, 0, 'ផ្សារ', 'Market'), node('school', .49, .78, .1, .1, 0, 'សាលារៀន', 'School'), destination()] },
  { id: 'intersection', name: 'Urban intersection', nodes: [road(.5, .65, .75), road(.4, .45, .5, 90), node('arrow', .59, .65, .13, .04), destination(), node('building', .2, .25, .1, .14, 0, 'អគារ', 'Building')] },
  { id: 'rural', name: 'Rural road', nodes: [road(.48, .75, .7), road(.76, .48, .3, 90), node('pagoda', .25, .44, .13, .12, 0, 'វត្ត', 'Pagoda'), node('arrow', .55, .75, .13, .04), destination()] },
  { id: 'minimal', name: 'Minimal diagram', nodes: [road(.46, .65, .6), node('arrow', .46, .54, .18, .04), node('destination', .76, .5, .1, .12, 0, 'ទីតាំងកម្មវិធី', 'Event venue')] },
];
export function createMapPreset(id) {
  const preset = MAP_PRESETS.find(item => item.id === id);
  return preset ? preset.nodes.map(item => ({ ...item, label: { ...item.label }, id: crypto.randomUUID() })) : [];
}
