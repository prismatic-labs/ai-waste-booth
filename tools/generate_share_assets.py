#!/usr/bin/env python3
# Generate static share pages and Open Graph cards for AI Waste Receipt.

from __future__ import annotations

import hashlib
import html
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://prismatic-labs.github.io/ai-waste-booth"
CARD_W = 1200
CARD_H = 630

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_MONO = "/System/Library/Fonts/Supplemental/Courier New.ttf"
FONT_MONO_BOLD = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"


def load_font(path: str, size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


FONTS = {
    "hero": load_font(FONT_BOLD, 86),
    "hero_small": load_font(FONT_BOLD, 72),
    "body": load_font(FONT_REG, 34),
    "body_small": load_font(FONT_REG, 28),
    "mono": load_font(FONT_MONO, 26),
    "mono_small": load_font(FONT_MONO, 22),
    "mono_bold": load_font(FONT_MONO_BOLD, 28),
}


def slug(value: str) -> str:
    return str(value).lower().replace("_", "-")


def crop_cover(img: Image.Image, w: int, h: int) -> Image.Image:
    img = img.convert("RGB")
    scale = max(w / img.width, h / img.height)
    new_size = (int(img.width * scale), int(img.height * scale))
    img = img.resize(new_size, Image.LANCZOS)
    left = (img.width - w) // 2
    top = (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


def horizontal_scrim(w: int, h: int, left_alpha: int, right_alpha: int) -> Image.Image:
    alpha = Image.new("L", (w, h))
    px = alpha.load()
    for x in range(w):
        amount = int(left_alpha + (right_alpha - left_alpha) * (x / max(w - 1, 1)))
        for y in range(h):
            px[x, y] = amount
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay.putalpha(alpha)
    return overlay


def measure(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    lines = []
    line = ""
    for word in str(text).split():
        candidate = f"{line} {word}".strip()
        if line and measure(draw, candidate, font) > max_width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def draw_wrapped(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], font: ImageFont.ImageFont, fill: str, max_width: int, line_height: int, max_lines: int | None = None) -> int:
    x, y = xy
    lines = wrap(draw, text, font, max_width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        last = lines[-1]
        while last and measure(draw, last + "...", font) > max_width:
            last = last[:-1].rstrip()
        lines[-1] = last + "..."
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += line_height
    return y


def casual_card(archetype: dict) -> Image.Image:
    src = ROOT / "assets" / "archetypes" / f"{archetype['id']}.jpg"
    card = crop_cover(Image.open(src), CARD_W, CARD_H).convert("RGBA")
    card.alpha_composite(horizontal_scrim(CARD_W, CARD_H, 235, 76))
    draw = ImageDraw.Draw(card)

    draw.rectangle((0, 0, CARD_W, 12), fill="#f0e830")
    draw.text((64, 62), "AI WASTE RECEIPT", font=FONTS["mono_bold"], fill="#f0e830")
    draw.text((64, 122), "I got", font=FONTS["body_small"], fill="#ffffff")

    title_font = FONTS["hero"] if len(archetype["name"]) < 24 else FONTS["hero_small"]
    y = draw_wrapped(draw, archetype["name"], (64, 162), title_font, "#ffffff", 720, 82, 3)
    y += 20
    draw_wrapped(draw, archetype["oneLiner"], (64, y), FONTS["body"], "#dddddd", 790, 43, 3)

    draw.text((64, CARD_H - 88), "Which one are you?", font=FONTS["body_small"], fill="#ffffff")
    draw.text((64, CARD_H - 48), "prismatic-labs.github.io/ai-waste-booth", font=FONTS["mono_small"], fill="#f0e830")
    return card.convert("RGB")


def builder_card(pattern: dict) -> Image.Image:
    card = Image.new("RGB", (CARD_W, CARD_H), "#0d1117")
    draw = ImageDraw.Draw(card)
    draw.rectangle((0, 0, CARD_W, 12), fill="#30f0c0")
    for x in range(0, CARD_W, 48):
        draw.line((x, 0, x, CARD_H), fill="#102526", width=1)
    for y in range(0, CARD_H, 48):
        draw.line((0, y, CARD_W, y), fill="#102526", width=1)

    draw.text((64, 74), "SILENT FAILURE RECEIPT", font=FONTS["mono_bold"], fill="#30f0c0")
    draw.text((64, 144), pattern["id"], font=FONTS["mono"], fill="#4a9a9a")
    y = draw_wrapped(draw, pattern["name"], (64, 198), FONTS["hero_small"], "#ffffff", 880, 78, 2)
    y += 30
    draw_wrapped(draw, pattern["risk"], (64, y), FONTS["body"], "#c0cfd0", 900, 44, 3)

    draw.line((64, CARD_H - 128, CARD_W - 64, CARD_H - 128), fill="#1e3a3a", width=3)
    draw.text((64, CARD_H - 86), "Is your system failing silently?", font=FONTS["body_small"], fill="#ffffff")
    draw.text((64, CARD_H - 48), "prismatic-labs.github.io/ai-waste-booth", font=FONTS["mono_small"], fill="#30f0c0")
    return card


def home_card() -> Image.Image:
    card = Image.new("RGB", (CARD_W, CARD_H), "#0a0a0a")
    draw = ImageDraw.Draw(card)
    draw.rectangle((0, 0, CARD_W, 12), fill="#f0e830")
    draw.text((64, 82), "PRISMATIC LABS", font=FONTS["mono_bold"], fill="#888888")
    draw_wrapped(draw, "AI Waste Receipt", (64, 170), FONTS["hero"], "#f0e830", 900, 92, 2)
    draw_wrapped(draw, "Find your AI waste archetype - or spot silent inference waste in your AI system.", (64, 360), FONTS["body"], "#e8e8e8", 920, 44, 3)
    draw.text((64, CARD_H - 64), "prismatic-labs.github.io/ai-waste-booth", font=FONTS["mono_small"], fill="#f0e830")
    return card


def asset_version(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12]


def share_page(item: dict, kind: str, page_slug: str, image_version: str) -> str:
    if kind == "casual":
        og_title = f"I got {item['name']}"
        desc = item["oneLiner"]
        eyebrow = "AI WASTE RECEIPT"
        cta = "Find your archetype"
        intro = "Find out which AI waste archetype is yours."
        accent = "#f0e830"
    else:
        og_title = f"Silent Failure: {item['name']}"
        desc = item["risk"]
        eyebrow = item["id"]
        cta = "Check your AI system"
        intro = "Spot the silent waste patterns hiding in production AI."
        accent = "#30f0c0"

    url = f"{BASE_URL}/share/{page_slug}/"
    image = f"{BASE_URL}/share/cards/{page_slug}.png?v={image_version}"
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0a0a0a">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{html.escape(og_title)}">
  <meta property="og:description" content="{html.escape(desc)}">
  <meta property="og:url" content="{html.escape(url)}">
  <meta property="og:image" content="{html.escape(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{html.escape(og_title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(og_title)}">
  <meta name="twitter:description" content="{html.escape(desc)}">
  <meta name="twitter:image" content="{html.escape(image)}">
  <link rel="canonical" href="{html.escape(url)}">
  <title>{html.escape(og_title)} - Prismatic Labs</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{ margin: 0; min-height: 100dvh; background: #0a0a0a; color: #e8e8e8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: grid; place-items: center; padding: 24px; }}
    main {{ width: min(100%, 720px); }}
    .mark {{ font-family: "Courier New", monospace; font-size: 11px; letter-spacing: 2px; color: #777; margin: 0 0 18px; }}
    img {{ display: block; width: 100%; border: 1px solid #2a2a2a; border-radius: 8px; background: #111; }}
    h1 {{ font-size: clamp(32px, 8vw, 54px); line-height: 1; letter-spacing: 0; margin: 24px 0 10px; color: {accent}; }}
    p {{ color: #aaa; font-size: 17px; line-height: 1.5; margin: 0 0 22px; }}
    a {{ display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 22px; border-radius: 6px; background: {accent}; color: #000; font-weight: 800; text-decoration: none; }}
    .eyebrow {{ display: block; margin-top: 20px; color: #888; font-family: "Courier New", monospace; font-size: 12px; letter-spacing: 2px; }}
  </style>
</head>
<body>
  <main>
    <p class="mark">PRISMATIC LABS</p>
    <img src="../cards/{page_slug}.png" alt="{html.escape(og_title)}">
    <span class="eyebrow">{html.escape(eyebrow)}</span>
    <h1>{html.escape(og_title)}</h1>
    <p>{html.escape(intro)}</p>
    <a href="{BASE_URL}/">{html.escape(cta)}</a>
  </main>
</body>
</html>
'''


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    archetypes = json.loads((ROOT / "content" / "archetypes.json").read_text(encoding="utf-8"))
    patterns = json.loads((ROOT / "content" / "patterns.json").read_text(encoding="utf-8"))
    cards_dir = ROOT / "share" / "cards"
    cards_dir.mkdir(parents=True, exist_ok=True)

    home_card().save(cards_dir / "ai-waste-receipt.png")

    for archetype in archetypes:
        page_slug = slug(archetype["id"])
        card_path = cards_dir / f"{page_slug}.png"
        casual_card(archetype).save(card_path)
        write(ROOT / "share" / page_slug / "index.html", share_page(archetype, "casual", page_slug, asset_version(card_path)))

    for pattern in patterns:
        page_slug = slug(pattern["id"])
        card_path = cards_dir / f"{page_slug}.png"
        builder_card(pattern).save(card_path)
        write(ROOT / "share" / page_slug / "index.html", share_page(pattern, "builder", page_slug, asset_version(card_path)))


if __name__ == "__main__":
    main()
