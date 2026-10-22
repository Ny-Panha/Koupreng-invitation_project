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
import { templateUsePath } from '../templates/model/templateIdentity';
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
  const copy = (kh, english) => isKm ? kh : english;
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState(false);

  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  const status = order?.status || "PENDING";
  const waitingForPayment = !isTerminalStatus(status);
  const orderCode = order?.orderCode || "";
  const amountLabel = packagePrice({ price: order?.amount, currency: order?.currency }, lang) || copy("មិនមានចំនួនទឹកប្រាក់", "Amount unavailable");
  const qrValue = useMemo(() => {
    return getPaymentQrValue(order);
  }, [order]);

  const copyOrderCode = async () => {
    if (!orderCode) return;
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      toast(copy("បានចម្លងលេខកូដការបញ្ជាទិញ។", "Order code copied."));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast(copy("មិនអាចចម្លងបានទេ។ សូមជ្រើសរើសលេខកូដ ហើយចម្លងដោយខ្លួនឯង។", "Could not copy. Select the order code and copy it manually."));
    }
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
          toast(isKm ? "បានផ្ទៀងផ្ទាត់ការទូទាត់។ អាចប្រើគំរូបានហើយ។" : "Payment verified. Your template is available.");
        }
      } catch (err) {
        if (!quiet) {
          toast(err.message || (isKm ? "មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានទេ។" : "Could not check payment status"));
        }
      } finally {
        setChecking(false);
      }
    },
    [onStatusChange, orderCode, isKm]
  );

  const handleClaim = async () => {
    if (!orderCode || !waitingForPayment || isExpired) return;
    setClaiming(true);
    try {
      await paymentService.claimPayment(orderCode);
      // PAY-001: a customer claim requests reconciliation; only server PAID grants access.
      const pendingMessage = copy("បានផ្ញើសំណើពិនិត្យការទូទាត់។ កំពុងរង់ចាំការផ្ទៀងផ្ទាត់។", "Review requested. Awaiting trusted payment confirmation.");
      setClaimFeedback(true);
      const latest = await paymentService.getTemplateOrder(orderCode);
      onStatusChange?.(latest);
      if (latest.status === "PAID") {
        setClaimFeedback(false);
        toast(copy("បានផ្ទៀងផ្ទាត់ការទូទាត់។ អាចប្រើគំរូបានហើយ។", "Payment verified. Your template is available."));
      } else {
        toast(pendingMessage);
      }
    } catch (err) {
      toast(err.message || copy("មិនអាចផ្ញើសំណើពិនិត្យបានទេ។ សូមសាកម្ដងទៀត។", "Could not request payment review. Please try again."));
    } finally {
      setClaiming(false);
    }
  };

  const remaining = getSessionSecondsRemaining(order?.expiresAt, now);

  const isExpired = status === "EXPIRED" || (waitingForPayment && remaining !== null && remaining <= 0);

  useEffect(() => {
    setClaimFeedback(false);
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
      return isKm ? "00:00 • ផុតកំណត់" : "00:00 • Expired";
    }
    if (remaining == null) {
      return "";
    }
    return formatRemaining(remaining);
  }, [status, isExpired, remaining, isKm]);

  return (
    <section className="checkout-card payment-qr-card-lux">
      {/* Top Order Summary Bar */}
      <div className="payment-summary-lux">
        <div>
          <span className="checkout-template-cat">
            {[order?.packageName, amountLabel].filter(Boolean).join(" · ")}
          </span>
          <h2 className="payment-title-lux">
            {order?.templateName || copy("ការទូទាត់គំរូ", "Template payment")}
          </h2>
        </div>

        <span className={`payment-status-badge ${isExpired ? "expired" : status.toLowerCase()}`}>
          {status === "PAID"
            ? copy("បានផ្ទៀងផ្ទាត់ការទូទាត់", "Payment verified")
            : isExpired
            ? copy("ការបញ្ជាទិញផុតកំណត់", "Order expired")
            : isTerminalStatus(status)
            ? statusMessage(status, lang)
            : copy("រង់ចាំការផ្ទៀងផ្ទាត់", "Awaiting verification")}
        </span>
      </div>

      {/* QR & Details Layout */}
      <div className="payment-qr-grid-lux">
        {/* Left: Pure Clean Vector QR Code */}
        <div className="payment-qr-box-lux">
          {/* KHQR Card Top Header */}
          <div className="payment-khqr-header">
            <div className="payment-khqr-tag">ABA PAY</div>
          <div className="payment-khqr-sub">{copy("តំណទូទាត់ PayWay", "PayWay payment link")}</div>
          </div>

          {/* Clean High-Contrast Vector QR */}
          <div className={`payment-qr-canvas-wrap ${isExpired ? "is-expired" : ""}`}>
            {qrValue ? <QRCode
              value={qrValue}
              size={220}
              level="M"
              className="payment-qr-code-svg"
              style={{ height: "auto", maxWidth: "100%", width: "100%", display: "block" }}
            /> : <p role="alert">{copy("មិនមានតំណទូទាត់ទេ។ សូមសាកម្ដងទៀត។", "Payment link unavailable. Please retry.")}</p>}

            {/* Expired Overlay */}
            {isExpired && (
              <div className="payment-qr-expired-overlay">
                <span className="payment-qr-expired-badge">{copy("ការបញ្ជាទិញផុតកំណត់", "Order expired")}</span>
                <p className="payment-qr-expired-text">{copy("រយៈពេលនៃការបញ្ជាទិញផុតកំណត់ហើយ", "Order session expired")}</p>
                <p className="payment-qr-expired-sub">{copy("តំណធនាគារអាចនៅតែប្រើបាន។ សូមទាក់ទងក្រុមការងារសម្រាប់ការទូទាត់យឺត។", "The bank link may remain usable. Contact support for late payments.")}</p>
                {onRetry && (
                  <button
                    type="button"
                    className="payment-qr-renew-btn"
                    onClick={onRetry}
                  >
                    <IoRefreshOutline /> {copy("បង្កើតការបញ្ជាទិញថ្មី", "Create new order")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payee Info */}
          <div className="payment-khqr-footer">
            <strong>ABA PayWay</strong>
            {isExpired ? (
              <span style={{ color: "var(--ui-danger)", fontWeight: 700, fontSize: "0.8rem" }}>{copy("ផុតកំណត់", "Expired")}</span>
            ) : (
              <span>{amountLabel}</span>
            )}
          </div>

          <span className="payment-qr-brand-label">
            <IoShieldCheckmarkOutline /> {copy("ស្កេនដើម្បីបើកតំណ PayWay", "Scan to open the PayWay link")}
          </span>
        </div>

        {/* Right: Order Code & Instructions */}
        <div className="payment-qr-info-lux">
          {/* Order Code Card */}
          <div className="payment-code-box-lux">
            <div className="payment-code-header">
              <span>{copy("លេខកូដសម្គាល់ការទិញ", "Order code")}</span>
              <button
                type="button"
                className="payment-copy-btn"
                onClick={copyOrderCode}
                title={copy("ចម្លងលេខកូដការបញ្ជាទិញ", "Copy order code")}
              >
                {copied ? <IoCheckmarkCircle style={{ color: "#0f766e" }} /> : <IoCopyOutline />}
                <span>{copied ? copy("បានចម្លង", "Copied") : copy("ចម្លង", "Copy")}</span>
              </button>
            </div>
            <code className="payment-code-number">{orderCode}</code>
            <small className="payment-trx-id">
              {copy("លេខសម្គាល់ការបញ្ជាទិញ", "Checkout reference")}: {order?.transactionId || "—"}
            </small>
          </div>

          {/* Countdown timer */}
          {countdownText && status !== "PAID" && (
            <div className={`payment-countdown-lux ${isExpired ? "expired" : remaining <= 30 ? "warning" : ""}`}>
              <span>{copy("ផុតកំណត់ក្នុង៖", "Expires in:")}</span>
              <strong>{countdownText}</strong>
            </div>
          )}

          {/* Instructions text (ISSUE-P1-05) */}
          <div className="payment-instructions-lux">
            <h4 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 700, color: "var(--kp-ink, #1f2421)" }}>
              {copy("ជំហានទូទាត់", "Payment steps")}
            </h4>
            <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", lineHeight: "1.6" }}>
              <li>
                <strong>{copy("បើកតំណ PayWay", "Open the PayWay link")}</strong> — {copy("ស្កេនដោយកាមេរ៉ា ឬចុចតំណខាងក្រោម។ QR នេះជាតំណទូទាត់ មិនមែន KHQR ផ្ទាល់ខ្លួនទេ។", "Use your camera or the link below. This QR opens a payment link; it is not a personalized KHQR payload.")}
              </li>
              <li>
                <strong>{copy("ពិនិត្យព័ត៌មានទូទាត់", "Review the payment details")}</strong> — {copy("ផ្ទៀងផ្ទាត់អ្នកទទួល ចំនួនទឹកប្រាក់ និងរូបិយប័ណ្ណក្នុង PayWay។ ចំនួនទឹកប្រាក់នៃការបញ្ជាទិញ៖ ", "Check the recipient, amount and currency in PayWay. Order amount: ")}<strong>{amountLabel}</strong>
              </li>
              <li>
                <strong>{isKm ? "បញ្ជាក់ការផ្ទេរប្រាក់" : "Confirm the transfer"}</strong> — {isKm ? `បញ្ចូល Order Code (${order.orderCode}) ក្នុង Remark ប្រសិនបើធនាគារអនុញ្ញាត` : `Include order code (${order.orderCode}) in remark if bank supports it.`}
              </li>
              <li>
                <strong>{copy("ស្នើពិនិត្យការទូទាត់", "Request payment review")}</strong> — {copy("សំណើរបស់អ្នកមិនបញ្ជាក់ការទូទាត់ទេ។ សិទ្ធិត្រូវបានផ្ដល់ក្រោយការផ្ទៀងផ្ទាត់ពីម៉ាស៊ីនមេប៉ុណ្ណោះ។", "Your request does not confirm payment. Access follows verification by the server.")}
              </li>
            </ol>
            <p style={{ marginTop: "12px", color: "var(--kp-teal, #0f766e)", fontWeight: 600, fontSize: "13px" }}>
              <strong>{isKm ? "ចំណាំ៖" : "Note:"}</strong> {isKm ? "សិទ្ធិប្រើគំរូនឹងបើកក្រោយការផ្ទៀងផ្ទាត់ការទូទាត់ដោយប្រព័ន្ធប៉ុណ្ណោះ។" : "Access follows verified payment confirmation from official bank alerts."}
            </p>
          </div>

          {/* Success Status Panel */}
          {claimFeedback && status !== "PAID" && (
            <p className="payment-muted-lux" role="status">{copy("បានផ្ញើសំណើពិនិត្យការទូទាត់។ កំពុងរង់ចាំការផ្ទៀងផ្ទាត់។", "Review requested. Awaiting trusted payment confirmation.")}</p>
          )}
          {status === "PAID" && (
            <div className="payment-confirmed-lux">
              <div className="payment-confirmed-icon">
                <IoCheckmarkCircle />
              </div>
              <div>
                <strong>{copy("បានផ្ទៀងផ្ទាត់ការទូទាត់។", "Payment verified.")}</strong>
                <p>{copy("អាចប្រើគំរូនេះបានហើយ។ អ្នកអាចចាប់ផ្តើមបង្កើតធៀបការបានឥឡូវនេះ។", "This design is available. You can start creating your invitation.")}</p>
              </div>
              <Link
                to={templateUsePath(order.templateId, true)}
                className="checkout-pay-btn"
                style={{ marginTop: "12px", width: "100%" }}
              >
                <IoSparkles /> {copy("ប្រើគំរូនេះ", "Use Template")}
              </Link>
            </div>
          )}

          {/* Expired / Failed Panel */}
          {isExpired && (
            <div className="payment-alert-panel expired">
              <strong>{copy("ការបញ្ជាទិញផុតកំណត់", "Order session expired")}</strong>
              <p>{copy("សូមបង្កើតការបញ្ជាទិញថ្មី មុនទូទាត់។ ការទូទាត់យឺតត្រូវការការពិនិត្យដោយក្រុមការងារ។ ABA គ្រប់គ្រងរយៈពេលសុពលភាពតំណធនាគារ។", "Start a new order before paying. Late payment evidence requires manual review; bank link expiry is controlled by ABA.")}</p>
              {onRetry && (
                <button
                  type="button"
                  className="payment-primary-btn"
                  onClick={onRetry}
                  style={{ marginTop: "10px" }}
                >
                  <IoRefreshOutline /> {copy("បង្កើតការបញ្ជាទិញថ្មី", "Create new order")}
                </button>
              )}
            </div>
          )}

          {isTerminalStatus(status) && status !== "PAID" && !isExpired && (
            <div className="payment-alert-panel" role="status">
              <strong>{statusMessage(status, lang)}</strong>
              {onRetry && (
                <button type="button" className="payment-primary-btn" onClick={onRetry}>
                  <IoRefreshOutline /> {copy("បង្កើតការបញ្ជាទិញថ្មី", "Create new order")}
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
                  background: "var(--ui-action)",
                  color: "#ffffff",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  border: "none",
                  cursor: claiming ? "not-allowed" : "pointer",
                }}
              >
                <IoSparkles />
                <span>{claiming ? copy("កំពុងផ្ញើសំណើ…", "Requesting review…") : copy("ស្នើពិនិត្យការទូទាត់", "Request payment review")}</span>
              </button>
            )}

            {waitingForPayment && !isExpired && qrValue && (
              <a
                className="payment-action-secondary-btn"
                href={qrValue}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IoOpenOutline /> {copy("បើកតំណ PayWay", "Open PayWay link")}
              </a>
            )}

            {isExpired && onRetry && (
              <button
                type="button"
                className="payment-action-gold-btn"
                onClick={onRetry}
                style={{ background: "#f59e0b", color: "#000" }}
              >
                <IoRefreshOutline /> {copy("បង្កើតការបញ្ជាទិញថ្មី", "Create new order")}
              </button>
            )}

            <button
              type="button"
              className="payment-action-secondary-btn"
              disabled={checking || isExpired}
              onClick={() => checkStatus()}
            >
              <IoRefreshOutline className={checking ? "checkout-spinner" : ""} />
              <span>{checking ? copy("កំពុងពិនិត្យ…", "Checking…") : copy("ពិនិត្យស្ថានភាព", "Check Status")}</span>
            </button>

            <Link
              to="/templates/browse"
              className="payment-action-secondary-btn"
            >
              <IoArrowBackOutline />
              <span>{copy("ជ្រើសរើសគំរូផ្សេង", "Choose another design")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
