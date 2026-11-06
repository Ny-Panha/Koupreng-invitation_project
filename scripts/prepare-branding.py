"""Reproduce web derivatives from the approved transparent logo (requires Pillow).

The supplied artwork is never redrawn or recolored. Run from the repository root.
"""
from pathlib import Path
import hashlib
import json
import shutil

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
USER = ROOT / "apps/frontend-user/public/branding"
ADMIN = ROOT / "apps/frontend-admin/public/branding"
SOURCE = USER / "png/koupreng-logo-original-transparent.png"
WIDTHS = (128, 160, 192, 256, 320, 384, 480, 640)


def main():
    artwork = Image.open(SOURCE).convert("RGBA")
    (USER / "icons").mkdir(exist_ok=True)
    # The upper-left envelope, heart, notification rays and attached gold ribbon.
    # This region contains no Khmer lettering; preserve its original RGBA pixels.
    # Separate the envelope at the original ribbon's occlusion edge; no partial
    # lettering, foliage or square crop edges are included in the app icon.
    mask = Image.new("L", artwork.size)
    ImageDraw.Draw(mask).polygon([(300, 0), (690, 0), (720, 197),
        (700, 207), (668, 210), (637, 216), (607, 226), (577, 239),
        (549, 252), (522, 269), (495, 288), (471, 299), (435, 290),
        (395, 245), (360, 145), (300, 140)], fill=255)
    envelope = artwork.copy()
    envelope.putalpha(ImageChops.multiply(artwork.getchannel("A"), mask))
    symbol = envelope.crop((300, 0, 720, 300))
    for size in (16, 32, 48, 180, 192, 512):
        fitted = symbol.copy()
        fitted.thumbnail((round(size * .9), round(size * .9)), Image.Resampling.LANCZOS)
        square = Image.new("RGBA", (size, size))
        square.alpha_composite(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
        square.save(USER / f"icons/icon-{size}.png", optimize=True)
    Image.open(USER / "icons/icon-48.png").save(
        USER / "icons/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for width in (192, 384, 640):
        image = artwork.resize((width, round(width * artwork.height / artwork.width)), Image.Resampling.LANCZOS)
        image.save(USER / f"png/koupreng-logo-{width}w-transparent.png", optimize=True)
    # Opaque OG cards are separate from the transparent UI logo. Keep generous
    # clear space; no extra text or altered artwork is baked into the image.
    social = Image.new("RGB", (1200, 630), "#faf7f0")
    mark = artwork.resize((880, round(880 * artwork.height / artwork.width)), Image.Resampling.LANCZOS)
    social.paste(mark, ((1200 - mark.width) // 2, (630 - mark.height) // 2), mark)
    social.save(USER / "social-card.jpg", quality=90, optimize=True)

    paths = [f"webp/koupreng-logo-{w}w.webp" for w in WIDTHS]
    paths += [f"png/koupreng-logo-{w}w-transparent.png" for w in (192, 384, 640)]
    paths += [str(p.relative_to(USER)).replace("\\", "/") for p in (USER / "icons").iterdir()]
    paths += ["social-card.jpg"]
    generated = []
    for relative in paths:
        path = USER / relative
        target = ADMIN / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)
        generated.append({"path": relative, "bytes": path.stat().st_size,
                          "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    manifest = {"source": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
                "source_dimensions": list(artwork.size), "symbol_crop": [300, 0, 720, 300],
                "symbol_mask": "Envelope isolated at the original ribbon occlusion edge; original colors preserved.",
                "files": generated}
    for target in (USER, ADMIN):
        (target / "runtime-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    # The apps have separate Docker build contexts. Keep one canonical primitive
    # while making each app independently buildable without cross-app imports.
    for name in ("BrandLogo.jsx", "BrandLogo.css"):
        target = ROOT / "apps/frontend-admin/src/shared/branding" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / "apps/frontend-user/src/shared/branding" / name, target)
    print(f"Prepared {len(paths)} runtime assets per app; {sum(p['bytes'] for p in generated):,} bytes total per app.")


if __name__ == "__main__":
    main()
