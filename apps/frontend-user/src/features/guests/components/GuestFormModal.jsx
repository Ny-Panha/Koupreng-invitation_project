import { useEffect, useRef, useState } from "react";
import Modal from "@/shared/ui/Modal";
import { SEND_STATUS } from "../model/guestConstants";

function initialForm(guest, groups, categories) {
  if (guest) {
    return {
      name: guest.name || "",
      companionName: guest.companionName || "",
      phone: guest.phone || "",
      count: String(guest.count || 1),
      group: guest.group || groups[0]?.name || "Groom Side",
      category: guest.category || categories[0]?.name || "Friend",
      seat: guest.seat || "",
      note: guest.note || "",
      sendStatus: guest.sendStatus || SEND_STATUS.pending,
    };
  }

  return {
    name: "",
    companionName: "",
    phone: "",
    count: "1",
    group: groups[0]?.name || "Groom Side",
    category: categories[0]?.name || "Friend",
    seat: "",
    note: "",
    sendStatus: SEND_STATUS.pending,
  };
}

export default function GuestFormModal({
  isOpen,
  onClose,
  onSave,
  guest = null,
  groups = [],
  categories = [],
  saving = false,
  t,
}) {
  const nameInputRef = useRef(null);
  const [form, setForm] = useState(() => initialForm(guest, groups, categories));
  const [nameError, setNameError] = useState("");
  const isEditing = Boolean(guest);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(guest, groups, categories));
      setNameError("");
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    }
  }, [isOpen, guest, groups, categories]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name") setNameError("");
  };

  const handleSubmit = async (event, addAnother = false) => {
    if (event) event.preventDefault();
    if (!form.name.trim()) {
      setNameError(t ? t("batchNameRequired") : "សូមបញ្ចូលឈ្មោះភ្ញៀវ");
      nameInputRef.current?.focus();
      return;
    }

    const payload = { ...form };
    const success = await onSave(payload, guest?.id || null);
    if (success) {
      if (addAnother && !isEditing) {
        setForm(initialForm(null, groups, categories));
        setNameError("");
        nameInputRef.current?.focus();
      } else {
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? (t ? t("editGuestTitle") : "កែប្រែព័ត៌មានភ្ញៀវ") : (t ? t("addGuestTitle") : "បន្ថែមភ្ញៀវថ្មី")}
      subtitle={
        isEditing
          ? (t ? t("editGuestSubtitle") : "កែប្រែព័ត៌មានលម្អិតរបស់ភ្ញៀវកិត្តិយស")
          : (t ? t("addGuestSubtitle") : "បញ្ចូលព័ត៌មានភ្ញៀវកិត្តិយសទៅក្នុងបញ្ជីមង្គលការរបស់អ្នក")
      }
      size="md"
      closeOnBackdropClick={!saving}
      closeOnEscape={!saving}
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        {/* Guest Name & Companion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="guestFormName" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("fieldName") : "ឈ្មោះភ្ញៀវ"}</span> <span className="text-rose-500">*</span>
            </label>
            <input
              id="guestFormName"
              ref={nameInputRef}
              type="text"
              required
              disabled={saving}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="ឧ. សុខ ដារ៉ា"
              className={`w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border rounded-xl shadow-xs transition-all focus:outline-none ${
                nameError
                  ? "border-rose-400 ring-2 ring-rose-500/20"
                  : "border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
              }`}
            />
            {nameError && (
              <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="guestFormCompanion" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("fieldCompanion") : "ឈ្មោះអ្នករួមដំណើរ / គូស្នេហ៍"}</span>
            </label>
            <input
              id="guestFormCompanion"
              type="text"
              disabled={saving}
              value={form.companionName}
              onChange={(e) => handleChange("companionName", e.target.value)}
              placeholder="ឧ. និង ភរិយា"
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Phone & Seats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="guestFormPhone" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("fieldPhone") : "លេខទូរស័ព្ទ"}</span>
            </label>
            <input
              id="guestFormPhone"
              type="tel"
              disabled={saving}
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="012 345 678"
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="guestFormCount" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("fieldSeats") : "ចំនួនកៅអី / មនុស្ស"}</span>
            </label>
            <input
              id="guestFormCount"
              type="number"
              min="1"
              max="50"
              disabled={saving}
              value={form.count}
              onChange={(e) => handleChange("count", e.target.value)}
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none font-semibold"
            />
          </div>
        </div>

        {/* Group & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="guestFormGroup" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("fieldGroup") : "ក្រុមភ្ញៀវ (Side / Group)"}</span>
            </label>
            <select
              id="guestFormGroup"
              disabled={saving}
              value={form.group}
              onChange={(e) => handleChange("group", e.target.value)}
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="guestFormCategory" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("fieldCategory") : "ប្រភេទភ្ញៀវ (Category)"}</span>
            </label>
            <select
              id="guestFormCategory"
              disabled={saving}
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table/Seat & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="guestFormSeat" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("batchFieldSeats") : "លេខតុ / កៅអី (Table / Seat)"}</span>
            </label>
            <input
              id="guestFormSeat"
              type="text"
              disabled={saving}
              value={form.seat}
              onChange={(e) => handleChange("seat", e.target.value)}
              placeholder="ឧ. A-01"
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="guestFormStatus" className="block text-xs font-bold text-slate-800 mb-1.5">
              <span>{t ? t("thStatus") : "ស្ថានភាពផ្ញើធៀប"}</span>
            </label>
            <select
              id="guestFormStatus"
              disabled={saving}
              value={form.sendStatus}
              onChange={(e) => handleChange("sendStatus", e.target.value)}
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            >
              <option value={SEND_STATUS.pending}>{t ? t("statusPending") : "មិនទាន់ផ្ញើ (Pending)"}</option>
              <option value={SEND_STATUS.sent}>{t ? t("statusSent") : "បានផ្ញើ (Sent)"}</option>
              <option value={SEND_STATUS.opened}>{t ? t("statusOpened") : "បានបើកមើល (Opened)"}</option>
              <option value={SEND_STATUS.responded}>{t ? t("statusResponded") : "បានឆ្លើយតប (Responded)"}</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="guestFormNote" className="block text-xs font-bold text-slate-800 mb-1.5">
            <span>{t ? t("fieldNote") : "កំណត់ចំណាំ (Notes)"}</span>
          </label>
          <input
            id="guestFormNote"
            type="text"
            disabled={saving}
            value={form.note}
            onChange={(e) => handleChange("note", e.target.value)}
            placeholder="ឧ. ញ៉ាំបួស, កន្លែងអង្គុយជិតឆាក"
            className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
          />
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {t ? t("cancel") : "បោះបង់"}
          </button>

          {!isEditing && (
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#B98B42] text-[#9C7332] hover:bg-[#B98B42]/10 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              {t ? t("saveAndAddAnother") : "រក្សាទុក និងបន្ថែមទៀត"}
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0F766E] hover:bg-[#0D5F58] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shadow-[#0F766E]/20 flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <span>{t ? t("saving") : "កំពុងរក្សាទុក..."}</span>
            ) : (
              <span>{isEditing ? (t ? t("save") : "រក្សាទុកការកែប្រែ") : (t ? t("addGuestBtn") : "+ បន្ថែមភ្ញៀវ")}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

