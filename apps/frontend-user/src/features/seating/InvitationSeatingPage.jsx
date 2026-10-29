import { PageSkeleton } from '@/shared/ui/LoadingState';
import AccessFailureState from "@/shared/access/AccessFailureState";
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Armchair, Download, Grid2X2, Map, Plus, Users } from 'lucide-react';
import { useBackendMessages } from '@/shared/i18n/useBackendMessages';
import Modal from '@/shared/ui/Modal';
import { useSeating } from './hooks/useSeating';
import { SeatingForms } from './components/SeatingForms';
import { SeatingTableCard } from './components/SeatingTableCard';
import { SeatingFloorPlan } from './components/SeatingFloorPlan';
import './SeatingPage.css';

export default function InvitationSeatingPage() {
  const { eventId, invitationId = eventId } = useParams();
  const { text: t } = useBackendMessages('seating');
  const [view, setView] = useState('list');
  const [mobilePanel, setMobilePanel] = useState('tables');
  const [createOpen, setCreateOpen] = useState(false);
  const seating = useSeating(invitationId);
  const { plan, summary, layout, assignmentsByTable, loading, saving, error, tableForm, setTableForm, createTable, refresh } = seating;
  const tables = plan?.tables || [];
  const stats = [['tables', summary?.totalTables ?? tables.length], ['capacity', summary?.totalCapacity ?? 0], ['assignedSeats', summary?.assignedSeats ?? 0], ['unassigned', plan?.unassignedGuests?.length ?? 0]];
  const focusAssignment = () => { setMobilePanel('guests'); requestAnimationFrame(() => document.getElementById('seating-assignment-guest')?.focus()); };
  const openAssignment = assignment => {
    seating.setAssignmentForm({ guestId: String(assignment.guestId), tableId: '', seatCount: assignment.seatCount, seatLabel: assignment.seatLabel || '', notes: assignment.notes || '' });
    focusAssignment();
  };
  return <main className="seating-page workspace-page">
    <header className="workspace-page-heading">
      <div><h1>{t('title')}</h1></div>
      <div className="workspace-actions">
        <Link className="workspace-button" to={`/app/events/${invitationId}/guests`}><Users size={18} />{t('guests')}</Link>
        <button className="workspace-button" type="button" disabled={!tables.length || saving} onClick={seating.exportCsv}><Download size={18} />{t('export')}</button>
        <button className="workspace-button primary" type="button" onClick={() => setCreateOpen(true)} disabled={saving}><Plus size={18} />{t('createTable')}</button>
      </div>
    </header>
    {loading && !plan && <PageSkeleton layout="chart" label={t('loading')} />}
    {error && <AccessFailureState error={seating.failure || error} feature="SEATING" permission="MANAGE_SEATING" onRetry={refresh} />}
    <section className="workspace-summary" aria-label={t('summary')}>{stats.map(([key, value]) => <article key={key}><span>{t(key)}</span><strong>{value}</strong></article>)}</section>
    <div className="seating-mobile-tabs workspace-tabs" role="group" aria-label={t('workspace')}>
      <button type="button" aria-pressed={mobilePanel === 'tables'} onClick={() => setMobilePanel('tables')}>{t('tables')}</button>
      <button type="button" aria-pressed={mobilePanel === 'guests'} onClick={() => setMobilePanel('guests')}>{t('assignment')}</button>
      <button type="button" aria-pressed={mobilePanel === 'plan'} onClick={() => { setMobilePanel('plan'); setView('plan'); }}>{t('plan')}</button>
    </div>
    <section className={`seating-layout ${view === 'plan' ? 'seating-layout--plan' : ''}`} aria-busy={saving}>
      <div className={`seating-table-workspace ${mobilePanel !== 'guests' ? '' : 'mobile-hidden'}`}>
        <div className="workspace-section-heading"><h2>{t('tables')}</h2><div className="workspace-tabs" role="group" aria-label={t('view')}>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}><Grid2X2 size={17} />{t('list')}</button>
          <button type="button" data-testid="tab-floor-plan" aria-pressed={view === 'plan'} onClick={() => setView('plan')}><Map size={17} />{t('plan')}</button>
        </div></div>
        {!tables.length ? <div className="workspace-empty seating-empty-state"><Armchair size={40} strokeWidth={1.5} aria-hidden="true" /><h2>{t('emptyTitle')}</h2><p>{t('emptyText')}</p><button className="workspace-button primary" type="button" onClick={() => setCreateOpen(true)}><Plus size={18} />{t('createTable')}</button></div> : view === 'plan' ? <SeatingFloorPlan key={invitationId} tables={tables} layout={layout} assignmentsByTable={assignmentsByTable} onSavePositions={seating.saveTablePositions} onReloadLayout={refresh} onAssignTable={table => { seating.setAssignmentForm(current => ({ ...current, tableId: String(table.id) })); focusAssignment(); }} onCreateTable={seating.createTableWithData} onRequestCreate={() => setCreateOpen(true)} invitationId={invitationId} saving={saving} /> :
          <div className="seating-tables-grid">{tables.map(table => <SeatingTableCard key={table.id} table={table} assignments={assignmentsByTable.get(table.id) || []} unassign={seating.unassign} deleteTable={seating.deleteTable} onMove={openAssignment} onAssign={() => { seating.setAssignmentForm(current => ({ ...current, tableId: String(table.id) })); focusAssignment(); }} saving={saving} t={t} />)}</div>}
      </div>
      <SeatingForms {...seating} className={mobilePanel === 'guests' ? '' : 'mobile-hidden'} t={t} />
    </section>
    <Modal isOpen={createOpen} onClose={saving ? undefined : () => setCreateOpen(false)} title={t('createTable')} closeLabel={t('cancel')} className="workspace-dialog" closeOnEscape={!saving} closeOnBackdropClick={!saving}>
      <form className="workspace-form" onSubmit={async event => { if (await createTable(event)) setCreateOpen(false); }}>
        <label>{t('tableName')}<input autoFocus required maxLength={255} value={tableForm.tableName} onChange={e => setTableForm({ ...tableForm, tableName: e.target.value })} /></label>
        <div className="workspace-form-grid"><label>{t('capacity')}<input type="number" required min="1" step="1" value={tableForm.capacity} onChange={e => setTableForm({ ...tableForm, capacity: e.target.value })} /></label><label>{t('label')}<input maxLength={255} value={tableForm.tableLabel} onChange={e => setTableForm({ ...tableForm, tableLabel: e.target.value })} /></label></div>
        <details><summary>{t('details')}</summary><label>{t('sortOrder')}<input type="number" step="1" value={tableForm.sortOrder} onChange={e => setTableForm({ ...tableForm, sortOrder: e.target.value })} /></label><label>{t('notes')}<textarea rows="2" value={tableForm.notes} onChange={e => setTableForm({ ...tableForm, notes: e.target.value })} /></label></details>
        {error && <p role="alert">{error}</p>}
        <div className="workspace-actions"><button className="workspace-button" type="button" disabled={saving} onClick={() => setCreateOpen(false)}>{t('cancel')}</button><button className="workspace-button primary" disabled={saving} type="submit">{saving ? t('saving') : t('createTable')}</button></div>
      </form>
    </Modal>
  </main>;
}
