import shutil
from pathlib import Path
E=Path(__file__).resolve().parent;ROOT=E.parents[3];BASE=ROOT/'output/playwright/uxui-phase06-2026-11-17'
for name in ['performance-comparison','performance-conclusions','lab-summary','final-build-assets']:
 shutil.copyfile(E/(name+'.json'),E/(name+'.pre-table-key.json'))
shutil.copyfile(BASE/'lab-results.json',BASE/'lab-results.pre-table-key.json')
print('Preserved the previous final-source cohort before resampling all after conditions for the table key fix')
