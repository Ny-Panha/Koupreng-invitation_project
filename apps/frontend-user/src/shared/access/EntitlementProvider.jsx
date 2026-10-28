import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import subscriptionService from '@/features/subscriptions/subscriptionService';
import { EntitlementContext } from './entitlementContext';

export default function EntitlementProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const id = user?.id || user?.userId;
  const [state, setState] = useState({ value: null, verified: false, loading: false });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    let active = true;
    if (!isAuthenticated || !id) { setState({ value: null, verified: false, loading: false }); return; }
    setState({ value: null, verified: false, loading: true });
    subscriptionService.entitlements({ suppressAuthRedirect: true }).then(value => { if (active) setState({ value, verified: Boolean(value?.packagePlan && Array.isArray(value.features)), loading: false, accountId: id }); })
      .catch(() => { if (active) setState({ value: null, verified: false, loading: false }); });
    return () => { active = false; };
  }, [id, isAuthenticated, revision]);
  useEffect(() => {
    if (!isAuthenticated) return;
    window.addEventListener('focus', refresh); window.addEventListener('koupreng:access-refresh', refresh);
    const timer = setInterval(refresh, 60_000);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('koupreng:access-refresh', refresh); };
  }, [isAuthenticated, refresh]);
  return <EntitlementContext.Provider value={{ ...state, verified: state.accountId === id && state.verified, value: state.accountId === id ? state.value : null, refresh }}>{children}</EntitlementContext.Provider>;
}
