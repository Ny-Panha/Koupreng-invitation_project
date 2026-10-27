"""Compose evidence only; supplied production artwork is never modified here."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(__file__).resolve().parents[2]
out = root / 'docs/design/royal-garden-visual-repair/final-steering'
references = out.parent / 'references'
before = out.parent / 'evidence'
evidence = out / 'evidence'
geometry = json.loads((out / 'final-geometry.json').read_text(encoding='utf-8'))
final = next(r for r in geometry['records'] if r['viewport']['width'] == 390 and r['language'] == 'km')['scenes']
try:
    font = ImageFont.truetype('arial.ttf', 17)
    small = ImageFont.truetype('arial.ttf', 14)
except OSError:
    font = small = ImageFont.load_default()

def panel(path, size):
    # Top-aligned proportional fit. Any padding remains visible in the board.
    source = Image.open(path).convert('RGB')
    fitted = ImageOps.contain(source, size, Image.Resampling.LANCZOS)
    image = Image.new('RGB', size, '#ebe7df')
    image.paste(fitted, ((size[0] - fitted.width) // 2, 0))
    return image

scenes = ['cover', 'video', 'information']
for scene in scenes:
    board = Image.new('RGB', (1190, 904), '#071b34')
    draw = ImageDraw.Draw(board)
    columns = [
        ('Supplied LEFT / proportional fit', references / f'{scene}-left.jpg'),
        ('Before critical reconstruction', before / f'before-{scene}.png'),
        ('Final / 390 x 844 / Khmer', evidence / f'final-390x844-km-{scene}.png'),
    ]
    for i, (title, path) in enumerate(columns):
        x = i * 400
        draw.text((x + 7, 12), title, font=font, fill='#f2d693')
        board.paste(panel(path, (390, 844)), (x, 42))
    board.save(evidence / f'comparison-{scene}.jpg', quality=92, optimize=True)
    source_board = Image.new('RGB', (1036, 947), '#071b34')
    draw = ImageDraw.Draw(source_board)
    draw.text((8, 12), 'Supplied LEFT / 512 x 900 proportional fit', font=font, fill='#f2d693')
    draw.text((532, 12), 'Final / 512 x 900 / Khmer', font=font, fill='#f2d693')
    source_board.paste(panel(references / f'{scene}-left.jpg', (512, 900)), (0, 40))
    source_board.paste(panel(evidence / f'final-512x900-km-{scene}.png', (512, 900)), (524, 40))
    source_board.save(evidence / f'comparison-source-{scene}.jpg', quality=92, optimize=True)

targets = {
    'cover': [('Heading', (16, 15, 69, 12)), ('Photo region', (5, 14, 90, 81)), ('Guest band', (11, 73, 78, 7)), ('Open', (46, 85, 9, 5))],
    'video': [('Monogram', (35, 7, 30, 22)), ('Calligraphy', (20, 66, 60, 16)), ('Footer', (0, 82, 100, 18))],
    'information': [('Heading', (12, 13, 76, 7)), ('Parents', (10, 23, 80, 8)), ('Message', (12, 30, 76, 10)), ('Monogram', (35, 43, 30, 18))],
}
selectors = {
    'cover': ['.rg-entrance-lettering', '.rg-entrance-photo .cover-bg-root', '.rg-guest-frame', '.rg-open'],
    'video': ['.rg-video-monogram', '.rg-video-calligraphy', '.cinematic-film-footer'],
    'information': ['#rg-family h2', '.rg-family', '#rg-invitation .rg-copy', '.rg-ceremonial-monogram'],
}
colors = ['#ff8075', '#64f3d4', '#ffd26f', '#e497ff']
records = []
for scene in scenes:
    board = Image.new('RGB', (792, 940), '#071b34')
    left = Image.open(references / f'{scene}-left.jpg').convert('RGB')
    ratio = min(390 / left.width, 844 / left.height)
    offset = (390 - round(left.width * ratio)) // 2
    board.paste(panel(references / f'{scene}-left.jpg', (390, 844)), (0, 42))
    board.paste(panel(evidence / f'final-390x844-km-{scene}.png', (390, 844)), (402, 42))
    draw = ImageDraw.Draw(board)
    draw.text((8, 10), 'LEFT: approximate painted bounds', font=font, fill='#f2d693')
    draw.text((410, 10), 'FINAL: measured DOM bounds', font=font, fill='#f2d693')
    for i, ((label, rect), selector) in enumerate(zip(targets[scene], selectors[scene])):
        x, y, w, h = rect
        desired = (offset + x / 100 * left.width * ratio, 42 + y / 100 * left.height * ratio, w / 100 * left.width * ratio, h / 100 * left.height * ratio)
        r = final[scene][selector]
        actual = (402 + r['x'], 42 + r['y'], r['width'], r['height'])
        for tag, box in [('L', desired), ('F', actual)]:
            bx, by, bw, bh = box
            draw.rectangle((bx, by, bx + bw, by + bh), outline=colors[i], width=2)
            draw.text((bx + 2, by + 2), f'{tag}{i+1}', font=small, fill=colors[i], stroke_width=1, stroke_fill='#071b34')
        records.append({'scene': scene, 'label': label, 'referenceCropPercent': rect, 'reference390CanvasRect': [desired[0], desired[1] - 42, desired[2], desired[3]], 'finalSelector': selector, 'final390CanvasRect': [r['x'], r['y'], r['width'], r['height']]})
    draw.text((8, 894), 'Approximate reference paint vs DOM boxes; photo is additionally source-clipped.', font=small, fill='#f2d693')
    draw.text((8, 915), 'Numbered boxes are audit regions, not an automated visual-similarity score.', font=small, fill='#f2d693')
    board.save(evidence / f'annotated-{scene}.jpg', quality=93, optimize=True)
(out / 'comparison-bounds.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
print('Built six proportional comparison boards, three annotated boards and rectangle records.')
