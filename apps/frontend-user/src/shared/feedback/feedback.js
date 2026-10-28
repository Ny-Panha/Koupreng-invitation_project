import { toast } from '../ui/toast';
import { accessFailure } from '../access/accessDecision';

const pending = new Map();
let sequence = 0;
export function settleFeedback(id, value = false) { pending.get(id)?.(value); pending.delete(id); }
export function cancelFeedback() { for (const id of pending.keys()) settleFeedback(id); }
function show(kind, options) {
  if (typeof window === 'undefined') return Promise.resolve(false);
  const id = ++sequence;
  return new Promise(resolve => {
    pending.set(id, resolve);
    window.dispatchEvent(new CustomEvent('koupreng:feedback', { detail: { kind, ...options, id } }));
  });
}
export function refreshAccess() { if (typeof window !== 'undefined') window.dispatchEvent(new Event('koupreng:access-refresh')); }
export const feedback = {
  success: options => toast(typeof options === 'string' ? options : { ...options, message: options.description || options.title, type: 'success' }),
  error: options => toast(typeof options === 'string' ? { message: options, type: 'error', duration: 0 } : { ...options, message: options.description || options.title, type: 'error', duration: options.duration ?? 0 }),
  warning: options => toast(typeof options === 'string' ? { message: options, type: 'warning' } : { ...options, message: options.description || options.title, type: 'warning' }),
  info: options => toast(typeof options === 'string' ? { message: options, type: 'info' } : { ...options, message: options.description || options.title, type: 'info' }),
  confirm: options => show('confirm', options),
  access: options => show('access', options),
  upgrade: options => show('access', { ...options, decision: { reason: 'PACKAGE_FEATURE_REQUIRED', feature: options.feature } }),
  permissionDenied: options => show('access', { ...options, decision: { reason: 'EVENT_PERMISSION_REQUIRED' } }),
  quotaReached: options => show('access', { ...options, decision: { reason: 'PACKAGE_LIMIT_REACHED', quota: options.quota } }),
  explain(error, context = {}) {
    refreshAccess();
    const decision = accessFailure(error, context);
    if (['VALIDATION_REQUIRED','CONFLICT','NETWORK_ERROR','RATE_LIMITED'].includes(decision.reason)) return false;
    void show('access', { ...context, decision });
    return true;
  },
};
