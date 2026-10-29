import { PageSkeleton } from '@/shared/ui/LoadingState';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../enterprise/EnterprisePages.css";
import paymentService from "./paymentService";
import { packagePrice } from "../marketing/model/packagePresentation";

function money(amount, currency, lang) {
    return packagePrice({ price: amount, currency }, lang) || (lang === "en" ? "Amount unavailable" : "មិនមានចំនួនទឹកប្រាក់");
}

function dateTime(value, lang) {
    if (!value) return "—";
    return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function PaymentReceiptPage() {
  const uiCopy = useUiCopy();
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
        return <main className="enterprise-page"><PageSkeleton layout="form" /></main>;
    }

    return (
        <main className="enterprise-page">
            <header className="enterprise-head">
                <div>
                    <span className="enterprise-eyebrow">{uiCopy("បង្កាន់ដៃ", "Receipt")}</span>
                    <h1>{receipt?.receiptNumber || uiCopy("បង្កាន់ដៃទូទាត់", "Payment receipt")}</h1>
                    <p>{uiCopy("បង្កាន់ដៃសម្រាប់ការបញ្ជាទិញដែលបានផ្ទៀងផ្ទាត់ការទូទាត់។", "Receipt generated from the verified payment order.")}</p>
                </div>
                <Link className="enterprise-btn secondary" to="/dashboard/payments">{uiCopy("ប្រវត្តិការទូទាត់", "Payment history")}</Link>
            </header>

            {error && <div className="enterprise-error" role="alert">{error}</div>}

            {receipt && (
                <section className="enterprise-panel receipt-box">
                    <h2>{receipt.itemName}</h2>
                    <p className="enterprise-muted">{receipt.packageName}</p>
                    <div className="receipt-lines">
                        <div><span>{uiCopy("លេខកូដបញ្ជាទិញ", "Order code")}</span><strong>{receipt.orderCode}</strong></div>
                        <div><span>{uiCopy("ស្ថានភាព", "Status")}</span><strong>{uiCopy("បានបង់ប្រាក់", "Paid")}</strong></div>
                        <div><span>{uiCopy("អតិថិជន", "Customer")}</span><strong>{receipt.customerName || receipt.customerEmail || "—"}</strong></div>
                        <div><span>{uiCopy("ចំនួនទឹកប្រាក់", "Amount")}</span><strong>{money(receipt.paidAmount ?? receipt.amount, receipt.currency, uiCopy("km", "en"))}</strong></div>
                        <div><span>{uiCopy("អ្នកផ្ដល់សេវា", "Provider")}</span><strong>{receipt.provider || "—"}</strong></div>
                        <div><span>{uiCopy("បានទូទាត់នៅ", "Paid at")}</span><strong>{dateTime(receipt.paidAt, uiCopy("km", "en"))}</strong></div>
                        <div><span>{uiCopy("បានចេញនៅ", "Issued at")}</span><strong>{dateTime(receipt.issuedAt, uiCopy("km", "en"))}</strong></div>
                    </div>
                </section>
            )}
        </main>
    );
}
