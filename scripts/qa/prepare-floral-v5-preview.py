"""Optimize the actual rendered opening cover for /templates and compare covers."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[2]
source = Image.open(root / 'output/floral-v5/cover-preview.png').convert('RGB')
assets = root / 'apps/frontend-user/public/templates/khmer-floral-gold'
for width in [320, 640, 960]:
    image = source.resize((width, round(source.height * width / source.width)), Image.Resampling.LANCZOS)
    path = assets / f'cover-preview-{width}.webp'
    image.save(path, 'WEBP', quality=90, method=6)
    print(f'{path.name}: {image.width}x{image.height}, {path.stat().st_size} bytes')

screenshots = root / 'docs/design/khmer-floral-gold/screenshots/v5'
for width in [360, 390, 430, 512, 768, 1024, 1440]:
    images = [Image.open(screenshots / stage / f'cover-km-{width}.png').convert('RGB') for stage in ['before', 'after']]
    # Equal complete-view scaling, including desktop margins.
    images = [image.resize((min(width, 560), round(image.height * min(width, 560) / image.width))) for image in images]
    sheet = Image.new('RGB', (sum(image.width for image in images), max(image.height for image in images) + 34), '#fffdf8')
    pen = ImageDraw.Draw(sheet)
    x = 0
    for label, image in zip(['Before', 'After'], images):
        pen.text((x + 14, 10), label, fill='#463b31')
        sheet.paste(image, (x, 34))
        x += image.width
    sheet.save(screenshots / f'before-after-{width}.jpg', quality=88)
print('Saved seven comparison sheets from the actual before/after captures.')
