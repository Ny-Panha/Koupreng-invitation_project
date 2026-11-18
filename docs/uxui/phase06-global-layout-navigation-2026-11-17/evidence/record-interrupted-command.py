"""Keep the resumed-turn interruption visible; never invent a completion code."""
import json
from pathlib import Path
E=Path(__file__).resolve().parent
row={'id':'performance-final','command':'node docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/measure-lab.mjs','sourceSha':'13fb564e53952934d178d4fb50d6f92d724ed852','status':'INTERRUPTED','exitCode':None,'startedAt':None,'durationSeconds':None,'log':'output/playwright/uxui-phase06-2026-11-17/commands/performance-final.log','archive':'output/playwright/uxui-phase06-2026-11-17/lab-first-interrupted-attempt.json','qualification':'Before-only attempt did not complete across resumed session. Exact command and retained output are known; no completion/start/duration claimed.'}
(E/'commands/performance-final.json').write_text(json.dumps(row,indent=2)+'\n',encoding='utf-8')
print('Retained interrupted command with unknown exit code')
