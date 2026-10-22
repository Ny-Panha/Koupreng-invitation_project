import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { Download, Plus, QrCode, Upload, Users } from "lucide-react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { ErrorState, SkeletonTable, toast } from "@/shared/ui";
import { useGuests } from "./hooks/useGuests";
import { useGuestMutations } from "./hooks/useGuestMutations";
import { useGuestFilters } from "./hooks/useGuestFilters";
import { DEFAULT_CATEGORIES, DEFAULT_GROUPS } from "./model/guestConstants";
import { copyText, guestInviteUrl } from "./model/guestMappers";
import { matchesGuestStatus } from "./model/guestStatus";
import GuestStats from "./components/GuestStats";
import GuestFilters from "./components/GuestFilters";
import GuestTable from "./components/GuestTable";
import GuestDeleteDialog from "./components/GuestDeleteDialog";
import GuestQrModal from "./components/GuestQrModal";
import TicketModal from "@/features/tickets/TicketModal";
import GuestImportModal from "./components/GuestImportModal";
import GuestFormModal from "./components/GuestFormModal";
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
  const { text: t } = useBackendMessages("guests");
  const en = useLanguageStore(state => state.lang) === "en";

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
  } = useGuests();

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
    lastSavedGuest,
  } = useGuestMutations({
    eventId,
    backendInvitation,
    manualGuests,
    setManualGuests,
    backendGuests,
    setBackendGuests,
    refreshData,
  });
  const savedGuestLink = lastSavedGuest ? guestInviteUrl(draftMatch, lastSavedGuest, publicInvitation || backendInvitation) : "";
  const savedPersonalLink = savedGuestLink.includes("?token=") ? savedGuestLink : "";

  const [groups] = useState(() =>
    readList(scopedKey("koupreng.host.guestGroups", eventId), DEFAULT_GROUPS)
  );
  const [categories] = useState(() =>
    readList(scopedKey("koupreng.host.guestCategories", eventId), DEFAULT_CATEGORIES)
  );

  const {
    search,
    setSearch,
    groupFilter,
    setGroupFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    clearFilters,
    filteredGuests,
  } = useGuestFilters(guests);

  const [deleteGuestTarget, setDeleteGuestTarget] = useState(null);
  const [qrGuestTarget, setQrGuestTarget] = useState(null);
  const [ticketGuest, setTicketGuest] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalGuest, setFormModalGuest] = useState(null);

  const handleOpenAddGuest = () => {
    setFormModalGuest(null);
    setFormModalOpen(true);
  };

  const handleOpenEditGuest = (guest) => {
    setFormModalGuest(guest);
    setFormModalOpen(true);
  };

  const handleSaveGuest = async (form, editingId = null) => {
    const success = await saveGuest(form, editingId);
    if (success) {
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
      toast.success(t ? t("toastDeleted") : "លុបឈ្មោះភ្ញៀវបានជោគជ័យ");
    }
  };

  const handleCopyLink = async (text) => {
    const ok = await copyText(text);
    if (ok) {
      toast.success(t ? t("messageCopied") : "បានចម្លងសារអញ្ជើញ");
    } else {
      toast.error(t ? t("linkCopyFailed") : "មិនអាចចម្លងបានទេ");
    }
  };

  const handleMarkAsSent = async (guest) => {
    if (!guest) return;
    const success = await markGuestAsSent(guest);
    if (success) {
      toast.success("បានសម្គាល់ថាបានផ្ញើ");
    }
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
        await guestService.exportCsv(backendInvitationId);
        toast.success("Guest CSV exported");
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
          <p className="guest-page-description">{t("workspaceSubtitle")}</p>
        </div>
        <div className="guest-header-actions">
          <button type="button" className="guest-button guest-button-secondary" onClick={() => setImportModalOpen(true)}>
            <Upload size={17} aria-hidden="true" /><span>{t("importBtn")}</span>
          </button>
          {(loading || guests.length > 0) && <button
            type="button"
            onClick={handleOpenAddGuest}
            className="guest-button guest-button-primary"
          >
            <Plus size={18} aria-hidden="true" /><span>{t("addGuestAction")}</span>
          </button>}
        </div>
      </header>

      {!loading && <GuestStats guests={guests} t={t} />}

      <section className="guest-list-panel" aria-labelledby="guest-list-heading" aria-busy={loading}>
        <div className="guest-list-heading">
          <div className="guest-list-title"><Users size={20} aria-hidden="true" /><h2 id="guest-list-heading">{t("listTitle")}</h2><span className="guest-total-badge">{guests.length}</span></div>
          <div className="guest-list-tools">
            <Link to={checkInUrl} className="guest-text-button"><QrCode size={17} aria-hidden="true" />{t("checkInAction")}</Link>
            <button type="button" className="guest-text-button" onClick={handleExportCsv}><Download size={17} aria-hidden="true" />{t("exportBtn")}</button>
          </div>
        </div>
        <div className="guest-status-filters" role="group" aria-label={t("filterByStatus")}>
          {statusOptions.map((option) => (
            <button key={option.value} type="button" aria-pressed={statusFilter === option.value} onClick={() => setStatusFilter(option.value)}>
              {t(option.label)}<span>{guests.filter((guest) => matchesGuestStatus(guest, option.value)).length}</span>
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
      {lastSavedGuest && !formModalOpen && <section className="guest-saved-context workspace-section" aria-label={en ? "Saved guest actions" : "ជម្រើសភ្ញៀវដែលបានរក្សាទុក"}>
        <p role="status">{en ? "Guest saved:" : "បានរក្សាទុកភ្ញៀវ៖"} <strong>{lastSavedGuest.name}</strong></p>
        <div className="guest-saved-actions">
          {backendInvitationId && lastSavedGuest.source === "backend" && <button className="workspace-button" type="button" onClick={() => setTicketGuest(lastSavedGuest)}>{en ? "View personal ticket" : "មើលកាតផ្ទាល់ខ្លួន"}</button>}
          {savedPersonalLink && <button className="workspace-button" type="button" onClick={() => handleCopyLink(savedPersonalLink)}>{en ? "Copy personal invitation link" : "ចម្លងតំណអញ្ជើញផ្ទាល់ខ្លួន"}</button>}
          {backendInvitationId && <Link className="workspace-button" to={`/app/events/${backendInvitationId}/delivery`}>{en ? "Send / share in Delivery" : "ផ្ញើ / ចែករំលែកតាមការផ្ញើ"}</Link>}
          {backendInvitationId && <Link className="workspace-button" to={`/app/events/${backendInvitationId}/rsvp`}>{en ? "Review RSVP" : "ពិនិត្យការឆ្លើយតប"}</Link>}
        </div>
        <p className="workspace-muted">{en ? "Sharing a link does not confirm delivery. Review tracked activity in Delivery." : "ការចែករំលែកតំណមិនបញ្ជាក់ថាបានបញ្ជូនទេ។ សូមពិនិត្យសកម្មភាពក្នុងការផ្ញើ។"}</p>
      </section>}

      <div className="guest-results-summary" role="status" aria-live="polite">{loading ? t("loadingGuests") : t("resultsCount", { shown: filteredGuests.length, total: guests.length })}{hasFilters && <button type="button" className="guest-text-button" onClick={clearFilters}>{t("clearFilters")}</button>}</div>
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <div className="pe-desktop-table-wrap">
          <GuestTable
            guests={filteredGuests}
            groups={groups}
            categories={categories}
            saving={saving}
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
            onShowQr={(g) => setQrGuestTarget(g)}
            onShowTicket={backendInvitationId ? guest => setTicketGuest(guest) : undefined}
            deliveryPath={backendInvitationId ? `/app/events/${backendInvitationId}/delivery` : undefined}
            onCopyLink={handleCopyLink}
            onMarkAsSent={handleMarkAsSent}
            onOpenAddGuest={guests.length === 0 ? handleOpenAddGuest : undefined}
            t={t}
          />
        </div>
      )}
      </section>

      {/* Add / Edit Guest Modal */}
      <GuestFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setFormModalGuest(null);
        }}
        onSave={handleSaveGuest}
        guest={formModalGuest}
        eventType={(backendInvitation || publicInvitation || draftMatch)?.eventType || "WEDDING"}
        groups={groups}
        categories={categories}
        saving={saving}
        error={mutationError}
        t={t}
      />

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
        t={t}
      />

      {ticketGuest && <TicketModal eventId={backendInvitationId} guestId={ticketGuest.backendId || ticketGuest.id} onClose={() => setTicketGuest(null)} />}

      <GuestImportModal
        invitationId={backendInvitationId}
        onFileImported={refreshData}
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        saving={saving}
        onImport={importGuests}
        error={mutationError}
        t={t}
      />

    </main>
  );
}

