"""Local JSONL audit trail with no environment or credential capture."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


class AuditLog:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, run_id: str, event: str, details: dict[str, Any] | None = None) -> None:
        payload = {
            "timestamp": datetime.now(UTC).isoformat(),
            "run_id": run_id,
            "event": event,
            "details": details or {},
        }
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")

