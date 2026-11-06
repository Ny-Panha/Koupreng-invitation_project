"""Derive runtime WebPs from the owner's actual #8 master, without regenerating art.

Requires Pillow and numpy. The 4K source is read-only and deliberately not committed.
"""
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def main():
    root = Path(__file__).resolve().parents[2]
    assets = root / 'apps/frontend-user/public/templates/khmer-floral-gold'
    source = assets / 'regal_scroll_frame_08_4k.webp'
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if digest != '1df759c3a61075e483d1fcf1952b65ba7124c4135bac3bec025ed115185c1024':
        raise ValueError('Unrecognized master: inspect provenance before deriving assets.')
    original = Image.open(source).convert('RGBA')
    rgba = np.array(original)
    hsv = np.array(original.convert('RGB').convert('HSV'))
    hue, saturation, _ = hsv.transpose(2, 0, 1)
    # Highly saturated red and lemon-yellow residue, outside the champagne-gold range.
    residue = (saturation > 205) & ((hue < 8) | (hue > 245) | ((hue >= 37) & (hue <= 51)))
    removed_chroma = int(np.count_nonzero(residue & (rgba[:, :, 3] > 0)))
    rgba[residue, 3] = 0
    # Retain the connected ornament, including all its fine scrollwork; discard
    # detached extraction flecks. The seed is verified inside the top gold crest.
    mask = Image.fromarray(np.where(rgba[:, :, 3] > 16, 255, 0).astype('uint8')).copy()
    seed = (2048, 180)
    if mask.getpixel(seed) != 255:
        raise ValueError('Crest seed changed; inspect the master.')
    ImageDraw.floodfill(mask, seed, 128)
    connected = np.array(mask) == 128
    assert np.count_nonzero(connected) > 1_000_000, 'Incomplete ornament mask'
    # Preserve antialiasing immediately adjacent to the connected silhouette.
    from PIL import ImageFilter
    adjacent = np.array(Image.fromarray(connected.astype('uint8') * 255).filter(ImageFilter.MaxFilter(3))) > 0
    rgba[~adjacent, 3] = 0
    rgba[rgba[:, :, 3] == 0, :3] = 0
    cleaned = Image.fromarray(rgba)
    output = root / 'output/floral-v5'
    output.mkdir(parents=True, exist_ok=True)
    cleaned.save(output / 'regal-cleaned-master.png')
    report = {'source': source.name, 'sha256': digest, 'dimensions': original.size,
              'removedChromaPixels': removed_chroma, 'derivatives': []}
    for size, filename in [(480, 'regal-scroll-gold-480.webp'), (960, 'regal-scroll-gold.webp')]:
        image = cleaned.resize((size, size), Image.Resampling.LANCZOS)
        image.save(assets / filename, 'WEBP', quality=88, method=6, exact=True)
        delivered = Image.open(assets / filename)
        assert delivered.mode == 'RGBA' and delivered.getchannel('A').getextrema() == (0, 255)
        assert delivered.getpixel((size // 2, size // 2))[3] == 0
        report['derivatives'].append({'file': filename, 'bytes': (assets / filename).stat().st_size,
                                      'size': size, 'alphaExtrema': delivered.getchannel('A').getextrema()})
    (output / 'asset-inspection.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
