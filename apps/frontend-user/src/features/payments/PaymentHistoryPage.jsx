import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../enterprise/EnterprisePages.css";
import paymentService from "./paymentService";
import { StatusBadge } from "@/shared/ui";
import { packagePrice } from "../marketing/model/packagePresentation";

function money(amount, currency) {
    return packagePrice({ price: amount, currency }, "en") || "Amount unavailable";
}

function dateTime(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function PaymentHistoryPage() {
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
        return <main className="enterprise-page"><div className="enterprise-empty">Loading payments...</div></main>;
    }

    return (
        <main className="enterprise-page">
            <header className="enterprise-head">
                <div>
                    <span className="enterprise-eyebrow">Payments</span>
                    <h1>Payment history</h1>
                    <p>Review template payments, pending orders, and receipts.</p>
                </div>
            </header>

            {error && <div className="enterprise-error">{error}</div>}

            <section className="enterprise-panel">
                {payments.length ? (
                    <div className="enterprise-table-wrap">
                        <table className="enterprise-table">
                            <thead>
                                <tr><th>Order</th><th>Item</th><th>Status</th><th>Amount</th><th>Created</th><th></th></tr>
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
                                        <td>{money(payment.paidAmount || payment.amount, payment.currency)}</td>
                                        <td>{dateTime(payment.createdAt)}</td>
                                        <td><Link className="enterprise-btn secondary" to={`/dashboard/payments/${payment.orderCode}`}>Receipt</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="enterprise-empty">No payment orders yet.</div>
                )}
            </section>
        </main>
    );
}
