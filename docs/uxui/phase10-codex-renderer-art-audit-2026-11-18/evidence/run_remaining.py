"""Run scope-relevant browser regressions serially on the already frozen builds.

Never run alongside another Playwright process on ports4173/4174. Existing logs
are retained by refusing to reuse command labels. Failures do not skip later
independent regression groups. No installation, Git mutation or deploy occurs.
"""
import os
from audit import RAW,run_command

base=['npm.cmd','--prefix','apps/frontend-user','run','test:e2e','--']
jobs=[
 ('shared-controlled-browser','acceptance-shared',['tests/e2e/phase10-codex-shared.spec.js','--workers=2']),
 ('original-phase10-default-browser','original-phase10',['--config','playwright.phase10.config.js']),
 ('phase09-six-engine-browser','phase09-regression',['--config','playwright.phase09.config.js','--workers=2']),
 ('cross-phase-regression-browser','cross-phase-regression',['tests/e2e/phase08-identity-account.spec.js','tests/e2e/phase06-layout-navigation.spec.js','tests/e2e/phase05-motion.spec.js','tests/e2e/phase04-components.spec.js','--workers=2']),
 ('phase02-historical-current-browser','phase02-current',['tests/e2e/phase02-foundations.spec.js','--workers=2']),
 ('default-composition-browser','acceptance-composition-default',['tests/e2e/phase10-codex-shared.spec.js','tests/e2e/phase07-featured-collection.spec.js']),
 ('default-focused-browser','acceptance-default-focused',['--config','playwright.phase10-codex.config.js','--grep','normal motion DigitalYes']),
]
for label,stage,args in jobs:
    if (RAW/(label+'.log')).exists():
        raise SystemExit('Refusing overwrite of '+label+'; choose a new label before replay')
    os.environ['PHASE10_STAGE']=stage
    command=base+args+['--output',str(RAW/(stage+'-traces'))]
    run_command(label,command)
