// Original secular line motifs. Labels describe the host's selected ceremony;
// the drawings do not prescribe a religious practice or a ritual sequence.
const paths = {
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 3h2" /></>,
  gathering: <><circle cx="8" cy="7" r="3" /><circle cx="17" cy="8" r="2" /><path d="M2 21v-4a6 6 0 0 1 12 0v4m2-7a4 4 0 0 1 6 4v3" /></>,
  blessing: <><path d="m3 15 5-3 4 2 4-2 5 3M3 19l5-3 4 3 4-3 5 3M12 3v4M6 5l2 3m10-3-2 3" /></>,
  offering: <><path d="M3 16h18l-3 4H6ZM6 16V9h12v7M4 9h16M9 9c-5-5 3-7 3 0 0-7 8-5 3 0M12 9v7" /></>,
  meal: <><path d="M3 18h18M5 16a7 7 0 0 1 14 0ZM12 7V5m-2 0h4M3 21h18" /></>,
  reception: <><path d="M5 4h5v5a2.5 2.5 0 0 1-5 0ZM14 4h5v5a2.5 2.5 0 0 1-5 0ZM7.5 12v7m9-7v7M5 20h5m4 0h5M11 2l1 2 1-2" /></>,
};
export default function CeremonyIcon({ iconKey, size = 22 }) {
  if (iconKey === 'none') return null;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{Object.hasOwn(paths, iconKey) ? paths[iconKey] : paths.calendar}</svg>;
}
