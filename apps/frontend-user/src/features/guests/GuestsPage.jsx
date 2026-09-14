import { useState } from "react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { EmptyState, ErrorState, SkeletonTable, toast } from "@/shared/ui";
import { useGuests } from "./hooks/useGuests";
import { useGuestMutations } from "./hooks/useGuestMutations";
import { useGuestFilters } from "./hooks/useGuestFilters";
import { DEFAULT_CATEGORIES, DEFAULT_GROUPS, EMPTY_GUEST_FORM } from "./model/guestConstants";
import { copyText } from "./model/guestMappers";
import GuestStats from "./components/GuestStats";
import GuestFilters from "./components/GuestFilters";
import GuestTable from "./components/GuestTable";
import GuestCard from "./components/GuestCard";
import GuestFormModal from "./components/GuestFormModal";
import GuestDeleteDialog from "./components/GuestDeleteDialog";
import GuestQrModal from "./components/GuestQrModal";
import GuestImportModal from "./components/GuestImportModal";
import GroupCategoryModal from "./components/GroupCategoryModal";
import { exportGuestsToCsv } from "./model/guestCsvUtils";
import "./GuestsPage.css";

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

function writeList(key, list) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // localStorage full or unavailable
  }
}

export default function GuestsPage() {
  const { text: t } = useBackendMessages("guests");

  const {
    eventId,
    draftMatch,
    backendInvitation,
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

  const [groups, setGroups] = useState(() =>
    readList(scopedKey("koupreng.host.guestGroups", eventId), DEFAULT_GROUPS)
  );
  const [categories, setCategories] = useState(() =>
    readList(scopedKey("koupreng.host.guestCategories", eventId), DEFAULT_CATEGORIES)
  );

  const {
    search,
    setSearch,
    groupFilter,
    setGroupFilter,
    categoryFilter,
    setCategoryFilter,
    filteredGuests,
  } = useGuestFilters(guests);

  const [form, setForm] = useState(EMPTY_GUEST_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteGuestTarget, setDeleteGuestTarget] = useState(null);
  const [qrGuestTarget, setQrGuestTarget] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_GUEST_FORM);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (guest) => {
    setEditingId(guest.id);
    setForm({
      name: guest.name || "",
      companionName: guest.companionName || "",
      phone: guest.phone || "",
      group: guest.group || groups[0]?.name || "Groom Side",
      category: guest.category || categories[0]?.name || "Friend",
      note: guest.note || "",
      count: String(guest.count || 1),
      seat: guest.seat || "",
      sendStatus: guest.sendStatus || "មិនទាន់ផ្ញើ",
    });
    setFormModalOpen(true);
  };

  const handleSaveForm = async () => {
    const success = await saveGuest(form, editingId);
    if (success) {
      setFormModalOpen(false);
      toast.success(editingId ? (t ? t("toastUpdated") : "កែប្រែព័ត៌មានភ្ញៀវបានជោគជ័យ") : (t ? t("toastAdded") : "បន្ថែមភ្ញៀវបានជោគជ័យ"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteGuestTarget) return;
    const success = await deleteGuest(deleteGuestTarget);
    if (success) {
      setDeleteGuestTarget(null);
      toast.success(t ? t("toastDeleted") : "លុបឈ្មោះភ្ញៀវបានជោគជ័យ");
    }
  };

  const handleCopyLink = async (text, guest) => {
    const ok = await copyText(text);
    if (ok) {
      toast.success(t ? t("messageCopied") : "ចម្លងសារអញ្ជើញបានជោគជ័យ");
      if (
        guest &&
        (guest.sendStatus === "មិនទាន់ផ្ញើ" ||
          guest.sendStatus === "PENDING" ||
          !guest.sendStatus)
      ) {
        markGuestAsSent(guest);
      }
    } else {
      toast.error(t ? t("linkCopyFailed") : "មិនអាចចម្លងបានទេ");
    }
  };

  const handleSaveGroups = (nextGroups) => {
    setGroups(nextGroups);
    writeList(scopedKey("koupreng.host.guestGroups", eventId), nextGroups);
    setGroupModalOpen(false);
    toast.success(t ? t("toastUpdated") : "រក្សាទុកក្រុមបានជោគជ័យ");
  };

  const handleSaveCategories = (nextCategories) => {
    setCategories(nextCategories);
    writeList(scopedKey("koupreng.host.guestCategories", eventId), nextCategories);
    setCategoryModalOpen(false);
    toast.success(t ? t("toastUpdated") : "រក្សាទុកប្រភេទបានជោគជ័យ");
  };

  const handleExportCsv = () => {
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

  return (
    <main className="dash-main pe-guests-page">
      <header className="dash-page-header">
        <div>
          <span className="dash-kicker">{t ? t("kicker") : "Guest Management"}</span>
          <h1>{t ? t("title") : "គ្រប់គ្រងភ្ញៀវកិត្តិយស"}</h1>
          <p>{t ? t("subtitle") : "គ្រប់គ្រងបញ្ជីភ្ញៀវ QR Code ធៀបការ និងស្ថានភាព RSVP របស់អ្នក។"}</p>
        </div>
      </header>

      <GuestStats guests={guests} t={t} />

      <GuestFilters
        search={search}
        setSearch={setSearch}
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        groups={groups}
        categories={categories}
        onOpenCreate={handleOpenCreate}
        onOpenImport={() => setImportModalOpen(true)}
        onExportCsv={handleExportCsv}
        onOpenGroupManager={() => setGroupModalOpen(true)}
        onOpenCategoryManager={() => setCategoryModalOpen(true)}
        t={t}
      />

      {(error || mutationError) && (
        <ErrorState message={error || mutationError} onRetry={refreshData} />
      )}

      {loading ? (
        <SkeletonTable rows={5} columns={6} />
      ) : filteredGuests.length === 0 ? (
        <EmptyState
          title={search || groupFilter || categoryFilter ? "មិនមានលទ្ធផលស្វែងរកទេ" : (t ? t("emptyTitle") : "មិនទាន់មានភ្ញៀវនៅឡើយទេ")}
          description={search || groupFilter || categoryFilter ? "សូមសាកល្បងស្វែងរកដោយប្រើពាក្យផ្សេង" : (t ? t("emptyDesc") : "ចាប់ផ្តើមបន្ថែមភ្ញៀវដំបូងរបស់អ្នកឥឡូវនេះ")}
          actionLabel={t ? t("addGuestBtn") : "បន្ថែមភ្ញៀវ"}
          onAction={handleOpenCreate}
        />
      ) : (
        <>
          <div className="pe-desktop-table-wrap">
            <GuestTable
              guests={filteredGuests}
              currentDraft={draftMatch}
              publicInvitation={publicInvitation}
              onEdit={handleOpenEdit}
              onDelete={(g) => setDeleteGuestTarget(g)}
              onShowQr={(g) => setQrGuestTarget(g)}
              onCopyLink={handleCopyLink}
              t={t}
            />
          </div>

          <div className="pe-mobile-cards-wrap">
            {filteredGuests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                currentDraft={draftMatch}
                publicInvitation={publicInvitation}
                onEdit={handleOpenEdit}
                onDelete={(g) => setDeleteGuestTarget(g)}
                onShowQr={(g) => setQrGuestTarget(g)}
                onCopyLink={handleCopyLink}
                t={t}
              />
            ))}
          </div>
        </>
      )}

      <GuestFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        form={form}
        setForm={setForm}
        groups={groups}
        categories={categories}
        editingId={editingId}
        saving={saving}
        onSave={handleSaveForm}
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
        onClose={() => setQrGuestTarget(null)}
        onCopyLink={handleCopyLink}
        t={t}
      />

      <GuestImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        saving={saving}
        onImport={importGuests}
        error={mutationError}
        t={t}
      />

      <GroupCategoryModal
        isOpen={groupModalOpen}
        title={t ? t("manageGroupsTitle") : "គ្រប់គ្រងក្រុមភ្ញៀវ"}
        items={groups}
        onClose={() => setGroupModalOpen(false)}
        onSave={handleSaveGroups}
        t={t}
      />

      <GroupCategoryModal
        isOpen={categoryModalOpen}
        title={t ? t("manageCategoriesTitle") : "គ្រប់គ្រងប្រភេទភ្ញៀវ"}
        items={categories}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategories}
        t={t}
      />
    </main>
  );
}
