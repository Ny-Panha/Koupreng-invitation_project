import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check, Copy, RefreshCw, Search, Send, Share2, Users } from 'lucide-react';
import { deliveryService } from '@/features/invitations/api/deliveryApi';
import { invitationService } from '@/features/invitations/api/invitationApi';
import { useBackendMessages } from '@/shared/i18n/useBackendMessages';
import { ResponsiveTable, StatusBadge, toast } from '@/shared/ui';
import './DeliveryWorkspace.css';

export default function InvitationDeliveryManager() {
  const { eventId, id = eventId } = useParams();
  const [params] = useSearchParams();
  const { text: t, lang } = useBackendMessages('deliveryWorkspace');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(() => new Set(params.get('guestId') ? [params.get('guestId')] : []));
  const [email, setEmail] = useState({ subject: '', message: '' });
  const [result, setResult] = useState(null);
  const load = useCallback(async () => {
    const [invitation, summary, events] = await Promise.all([invitationService.get(id), deliveryService.summary(id), deliveryService.events(id)]);
    setData({ invitation, summary, events: events || [] });
  }, [id]);
  useEffect(() => {
    let active = true;
    Promise.all([invitationService.get(id), deliveryService.summary(id), deliveryService.events(id)])
      .then(([invitation, summary, events]) => { if (active) setData({ invitation, summary, events: events || [] }); })
      .catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [id]);
  const act = async action => { setBusy(true); setError(''); try { await action(); } catch (e) { setError(e.message || t('failed')); } finally { setBusy(false); } };
  if (!data) return <main className="delivery-workspace workspace-page">{error ? <div role="alert">{error}<button className="workspace-button" onClick={() => act(load)}>{t('retry')}</button></div> : <p role="status">{t('loading')}</p>}</main>;
  const { invitation, summary, events } = data;
  const published = invitation.status === 'PUBLISHED';
  const guests = summary?.guests || [];
  const guestId = g => String(g.guestId ?? g.id);
  const visible = guests.filter(g => [g.guestName, g.email, g.phone].filter(Boolean).join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (filter === 'ALL' || g.sendStatus === filter));
  const eligible = visible.filter(g => published && g.invitationUrl);
  const selectedGuests = guests.filter(g => selected.has(guestId(g)) && g.invitationUrl);
  const emailTargets = selectedGuests.filter(g => g.email);
  const toggle = id => setSelected(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleVisible = event => { const checked = event.target.checked; setSelected(previous => { const next = new Set(previous); eligible.forEach(g => checked ? next.add(guestId(g)) : next.delete(guestId(g))); return next; }); };
  const allSelected = eligible.length > 0 && eligible.every(g => selected.has(guestId(g)));
  const recordShare = async guest => {
    if (['SENT', 'OPENED', 'RESPONDED'].includes(guest.sendStatus)) return;
    await deliveryService.markShared(id, guest.guestId ?? guest.id);
    await load();
  };
  const copy = async (text, guest) => { await navigator.clipboard.writeText(text); toast(t('copied')); await recordShare(guest); };
  const share = (guest, method) => act(async () => {
    const response = await deliveryService.shareMessage(id, guest.guestId ?? guest.id);
    if (method === 'copy') await copy(response.message, guest);
    else if (navigator.share) {
      try { await navigator.share({ title: invitation.title, text: response.message }); }
      catch (e) { if (e.name !== 'AbortError') throw e; return; }
      await recordShare(guest);
    } else await copy(response.message, guest);
  });
  const dispatch = reminders => act(async () => {
    const targets = emailTargets.filter(g => !reminders || !g.responded);
    if (!targets.length || !window.confirm(t('confirmEmail', { count: targets.length }))) return;
    const payload = { guestIds: targets.map(g => Number(guestId(g))), allEligible: false, subject: email.subject, message: email.message };
    const response = await (reminders ? deliveryService.sendReminders(id, payload) : deliveryService.sendEmail(id, payload));
    setResult({ success: response.successCount ?? 0, failed: response.failedCount ?? 0 });
    await load();
  });
  const date = value => value ? new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'km-KH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
  const status = value => t(({ SENT: 'sent', FAILED: 'failed', OPENED: 'opened', PENDING: 'pending', LINK_GENERATED: 'ready', NOT_READY: 'notReady', READY: 'ready', RESPONDED: 'responded' })[value] || 'pending');
  return <main className="delivery-workspace workspace-page" aria-busy={busy}>
    <header className="workspace-page-heading"><div><h1>{t('title')}</h1><p>{invitation.title} · {t('subtitle')}</p></div><Link className="workspace-button" to={`/app/events/${id}/guests`}><Users size={18} />{t('guests')}</Link></header>
    <ol className="delivery-steps">{['prepare', 'select', 'share', 'track'].map((key, i) => <li key={key}><span>{i + 1}</span>{t(key)}</li>)}</ol>
    {error && <div className="workspace-notice" role="alert">{error}<button className="workspace-button" onClick={() => act(load)}>{t('retry')}</button></div>}
    {!published && <div className="workspace-notice"><strong>{t('draftTitle')}</strong><p>{t('draftHint')}</p><Link className="workspace-button primary" to={`/app/events/${id}/invitation`}>{t('publish')}</Link></div>}
    <section className="workspace-summary" aria-label={t('summary')}>{[['total', summary?.totalGuests], ['ready', summary?.ready ?? summary?.linkGenerated], ['sent', summary?.sent], ['failed', summary?.failed]].map(([key, count]) => <article key={key}><span>{t(key)}</span><strong>{count ?? 0}</strong></article>)}</section>
    <div className="delivery-readiness"><p>{t(published ? 'readyHint' : 'draftHint')}</p><button className="workspace-button" disabled={busy || !published} onClick={() => act(async () => { await deliveryService.prepare(id); await load(); toast(t('prepared')); })}><RefreshCw size={17} />{t('prepareAction')}</button></div>
    <section className="workspace-section delivery-recipients">
      <div className="workspace-section-heading"><h2>{t('recipients')}</h2><div className="workspace-actions"><span className="workspace-muted">{t('selected', { count: selectedGuests.length })}</span>{selectedGuests.length > 0 && <a className="workspace-button operational" href="#delivery-methods">{t('shareTitle')}</a>}</div></div>
      <div className="delivery-filter-bar"><label className="workspace-search"><Search size={18} aria-hidden="true" /><input type="search" aria-label={t('search')} placeholder={t('search')} value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label={t('status')} value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">{t('all')}</option>{['PENDING', 'SENT', 'FAILED', 'OPENED'].map(s => <option key={s} value={s}>{status(s)}</option>)}</select></div>
      <label className="delivery-select-mobile"><input type="checkbox" checked={allSelected} disabled={!eligible.length || busy} onChange={toggleVisible} />{t('selectAll')}</label>
      <ResponsiveTable ariaLabel={t('recipients')} className="delivery-recipient-table"><thead><tr><th><input type="checkbox" aria-label={t('selectAll')} checked={allSelected} disabled={!eligible.length || busy} onChange={toggleVisible} /></th><th>{t('guest')}</th><th>{t('status')}</th><th>{t('lastSent')}</th><th>{t('actions')}</th></tr></thead><tbody>{visible.map(g => <tr key={guestId(g)}>
        <td data-label={t('select')}><input type="checkbox" aria-label={`${t('select')}: ${g.guestName}`} disabled={busy || !published || !g.invitationUrl} checked={selected.has(guestId(g))} onChange={() => toggle(guestId(g))} /></td>
        <td data-label={t('guest')}><strong>{g.guestName}</strong><small>{g.email || g.phone || '—'}</small></td><td data-label={t('status')}><StatusBadge status={g.sendStatus || 'PENDING'} label={status(g.sendStatus || 'PENDING')} />{g.lastSendError && <small className="workspace-field-error">{g.lastSendError}</small>}</td><td data-label={t('lastSent')}>{date(g.lastSentAt)}</td>
        <td data-label={t('actions')}><div className="workspace-actions"><button className="workspace-icon-button" disabled={busy || !published || !g.invitationUrl} onClick={() => act(() => copy(g.invitationUrl, g))} aria-label={`${t('copyLink')}: ${g.guestName}`}><Copy size={17} /></button><button className="workspace-button" disabled={busy || !published || !g.invitationUrl} onClick={() => share(g, 'copy')}>{t('copyMessage')}</button><button className="workspace-icon-button" disabled={busy || !published || !g.invitationUrl} onClick={() => share(g, 'native')} aria-label={`${t('share')}: ${g.guestName}`}><Share2 size={17} /></button></div></td>
      </tr>)}</tbody></ResponsiveTable>
      {!visible.length && <div className="workspace-empty"><h2>{t(guests.length ? 'noMatches' : 'empty')}</h2><Link className="workspace-button" to={`/app/events/${id}/guests`}>{t('guests')}</Link></div>}
    </section>
    <section className="workspace-section delivery-methods" id="delivery-methods" tabIndex={-1}><h2>{t('shareTitle')}</h2><p className="workspace-muted">{t('shareHint')}</p>
      {selectedGuests.length === 1 && <div className="workspace-actions"><button className="workspace-button operational" disabled={busy || !published} onClick={() => share(selectedGuests[0], 'native')}><Share2 size={17} />{t('share')}</button><a className="workspace-button" target="_blank" rel="noopener noreferrer" aria-disabled={busy || !published} onClick={event => { if (busy || !published) event.preventDefault(); else act(() => recordShare(selectedGuests[0])); }} href={`https://t.me/share/url?url=${encodeURIComponent(selectedGuests[0].invitationUrl)}`}>{t('telegram')}</a><button className="workspace-button" disabled={busy || !published} onClick={() => act(async () => { if (!window.confirm(t('manualConfirm'))) return; await deliveryService.markShared(id, selectedGuests[0].guestId ?? selectedGuests[0].id); await load(); })}><Check size={17} />{t('manual')}</button></div>}
      <details><summary>{t('emailTitle')} · {emailTargets.length}</summary><form className="workspace-form" onSubmit={e => { e.preventDefault(); dispatch(false); }}><p className="workspace-muted">{t('emailHint')}</p><label>{t('subject')}<input value={email.subject} onChange={e => setEmail({ ...email, subject: e.target.value })} /></label><label>{t('message')}<textarea rows="3" value={email.message} onChange={e => setEmail({ ...email, message: e.target.value })} /></label><div className="workspace-actions"><button type="submit" className="workspace-button operational" disabled={busy || !published || !emailTargets.length}><Send size={17} />{t('sendEmail')}</button><button type="button" className="workspace-button" disabled={busy || !published || !emailTargets.some(g => !g.responded)} onClick={() => dispatch(true)}>{t('remind')}</button></div></form></details>
      {result && <p role="status">{t('result', result)}</p>}
    </section>
    <details className="workspace-section delivery-history"><summary>{t('history')} · {events.length}</summary>{!events.length ? <p className="workspace-muted">{t('noHistory')}</p> : <ul>{events.map(e => <li key={e.id}><strong>{e.guestName || invitation.title}</strong><StatusBadge status={e.status} label={status(e.status)} /><span>{e.channel || '—'}</span><time>{date(e.createdAt)}</time>{e.errorMessage && <p className="workspace-field-error">{e.errorMessage}</p>}</li>)}</ul>}</details>
  </main>;
}
