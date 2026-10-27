import { useEffect, useState } from 'react';
import { motionBudget } from '../model/royalGardenPresentation';

export default function useRoyalMotionBudget(preset, reduced) {
  const [hidden, setHidden] = useState(() => document.hidden);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [saveData, setSaveData] = useState(() => navigator.connection?.saveData === true);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const visibility = () => setHidden(document.hidden);
    const resize = () => setMobile(query.matches);
    const connection = () => setSaveData(navigator.connection?.saveData === true);
    document.addEventListener('visibilitychange', visibility);
    query.addEventListener?.('change', resize); navigator.connection?.addEventListener?.('change', connection);
    return () => { document.removeEventListener('visibilitychange', visibility); query.removeEventListener?.('change', resize); navigator.connection?.removeEventListener?.('change', connection); };
  }, []);
  return { ...motionBudget(preset, { reduced, saveData, mobile }), paused: hidden, saveData };
}
