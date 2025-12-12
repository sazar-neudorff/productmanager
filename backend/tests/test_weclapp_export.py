from __future__ import annotations

import sys
import unittest
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.weclapp_export import (  # noqa: E402
    ALLOWED_CHANNELS,
    compute_reporting_window,
    position_passes_filters,
    prepare_order_rows,
)


class WeclappExportTests(unittest.TestCase):
    def test_compute_reporting_window_two_weeks_back(self) -> None:
        start, end = compute_reporting_window(date(2025, 1, 20))
        self.assertEqual(start, date(2025, 1, 6))
        self.assertEqual(end, date(2025, 1, 12))

    def test_position_filters_exclude_blocked_articles(self) -> None:
        start = date(2025, 1, 6)
        end = date(2025, 1, 12)
        base_position = {
            "distributionChannelName": ALLOWED_CHANNELS[0],
            "status": "abgeschlossen",
            "articleNumber": "SKU-1",
            "articleName": "Green Cleaner",
            "unitPriceNet": "2.50",
            "quantity": 1,
            "orderDate": "2025-01-07",
        }
        self.assertTrue(
            position_passes_filters(
                base_position,
                allowed_channels=ALLOWED_CHANNELS,
                start_date=start,
                end_date=end,
            )
        )

        blocked = {**base_position, "articleName": "Imprägnol Spray"}
        self.assertFalse(
            position_passes_filters(
                blocked,
                allowed_channels=ALLOWED_CHANNELS,
                start_date=start,
                end_date=end,
            )
        )

    def test_prepare_order_rows_aggregates_positions(self) -> None:
        start = date(2025, 1, 6)
        end = date(2025, 1, 12)
        orders = [
            {
                "orderNumber": "A-100",
                "orderDate": "2025-01-07",
                "distributionChannelName": ALLOWED_CHANNELS[0],
                "shipToCountry": "DE",
                "shipToZip": "12345",
                "currency": "EUR",
            }
        ]
        positions = [
            {
                "salesOrderNumber": "A-100",
                "distributionChannelName": ALLOWED_CHANNELS[0],
                "status": "abgeschlossen",
                "articleNumber": "SKU-1",
                "articleName": "Garden Tool",
                "unitPriceNet": "10.00",
                "quantity": 2,
                "orderDate": "2025-01-07",
                "currency": "EUR",
            },
            {
                "salesOrderNumber": "A-100",
                "distributionChannelName": ALLOWED_CHANNELS[0],
                "status": "abgeschlossen",
                "articleNumber": "SKU-2",
                "articleName": "Soil Mix",
                "unitPriceNet": "5.00",
                "quantity": 1,
                "orderDate": "2025-01-07",
                "currency": "EUR",
            },
        ]

        rows = prepare_order_rows(
            orders=orders,
            positions=positions,
            start_date=start,
            end_date=end,
            allowed_channels=ALLOWED_CHANNELS,
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row["Auftragsnummer"], "A-100")
        self.assertEqual(row["Anzahl Positionen"], 2)
        self.assertEqual(row["Nettobetrag"], "25.00")
        self.assertIn("Garden Tool", row["Artikel"])
        self.assertIn("SKU-1", row["Positionen"])


if __name__ == "__main__":
    unittest.main()
