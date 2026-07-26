"""Tolerant JSON extraction for provider wrappers."""

from __future__ import annotations

import json
from typing import Any


def extract_json(value: str) -> Any:
    stripped = value.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    if "```" in stripped:
        for block in stripped.split("```"):
            candidate = block.strip()
            if candidate.startswith("json"):
                candidate = candidate[4:].strip()
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

    starts = [index for index in (stripped.find("{"), stripped.find("[")) if index >= 0]
    if starts:
        start = min(starts)
        decoder = json.JSONDecoder()
        parsed, _ = decoder.raw_decode(stripped[start:])
        return parsed
    raise ValueError("No JSON value found in model output")

