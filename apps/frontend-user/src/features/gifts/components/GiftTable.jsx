import {
    IoCalendarClearOutline,
    IoCardOutline,
    IoCashOutline,
    IoCreateOutline,
    IoGiftOutline,
    IoPhonePortraitOutline,
    IoTrashOutline,
} from "react-icons/io5";

const METHOD_STYLES = {
    "Bakong QR": { bg: "#e0f2fe", color: "#0369a1", Icon: IoPhonePortraitOutline },
    "ABA": { bg: "#fef3c7", color: "#b45309", Icon: IoCardOutline },
    "សាច់ប្រាក់": { bg: "#dcfce7", color: "#15803d", Icon: IoCashOutline },
    "Cash": { bg: "#dcfce7", color: "#15803d", Icon: IoCashOutline },
};

function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("km-KH", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
        console.warn("Invalid date format:", e);
        return dateStr;
    }
}

export function GiftTable({ gifts = [], editGift, deleteGift, saving, t }) {
    if (gifts.length === 0) {
        return (
            <div className="wg-empty">
                <div className="wg-empty-icon"><IoGiftOutline aria-hidden="true" /></div>
                <h3>{t ? t("emptyTitle") : "No wedding gifts recorded yet"}</h3>
                <p>{t ? t("emptyText") : "Start recording monetary gifts."}</p>
            </div>
        );
    }

    return (
        <div className="wg-table-wrap">
            <table className="wg-table">
                <thead>
                    <tr>
                        <th>{t ? t("colName") : "Contributor Name"}</th>
                        <th>{t ? t("colAmount") : "Amount"}</th>
                        <th>{t ? t("colMethod") : "Payment Method"}</th>
                        <th>{t ? t("colDate") : "Date"}</th>
                        <th>{t ? t("colNote") : "Wishes / Notes"}</th>
                        <th className="wg-th-actions"></th>
                    </tr>
                </thead>
                <tbody>
                    {gifts.map((gift) => {
                        const methodStyle = METHOD_STYLES[gift.method] || METHOD_STYLES["Bakong QR"];
                        const MethodIcon = methodStyle.Icon;
                        return (
                            <tr key={gift.id}>
                                <td data-label={t ? t("colName") : "Name"}>
                                    <span className="wg-name-text">{gift.name}</span>
                                </td>
                                <td data-label={t ? t("colAmount") : "Amount"}>
                                    <span className="wg-amount">{gift.currency === "KHR" ? `${gift.amount.toLocaleString()} ៛` : `$${gift.amount.toLocaleString()}`}</span>
                                </td>
                                <td data-label={t ? t("colMethod") : "Method"}>
                                    <span className="wg-method-badge" style={{ background: methodStyle.bg, color: methodStyle.color }}>
                                        <MethodIcon aria-hidden="true" />
                                        {gift.method}
                                    </span>
                                </td>
                                <td data-label={t ? t("colDate") : "Date"} className="wg-muted">
                                    <IoCalendarClearOutline aria-hidden="true" />
                                    {formatDate(gift.date)}
                                </td>
                                <td data-label={t ? t("colNote") : "Note"} className="wg-muted wg-note-cell">
                                    {gift.note || <span className="wg-dash">—</span>}
                                </td>
                                <td data-label={t ? t("colActions") : "Actions"}>
                                    <div className="wg-row-actions">
                                        <button type="button" className="wg-action-btn" onClick={() => editGift(gift)}>
                                            <IoCreateOutline aria-hidden="true" />
                                            {t ? t("editBtn") : "Edit"}
                                        </button>
                                        <button type="button" className="wg-action-btn wg-danger-btn" disabled={saving} onClick={() => deleteGift(gift.id)}>
                                            <IoTrashOutline aria-hidden="true" />
                                            {t ? t("deleteBtn") : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default GiftTable;
