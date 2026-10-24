import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUiCopy } from '@/shared/i18n/useUiCopy';
import { ConfirmDialog } from '@/shared/ui';
import { organizationService } from '@/features/organizations/api/organizationApi';
import { invitationService } from '@/features/invitations/api/invitationApi';
import { useEventWorkspace } from './EventContext';

export default function EventTeamPanel() {
  const { event, eventId, updateEvent } = useEventWorkspace();
  const { user } = useAuth(); const copy = useUiCopy();
  const owner = Boolean(event.userId && (user?.id || user?.userId) && String(event.userId) === String(user?.id || user?.userId));
  const [state, setState] = useState({ loading: true, teams: [], access: null, error: '' });
  const [selection, setSelection] = useState(String(event.organizationId || ''));
  const [busy, setBusy] = useState(false), [review, setReview] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([invitationService.access(eventId), owner ? organizationService.listMine() : Promise.resolve([])])
      .then(([access, teams]) => { if (active) setState({ loading: false, teams: teams.filter(team => String(team.ownerUserId) === String(event.userId)), access, error: '' }); })
      .catch(error => { if (active) setState(current => ({ ...current, loading: false, error: error.message })); });
    return () => { active = false; };
  }, [eventId, event.userId, owner]);
  async function save() {
    if (busy) return; setBusy(true);
    try {
      const saved = await invitationService.linkTeam(eventId, selection ? Number(selection) : null, event.updatedAt);
      updateEvent(saved); setReview(false); setState(current => ({ ...current, error: '' }));
    } catch (error) { setState(current => ({ ...current, error: error.message })); setReview(false); }
    finally { setBusy(false); }
  }
  async function reload() {
    setBusy(true);
    try { const latest = await invitationService.get(eventId); updateEvent(latest); setSelection(String(latest.organizationId || '')); setState(current => ({ ...current, error: '' })); }
    catch (error) { setState(current => ({ ...current, error: error.message })); }
    finally { setBusy(false); }
  }
  const eligible = state.access?.ownerFeatures?.includes('TEAM_MEMBERS');
  return <main className="workspace-page"><header className="workspace-heading"><h1>{copy('ក្រុមកម្មវិធី', 'Event team')}</h1><p>{copy('ភ្ជាប់ក្រុមដែលអ្នកជាម្ចាស់ ដើម្បីសហការតាមតួនាទី។', 'Link a team you own to collaborate according to each member’s role.')}</p></header>
    <section className="workspace-section"><p>{copy('សមាជិកទទួលសិទ្ធិលើកម្មវិធីទាំងអស់ដែលម្ចាស់ភ្ជាប់ទៅក្រុមនេះ។ ម្ចាស់គ្រប់គ្រងការផ្សព្វផ្សាយ ហិរញ្ញវត្ថុ សិទ្ធិចូល និងសមាជិក។ ការដកសមាជិកបញ្ចប់សិទ្ធិលើកម្មវិធីដែលភ្ជាប់។', 'Members can access all owner events linked to this team. Publishing, finances, access settings and membership stay owner-controlled. Removing a member revokes their access to linked events.')}</p>
      {state.loading ? <p role="status">{copy('កំពុងផ្ទុក…', 'Loading…')}</p> : <>
        {!owner && <p>{copy('មានតែម្ចាស់អាចប្ដូរក្រុមកម្មវិធី។', 'Only the event owner can change its team.')}</p>}
        {owner && !eligible && <p className="workspace-notice">{copy('ការភ្ជាប់ក្រុមត្រូវការកញ្ចប់ដែលមានសិទ្ធិក្រុម។ អ្នកនៅតែអាចផ្ដាច់ក្រុម។', 'Linking a team requires team access in your package. You can still unlink a team.')} <Link to="/app/packages">{copy('មើលកញ្ចប់', 'View plans')}</Link></p>}
        {owner && <form onSubmit={event => { event.preventDefault(); setReview(true); }}><label className="workspace-field">{copy('ក្រុមដែលភ្ជាប់', 'Linked team')}<select className="workspace-input" disabled={busy} value={selection} onChange={event => setSelection(event.target.value)}><option value="">{copy('គ្មានក្រុម', 'No team')}</option>{state.teams.map(team => <option value={team.id} key={team.id} disabled={!eligible}>{team.name}</option>)}</select></label><div className="workspace-actions"><button type="submit" className="workspace-button primary" disabled={busy || state.loading || (Boolean(selection) && !eligible) || selection === String(event.organizationId || '')}>{copy('ពិនិត្យការប្ដូរក្រុម', 'Review team change')}</button><Link className="workspace-button" to="/app/organizations">{copy('គ្រប់គ្រងក្រុម និងការអញ្ជើញ', 'Manage teams and invitations')}</Link></div></form>}
        {event.organizationId && <p><Link to={`/app/organizations/${event.organizationId}`}>{copy('មើលក្រុមដែលភ្ជាប់', 'View linked team')}</Link></p>}
      </>}
      {state.error && <div role="alert"><p>{state.error}</p><button type="button" className="workspace-button" disabled={busy} onClick={reload}>{copy('ទាញយកកម្មវិធីម្ដងទៀត', 'Reload event')}</button></div>}
    </section>
    <ConfirmDialog isOpen={review} onClose={() => setReview(false)} onConfirm={save} isLoading={busy} title={copy('បញ្ជាក់ការប្ដូរក្រុម', 'Confirm team change')} message={selection ? copy('សមាជិកដែលទទួលយកការអញ្ជើញក្នុងក្រុមនេះ អាចចូលកម្មវិធីតាមតួនាទី។', 'Accepted members of this team will gain event access according to their roles.') : copy('សមាជិកក្រុមនឹងបាត់សិទ្ធិលើកម្មវិធីនេះ។', 'Team members will lose access to this event.')} confirmLabel={copy('បញ្ជាក់', 'Confirm')} cancelLabel={copy('បោះបង់', 'Cancel')} />
  </main>;
}
