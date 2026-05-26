#!/usr/bin/env python3
# Generate receipt-engine/data.js from canonical JSON content.

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_json(name: str) -> object:
    return json.loads((ROOT / "content" / name).read_text(encoding="utf-8"))


def js_const(name: str, value: object) -> str:
    body = json.dumps(value, ensure_ascii=False, indent=2)
    return f"const {name} = {body};"


def main() -> None:
    chunks = [
        "/* data.js - generated from content/*.json for file:// offline compat */",
        "",
        js_const("ARCHETYPES_DATA", read_json("archetypes.json")),
        "",
        js_const("PATTERNS_DATA", read_json("patterns.json")),
        "",
        js_const("QUIZ_DATA", read_json("quiz.json")),
        "",
    ]
    (ROOT / "receipt-engine" / "data.js").write_text("\n".join(chunks), encoding="utf-8")


if __name__ == "__main__":
    main()
