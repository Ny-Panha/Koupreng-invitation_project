import { LockKeyhole } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useFeatureAccess } from './useFeatureAccess';
import { accessTitle, featureNames } from './accessCopy';
import { accessFailure } from './accessDecision';
import { feedback } from '../feedback/feedback';
import './access.css';

export default function FeatureAccessCard({ feature, permission, ownerOnly = false, supported = true, children, lockedContent, force = false, error, onRetry }) {
  const access = useFeatureAccess({ feature, permission, ownerOnly, supported });
  const en = useLanguageStore(state => state.lang) === 'en';
  const title = (featureNames[feature] || [feature, feature])[en ? 1 : 0];
  const decision = error ? accessFailure(error, access.context) : access.decision;
  if (access.allowed && !force && !error) return children || null;
  return <section className="feature-access-card" data-feature-lock={feature}>
    <h3><LockKeyhole size={18} aria-hidden="true" />{title}</h3>
    <p>{['EVENT_PERMISSION_REQUIRED','EVENT_OWNER_ONLY'].includes(decision.reason)
      ? (en ? 'Ask the event owner to review your role. A package purchase cannot grant event permission.' : 'សូមស្នើម្ចាស់កម្មវិធីពិនិត្យតួនាទី។ ការជាវកញ្ចប់មិនផ្ដល់សិទ្ធិលើកម្មវិធីទេ។')
      : (en ? 'Your edits remain here. Availability follows the event owner’s verified package.' : 'ការកែប្រែនៅតែនៅទីនេះ។ មុខងារអាស្រ័យលើកញ្ចប់ដែលបានផ្ទៀងផ្ទាត់របស់ម្ចាស់កម្មវិធី។')}</p>
    <button type="button" onClick={event => { event.currentTarget.focus(); if (error) void feedback.access({ ...access.context, decision }); else access.explain(); }}>{accessTitle(decision.reason === 'ALLOWED' ? 'SUBSCRIPTION_UNVERIFIED' : decision.reason, en)}</button>
    {onRetry && <button type="button" onClick={onRetry}>{en ? 'Try again' : 'សាកម្តងទៀត'}</button>}
    {lockedContent}
  </section>;
}
