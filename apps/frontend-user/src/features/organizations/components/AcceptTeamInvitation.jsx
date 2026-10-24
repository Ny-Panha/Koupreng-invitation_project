import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUiCopy } from '@/shared/i18n/useUiCopy';
import { organizationService } from '../api/organizationApi';

export default function AcceptTeamInvitation({ onAccepted }) {
  const copy = useUiCopy();
  const [token, setToken] = useState('');
  const [state, setState] = useState({ busy: false, error: '', organization: null });
  async function accept(event) {
    event.preventDefault(); if (state.busy) return;
    setState({ busy: true, error: '', organization: null });
    try {
      const organization = await organizationService.acceptInvitation(token.trim());
      setToken(''); setState({ busy: false, error: '', organization }); onAccepted?.();
    } catch (error) { setState({ busy: false, error: error.message || copy('មិនអាចទទួលយកការអញ្ជើញបាន។', 'Could not accept invitation.'), organization: null }); }
  }
  return <section className="workspace-section" aria-label={copy('ទទួលយកការអញ្ជើញក្រុម', 'Accept team invitation')}>
    <h2>{copy('មានកូដអញ្ជើញក្រុម?', 'Have a team invitation code?')}</h2>
    <p>{copy('ចូលប្រើដោយអ៊ីមែលដែលម្ចាស់បានអញ្ជើញ។ កូដផុតកំណត់ក្រោយ ៧ ថ្ងៃ និងអាចប្រើម្ដង។', 'Use the account email invited by the owner. Codes expire after 7 days and work once.')}</p>
    <form onSubmit={accept}><label className="workspace-field">{copy('កូដអញ្ជើញ', 'Invitation code')}<input className="k-org-input" required pattern="[a-f0-9]{64}" maxLength={64} autoComplete="off" spellCheck={false} value={token} disabled={state.busy} onChange={event => setToken(event.target.value)} /></label><button className="workspace-button primary" type="submit" disabled={state.busy}>{state.busy ? copy('កំពុងពិនិត្យ…', 'Checking…') : copy('ទទួលយកការអញ្ជើញ', 'Accept invitation')}</button></form>
    {state.error && <p role="alert">{state.error}</p>}{state.organization && <p role="status">{copy('បានចូលរួមក្រុម។', 'Team joined.')} <Link to={`/app/organizations/${state.organization.id}`}>{state.organization.name}</Link></p>}
  </section>;
}
