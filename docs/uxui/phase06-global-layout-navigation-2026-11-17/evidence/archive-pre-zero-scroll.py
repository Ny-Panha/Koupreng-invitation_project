import shutil
from pathlib import Path
E=Path(__file__).resolve().parent;ROOT=E.parents[3];BASE=ROOT/'output/playwright/uxui-phase06-2026-11-17'
for name in ['performance-comparison','performance-conclusions','lab-summary','final-build-assets']:
 shutil.copyfile(E/(name+'.json'),E/(name+'.pre-zero-scroll.json'))
shutil.copyfile(BASE/'lab-results.json',BASE/'lab-results.pre-zero-scroll.json')
print('Preserved validated db428514 comparison and its original baseline window before the zero-scroll fix')
