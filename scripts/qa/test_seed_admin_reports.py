"""Checks for deterministic report scenarios and development database boundaries."""

from collections import Counter
from datetime import date
from decimal import Decimal
import importlib.util
from pathlib import Path
import sys
import tempfile
import unittest


SOURCE = Path(__file__).resolve().parents[1] / "maintenance/seed-admin-reports.py"
SPEC = importlib.util.spec_from_file_location("seed_admin_reports", SOURCE)
seed = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = seed
SPEC.loader.exec_module(seed)


class AdminReportSeedTests(unittest.TestCase):
    def packages(self):
        return [{"id": index, "code": code, "price": Decimal(price), "currency": "USD"}
                for index, code, price in ((1, "BASIC", ".01"), (2, "PRO", "199"), (3, "PREMIUM", "499"))]

    def test_fifty_unique_scenarios_cover_both_payment_types_and_exception_cases(self):
        _, _, scenarios = seed.fixtures(date(2026, 10, 16), self.packages())
        self.assertEqual(50, len({record["key"] for record in scenarios}))
        self.assertEqual({"TEMPLATE": 25, "SUBSCRIPTION": 25}, dict(Counter(record["product"] for record in scenarios)))
        self.assertEqual(5, sum(record["case"] == 7 for record in scenarios))
        self.assertEqual(5, sum(record["confirm_source"] == "BROWSER_CLAIM" for record in scenarios))
        self.assertEqual({"USD", "KHR"}, {record["currency"] for record in scenarios})

    def test_subscription_prices_come_from_the_catalog(self):
        packages = self.packages()
        packages[1]["price"] = Decimal("201.37")
        _, _, scenarios = seed.fixtures(date(2026, 10, 16), packages)
        pro = [record for record in scenarios if record["product"] == "SUBSCRIPTION" and record["package"]["code"] == "PRO"]
        self.assertTrue(pro)
        self.assertTrue(all(record["amount"] == Decimal("201.37") for record in pro))

    def test_all_subscriptions_use_exact_thirty_day_windows_and_expired_cases_are_historical(self):
        anchor, _, scenarios = seed.fixtures(date(2026, 10, 16), self.packages())
        for record in scenarios:
            if record["case"] == 1:
                self.assertGreater(record["created"] + seed.timedelta(days=30), anchor)
            if record["case"] == 9:
                self.assertLess(record["created"] + seed.timedelta(days=30), anchor)

    def test_seed_is_repeatable_insert_only_and_has_no_external_payment_or_notification_calls(self):
        first, _ = seed.build_seed(date(2026, 10, 16), self.packages())
        second, _ = seed.build_seed(date(2026, 10, 16), self.packages())
        self.assertEqual(first, second)
        self.assertNotIn("UPDATE ", first)
        self.assertNotIn("DELETE ", first)
        self.assertNotIn("DROP ", first)
        self.assertIn("START TRANSACTION;", first)
        self.assertIn("COMMIT;", first)
        _, templates, _ = seed.fixtures(date(2026, 10, 16), self.packages())
        self.assertTrue(all(template["status"] == "INACTIVE" for template in templates))

    def test_sql_strings_preserve_quotes_backslashes_and_unicode(self):
        value = "QA's \\ Khmer \u1781\u17d2\u1798\u17c2\u179a"
        self.assertEqual("'QA''s \\ Khmer \u1781\u17d2\u1798\u17c2\u179a'", seed.literal(value))

    def test_rejects_remote_databases_and_production_profiles(self):
        with tempfile.TemporaryDirectory() as directory:
            env_file = Path(directory) / ".env"
            for host, profile in (("db.example.com", "dev"), ("localhost", "prod"), ("localhost", "dev,prod")):
                with self.subTest(host=host, profile=profile):
                    env_file.write_text(f"DB_URL=jdbc:mysql://{host}:3306/koupreng_db\nSPRING_PROFILES_ACTIVE={profile}\n")
                    with self.assertRaises(ValueError):
                        seed.configuration(env_file)


if __name__ == "__main__":
    unittest.main()
