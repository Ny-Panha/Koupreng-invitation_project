import { ROYAL_ASSETS } from '../model/royalGardenPresentation';
import useRoyalMotionBudget from '../hooks/useRoyalMotionBudget';

export default function RoyalGardenMotionLayer({ settings, reduced, paused = false }) {
  const budget = useRoyalMotionBudget(settings.preset, reduced);
  if (!budget.particles) return null;
  const types = [settings.sparkles && 'star', settings.petals && 'petal', settings.goldDust && 'dust'].filter(Boolean);
  return <div className="rg-motion-layer" aria-hidden="true" data-paused={paused || budget.paused} data-preset={settings.preset}>
    {types.length > 0 && Array.from({ length: budget.particles }, (_, index) => <i key={index} data-effect={types[index % types.length]} style={{ '--rg-x': `${index % 2 ? 90 + index % 7 : 3 + index % 6}%`, '--rg-y': `${(index * 29 + 12) % 92}%`, '--rg-delay': `${-index * 3.7}s`, '--rg-flight': `${budget.duration + index % 4 * 3}s`, '--rg-drift': `${index % 2 ? -24 : 30}px` }} />)}
    {settings.petals && <span className="rg-flower-drift" />}
    {settings.butterfly && budget.butterflies > 0 && <span className="rg-butterfly-flight"><img src={ROYAL_ASSETS.butterfly} alt="" width="120" height="120" decoding="async" onError={event => { event.currentTarget.hidden = true; }} /></span>}
  </div>;
}
