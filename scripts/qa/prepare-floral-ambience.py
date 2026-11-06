"""Prepare downloaded CC0 raster decorations; never generate SVG artwork.

Sources and download/license pages are recorded in V5_ASSETS.md. Masters stay local.
Requires Pillow. Downloads use public standard-resolution URLs only.
"""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

root = Path(__file__).resolve().parents[2]
cache = root / 'output/floral-v5'
cache.mkdir(parents=True, exist_ok=True)
assets = root / 'apps/frontend-user/public/templates/khmer-floral-gold/effects'
assets.mkdir(parents=True, exist_ok=True)
sources = {
    'butterfly-source.png': 'https://www.publicdomainpictures.net/pictures/440000/velka/butterfly-bright-colored.png',
    'kenney-particles.zip': 'https://opengameart.org/sites/default/files/kenney_particlePack.zip',
    'watercolor-border-source.jpg': 'https://www.publicdomainpictures.net/pictures/280000/velka/floral-watercolor-flowers-border.jpg',
    'lotus-isolated-source.jpg': 'https://c.pxhere.com/photos/ac/0d/cutout_lotus_country_white_background_isolated_flower-560219.jpg!d',
}
for filename, url in sources.items():
    if not (cache / filename).exists():
        (cache / filename).write_bytes(urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read())

def save(image, name, size):
    image = image.convert('RGBA')
    image = image.crop(image.getbbox())
    image.thumbnail((size, size), Image.Resampling.LANCZOS)
    image.save(assets / name, 'WEBP', quality=90, method=6, exact=True)
    print(name, image.size, (assets / name).stat().st_size)

lotus = Image.open(cache / 'lotus-isolated-source.jpg').convert('RGBA')
if lotus.size != (1200, 674):
    raise ValueError('Inspect changed lotus photograph before extracting a petal')
# Trace one real upward-facing petal from the CC0 photograph, retaining its
# photographed veins and pale base. Supersampling preserves the soft alpha edge.
outline = [(650,22),(654,25),(654,47),(652,79),(647,118),(639,149),(628,170),(618,175),(612,163),(607,142),(605,119),(610,92),(623,61),(638,36)]
mask = Image.new('L', (lotus.width * 4, lotus.height * 4))
ImageDraw.Draw(mask).polygon([(x * 4, y * 4) for x, y in outline], fill=255)
lotus.putalpha(mask.resize(lotus.size, Image.Resampling.LANCZOS))
save(ImageEnhance.Color(lotus).enhance(.8), 'lotus-petal.webp', 128)
# Preserve the downloaded watercolor's natural borders as a matching pair.
# Remove white paper with soft alpha; no replacement flowers are drawn.
border = Image.open(cache / 'watercolor-border-source.jpg').convert('RGBA')
if border.size != (1920, 1881):
    raise ValueError('Inspect changed watercolor border before extracting its edges')
for name, bounds in [('top', (0, 0, 1920, 560)), ('bottom', (0, 1430, 1920, 1881))]:
    edge = ImageEnhance.Color(border.crop(bounds)).enhance(.72)
    red, green, blue, _ = edge.split()
    minimum = ImageChops.darker(ImageChops.darker(red, green), blue)
    edge.putalpha(minimum.point(lambda value: min(255, (255 - value) * 8)))
    save(edge, f'blush-floral-border-{name}.webp', 960)
# Extract actual orange, pink, blue and violet butterflies from the downloaded sheet.
for name, bounds, seed in [
    ('golden', (0, 0, 570, 445), (270, 220)),
    ('pink', (0, 440, 600, 850), (270, 190)),
    ('blue', (0, 860, 620, 1382), (250, 340)),
    ('violet', (1530, 730, 1920, 1350), None),
]:
    butterfly = Image.open(cache / 'butterfly-source.png').convert('RGBA').crop(bounds)
    if seed is None:
        # Violet's disconnected fine wing panels belong to the artwork. Keep
        # those intact, removing only the neighboring orange tip at the left.
        ImageDraw.Draw(butterfly).rectangle((0, 205, 38, 340), fill=(0, 0, 0, 0))
    else:
        mask = butterfly.getchannel('A').point(lambda value: 255 if value > 16 else 0)
        assert mask.getpixel(seed) == 255, 'Inspect changed butterfly source'
        ImageDraw.floodfill(mask, seed, 128)
        mask = mask.point(lambda value: 255 if value == 128 else 0).filter(ImageFilter.MaxFilter(3))
        butterfly.putalpha(Image.frombytes('L', butterfly.size, bytes(min(a, b) for a, b in zip(mask.tobytes(), butterfly.getchannel('A').tobytes()))))
    save(butterfly, f'{name}-butterfly.webp', 160)
with ZipFile(cache / 'kenney-particles.zip') as pack:
    (assets / 'KENNEY_LICENSE.txt').write_text('\n'.join(line.rstrip() for line in pack.read('License.txt').decode().splitlines()).strip() + '\n')
    for filename, output, color in [('star_04', 'gold-star.webp', '#d3ad62'), ('symbol_01', 'blush-heart.webp', '#d995a9')]:
        original = Image.open(BytesIO(pack.read(f'PNG/{filename}.png'))).convert('RGBA')
        # These particle textures use black as additive transparency. Preserve
        # their downloaded luminance detail as alpha and tint for the stationery.
        alpha = ImageOps.grayscale(original.convert('RGB'))
        alpha = Image.frombytes('L', original.size, bytes(min(a, b) for a, b in zip(alpha.tobytes(), original.getchannel('A').tobytes())))
        tinted = Image.new('RGBA', original.size, color)
        tinted.putalpha(alpha)
        save(tinted, output, 96)
manifest = {
    'downloaded': [{'file': filename, 'url': url, 'sha256': sha256((cache / filename).read_bytes()).hexdigest()} for filename, url in sources.items()],
    'runtime': [{'file': path.name, 'bytes': path.stat().st_size, 'sha256': sha256(path.read_bytes()).hexdigest()} for path in sorted(assets.glob('*.webp'))],
}
(root / 'docs/design/khmer-floral-gold/V5_EFFECT_SOURCES.json').write_text(json.dumps(manifest, indent=2) + '\n')
