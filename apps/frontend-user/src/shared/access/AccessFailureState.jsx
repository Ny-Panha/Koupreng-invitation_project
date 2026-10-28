import { ErrorState } from '../ui';
import FeatureAccessCard from './FeatureAccessCard';

export default function AccessFailureState({ error, feature, permission, ownerOnly, onRetry }) {
  if ([401,403,404].includes(Number(error?.status))) return <FeatureAccessCard error={error} feature={feature} permission={permission} ownerOnly={ownerOnly} onRetry={onRetry} />;
  return <ErrorState message={typeof error === 'string' ? error : error?.message} onRetry={onRetry} />;
}
