import { useT } from '@/shared/i18n/useT';
import { accountPasswordRules } from '../accountPasswordPolicy';

export default function AccountPasswordGuidance({ id, value }) {
  const { auth } = useT();
  return <ul id={id} className="account-password-guidance">
    {accountPasswordRules(value).map(({ key, met }) => <li key={key}>
      {auth(key)}{value && <span> — {auth(met ? 'passwordRuleMet' : 'passwordRuleUnmet')}</span>}
    </li>)}
  </ul>;
}
