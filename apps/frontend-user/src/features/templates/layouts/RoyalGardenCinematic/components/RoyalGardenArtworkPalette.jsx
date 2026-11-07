// Recolor only the supplied blue artwork. Gold, alpha and owner photographs stay intact.
export default function RoyalGardenArtworkPalette({ id }) {
  return <svg width="0" height="0" className="rg-palette-filter" aria-hidden="true" focusable="false"><defs><filter id={id} colorInterpolationFilters="sRGB">
    <feColorMatrix in="SourceGraphic" result="blue-mask" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 3 0 0" />
    <feColorMatrix in="SourceGraphic" result="wine" values=".4 .65 .65 0 .025  .04 .08 .08 0 0  .2 .25 .3 0 .015  0 0 0 1 0" />
    <feComposite in="wine" in2="blue-mask" operator="in" result="colored" />
    <feComposite in="SourceGraphic" in2="blue-mask" operator="out" result="original" />
    <feComposite in="colored" in2="original" operator="arithmetic" k2="1" k3="1" />
  </filter></defs></svg>;
}
