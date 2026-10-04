import {
    IoCalendarClearOutline,
    IoCardOutline,
    IoCashOutline,
    IoCreateOutline,
    IoGiftOutline,
    IoPhonePortraitOutline,
    IoSaveOutline,
    IoTrashOutline,
} from "react-icons/io5";
import { GuestSelectField, getGuestLabel } from "./GuestSelectField";

const METHOD_STYLES = {
    "Bakong QR": { bg: "#e0f2fe", color: "#0369a1", Icon: IoPhonePortraitOutline },
    ABA: { bg: "#fef3c7", color: "#b45309", Icon: IoCardOutline },
    Cash: { bg: "#dcfce7", color: "#15803d", Icon: IoCashOutline },
    "សាច់ប្រាក់": { bg: "#dcfce7", color: "#15803d", Icon: IoCashOutline },
};

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const date = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? dateStr
        : date.toLocaleDateString("km-KH", { year: "numeric", month: "short", day: "numeric" });
}

export function GiftTable({
    gifts = [],
    guestOptions = [],
    form,
    editingId,
    updateForm,
    submitGift,
    resetForm,
    isDuplicateGift,
    editGift,
    deleteGift,
    saving,
    t,
}) {
    const labels = {
        name: t ? t("colName") : "Contributor Name",
        amount: t ? t("colAmount") : "Amount",
        method: t ? t("colMethod") : "Payment Method",
        date: t ? t("colDate") : "Date",
        note: t ? t("colNote") : "Wishes / Notes",
        actions: t ? t("colActions") : "Actions",
    };

    return (
        <div className="wg-table-wrap">
            <table className="wg-table wg-table-fixed w-full table-fixed">
                <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[17%]" />
                    <col className="w-[16%]" />
                    <col className="w-[15%]" />
                    <col className="w-[18%]" />
                    <col className="w-[12%]" />
                </colgroup>
                <thead>
                    <tr>
                        <th>{labels.name} <em aria-hidden="true">*</em></th>
                        <th>{labels.amount}</th>
                        <th>{labels.method}</th>
                        <th>{labels.date}</th>
                        <th>{labels.note}</th>
                        <th className="wg-th-actions">{labels.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="wg-inline-form-row">
                        <td data-label={labels.name}>
                            <GuestSelectField
                                value={form.name}
                                guestId={form.guestId}
                                onChange={({ name, guestId }) => {
                                    updateForm("name", name);
                                    updateForm("guestId", guestId);
                                }}
                                options={guestOptions}
                                existingGifts={gifts.filter((gift) => gift.id !== editingId)}
                                placeholder={t ? t("placeholderName") : "Search or enter a name"}
                                ariaLabel={labels.name}
                                t={t}
                            />
                            {isDuplicateGift && <small className="wg-inline-error" role="status">{t ? t("alreadyGiven") : "This guest already has a gift record."}</small>}
                        </td>
                        <td data-label={labels.amount}>
                            <div className="wg-inline-amount">
                                <input
                                    aria-label={labels.amount}
                                    form="gift-inline-form"
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={form.amount}
                                    onChange={(event) => updateForm("amount", event.target.value)}
                                    placeholder="0"
                                />
                                <select aria-label="Currency" value={form.currency || "USD"} onChange={(event) => updateForm("currency", event.target.value)}>
                                    <option value="USD">USD</option>
                                    <option value="KHR">KHR</option>
                                </select>
                            </div>
                        </td>
                        <td data-label={labels.method}>
                            <select aria-label={labels.method} value={form.method} onChange={(event) => updateForm("method", event.target.value)}>
                                <option value="Bakong QR">Bakong QR</option>
                                <option value="ABA">ABA</option>
                                <option value="Cash">Cash</option>
                                {!['Bakong QR', 'ABA', 'Cash'].includes(form.method) && <option value={form.method}>{form.method}</option>}
                            </select>
                        </td>
                        <td data-label={labels.date}>
                            <input aria-label={labels.date} form="gift-inline-form" type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} />
                        </td>
                        <td data-label={labels.note}>
                            <input aria-label={labels.note} form="gift-inline-form" value={form.note} onChange={(event) => updateForm("note", event.target.value)} placeholder={t ? t("placeholderNote") : "Add a note"} />
                        </td>
                        <td data-label={labels.actions}>
                            <form id="gift-inline-form" className="wg-inline-actions" onSubmit={submitGift}>
                                <button type="submit" className="wg-inline-save" disabled={!form.name.trim() || saving || isDuplicateGift}>
                                    <IoSaveOutline aria-hidden="true" />
                                    {saving ? (t ? t("savingText") : "Saving…") : editingId ? (t ? t("saveBtn") : "Save") : (t ? t("addItemBtn") : "Add")}
                                </button>
                                {editingId && <button type="button" className="wg-inline-cancel" onClick={resetForm}>{t ? t("cancelBtn") : "Cancel"}</button>}
                            </form>
                        </td>
                    </tr>
                    {gifts.map((gift) => {
                        const methodStyle = METHOD_STYLES[gift.method] || METHOD_STYLES["Bakong QR"];
                        const MethodIcon = methodStyle.Icon;
                        const linkedGuest = guestOptions.find((guest) => String(guest.id) === String(gift.guestId));
                        return (
                            <tr key={gift.id}>
                                <td data-label={labels.name}><span className="wg-name-text">{linkedGuest ? getGuestLabel(linkedGuest) : gift.name}</span></td>
                                <td data-label={labels.amount}><span className="wg-amount">{gift.currency === "KHR" ? `${gift.amount.toLocaleString()} ៛` : `$${gift.amount.toLocaleString()}`}</span></td>
                                <td data-label={labels.method}>
                                    <span className="wg-method-badge" style={{ background: methodStyle.bg, color: methodStyle.color }}>
                                        <MethodIcon aria-hidden="true" />{gift.method}
                                    </span>
                                </td>
                                <td data-label={labels.date} className="wg-muted"><IoCalendarClearOutline aria-hidden="true" />{formatDate(gift.date)}</td>
                                <td data-label={labels.note} className="wg-muted wg-note-cell">{gift.note || <span className="wg-dash">—</span>}</td>
                                <td data-label={labels.actions}>
                                    <div className="wg-row-actions">
                                        <button type="button" className="wg-action-btn" onClick={() => editGift(gift)} disabled={saving}>
                                            <IoCreateOutline aria-hidden="true" />{t ? t("editBtn") : "Edit"}
                                        </button>
                                        <button type="button" className="wg-action-btn wg-danger-btn" disabled={saving} onClick={() => deleteGift(gift.id)}>
                                            <IoTrashOutline aria-hidden="true" />{t ? t("deleteBtn") : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {!gifts.length && <tr><td className="wg-inline-empty" colSpan={6}>{t ? t("emptyText") : "No wedding gifts recorded yet. Add your first record above."}</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default GiftTable;
