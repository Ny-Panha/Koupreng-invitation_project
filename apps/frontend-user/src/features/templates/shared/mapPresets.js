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
  { id: 'roundabout', name: 'Roundabout route', theme: 'royal-gold', nodes: [road(.3,.6,.28),road(.7,.6,.28),node('roundabout',.5,.6,.16,.24),road(.75,.4,.24,90),node('venue',.75,.2,.1,.12,0,'សាលាគំរូ','Example venue'),node('arrow',.3,.6,.12,.04)] },
  { id: 'hotel', name: 'Restaurant & hotel', theme: 'royal-gold', nodes: [road(.5,.65,.7),road(.7,.45,.24,90),node('hotel',.7,.23,.11,.14,0,'សណ្ឋាគារគំរូ','Example hotel'),node('restaurant',.25,.35,.11,.14,0,'ភោជនីយដ្ឋានគំរូ','Example restaurant'),node('parking',.86,.45,.08,.1,0,'ចំណតគំរូ','Example parking')] },
  { id: 'botanical', name: 'Botanical wedding map', theme: 'botanical', nodes: [road(.43,.65,.6),road(.73,.45,.24,90),node('venue',.73,.24,.1,.13,0,'ទីតាំងគំរូ','Example venue'),node('pagoda',.25,.36,.11,.12,0,'វត្តគំរូ','Example pagoda'),node('decoration',.14,.16,.09,.12),node('decoration',.87,.78,.09,.12,180),node('arrow',.5,.65,.12,.04)] },
  { id: 'royal-blue', name: 'Royal blue & gold', theme: 'royal-blue', nodes: [road(.43,.68,.6),road(.73,.47,.25,90),node('venue',.73,.23,.12,.14,0,'ទីតាំងមង្គលការគំរូ','Example wedding venue'),node('pagoda',.23,.34,.11,.14,0,'វត្តគំរូ','Example pagoda'),node('parking',.47,.3,.08,.12,0,'ចំណតគំរូ','Example parking'),node('arrow',.53,.68,.13,.035),node('label',.35,.84,.2,.05,0,'ផ្លូវគំរូ','Example main road')] },
];
export function createMapPreset(id, { idPrefix } = {}) {
  const preset = MAP_PRESETS.find(item => item.id === id);
  return preset ? preset.nodes.map((item, index) => ({ ...item, label: { ...item.label }, id: idPrefix ? `${idPrefix}-${index}` : crypto.randomUUID() })) : [];
}

export const MAP_EXAMPLE_DESCRIPTION = { km: 'ផែនទីគំរូ មិនមែនទីតាំងពិតទេ។ សូមកែសម្រួលផ្លូវ និងស្លាកមុនប្រើប្រាស់។', en: 'Example diagram, not a real location. Replace the roads and labels before use.' };
export const MAP_PRESET_NAMES_KM = { 'main-road':'ផ្លូវមេទៅទីតាំង', 'multi-turn':'ផ្លូវបត់ច្រើន', landmarks:'ផ្លូវមានទីតាំងសម្គាល់', intersection:'ផ្លូវប្រសព្វក្នុងក្រុង', rural:'ផ្លូវជនបទ', minimal:'ផែនទីសាមញ្ញ', roundabout:'ផ្លូវឆ្លងរង្វង់មូល', hotel:'ភោជនីយដ្ឋាន និងសណ្ឋាគារ', botanical:'ផែនទីសួនផ្កា', 'royal-blue':'រាជខៀវ និងមាស' };
