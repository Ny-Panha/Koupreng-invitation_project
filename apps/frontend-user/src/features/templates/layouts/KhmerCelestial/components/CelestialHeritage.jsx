// Original non-figural studies; see docs/phase10/06-artwork-sources-and-licenses.md.
export function RomduolEmblem({ className = '' }) {
  return <svg className={`kc-romduol ${className}`} viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false">
    {[0, 120, 240].map(angle => <path key={angle} transform={`rotate(${angle} 40 40)`} d="M40 44C20 39 16 18 31 7C43 11 54 28 40 44Z" fill="var(--kc-paper)" stroke="var(--kc-gold)" strokeWidth="1.2" />)}
    {[60, 180, 300].map(angle => <path key={angle} transform={`rotate(${angle} 40 40)`} d="M40 43C30 35 30 23 40 18C50 25 49 36 40 43Z" fill="var(--kc-gold-light)" stroke="var(--kc-gold)" strokeWidth=".8" />)}
    <circle cx="40" cy="40" r="4" fill="var(--kc-gold)" />
  </svg>;
}

export default function CelestialHeritage({ className = '' }) {
  return <div className={`kc-heritage ${className}`} aria-hidden="true">
    {['nw', 'ne', 'sw', 'se'].map(corner => <svg key={corner} className={`kc-heritage__corner kc-heritage__corner--${corner}`} viewBox="0 0 140 140" fill="none" focusable="false">
      <path d="M6 132V30Q6 6 30 6H132M16 118V34Q16 16 34 16H118" stroke="currentColor" strokeWidth=".8" />
      <path d="M27 95C29 68 49 67 55 49C61 28 39 27 38 43C38 54 51 58 65 48C78 38 80 29 96 26C78 21 66 26 61 34C59 14 31 13 26 32C22 48 37 58 47 54C34 62 30 76 27 95Z" fill="currentColor" fillOpacity=".13" stroke="currentColor" strokeWidth="1" />
      <path d="M25 103C42 85 65 78 77 60C81 76 69 88 55 90C63 91 66 97 65 104C52 99 42 101 25 103ZM64 30C81 29 89 18 106 23C99 31 91 34 82 33" stroke="currentColor" strokeWidth="1" />
      <circle cx="25" cy="25" r="2" fill="currentColor" />
    </svg>)}
    <RomduolEmblem className="kc-heritage__flower" />
  </div>;
}
