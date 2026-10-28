import { lazy, Suspense, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Download, QrCode, Upload, Users } from "lucide-react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { ErrorState, SkeletonTable, toast } from "@/shared/ui";
import { useGuests } from "./hooks/useGuests";
import { useGuestMutations } from "./hooks/useGuestMutations";
import { useGuestFilters } from "./hooks/useGuestFilters";
import { useDebouncedGuestQuery } from './hooks/useDebouncedGuestQuery';
import { useEventWorkspace } from '../events/workspace/EventContext';
import { DEFAULT_CATEGORIES, DEFAULT_GROUPS } from "./model/guestConstants";
import { copyText } from "./model/guestMappers";
import { matchesGuestStatus } from "./model/guestStatus";
import GuestStats from "./components/GuestStats";
import GuestFilters from "./components/GuestFilters";
import GuestTable from "./components/GuestTable";
import GuestDeleteDialog from "./components/GuestDeleteDialog";
import GuestQrModal from "./components/GuestQrModal";
import TicketModal from "@/features/tickets/TicketModal";
const GuestImportModal = lazy(() => import('./components/GuestImportModal'));
import GuestInlineForm from "./components/GuestInlineForm";
import { guestService } from "./api/guestApi";
import { exportGuestsToCsv } from "./model/guestCsvUtils";
import { saveManualGuests } from "@/shared/storage/hostPlanningStorage";
import "./GuestsPage.css";
import "./GuestWorkspace.css";

function scopedKey(base, eventId) {
  return eventId ? `${base}.${eventId}` : base;
}

function readList(key, fallback) {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default function GuestsPage() {
  const { text: t, lang } = useBackendMessages("guests");
  const en = lang === "en";
  const workspace = useEventWorkspace();
  const ownerTools = workspace?.isOwner !== false;
  const [serverQuery, setServerQuery] = useState({ page: 0, size: 25, search: '', group: '', category: '', status: '' });
  const debouncedQuery = useDebouncedGuestQuery(serverQuery);
  const [selectedIds, setSelectedIds] = useState([]);
  const [exporting, setExporting] = useState(false);

  const {
    eventId,
    draftMatch,
    backendInvitation,
    backendInvitationId: hookBackendInvitationId,
    publicInvitation,
    guests,
    manualGuests,
    setManualGuests,
    backendGuests,
    setBackendGuests,
    loading,
    error,
    refreshData,
    pageInfo, overview,
  } = useGuests({ paged: true, query: debouncedQuery });

  const rawBackendId =
    hookBackendInvitationId ||
    backendInvitation?.id ||
    backendInvitation?.invitationId ||
    publicInvitation?.id ||
    publicInvitation?.invitationId ||
    draftMatch?.backendInvitationId;
  const backendInvitationId =
    rawBackendId != null && /^\d+$/.test(String(rawBackendId))
      ? Number(rawBackendId)
      : null;

  const {
    saving,
    error: mutationError,
    saveGuest,
    deleteGuest,
    importGuests,
    markGuestAsSent,
  } = useGuestMutations({
    eventId,
    backendInvitation,
    manualGuests,
    setManualGuests,
    backendGuests,
    setBackendGuests,
    refreshData,
  });

  const [groups] = useState(() =>
    readList(scopedKey("koupreng.host.guestGroups", eventId), DEFAULT_GROUPS)
  );
  const [categories] = useState(() =>
    readList(scopedKey("koupreng.host.guestCategories", eventId), DEFAULT_CATEGORIES)
  );

  const localFilters = useGuestFilters(guests);
  const serverMode = Boolean(backendInvitationId || /^[1-9]\d*$/.test(String(eventId || '')));
  const queryPending = serverMode && serverQuery !== debouncedQuery;
  const changeQuery = patch => { setSelectedIds([]); setServerQuery(current => ({ ...current, ...patch, page: 0 })); };
  const { search, setSearch, groupFilter, setGroupFilter, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, clearFilters, filteredGuests } = serverMode ? {
    search: serverQuery.search, setSearch: search => changeQuery({ search }), groupFilter: serverQuery.group, setGroupFilter: group => changeQuery({ group }),
    categoryFilter: serverQuery.category, setCategoryFilter: category => changeQuery({ category }), statusFilter: serverQuery.status, setStatusFilter: status => changeQuery({ status }),
    clearFilters: () => changeQuery({ search: '', group: '', category: '', status: '' }), filteredGuests: guests,
  } : localFilters;
  const currentSelected = selectedIds.filter(id => guests.some(guest => String(guest.backendId || guest.id) === id && !guest.pending));
  const totalRecords = serverMode ? overview?.guestRecords : guests.length;
  const matchingRecords = serverMode ? pageInfo?.totalElements : filteredGuests.length;
  const statusCount = value => serverMode ? overview?.[({ '': 'guestRecords', pending: 'toInviteRecords', responded: 'respondedRecords', checkedIn: 'checkedInRecords', attending: 'attendingRecords', declined: 'declinedRecords', maybe: 'maybeRecords', unanswered: 'unansweredRecords' })[value]] ?? '—' : guests.filter(guest => matchesGuestStatus(guest, value)).length;
  async function exportSelected() {
    if (!currentSelected.length || exporting) return;
    setExporting(true);
    try { await guestService.exportSelection(backendInvitationId, currentSelected.map(Number)); toast.success(en ? 'Selected guest records exported' : 'បាននាំចេញកំណត់ត្រាភ្ញៀវដែលបានជ្រើស'); }
    catch (error) { toast.error(error.message || (en ? 'Could not export selected guests' : 'មិនអាចនាំចេញភ្ញៀវដែលបានជ្រើស')); }
    finally { setExporting(false); }
  }

  const [deleteGuestTarget, setDeleteGuestTarget] = useState(null);
  const [qrGuestTarget, setQrGuestTarget] = useState(null);
  const [ticketGuest, setTicketGuest] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [guestFormFocus, setGuestFormFocus] = useState(0);

  const handleOpenEditGuest = (guest) => {
    setEditingGuest(guest);
    setGuestFormFocus(value => value + 1);
  };

  const handleSaveGuest = async (form, editingId = null) => {
    const success = await saveGuest(form, editingId);
    if (success) {
      setSelectedIds([]);
      if (serverMode) await refreshData();
      toast.success(
        editingId
          ? (t ? t("toastUpdated") : "កែប្រែព័ត៌មានភ្ញៀវបានជោគជ័យ")
          : (t ? t("toastAdded") : "បន្ថែមភ្ញៀវបានជោគជ័យ")
      );
    }
    return success;
  };

  const handleConfirmDelete = async () => {
    if (!deleteGuestTarget) return;
    const success = await deleteGuest(deleteGuestTarget);
    if (success) {
      setDeleteGuestTarget(null);
      setSelectedIds([]);
      if (serverMode) setServerQuery(current => ({ ...current, page: 0 }));
      toast.success(t ? t("toastDeleted") : "លុបឈ្មោះភ្ញៀវបានជោគជ័យ");
    }
  };

  const handleCopyLink = async (text) => {
    try {
      if (await copyText(text)) {
        toast.success(t("messageCopied"));
        return true;
      }
    } catch { /* Clipboard access can be denied by the browser. */ }
    toast.error(t("linkCopyFailed"));
    return false;
  };

  const handleMarkAsSent = async (guest) => {
    if (!guest) return false;
    const success = await markGuestAsSent(guest);
    if (success) {
      toast.success(t("statusSent"));
    }
    return success;
  };

  const handleGuestSynced = useCallback(
    (updatedGuest) => {
      if (!updatedGuest) return;
      setQrGuestTarget(updatedGuest);

      setBackendGuests((current) => {
        const exists = current.some(
          (g) =>
            String(g.id) === String(updatedGuest.id) ||
            String(g.backendId) === String(updatedGuest.backendId) ||
            (g.name === updatedGuest.name && (g.phone || "") === (updatedGuest.phone || ""))
        );
        if (exists) {
          return current.map((g) =>
            String(g.id) === String(updatedGuest.id) ||
            String(g.backendId) === String(updatedGuest.backendId) ||
            (g.name === updatedGuest.name && (g.phone || "") === (updatedGuest.phone || ""))
              ? { ...g, ...updatedGuest }
              : g
          );
        }
        return [...current, updatedGuest];
      });

      setManualGuests((current) => {
        const next = current.map((g) =>
          String(g.id) === String(updatedGuest.id) || g.name === updatedGuest.name
            ? { ...g, ...updatedGuest }
            : g
        );
        saveManualGuests(next, eventId);
        return next;
      });
    },
    [eventId, setBackendGuests, setManualGuests]
  );

  const handleExportCsv = async () => {
    if (backendInvitationId) {
      try {
        await exportSelected();

      } catch (failure) {
        toast.error(failure.message || "Could not export guests");
      }
      return;
    }
    if (!guests || !guests.length) {
      toast.error(t ? t("noGuestsToExport") : "មិនមានទិន្នន័យភ្ញៀវសម្រាប់ទាញយកទេ");
      return;
    }
    const eventTitle = backendInvitation?.title || draftMatch?.title || "wedding";
    const success = exportGuestsToCsv(guests, eventTitle);
    if (success) {
      toast.success(t ? t("exportSuccess") : "បានទាញយកបញ្ជីភ្ញៀវដោយជោគជ័យ (CSV)");
    }
  };

  const eventTitle = draftMatch?.title || backendInvitation?.title || null;
  const hasFilters = Boolean(search || groupFilter || categoryFilter || statusFilter);
  const statusOptions = [
    { value: "", label: "allGuests" },
    { value: "pending", label: "toInvite" },
    { value: "responded", label: "statResponded" },
    { value: "checkedIn", label: "checkedIn" },
    ...(serverMode ? [
      { value: 'attending', text: en ? 'Confirmed RSVP' : 'RSVP ចូលរួម' },
      { value: 'declined', text: en ? 'Declined RSVP' : 'RSVP មិនចូលរួម' },
      { value: 'maybe', text: en ? 'Maybe' : 'ប្រហែលចូលរួម' },
      { value: 'unanswered', text: en ? 'No RSVP response' : 'មិនទាន់មាន RSVP' },
    ] : []),
  ];
  const checkInUrl = backendInvitationId
    ? `/dashboard/invitations/${backendInvitationId}/check-in`
    : "/dashboard/check-in";

  return (
    <main className="dash-main pe-guests-page guest-workspace">
      <header className="guest-page-header">
        <div>
          {eventTitle && <p className="guest-event-name"><span aria-hidden="true" />{eventTitle}</p>}
          <h1>{t ? t("title") : "បញ្ជីភ្ញៀវកិត្តិយស"}</h1>
        </div>
        <div className="guest-header-actions">
          <button type="button" className="guest-button guest-button-secondary" disabled={loading || !backendInvitationId} onClick={() => setImportModalOpen(true)}>
            <Upload size={17} aria-hidden="true" /><span>{t("importBtn")}</span>
          </button>
        </div>
      </header>

      {(!serverMode || overview) && <GuestStats guests={guests} summary={serverMode ? overview : undefined} t={key => serverMode ? ({ statTotalGuests: en ? 'Guest records' : 'កំណត់ត្រាភ្ញៀវ', statTotalSeats: en ? 'Reserved seats' : 'កៅអីកក់', statSent: en ? 'Marked sent / opened' : 'បានសម្គាល់ផ្ញើ / បើក' })[key] || t(key) : t(key)} />}

      <section className="guest-list-panel" aria-labelledby="guest-list-heading" aria-busy={loading || queryPending}>
        <div className="guest-list-heading">
          <div className="guest-list-title"><Users size={20} aria-hidden="true" /><h2 id="guest-list-heading">{t("listTitle")}</h2><span className="guest-total-badge">{totalRecords ?? "—"}</span></div>
          <div className="guest-list-tools">
            <Link to={checkInUrl} className="guest-text-button"><QrCode size={17} aria-hidden="true" />{t("checkInAction")}</Link>
            <button type="button" className="guest-text-button" disabled={serverMode && (!currentSelected.length || loading || queryPending || exporting)} onClick={handleExportCsv}><Download size={17} aria-hidden="true" />{serverMode ? (en ? `Export selected (${currentSelected.length})` : `នាំចេញដែលបានជ្រើស (${currentSelected.length})`) : t("exportBtn")}</button>
          </div>
        </div>
        <div className="guest-status-filters" role="group" aria-label={t("filterByStatus")}>
          {statusOptions.map((option) => (
            <button key={option.value} type="button" aria-pressed={statusFilter === option.value} onClick={() => setStatusFilter(option.value)}>
              {option.text || t(option.label)}<span>{statusCount(option.value)}</span>
            </button>
          ))}
        </div>
        <GuestFilters
        search={search}
        setSearch={setSearch}
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        groups={groups}
        categories={categories}
        onClear={clearFilters}
        t={t}
      />

      {(error || mutationError) && (
        <ErrorState message={error || mutationError} onRetry={refreshData} />
      )}

      <div className="guest-results-summary" role="status" aria-live="polite">{loading || queryPending ? t("loadingGuests") : serverMode ? (en ? `Showing ${filteredGuests.length} of ${matchingRecords ?? '—'} matching guest records.` : `បង្ហាញ ${filteredGuests.length} ក្នុង ${matchingRecords ?? '—'} កំណត់ត្រាភ្ញៀវដែលត្រូវនឹងតម្រង។`) : t("resultsCount", { shown: filteredGuests.length, total: guests.length })}{hasFilters && <button type="button" className="guest-text-button" onClick={clearFilters}>{t("clearFilters")}</button>}</div>
      {serverMode && <div className="guest-page-controls"><label>{en ? 'Records per page' : 'កំណត់ត្រាក្នុងមួយទំព័រ'}<select value={serverQuery.size} onChange={event => changeQuery({ size: Number(event.target.value) })}>{[25,50,100].map(size => <option key={size} value={size}>{size}</option>)}</select></label><button type="button" className="guest-button guest-button-secondary" disabled={loading || queryPending || serverQuery.page === 0} onClick={() => { setSelectedIds([]); setServerQuery(current => ({ ...current, page: current.page - 1 })); }}>{en ? 'Previous page' : 'ទំព័រមុន'}</button><span>{serverQuery.page + 1} / {Math.max(1,pageInfo?.totalPages || 1)}</span><button type="button" className="guest-button guest-button-secondary" disabled={loading || queryPending || !pageInfo || serverQuery.page + 1 >= pageInfo.totalPages} onClick={() => { setSelectedIds([]); setServerQuery(current => ({ ...current, page: current.page + 1 })); }}>{en ? 'Next page' : 'ទំព័របន្ទាប់'}</button><small>{en ? 'Selection resets when you change page or filters. Exports omit contacts and guest tokens.' : 'ការជ្រើសរើសត្រូវលុបពេលប្ដូរទំព័រ ឬតម្រង។ ឯកសារនាំចេញមិនរួមទំនាក់ទំនង ឬកូដភ្ញៀវ។'}</small></div>}
      {loading && !pageInfo ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <div className="pe-desktop-table-wrap">
          <GuestTable
            inlineForm={<GuestInlineForm
              key={editingGuest?.id ?? "new"}
              guest={editingGuest}
              onCancel={() => setEditingGuest(null)}
              onSave={handleSaveGuest}
              groups={groups}
              categories={categories}
              saving={saving || loading || queryPending}
              error={mutationError}
              focusRequest={guestFormFocus}
              t={t}
            />}
            guests={filteredGuests}
            selectedIds={currentSelected}
            onSelectionChange={serverMode ? setSelectedIds : undefined}
            groups={groups}
            categories={categories}
            saving={saving || loading || queryPending}
            showQuickAdd={false}
            isFiltered={hasFilters}
            onClearFilters={clearFilters}
            onOpenImport={() => setImportModalOpen(true)}
            emptyMessage={
              hasFilters
                ? (t ? t("emptySearchDesc") : "មិនមានភ្ញៀវត្រូវនឹងការស្វែងរកនេះទេ")
                : (t ? t("emptyDesc") : "មិនទាន់មានឈ្មោះភ្ញៀវទេ។ ចាប់ផ្តើមដោយបន្ថែមភ្ញៀវម្នាក់ ឬនាំចូលបញ្ជី។")
            }
            currentDraft={draftMatch}
            publicInvitation={publicInvitation}
            onSaveGuest={handleSaveGuest}
            onEdit={handleOpenEditGuest}
            onDelete={(g) => setDeleteGuestTarget(g)}
            onShowQr={ownerTools ? (g) => setQrGuestTarget(g) : undefined}
            onShowTicket={ownerTools && backendInvitationId ? guest => setTicketGuest(guest) : undefined}
            deliveryPath={ownerTools && backendInvitationId ? `/app/events/${backendInvitationId}/delivery` : undefined}
            onCopyLink={handleCopyLink}
            onMarkAsSent={ownerTools ? handleMarkAsSent : undefined}
            t={t}
          />
        </div>
      )}
      </section>

      <GuestDeleteDialog
        guest={deleteGuestTarget}
        onClose={() => setDeleteGuestTarget(null)}
        onConfirm={handleConfirmDelete}
        saving={saving}
        t={t}
      />

      <GuestQrModal
        guest={qrGuestTarget}
        currentDraft={draftMatch}
        publicInvitation={publicInvitation || backendInvitation}
        backendInvitationId={backendInvitationId}
        onGuestSynced={handleGuestSynced}
        onClose={() => setQrGuestTarget(null)}
        onCopyLink={handleCopyLink}
        onMarkAsSent={ownerTools ? handleMarkAsSent : undefined}
        saving={saving}
        t={t}
      />

      {ticketGuest && <TicketModal eventId={backendInvitationId} guestId={ticketGuest.backendId || ticketGuest.id} onClose={() => setTicketGuest(null)} />}

      {importModalOpen && <Suspense fallback={<p role="status">{en ? 'Loading import…' : 'កំពុងបើកការនាំចូល…'}</p>}><GuestImportModal
        key={backendInvitationId}
        invitationId={backendInvitationId}
        onFileImported={() => { setSelectedIds([]); setServerQuery(current => ({ ...current, page: 0 })); return refreshData(); }}
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        saving={saving}
        onImport={importGuests}
        error={mutationError}
        t={t}
      /></Suspense>}

    </main>
  );
}

