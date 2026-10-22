import { useState } from 'react';
import { Search, UserRoundPlus } from 'lucide-react';

export function SeatingForms({ assignmentForm, setAssignmentForm, assignGuest, plan, saving, className, t }) {
  const [search, setSearch] = useState('');
  const unassigned = plan?.unassignedGuests || [];
  const assignments = plan?.assignments || [];
  const guests = [...unassigned, ...assignments.map(a => ({ id: a.guestId, guestName: a.guestName, seatCount: a.seatCount }))];
  const current = assignments.find(a => String(a.guestId) === String(assignmentForm.guestId));
  const selected = plan?.tables?.find(table => String(table.id) === String(assignmentForm.tableId));
  const remaining = selected ? selected.remainingSeats + (current?.tableId === selected.id ? current.seatCount : 0) : 0;
  const seats = Number(assignmentForm.seatCount);
  const fits = Number.isInteger(seats) && seats > 0 && seats <= remaining;
  const selectGuest = id => {
    const guest = guests.find(item => String(item.id) === String(id));
    const existing = assignments.find(item => String(item.guestId) === String(id));
    setAssignmentForm(previous => ({ ...previous, guestId: id, seatCount: guest?.seatCount || 1, seatLabel: existing?.seatLabel || '', notes: existing?.notes || '' }));
  };
  const visible = unassigned.filter(g => g.guestName.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <aside className={`seating-assignment-panel workspace-section ${className || ''}`}>
    <h2><UserRoundPlus size={20} aria-hidden="true" />{t('assignment')}</h2>
    <form className="workspace-form" onSubmit={event => { event.preventDefault(); if (fits) assignGuest(event); }}>
      <label>{t('selectGuest')}<select id="seating-assignment-guest" aria-label={t('selectGuest')} required value={assignmentForm.guestId} onChange={e => selectGuest(e.target.value)}><option value="">{t('chooseGuest')}</option>{guests.map(g => <option key={g.id} value={g.id}>{g.guestName} · {g.seatCount || 1} {t('seats')}{assignments.some(a => a.guestId === g.id) ? ` · ${t('assigned')}` : ''}</option>)}</select></label>
      <label>{t('selectTable')}<select aria-label={t('selectTable')} required value={assignmentForm.tableId} onChange={e => setAssignmentForm({ ...assignmentForm, tableId: e.target.value })}><option value="">{t('chooseTable')}</option>{(plan?.tables || []).map(table => <option key={table.id} value={table.id}>{table.tableName} · {table.remainingSeats} {t('remaining')}</option>)}</select></label>
      <div className="workspace-form-grid"><label>{t('seats')}<input required min="1" step="1" type="number" value={assignmentForm.seatCount} onChange={e => setAssignmentForm({ ...assignmentForm, seatCount: e.target.value })} aria-describedby="seating-capacity-hint" aria-invalid={Boolean(selected && !fits)} /></label><label>{t('seatLabel')}<input value={assignmentForm.seatLabel} onChange={e => setAssignmentForm({ ...assignmentForm, seatLabel: e.target.value })} /></label></div>
      <p id="seating-capacity-hint" className={selected && !fits ? 'workspace-field-error' : 'workspace-muted'} role={selected && !fits ? 'alert' : undefined}>{!plan?.tables?.length ? t('createFirst') : selected && !fits ? t('capacityExceeded') : t('partyHint')}</p>
      <button className="workspace-button operational" type="submit" disabled={saving || !assignmentForm.guestId || !selected || !fits}>{saving ? t('saving') : current ? t('moveGuest') : t('assignGuest')}</button>
    </form>
    <div className="seating-unassigned-header"><h3>{t('unassigned')} <span>{unassigned.length}</span></h3><label className="workspace-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label={t('search')} placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} /></label></div>
    <ul className="seating-unassigned-list">{visible.map(guest => <li key={guest.id}><button type="button" aria-pressed={String(assignmentForm.guestId) === String(guest.id)} onClick={() => { selectGuest(String(guest.id)); document.getElementById('seating-assignment-guest')?.focus(); }}><span>{guest.guestName}</span><small>{guest.seatCount || 1} {t('seats')}</small></button></li>)}</ul>
    {!visible.length && <p className="workspace-muted">{t(search ? 'noMatches' : 'allAssigned')}</p>}
  </aside>;
}
