import { useLanguageStore } from '@/stores/useLanguageStore';
import { quotaNames } from './accessCopy';
import { feedback } from '../feedback/feedback';

export default function QuotaProgress({ usage, resource, scope, event }) {
  const en = useLanguageStore(state => state.lang) === 'en';
  if (!usage || !Number.isFinite(Number(usage.used)) || usage.used == null) return null;
  const limited = usage.limit != null;
  const reached = limited && Number(usage.used) >= Number(usage.limit);
  const near = limited && usage.limit > 0 && usage.used / usage.limit >= .9;
  return <div className="access-quota" data-quota={resource}>
    <p>{(quotaNames[resource] || [resource,resource])[en ? 1 : 0]}: <strong>{usage.used} / {limited ? usage.limit : (en ? 'Unlimited' : 'មិនកំណត់')}</strong></p>
    {limited && <progress max={Math.max(1,usage.limit)} value={Math.min(usage.used,Math.max(1,usage.limit))} aria-label={(quotaNames[resource] || [resource,resource])[en ? 1 : 0]} />}
    {near && <p>{en ? 'This measures guest records, not people or seats.' : 'នេះជាចំនួនកំណត់ត្រាភ្ញៀវ មិនមែនជាចំនួនមនុស្ស ឬកៅអីទេ។'}</p>}
    {reached && <button type="button" onClick={() => void feedback.quotaReached({ event, quota: { ...usage, resource, scope, requested: 1 } })}>{en ? 'Review this limit' : 'ពិនិត្យកម្រិតនេះ'}</button>}
  </div>;
}
