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
import { isTerminalStatus, statusMessage } from "./paymentStatus";
import { toast } from "../../shared/ui/toast";
import { getPaymentQrValue } from "./khqr";
import { packagePrice } from "../marketing/model/packagePresentation";
import { useLanguageStore } from "@/stores/useLanguageStore";
import "./PaymentPages.css";

function getSessionSecondsRemaining(expiresAt, now = Date.now()) {
  const deadline = expiresAt ? new Date(expiresAt).getTime() : null;
  if (deadline === null || !Number.isFinite(deadline)) return null;
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
  const lang = useLanguageStore((state) => state.lang);
  const isKm = lang !== "en";
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState("");

  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  const status = order?.status || "PENDING";
  const waitingForPayment = !isTerminalStatus(status);
  const orderCode = order?.orderCode || "";
  const amountLabel = packagePrice({ price: order?.amount, currency: order?.currency }, "en") || "Amount unavailable";
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
    if (!orderCode || !waitingForPayment || isExpired) return;
    setClaiming(true);
    try {
      await paymentService.claimPayment(orderCode);
      // PAY-001: a customer claim requests reconciliation; only server PAID grants access.
      const pendingMessage = "បានផ្ញើសំណើពិនិត្យការទូទាត់។ Awaiting trusted payment confirmation.";
      setClaimFeedback(pendingMessage);
      const latest = await paymentService.getTemplateOrder(orderCode);
      onStatusChange?.(latest);
      if (latest.status === "PAID") {
        setClaimFeedback("");
        toast("ការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់។ Template ត្រូវបាន Unlock រួចរាល់។");
      } else {
        toast(pendingMessage);
      }
    } catch (err) {
      toast(err.message || "មិនអាចផ្ទៀងផ្ទាត់ការទូទាត់បានទេ សូមព្យាយាមម្តងទៀត");
    } finally {
      setClaiming(false);
    }
  };

  const remaining = useMemo(
    () => getSessionSecondsRemaining(order?.expiresAt, now),
    [order?.expiresAt, now]
  );

  const isExpired = status === "EXPIRED" || (waitingForPayment && remaining !== null && remaining <= 0);

  useEffect(() => {
    setClaimFeedback("");
  }, [orderCode]);

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
            {[order?.packageName, amountLabel].filter(Boolean).join(" · ")}
          </span>
          <h2 className="payment-title-lux">
            {order?.templateName || "Template payment"}
          </h2>
        </div>

        <span className={`payment-status-badge ${isExpired ? "expired" : status.toLowerCase()}`}>
          {status === "PAID"
            ? "✓ ទូទាត់ជោគជ័យ (PAID)"
            : isExpired
            ? "⚠️ ផុតកំណត់ (EXPIRED)"
            : isTerminalStatus(status)
            ? statusMessage(status)
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
          <div className="payment-khqr-sub">OPEN FIXED PAYWAY LINK</div>
          </div>

          {/* Clean High-Contrast Vector QR */}
          <div className={`payment-qr-canvas-wrap ${isExpired ? "is-expired" : ""}`}>
            {qrValue ? <QRCode
              value={qrValue}
              size={220}
              level="M"
              className="payment-qr-code-svg"
              style={{ height: "auto", maxWidth: "100%", width: "100%", display: "block" }}
            /> : <p role="alert">Payment link unavailable. Please retry.</p>}

            {/* Expired Overlay */}
            {isExpired && (
              <div className="payment-qr-expired-overlay">
                <span className="payment-qr-expired-badge">⚠️ Session Expired</span>
                <p className="payment-qr-expired-text">Order session expired</p>
                <p className="payment-qr-expired-sub">The bank link may remain usable. Contact support for late payments.</p>
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
            <strong>ABA PayWay</strong>
            {isExpired ? (
              <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.8rem" }}>Expired</span>
            ) : (
              <span>{amountLabel}</span>
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
              Internal checkout ID: {order?.transactionId || "—"}
            </small>
          </div>

          {/* Countdown timer */}
          {countdownText && status !== "PAID" && (
            <div className={`payment-countdown-lux ${isExpired ? "expired" : remaining <= 30 ? "warning" : ""}`}>
              <span>⏱️ រយៈពេល Session (Expires In):</span>
              <strong>{countdownText}</strong>
            </div>
          )}

          {/* Instructions text (ISSUE-P1-05) */}
          <div className="payment-instructions-lux">
            <h4 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 700, color: "var(--kp-ink, #1f2421)" }}>
              {isKm ? "👉 ជំហានទូទាត់ងាយៗ ៤ ជំហាន (Payment steps)៖" : "👉 4 Simple payment steps:"}
            </h4>
            <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", lineHeight: "1.6" }}>
              <li>
                <strong>{isKm ? "បើកកម្មវិធីធនាគារចល័ត" : "Open your banking app"}</strong> — {isKm ? "ABA Mobile, Bakong, Wing, ACLEDA ឬកម្មវិធីធនាគារដែលគាំទ្រ KHQR" : "ABA Mobile, Bakong, Wing, ACLEDA, or any KHQR-supported banking app."}
              </li>
              <li>
                <strong>{isKm ? "ស្កេន QR កូដខាងលើ" : "Scan the KHQR code above"}</strong> — {isKm ? "ពិនិត្យចំនួនទឹកប្រាក់ទូទាត់៖ " : "Expected amount: "}<strong>{amountLabel}</strong>
              </li>
              <li>
                <strong>{isKm ? "បញ្ជាក់ការផ្ទេរប្រាក់" : "Confirm the transfer"}</strong> — {isKm ? `បញ្ចូល Order Code (${order.orderCode}) ក្នុង Remark ប្រសិនបើធនាគារអនុញ្ញាត` : `Include order code (${order.orderCode}) in remark if bank supports it.`}
              </li>
              <li>
                <strong>{isKm ? "ចុចប៊ូតុង 'ខ្ញុំបានទូទាត់រួចរាល់'" : "Tap 'I have paid' below"}</strong> — {isKm ? "ប្រព័ន្ធនឹងផ្ទៀងផ្ទាត់ដោយស្វ័យប្រវត្តិជាមួយទិន្នន័យធនាគារ និងបើកសិទ្ធិប្រើប្រាស់ភ្លាមៗ។" : "System reconciles with official bank alerts to activate access."}
              </li>
            </ol>
            <p style={{ marginTop: "12px", color: "var(--kp-teal, #0f766e)", fontWeight: 600, fontSize: "13px" }}>
              <strong>{isKm ? "ចំណាំ៖" : "Note:"}</strong> {isKm ? "សិទ្ធិប្រើគំរូនឹងបើកក្រោយការផ្ទៀងផ្ទាត់ពីប្រព័ន្ធ ឬអ្នកគ្រប់គ្រង។ (Access follows verified payment confirmation.)" : "Access follows verified payment confirmation from official bank alerts."}
            </p>
          </div>

          {/* Success Status Panel */}
          {claimFeedback && status !== "PAID" && (
            <p className="payment-muted-lux" role="status">{claimFeedback}</p>
          )}
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
              <strong>⚠️ Order session expired</strong>
              <p>Start a new order before paying. Late payment evidence requires manual review; bank link expiry is controlled by ABA.</p>
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

          {isTerminalStatus(status) && status !== "PAID" && !isExpired && (
            <div className="payment-alert-panel" role="status">
              <strong>{statusMessage(status)}</strong>
              {onRetry && (
                <button type="button" className="payment-primary-btn" onClick={onRetry}>
                  <IoRefreshOutline /> បង្កើតការបញ្ជាទិញថ្មី (New order)
                </button>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="payment-actions-lux">
            {waitingForPayment && !isExpired && (
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
                <span>{claiming ? "កំពុងផ្ញើសំណើ..." : "ផ្ទៀងផ្ទាត់ការទូទាត់ — ស្នើពិនិត្យ (Request payment review)"}</span>
              </button>
            )}

            {waitingForPayment && !isExpired && qrValue && (
              <a
                className="payment-action-secondary-btn"
                href={qrValue}
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
