import {
    IoAddOutline,
    IoCloseOutline,
    IoCreateOutline,
    IoSaveOutline,
} from "react-icons/io5";
import { DatePicker } from "../../../shared/ui/DatePicker";
import { GuestSelectField } from "./GuestSelectField";
import { PaymentMethodSelect } from "./PaymentMethodSelect";

export function GiftFormModal({
    show,
    editingId,
    form,
    updateForm,
    submitGift,
    resetForm,
    guestOptions,
    gifts,
    saving,
    isDuplicateGift,
    t,
}) {
    if (!show) return null;

    return (
        <div className="wg-modal-layer" onClick={resetForm}>
            <div className="wg-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="wg-modal-x" onClick={resetForm}>
                    <IoCloseOutline aria-hidden="true" />
                </button>
                <div className="wg-modal-content">
                    <form className="wg-form" onSubmit={submitGift}>
                        <h3 className="wg-form-title">
                            {editingId ? (
                                <><IoCreateOutline aria-hidden="true" />{t ? t("formTitleEdit") : "Edit Gift Record"}</>
                            ) : (
                                <><IoAddOutline aria-hidden="true" />{t ? t("formTitleAdd") : "Record New Gift"}</>
                            )}
                        </h3>
                        <div className="wg-form-body">
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <label className="wg-field-full">
                                    <span>{t ? t("fieldMethod") : "Payment Method"}</span>
                                    <PaymentMethodSelect
                                        value={form.method}
                                        onChange={(val) => updateForm("method", val)}
                                    />
                                </label>
                                <label className="wg-field-full">
                                    <span>{t ? t("fieldAmount") : "Amount"}</span>
                                    <div className="wg-input-with-icon">
                                        <span className="wg-input-prefix">{form.currency === "KHR" ? "៛" : "$"}</span>
                                        <input type="number" min="0" step="any" value={form.amount} onChange={(e) => updateForm("amount", e.target.value)} placeholder="0" />
                                    </div>
                                </label>
                                <label className="wg-field-full">
                                    <span>Currency / រូបិយប័ណ្ណ</span>
                                    <select value={form.currency || "USD"} onChange={(e) => updateForm("currency", e.target.value)}>
                                        <option value="USD">USD ($)</option>
                                        <option value="KHR">KHR (៛)</option>
                                    </select>
                                </label>
                                <label className="wg-field-full">
                                    <span>{t ? t("fieldDate") : "Date"}</span>
                                    <DatePicker value={form.date} onChange={(v) => updateForm("date", v)} placeholder={t ? t("fieldDate") : "Date"} />
                                </label>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <label className="wg-field-full">
                                    <span>{t ? t("fieldName") : "Guest / Contributor Name"} <em>*</em></span>
                                    <GuestSelectField 
                                        value={form.name} 
                                        onChange={(val) => updateForm("name", val)} 
                                        options={guestOptions}
                                        existingGifts={gifts}
                                        t={t}
                                        placeholder={t ? t("placeholderName") : "Search guest..."} 
                                    />
                                </label>
                                <label className="wg-field-full" style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                    <span>{t ? t("fieldNote") : "Wishes / Notes"}</span>
                                    <textarea
                                        value={form.note}
                                        onChange={(e) => updateForm("note", e.target.value)}
                                        placeholder={t ? t("placeholderNote") : "Wishes or notes from guest..."}
                                        style={{ flexGrow: 1, resize: "none" }}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="wg-form-actions">
                            <button type="button" className="wg-secondary-btn" onClick={resetForm}>{t ? t("cancelBtn") : "Cancel"}</button>
                            <button type="submit" className="wg-add-btn" disabled={!form.name.trim() || saving || isDuplicateGift}>
                                {saving ? (t ? t("savingText") || "Saving..." : "Saving...") : editingId
                                    ? (<><IoSaveOutline aria-hidden="true" />{t ? t("saveBtn") : "Save Gift Record"}</>)
                                    : (<><IoAddOutline aria-hidden="true" />{t ? t("addItemBtn") || t("saveBtn") || "Add Gift" : "Add Gift"}</>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default GiftFormModal;
