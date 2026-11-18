import json, shutil
from pathlib import Path
E=Path(__file__).resolve().parent;ROOT=E.parents[3];BASE=ROOT/'output/playwright/uxui-phase06-2026-11-17'
assets=json.loads((E/'final-build-assets.json').read_text(encoding='utf-8'))
assets['afterProductionSourceSha']=json.loads((BASE/'after/manifest.json').read_text(encoding='utf-8'))[0]['sha']
(E/'final-build-assets.json').write_text(json.dumps(assets,indent=2)+'\n',encoding='utf-8')
for name in ['performance-comparison','performance-diagnostic-review','final-build-assets']:
 shutil.copyfile(E/(name+'.json'),E/(name+'.pre-auth-shift.json'))
for name in ['lab-results','lab-diagnostic-results']:
 shutil.copyfile(BASE/(name+'.json'),BASE/(name+'.pre-auth-shift.json'))
archive=BASE/'pre-auth-shift-captures';archive.mkdir(exist_ok=True)
manifest=json.loads((BASE/'after/manifest.json').read_text(encoding='utf-8'))
for row in manifest:
 source=ROOT/row['screenshot'];target=archive/source.name;shutil.copyfile(source,target)
 row['screenshot']=str(target.relative_to(ROOT)).replace('\\','/')
(archive/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Archived both measured series, asset metadata and 52 primary images before final auth correction')
