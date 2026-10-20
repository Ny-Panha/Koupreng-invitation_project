#!/usr/bin/env python3
"""Insert labeled, repeatable admin-report fixtures into a local dev database."""

import argparse
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[2]
MARKER = "QA_ADMIN_REPORTS_50"
PREFIX = "qa-admin-reports-50"
PROVIDER = "QA_REPORT_FIXTURE"
LABEL = "QA Reports 50"
LOCAL_ZONE = timezone(timedelta(hours=7), "Asia/Bangkok")
STATUSES = (
    "PAID", "PAID", "PENDING", "PAID_PENDING_REVIEW", "FAILED",
    "REJECTED", "EXPIRED", "PAID", "PAID", "PAID",
)
NAMES = ("Dara Sok", "Sophea Lim", "Chan Vann", "Pisey Heng", "Sokha Chea")
EVENTS = ("WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER")


@dataclass(frozen=True)
class Sql:
    value: str


def literal(value):
    if isinstance(value, Sql):
        return value.value
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, Decimal)):
        return str(value)
    if isinstance(value, datetime):
        value = value.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(value, date):
        value = value.isoformat()
    # SQL mode explicitly disables backslash escaping for this connection.
    return "'" + str(value).replace("'", "''") + "'"


def insert_if_missing(table, values, where):
    columns = ",".join(values)
    data = ",".join(literal(value) for value in values.values())
    return (f"INSERT INTO {table} ({columns}) SELECT {data} FROM DUAL "
            f"WHERE NOT EXISTS (SELECT 1 FROM {table} WHERE {where});")


def fixtures(as_of, packages):
    anchor = datetime.combine(as_of, time(), LOCAL_ZONE).astimezone(timezone.utc)
    templates = []
    for index, category in enumerate(("TRADITIONAL", "MODERN", "MINIMALIST", "FLORAL", "LUXURY", "OTHER")):
        templates.append({
            "code": f"{PREFIX}-template-{index + 1}",
            "name": f"{LABEL} | {category.title()}",
            "category": category,
            "price": Decimal(("5.00", "15.00", "30.00", "20000", "60000", "120000")[index]),
            "currency": "USD" if index < 3 else "KHR",
            "is_premium": index % 2 == 1,
            "status": "INACTIVE",
            "description": "Fictional admin-report fixture; unavailable in the public template catalog.",
            "sort_order": 900 + index,
            "created_at": anchor - timedelta(days=29),
            "updated_at": anchor,
        })
    scenarios = []
    for index in range(1, 51):
        case = (index - 1) % len(STATUSES)
        template_index = ((index - 1) // 2) % len(templates)
        package = packages[((index - 1) // 2) % len(packages)]
        product = "TEMPLATE" if index % 2 else "SUBSCRIPTION"
        created = anchor - timedelta(days=(index - 1) % 28, hours=2)
        if case == 9:
            created = anchor - timedelta(days=35 + index % 7, hours=2)
        template = templates[template_index]
        amount = template["price"] if product == "TEMPLATE" else package["price"]
        currency = template["currency"] if product == "TEMPLATE" else package["currency"]
        paid = amount if STATUSES[case] == "PAID" else None
        if case == 7:
            paid = amount - Decimal("0.01")
        source = "BROWSER_CLAIM" if case == 8 else "MANUAL_ADMIN"
        scenarios.append({
            "index": index, "case": case, "key": f"{PREFIX}-{index:03d}",
            "name": f"{LABEL} | {NAMES[(index - 1) % len(NAMES)]} {index:03d}",
            "product": product, "template_index": template_index, "package": package,
            "created": created, "amount": amount, "currency": currency,
            "status": STATUSES[case], "paid_amount": paid, "confirm_source": source,
        })
    return anchor, templates, scenarios


def build_seed(as_of, packages):
    anchor, templates, scenarios = fixtures(as_of, packages)
    statements = [
        "SET NAMES utf8mb4;",
        "SET SESSION time_zone = '+00:00';",
        "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,NO_BACKSLASH_ESCAPES';",
        "CREATE TEMPORARY TABLE qa_report_seed_guard (ok INT NOT NULL CHECK (ok=1));",
        "START TRANSACTION;",
        f"INSERT INTO qa_report_seed_guard VALUES (IF(GET_LOCK('{PREFIX}',10)=1,1,0));",
        "INSERT INTO qa_report_seed_guard SELECT IF(COUNT(*)=0,1,0) FROM users "
        f"WHERE email LIKE '{PREFIX}-%@example.invalid' AND NOT (created_by <=> '{MARKER}');",
    ]
    for index, template in enumerate(templates):
        statements.append(insert_if_missing("templates", template, "code=" + literal(template["code"])))
        statements.append(f"SET @qa_template_{index} = (SELECT template_id FROM templates WHERE code={literal(template['code'])});")
    for record in scenarios:
        index, case, key, created = (record[name] for name in ("index", "case", "key", "created"))
        user = Sql("@qa_user")
        invitation = Sql("@qa_invitation")
        template = Sql(f"@qa_template_{record['template_index']}")
        email = key + "@example.invalid"
        statements.append(insert_if_missing("users", {
            "full_name": record["name"], "email": email, "password_hash": None,
            "role": "USER", "status": "DISABLED" if index % 5 == 0 else "ACTIVE",
            "token_version": 0, "deleted": False, "created_by": MARKER,
            "last_modified_by": MARKER, "created_at": created - timedelta(hours=1), "updated_at": created,
        }, "email=" + literal(email)))
        statements.append(f"SET @qa_user = (SELECT user_id FROM users WHERE email={literal(email)} AND created_by='{MARKER}');")
        invitation_status = ("PUBLISHED", "PUBLISHED", "DRAFT", "UNPUBLISHED", "ARCHIVED")[index % 5]
        moderation = ("ACTIVE", "ACTIVE", "ACTIVE", "HIDDEN", "REPORTED", "SUSPENDED")[index % 6]
        statements.append(insert_if_missing("invitations", {
            "user_id": user, "template_id": template, "title": record["name"], "slug": key,
            "event_type": EVENTS[(index - 1) % len(EVENTS)],
            "event_date": as_of + timedelta(days=index - 25), "event_time": "18:00:00",
            "venue_name": ("Phnom Penh", "Siem Reap", "Battambang", "Kampot", "Sihanoukville")[index % 5] + " QA Venue",
            "host_name": record["name"], "language_mode": "BILINGUAL", "visibility": "PRIVATE",
            "access_token": hashlib.sha256(key.encode()).hexdigest(),
            "status": invitation_status, "moderation_status": moderation, "deleted": False,
            "published_at": created + timedelta(minutes=10) if invitation_status == "PUBLISHED" else None,
            "created_at": created, "updated_at": created,
        }, "slug=" + literal(key)))
        statements.append(f"SET @qa_invitation = (SELECT invitation_id FROM invitations WHERE slug={literal(key)} AND user_id=@qa_user);")
        paid_at = created + timedelta(minutes=20) if record["paid_amount"] is not None else None
        payment = {
            "order_code": "QA50-" + f"{index:03d}", "user_id": user,
            "amount": record["amount"], "currency": record["currency"], "provider": PROVIDER,
            "paid_amount": record["paid_amount"], "paid_at": paid_at,
            "confirm_source": record["confirm_source"] if paid_at else None,
            "confirmed_by": MARKER if paid_at else None,
            "confirmed_at": paid_at, "payway_transaction_id": key + "-synthetic" if paid_at else None,
            "payment_note": LABEL + ": fictional reporting data; no bank transfer or external evidence.",
            "created_at": created, "updated_at": created,
        }
        if record["product"] == "TEMPLATE":
            payment.update({
                "transaction_id": key, "template_id": template,
                "template_name": templates[record["template_index"]]["name"],
                "package_name": "QA template fixture", "status": record["status"],
                "expires_at": created + timedelta(minutes=30),
            })
            table = "template_payment_orders"
        else:
            active = case == 1
            status = {1: "ACTIVE", 3: "REVIEW_REQUIRED", 5: "REJECTED", 7: "REVIEW_REQUIRED", 9: "EXPIRED"}[case]
            payment.update({
                "package_id": record["package"]["id"], "payment_status": record["status"],
                "status": status, "is_active": active,
                "start_date": created if case in (1, 9) else None,
                "end_date": created + timedelta(days=30) if case in (1, 9) else None,
                "payment_expires_at": created + timedelta(minutes=30),
                "payment_remark": MARKER,
            })
            table = "subscriptions"
        statements.append(insert_if_missing(table, payment, "order_code=" + literal(payment["order_code"])))
        for guest_index in range(1, 6):
            guest_key = f"{key}-guest-{guest_index}"
            sent = guest_index <= 4
            statements.append(insert_if_missing("guests", {
                "invitation_id": invitation, "guest_name": f"{LABEL} Guest {index:03d}-{guest_index}",
                "invite_token": guest_key, "guest_group": "Family" if guest_index < 3 else "Friends",
                "side_type": "BRIDE" if guest_index % 2 else "GROOM", "seat_count": 1 + guest_index % 2,
                "send_status": "SENT" if sent else "NOT_SENT", "reminder_count": 0,
                "last_sent_at": created + timedelta(hours=1) if sent else None,
                "last_send_channel": "SYSTEM" if sent else None,
                "invitation_viewed_at": created + timedelta(hours=2) if guest_index <= 3 else None,
                "note": MARKER, "created_at": created,
            }, "invite_token=" + literal(guest_key)))
            statements.append(f"SET @qa_guest = (SELECT guest_id FROM guests WHERE invite_token={literal(guest_key)} AND invitation_id=@qa_invitation);")
            if guest_index <= 4:
                response = ("ATTENDING", "ATTENDING", "NOT_ATTENDING", "MAYBE")[guest_index - 1]
                statements.append(insert_if_missing("rsvps", {
                    "invitation_id": invitation, "guest_id": Sql("@qa_guest"), "response_status": response,
                    "attendee_count": 2 if response == "ATTENDING" else 0,
                    "message": MARKER, "responded_at": created + timedelta(hours=3),
                }, "guest_id=@qa_guest"))
            if guest_index <= 2:
                active = guest_index == 1 or index % 3 == 0
                statements.append(insert_if_missing("guest_check_ins", {
                    "invitation_id": invitation, "guest_id": Sql("@qa_guest"),
                    "checked_in_at": created + timedelta(hours=4), "source": "MANUAL",
                    "note": MARKER, "is_active": active,
                    "undone_at": created + timedelta(hours=5) if not active else None,
                }, "guest_id=@qa_guest"))
        failed = index % 4 == 0
        action = "QA_REPORT_SAMPLE_FAILED" if failed else "QA_REPORT_SAMPLE_CREATED"
        statements.append(insert_if_missing("system_audit_logs", {
            "actor_user_id": user, "action": action, "resource_type": MARKER,
            "resource_id": invitation, "description": "Synthetic admin-report testing scenario.",
            "metadata_json": json.dumps({"dataset": MARKER, "scenario": index, "synthetic": True}),
            "created_at": created,
        }, f"actor_user_id=@qa_user AND resource_type='{MARKER}' AND resource_id=@qa_invitation"))
        statements.append(insert_if_missing("notifications", {
            "user_id": user, "invitation_id": invitation, "type": "SYSTEM_ALERT", "channel": "SYSTEM",
            "title": f"{LABEL} | Scenario {index:03d}", "message": "Fictional local testing event; no delivery requested.",
            "status": "FAILED" if failed else "SENT", "delivery_attempts": 0,
            "sent_at": None if failed else created + timedelta(minutes=5),
            "error_message": "Synthetic delivery failure for admin report QA" if failed else None,
            "created_at": created, "updated_at": created,
        }, f"user_id=@qa_user AND title={literal(f'{LABEL} | Scenario {index:03d}')}"))
    for table, condition, count in (
        ("users", f"created_by='{MARKER}'", 50),
        ("invitations", f"slug LIKE '{PREFIX}-%'", 50),
        ("guests", f"note='{MARKER}'", 250),
        ("rsvps", f"message='{MARKER}'", 200),
        ("guest_check_ins", f"note='{MARKER}'", 100),
        ("template_payment_orders", f"provider='{PROVIDER}'", 25),
        ("subscriptions", f"provider='{PROVIDER}'", 25),
    ):
        statements.append(f"INSERT INTO qa_report_seed_guard SELECT IF(COUNT(*)={count},1,0) FROM {table} WHERE {condition};")
    statements.extend(["COMMIT;", f"SELECT RELEASE_LOCK('{PREFIX}');"])
    return "\n".join(statements) + "\n", scenarios


def configuration(env_file):
    values = {}
    for raw in env_file.read_text(encoding="utf-8-sig").splitlines():
        if "=" in raw and not raw.lstrip().startswith("#"):
            key, value = raw.split("=", 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    profiles = values.get("SPRING_PROFILES_ACTIVE", "").split(",")
    if "dev" not in profiles or "prod" in profiles:
        raise ValueError("The seed requires an explicit dev profile in the selected env file.")
    target = urlparse(values.get("DB_URL", "").removeprefix("jdbc:"))
    if target.scheme != "mysql" or target.hostname not in ("localhost", "127.0.0.1", "::1"):
        raise ValueError("The seed only accepts a local MySQL development database.")
    database = target.path.lstrip("/")
    if not re.fullmatch(r"[A-Za-z0-9_]+", database) or database in ("mysql", "sys", "information_schema", "performance_schema"):
        raise ValueError("Invalid development database name.")
    return values, target, database


class Mysql:
    def __init__(self, executable, values, target, database):
        self.command = [str(executable), "--no-defaults", "--protocol=tcp", "--default-character-set=utf8mb4",
                        "--host=" + target.hostname, "--port=" + str(target.port or 3306),
                        "--user=" + values["DB_USERNAME"], "--database=" + database,
                        "--batch", "--raw", "--skip-column-names"]
        self.environment = {**os.environ, "MYSQL_PWD": values.get("DB_PASSWORD", "")}

    def execute(self, sql):
        result = subprocess.run(self.command, input=sql, env=self.environment, text=True,
                                encoding="utf-8", capture_output=True, timeout=120)
        if result.returncode:
            raise RuntimeError(result.stderr.strip())
        return result.stdout.strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, default=ROOT / ".env")
    parser.add_argument("--as-of", type=date.fromisoformat, default=datetime.now(LOCAL_ZONE).date())
    parser.add_argument("--mysql", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--output", type=Path, default=ROOT / "output/admin-reporting/sample-data-50.json")
    args = parser.parse_args()
    values, target, database = configuration(args.env_file)
    executable = args.mysql or shutil.which("mysql")
    if not executable and os.name == "nt":
        executable = Path(os.environ.get("ProgramFiles", "")) / "MySQL/MySQL Server 8.0/bin/mysql.exe"
    if not executable or not Path(executable).is_file():
        raise ValueError("MySQL client not found; supply --mysql with its executable path.")
    mysql = Mysql(executable, values, target, database)
    package_rows = mysql.execute("SELECT package_id,code,price,currency FROM packages WHERE code IN ('BASIC','PRO','PREMIUM') AND active=1 ORDER BY package_id;")
    packages = []
    for row in package_rows.splitlines():
        package_id, code, price, currency = row.split("\t")
        packages.append({"id": int(package_id), "code": code, "price": Decimal(price), "currency": currency})
    if {package["code"] for package in packages} != {"BASIC", "PRO", "PREMIUM"}:
        raise ValueError("Expected the existing active BASIC, PRO and PREMIUM plans; no catalog prices will be invented.")
    if any(package["price"] < 0 or package["currency"] not in ("USD", "KHR") for package in packages):
        raise ValueError("Catalog prices must be nonnegative and explicitly denominated in USD or KHR.")
    sql, scenarios = build_seed(args.as_of, packages)
    receipts = defaultdict(Decimal)
    for scenario in scenarios:
        if scenario["status"] == "PAID" and scenario["case"] not in (7, 8):
            receipts[scenario["currency"]] += scenario["paid_amount"]
    summary = {
        "dataset": MARKER, "database": database, "asOf": args.as_of.isoformat(), "scenarios": 50,
        "paymentRecords": 50, "templatePayments": 25, "subscriptions": 25,
        "users": 50, "invitations": 50, "templates": 6, "guests": 250, "rsvps": 200,
        "checkInRecords": 100, "activeCheckIns": 66, "auditEvents": 50, "notifications": 50,
        "statuses": dict(Counter(scenario["status"] for scenario in scenarios)),
        "expectedVerifiedReceiptsByCurrency": {key: str(value) for key, value in receipts.items()},
        "createdFrom": min(scenario["created"] for scenario in scenarios).date().isoformat(),
        "createdTo": args.as_of.isoformat(), "search": LABEL, "provider": PROVIDER,
        "notes": ["Fictional records for local admin-report testing only.",
                  "No existing account, plan price, or customer record is updated.",
                  "Synthetic users have no password; invitations are private; templates are inactive.",
                  "No payment APIs, merchant alerts, or outbound notifications are invoked.",
                  "Use All time to include expired subscription history; USD and KHR remain separate.",
                  "Rerunning inserts only missing fixtures and never refreshes their original dates."],
    }
    if args.dry_run:
        print(json.dumps({**summary, "dryRun": True}, indent=2))
        return
    mysql.execute(sql)
    # A later rerun preserves the original dates/prices. Report persisted values,
    # rather than presenting a newly calculated plan as the existing dataset.
    persisted_dates = mysql.execute(
        "SELECT DATE_FORMAT(MIN(CONVERT_TZ(created_at,'+00:00','+07:00')),'%Y-%m-%d'),"
        "DATE_FORMAT(DATE_ADD(MAX(CONVERT_TZ(created_at,'+00:00','+07:00')),INTERVAL 1 DAY),'%Y-%m-%d') "
        "FROM (SELECT created_at FROM template_payment_orders "
        f"WHERE provider='{PROVIDER}' UNION ALL SELECT created_at FROM subscriptions WHERE provider='{PROVIDER}') fixtures;")
    summary["createdFrom"], summary["createdTo"] = persisted_dates.split("\t")
    persisted_receipts = mysql.execute(
        "SELECT currency,SUM(paid_amount) FROM ("
        "SELECT currency,paid_amount FROM template_payment_orders "
        f"WHERE provider='{PROVIDER}' AND status='PAID' AND confirm_source='MANUAL_ADMIN' "
        "AND paid_at IS NOT NULL AND confirmed_at IS NOT NULL AND paid_amount=amount UNION ALL "
        "SELECT currency,paid_amount FROM subscriptions "
        f"WHERE provider='{PROVIDER}' AND payment_status='PAID' AND confirm_source='MANUAL_ADMIN' "
        "AND paid_at IS NOT NULL AND confirmed_at IS NOT NULL AND paid_amount=amount) receipts GROUP BY currency;")
    summary["expectedVerifiedReceiptsByCurrency"] = {
        currency: amount for currency, amount in (row.split("\t") for row in persisted_receipts.splitlines())
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
