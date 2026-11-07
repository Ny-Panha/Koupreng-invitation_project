import { ROYAL_ASSETS } from '../model/royalGardenPresentation';
import useRoyalMotionBudget from '../hooks/useRoyalMotionBudget';

export default function RoyalGardenMotionLayer({ settings, reduced, paused = false }) {
  const budget = useRoyalMotionBudget(settings.preset, reduced);
  if (!budget.particles) return null;
  const types = [settings.sparkles && 'star', settings.petals && 'petal', settings.goldDust && 'dust'].filter(Boolean);
  return <div className="rg-motion-layer" aria-hidden="true" data-paused={paused || budget.paused} data-preset={settings.preset}>
    {types.length > 0 && Array.from({ length: budget.particles }, (_, index) => <i key={index} data-effect={types[index % types.length]} style={{ '--rg-x': `${index % 2 ? 90 + index % 7 : 3 + index % 6}%`, '--rg-y': `${(index * 29 + 12) % 92}%`, '--rg-delay': `${-index * 3.7}s`, '--rg-flight': `${budget.duration + index % 4 * 3}s`, '--rg-drift': `${index % 2 ? -24 : 30}px` }} />)}
    {settings.petals && Array.from({length:Math.max(2,Math.ceil(budget.butterflies/2))},(_,index)=><span key={`flower-${index}`} className="rg-flower-drift" style={{'--rg-x':`${index%2 ? 91 : 2}%`,'--rg-y':`${30+index*23}%`,'--rg-delay':`${-index*6}s`,'--rg-flight':`${18+index*3}s`}}><svg viewBox="0 0 40 40" aria-hidden="true">{[0,72,144,216,288].map(angle=><ellipse key={angle} cx="20" cy="11" rx="6" ry="10" transform={`rotate(${angle} 20 20)`} fill="currentColor" fillOpacity=".65" stroke="#f2d693" strokeWidth=".6"/>)}<circle cx="20" cy="20" r="3.5" fill="#f2d693"/></svg></span>)}
    {settings.butterfly && Array.from({length:budget.butterflies},(_,index)=><span key={`butterfly-${index}`} className="rg-butterfly-flight" style={{'--rg-x':`${index%2 ? 89 : 2}%`,'--rg-y':`${15+(index*19)%75}%`,'--rg-delay':`${-index*4.3}s`,'--rg-flight':`${16+index*2}s`,'--rg-drift':`${index%2 ? -26 : 26}px`,'--rg-size':`${25+index%3*6}px`}}><img src={ROYAL_ASSETS.butterfly} alt="" width="120" height="120" decoding="async" onError={event => { event.currentTarget.hidden = true; }} /></span>)}
  </div>;
}
