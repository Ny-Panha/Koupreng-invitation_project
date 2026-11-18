"""Record exact protected-source comparisons; this is not a live-service security certificate."""
import hashlib, json, subprocess
from datetime import datetime, timezone
from pathlib import Path
E=Path(__file__).resolve().parent; ROOT=E.parents[3]
BASE='4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4'
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
changed=git('diff','--name-only',BASE).decode().splitlines()
categories={
 'backendAndTelegram':[p for p in changed if p.startswith(('apps/backend/','apps/telegram-bot/'))],
 'dependencies':[p for p in changed if Path(p).name in ('package.json','package-lock.json','pom.xml')],
 'migrations':[p for p in changed if p.endswith('.sql')],
 'templateArtworkFontsRegistry':[p for p in changed if any(s in p for s in ('/assets/','/public/','/registry/','/renderers/'))],
 'originalBrowserContracts':[p for p in changed if Path(p).name in ('phase02-foundations.spec.js','phase04-components.spec.js','phase05-motion.spec.js')],
}
sql=git('ls-files','*.sql').decode().splitlines()
flyway=[p for p in sql if '/db/migration/' in p]
originals={}
for name in ['phase02-foundations.spec.js','phase04-components.spec.js','phase05-motion.spec.js']:
 p='apps/frontend-user/tests/e2e/'+name
 originals[p]={'baselineSha256':hashlib.sha256(git('show',BASE+':'+p)).hexdigest(),'currentSha256':hashlib.sha256((ROOT/p).read_bytes().replace(b'\r\n',b'\n')).hexdigest()}
result={'observedAt':datetime.now(timezone.utc).isoformat(),'baselineSha':BASE,'sourceSha':git('rev-parse','HEAD').decode().strip(),'remoteSha':git('rev-parse','origin/main').decode().strip(),'changedTrackedFiles':changed,'protectedCategoryChanges':categories,'trackedSqlFiles':len(sql),'originalBrowserFileHashes':originals,'verdict':'SOURCE VERIFIED' if not any(categories.values()) and all(r['baselineSha256']==r['currentSha256'] for r in originals.values()) else 'REVIEW REQUIRED','limits':['Source comparison only; does not certify live provider, data, migration execution, production prices, guest records or actual service security','Route factories and unit/browser evidence separately verify retained guard, unknown-JSON and preview contracts with fictional fixtures']}
result['flywayMigrationSqlFiles']=len(flyway)
(E/'preservation-audit.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:result[k] for k in ['sourceSha','remoteSha','trackedSqlFiles','protectedCategoryChanges','verdict']}))
raise SystemExit(result['verdict']!='SOURCE VERIFIED')
