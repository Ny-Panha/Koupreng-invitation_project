"""Package original built-in imagegen artwork without resampling or losing alpha."""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
MASTERS = ROOT / 'assets/khmer-floral-gold/romduol-kbach'
RUNTIME = ROOT / 'apps/frontend-user/public/templates/khmer-floral-gold'


def main():
    assets = []
    for name in ['guest-frame', 'open-button']:
        source = MASTERS / f'{name}.png'
        image = Image.open(source).convert('RGBA')
        # Ignore isolated, almost-transparent edge pixels when trimming padding.
        bounds = image.getchannel('A').point(lambda alpha: 255 if alpha > 12 else 0).getbbox()
        cropped = image.crop(bounds)
        center_alpha = cropped.getpixel((cropped.width // 2, cropped.height // 2))[3]
        assert center_alpha == 0 if name == 'guest-frame' else center_alpha >= 250
        encoded = BytesIO()
        cropped.save(encoded, 'WEBP', lossless=True, exact=True, method=6)
        target = RUNTIME / f'romduol-kbach-{name}.webp'
        data = encoded.getvalue()
        if not target.exists() or target.read_bytes() != data:
            temporary = target.with_suffix('.webp.tmp')
            temporary.write_bytes(data)
            temporary.replace(target)
        assets.append({'master': source.relative_to(ROOT).as_posix(), 'source_dimensions': list(image.size), 'crop': list(bounds), 'runtime': target.relative_to(ROOT).as_posix(), 'dimensions': list(cropped.size), 'bytes': len(data), 'sha256': sha256(data).hexdigest(), 'center_alpha': center_alpha, 'lossless': True})
    report = ROOT / 'docs/design/khmer-floral-gold/ROMDUOL_KBACH_ASSETS.json'
    report.write_text(json.dumps({'mode': 'built-in imagegen, original transparent raster artwork', 'assets': assets}, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(assets, indent=2))


if __name__ == '__main__':
    main()
