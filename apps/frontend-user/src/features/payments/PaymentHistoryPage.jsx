import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../enterprise/EnterprisePages.css";
import paymentService from "./paymentService";
import { StatusBadge } from "@/shared/ui";
import { packagePrice } from "../marketing/model/packagePresentation";

function money(amount, currency, lang) {
    return packagePrice({ price: amount, currency }, lang) || (lang === "en" ? "Amount unavailable" : "មិនមានចំនួនទឹកប្រាក់");
}

function dateTime(value, lang) {
    if (!value) return "—";
    return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function PaymentHistoryPage() {
  const uiCopy = useUiCopy();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setPayments(await paymentService.paymentHistory());
        } catch (err) {
            setError(err.message || "Could not load payments");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return <main className="enterprise-page"><div className="enterprise-empty">{uiCopy("កំពុងផ្ទុកការទូទាត់...", "Loading payments...")}</div></main>;
    }

    return (
        <main className="enterprise-page">
            <header className="enterprise-head">
                <div>
                    <span className="enterprise-eyebrow">{uiCopy("ការទូទាត់", "Payments")}</span>
                    <h1>{uiCopy("ប្រវត្តិការទូទាត់", "Payment history")}</h1>
                    <p>{uiCopy("ពិនិត្យការទូទាត់គំរូ ការបញ្ជាទិញកំពុងរង់ចាំ និងបង្កាន់ដៃ។", "Review template payments, pending orders, and receipts.")}</p>
                </div>
            </header>

            {error && <div className="enterprise-error">{error}</div>}

            <section className="enterprise-panel">
                {payments.length ? (
                    <div className="enterprise-table-wrap">
                        <table className="enterprise-table">
                            <thead>
                                <tr><th>{uiCopy("ការបញ្ជាទិញ", "Order")}</th><th>{uiCopy("មុខទំនិញ", "Item")}</th><th>{uiCopy("ស្ថានភាព", "Status")}</th><th>{uiCopy("ចំនួនទឹកប្រាក់", "Amount")}</th><th>{uiCopy("បានបង្កើត", "Created")}</th><th></th></tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.orderCode}>
                                        <td>{payment.orderCode}</td>
                                        <td>
                                            <strong>{payment.templateName || payment.packageName || "Payment"}</strong>
                                            <div className="enterprise-muted">{payment.itemType || payment.packageName}</div>
                                        </td>
                                        <td><StatusBadge status={payment.status} /></td>
                                        <td>{money(payment.paidAmount || payment.amount, payment.currency, uiCopy("km", "en"))}</td>
                                        <td>{dateTime(payment.createdAt, uiCopy("km", "en"))}</td>
                                        <td><Link className="enterprise-btn secondary" to={`/dashboard/payments/${payment.orderCode}`}>{uiCopy("បង្កាន់ដៃ", "Receipt")}</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="enterprise-empty">{uiCopy("មិនទាន់មានការបញ្ជាទិញទេ។", "No payment orders yet.")}</div>
                )}
            </section>
        </main>
    );
}
