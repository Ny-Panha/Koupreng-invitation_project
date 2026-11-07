"""Compose actual reference/application frames for human visual review."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path("docs/design/royal-garden-v4/evidence")
PAIRS = [
    (0, "after-cover", "Cover"), (7, "after-curtain-closed", "Closed curtain"),
    (9, "after-curtain-opening", "Curtain opening"), (12, "after-portrait-first", "First portrait"),
    (16, "after-portrait-second", "Next portrait"), (20, "scene-family", "Family"),
    (28, "scene-invitation", "Invitation"), (32, "scene-venue", "Venue"),
    (36, "scene-schedule", "Programme"), (40, "scene-gallery", "Gallery"),
    (48, "after-lightbox-portrait", "Lightbox"), (92, "after-collage", "Collage"),
    (106, "scene-countdown", "Date / calendar"), (108, "scene-gift", "Test gift QR"),
    (112, "scene-rsvp", "RSVP"), (116, "scene-wishes", "Private wishes"),
    (120, "scene-closing", "Closing"), (124, "scene-footer", "Brand footer"),
]


def main():
    width, height, cell = 160, 346, 360
    sheet = Image.new("RGB", (1020, 6 * cell + 54), "#ece7df")
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 8), "Royal Garden V4 | each pair: supplied recording (left), actual Chromium (right)", fill="#30252a")
    draw.text((10, 26), "Different wedding data and original artwork; this is a visual review, not a pixel-match score.", fill="#30252a")
    for i, (timestamp, capture, label) in enumerate(PAIRS):
        x, y = (i % 3) * 340, (i // 3) * cell + 54
        reference = Image.open(ROOT / "reference" / f"{timestamp:05.1f}.jpg").convert("RGB")
        # Remove the recording's outer phone/status area only in this comparison sheet.
        reference = reference.crop((27, 65, 431, 778))
        actual = Image.open(ROOT / "browser" / f"{capture}.png").convert("RGB")
        for offset, frame in [(0, reference), (168, actual)]:
            sheet.paste(ImageOps.contain(frame, (width, height - 22)), (x + offset, y))
        draw.text((x + 3, y + height - 18), f"{timestamp:05.1f}s | {label}", fill="#30252a")
    sheet.save(ROOT / "comparison-storyboard.jpg", quality=91)
    before = Image.new("RGB", (3 * 390, 2 * 875), "#ece7df")
    labels = ImageDraw.Draw(before)
    for row, (timestamp, old, new) in enumerate([(0, "before-cover", "after-cover"), (20, "before-information", "scene-family")]):
        paths = [ROOT / "reference" / f"{timestamp:05.1f}.jpg", ROOT / "browser" / f"{old}.png", ROOT / "browser" / f"{new}.png"]
        for col, path in enumerate(paths):
            frame = Image.open(path).convert("RGB")
            before.paste(ImageOps.contain(frame, (390, 844)), (col * 390, row * 875))
            labels.text((col * 390 + 10, row * 875 + 850), ["Reference", "Before", "After"][col], fill="#30252a")
    before.save(ROOT / "before-after.jpg", quality=91)
    print(f"Composed {len(PAIRS)} scene pairs and cover/information before-after")


if __name__ == "__main__":
    main()
