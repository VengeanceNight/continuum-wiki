#!/home/ken/.venvs/rpg-tools/bin/python3
"""Table-tent QR card for the Victory Pints table (Bob, 2026-10-12).

One Letter sheet at 300 dpi, folded across the middle; the top half is printed
upside down so both sides read the right way up. Edit the defaults below, or pass
--url / --line to change the text, then print the PDF on the Epson (colour dragon):

  ~/continuum-wiki/print/qr_tent.py
  lp -d EPSON_ET_4950 -o media=Letter -o fit-to-page=false ~/sync/images/print_tests/shadowdark_qr_tent.pdf

Needs qrencode (pacman) and Pillow (rpg-tools venv).
"""
import argparse, subprocess, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

URL = "https://shadowdark.crystalcontinuum.org"
BANNER = Path.home() / "obsidian/The Continuum/80_Wiki/shadowdark/shadowdark-banner.png"
# (text, style): style is "head" (bold) or "body"
LINES = [
    ("Old-school fantasy RPG", "head"),
    ("Sunday campaign · Wednesday one-shots", "body"),
    ("New players welcome. No experience needed.", "body"),
]
CALL = "Scan for info & sign-up"
OUT = Path.home() / "sync/images/print_tests/shadowdark_qr_tent.pdf"

W, H = 2550, 1650  # one face: Letter width x half Letter height at 300 dpi
FONT_DIR = "/usr/share/fonts/TTF"


def face(banner, qr, url, lines, call):
    head = ImageFont.truetype(f"{FONT_DIR}/DejaVuSans-Bold.ttf", 78)
    body = ImageFont.truetype(f"{FONT_DIR}/DejaVuSans.ttf", 56)
    small = ImageFont.truetype(f"{FONT_DIR}/DejaVuSans-Bold.ttf", 54)
    im = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(im)
    ban = banner.resize((1700, int(banner.height * 1700 / banner.width)))
    im.paste(ban, ((W - 1700) // 2, 110))
    im.paste(qr.resize((880, 880), Image.NEAREST), (W - 880 - 160, 110 + ban.height + 70))
    y = 110 + ban.height + 120
    for text, style in lines:
        font = head if style == "head" else body
        d.text((150, y), text, font=font, fill="black")
        y += font.size + 50
    d.text((150, y + 60), call, font=head, fill="black")
    d.text((150, y + 180), url.removeprefix("https://"), font=small, fill="#444444")
    return im


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--url", default=URL)
    ap.add_argument("--banner", type=Path, default=BANNER)
    ap.add_argument("--line", action="append", help="replace the text lines (first one is bold); repeatable")
    ap.add_argument("--call", default=CALL, help="the bold line above the address")
    ap.add_argument("--out", type=Path, default=OUT, help=".pdf or .png")
    a = ap.parse_args()
    lines = [(t, "head" if i == 0 else "body") for i, t in enumerate(a.line)] if a.line else LINES

    with tempfile.TemporaryDirectory() as tmp:
        qr_path = Path(tmp) / "qr.png"
        subprocess.run(["qrencode", "-l", "H", "-s", "30", "-m", "2", "-o", qr_path, a.url], check=True)
        qr = Image.open(qr_path).convert("RGBA").convert("RGB")
    f = face(Image.open(a.banner).convert("RGBA").convert("RGB"), qr, a.url, lines, a.call)
    page = Image.new("RGB", (W, H * 2), "white")
    page.paste(f.rotate(180), (0, 0))
    page.paste(f, (0, H))
    ImageDraw.Draw(page).line([(0, H), (W, H)], fill="#bbbbbb", width=3)  # fold line
    a.out.parent.mkdir(parents=True, exist_ok=True)
    page.save(a.out, resolution=300.0) if a.out.suffix == ".pdf" else page.save(a.out, dpi=(300, 300))
    print(f"Wrote {a.out}")


if __name__ == "__main__":
    main()
