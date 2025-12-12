from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

from app.services.weclapp_export import WeclappExporter


def parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"Invalid date '{value}': {exc}") from exc


def main() -> None:
    parser = argparse.ArgumentParser(description="Export filtered weclapp orders to CSV")
    parser.add_argument("--start-date", type=parse_date, help="ISO date (YYYY-MM-DD)")
    parser.add_argument("--end-date", type=parse_date, help="ISO date (YYYY-MM-DD)")
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional output path. Defaults to backend/exports/weclapp_orders_<range>.csv",
    )
    args = parser.parse_args()

    exporter = WeclappExporter()
    output_path = args.output.resolve() if args.output else None
    result = exporter.export(start_date=args.start_date, end_date=args.end_date, output_path=output_path)
    print(
        f"Weclapp export complete: {result.rows_written} rows written for "
        f"{result.start_date:%Y-%m-%d} – {result.end_date:%Y-%m-%d}\n"
        f"File: {result.output_path}"
    )


if __name__ == "__main__":
    main()
