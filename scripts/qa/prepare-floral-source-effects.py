"""Package three original HD raster effects inspired by the supplied footage.

Requires Pillow. Built-in imagegen created the lossless 1536x1024 source atlases
under assets/khmer-floral-gold/realistic-effects. No API key or video engine is
needed for packaging. Masters, source clips and the credited photo are read-only.
"""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
MASTERS = ROOT / 'assets/khmer-floral-gold/realistic-effects'
RUNTIME = ROOT / 'apps/frontend-user/public/templates/khmer-floral-gold/effects/realistic'


def save(image, name):
    encoded = BytesIO()
    if name.startswith('petal-'):
        image.save(encoded, 'WEBP', lossless=True, exact=True, method=6)
    else:
        image.save(encoded, 'WEBP', quality=95, method=6)
    target = RUNTIME / name
    data = encoded.getvalue()
    if not target.exists() or target.read_bytes() != data:
        temporary = target.with_suffix('.webp.tmp')
        temporary.write_bytes(data)
        temporary.replace(target)


def main():
    RUNTIME.mkdir(parents=True, exist_ok=True)
    for name in ['butterflies', 'blossom-branch', 'petals']:
        image = Image.open(MASTERS / f'{name}.webp').convert('RGBA')
        assert image.size == (1536, 1024), 'Inspect changed master before extracting sprites'
        assert image.getchannel('A').getextrema()[0] == 0
        if name == 'blossom-branch':
            save(image, 'blossom-branch.webp')
        elif name == 'butterflies':
            for index, color in enumerate(['amber', 'blue', 'violet', 'ivory']):
                tile = image.crop((index % 2 * 768, index // 2 * 512, (index % 2 + 1) * 768, (index // 2 + 1) * 512))
                save(tile.crop(tile.getbbox()), f'butterfly-{color}.webp')
        else:
            for index in range(6):
                tile = image.crop((index % 3 * 512, index // 3 * 512, (index % 3 + 1) * 512, (index // 3 + 1) * 512))
                save(tile.crop(tile.getbbox()), f'petal-{index + 1}.webp')
    border = Image.open(MASTERS / 'white-green-border-hd.webp').convert('RGBA')
    assert border.size == (1536, 1024)
    for name, bounds in [('top', (0, 0, 1536, 512)), ('bottom', (0, 512, 1536, 1024))]:
        save(border.crop(bounds), f'white-green-border-{name}.webp')
    photo = MASTERS / 'white-blossom-paper.jpg'
    photo_target = RUNTIME / photo.name
    if not photo_target.exists() or photo_target.read_bytes() != photo.read_bytes():
        temporary = photo_target.with_suffix('.jpg.tmp')
        temporary.write_bytes(photo.read_bytes())
        temporary.replace(photo_target)
    def describe(path):
        image = Image.open(path)
        return {'file': path.relative_to(ROOT).as_posix(), 'bytes': path.stat().st_size, 'dimensions': list(image.size), 'sha256': sha256(path.read_bytes()).hexdigest()}
    manifest = {
        'mode': 'Three original photorealistic transparent effects plus a faithful HD restoration of the newly selected white/green border; built-in imagegen. Not extracted video frames.',
        'masters': [describe(path) for path in sorted(MASTERS.iterdir()) if path.suffix in ['.webp','.jpg']],
        'runtime': [describe(path) for path in sorted(RUNTIME.iterdir()) if path.suffix in ['.webp','.jpg']],
        'background_photo': {'title': 'White Flowers on White Background', 'photographer': 'Eva Bronzini', 'page': 'https://www.pexels.com/photo/white-flowers-on-white-background-7965228/', 'download': 'https://images.pexels.com/photos/7965228/pexels-photo-7965228.jpeg?auto=compress&cs=tinysrgb&w=1600', 'license': 'https://www.pexels.com/license/', 'original_dimensions': [5568,3712], 'runtime_dimensions': [1600,1067], 'note': 'Downloaded photo, not generated. Static backdrop for welcome/details; CSS turns the photograph to portrait and applies 28% opacity without blur. Clear paper center preserves reading contrast.'},
        'inspiration': [{'file': f'assets/{name}', 'sha256': sha256((ROOT / 'assets' / name).read_bytes()).hexdigest()} for name in ['butterfly_effect.MP4', 'flower_animation.mp4', 'flowereffect.mp4']],
        'background': {'source': 'assets/ritilsa_ssspin.io_1793970094.jpg', 'source_dimensions': [675,1200], 'source_sha256': sha256((ROOT / 'assets/ritilsa_ssspin.io_1793970094.jpg').read_bytes()).hexdigest(), 'restoration_atlas_dimensions': list(border.size), 'edge_dimensions': [1536,512], 'css_opacity': 1, 'filter': 'none', 'fade_mask': 'none', 'note': 'AI-assisted HD restoration/extraction preserving the chosen floral arrangement; not native 4K.'},
        'motion': {'butterfly_flight_seconds': 16.08, 'petal_fall_seconds': [16.8,17.2,18], 'petal_css_opacity': 1, 'petal_encoding': 'lossless WebP, native crop pixels and alpha preserved', 'wind_seconds': 6.4, 'butterfly_count': 12, 'petal_count': 12, 'wing_half_beat_ms': 380, 'welcome_seconds': 7, 'motion_library': 'existing framer-motion', 'entrance_effects': 10, 'scene_corner_flips': {'top_left': 'horizontal', 'top_right': 'original', 'bottom_left': 'horizontal and vertical', 'bottom_right': 'vertical'}, 'layout': 'Cover: original top/bottom borders plus four native-proportion floral panels rotated along both sides, with inward-facing natural silhouettes and responsive clearance around the frame, heading, guest panel and Open button. Welcome/details: mirrored branches in four scene corners above the demo links. No botanical linework SVG.', 'timing_note': 'Source-inspired motion created for portrait stationery; original source files untouched.'},
    }
    (ROOT / 'docs/design/khmer-floral-gold/REALISTIC_EFFECTS_ASSETS.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print('Packaged', len(manifest['runtime']), 'native-dimension textures;', sum(row['bytes'] for row in manifest['runtime']), 'runtime bytes')


if __name__ == '__main__':
    main()
