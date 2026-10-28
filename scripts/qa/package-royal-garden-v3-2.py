"""Package reviewed browser captures; retain full originals in output/playwright."""
from pathlib import Path
import shutil
from PIL import Image, ImageOps, ImageDraw

source = Path('output/playwright/royal-garden-v3-2')
target = Path('docs/design/royal-garden-v3-2/evidence')
target.mkdir(parents=True, exist_ok=True)
panels = [('countdown', 'Countdown'), ('calendar', 'Month calendar'), ('selected-day-two', 'Selected second day'),
          ('program', 'Multi-day program'), ('dress', 'Dress code'), ('venue', 'Venue details'),
          ('gift', 'Gift KHQR'), ('rsvp', 'RSVP'), ('closing', 'Closing letters')]
for width, height in [(320,568),(375,667),(390,844),(430,932),(768,1024),(834,1194),(1024,768),(1440,900),(1920,1080)]:
    sheet = Image.new('RGB', (756, 1662), '#f5f0e7')
    draw = ImageDraw.Draw(sheet)
    for index, (key, label) in enumerate(panels):
        with Image.open(source / f'{width}x{height}-{key}.jpg') as capture:
            # Frame-centered detail for wide desktops, full viewport for phones.
            if width >= 1024:
                frame_width = min(600, (height - 40) * .62)
                left = int((width - frame_width) / 2) - 12
                capture = capture.crop((left, 0, width - left, height))
            panel = ImageOps.contain(capture, (240, 520))
            x, y = (index % 3) * 252 + 6, (index // 3) * 554 + 28
            draw.text((x, y - 20), f'{width}x{height} / {label}', fill='#142b44')
            sheet.paste(panel, (x + (240 - panel.width) // 2, y))
    sheet.save(target / f'review-{width}x{height}.jpg', quality=82, optimize=True)

for name in ['studio-live-preview', '390x844-km-countdown', '390x844-km-schedule', '390x844-km-closing']:
    shutil.copyfile(source / f'{name}.jpg', target / f'{name}.jpg')
print(f'Packaged {len(list(target.glob("*.jpg")))} review images.')
