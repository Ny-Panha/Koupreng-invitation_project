#!/usr/bin/env python3
"""
Seed realistic demo data for Koupreng E-Invitation user account.
Targets existing account by phone number (e.g. 060400652) and seeds approximately
50 realistic Cambodian wedding, engagement, and birthday demo records.

Safety:
- Strictly verifies connection is to a local development database (localhost/127.0.0.1).
- Never modifies existing user credentials, passwords, or existing events.
- Never creates fake verified bank payments, active subscriptions, or bypasses entitlements.
- Uses existing database relationships, valid foreign keys, and explicit USD/KHR currency.
"""

from __future__ import annotations

import argparse
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import urlparse

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parents[2]
LOCAL_ZONE = timezone(timedelta(hours=7), "Asia/Phnom_Penh")
DEMO_MARKER = "DEMO_SEED_USER_060400652"

# Slugs for the 3 demo events
SLUG_WEDDING = "vibul-chariya-wedding-2026"
SLUG_ENGAGEMENT = "rattana-kunthea-engagement-2026"
SLUG_BIRTHDAY = "vireak-28th-birthday-bash"


def parse_env_file(env_file: Path) -> dict[str, str]:
    if not env_file.is_file():
        raise FileNotFoundError(f"Configuration file not found: {env_file}")
    values = {}
    for line in env_file.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, val = line.split("=", 1)
            values[key.strip()] = val.strip().strip('"').strip("'")
    return values


def verify_local_database(values: dict[str, str]) -> tuple[dict[str, str], str, int, str]:
    db_url = values.get("DB_URL", "")
    target = urlparse(db_url.removeprefix("jdbc:"))
    if target.scheme != "mysql" or target.hostname not in ("localhost", "127.0.0.1", "::1"):
        raise ValueError(
            f"Safety check failed: Seed script only accepts a local MySQL database. Target: {target.hostname}"
        )
    database = target.path.lstrip("/")
    if not re.fullmatch(r"[A-Za-z0-9_]+", database) or database in ("mysql", "sys", "information_schema", "performance_schema"):
        raise ValueError(f"Invalid development database name: {database}")
    port = target.port or 3306
    return values, target.hostname, port, database


class MysqlRunner:
    def __init__(self, executable: Path, username: str, password: str, host: str, port: int, database: str):
        self.command = [
            str(executable),
            "--no-defaults",
            "--protocol=tcp",
            "--default-character-set=utf8mb4",
            f"--host={host}",
            f"--port={port}",
            f"--user={username}",
            f"--database={database}",
            "--batch",
            "--raw",
            "--skip-column-names",
        ]
        self.env = {**os.environ, "MYSQL_PWD": password}

    def query(self, sql: str) -> str:
        res = subprocess.run(
            self.command,
            input=sql,
            env=self.env,
            text=True,
            encoding="utf-8",
            capture_output=True,
            timeout=60,
        )
        if res.returncode != 0:
            raise RuntimeError(f"MySQL query error: {res.stderr.strip()}\nSQL was:\n{sql[:500]}")
        return res.stdout.strip()


def sql_str(val: str | None) -> str:
    if val is None:
        return "NULL"
    escaped = val.replace("'", "''")
    return f"'{escaped}'"


def build_seed_sql(target_user_id: int) -> tuple[str, dict[str, int]]:
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    statements = [
        "SET NAMES utf8mb4;",
        "SET SESSION time_zone = '+00:00';",
        "START TRANSACTION;",
        f"SET @user_id = {target_user_id};",
        "SET @tpl_wedding = (SELECT template_id FROM templates WHERE code = 'silk-heritage' LIMIT 1);",
        "SET @tpl_engagement = (SELECT template_id FROM templates WHERE code = 'khmer-celestial' LIMIT 1);",
        "SET @tpl_birthday = (SELECT template_id FROM templates WHERE code = 'event-essential' LIMIT 1);",
    ]

    # --- 1. Clean up previously seeded demo records for these 3 specific slugs ---
    cleanup_sql = f"""
    -- Clean up children first to avoid FK constraint violations
    DELETE c FROM guest_check_ins c
    JOIN invitations i ON c.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE s FROM guest_seat_assignments s
    JOIN invitations i ON s.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE t FROM event_tables t
    JOIN invitations i ON t.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE bi FROM budget_items bi
    JOIN budgets b ON bi.budget_id = b.budget_id
    JOIN invitations i ON b.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE b FROM budgets b
    JOIN invitations i ON b.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE g FROM wedding_gifts g
    JOIN invitations i ON g.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE r FROM rsvps r
    JOIN invitations i ON r.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE g FROM guests g
    JOIN invitations i ON g.invitation_id = i.invitation_id
    WHERE i.user_id = @user_id AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');

    DELETE FROM invitations
    WHERE user_id = @user_id AND slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}');
    """
    statements.append(cleanup_sql)

    # --- 2. Insert the 3 Events ---
    # Event 1: Wedding
    story_wedding = (
        "ដំណើររឿងនៃសេចក្តីស្រឡាញ់ និងការចាប់ផ្តើមជីវិតអាពាហ៍ពិពាហ៍ដ៏មានសិរីសួស្តី។ "
        "យើងខ្ញុំមានកិត្តិយស និងក្តីសោមនស្សរីករាយយ៉ាងក្រៃលែងក្នុងការគោរពអញ្ជើញឯកឧត្តម លោកជំទាវ លោក លោកស្រី "
        "អ្នកនាងកញ្ញា ចូលរួមជាអធិបតី និងភ្ញៀវកិត្តិយសក្នុងពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។"
    )
    design_wedding = json.dumps({
        "theme": "silk-heritage",
        "coverImage": "/templates/silk-heritage/together.webp",
        "portraitImage": "/templates/silk-heritage/portrait.webp"
    })
    content_wedding = json.dumps({
        "welcome": {"km": "សូមគោរពអញ្ជើញ", "en": "You are warmly invited"},
        "timeline": [
            {"time": "07:00", "titleKm": "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", "titleEn": "Monk Blessing Ceremony"},
            {"time": "08:30", "titleKm": "ពិធីហែកំណត់ និងសំពះផ្ទឹម", "titleEn": "Traditional Procession & Hair Cutting"},
            {"time": "17:00", "titleKm": "ពិធីពិសាភោជនាហារ និងរាំកម្សាន្ត", "titleEn": "Wedding Banquet & Celebration"}
        ]
    })
    enabled_wedding = json.dumps({
        "story": True, "gallery": True, "rsvp": True, "gifts": True,
        "wishes": True, "budget": True, "seating": True, "timeline": True
    })

    # Event 2: Engagement
    story_engagement = (
        "ដោយមានការអនុញ្ញាត និងឯកភាពពីមាតាបិតាទាំងសងខាង យើងខ្ញុំទាំងពីរមានសេចក្តីរំភើបរីករាយ"
        "ក្នុងការប្រារព្ធពិធីភ្ជាប់ពាក្យតាមប្រពៃណីខ្មែរ។"
    )
    design_engagement = json.dumps({
        "theme": "khmer-celestial",
        "coverImage": "/facebook/all/03-card/cover-card.jpg"
    })
    content_engagement = json.dumps({
        "welcome": {"km": "សូមអញ្ជើញចូលរួមពិធីភ្ជាប់ពាក្យ", "en": "Engagement Celebration"},
        "timeline": [
            {"time": "08:30", "titleKm": "ពិធីជំនូន និងសែនដូនតា", "titleEn": "Engagement Gift Presentation"}
        ]
    })
    enabled_engagement = json.dumps({
        "story": True, "gallery": True, "rsvp": True, "gifts": True, "wishes": True
    })

    # Event 3: Birthday
    story_birthday = (
        "សូមអញ្ជើញមិត្តភក្តិបងប្អូនទាំងអស់ចូលរួមពិធីជប់លៀងខួបកំណើតគម្រប់ ២៨ ឆ្នាំរបស់ខ្ញុំ "
        "ជួបជុំទទួលទានអាហារពេលល្ងាច និងស្តាប់តន្ត្រីកម្សាន្ត។"
    )
    design_birthday = json.dumps({
        "theme": "event-essential",
        "coverImage": "/templates/event-essential.svg"
    })
    content_birthday = json.dumps({
        "welcome": {"km": "សូមអញ្ជើញចូលរួមពិធីខួបកំណើត", "en": "28th Birthday Bash"},
        "timeline": [
            {"time": "18:30", "titleKm": "ទទួលភ្ញៀវ និងពិសាអាហារប៊ូហ្វេ", "titleEn": "Welcome & Buffet Dinner"},
            {"time": "20:00", "titleKm": "ផ្លុំទៀនខួបកំណើត និងកាត់នំ", "titleEn": "Cake Cutting & Live Band"}
        ]
    })
    enabled_birthday = json.dumps({
        "story": True, "gallery": True, "rsvp": True, "wishes": True
    })

    insert_events_sql = f"""
    INSERT INTO invitations (
        user_id, template_id, title, slug, event_type,
        event_date, event_time, venue_name, venue_address, google_map_url,
        host_name, partner_name, groom_name, bride_name, story_text,
        language_mode, design_json, content_json, custom_colors, custom_fonts,
        enabled_sections, layout_settings, visibility, access_token,
        rsvp_deadline, status, moderation_status, deleted, published_at, created_at, updated_at
    ) VALUES
    (
        @user_id, @tpl_wedding,
        'មង្គលការ វិបុល & ចរិយា (Vibul & Chariya Wedding)', '{SLUG_WEDDING}', 'WEDDING',
        '2026-11-28', '17:00:00', 'សណ្ឋាគារ ហ្គាដិន ស៊ីធី (Garden City Hotel Phnom Penh)',
        'វិថីឈ្នះ-ឈ្នះ, សង្កាត់ព្រែកព្នៅ, រាជធានីភ្នំពេញ', 'https://maps.google.com/?q=Garden+City+Hotel+Phnom+Penh',
        'គ្រួសារទាំងសងខាង (The Sok & Lim Families)', 'លឹម ចរិយា', 'សុខ វិបុល', 'លឹម ចរិយា',
        {sql_str(story_wedding)}, 'BILINGUAL',
        {sql_str(design_wedding)}, {sql_str(content_wedding)},
        '{{\"primary\":\"#926C34\",\"accent\":\"#2E433A\",\"canvas\":\"#FBF6EE\"}}',
        '{{\"heading\":\"Moul\",\"body\":\"Kantumruy Pro\"}}',
        {sql_str(enabled_wedding)}, '{{\"hero\":\"full\",\"spacing\":\"comfortable\"}}',
        'PUBLIC', 'demo-token-vibul-chariya-wedding', '2026-11-20',
        'PUBLISHED', 'ACTIVE', 0, '{now_utc}', '{now_utc}', '{now_utc}'
    ),
    (
        @user_id, @tpl_engagement,
        'ពិធីភ្ជាប់ពាក្យ រតនា & គន្ធា (Rattana & Kunthea Engagement)', '{SLUG_ENGAGEMENT}', 'ENGAGEMENT',
        '2026-12-15', '08:30:00', 'ភូមិគ្រឹះ ហេង គន្ធា (Kunthea Villa)',
        'ផ្លូវជាតិលេខ ៦A, សង្កាត់ជ្រោយចង្វារ, រាជធានីភ្នំពេញ', 'https://maps.google.com/?q=Chroy+Changvar+Phnom+Penh',
        'លោក ម៉ៅ រតនា & កញ្ញា ហេង គន្ធា', 'ហេង គន្ធា', 'ម៉ៅ រតនា', 'ហេង គន្ធា',
        {sql_str(story_engagement)}, 'BILINGUAL',
        {sql_str(design_engagement)}, {sql_str(content_engagement)},
        '{{\"primary\":\"#5A7156\",\"accent\":\"#8B9D83\",\"canvas\":\"#F4F7F2\"}}',
        '{{\"heading\":\"Moul\",\"body\":\"Kantumruy Pro\"}}',
        {sql_str(enabled_engagement)}, '{{\"hero\":\"full\",\"spacing\":\"comfortable\"}}',
        'PUBLIC', 'demo-token-rattana-kunthea-engagement', '2026-12-05',
        'PUBLISHED', 'ACTIVE', 0, '{now_utc}', '{now_utc}', '{now_utc}'
    ),
    (
        @user_id, @tpl_birthday,
        'ខួបកំណើត គម្រប់ ២៨ ឆ្នាំ វីរៈ (Vireak 28th Birthday Bash)', '{SLUG_BIRTHDAY}', 'BIRTHDAY',
        '2026-11-10', '18:30:00', 'Sky High Lounge & Restaurant',
        'ជាន់ទី ២២, អគារ Vattanac Capital, មហាវិថីព្រះមុនីវង្ស, ភ្នំពេញ', 'https://maps.google.com/?q=Vattanac+Capital+Phnom+Penh',
        'វីរៈ (Vireak)', NULL, NULL, NULL,
        {sql_str(story_birthday)}, 'BILINGUAL',
        {sql_str(design_birthday)}, {sql_str(content_birthday)},
        '{{\"primary\":\"#0F766E\",\"accent\":\"#926C34\",\"canvas\":\"#F8FAFC\"}}',
        '{{\"heading\":\"DM Sans\",\"body\":\"Kantumruy Pro\"}}',
        {sql_str(enabled_birthday)}, '{{\"hero\":\"full\",\"spacing\":\"compact\"}}',
        'PUBLIC', 'demo-token-vireak-28th-birthday', '2026-11-05',
        'PUBLISHED', 'ACTIVE', 0, '{now_utc}', '{now_utc}', '{now_utc}'
    );

    SET @inv_wedding = (SELECT invitation_id FROM invitations WHERE slug = '{SLUG_WEDDING}' AND user_id = @user_id);
    SET @inv_engagement = (SELECT invitation_id FROM invitations WHERE slug = '{SLUG_ENGAGEMENT}' AND user_id = @user_id);
    SET @inv_birthday = (SELECT invitation_id FROM invitations WHERE slug = '{SLUG_BIRTHDAY}' AND user_id = @user_id);
    """
    statements.append(insert_events_sql)

    # --- 3. Insert 25 Guests (14 Wedding, 7 Engagement, 4 Birthday) ---
    insert_guests_sql = f"""
    -- Event 1: Wedding (14 guests)
    INSERT INTO guests (invitation_id, guest_name, phone, email, guest_group, side_type, table_number, invite_token, send_status, invitation_viewed_at, contribution_status, total_contributed, seat_count, note, created_at)
    VALUES
    (@inv_wedding, 'ឯកឧត្តម ចាន់ វិសាល', '012888991', 'chan.visal@vip.gov.kh', 'VIP', 'GROOM', 'VIP-1', 'token-w-01', 'SENT', '{now_utc}', 'RECEIVED', 100.00, 2, 'ភ្ញៀវកិត្តិយសជាន់ខ្ពស់', '{now_utc}'),
    (@inv_wedding, 'លោកជំទាវ សុខ ម៉ារី', '012888992', 'sok.mary@vip.gov.kh', 'VIP', 'BRIDE', 'FAM-A', 'token-w-02', 'SENT', '{now_utc}', 'RECEIVED', 50.00, 2, 'ភ្ញៀវកិត្តិយសគ្រួសារ', '{now_utc}'),
    (@inv_wedding, 'លោក ហេង វណ្ណា', '017334455', 'heng.vanna@gmail.com', 'Family', 'GROOM', 'FAM-A', 'token-w-03', 'SENT', '{now_utc}', 'RECEIVED', 50.00, 4, 'បងប្អូនជីដូនមួយ', '{now_utc}'),
    (@inv_wedding, 'លោកស្រី ម៉ៅ សុភា', '015778899', 'mao.sophea@gmail.com', 'Family', 'BRIDE', 'FAM-B', 'token-w-04', 'SENT', '{now_utc}', 'PENDING', 0.00, 2, 'អ៊ុំស្រីខាងកូនក្រមុំ', '{now_utc}'),
    (@inv_wedding, 'កញ្ញា គឹម ស្រីនាង', '098112233', 'sreineang.kim@gmail.com', 'Friends', 'BRIDE', 'FR-1', 'token-w-05', 'SENT', '{now_utc}', 'RECEIVED', 200.00, 1, 'មិត្តភក្តិវិទ្យាល័យ', '{now_utc}'),
    (@inv_wedding, 'លោក ព្រំ សុវណ្ណ', '070445566', 'prom.sovann@gmail.com', 'Friends', 'GROOM', 'FR-1', 'token-w-06', 'SENT', NULL, 'PENDING', 0.00, 2, 'មិត្តរួមថ្នាក់សាកលវិទ្យាល័យ', '{now_utc}'),
    (@inv_wedding, 'លោក តាំង ប៊ុនធឿន', '012334411', 'tang.bunthoeun@company.com', 'Colleagues', 'GROOM', 'COL-1', 'token-w-07', 'SENT', '{now_utc}', 'PENDING', 0.00, 2, 'សហការីផ្នែកទីផ្សារ', '{now_utc}'),
    (@inv_wedding, 'លោកស្រី ឈុន វ៉ាន់នី', '012556677', 'chhun.vanny@company.com', 'Colleagues', 'BRIDE', 'COL-1', 'token-w-08', 'PENDING', NULL, 'PENDING', 0.00, 1, 'ប្រធានផ្នែកគណនេយ្យ', '{now_utc}'),
    (@inv_wedding, 'លោក ស៊ូ រតនៈ', '089223344', 'sou.ratanak@gmail.com', 'Friends', 'GROOM', 'FR-2', 'token-w-09', 'SENT', '{now_utc}', 'PENDING', 0.00, 2, 'មិត្តជិតស្និទ្ធ', '{now_utc}'),
    (@inv_wedding, 'កញ្ញា ឡុង សុជាតា', '093667788', 'long.socheata@gmail.com', 'Friends', 'BRIDE', 'FR-2', 'token-w-10', 'PENDING', NULL, 'PENDING', 0.00, 1, 'មិត្តភក្តិ', '{now_utc}'),
    (@inv_wedding, 'លោក អ៊ុច សម្បត្តិ', '016889900', 'ouch.sambath@gmail.com', 'Family', 'GROOM', 'FAM-B', 'token-w-11', 'SENT', NULL, 'PENDING', 0.00, 3, 'ពូខាងកូនកំលោះ', '{now_utc}'),
    (@inv_wedding, 'លោកស្រី សៀង ពិសី', '077112244', 'sieng.pisey@gmail.com', 'Family', 'BRIDE', 'FAM-B', 'token-w-12', 'SENT', '{now_utc}', 'PENDING', 0.00, 2, 'មីងខាងកូនក្រមុំ', '{now_utc}'),
    (@inv_wedding, 'លោក ជា សុខខេង', '085332211', 'chea.sokkheng@work.com', 'Colleagues', 'GROOM', 'COL-2', 'token-w-13', 'PENDING', NULL, 'PENDING', 0.00, 2, 'ប្រធានក្រុមបច្ចេកវិទ្យា', '{now_utc}'),
    (@inv_wedding, 'កញ្ញា ណាត លីហ្សា', '099443322', 'nat.liza@gmail.com', 'Friends', 'BRIDE', 'FR-1', 'token-w-14', 'SENT', '{now_utc}', 'PENDING', 0.00, 1, 'មិត្តភក្តិ', '{now_utc}');

    -- Event 2: Engagement (7 guests)
    INSERT INTO guests (invitation_id, guest_name, phone, email, guest_group, side_type, table_number, invite_token, send_status, invitation_viewed_at, contribution_status, total_contributed, seat_count, note, created_at)
    VALUES
    (@inv_engagement, 'លោកតា សេង គង់', '012554433', NULL, 'Family', 'GROOM', 'E-VIP', 'token-e-01', 'SENT', '{now_utc}', 'RECEIVED', 50.00, 2, 'ជីតាខាងកូនកំលោះ', '{now_utc}'),
    (@inv_engagement, 'លោកយាយ អ៊ឹម សារ៉េត', '012665544', NULL, 'Family', 'BRIDE', 'E-VIP', 'token-e-02', 'SENT', '{now_utc}', 'PENDING', 0.00, 2, 'ជីដូនខាងកូនក្រមុំ', '{now_utc}'),
    (@inv_engagement, 'លោក ទៀង វុទ្ធី', '017887766', 'tieng.vuthy@gmail.com', 'Family', 'GROOM', 'E-FAM', 'token-e-03', 'SENT', NULL, 'PENDING', 0.00, 2, 'មាខាងកូនកំលោះ', '{now_utc}'),
    (@inv_engagement, 'លោកស្រី មាស គន្ធី', '015443322', 'meas.kunthee@gmail.com', 'Family', 'BRIDE', 'E-FAM', 'token-e-04', 'SENT', '{now_utc}', 'PENDING', 0.00, 2, 'អ៊ុំស្រីខាងកូនក្រមុំ', '{now_utc}'),
    (@inv_engagement, 'លោក ជ័យ សុផល', '098778899', 'chey.sophal@gmail.com', 'Friends', 'GROOM', 'E-FR', 'token-e-05', 'PENDING', NULL, 'PENDING', 0.00, 1, 'មិត្តភក្តិ', '{now_utc}'),
    (@inv_engagement, 'កញ្ញា កែវ ចរិយា', '093223355', 'keo.chariya@gmail.com', 'Friends', 'BRIDE', 'E-FR', 'token-e-06', 'SENT', '{now_utc}', 'PENDING', 0.00, 1, 'មិត្តភក្តិ', '{now_utc}'),
    (@inv_engagement, 'លោក ផាន់ ពិសាល', '085667788', 'phan.pisal@company.com', 'Colleagues', 'GROOM', 'E-COL', 'token-e-07', 'PENDING', NULL, 'PENDING', 0.00, 2, 'សហការី', '{now_utc}');

    -- Event 3: Birthday (4 guests)
    INSERT INTO guests (invitation_id, guest_name, phone, email, guest_group, side_type, table_number, invite_token, send_status, invitation_viewed_at, contribution_status, total_contributed, seat_count, note, created_at)
    VALUES
    (@inv_birthday, 'លោក សំរិទ្ធ វិចិត្រ', '012998877', 'samrith.vichet@gmail.com', 'Close Friends', 'HOST', 'T-01', 'token-b-01', 'SENT', '{now_utc}', 'PENDING', 0.00, 1, 'មិត្តជិតស្និទ្ធបំផុត', '{now_utc}'),
    (@inv_birthday, 'កញ្ញា អ៊ុក មុនីរ័ត្ន', '098445566', 'ouk.muniroth@gmail.com', 'Close Friends', 'HOST', 'T-01', 'token-b-02', 'SENT', '{now_utc}', 'PENDING', 0.00, 1, 'មិត្តជិតស្និទ្ធ', '{now_utc}'),
    (@inv_birthday, 'លោក ស៊ីន វ៉ាន់ឌី', '070112233', 'sin.vandy@gmail.com', 'University', 'HOST', 'T-02', 'token-b-03', 'PENDING', NULL, 'PENDING', 0.00, 1, 'មិត្តរួមជំនាន់សាកលវិទ្យាល័យ', '{now_utc}'),
    (@inv_birthday, 'លោក នូ ចាន់ថន', '089556677', 'nou.chanthon@gmail.com', 'Colleagues', 'HOST', 'T-02', 'token-b-04', 'SENT', NULL, 'PENDING', 0.00, 1, 'សហការីផ្នែក Coding', '{now_utc}');
    """
    statements.append(insert_guests_sql)

    # --- 4. Insert 8 RSVP Responses (with 4 heartfelt wishes) ---
    wish_1 = "សូមជូនពរដល់កូនកំលោះ និងកូនក្រមុំ ឱ្យស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង និងមានសុភមង្គលពេញមួយជីវិត!"
    wish_2 = "សិរីសួស្តី ជ័យមង្គល វិបុលសុខ កើតមានដល់គ្រួសារថ្មីនៃអ្នកទាំងពីរជានិច្ចនិរន្តរ៍!"
    wish_3 = "សូមឱ្យចំណងអាពាហ៍ពិពាហ៍របស់អ្នកទាំងពីរពោរពេញដោយក្តីមេត្តា និងសេចក្តីសុខគ្រប់ទិវា!"
    wish_4 = "រីករាយថ្ងៃខួបកំណើតបងវីរៈ! ជូនពរសុខភាពល្អ និងជោគជ័យគ្រប់ភារកិច្ចការងារ!"
    decline_msg = "សូមអភ័យទោសដែលមិនបានទៅចូលរួមដោយសារជាប់ភារកិច្ចនៅខេត្ត តែសូមផ្ញើក្តីស្រឡាញ់ និងការជូនពរយ៉ាងជ្រាលជ្រៅ!"

    insert_rsvps_sql = f"""
    -- Event 1: Wedding (5 RSVPs)
    INSERT INTO rsvps (invitation_id, guest_id, response_status, attendee_count, message, responded_at)
    VALUES
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-01'), 'ATTENDING', 2, {sql_str(wish_1)}, '{now_utc}'),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-02'), 'ATTENDING', 2, {sql_str(wish_2)}, '{now_utc}'),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-03'), 'ATTENDING', 4, {sql_str(wish_3)}, '{now_utc}'),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-04'), 'NOT_ATTENDING', 0, {sql_str(decline_msg)}, '{now_utc}'),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-05'), 'ATTENDING', 1, NULL, '{now_utc}');

    -- Event 2: Engagement (2 RSVPs)
    INSERT INTO rsvps (invitation_id, guest_id, response_status, attendee_count, message, responded_at)
    VALUES
    (@inv_engagement, (SELECT guest_id FROM guests WHERE invite_token = 'token-e-01'), 'ATTENDING', 2, 'ជូនពរចៅទាំងពីរស្រឡាញ់គ្នាជាប់និរន្តរ៍', '{now_utc}'),
    (@inv_engagement, (SELECT guest_id FROM guests WHERE invite_token = 'token-e-02'), 'ATTENDING', 2, NULL, '{now_utc}');

    -- Event 3: Birthday (1 RSVP with Birthday Wish)
    INSERT INTO rsvps (invitation_id, guest_id, response_status, attendee_count, message, responded_at)
    VALUES
    (@inv_birthday, (SELECT guest_id FROM guests WHERE invite_token = 'token-b-01'), 'ATTENDING', 1, {sql_str(wish_4)}, '{now_utc}');
    """
    statements.append(insert_rsvps_sql)

    # --- 5. Insert 5 Gifts (4 Wedding, 1 Engagement) with USD/KHR ---
    insert_gifts_sql = f"""
    INSERT INTO wedding_gifts (invitation_id, guest_id, giver_name, amount, currency, method, received_date, note, created_at, updated_at)
    VALUES
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-01'), 'ឯកឧត្តម ចាន់ វិសាល', 100.00, 'USD', 'ABA_PAYWAY', '2026-11-28', 'ចំណងដៃអាពាហ៍ពិពាហ៍តាម ABA Mobile', '{now_utc}', '{now_utc}'),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-02'), 'លោកជំទាវ សុខ ម៉ារី', 50.00, 'USD', 'CASH', '2026-11-28', 'ចំណងដៃប្រាក់សុទ្ធក្នុងពិធី', '{now_utc}', '{now_utc}'),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-03'), 'លោក ហេង វណ្ណា', 200000.00, 'KHR', 'BAKONG', '2026-11-28', 'ចំណងដៃតាម Bakong KHQR (២០ ម៉ឺនរៀល)', '{now_utc}', '{now_utc}'),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-05'), 'កញ្ញា គឹម ស្រីនាង', 200.00, 'USD', 'WING', '2026-11-28', 'ចំណងដៃមិត្តភក្តិជិតស្និទ្ធតាម Wing Bank', '{now_utc}', '{now_utc}'),
    (@inv_engagement, (SELECT guest_id FROM guests WHERE invite_token = 'token-e-01'), 'លោកតា សេង គង់', 50.00, 'USD', 'CASH', '2026-12-15', 'ចំណងដៃពិធីភ្ជាប់ពាក្យ', '{now_utc}', '{now_utc}');
    """
    statements.append(insert_gifts_sql)

    # --- 6. Insert Budget & 4 Budget Items ---
    insert_budget_sql = f"""
    INSERT INTO budgets (invitation_id, total_budget, notes, created_at, updated_at)
    VALUES (@inv_wedding, 15000.00, 'គម្រោងចំណាយសរុបសម្រាប់ពិធីមង្គលការ (Total Wedding Budget in USD)', '{now_utc}', '{now_utc}');

    SET @budget_id = (SELECT budget_id FROM budgets WHERE invitation_id = @inv_wedding);

    INSERT INTO budget_items (budget_id, category, item_name, estimated_cost, actual_cost, currency, expense_date, status, vendor_name, notes)
    VALUES
    (@budget_id, 'Venue', 'សាលប្រារព្ធពិធីមង្គលការ (Garden City Ballroom)', 4500.00, 4500.00, 'USD', '2026-11-01', 'PAID', 'Garden City Hotel', 'កក់សាល និងបង់ថ្លៃសេវារួចរាល់'),
    (@budget_id, 'Catering', 'ម្ហូបការ និងភេសជ្ជៈ (Wedding Banquet & Drinks)', 5000.00, 3000.00, 'USD', '2026-11-15', 'PENDING', 'Garden City Catering', 'បង់ប្រាក់កក់ ៦០% នៅសល់ ៤០% បង់ថ្ងៃកម្មវិធី'),
    (@budget_id, 'Decoration', 'ផ្កាស្រស់ និងការរចនារោងការបែបខ្មែរ (Khmer Floral & Decor)', 1200.00, 1200.00, 'USD', '2026-11-10', 'PAID', 'Serey Floral Studio', 'រចនាផ្កាស្រស់ និងរោងការបុរាណ'),
    (@budget_id, 'Photography', 'ថតរូប និងវីដេអូពិធីការ (Cinematography & Photo)', 800.00, 0.00, 'USD', '2026-11-28', 'PLANNED', 'Koupreng Media Studio', 'ថតរូប Pre-wedding និងវីដេអូពេញមួយថ្ងៃ');
    """
    statements.append(insert_budget_sql)

    # --- 7. Insert 2 Event Tables + 2 Seat Assignments ---
    insert_seating_sql = f"""
    INSERT INTO event_tables (invitation_id, table_name, table_label, capacity, sort_order, notes, created_at, updated_at)
    VALUES
    (@inv_wedding, 'VIP Table 01', 'VIP-1', 10, 1, 'តុភ្ញៀវកិត្តិយសជាន់ខ្ពស់ (VIP Dignitaries Table)', '{now_utc}', '{now_utc}'),
    (@inv_wedding, 'Family Table A', 'FAM-A', 10, 2, 'តុសាច់ញាតិគ្រួសារខាងកូនកំលោះ (Groom Family Table)', '{now_utc}', '{now_utc}');

    SET @tbl_vip = (SELECT table_id FROM event_tables WHERE invitation_id = @inv_wedding AND table_name = 'VIP Table 01');
    SET @tbl_fam = (SELECT table_id FROM event_tables WHERE invitation_id = @inv_wedding AND table_name = 'Family Table A');

    INSERT INTO guest_seat_assignments (invitation_id, table_id, guest_id, seat_label, seat_count, notes, assigned_at)
    VALUES
    (@inv_wedding, @tbl_vip, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-01'), 'VIP-01', 2, 'កៅអីកិត្តិយស VIP', '{now_utc}'),
    (@inv_wedding, @tbl_fam, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-02'), 'FA-01', 2, 'កៅអីសាច់ញាតិជិតស្និទ្ធ', '{now_utc}');
    """
    statements.append(insert_seating_sql)

    # --- 8. Insert 2 Check-Ins ---
    insert_checkins_sql = f"""
    INSERT INTO guest_check_ins (invitation_id, guest_id, checked_in_by, checked_in_at, source, note, is_active)
    VALUES
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-01'), @user_id, '{now_utc}', 'QR_SCAN', 'ភ្ញៀវស្កេន QR កូដនៅច្រកទ្វារ VIP', 1),
    (@inv_wedding, (SELECT guest_id FROM guests WHERE invite_token = 'token-w-02'), @user_id, '{now_utc}', 'MANUAL', 'កត់ត្រាចូលរួមដោយដៃនៅតុទទួលភ្ញៀវ', 1);
    """
    statements.append(insert_checkins_sql)

    statements.append("COMMIT;")

    full_sql = "\n".join(statements)

    expected_counts = {
        "invitations": 3,
        "guests": 25,
        "rsvps": 8,
        "wishes": 4,  # Subset of RSVPs with non-null message
        "wedding_gifts": 5,
        "budgets": 1,
        "budget_items": 4,
        "event_tables": 2,
        "guest_seat_assignments": 2,
        "guest_check_ins": 2,
    }
    return full_sql, expected_counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phone", default="060400652", help="Target user phone number (default: 060400652)")
    parser.add_argument("--env-file", type=Path, default=ROOT / ".env", help="Path to .env configuration")
    parser.add_argument("--mysql", type=Path, help="Path to mysql executable")
    parser.add_argument("--dry-run", action="store_true", help="Print planned SQL and record summary without executing")
    args = parser.parse_args()

    # 1. Parse and verify environment
    values = parse_env_file(args.env_file)
    values, host, port, database = verify_local_database(values)

    executable = args.mysql or shutil.which("mysql")
    if not executable and os.name == "nt":
        executable = Path(os.environ.get("ProgramFiles", "")) / "MySQL/MySQL Server 8.0/bin/mysql.exe"
    if not executable or not Path(executable).is_file():
        raise FileNotFoundError("MySQL client executable not found.")

    runner = MysqlRunner(executable, values["DB_USERNAME"], values.get("DB_PASSWORD", ""), host, port, database)

    # 2. Look up target user dynamically by phone
    print(f"[*] Looking up user with phone '{args.phone}' in database '{database}'...")
    user_lookup_sql = f"SELECT user_id, full_name, phone, role, status FROM users WHERE phone = '{args.phone}' AND deleted = 0 LIMIT 1;"
    user_row = runner.query(user_lookup_sql)
    if not user_row:
        raise ValueError(f"Target user with phone '{args.phone}' was not found in database '{database}'.")

    user_id_str, full_name, phone, role, status = user_row.split("\t")
    target_user_id = int(user_id_str)
    print(f"[+] Found target user: ID={target_user_id}, Name='{full_name}', Phone='{phone}', Role={role}, Status={status}")

    # 3. Build idempotent seed SQL
    sql, expected_counts = build_seed_sql(target_user_id)

    total_records = (
        expected_counts["invitations"]
        + expected_counts["guests"]
        + expected_counts["rsvps"]
        + expected_counts["wedding_gifts"]
        + expected_counts["budgets"]
        + expected_counts["budget_items"]
        + expected_counts["event_tables"]
        + expected_counts["guest_seat_assignments"]
        + expected_counts["guest_check_ins"]
    )

    summary = {
        "status": "DRY_RUN" if args.dry_run else "SUCCESS",
        "targetAccount": {
            "userId": target_user_id,
            "fullName": full_name,
            "phone": phone,
            "role": role,
            "status": status,
        },
        "database": database,
        "host": host,
        "totalRecords": total_records,
        "breakdown": expected_counts,
        "events": [
            {
                "type": "WEDDING",
                "template": "silk-heritage",
                "slug": SLUG_WEDDING,
                "title": "មង្គលការ វិបុល & ចរិយា (Vibul & Chariya Wedding)",
                "guestsCount": 14,
                "rsvpsCount": 5,
                "wishesCount": 3,
                "giftsCount": 4,
                "budgetItemsCount": 4,
                "tablesCount": 2,
                "seatAssignmentsCount": 2,
                "checkInsCount": 2,
            },
            {
                "type": "ENGAGEMENT",
                "template": "khmer-celestial",
                "slug": SLUG_ENGAGEMENT,
                "title": "ពិធីភ្ជាប់ពាក្យ រតនា & គន្ធា (Rattana & Kunthea Engagement)",
                "guestsCount": 7,
                "rsvpsCount": 2,
                "giftsCount": 1,
            },
            {
                "type": "BIRTHDAY",
                "template": "event-essential",
                "slug": SLUG_BIRTHDAY,
                "title": "ខួបកំណើត គម្រប់ ២៨ ឆ្នាំ វីរៈ (Vireak 28th Birthday Bash)",
                "guestsCount": 4,
                "rsvpsCount": 1,
                "wishesCount": 1,
            },
        ],
    }

    if args.dry_run:
        print("[*] Dry run enabled. SQL preview generated.")
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        return

    # 4. Execute SQL
    print(f"[*] Executing seed transaction for user ID {target_user_id}...")
    runner.query(sql)
    print("[+] Seed transaction committed successfully.")

    # 5. Verify seeded records from database
    verify_sql = f"""
    SELECT
      (SELECT COUNT(*) FROM invitations WHERE user_id = {target_user_id} AND slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM guests g JOIN invitations i ON g.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM rsvps r JOIN invitations i ON r.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM rsvps r JOIN invitations i ON r.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}') AND r.message IS NOT NULL AND TRIM(r.message) != ''),
      (SELECT COUNT(*) FROM wedding_gifts g JOIN invitations i ON g.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM budgets b JOIN invitations i ON b.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM budget_items bi JOIN budgets b ON bi.budget_id = b.budget_id JOIN invitations i ON b.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM event_tables t JOIN invitations i ON t.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM guest_seat_assignments s JOIN invitations i ON s.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}')),
      (SELECT COUNT(*) FROM guest_check_ins c JOIN invitations i ON c.invitation_id = i.invitation_id WHERE i.user_id = {target_user_id} AND i.slug IN ('{SLUG_WEDDING}', '{SLUG_ENGAGEMENT}', '{SLUG_BIRTHDAY}'));
    """
    counts_raw = runner.query(verify_sql)
    invs, gsts, rsvps, wishes, gifts, bdgs, bitems, tbls, seats, chkins = map(int, counts_raw.split("\t"))

    verified_counts = {
        "invitations": invs,
        "guests": gsts,
        "rsvps": rsvps,
        "wishes": wishes,
        "wedding_gifts": gifts,
        "budgets": bdgs,
        "budget_items": bitems,
        "event_tables": tbls,
        "guest_seat_assignments": seats,
        "guest_check_ins": chkins,
    }
    summary["verifiedCounts"] = verified_counts
    summary["verifiedTotalRecords"] = invs + gsts + rsvps + gifts + bdgs + bitems + tbls + seats + chkins

    print("\n" + "=" * 60)
    print("DEMO SEEDING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
