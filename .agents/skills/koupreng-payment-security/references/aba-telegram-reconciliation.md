# ABA PayWay & Telegram Reconciliation Technical Flow

## 1. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Frontend User App
    participant Backend as Spring Boot Backend
    participant DB as MySQL Database
    participant Telegram as Telegram Bot Worker
    participant Bank as ABA PayWay Alert Bot
    actor Admin as System Administrator

    Customer->>Frontend: Selects template/plan
    Frontend->>Backend: POST /api/v1/payments/orders
    Backend->>DB: INSERT TemplatePaymentOrder (status=PENDING)
    Backend-->>Frontend: Returns orderCode, amount, currency, QR link

    Customer->>Customer: Transfers funds via ABA Mobile app
    Customer->>Frontend: Enters payerName, last 3 digits, submits claim
    Frontend->>Backend: POST /api/v1/payments/orders/{code}/claim
    Backend->>DB: INSERT PaymentEvidence (status=PENDING_REVIEW)
    Backend-->>Frontend: Awaiting bank confirmation notification

    Bank->>Telegram: Merchant alert push ("Received $5.00 from CHAN S...***789")
    Telegram->>Telegram: Verify bot origin & extract metadata
    Telegram->>Backend: POST /api/v1/payments/webhook/telegram-detect (with Secret)
    Backend->>DB: SELECT FOR UPDATE candidate order by amount, currency, suffix
    
    alt Exact Match Found
        Backend->>DB: UPDATE order status=PAID, link payway_transaction_id
        Backend->>DB: GRANT template / subscription access
    else Ambiguous or Multiple Candidates
        Backend->>DB: UPDATE order status=PENDING_REVIEW
        Backend->>Admin: Alert admin dashboard for manual review
    end
```

## 2. Ingestion Parsing Rules

The Telegram worker extracts:
- `detected_amount`: Parsed decimal value (e.g. `5.00`).
- `detected_currency`: Currency identifier (`USD` or `KHR`).
- `payer_account_last3`: Last 3 digits extracted from account mask (`***123`).
- `payer_name`: Payer name text.
- `payway_transaction_id`: Bank transaction code or reference ID.
- `merchant_message_at`: Timestamp of bank alert delivery.

