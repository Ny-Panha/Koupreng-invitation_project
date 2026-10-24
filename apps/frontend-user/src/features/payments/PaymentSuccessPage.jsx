import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { paymentService } from "./paymentService";
import { isTerminalStatus, statusMessage } from "./paymentStatus";
import "./PaymentPages.css";

export default function PaymentSuccessPage() {
  const uiCopy = useUiCopy();
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get("orderCode") || "";
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!orderCode) {
            return undefined;
        }

        let active = true;
        let timer;

        const loadStatus = () => {
            paymentService.getTemplateOrder(orderCode)
                .then((data) => {
                    if (!active) {
                        return;
                    }
                    setOrder(data);
                    setError("");
                    if (isTerminalStatus(data.status) && timer) {
                        window.clearInterval(timer);
                    }
                })
                .catch((err) => {
                    if (active) {
                        setError(err.message || "Could not load payment status");
                    }
                });
        };

        loadStatus();
        timer = window.setInterval(loadStatus, 5000);

        return () => {
            active = false;
            if (timer) {
                window.clearInterval(timer);
            }
        };
    }, [orderCode]);

    return (
        <main className="payment-page">
            <section className="payment-hero">
                <span className="payment-eyebrow">{uiCopy("ត្រឡប់ពីការទូទាត់", "Payment return")}</span>
                <h1>{uiCopy("កំពុងផ្ទៀងផ្ទាត់ការទូទាត់។ សូមរង់ចាំ។", "Payment is being verified. Please wait.")}</h1>
                <p>{order ? statusMessage(order.status, uiCopy("km", "en")) : uiCopy("ត្រូវផ្ទៀងផ្ទាត់ការទូទាត់ពីម៉ាស៊ីនមេ មុនពេលផ្ដល់សិទ្ធិប្រើប្រាស់។", "Server verification is required before access unlocks.")}</p>
            </section>

            {error && <div className="payment-error">{error}</div>}
            {order && (
                <section className="payment-card payment-status-panel">
                    <span className={`payment-status ${order.status?.toLowerCase() || "pending"}`}>
                        {uiCopy(({ PAID: "បានបង់ប្រាក់", PENDING: "រង់ចាំ", CREATED: "បានបង្កើត", FAILED: "បរាជ័យ", CANCELLED: "បានបោះបង់", EXPIRED: "ផុតកំណត់", REJECTED: "បានបដិសេធ", CONFIRMED: "បានបញ្ជាក់", PAID_PENDING_REVIEW: "រង់ចាំការត្រួតពិនិត្យ", QR_CREATED: "បានបង្កើតកូដ", CHECKOUT_CREATED: "បានបង្កើតការទូទាត់" })[order.status] || "កំពុងផ្ទៀងផ្ទាត់", order.status)}
                    </span>
                    <h2>{order.templateName}</h2>
                    <p>{order.orderCode}</p>
                    <Link className="payment-secondary-btn link-button" to={`/payments/${order.orderCode}/status`}>
                        {uiCopy("មើលស្ថានភាព", "Open status")}
                    </Link>
                </section>
            )}

            <div className="payment-footer-links">
                <Link to="/dashboard/templates/paid">{uiCopy("មើលគំរូដែលបានទិញ", "View paid templates")}</Link>
                <Link to="/templates">{uiCopy("ស្វែងរកគំរូ", "Browse templates")}</Link>
            </div>
        </main>
    );
}
