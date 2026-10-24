import { useUiCopy } from '@/shared/i18n/useUiCopy';
import { useState } from 'react';
import { Modal } from '@/shared/ui';
import { ORGANIZATION_ROLES } from '../model/organizationConstants';

export default function InviteMemberModal({ isOpen, onClose, saving, onInvite, serverError }) {
  const copy = useUiCopy();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const close = () => { setEmail(''); setRole('VIEWER'); setInvitation(null); setError(''); setCopyStatus(''); onClose(); };
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setError('');
    const result = await onInvite(email.trim(), role);
    if (result?.invitationToken) setInvitation(result);
    else if (result) setError(copy('មិនបានទទួលកូដ។ សូមពិនិត្យបញ្ជីសមាជិក រួចបង្កើតកូដម្ដងទៀត។', 'No invitation code was returned. Review the member list and reissue the invitation.'));
  }
  async function copyToken() {
    try { await navigator.clipboard.writeText(invitation.invitationToken); setCopyStatus(copy('បានចម្លងកូដ', 'Code copied')); }
    catch { setCopyStatus(copy('មិនអាចចម្លងដោយស្វ័យប្រវត្តិ។ ជ្រើសរើសកូដ ហើយចម្លង។', 'Could not copy automatically. Select and copy the code.')); }
  }
  return <Modal isOpen={isOpen} onClose={saving ? undefined : close} title={copy('អញ្ជើញសមាជិកក្រុម', 'Invite team member')} size="md" closeOnBackdropClick={!saving} closeOnEscape={!saving}>
    {invitation ? <div className="workspace-section">
      <p>{copy('ការអញ្ជើញកំពុងរង់ចាំការទទួលយក។ ចែករំលែកកូដនេះជាឯកជនទៅអ៊ីមែលដែលអ្នកបានកំណត់។ ប្រព័ន្ធមិនបានផ្ញើអ៊ីមែលទេ។', 'Invitation pending. Share this code privately with the intended recipient. No email has been sent.')}</p>
      <label className="workspace-field">{copy('កូដអញ្ជើញប្រើម្ដង', 'One-time invitation code')}<input className="k-org-input" readOnly autoComplete="off" spellCheck={false} value={invitation.invitationToken} onFocus={event => event.target.select()} /></label>
      <p>{copy('អ្នកទទួលត្រូវចូលប្រើដោយអ៊ីមែលនេះ រួចបញ្ចូលកូដក្នុងទំព័រក្រុម ក្នុងរយៈពេល ៧ ថ្ងៃ។ កូដមិនត្រូវបានបង្ហាញម្ដងទៀតទេ។', 'The recipient signs in with this email and enters the code on the Teams page within 7 days. This code is shown once.')}</p>
      <strong>{email}</strong><p>{copy('ក្រុមអាចចូលកម្មវិធីទាំងអស់ដែលម្ចាស់បានភ្ជាប់ទៅក្រុមនេះ តាមតួនាទី។', 'Membership applies to all events the owner links to this team, according to the assigned role.')}</p>
      <div className="workspace-actions"><button type="button" className="workspace-button" onClick={copyToken}>{copy('ចម្លងកូដ', 'Copy code')}</button><button type="button" className="workspace-button primary" onClick={close}>{copy('រួចរាល់', 'Done')}</button></div><p role="status">{copyStatus}</p>
    </div> : <form onSubmit={submit} className="workspace-section">
      <p>{copy('សមាជិកមិនទាន់ទទួលសិទ្ធិ រហូតទទួលយកកូដ។ អញ្ជើញអ៊ីមែលដដែលម្ដងទៀត ដើម្បីជំនួសកូដរង់ចាំចាស់។', 'Access starts after acceptance. Reinviting a pending email replaces its previous code.')}</p>
      <label className="workspace-field">{copy('អ៊ីមែលសមាជិក', 'Member email')}<input className="k-org-input" type="email" required maxLength={255} autoComplete="off" disabled={saving} value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label className="workspace-field">{copy('តួនាទី និងសិទ្ធិ', 'Role & permissions')}<select className="k-org-input" disabled={saving} value={role} onChange={event => setRole(event.target.value)}>{ORGANIZATION_ROLES.map(row => <option key={row.value} value={row.value}>{copy(row.labelKm, row.label)} — {copy(row.descriptionKm, row.description)}</option>)}</select></label>
      <p>{copy('មានតែម្ចាស់អាចផ្សព្វផ្សាយ គ្រប់គ្រងហិរញ្ញវត្ថុ សិទ្ធិចូល និងសមាជិក។', 'Publishing, finances, access settings and member administration stay with the owner.')}</p>
      {(error || serverError) && <p role="alert">{error || serverError}</p>}
      <div className="workspace-actions"><button type="button" className="workspace-button" disabled={saving} onClick={close}>{copy('បោះបង់', 'Cancel')}</button><button type="submit" className="workspace-button primary" disabled={saving}>{saving ? copy('កំពុងបង្កើត…', 'Creating…') : copy('បង្កើតកូដអញ្ជើញ', 'Create invitation code')}</button></div>
    </form>}
  </Modal>;
}
