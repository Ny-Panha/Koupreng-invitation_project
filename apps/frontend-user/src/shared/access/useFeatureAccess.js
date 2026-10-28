import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEventWorkspace } from '@/features/events/workspace/EventContext';
import { useAccountEntitlements } from './entitlementContext';
import { accessDecision } from './accessDecision';
import { feedback } from '../feedback/feedback';

export function useFeatureAccess(options = {}) {
  const { isAuthenticated } = useAuth();
  const event = useEventWorkspace();
  const account = useAccountEntitlements();
  const context = { authenticated: isAuthenticated !== false, event: event?.eventId ? event : undefined, account, ...options };
  const decision = accessDecision(context);
  const explain = () => {
    if (decision.reason === 'ALLOWED') return true;
    void feedback.access({ ...context, decision });
    return false;
  };
  return { decision, allowed: decision.reason === 'ALLOWED', explain, context, refresh: account.refresh };
}
