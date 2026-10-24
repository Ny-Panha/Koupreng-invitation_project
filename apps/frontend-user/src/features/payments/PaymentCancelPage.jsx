import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { Link, useSearchParams } from "react-router-dom";
import "./PaymentPages.css";

export default function PaymentCancelPage() {
  const uiCopy = useUiCopy();
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get("orderCode") || "";

    return (
        <main className="payment-page">
            <section className="payment-hero">
                <span className="payment-eyebrow">{uiCopy("បានបោះបង់ការទូទាត់", "Payment cancelled")}</span>
                <h1>{uiCopy("ការទូទាត់ត្រូវបានបោះបង់ ឬមិនទាន់បានបញ្ចប់។", "Payment was cancelled or not completed.")}</h1>
                <p>{uiCopy("មិនទាន់បានផ្ដល់សិទ្ធិប្រើគំរូទេ។", "No template access was unlocked.")}</p>
            </section>

            <section className="payment-card payment-status-panel">
                {orderCode && <p>{uiCopy("ការបញ្ជាទិញ", "Order")} {orderCode}</p>}
                <div className="payment-actions">
                    {orderCode && (
                        <Link className="payment-secondary-btn link-button" to={`/payments/${orderCode}/status`}>
                            {uiCopy("មើលស្ថានភាព", "Open status")}
                        </Link>
                    )}
                    <Link className="payment-primary-btn link-button" to="/templates/browse">
                        {uiCopy("ស្វែងរកគំរូ", "Browse templates")}
                    </Link>
                </div>
            </section>
        </main>
    );
}
