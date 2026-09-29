import {
    IoAddOutline,
    IoCloseOutline,
    IoCreateOutline,
    IoSaveOutline,
    IoTrashOutline,
} from "react-icons/io5";
import { DatePicker } from "../../../shared/ui/DatePicker";

const CATEGORIES = ["Food & Catering", "Decor & Flowers", "Attire & Makeup", "Venue & Transport", "Other"];

export function ExpenseFormModal({
    show,
    editingId,
    form,
    updateForm,
    submitExpense,
    resetForm,
    addPaymentRow,
    updatePaymentRow,
    removePaymentRow,
    saving,
    t,
}) {
    if (!show) return null;

    const sumPayments = (form.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    return (
        <div className="exp-modal-layer" onClick={resetForm}>
            <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="exp-modal-x" onClick={resetForm}>
                    <IoCloseOutline aria-hidden="true" />
                </button>
                <div className="exp-modal-content">
                    <form className="exp-form" onSubmit={submitExpense}>
                        <h3 className="exp-form-title">
                            {editingId ? (
                                <><IoCreateOutline aria-hidden="true" />{t ? t("formTitleEdit") : "Edit Expense"}</>
                            ) : (
                                <><IoAddOutline aria-hidden="true" />{t ? t("formTitleAdd") : "Add New Expense"}</>
                            )}
                        </h3>
                        <div className="exp-form-body">
                            <div className="exp-form-col">
                                <label className="exp-field-full">
                                    <span>{t ? t("fieldName") : "Expense Item Name"} <em>*</em></span>
                                    <input
                                        type="text"
                                        required
                                        placeholder={t ? t("fieldNamePlaceholder") : "e.g. Venue Rental, Catering..."}
                                        value={form.name}
                                        onChange={(e) => updateForm("name", e.target.value)}
                                    />
                                </label>
                                <label className="exp-field-full">
                                    <span>{t ? t("fieldCategory") : "Category"}</span>
                                    <select
                                        value={form.category}
                                        onChange={(e) => updateForm("category", e.target.value)}
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="exp-budget-grid">
                                    <label className="exp-field-full">
                                        <span>{t ? t("fieldBudget") : "Estimated Budget"}</span>
                                        <div className="exp-input-with-icon">
                                            <span className="exp-input-prefix">{form.currency === "KHR" ? "៛" : "$"}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                placeholder="0"
                                                value={form.budget}
                                                onChange={(e) => updateForm("budget", e.target.value)}
                                            />
                                        </div>
                                    </label>
                                    <label className="exp-field-full">
                                        <span>{t ? t("fieldAmount") : "Actual Amount"}</span>
                                        <div className="exp-input-with-icon">
                                            <span className="exp-input-prefix">{form.currency === "KHR" ? "៛" : "$"}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                placeholder="0"
                                                value={sumPayments > 0 ? sumPayments : form.amount}
                                                disabled={sumPayments > 0}
                                                onChange={(e) => updateForm("amount", e.target.value)}
                                            />
                                        </div>
                                    </label>
                                </div>
                                <label className="exp-field-full">
                                    <span>Currency / រូបិយប័ណ្ណ</span>
                                    <select value={form.currency || "USD"} onChange={(e) => updateForm("currency", e.target.value)}>
                                        <option value="USD">USD ($)</option>
                                        <option value="KHR">KHR (៛)</option>
                                    </select>
                                </label>
                                <label className="exp-field-full">
                                    <span>{t ? t("fieldDate") : "Date"}</span>
                                    <DatePicker
                                        value={form.date}
                                        onChange={(v) => updateForm("date", v)}
                                        placeholder={t ? t("fieldDate") : "Date"}
                                    />
                                </label>
                            </div>

                            <div className="exp-form-col">
                                <label className="exp-field-full">
                                    <span>{t ? t("fieldVendor") : "Vendor Name"}</span>
                                    <input
                                        type="text"
                                        placeholder={t ? t("fieldVendorPlaceholder") || "e.g. Sokha Hotel, Wedding Studio..." : "e.g. Sokha Hotel, Wedding Studio..."}
                                        value={form.vendorName}
                                        onChange={(e) => updateForm("vendorName", e.target.value)}
                                    />
                                </label>
                                <label className="exp-field-full exp-field-notes">
                                    <span>{t ? t("fieldNotes") : "Additional Notes"}</span>
                                    <textarea
                                        rows={3}
                                        placeholder={t ? t("placeholderNotes") : "Contract details or contact numbers..."}
                                        value={form.notesText}
                                        onChange={(e) => updateForm("notesText", e.target.value)}
                                    />
                                </label>

                                {/* Payments / Deposits section */}
                                <div className="exp-payments-section">
                                    <div className="exp-payments-header">
                                        <span className="exp-payments-title">
                                            {t ? t("paymentsTitle") : "Payments & Installments"} ({form.payments?.length || 0})
                                        </span>
                                        <button
                                            type="button"
                                            className="exp-add-payment-btn"
                                            onClick={addPaymentRow}
                                        >
                                            <IoAddOutline aria-hidden="true" />
                                            {t ? t("addPaymentBtn") : "+ Add"}
                                        </button>
                                    </div>
                                    {(form.payments || []).length === 0 ? (
                                        <div className="exp-payments-empty">
                                            {t ? t("paymentsEmpty") || "មិនទាន់មានការកក់ប្រាក់ ឬបង់រំលស់ទេ" : "No deposits or installments recorded yet."}
                                        </div>
                                    ) : (
                                        (form.payments || []).map((p, idx) => (
                                            <div key={idx} className="exp-payment-row">
                                                <input
                                                    type="text"
                                                    className="exp-payment-desc"
                                                    placeholder="Description (e.g. Deposit)"
                                                    value={p.desc || ""}
                                                    onChange={(e) => updatePaymentRow(idx, "desc", e.target.value)}
                                                />
                                                <div className="exp-payment-amount-wrap">
                                                    <span className="exp-input-prefix">{form.currency === "KHR" ? "៛" : "$"}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        className="exp-payment-amount"
                                                        placeholder="0"
                                                        value={p.amount || ""}
                                                        onChange={(e) => updatePaymentRow(idx, "amount", e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="exp-payment-del-btn"
                                                    title="Delete"
                                                    aria-label="Delete installment"
                                                    onClick={() => removePaymentRow(idx)}
                                                >
                                                    <IoTrashOutline aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="exp-form-actions">
                            <button type="button" className="exp-secondary-btn" onClick={resetForm}>
                                {t ? t("cancelBtn") : "Cancel"}
                            </button>
                            <button type="submit" className="exp-add-btn" disabled={!form.name.trim() || saving}>
                                {saving ? (t ? t("saving") || "Saving..." : "Saving...") : editingId ? (
                                    <><IoSaveOutline aria-hidden="true" />{t ? t("saveBtn") : "Save Expense"}</>
                                ) : (
                                    <><IoAddOutline aria-hidden="true" />{t ? t("saveBtn") || "Save Expense" : "Save Expense"}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ExpenseFormModal;
