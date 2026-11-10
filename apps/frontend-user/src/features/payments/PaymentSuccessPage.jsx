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

    const getHeroHeading = () => {
        if (!orderCode) {
            return uiCopy("មិនមានលេខកូដបញ្ជាទិញ", "Missing order reference");
        }
        if (!order) {
            return uiCopy("កំពុងផ្ទៀងផ្ទាត់ការទូទាត់។ សូមរង់ចាំ...", "Payment is being verified. Please wait.");
        }
        switch (order.status) {
            case "PAID":
            case "CONFIRMED":
                return uiCopy("ការទូទាត់ជោគជ័យ — គំរូធៀបត្រូវបានបើកដំណើរការ!", "Payment confirmed & template unlocked!");
            case "PAID_PENDING_REVIEW":
                return uiCopy("បានទទួលការទូទាត់ — កំពុងត្រួតពិនិត្យ", "Payment received — pending manual review");
            case "FAILED":
                return uiCopy("ការទូទាត់មិនជោគជ័យ", "Payment was not successful");
            case "CANCELLED":
                return uiCopy("ការទូទាត់ត្រូវបានបោះបង់", "Payment cancelled");
            case "EXPIRED":
                return uiCopy("ការទូទាត់បានផុតកំណត់", "Payment session expired");
            case "REJECTED":
                return uiCopy("ការទូទាត់ត្រូវបានបដិសេធ", "Payment rejected");
            default:
                return uiCopy("កំពុងផ្ទៀងផ្ទាត់ការទូទាត់...", "Payment is being verified. Please wait.");
        }
    };

    return (
        <main className="payment-page">
            <section className="payment-hero">
                <span className="payment-eyebrow">{uiCopy("ត្រឡប់ពីការទូទាត់", "Payment return")}</span>
                <h1>{getHeroHeading()}</h1>
                <p>
                    {!orderCode
                        ? uiCopy(
                            "មិនមានលេខកូដបញ្ជាទិញភ្ជាប់មកជាមួយតំណនេះទេ។ ប្រសិនបើអ្នកបានទូទាត់រួចរាល់ សូមពិនិត្យប្រវត្តិការទូទាត់ ឬគំរូដែលបានទិញរបស់អ្នក។",
                            "No order code was provided with this payment return URL. If you completed a payment, please check your payment history or purchased templates."
                        )
                        : order
                        ? statusMessage(order.status, uiCopy("km", "en"))
                        : uiCopy("ត្រូវផ្ទៀងផ្ទាត់ការទូទាត់ពីម៉ាស៊ីនមេ មុនពេលផ្ដល់សិទ្ធិប្រើប្រាស់។", "Server verification is required before access unlocks.")}
                </p>
            </section>

            {error && <div className="payment-error" role="alert">{error}</div>}
            {order && (
                <section className="payment-card payment-status-panel">
                    <span className={`payment-status ${order.status?.toLowerCase() || "pending"}`}>
                        {uiCopy(({ PAID: "បានបង់ប្រាក់", PENDING: "រង់ចាំ", CREATED: "បានបង្កើត", FAILED: "បរាជ័យ", CANCELLED: "បានបោះបង់", EXPIRED: "ផុតកំណត់", REJECTED: "បានបដិសេធ", CONFIRMED: "បានបញ្ជាក់", PAID_PENDING_REVIEW: "រង់ចាំការត្រួតពិនិត្យ", QR_CREATED: "បានបង្កើតកូដ", CHECKOUT_CREATED: "បានបង្កើតការទូទាត់" })[order.status] || "កំពុងផ្ទៀងផ្ទាត់", order.status)}
                    </span>
                    <h2>{order.templateName}</h2>
                    <p>{order.orderCode}</p>
                    <div className="payment-actions">
                        <Link className="payment-secondary-btn link-button" to={`/payments/${order.orderCode}/status`}>
                            {uiCopy("មើលស្ថានភាព", "Open status")}
                        </Link>
                        {order.status === "PAID" && (
                            <Link className="payment-primary-btn link-button" to="/dashboard/templates/paid">
                                {uiCopy("ទៅកាន់គំរូដែលបានទិញ", "Go to paid templates")}
                            </Link>
                        )}
                    </div>
                </section>
            )}

            <div className="payment-footer-links">
                <Link to="/dashboard/templates/paid">{uiCopy("មើលគំរូដែលបានទិញ", "View paid templates")}</Link>
                <Link to="/dashboard/payments">{uiCopy("ប្រវត្តិការទូទាត់", "Payment history")}</Link>
                <Link to="/templates">{uiCopy("ស្វែងរកគំរូ", "Browse templates")}</Link>
            </div>
        </main>
    );
}
