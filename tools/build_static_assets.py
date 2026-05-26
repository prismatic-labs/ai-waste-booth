#!/usr/bin/env python3
# Rebuild generated app data and static social share assets.

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(script: str) -> None:
    subprocess.run([sys.executable, str(ROOT / "tools" / script)], cwd=ROOT, check=True)


def main() -> None:
    run("generate_data_js.py")
    run("generate_share_assets.py")


if __name__ == "__main__":
    main()
