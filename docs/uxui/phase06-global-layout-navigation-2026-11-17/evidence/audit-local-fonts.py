"""Read binary metadata with a temporary QA parser; never export/modify font binaries."""
import sys, json, hashlib
from pathlib import Path
E=Path(__file__).resolve().parent;ROOT=E.parents[3]
sys.path.insert(0,str(ROOT/'output/playwright/uxui-phase06-2026-11-17/qa-fonttools'))
import fontTools
from fontTools.ttLib import TTFont
rows=[]
for relative,license_name in [('marketing/DMSans-Latin.woff2','DMSans-OFL.txt'),('silk-heritage/KantumruyPro.woff2','KantumruyPro-OFL.txt'),('silk-heritage/Moul-Regular.woff2','Moul-OFL.txt')]:
 file=ROOT/'apps/frontend-user/public/fonts'/relative
 font=TTFont(file)
 names={str(ident):sorted({n.toUnicode() for n in font['name'].names if n.nameID==ident}) for ident in (1,2,16,17)}
 axes=[{'tag':a.axisTag,'min':a.minValue,'default':a.defaultValue,'max':a.maxValue} for a in font['fvar'].axes] if 'fvar' in font else []
 cmap=font.getBestCmap();notice=file.parent/license_name
 rows.append({'file':str(file.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'names':names,'os2WeightClass':font['OS/2'].usWeightClass,'axes':axes,'glyphCount':font['maxp'].numGlyphs,'encodedKhmerBlockCodepoints':sum(0x1780<=cp<=0x17ff for cp in cmap),'missingKhmerSampleCodepoints':[f'U+{ord(c):04X}' for c in sorted(set('គូព្រេងពិធីមង្គលការ')) if ord(c) not in cmap],'licenseNotice':str(notice.relative_to(ROOT)).replace('\\','/'),'licenseNoticeExists':notice.is_file(),'licenseSha256':hashlib.sha256(notice.read_bytes()).hexdigest() if notice.is_file() else None})
 font.close()
result={'parser':f'fontTools {fontTools.__version__}; temporary ignored QA install, no application dependency change','rows':rows,'limits':['Binary names/axes and encoded sample coverage do not certify native glyph shaping, visual diacritics or linguistic quality','DM Sans Latin intentionally relies on the Khmer fallback','No asset was rewritten or redistributed']}
(E/'local-font-metadata.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
