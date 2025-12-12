from __future__ import annotations

import csv
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence
import unicodedata

from .weclapp_client import WeclappClient

ALLOWED_CHANNELS: Sequence[str] = (
    "Shop DE netto",
    "Shop AT netto",
    "Shop DE brutto",
    "Shop AT brutto",
    "Ebay brutto",
    "Otto brutto",
    "Kaufland brutto",
    "Kaufland netto",
    "Amazon FBA brutto",
    "Amazon FBM brutto",
    "bol.com netto",
    "bol.com brutto",
)

EXCLUDED_ARTICLE_KEYWORDS: Sequence[str] = (
    "impragnol",
    "impraegnol",
    "bb",
    "sneakerasers",
    "heitmann",
    "wenco",
    "roundup",
    "bootbananas",
)

MIN_UNIT_PRICE = Decimal("0.01")
CSV_FIELDNAMES = (
    "Auftragsnummer",
    "Auftragsdatum",
    "Vertriebsweg",
    "Land",
    "PLZ",
    "Anzahl Positionen",
    "Nettobetrag",
    "Shop/Marktplatz",
    "Artikel",
    "Positionen",
    "Währung",
)
DEFAULT_EXPORT_DIR = Path(__file__).resolve().parents[2] / "exports"


@dataclass
class ExportResult:
    output_path: Path
    rows_written: int
    start_date: date
    end_date: date


def compute_reporting_window(reference: Optional[date] = None, *, offset_weeks: int = 2) -> tuple[date, date]:
    reference = reference or date.today()
    iso_year, iso_week, _ = reference.isocalendar()
    target_week = iso_week - offset_weeks
    target_year = iso_year

    while target_week <= 0:
        target_year -= 1
        weeks_previous_year = date(target_year, 12, 28).isocalendar().week
        target_week += weeks_previous_year

    start = date.fromisocalendar(target_year, target_week, 1)
    end = date.fromisocalendar(target_year, target_week, 7)
    return start, end


class WeclappExporter:
    def __init__(
        self,
        client: Optional[WeclappClient] = None,
        *,
        allowed_channels: Sequence[str] = ALLOWED_CHANNELS,
    ) -> None:
        self.client = client or WeclappClient.from_env()
        self.allowed_channels = allowed_channels

    def export(
        self,
        *,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        output_path: Optional[Path] = None,
    ) -> ExportResult:
        start, end = determine_window(start_date, end_date)
        orders = self.client.fetch_orders(
            start_date=start,
            end_date=end,
            distribution_channels=self.allowed_channels,
        )
        positions = self.client.fetch_positions(
            start_date=start,
            end_date=end,
            distribution_channels=self.allowed_channels,
            status="abgeschlossen",
        )
        rows = prepare_order_rows(
            orders=orders,
            positions=positions,
            start_date=start,
            end_date=end,
            allowed_channels=self.allowed_channels,
        )
        target_path = output_path or build_default_output_path(start, end)
        write_csv(rows, target_path)
        return ExportResult(output_path=target_path, rows_written=len(rows), start_date=start, end_date=end)


def determine_window(start_date: Optional[date], end_date: Optional[date]) -> tuple[date, date]:
    if start_date and end_date:
        return start_date, end_date
    if start_date and not end_date:
        end_date = start_date + timedelta(days=6)
        return start_date, end_date
    if end_date and not start_date:
        start_date = end_date - timedelta(days=6)
        return start_date, end_date
    return compute_reporting_window()


def build_default_output_path(start: date, end: date) -> Path:
    DEFAULT_EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"weclapp_orders_{start:%Y%m%d}_{end:%Y%m%d}.csv"
    return DEFAULT_EXPORT_DIR / filename


def prepare_order_rows(
    *,
    orders: Sequence[Mapping[str, Any]],
    positions: Sequence[Mapping[str, Any]],
    start_date: date,
    end_date: date,
    allowed_channels: Sequence[str] = ALLOWED_CHANNELS,
) -> List[Dict[str, Any]]:
    positions_by_order: MutableMapping[str, List[Mapping[str, Any]]] = defaultdict(list)
    for position in positions:
        if not position_passes_filters(position, allowed_channels=allowed_channels, start_date=start_date, end_date=end_date):
            continue
        order_number = extract_order_number(position)
        if not order_number:
            continue
        positions_by_order[order_number].append(position)

    export_rows: List[Dict[str, Any]] = []
    for order in orders:
        if not order_passes_filters(order, allowed_channels=allowed_channels, start_date=start_date, end_date=end_date):
            continue
        order_number = extract_order_number(order)
        if not order_number:
            continue
        order_positions = positions_by_order.get(order_number, [])
        if not order_positions:
            continue
        row = build_order_row(order, order_positions)
        export_rows.append(row)

    export_rows.sort(key=lambda row: (row["Auftragsdatum"], row["Auftragsnummer"]))
    return export_rows


def order_passes_filters(
    order: Mapping[str, Any],
    *,
    allowed_channels: Sequence[str],
    start_date: date,
    end_date: date,
) -> bool:
    channel = extract_distribution_channel(order)
    if channel not in allowed_channels:
        return False
    order_date = extract_date(order)
    if order_date and (order_date < start_date or order_date > end_date):
        return False
    return True


def position_passes_filters(
    position: Mapping[str, Any],
    *,
    allowed_channels: Sequence[str],
    start_date: date,
    end_date: date,
) -> bool:
    channel = extract_distribution_channel(position)
    if channel not in allowed_channels:
        return False

    status = normalize_token(extract_status(position) or "")
    if status and "abgeschlossen" not in status and "completed" not in status:
        return False

    article_number = extract_article_number(position)
    if not article_number or str(article_number).strip() in {"", "-"}:
        return False

    article_name = (position.get("articleName") or position.get("productName") or "").strip()
    if article_name and not article_name_allowed(article_name):
        return False

    unit_price = extract_unit_price(position)
    if unit_price < MIN_UNIT_PRICE:
        return False

    position_date = extract_date(position)
    if position_date and (position_date < start_date or position_date > end_date):
        return False

    return True


def article_name_allowed(name: str) -> bool:
    normalized = normalize_token(name)
    return not any(keyword in normalized for keyword in EXCLUDED_ARTICLE_KEYWORDS)


def normalize_token(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    normalized = normalized.encode("ascii", "ignore").decode("ascii")
    return normalized.lower()


def extract_distribution_channel(record: Mapping[str, Any]) -> Optional[str]:
    candidates = (
        "distributionChannelName",
        "salesChannelName",
        "shopName",
        "marketplace",
        "marketplaceName",
    )
    for key in candidates:
        value = record.get(key)
        if isinstance(value, Mapping):
            nested = value.get("name") or value.get("value")
            if nested:
                return str(nested)
        if value:
            return str(value)
    return None


def extract_status(record: Mapping[str, Any]) -> Optional[str]:
    value = record.get("status") or record.get("statusName")
    if isinstance(value, Mapping):
        return str(value.get("name") or value.get("value") or "")
    if value:
        return str(value)
    return None


def extract_article_number(record: Mapping[str, Any]) -> Optional[str]:
    for key in ("articleNumber", "productNumber", "sku", "itemNumber"):
        value = record.get(key)
        if value:
            return str(value)
    return None


def extract_order_number(record: Mapping[str, Any]) -> Optional[str]:
    for key in ("orderNumber", "number", "documentNumber", "salesOrderNumber"):
        value = record.get(key)
        if value:
            return str(value)
    return None


def extract_date(record: Mapping[str, Any]) -> Optional[date]:
    for key in ("orderDate", "docDate", "createdDate", "deliveryDate"):
        value = record.get(key)
        parsed = parse_date(value)
        if parsed:
            return parsed
    return None


def parse_date(value: Any) -> Optional[date]:
    if not value:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    text = str(value)
    if "T" in text:
        text = text.split("T", 1)[0]
    try:
        return date.fromisoformat(text)
    except ValueError:
        return None


def extract_unit_price(position: Mapping[str, Any]) -> Decimal:
    for key in ("unitPriceNet", "unitPrice", "unitPriceGross", "price"):
        value = position.get(key)
        amount = to_decimal(value)
        if amount > Decimal(0):
            return amount
    net_value = to_decimal(position.get("netValue") or position.get("netAmount"))
    quantity = extract_quantity(position)
    if quantity > Decimal(0):
        return (net_value / quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return Decimal(0)


def extract_quantity(position: Mapping[str, Any]) -> Decimal:
    for key in ("quantity", "orderedQuantity", "amount"):
        value = position.get(key)
        qty = to_decimal(value)
        if qty > Decimal(0):
            return qty
    return Decimal(0)


def build_order_row(order: Mapping[str, Any], positions: Sequence[Mapping[str, Any]]) -> Dict[str, Any]:
    order_date = extract_date(order)
    channel = extract_distribution_channel(order) or ""
    country = order.get("shipToCountry") or order.get("country") or ""
    postal_code = order.get("shipToZip") or order.get("zip") or ""
    marketplace = (
        order.get("marketplace")
        or order.get("marketplaceName")
        or order.get("shopName")
        or order.get("salesChannelName")
        or channel
    )
    currency = order.get("currency") or positions[0].get("currency") or "EUR"

    net_total = Decimal(0)
    article_names: List[str] = []
    position_snippets: List[str] = []
    for position in positions:
        net_amount = to_decimal(position.get("netValue") or position.get("netAmount"))
        if net_amount == 0:
            quantity = extract_quantity(position)
            net_amount = extract_unit_price(position) * quantity
        net_total += net_amount
        name = position.get("articleName") or position.get("productName")
        if name:
            article_names.append(str(name))
        snippet = build_position_snippet(position)
        position_snippets.append(snippet)

    article_summary = ", ".join(sorted(set(article_names)))
    row = {
        "Auftragsnummer": extract_order_number(order) or "",
        "Auftragsdatum": order_date.strftime("%Y-%m-%d") if order_date else "",
        "Vertriebsweg": channel,
        "Land": str(country),
        "PLZ": str(postal_code),
        "Anzahl Positionen": len(positions),
        "Nettobetrag": format_decimal(net_total),
        "Shop/Marktplatz": str(marketplace),
        "Artikel": article_summary,
        "Positionen": " | ".join(position_snippets),
        "Währung": str(currency or "EUR"),
    }
    return row


def build_position_snippet(position: Mapping[str, Any]) -> str:
    article_number = extract_article_number(position) or "-"
    article_name = position.get("articleName") or position.get("productName") or ""
    quantity = extract_quantity(position)
    unit_price = extract_unit_price(position)
    gross_value = to_decimal(position.get("grossValue") or position.get("grossAmount"))
    status = extract_status(position) or ""
    parts = [
        f"{article_number}: {article_name}",
        f"Menge {format_decimal(quantity)}",
        f"Preis {format_decimal(unit_price)}",
    ]
    if gross_value > 0:
        parts.append(f"Brutto {format_decimal(gross_value)}")
    if status:
        parts.append(f"Status {status}")
    return ", ".join(part for part in parts if part)


def write_csv(rows: Sequence[Mapping[str, Any]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDNAMES, delimiter="\t")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def to_decimal(value: Any) -> Decimal:
    if value is None:
        return Decimal(0)
    if isinstance(value, Decimal):
        return value
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return Decimal(0)


def format_decimal(value: Decimal) -> str:
    quantized = value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return f"{quantized:.2f}"
