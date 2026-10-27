# Koupreng Demo User Data Seeding Guide

This guide documents the dedicated, idempotent development seeding script for populating realistic Cambodian demo data associated with a target user account (identified by phone number).

---

## 1. Overview & Capabilities

- **Script Location:** [`scripts/maintenance/seed-user-demo-data.py`](file:///d:/Koupreng-invitation_project/scripts/maintenance/seed-user-demo-data.py)
- **Target Account Lookup:** Dynamic query by phone number (`phone = '060400652'`); database IDs are never hardcoded.
- **Safety Invariants:**
  - Strictly restricted to local development environments (`localhost` / `127.0.0.1`).
  - Pre-seed database backup created at [`backups/koupreng_db_pre_demo_seed_20261022.sql`](file:///d:/Koupreng-invitation_project/backups/koupreng_db_pre_demo_seed_20261022.sql).
  - Preserves existing user data (e.g. existing invitation records like `wedding-1` remain completely untouched).
  - Preserves user credentials, password hashes, roles, and account status.
  - Does NOT create fake verified bank transactions or bypass subscription/template access controls. All 3 chosen templates are standard active templates (`is_premium = 0`).

---

## 2. Seeded Modules & Record Breakdown

The script seeds **52 realistic records** across 9 database tables:

| Module | Table | Records | Details |
| :--- | :--- | :--- | :--- |
| **Events** | `invitations` | **3** | **Wedding** (`silk-heritage`), **Engagement** (`khmer-celestial`), **Birthday** (`event-essential`) |
| **Guests** | `guests` | **25** | 14 Wedding guests, 7 Engagement guests, 4 Birthday guests (VIP, Family, Friends, Colleagues) |
| **RSVP** | `rsvps` | **8** | 5 Wedding, 2 Engagement, 1 Birthday (Attending & Polite Declines) |
| **Wishes** | `rsvps` | **4** | Heartfelt Khmer blessings and birthday wishes (filtered by `message IS NOT NULL`) |
| **Gifts** | `wedding_gifts` | **5** | Traditional Cambodian gifts with dual-currency integrity (USD: ABA/Cash/Wing; KHR: Bakong KHQR) |
| **Budgets** | `budgets` | **1** | $15,000.00 Wedding budget in USD |
| **Budget Items** | `budget_items` | **4** | Reception Venue ($4,500 Paid), Catering ($5,000 Pending), Decor ($1,200 Paid), Photography ($800 Planned) |
| **Tables** | `event_tables` | **2** | VIP Table 01 (Cap: 10), Family Table A (Cap: 10) |
| **Seating** | `guest_seat_assignments` | **2** | Assigned seats for VIP and Family guests |
| **Check-in** | `guest_check_ins` | **2** | Guest 1 checked in via `QR_SCAN`; Guest 2 checked in via `MANUAL` |
| **Total** | | **52** | |

---

## 3. How to Run

### Dry Run (Preview without writing)
```powershell
python scripts/maintenance/seed-user-demo-data.py --dry-run
```

### Execute Seeding for Default Account (`060400652`)
```powershell
python scripts/maintenance/seed-user-demo-data.py
```

### Target a Different Development Account by Phone
```powershell
python scripts/maintenance/seed-user-demo-data.py --phone 012345678
```

### Custom Environment File or MySQL Binary
```powershell
python scripts/maintenance/seed-user-demo-data.py --env-file .env --mysql "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
```

---

## 4. Verification & Testing

Verify that public and authenticated APIs resolve the newly seeded records:

```powershell
python scripts/maintenance/verify-seeded-data.py
```

Expected output:
- `vibul-chariya-wedding-2026` returns HTTP 200 with full bilingual story and timeline.
- `rattana-kunthea-engagement-2026` returns HTTP 200.
- `vireak-28th-birthday-bash` returns HTTP 200.
- `/public/invitations/vibul-chariya-wedding-2026/wishes` returns all 4 published wishes.

