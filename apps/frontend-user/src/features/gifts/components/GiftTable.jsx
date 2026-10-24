import {
    IoCalendarClearOutline,
    IoCardOutline,
    IoCashOutline,
    IoCreateOutline,
    IoPhonePortraitOutline,
    IoTrashOutline,
} from "react-icons/io5";
import { getGuestLabel } from "./guestLabels";
import { formatLocalDate } from "@/shared/utils/localDate";

const METHOD_STYLES = {
    "Bakong QR": { bg: "#e0f2fe", color: "#0369a1", Icon: IoPhonePortraitOutline },
    ABA: { bg: "#fef3c7", color: "#b45309", Icon: IoCardOutline },
    Cash: { bg: "#dcfce7", color: "#15803d", Icon: IoCashOutline },
    "សាច់ប្រាក់": { bg: "#dcfce7", color: "#15803d", Icon: IoCashOutline },
};

export function GiftTable({
    gifts = [],
    guestOptions = [],
    editGift,
    deleteGift,
    saving,
    t,
    lang = "en",
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
                    {gifts.map((gift) => {
                        const methodStyle = METHOD_STYLES[gift.method] || METHOD_STYLES["Bakong QR"];
                        const MethodIcon = methodStyle.Icon;
                        const linkedGuest = guestOptions.find((guest) => String(guest.id) === String(gift.guestId));
                        return (
                            <tr key={gift.id}>
                                <td data-label={labels.name}><span className="wg-name-text">{linkedGuest ? getGuestLabel(linkedGuest) : gift.name}</span><small className="gift-source-label">{lang === "en" ? "Manual record" : "??????????????"}</small></td>
                                <td data-label={labels.amount}><span className="wg-amount">{gift.currency === "KHR" ? `${gift.amount.toLocaleString()} ៛` : `$${gift.amount.toLocaleString()}`}</span></td>
                                <td data-label={labels.method}>
                                    <span className="wg-method-badge" style={{ background: methodStyle.bg, color: methodStyle.color }}>
                                        <MethodIcon aria-hidden="true" />{gift.method === "Cash" ? (lang === "en" ? "Cash" : "សាច់ប្រាក់") : gift.method || "?"}
                                    </span>
                                </td>
                                <td data-label={labels.date} className="wg-muted"><IoCalendarClearOutline aria-hidden="true" />{formatLocalDate(gift.date, lang)}</td>
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
                    {!gifts.length && <tr><td className="wg-inline-empty" colSpan={6}>{t ? t("emptyText") : "No gift records yet. Use Add Gift to record one."}</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default GiftTable;
