import { Link, useSearchParams } from "react-router-dom";
import "./PaymentPages.css";

export default function PaymentCancelPage() {
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get("orderCode") || "";

    return (
        <main className="payment-page">
            <section className="payment-hero">
                <span className="payment-eyebrow">Payment cancelled</span>
                <h1>Payment was cancelled or not completed.</h1>
                <p>No template access was unlocked.</p>
            </section>

            <section className="payment-card payment-status-panel">
                {orderCode && <p>Order {orderCode}</p>}
                <div className="payment-actions">
                    {orderCode && (
                        <Link className="payment-secondary-btn link-button" to={`/payments/${orderCode}/status`}>
                            Open Status
                        </Link>
                    )}
                    <Link className="payment-primary-btn link-button" to="/templates/browse">
                        Browse Templates
                    </Link>
                </div>
            </section>
        </main>
    );
}
