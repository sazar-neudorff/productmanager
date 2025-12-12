from __future__ import annotations

import os
from datetime import date
from typing import Any, Dict, Iterable, Iterator, List, Mapping, MutableMapping, Optional

import requests

FilterMapping = Mapping[str, Any]


class WeclappClientError(RuntimeError):
    """Raised when the Weclapp API returns an unexpected response."""


class MissingConfigurationError(RuntimeError):
    """Raised when the client cannot resolve required environment variables."""


class WeclappClient:
    """Tiny helper around the weclapp REST API."""

    DEFAULT_TIMEOUT = 30
    DEFAULT_PAGE_SIZE = 100

    def __init__(
        self,
        base_url: str,
        api_token: str,
        *,
        timeout: int = DEFAULT_TIMEOUT,
        page_size: int = DEFAULT_PAGE_SIZE,
        session: Optional[requests.Session] = None,
    ) -> None:
        if not base_url:
            raise ValueError("base_url is required")
        if not api_token:
            raise ValueError("api_token is required")

        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.page_size = page_size
        self.session = session or requests.Session()
        self.session.headers.update(
            {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "AuthenticationToken": api_token,
            }
        )

    @classmethod
    def from_env(cls) -> "WeclappClient":
        base_url = os.getenv("WECLAPP_BASE_URL")
        token = os.getenv("WECLAPP_API_TOKEN")
        if not base_url or not token:
            raise MissingConfigurationError(
                "WECLAPP_BASE_URL and WECLAPP_API_TOKEN must be set in the environment"
            )
        return cls(base_url=base_url, api_token=token)

    def fetch_orders(
        self,
        *,
        start_date: date,
        end_date: date,
        distribution_channels: Iterable[str],
    ) -> List[Dict[str, Any]]:
        filters: FilterMapping = {
            "docDate__ge": start_date,
            "docDate__le": end_date,
            "distributionChannelName__in": list(distribution_channels),
        }
        return list(self.iter_entities("salesOrder", filters=filters))

    def fetch_positions(
        self,
        *,
        start_date: date,
        end_date: date,
        distribution_channels: Iterable[str],
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        filters: Dict[str, Any] = {
            "docDate__ge": start_date,
            "docDate__le": end_date,
            "distributionChannelName__in": list(distribution_channels),
        }
        if status:
            filters["status__eq"] = status
        return list(self.iter_entities("salesOrderPosition", filters=filters))

    def iter_entities(
        self,
        resource: str,
        *,
        filters: Optional[FilterMapping] = None,
        extra_params: Optional[MutableMapping[str, Any]] = None,
    ) -> Iterator[Dict[str, Any]]:
        params: MutableMapping[str, Any] = {
            "pageSize": self.page_size,
            **(extra_params or {}),
        }
        params.update(build_filter_params(filters or {}))

        page = 1
        while True:
            params["page"] = page
            payload = self._request("GET", resource, params=params)
            entities = _extract_entities(payload)
            for entity in entities:
                yield entity

            total_pages = _extract_total_pages(payload)
            if page >= total_pages:
                break
            page += 1

    def _request(
        self,
        method: str,
        resource: str,
        *,
        params: Optional[Mapping[str, Any]] = None,
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/{resource.lstrip('/')}"
        response = self.session.request(method, url, params=params, timeout=self.timeout)
        if response.status_code >= 400:
            raise WeclappClientError(
                f"HTTP {response.status_code} error for {url}: {response.text[:200]}"
            )
        data: Dict[str, Any] = response.json()
        return data


def build_filter_params(filters: FilterMapping) -> Dict[str, Any]:
    """Translate a tiny DSL into weclapp-style filter parameters."""

    encoded: Dict[str, Any] = {}
    for raw_key, value in filters.items():
        if value is None:
            continue

        field, _, operation = raw_key.partition("__")
        if isinstance(value, date):
            value = value.isoformat()

        if operation == "in":
            if isinstance(value, str) or not isinstance(value, Iterable):
                iterable = [value]
            else:
                iterable = list(value)
            for index, item in enumerate(iterable):
                encoded[f"filter[{field}][in][{index}]"] = item
        elif operation:
            encoded[f"filter[{field}][{operation}]"] = value
        else:
            encoded[f"filter[{field}][eq]"] = value
    return encoded


def _extract_entities(payload: Mapping[str, Any]) -> List[Dict[str, Any]]:
    for key in ("result", "entities", "rows"):
        if key in payload and isinstance(payload[key], list):
            return payload[key]  # type: ignore[return-value]
    if isinstance(payload, dict):
        # Single entity response
        return [payload]  # type: ignore[list-item]
    raise WeclappClientError("Unexpected response payload structure")


def _extract_total_pages(payload: Mapping[str, Any]) -> int:
    for key in ("totalPages", "totalpages"):
        if key in payload:
            return int(payload[key])
    meta = payload.get("meta") if isinstance(payload, Mapping) else None
    if isinstance(meta, Mapping) and "totalPages" in meta:
        return int(meta["totalPages"])
    return 1
