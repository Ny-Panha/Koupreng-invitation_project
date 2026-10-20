import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../enterprise/EnterprisePages.css";
import paymentService from "./paymentService";
import { packagePrice } from "../marketing/model/packagePresentation";

function money(amount, currency) {
    return packagePrice({ price: amount, currency }, "en") || "Amount unavailable";
}

function dateTime(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function PaymentReceiptPage() {
    const { orderCode } = useParams();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        paymentService.paymentReceipt(orderCode)
            .then((data) => {
                if (!data || Array.isArray(data) || data.orderCode !== orderCode || data.status !== "PAID") throw new Error("A receipt is available after payment has been verified.");
                if (active) setReceipt(data);
            })
            .catch((err) => {
                if (active) setError(err.message || "Could not load receipt");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [orderCode]);

    if (loading) {
        return <main className="enterprise-page"><div className="enterprise-empty">Loading receipt...</div></main>;
    }

    return (
        <main className="enterprise-page">
            <header className="enterprise-head">
                <div>
                    <span className="enterprise-eyebrow">Receipt</span>
                    <h1>{receipt?.receiptNumber || "Payment receipt"}</h1>
                    <p>Receipt generated from the verified payment order.</p>
                </div>
                <Link className="enterprise-btn secondary" to="/dashboard/payments">Payment history</Link>
            </header>

            {error && <div className="enterprise-error" role="alert">{error}</div>}

            {receipt && (
                <section className="enterprise-panel receipt-box">
                    <h2>{receipt.itemName}</h2>
                    <p className="enterprise-muted">{receipt.packageName}</p>
                    <div className="receipt-lines">
                        <div><span>Order code</span><strong>{receipt.orderCode}</strong></div>
                        <div><span>Status</span><strong>{receipt.status}</strong></div>
                        <div><span>Customer</span><strong>{receipt.customerName || receipt.customerEmail || "—"}</strong></div>
                        <div><span>Amount</span><strong>{money(receipt.paidAmount ?? receipt.amount, receipt.currency)}</strong></div>
                        <div><span>Provider</span><strong>{receipt.provider || "—"}</strong></div>
                        <div><span>Paid at</span><strong>{dateTime(receipt.paidAt)}</strong></div>
                        <div><span>Issued at</span><strong>{dateTime(receipt.issuedAt)}</strong></div>
                    </div>
                </section>
            )}
        </main>
    );
}
