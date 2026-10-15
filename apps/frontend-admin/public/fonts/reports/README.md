# Reporting fonts

The existing project fonts were copied from
`apps/frontend-user/public/fonts/silk-heritage/`. Copyright notices and the
SIL Open Font License are included alongside the files.

`KantumruyPro.woff2` is the existing variable UI font. The regular and bold
TrueType files are static weight 400 / 700 instances of that same font.
Print HTML uses these static files because Chromium emitted Type 3 glyph
programs for the variable file; static instances produce conventional embedded
TrueType subsets in the verified PDFs. Moul supplies the report heading.

To reproduce the static files with FontTools and Brotli installed as local
development tools (neither is an application dependency):

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from pathlib import Path

directory = Path('apps/frontend-admin/public/fonts/reports')
source = TTFont(directory / 'KantumruyPro.woff2')
for weight, name in [(400, 'Regular'), (700, 'Bold')]:
    font = instantiateVariableFont(source, {'wght': weight}, inplace=False)
    font.flavor = None
    font.save(directory / f'KantumruyPro-{name}.ttf')
```

XLSX files preserve Khmer Unicode and request Kantumruy Pro / Moul fonts;
Excel does not embed these web fonts. Spreadsheet viewers need suitable local
Khmer font support. No desktop Excel or LibreOffice check was available here.
