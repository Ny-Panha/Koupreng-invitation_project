import { Armchair, ArrowRightLeft, Trash2, UserPlus, X } from 'lucide-react';

export function SeatingTableCard({ table, assignments = [], unassign, deleteTable, saving, onMove, onAssign, t }) {
  const full = table.remainingSeats <= 0;
  return <section className="seating-table-card" aria-label={table.tableName}>
    <div className="seating-table-head"><div><h3><Armchair size={20} aria-hidden="true" />{table.tableName}</h3>{table.tableLabel && <p className="workspace-muted">{table.tableLabel}</p>}</div><span className={`workspace-badge ${full ? 'is-full' : ''}`}>{full ? t('full') : `${table.remainingSeats} ${t('remaining')}`}</span></div>
    <div className="seating-capacity"><span>{table.assignedSeats} / {table.capacity} {t('seats')}</span><meter min="0" max={table.capacity} value={table.assignedSeats} aria-label={t('assignedSeats')} /></div>
    {assignments.length ? <ul className="seating-guest-list">{assignments.map(a => <li key={a.id}><div><strong>{a.guestName}</strong><small>{a.seatCount} {t('seats')}{a.seatLabel ? ` · ${a.seatLabel}` : ''}</small></div><div className="workspace-actions"><button type="button" disabled={saving} className="workspace-icon-button" onClick={() => onMove(a)} aria-label={`${t('moveGuest')}: ${a.guestName}`}><ArrowRightLeft size={17} /></button><button type="button" disabled={saving} className="workspace-icon-button" onClick={() => unassign(a.id)} aria-label={`${t('unassign')}: ${a.guestName}`}><X size={17} /></button></div></li>)}</ul> : <p className="workspace-muted">{t('noAssignments')}</p>}
    <div className="seating-table-actions"><button type="button" className="workspace-button" disabled={saving || full} onClick={onAssign}><UserPlus size={17} />{t('assignGuest')}</button><button type="button" className="workspace-icon-button" disabled={saving || assignments.length > 0} title={t(assignments.length ? 'removeBeforeDelete' : 'deleteTable')} aria-label={`${t('deleteTable')}: ${table.tableName}`} onClick={() => { if (window.confirm(t('confirmDelete'))) deleteTable(table.id); }}><Trash2 size={17} /></button></div>
  </section>;
}

export default SeatingTableCard;
