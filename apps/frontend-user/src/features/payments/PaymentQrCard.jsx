import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import {
  IoCopyOutline,
  IoCheckmarkCircle,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoOpenOutline,
  IoSparkles,
  IoArrowBackOutline,
} from "react-icons/io5";

import { paymentService } from "./paymentService";
import { isTerminalStatus } from "./paymentStatus";
import { toast } from "../../shared/ui/toast";
import { ABA_STATIC_PAY_LINK, getPaymentQrValue } from "./khqr";
import "./PaymentPages.css";

const SESSION_DURATION_SECONDS = 180; // 3 minutes session strictly

function getSessionSecondsRemaining(createdAt, expiresAt, now = Date.now()) {
  let deadline = null;
  if (createdAt) {
    const createdTime = new Date(createdAt).getTime();
    if (!Number.isNaN(createdTime)) {
      deadline = createdTime + SESSION_DURATION_SECONDS * 1000;
    }
  }
  if (expiresAt) {
    const expTime = new Date(expiresAt).getTime();
    if (!Number.isNaN(expTime)) {
      deadline = deadline ? Math.min(deadline, expTime) : expTime;
    }
  }
  if (!deadline) {
    deadline = now + SESSION_DURATION_SECONDS * 1000;
  }
  return Math.max(0, Math.floor((deadline - now) / 1000));
}

function formatRemaining(seconds) {
  if (seconds == null) {
    return "";
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export default function PaymentQrCard({ order, onStatusChange, onRetry }) {
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  const status = order?.status || "PENDING";
  const waitingForPayment = !isTerminalStatus(status);
  const orderCode = order?.orderCode || "";
  const qrValue = useMemo(() => {
    return getPaymentQrValue(order);
  }, [order]);

  const copyOrderCode = () => {
    if (!orderCode) return;
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    toast(`បាន Copy Order Code: ${orderCode}`);
    setTimeout(() => setCopied(false), 2500);
  };

  const checkStatus = useCallback(
    async ({ quiet = false } = {}) => {
      if (!orderCode) {
        return;
      }
      setChecking(true);
      try {
        const latest = await paymentService.getTemplateOrder(orderCode);
        onStatusChange?.(latest);
        if (!quiet && latest.status === "PAID") {
          toast("ការទូទាត់ជោគជ័យ! Template ត្រូវបាន Unlock រួចរាល់។");
        }
      } catch (err) {
        if (!quiet) {
          toast(err.message || "Could not check payment status");
        }
      } finally {
        setChecking(false);
      }
    },
    [onStatusChange, orderCode]
  );

  const handleClaim = async () => {
    if (!orderCode || isExpired) return;
    setClaiming(true);
    try {
      await paymentService.claimPayment(orderCode);
      const latest = await paymentService.getTemplateOrder(orderCode);
      onStatusChange?.(latest);
      toast("🎉 ការទូទាត់ជោគជ័យ! Template ត្រូវបាន Unlock ភ្លាមៗ។");
    } catch (err) {
      toast(err.message || "មិនអាចផ្ទៀងផ្ទាត់ការទូទាត់បានទេ សូមព្យាយាមម្តងទៀត");
    } finally {
      setClaiming(false);
    }
  };

  const remaining = useMemo(
    () => getSessionSecondsRemaining(order?.createdAt, order?.expiresAt, now),
    [order?.createdAt, order?.expiresAt, now]
  );

  const isExpired = status === "EXPIRED" || (waitingForPayment && remaining !== null && remaining <= 0);

  useEffect(() => {
    if (isTerminalStatus(status) || isExpired) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status, isExpired]);

  useEffect(() => {
    if (!waitingForPayment || isExpired || !orderCode) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      checkStatus({ quiet: true });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [checkStatus, orderCode, waitingForPayment, isExpired]);

  const countdownText = useMemo(() => {
    if (status === "PAID") return "";
    if (isExpired) {
      return "00:00 • ផុតកំណត់ (Session Expired)";
    }
    if (remaining == null) {
      return "";
    }
    return formatRemaining(remaining);
  }, [status, isExpired, remaining]);

  return (
    <section className="checkout-card payment-qr-card-lux">
      {/* Top Order Summary Bar */}
      <div className="payment-summary-lux">
        <div>
          <span className="checkout-template-cat">
            {order?.packageName || "Premium"} Plan • {order?.currency || "USD"} {order?.amount || "0.01"}
          </span>
          <h2 className="payment-title-lux">
            {order?.templateName || "Garden Royal Khmer Wedding"}
          </h2>
        </div>

        <span className={`payment-status-badge ${isExpired ? "expired" : status.toLowerCase()}`}>
          {status === "PAID"
            ? "✓ ទូទាត់ជោគជ័យ (PAID)"
            : isExpired
            ? "⚠️ ផុតកំណត់ (EXPIRED)"
            : "⏳ រង់ចាំការទូទាត់ (PENDING)"}
        </span>
      </div>

      {/* QR & Details Layout */}
      <div className="payment-qr-grid-lux">
        {/* Left: Pure Clean Vector QR Code */}
        <div className="payment-qr-box-lux">
          {/* KHQR Card Top Header */}
          <div className="payment-khqr-header">
            <div className="payment-khqr-tag">ABA PAY</div>
            <div className="payment-khqr-sub">SCAN TO PAY • ABA MOBILE</div>
          </div>

          {/* Clean High-Contrast Vector QR */}
          <div className={`payment-qr-canvas-wrap ${isExpired ? "is-expired" : ""}`}>
            <QRCode
              value={qrValue}
              size={220}
              level="M"
              className="payment-qr-code-svg"
              style={{ height: "auto", maxWidth: "100%", width: "100%", display: "block" }}
            />

            {/* Expired Overlay */}
            {isExpired && (
              <div className="payment-qr-expired-overlay">
                <span className="payment-qr-expired-badge">⚠️ Session Expired</span>
                <p className="payment-qr-expired-text">QR Code បានផុតកំណត់ ៣ នាទី</p>
                <p className="payment-qr-expired-sub">មិនអាចស្កេនទូទាត់បានទៀតទេ</p>
                {onRetry && (
                  <button
                    type="button"
                    className="payment-qr-renew-btn"
                    onClick={onRetry}
                  >
                    <IoRefreshOutline /> បង្កើត QR ថ្មី (New QR)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payee Info */}
          <div className="payment-khqr-footer">
            <strong>PANHA NY</strong>
            {isExpired ? (
              <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.8rem" }}>Expired</span>
            ) : (
              <span>{order?.currency || "USD"} {Number(order?.amount || 0.01).toFixed(2)}</span>
            )}
          </div>

          <span className="payment-qr-brand-label">
            <IoShieldCheckmarkOutline /> ស្កេនតាម Camera ឬ App ABA Mobile
          </span>
        </div>

        {/* Right: Order Code & Instructions */}
        <div className="payment-qr-info-lux">
          {/* Order Code Card */}
          <div className="payment-code-box-lux">
            <div className="payment-code-header">
              <span>លេខកូដសម្គាល់ការទិញ (Order Code)</span>
              <button
                type="button"
                className="payment-copy-btn"
                onClick={copyOrderCode}
                title="Copy Order Code"
              >
                {copied ? <IoCheckmarkCircle style={{ color: "#0f766e" }} /> : <IoCopyOutline />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <code className="payment-code-number">{orderCode}</code>
            <small className="payment-trx-id">
              Transaction ID: {order?.transactionId || "—"}
            </small>
          </div>

          {/* Countdown timer */}
          {countdownText && status !== "PAID" && (
            <div className={`payment-countdown-lux ${isExpired ? "expired" : remaining <= 30 ? "warning" : ""}`}>
              <span>⏱️ រយៈពេល Session (Expires In):</span>
              <strong>{countdownText}</strong>
            </div>
          )}

          {/* Instructions text */}
          <div className="payment-instructions-lux">
            <p>
              👉 <strong>របៀបស្កេនទូទាត់៖</strong> បើកកម្មវិធី <strong>ABA Mobile</strong> (ឬ Bakong / ធនាគារណាក៏បាន) រួច Scan QR Code ខាងឆ្វេង។
            </p>
            <p className="payment-muted-lux">
              ផ្ញើទៅកាន់ <strong>PANHA NY</strong> ចំនួនទឹកប្រាក់ <strong>{order?.currency || "USD"} {Number(order?.amount || 0.01).toFixed(2)}</strong> (គណនី USD: <code>007 830 386</code> / KHR: <code>009 858 816</code>)។
            </p>
            <p style={{ marginTop: "6px", color: "#059669", fontWeight: 600 }}>
              ⚡ <strong>បន្ទាប់ពីផ្ទេររួច៖</strong> សូមចុចប៊ូតុង <strong>« ខ្ញុំបានផ្ទេរប្រាក់រួចរាល់ (Unlock Now) »</strong> ខាងក្រោមដើម្បី Unlock គំរូធៀបការភ្លាមៗដោយមិនបាច់រង់ចាំ!
            </p>
          </div>

          {/* Success Status Panel */}
          {status === "PAID" && (
            <div className="payment-confirmed-lux">
              <div className="payment-confirmed-icon">
                <IoCheckmarkCircle />
              </div>
              <div>
                <strong>ការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់ជោគជ័យ!</strong>
                <p>គំរូធៀបការរបស់អ្នកត្រូវបាន Unlock រួចរាល់ហើយ។ អ្នកអាចចាប់ផ្តើមបង្កើតធៀបការបានឥឡូវនេះ។</p>
              </div>
              <Link
                to="/templates/browse"
                className="checkout-pay-btn"
                style={{ marginTop: "12px", width: "100%" }}
              >
                <IoSparkles /> ចាប់ផ្តើមបង្កើតធៀបការ (Use Template)
              </Link>
            </div>
          )}

          {/* Expired / Failed Panel */}
          {isExpired && (
            <div className="payment-alert-panel expired">
              <strong>⚠️ Session និង QR Code នេះបានផុតកំណត់ហើយ</strong>
              <p>ប្រព័ន្ធបានបិទការទូទាត់សម្រាប់ Session នេះ។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើត QR ថ្មី។</p>
              {onRetry && (
                <button
                  type="button"
                  className="payment-primary-btn"
                  onClick={onRetry}
                  style={{ marginTop: "10px" }}
                >
                  <IoRefreshOutline /> បង្កើត QR ថ្មី (Regenerate QR)
                </button>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="payment-actions-lux">
            {status !== "PAID" && !isExpired && (
              <button
                type="button"
                className="payment-action-gold-btn payment-claim-btn"
                disabled={claiming}
                onClick={handleClaim}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  border: "none",
                  cursor: claiming ? "not-allowed" : "pointer",
                }}
              >
                <IoSparkles />
                <span>{claiming ? "កំពុង Unlock Template..." : "⚡ ខ្ញុំបានផ្ទេរប្រាក់រួចរាល់ (Unlock Now)"}</span>
              </button>
            )}

            {status !== "PAID" && !isExpired && (
              <a
                className="payment-action-secondary-btn"
                href={order?.checkoutUrl || ABA_STATIC_PAY_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IoOpenOutline /> បើកកម្មវិធី ABA Mobile (Open in App)
              </a>
            )}

            {isExpired && onRetry && (
              <button
                type="button"
                className="payment-action-gold-btn"
                onClick={onRetry}
                style={{ background: "#f59e0b", color: "#000" }}
              >
                <IoRefreshOutline /> បង្កើត QR ថ្មី (Regenerate QR)
              </button>
            )}

            <button
              type="button"
              className="payment-action-secondary-btn"
              disabled={checking || isExpired}
              onClick={() => checkStatus()}
            >
              <IoRefreshOutline className={checking ? "checkout-spinner" : ""} />
              <span>{checking ? "កំពុងពិនិត្យ..." : "Check Status"}</span>
            </button>

            <Link
              to="/templates/browse"
              className="payment-action-secondary-btn"
            >
              <IoArrowBackOutline />
              <span>ជ្រើសរើសគំរូផ្សេង</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
