import { MAP_SYMBOL_PATHS } from '../../templates/shared/mapSymbols';

// Reuse the map's original landmark artwork at a readable control size.
const ROUTES = {
  road: 'M2 7h20M2 17h20',
  curve: 'M2 18C15 18 9 6 22 6M2 12C9 12 8 2 22 2',
  intersection: 'M2 8h6V2m8 0v6h6M2 16h6v6m8 0v-6h6',
  't-junction': 'M2 7h20M2 15h6v7m8 0v-7h6',
  roundabout: 'M2 12h4m12 0h4M12 2v4m0 12v4M12 6a6 6 0 1 0 0 12 6 6 0 1 0 0-12',
  bridge: 'M2 8h20M2 16h20M6 5v14M18 5v14',
  arrow: 'M3 12h18m-6-6 6 6-6 6',
  label: 'M4 6V3h16v3M12 3v18m-4 0h8',
};

export default function MapToolIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={ROUTES[type] || MAP_SYMBOL_PATHS[type] || MAP_SYMBOL_PATHS.landmark}/>
    {type==='road' && <path d="M2 12h20" strokeDasharray="3 3"/>}
  </svg>;
}
