"""Recover early ledger entries from retained logs after the PS array writer defect.
No original timestamps/durations are invented; log timestamps are qualified.
"""
import json
from pathlib import Path
from datetime import datetime, timezone
base=Path(__file__).resolve().parent
root=base.parents[3]
ledger=base/'qa-command-results.json'
rows=json.loads(ledger.read_text(encoding='utf-8-sig'))
known={r['id'] for r in rows}
commands={
 'baseline-capture': 'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/capture-visual.mjs before',
 'baseline-user-focused': 'npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx src/app/router.test.jsx src/layouts/components/HostNav.test.jsx src/shared/ui/Modal.test.jsx src/shared/styles/semanticTokens.test.js',
 'baseline-admin-focused': 'npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx src/layouts/AdminLayout.test.jsx',
 'baseline-user-build': 'npm --prefix apps/frontend-user run build',
 'baseline-admin-build': 'npm --prefix apps/frontend-admin run build',
 'baseline-phase04-phase05': 'npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js --reporter=line --workers=2 --output=../../output/playwright/uxui-phase06-2026-11-17/baseline-phase04-phase05',
 'baseline-phase02-unchanged': 'npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --reporter=line --workers=2 --output=../../output/playwright/uxui-phase06-2026-11-17/baseline-phase02',
 'baseline-phase06-contracts': 'npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase06-layout-navigation.spec.js --reporter=line --workers=2 --project=desktop-chromium --output=../../output/playwright/uxui-phase06-2026-11-17/baseline-phase06',
 'baseline-corrected-studio-scroll': 'npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase06-layout-navigation.spec.js --grep "Studio sections|public Back" --project=desktop-chromium --reporter=line --workers=2 --output=../../output/playwright/uxui-phase06-2026-11-17/baseline-corrected',
 'first-user-focused': 'npm --prefix apps/frontend-user test -- src/layouts/components/HostNav.test.jsx src/shared/ui/Modal.test.jsx',
 'first-admin-focused': 'npm --prefix apps/frontend-admin test -- src/layouts/AdminLayout.test.jsx',
 'current-user-route-factory': 'npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx',
 'current-admin-route-factory': 'npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx',
}
failures={'baseline-phase02-unchanged','baseline-phase06-contracts','baseline-corrected-studio-scroll'}
for ident,command in commands.items():
 if ident in known: continue
 log=root/f'output/playwright/uxui-phase06-2026-11-17/commands/{ident}.log'
 if not log.exists(): raise ValueError(f'Missing retained command proof {ident}')
 rows.append({'id':ident,'command':command,'startedAt':'RECOVERED: original start timestamp unavailable','logLastWriteAt':datetime.fromtimestamp(log.stat().st_mtime,timezone.utc).isoformat(),'durationSeconds':None,'exitCode':1 if ident in failures else 0,'sourceSha':'4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4','log':str(log.relative_to(root)).replace('\\','/'),'metadataRecovery':'Exact command from execution transcript; output retained. Initial PowerShell ledger nested arrays and lost early metadata. Original start/duration not asserted.'})
ledger.write_text(json.dumps(rows,indent=2)+'\n',encoding='utf-8')
print(f'{len(rows)} QA command records, early records recovered honestly')
