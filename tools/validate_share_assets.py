#!/usr/bin/env python3
# Validate generated share pages and cards match canonical content.

from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://prismatic-labs.github.io/ai-waste-booth"


def slug(value: str) -> str:
    return str(value).lower().replace("_", "-")


def asset_version(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12]


def assert_contains(path: Path, expected: str) -> None:
    text = path.read_text(encoding="utf-8")
    if expected not in text:
        raise AssertionError(f"{path} is missing expected text: {expected}")


def validate_item(item: dict, description: str) -> None:
    page_slug = slug(item["id"])
    card_path = ROOT / "share" / "cards" / f"{page_slug}.png"
    page_path = ROOT / "share" / page_slug / "index.html"

    if not card_path.exists():
        raise AssertionError(f"Missing card: {card_path}")
    if not page_path.exists():
        raise AssertionError(f"Missing page: {page_path}")

    version = asset_version(card_path)
    image_url = f"{BASE_URL}/share/cards/{page_slug}.png?v={version}"
    assert_contains(page_path, f'<meta property="og:image" content="{image_url}">')
    assert_contains(page_path, f'<meta name="twitter:image" content="{image_url}">')
    assert_contains(page_path, description)


def main() -> None:
    archetypes = json.loads((ROOT / "content" / "archetypes.json").read_text(encoding="utf-8"))
    patterns = json.loads((ROOT / "content" / "patterns.json").read_text(encoding="utf-8"))

    for archetype in archetypes:
        validate_item(archetype, archetype["oneLiner"])

    for pattern in patterns:
        validate_item(pattern, pattern["risk"])

    data_text = (ROOT / "receipt-engine" / "data.js").read_text(encoding="utf-8")
    if "const ARCHETYPES_DATA = [" not in data_text:
        raise AssertionError("receipt-engine/data.js does not look generated")

    print("share assets OK")


if __name__ == "__main__":
    main()
