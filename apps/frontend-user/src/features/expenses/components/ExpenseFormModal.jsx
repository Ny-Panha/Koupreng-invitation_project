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

    const sumPayments = (form.payments || []).reduce((total, payment) => {
        const amount = Number(payment.amount);
        return Number.isFinite(amount) && amount >= 0 ? total + amount : total;
    }, 0);
    const budget = Number(form.budget) || 0;
    const remainingBalance = budget - sumPayments;
    const paymentStatus = sumPayments === 0
        ? "unpaid"
        : sumPayments >= budget ? "paid" : "partial";
    const progress = budget > 0 ? Math.min((sumPayments / budget) * 100, 100) : sumPayments > 0 ? 100 : 0;

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
                                        <span>{t ? t("fieldAmount") : "Actual Expense ($) / ចំណាយពិត"}</span>
                                        <div className="exp-input-with-icon">
                                            <span className="exp-input-prefix">{form.currency === "KHR" ? "៛" : "$"}</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                    value={sumPayments}
                                                    readOnly
                                                    aria-readonly="true"
                                                    className="exp-calculated-input"
                                            />
                                        </div>
                                            <small className="exp-field-hint">{t ? t("actualAutoHint") : "(គណនាស្វ័យប្រវត្តិតាមការបង់ប្រាក់)"}</small>
                                    </label>
                                </div>
                                    <label className="exp-field-full">
                                        <span>{t ? t("fieldRemaining") : "Remaining Balance ($) / នៅខ្វះ"}</span>
                                        <div className="exp-input-with-icon">
                                            <span className="exp-input-prefix">{form.currency === "KHR" ? "៛" : "$"}</span>
                                            <input
                                                type="number"
                                                value={remainingBalance}
                                                readOnly
                                                aria-readonly="true"
                                                className="exp-calculated-input"
                                            />
                                        </div>
                                    </label>
                                    <div className="exp-payment-progress" aria-live="polite">
                                        <div className="exp-payment-progress-heading">
                                            <span>{t ? t("paymentStatus") : "ស្ថានភាពការបង់ប្រាក់"}</span>
                                            <strong className={`exp-payment-status exp-payment-status-${paymentStatus}`}>
                                                {t ? t(paymentStatus === "unpaid" ? "statusUnpaid" : paymentStatus === "partial" ? "statusPartial" : "statusFullyPaid") : paymentStatus}
                                            </strong>
                                        </div>
                                        <div
                                            className="exp-payment-progress-track"
                                            role="progressbar"
                                            aria-label={t ? t("paymentProgress") : "Payment progress"}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                            aria-valuenow={Math.round(progress)}
                                        >
                                            <span style={{ width: `${progress}%` }} />
                                        </div>
                                        <small>{Math.round(progress)}% {t ? t("paidOfBudget") : "paid"}</small>
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
                                                    placeholder={t ? t("paymentFor") : "ការពិពណ៌នា (ឧ. ប្រាក់កក់)"}
                                                    aria-label={`${t ? t("paymentFor") : "ការពិពណ៌នាការបង់ប្រាក់"} ${idx + 1}`}
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
                                                        aria-label={`${t ? t("paymentAmount") : "ចំនួនប្រាក់"} ${idx + 1}`}
                                                        value={p.amount || ""}
                                                        onChange={(e) => updatePaymentRow(idx, "amount", e.target.value)}
                                                    />
                                                </div>
                                                <input
                                                    type="date"
                                                    className="exp-payment-date"
                                                    aria-label={`${t ? t("paymentDate") : "កាលបរិច្ឆេទបង់ប្រាក់"} ${idx + 1}`}
                                                    value={p.date || ""}
                                                    onChange={(e) => updatePaymentRow(idx, "date", e.target.value)}
                                                />
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
                                    {sumPayments > budget && (
                                        <p className="exp-payment-warning" role="alert">
                                            {t ? t("paymentsOverBudget") : "ការបង់ប្រាក់សរុបលើសពីថវិកាគ្រោងទុក។"}
                                        </p>
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
