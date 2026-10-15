import sys
from pathlib import Path
sys.path.insert(0, str(Path('output/playwright/font-tools').resolve()))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

root = Path('apps/frontend-user/public/fonts/silk-heritage').resolve()
for name in ('Moul-Regular', 'KantumruyPro', 'CormorantGaramond'):
    source = root / f'{name}.ttf'
    font = TTFont(source)
    if name == 'CormorantGaramond':
        font = instantiateVariableFont(font, {'wght': 600})
        options = subset.Options()
        options.name_IDs = ['*']
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=list(range(0x250)) + list(range(0x2000, 0x2070)))
        subsetter.subset(font)
    font.flavor = 'woff2'
    destination = root / f'{name}.woff2'
    font.save(destination)
    print(destination.name, destination.stat().st_size)
    source.unlink()
