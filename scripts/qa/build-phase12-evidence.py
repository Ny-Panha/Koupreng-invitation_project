"""Assemble Phase 12 reports from real local command, image and Git evidence."""
from pathlib import Path
import collections
import datetime
import difflib
import gzip
import hashlib
import json
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/phase12-codex'
REPORT = ROOT / 'docs/uxui/phase12-codex-owner-dashboard-audit-2026-11-19'
EVIDENCE = REPORT / 'evidence'
BASE = 'ad02a26345f2beed2e8d0d28459de7fac1f8aef8'
RESUMED = 'b18aae3f144ea599da29c13f2ef448aa33ba08a2'
GEMINI = ROOT / 'docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/evidence'

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def save(name, value):
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    (EVIDENCE/name).write_text(json.dumps(value, indent=2, ensure_ascii=False)+'\n', encoding='utf8', newline='\n')

def commands():
    rows = []
    for path in sorted((OUT/'checks').glob('*.json')):
        row = read(path)
        log = ROOT/row['log']
        content = log.read_text(encoding='utf8', errors='replace') if log.exists() else ''
        content = re.sub(r'\x1b\[[0-9;]*m', '', content)
        row['summary'] = re.findall(r'(?:Test Files|Tests)\s+[^\n]+|^\s+\d+ (?:passed|failed|skipped)(?: \([\d.]+[ms]\))?|Tests run: [^\n]+', content, re.M)[-5:]
        row['hash_valid'] = log.exists() and sha(log)==row['log_sha256']
        rows.append(row)
    manual=[('baseline-targeted','npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ --run',0),('baseline-build','npm.cmd --prefix apps/frontend-user run build',0),('before-browser','PHASE12_CAPTURE=before; npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js --project=chromium',0),('negative-before','npm.cmd --prefix apps/frontend-user test -- src/features/events/Phase12CodexAccountIsolation.test.jsx src/features/dashboard/Phase12CodexDataTruth.test.jsx',1),('negative-after','npm.cmd --prefix apps/frontend-user test -- src/features/events/Phase12CodexAccountIsolation.test.jsx src/features/dashboard/Phase12CodexDataTruth.test.jsx',0),('design-targeted','npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ src/layouts/',1),('design-targeted-2','npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ src/layouts/',0),('design-lint','npm.cmd --prefix apps/frontend-user run lint',0),('design-build','npm.cmd --prefix apps/frontend-user run build',0),('design-browser','npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js --project=chromium',1)]
    for name,command,code in manual:
        log=OUT/(name+'.log')
        if log.exists():
            content=re.sub(r'\x1b\[[0-9;]*m','',log.read_text(encoding='utf8',errors='replace'))
            rows.append({'id':name,'command':command,'exit_code':code,'seconds':None,'log':log.relative_to(ROOT).as_posix(),'log_sha256':sha(log),'hash_valid':True,'summary':re.findall(r'(?:Test Files|Tests)\s+[^\n]+|\b\d+ (?:passed|failed|skipped) \([\d.]+[ms]\)',content)[-4:],'note':'True observed exit from tool transcript. Early same-ID retries may have overwritten local log; no fabricated missing transcript is supplied.'})
    for name in ['final-cross-phase','corrected-cross-phase','final-owner-33']:
        log=OUT/'checks'/(name+'.log')
        if log.exists() and not any(row['id']==name for row in rows):rows.append({'id':name,'command':'npm.cmd --prefix apps/frontend-user run test:e2e -- --config='+('playwright.phase12-codex.config.js' if name=='final-owner-33' else 'playwright.phase12-regressions.config.js'),'exit_code':None,'seconds':None,'summary':['INTERRUPTED; not a completed green run'],'log':log.relative_to(ROOT).as_posix(),'log_sha256':sha(log),'hash_valid':True})
    rows.append({'id':'rollback-initial','command':'git apply --reverse --check docs/uxui/phase12-codex-owner-dashboard-audit-2026-11-19/evidence/codex-owned-hunks.patch','exit_code':1,'seconds':None,'log':None,'log_sha256':None,'hash_valid':None,'summary':['Observed tool transcript: LF patch versus CRLF working files did not match. Read-only check; nothing changed. Follow-up --ignore-space-change check passed.']})
    return rows

def source_freeze():
    files=[]
    for directory in ['apps/frontend-user/src','apps/frontend-user/tests/e2e','apps/frontend-admin/src']:
        for path in sorted((ROOT/directory).rglob('*')):
            if path.is_file(): files.append({'path':path.relative_to(ROOT).as_posix(),'sha256':sha(path)})
    return {'sha256':hashlib.sha256(json.dumps(files,sort_keys=True).encode()).hexdigest(),'files':files,'head':git('rev-parse','HEAD').decode().strip()}

def main():
    EVIDENCE.mkdir(parents=True,exist_ok=True)
    archive=Path((OUT/'archive-path.txt').read_text(encoding='utf8'))
    initial=read(archive/'baseline.json')
    save('git-baseline.json',{**initial,'archive':'local external snapshot; absolute path intentionally omitted','resumed_head':RESUMED,'concurrent_commit_confirmed_by_user':True,'concurrent_commit_changed_files':4262,'scope':'No Codex staging or publication occurred before the user-authored concurrent commit.'})
    save('gemini-gate-discrepancy.json',read(archive/'gemini-validation.json'))
    cmd=commands(); save('test-commands.json',cmd)
    freeze=source_freeze(); save('source-freeze.json',freeze)
    files=[]
    originals={row['path']:row for row in initial['files']}
    scopes=['apps/frontend-user','scripts/qa/run-phase12-check.py','scripts/qa/build-phase12-evidence.py','docs/qa','docs/README.md']
    changed=git('diff','--name-only',BASE,'--',*scopes).decode().splitlines()
    changed+=git('ls-files','--others','--exclude-standard','--',*scopes).decode().splitlines()
    for name in sorted(set(changed)):
        path=ROOT/name
        if path.is_file(): files.append({'path':name,'codex_entry_sha256':originals.get(name,{}).get('sha256'),'current_sha256':sha(path),'bytes':path.stat().st_size,'in_resumed_commit':subprocess.run(['git','cat-file','-e',RESUMED+':'+name],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0})
    hunks=[]
    for row in files:
        name=row['path']
        if not name.startswith('apps/frontend-user/') or Path(name).suffix not in ['.js','.jsx','.css']:continue
        entry=archive/'files'/name
        old=entry.read_text(encoding='utf8') if entry.exists() else ''
        current=(ROOT/name).read_text(encoding='utf8')
        hunks += difflib.unified_diff(old.splitlines(keepends=True),current.splitlines(keepends=True),fromfile='a/'+name if entry.exists() else '/dev/null',tofile='b/'+name)
    (EVIDENCE/'codex-owned-hunks.patch').write_text(''.join(hunks),encoding='utf8')
    save('file-attribution.json',{'files':files,'entry_snapshot_preserves_gemini_bytes':True,'codex_patch':'codex-owned-hunks.patch','patch_basis':'Read-only entry snapshot, not the broad concurrent documentation cleanup. Review hunks individually before a forward rollback.','warning':'b18aae3 was user-published during work and includes earlier Codex edits. Current diff alone is not full Phase 12 attribution.'})
    save('changed-files-rollback.json',{'files':files,'instructions':['Review one file/hunk against the external entry snapshot or immutable Git BASE/resumed commit.','Revert only the selected Phase 12 behavior in a new reviewed commit; retain user documentation cleanup.','Never reset, clean, globally restore, force push, or remove ignored archives.'],'protected_paths_unchanged':git('diff','--name-only',BASE,'--','apps/backend','apps/frontend-user/src/features/templates','apps/frontend-user/src/shared/api','apps/frontend-user/src/stores','apps/frontend-user/src/shared/storage','services').decode().splitlines()})
    original_ledger=json.loads(git('show',BASE+':docs/uxui/phase11-codex-event-creation-audit-2026-11-19/evidence/historical-57-plus-new-ledger.json'))
    assert len(original_ledger['historical_entries'])==57
    save('cross-phase-ledger.json',{'preserved_from_commit':BASE,'source_path':'docs/uxui/phase11-codex-event-creation-audit-2026-11-19/evidence/historical-57-plus-new-ledger.json','historical_statuses_are_historical_not_new_certification':True,'ledger':original_ledger,'gemini12_additional_ledger':read(GEMINI/'historical-57-plus-new-ledger.json'),'gemini12_defects':read(GEMINI/'defect-register.json')})
    nav=(ROOT/'apps/frontend-user/src/features/events/workspace/eventNavigationModel.js').read_text(encoding='utf8')
    modules=re.findall(r'path: "([^"]*)", en: "([^"]*)"',nav)
    permissions={'':'VIEW_EVENT','invitation':'EDIT_EVENT','preview':'VIEW_EVENT','media':'MANAGE_INVITATION','guests':'MANAGE_GUESTS','rsvp':'MANAGE_RSVP','wishes':'MANAGE_RSVP','seating':'MANAGE_SEATING','check-in':'MANAGE_CHECKIN','analytics':'VIEW_REPORTS'}
    routes=[{'route':'/app/events','owner':'EventsFeature','css':'EventsFeature.css / scoped OwnerExperience.css','states':['loading','empty','offline local','search','filters','sort','page','calendar']}, {'route':'/app/events/new','owner':'EventCreatePage (preserved)','states':['create','retry','cover recovery','request identity']}]
    routes += [{'route':'/app/events/:eventId'+('/'+module if module else ''),'label':label,'owner':'EventWorkspace + child in hostRoutes.jsx','css':'EventWorkspace.css / scoped OwnerExperience.css','owner_allowed':True,'collaborator_grant':permissions.get(module,'OWNER ONLY')} for module,label in modules]
    save('route-matrix.json',routes);save('role-module-matrix.json',routes[2:])
    save('account-event-races.json',{'C12-001':'First committed frame and deferred account replies; old modal/records and late sync suppressed.','C12-010':'Initial access and refresh share revision ordering; newest revocation wins and removes identity/navigation. Opened Studio retains existing read-only draft recovery.','C12-012':'Unowned legacy drafts stay stored, hidden from authenticated list and auto-sync.','event_switch':'Existing user/event-keyed VerifiedWorkspace remount is the actual synchronous boundary; effect reset alone is not proof.','tests':['Phase12CodexAccountIsolation.test.jsx','workspace/Phase12CodexRevocation.test.jsx','workspace/EventWorkspace.test.jsx','workspace/Phase12_1WorkspaceAuthority.test.jsx'],'live_multiuser_certification':False})
    save('filters-url-pagination.json',{'query_keys':['q','status','type','sort','view','period','page'],'search':'NFC, trimmed for matching, original input retained; replace history while typing','navigation':'Filter/view/page changes push history; clear preserves module and unrelated keys. Page bounds use known loaded filtered records.','sort':'Finite updatedAt/createdAt descending, numeric-aware ID ties; locale title; validated local date with unknown last.','period':'Invalid/missing dates excluded from upcoming and past.','unit_counts':[0,1,11,12,13,25,100],'browser':'25 records with range/history/search; 100-record grid; existing delete-last-page regression retained.','limits':'Invalid view/sort/period uses safe default without destructive URL canonicalization; no claim of server-total pagination.'})
    save('calendar-date-cases.json',{'week_start':'Monday','leap_day':'2028-02-29 covered by inherited current-run component test','keyboard':['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Enter','Space'],'semantics':'Grid rows with one date tab stop; event-chip pointer shortcuts have equivalent selected-date native actions.','date_basis':'Event date strings are calendar days; formatting local noon. Countdown uses browser-local event date/time, or end of day when time absent. API has no separately verified timezone field.','limits':['Native Khmer pronunciation/numerals signoff external','Full DST/invalid API date certification incomplete','No selected-date URL persistence existed; no new route/API added']})
    kpis=[('Guest records','totalGuests','Persisted Guest rows, not seats'),('Invited records','totalInvited','Server invited predicate, not totalGuests'),('Attending','attending','RSVP records, not attendeeCount'),('Declined','declined','NOT_ATTENDING response records'),('Maybe','maybe','MAYBE response records'),('Awaiting reply','pending','Server pending guest predicate'),('Checked in','checkInSummary.checkedIn','Active guest check-in records')]
    save('kpi-data-provenance.json',[{'label':label,'field':field,'unit':unit,'api':'GET /api/v1/invitations/:id/'+('check-in/summary' if field.startswith('checkIn') else 'dashboard'),'permission':'Owner overview; collaborator overview renders separate role-limited surface','missing':'Unavailable','zero':'0 preserved','test':'Phase12CodexDataTruth / inherited DashboardFeature tests'} for label,field,unit in kpis])
    save('chart-data-contracts.json',{'component':'RsvpComposition.jsx','source':'GET /api/v1/invitations/:id/dashboard','categories':['attending','declined','maybe','pending'],'denominator':'totalGuests only when all four counts are nonnegative safe integers and sum exactly to totalGuests','unknown_or_inconsistent':'Text counts retained; proportional track withheld with explicit unavailable message.','zero':'Add guests guidance; no 100% chart.','alternative':'Labeled definition list with count and percentage; color is supplementary.','finance':'Independent USD/KHR ledger totals. Invalid labeled amounts poison that currency total to unavailable; unsupported/unlabeled currency is excluded, never assumed USD.','history':'No series, growth, delivery trend or FX invented.'})
    manifest=[];geometry=[];axes=[]
    for stage in ['before','after','states']:
        for path in sorted((OUT/stage).glob('*.png')):
            manifest.append({'path':path.relative_to(ROOT).as_posix(),'sha256':sha(path),'bytes':path.stat().st_size,'stage':stage,'privacy':'Synthetic fixtures and existing neutral fallback/brand artwork; no customer photos or live accounts.'})
        for path in sorted((OUT/stage).glob('*geometry.json')): geometry.append({'path':path.relative_to(ROOT).as_posix(),'cases':read(path)})
        for path in sorted((OUT/stage).glob('*axe.json')): axes.append({'path':path.relative_to(ROOT).as_posix(),'results':read(path)})
    save('visual-before-after-manifest.json',{'captures':manifest,'baseline':'Independent preview of pre-edit compiled build, frozen 2026-11-19T08:00Z, corrected API fixture; not Gemini screenshot claims.','engines':'Before Chromium; after Chromium/Firefox/WebKit.','raw_images':'Local output ignored; selected synthetic captures reviewed and copied into visuals/.'})
    save('geometry-matrix.json',geometry);save('axe-keyboard-contrast.json',{'axe':axes,'keyboard':'Profile open/Home/End/Escape/outside; rail tooltip; drawer focus/resize/scroll lock; calendar arrows; filter history; pagination.','zoom':'720px equivalent reflow tested. Native 200% zoom and physical AT are not certified.','forced_colors':'Browser emulation exercised; physical Windows high-contrast review open.'})
    visuals=REPORT/'visuals';visuals.mkdir(exist_ok=True)
    for stage in ['before','after']:
        for surface in ['list','overview']:
            for size in ['1440x900','1920x1080','320x568']:
                name=f'{surface}-chromium-{size}-en-light.png';src=OUT/stage/name
                if src.exists():shutil.copy2(src,visuals/(stage+'-'+name))
    if (OUT/'states/khmer-dark-chromium.png').exists():shutil.copy2(OUT/'states/khmer-dark-chromium.png',visuals/'after-khmer-dark.png')
    if (OUT/'states/long-title-320-km-light-chromium.png').exists():shutil.copy2(OUT/'states/long-title-320-km-light-chromium.png',visuals/'after-long-khmer-320.png')
    bundles=[]
    for path in sorted((ROOT/'apps/frontend-user/dist/assets').glob('*')):
        if path.is_file() and re.match(r'(EventsPage|DashboardPage|HostShell|EventWorkspace)',path.name):bundles.append({'file':path.name,'bytes':path.stat().st_size,'gzip_bytes':len(gzip.compress(path.read_bytes())),'sha256':sha(path)})
    save('performance-before-after.json',{'final_assets':bundles,'baseline_build_log':'output/phase12-codex/baseline-build.log','final_build_command':'last-user-build','limits':['Build durations varied with concurrent lab load; not a speedup claim.','No RUM/field INP, physical lower-end device, or p50/p95 certification.','Baseline exact byte inventory was not archived before rebuild; formatted build log remains.'],'runtime_change':'Countdown refresh reduced from every second to every minute; truthful semantic response track adds no chart dependency.'})
    libraries=[
        ('Animate UI','https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md','Independent inspiration','Short menu feedback; existing primitives retained. Commons Clause scope needs exact review before source reuse.'),
        ('Badtz UI','https://github.com/badtzx0/badtz-ui/blob/main/LICENSE.md','Reject source adoption','No need for cursor effects/expandable marketing cards; historical additional terms are not universal commercial clearance.'),
        ('Lightswind UI','https://lightswind.com/license','Independent inspiration','App-shell grouping only. Current page distinguishes SaaS use from competing source/builders; no source copied.'),
        ('Kokonut UI','https://github.com/kokonut-labs/kokonutui/blob/main/LICENSE','Independent inspiration','Quiet account/action grouping; no parallel menu implementation or PRO assets.'),
        ('Untitled UI','https://github.com/untitleduico/react/blob/main/LICENSE','Independent inspiration','Operational filter/result hierarchy; no React Aria/theme reset or PRO source added.'),
        ('shadcn/ui','https://github.com/shadcn-ui/ui/blob/main/LICENSE.md','Independent inspiration','Native controls and current Modal already cover this scope; no CLI init or duplicate primitive stack.'),
        ('React Bits','https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md','Reject source adoption','No decorative effects in owner operations; no restricted component/template output redistributed.'),
        ('Aceternity UI','https://ui.aceternity.com/licence','Independent inspiration','Contextual navigation hierarchy only; no marketplace/template source copied.'),
        ('Magic UI','https://github.com/magicuidesign/magicui/blob/main/LICENSE.md','Independent inspiration','Stable numeric feedback through existing CSS; no ticker dependency or fabricated trend.'),
        ('Skiper UI','https://skiper-ui.com/docs/terms-of-service','Reject source adoption','No drag/scroll effect needed; exact free-component attribution and scope not assumed.')]
    save('ten-library-canonical-matrix.json',[{'library':name,'license_source':url,'decision':decision,'reason':reason,'new_source_copied':False,'new_dependencies':[]} for name,url,decision,reason in libraries])
    queries=[]
    for path in sorted(OUT.glob('research-*.txt')):
        content=path.read_text(encoding='utf-8-sig')
        queries.append({'command':'python .agents/skills/ui-ux-pro-max/scripts/search.py '+path.stem.removeprefix('research-').replace('-',' ')+' --domain '+('chart' if 'whole' in path.name else 'typography' if 'typography' in path.name else 'ux')+' -n 2','raw_output':content,'raw_sha256':sha(path),'disposition':'Reject Khmer off-topic font recommendations; retain project Khmer fonts. Other specific focus, target, motion, empty-state, and chart guidance applied with W3C/source cross-checks.'})
    queries += [{'command':'python .agents/skills/ui-ux-pro-max/scripts/search.py "dashboard hierarchy" --domain product -n 1','result':'0 matches; fallback to retained operations-console grammar, not a verified database design match.'},{'command':'python .agents/skills/ui-ux-pro-max/scripts/search.py "Khmer" --domain typography -n 1','result':'0 matches; retain project typography and external native review.'},{'command':'python .agents/skills/ui-ux-pro-max/scripts/search.py "controlled select keyboard" --stack react -n 2','result':'One Forms/Controlled components result. Preserve native controlled select.'}]
    save('ux-pro-max-queries.json',queries)
    laws=[('Jakob','Familiar native search/select/calendar and event hierarchy','EventsFeature / EventNavigation'),('Hick','Three period choices and compact controls; visible applied criteria','EventsFeature'),('Fitts','44px principal controls; redundant covering FAB removed','OwnerExperience.css'),('Gestalt proximity','Title/control/result grouping; quiet metric strip','OwnerExperience.css'),('Tesler','Secondary module groups preserve all 19 destinations','EventNavigation'),('Doherty','Immediate native filter state; stable data/layout during genuine loading','EventsFeature'),('Nielsen 1','Server/local/sync status and unavailable/zero distinction','EventCard / DashboardFeature'),('Nielsen 3','Clear criteria, Back history, Escape and focus return','Owner browser suite'),('Nielsen 5','No automatic ownership claim; confirmed deletion and request authority','useEvents'),('Nielsen 6','Event context, labeled icons and next actions','EventNavigation / DashboardFeature'),('Nielsen 9','Draft retention, retry and clear recovery','useEvents / EventsFeature')]
    save('ux-law-mappings.json',[{'principle':law,'observed_change':change,'source':source,'evidence':'frozen-owner-browser / current unit suites; no measured decision-time claim'} for law,change,source in laws])
    defects=[
        ('C12-001','P1','Prior account records/delete modal flashed in first committed frame; late sync could update the new view.','Subject-gated render plus session authority fences.','negative-before / negative-after; Phase12CodexAccountIsolation'),
        ('C12-002','P2','totalGuests was described as total invited.','Render totalInvited independently; records are not seats.','Phase12CodexDataTruth red/green'),
        ('C12-003','P2','Missing aggregate fields were fabricated as zero.','Validated nonnegative safe-integer counts; unavailable retained.','Phase12CodexDataTruth red/green'),
        ('C12-004','P2','Past date was declared completed regardless of status.','Date passed plus browser-local event time/end-of-day fallback.','Phase12CodexDataTruth red/green'),
        ('C12-005','P2','Malformed amount poisoned currency math and missing currency was guessed USD.','Invalid known currency total becomes unavailable; no unlabeled USD assumption.','Phase12CodexDataTruth red/green'),
        ('C12-006','P2','Newest comparator had no total order for missing/malformed/tied times.','Finite time fallback and numeric-aware stable ID ties.','Phase12CodexListModel'),
        ('C12-007','P2','Unscheduled events appeared upcoming.','Validated real calendar dates; missing/invalid dates in neither period.','Phase12CodexListModel / browser period count'),
        ('C12-008','P2','Unknown nonnumeric IDs could be labeled Manage event; shared sync flags could select edit action.','Separate backend identity, unsaved changes and relation in list actions.','Phase12CodexListModel / EventCard tests'),
        ('C12-009','P2','Mouse movement during rail collapse replaced the keyboard-focused tooltip.','Keyboard focus description takes precedence over pointer enter.','codex-browser failed; codex-browser-2 green'),
        ('C12-010','P1','Initial owner reply could override a newer access revocation; revoked identity remained in chrome.','Shared access revision; no-grant workspace removes identity/navigation and focuses safe denial.','revocation-red: 2 failed; revocation-green: 41 passed'),
        ('C12-011','P2','User cleanup removed executable route matrices and docs entry point.','Restore only two exact prior JSON fixtures; rebuild concise current docs index.','freeze user/admin 2 failures each; final full suites and repository policy'),
        ('C12-012','P1','Legacy ownerless drafts were visible and automatically claimed by any current owner.','Require owner proof in authenticated Events list/auto-sync; original bytes retained.','unclaimed-draft-red; final-events-dashboard green'),
        ('C12-013','P2','Collapsed desktop header rule hid mobile navigation trigger after resize.','Limit suppression to desktop.','codex-browser failed; codex-browser-2 green on three engines'),
        ('C12-014','P2','Calendar grid lacked rows and composite keyboard movement.','Rows, single date tab stop, arrows/Home/End/Page keys and selected-date actions.','Calendar current unit/browser matrix'),
        ('C12-015','P2','Couple text contrast was 4.49:1 on white in rendered overview.','Semantic gold text, verified by enabled Axe contrast.','design-browser failed; later Axe captures clean'),
        ('C12-016','P3','Floating duplicate Create covered controls at 320px.','Retain header Create; remove duplicate FAB and shorten subtitle.','320px visual review and final visual captures')]
    save('defect-register.json',[{'id':key,'severity':severity,'finding':finding,'repair':repair,'proof':proof,'status':'REPAIRED — LOCAL','limits':'Client/fixture evidence; server still authorizes every request. C12-012 covers Events listing/synchronization, not a new certification of every legacy editor/storage consumer.' if severity=='P1' else 'Bounded to tested source and states.'} for key,severity,finding,repair,proof in defects])
    save('negative-tests.json',{'initial_data_account_suite':'5 failed, 1 passed before; 6 passed after first fixes','revocation':'2 failed before; workspace suite 41 passed after','unclaimed_draft':'1 failed, 3 passed before; complete events/dashboard suite passed after','test_source':['Phase12CodexAccountIsolation.test.jsx','Phase12CodexDataTruth.test.jsx','Phase12CodexListModel.test.js','Phase12CodexRevocation.test.jsx'],'non_red_first':'Visual composition and helper/date edge cases were source-backed improvements without an archived executable red version for every assertion.'})
    save('ci-triage.json',{'initial_run':{'id':44479860498,'sha':BASE,'failed':['Secret Scan','Browser E2E & Route Smoke'],'guest':'Expected Add guest count 0; got 1 on desktop/mobile owner fixture.'},'resumed_run':{'id':44493698838,'sha':RESUMED,'failed':['Deployment Configuration & Docker Applicability','User Frontend Lint, Test, Analysis & Build','Admin Frontend Lint, Test, Analysis & Build','Secret Scan'],'browser':'skipped','source_backed_repairs':['Missing Node process import in Codex test','Missing route fixtures','Missing docs/README.md']},'redacted_secret_finding':read(OUT/'current-ci-secret-classification.json'),'classification':'MASTER_SCOPE.md:121 is ordinary planning prose; no actual credential identified. Scanner remains enabled and its failed result is not green.','new_publication_ci':'Recorded separately after any authorized push.'})
    if (OUT/'secret-classifications.json').exists():save('secret-classifications.json',read(OUT/'secret-classifications.json'))
    if (OUT/'historical-regression-checks.json').exists():save('regression-comparison.json',{
        'historical_records_from_immutable_baseline':read(OUT/'historical-regression-checks.json'),
        'phase02_current':{'passed':26,'failed':6,'classification':'Existing admin Studio preview containment and translated selector failures. Admin source, Phase 02 test, onboarding, and guest source unchanged from ad02; no new failed identity versus the preserved historical failure log.'},
        'guest_current':{'passed':0,'failed':2,'classification':'Same Add guest count expected 0, received 1, owner fixture as historical CI.'},
        'cross_phase_06_08_09_10':{'passed':456,'skipped':65,'failed':1,'classification':'Chromium ERR_ADDRESS_IN_USE before page load; same named case passed separately in c08-connection-replay. Original completed run remains failed, never relabeled 457/0.'},
        'theme_transition_trial':'One Chromium Axe trial inspected an intermediate light/dark color transition. Explicitly await finite animations and fonts for steady-state screenshots/contrast. Settled three-engine trial passed; no Axe rules suppressed.',
        'comparison_limit':'Historical raw logs retain local ignored paths. Counts and immutable record hashes are preserved; native device and release certification remain open.'})
    if (OUT/'phase02-failure-comparison.json').exists():save('phase02-failure-identities.json',read(OUT/'phase02-failure-comparison.json'))
    inventory=[]
    for directory in ['apps/frontend-user/src/features/wedding-builder','apps/frontend-user/src/features/invitations','apps/frontend-user/src/features/templates/registry']:
        inventory += [path.relative_to(ROOT).as_posix() for path in sorted((ROOT/directory).rglob('*')) if path.is_file()]
    inventory += [name for name in git('ls-files','apps/frontend-user/src').decode().splitlines() if re.search(r'preview|Preview|EventInvitation|draftPublish|hostRoutes',name) and name not in inventory]
    save('phase13-studio-source-inventory.json',{'scope':'Read-only discovery inventory for Phase 13.1, not implementation or certification.','files':inventory,'count':len(inventory),'protected':['Unknown JSON roundtrips','Owner-bound drafts and request identity','Revision/conflict handling','Preview origin/frame/session authority','Server prices and entitlements','Renderer identities, aliases and guest isolation']})
    gemini=read(GEMINI/'phase12-1-acceptance-44.json')
    partial={2:'Cross-phase source preservation and executed coverage are recorded; historical/live certifications are not renewed.',10:'Requested design skills used; StyleSeed legacy bundle exists but lock/registry is missing, so deterministic gate cannot certify.',13:'Local/server/shared behavior tested; exhaustive stale/ambiguous server combinations remain bounded.',14:'Missing data handled; exhaustive malformed-date metadata display across every old consumer not certified.',23:'Leap/month/day behavior exercised; full DST and malformed API date matrix incomplete.',25:'List and retry/account isolation verified; unknown legacy ownerless drafts retained for separately authorized recovery.',27:'Events account transitions verified; every legacy editor/cache consumer requires Phase 13 follow-through.',37:'EN/KM rendered; native cultural/linguistic signoff remains external.',38:'Nine viewport geometries and long localized text checked; native zoom/physical devices open.',39:'Axe/keyboard/forced-color emulation exercised; physical AT and native 200% zoom remain open.',40:'Reduced motion and emitted bytes checked; field performance and physical low-end device remain external.',41:'All actual commands and inherited/environmental failures retained; no universal release certification.',42:'57 exact historical entries and separate ledgers retained from immutable Git source; no new closure claims.',44:'User-published concurrent checkpoint acknowledged; this audit publication result is separate.'}
    review={3:'Actual CI red/skipped state independently retrieved; DevOps owns external rerun/secret classifier.'}
    rows=[]
    for row in gemini['gates']:
        number=int(row['gate'].split('-')[-1]); status='REVIEW REQUIRED' if number in review else 'PARTIALLY COMPLETE' if number in partial else 'VERIFIED — LOCAL'
        rows.append({'id':row['gate'],'topic':row['name'],'gemini_verdict':row['status'],'codex_verdict':status,'evidence':review.get(number,partial.get(number,'Current source, exact command register and named browser/unit fixtures; see topic reports.')),'owner':'Native Khmer reviewer' if number==37 else 'Accessibility/device QA' if number in [38,39] else 'Codex / relevant domain owner'})
    save('f12-independent-44.json',{'rows':rows,'counts':dict(collections.Counter(row['codex_verdict'] for row in rows)),'total':len(rows),'reported_summary':gemini['summary'],'actual_gemini_itemized':dict(collections.Counter(row['status'] for row in gemini['gates']))})
    visual=[]
    for number in range(1,17):
        partial_reason={12:'Emulated forced colors/reflow and EN/KM themes checked; native zoom/physical devices unverified.',14:'Exact desktop before/after captured; baseline only Chromium and annotated artifact/manifest bounded to fixtures.',15:'Canonical ten and queries corrected; StyleSeed deterministic registry remains unavailable.'}.get(number)
        visual.append({'id':f'UX12-C{number:02}','status':'PARTIALLY COMPLETE' if partial_reason else 'VERIFIED — LOCAL','evidence':partial_reason or 'Scoped source + frozen-owner-browser, current unit tests and actual geometry/capture evidence.','release_certification':False})
    save('ux12-visual-16.json',{'rows':visual,'counts':dict(collections.Counter(row['status'] for row in visual)),'total':16})
    save('publication-gates.json',{'branch':git('branch','--show-current').decode().strip(),'resumed_ancestor':RESUMED,'external_publication_already_occurred':True,'concurrent_change_confirmed_by_user':True,'required_checks':'See test-commands; evaluate latest frozen results, not intermediate failures alone.','staging':'Not implied by this generator. Explicit reviewed paths only.','external_open_gates':['Native Khmer','Physical AT/device/native zoom','Asset rights inventory 358 assets','Live providers/MySQL/settlement/RUM','Existing CI secret/guest failures'],'development_checkpoint_only':True})
    if not (EVIDENCE/'publication-result.json').exists():save('publication-result.json',{'status':'NOT YET PUBLISHED BY CODEX','user_published_checkpoint':RESUMED,'note':'Do not confuse user concurrent publication with a completed Codex audit.'})
    save('styleseed-review.json',{'bundle':'Retained legacy operations-console × product-ui × productivity/list','deterministic_result':'SS000: .styleseed/project.json registry missing; legacy --from-lock also fails because root lock is absent. No configuration was invented.','manual_craft_review':{'color':14,'hierarchy_typography':14,'layout':11,'cards_elevation':9,'states_a11y':14,'motion':5,'coherence':10,'distinctiveness':8,'total':85},'scope':'Manual source/pixel assessment, not deterministic StyleSeed compliance or human design acceptance.'})
    write_reports(cmd, geometry)
    write_comparison()
    validate_package()


def write_comparison():
    panels=[]; measurements=[]
    for surface in ['list','overview']:
        figures=[]
        for stage in ['before','after']:
            data=read(OUT/stage/f'{surface}-chromium-geometry.json')
            row=next(row for row in data if row['viewport']['width']==1440)
            marks=[]
            selectors=['.events-page-header','.events-filters-container','.event-card'] if surface=='list' else ['.event-workspace-sidebar','.overview-hero','.overview-metrics']
            for number,selector in enumerate(selectors,1):
                rect=row['rects'].get(selector)
                if rect:marks.append(f'<rect x="{rect["x"]}" y="{rect["y"]}" width="{rect["width"]}" height="{rect["height"]}"/><text x="{rect["x"]+6}" y="{rect["y"]+18}">{number}</text>')
            src=f'visuals/{stage}-{surface}-chromium-1440x900-en-light.png'
            figures.append(f'<figure><figcaption>{stage.title()} · {surface} · 1440×900</figcaption><div class="image"><img src="{src}" alt="{stage} synthetic {surface} state"><svg viewBox="0 0 1440 900" aria-hidden="true">'+''.join(marks)+f'</svg></div><a href="{src}">Open original capture</a></figure>')
        old=read(OUT/'before'/f'{surface}-chromium-geometry.json');new=read(OUT/'after'/f'{surface}-chromium-geometry.json')
        for width in [1440,1920]:
            a=next(row for row in old if row['viewport']['width']==width);b=next(row for row in new if row['viewport']['width']==width)
            for selector in ['.host-header-container',*selectors]:
                first=a['rects'].get(selector);second=b['rects'].get(selector)
                if first and second:measurements.append({'surface':surface,'width':width,'selector':selector,'before':first,'after':second,'top_delta_px':round(second['y']-first['y'],2),'height_delta_px':round(second['height']-first['height'],2),'width_delta_px':round(second['width']-first['width'],2)})
        panels.append('<section><h2>'+surface.title()+'</h2><div class="pair">'+''.join(figures)+'</div></section>')
    save('geometry-comparison.json',measurements)
    rows=''.join(f'<tr><td>{row["surface"]} {row["width"]}</td><td>{row["selector"]}</td><td>{row["before"]["y"]:.1f}</td><td>{row["after"]["y"]:.1f}</td><td>{row["top_delta_px"]:+.1f}</td><td>{row["width_delta_px"]:+.1f}</td></tr>' for row in measurements)
    html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Koupreng Phase 12 visual evidence</title><style>body{margin:0;padding:32px;background:#f8faf8;color:#1f2421;font:16px/1.6 system-ui,sans-serif}h1{font-size:28px;margin:0}p{max-width:90ch}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0}figcaption{font-weight:700;padding:8px 0}.image{position:relative}img{width:100%;display:block}svg{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}rect{fill:none;stroke:#b91c1c;stroke-width:3;stroke-dasharray:8 5}svg text{font:bold 18px system-ui;fill:#b91c1c;paint-order:stroke;stroke:white;stroke-width:4px}a{color:#1d5c77}table{border-collapse:collapse;width:100%;margin-top:24px}td,th{border-bottom:1px solid #ccd5cc;padding:8px;text-align:left;font-variant-numeric:tabular-nums}@media(max-width:800px){.pair{grid-template-columns:1fr}}</style><h1>Phase 12: measured owner experience</h1><p>Independent synthetic owner fixture; event 42, 19 November 2026, English/light. The outlines annotate title/toolbar/card or sidebar/hero/metrics. Original captures remain unmodified. Before uses the preserved pre-edit production preview; after uses final reviewed assets. Desktop baseline is Chromium only.</p>'''+''.join(panels)+'<h2>DOM geometry (CSS pixels)</h2><p>Negative top delta means the element begins higher. These are measured positions, not a universal wasted-space score.</p><table><thead><tr><th>Case</th><th>Element</th><th>Before top</th><th>After top</th><th>Top delta</th><th>Width delta</th></tr></thead><tbody>'+rows+'</tbody></table></html>'
    (REPORT/'comparison.html').write_text(html,encoding='utf8')


def validate_package():
    # Hash published text bytes consistently on Windows and Linux checkouts.
    for path in REPORT.rglob('*'):
        if path.is_file() and path.suffix in ['.md','.json','.html','.patch']:
            path.write_bytes(path.read_bytes().replace(b'\r\n',b'\n'))
    errors=[]; links=0; docs=list(REPORT.glob('*.md'));jsons=list(EVIDENCE.glob('*.json'))
    for path in docs:
        for target in re.findall(r'\]\(([^)]+)\)',path.read_text(encoding='utf8')):
            if target.startswith(('http:','https:','#','mailto:')):continue
            links+=1
            if not (path.parent/target.split('#')[0]).exists():errors.append({'file':path.name,'missing':target})
    for path in jsons:read(path)
    f=read(EVIDENCE/'f12-independent-44.json');v=read(EVIDENCE/'ux12-visual-16.json');ledger=read(EVIDENCE/'cross-phase-ledger.json')
    assert len(f['rows'])==44 and sum(f['counts'].values())==44
    assert len(v['rows'])==16 and sum(v['counts'].values())==16
    assert len({row['id'] for row in ledger['ledger']['historical_entries']})==57
    save('evidence-validation.json',{'markdown_count':len(docs),'json_count_including_validation':len(jsons)+(not (EVIDENCE/'evidence-validation.json').exists()),'reviewed_visual_count':len(list((REPORT/'visuals').glob('*.png'))),'relative_links_checked':links,'relative_link_errors':errors,'json_parse_errors':[],'f12_rows':44,'ux12_rows':16,'historical_unique_ids':57,'package_hashes':[{'path':path.relative_to(REPORT).as_posix(),'sha256':sha(path)} for path in sorted(REPORT.rglob('*')) if path.is_file() and path.name!='evidence-validation.json']})
    if errors:raise SystemExit(json.dumps(errors))
    print(json.dumps({'markdown':len(docs),'json':len(list(EVIDENCE.glob('*.json'))),'relative_links':links,'link_errors':0,'f12_counts':f['counts'],'ux12_counts':v['counts']},indent=2))


def write_reports(cmd, geometry):
    REPORT.mkdir(parents=True,exist_ok=True)
    titles=[
        'git-baseline-origin-and-provenance','gemini-claims-and-f12-count-reconciliation','source-route-and-component-ownership',
        'screenshot-defects-navbar-sidebar-empty-space','premium-art-direction-and-layout-architecture','host-navbar-menu-locale-theme-focus',
        'workspace-sidebar-icons-drawers-scroll','event-list-and-card-composition','compact-search-filter-sort-dropdowns',
        'pagination-url-history-and-zero-states','inline-calendar-month-agenda-and-timezones','dashboard-hero-kpi-and-next-actions',
        'server-sourced-charts-and-accessible-alternatives','owner-shared-local-and-sync-provenance','account-event-races-and-revoked-access',
        'permissions-and-cross-module-route-safety','khmer-english-fonts-and-native-signoff','light-dark-forced-colors-keyboard-zoom',
        'responsive-geometry-mobile-landscape','motion-performance-bundle-and-browser-reliability','ui-ux-pro-max-and-canonical-ten-library-matrix',
        'ux-laws-and-nielsen-heuristics-mapping','github-ci-secret-and-guest-test-triage','defect-register-negative-tests-and-verified-repairs',
        'all-exact-test-commands-and-failure-register','independent-f12-01-to-44-acceptance','ux12-c01-to-c16-visual-acceptance',
        'all-57-and-newer-cross-phase-gates','attributed-changes-snapshots-and-rollback','safe-commit-push-ci-verification',
        'phase13-1-gemini-studio-execution-handoff']
    bodies={
1:'''The entry branch was `main`, with local HEAD and origin/main both at `ad02a26345f2beed2e8d0d28459de7fac1f8aef8`. Seven tracked source files were dirty and Gemini tests/config/reports were untracked. A read-only external snapshot preserved 145 files and the inherited binary-capable patch before source edits. Every reported source post-hash and all 16 inherited PNG hashes matched live bytes; all 25 JSON inputs parsed.

During QA, the user created/pushed `b18aae3f144ea599da29c13f2ef448aa33ba08a2`, which included in-progress Phase 12 work and a much larger documentation cleanup (4,262 files changed). Codex stopped source edits, reviewed the commit and remote, and asked under prompt §29. The user explicitly confirmed its origin and instructed review/resumption. This is the resumed publication ancestor; it was not a Codex audit publication. Only two executable route fixtures and a concise docs entry point were repaired from that cleanup. No blanket restore or history rewrite occurred.

See [baseline](evidence/git-baseline.json), [attribution](evidence/file-attribution.json), and [rollback](evidence/changed-files-rollback.json).''',
2:'''Gemini's JSON item rows contain **41 VERIFIED—LOCAL, 2 REVIEW REQUIRED and 1 PARTIALLY COMPLETE**. Its summary says **39, 3 and 2**. Both sum to 44, but the classifications disagree. Neither source was silently rewritten. The independent 44-row register retains each original verdict and assigns a new bounded outcome; its counts are generated from rows.

The canonical design references were incorrectly substituted with stack dependencies. That is corrected by an actual ten-library decision register. The screenshot fixture also used wrong dashboard/finance/check-in paths and the wrong local-draft storage key; screenshots therefore did not prove its claimed populated metrics/draft coverage. New independent fixtures use the actual APIs and storage contract. Effect-based reset prose was also overstated: the existing account/event key is the synchronous workspace boundary, while the list needed an additional first-frame subject gate.

See [input integrity and discrepancy](evidence/gemini-gate-discrepancy.json), [independent rows](evidence/f12-independent-44.json), and [canonical references](evidence/ten-library-canonical-matrix.json).''',
3:'''`HostShell` owns authenticated host spacing, the skip destination and preview/Studio exclusions. `HostNav` owns logo, four primary destinations, profile/account menu, locale/theme and mobile main menu. `EventWorkspace` owns verified event identity, access refresh, module guard, sidebar/drawer and content context. `EventNavigation` renders the 19 destinations (overview plus 18 modules) from the unchanged navigation model. `EventsFeature` owns collection URL state, list/calendar, filters, pagination and deletion presentation; `useEvents` owns scoped loading, local merge/sync and acknowledged deletion.

`DashboardFeature` remains the owner overview. Non-owner overview uses the separate role-limited workspace surface, so owner charts and finance requests are not mounted there. `RsvpComposition` renders a static aggregate response snapshot with a definition-list alternative. Styling is owned by existing component sheets plus the explicitly host-scoped `OwnerExperience.css`; public invitations, marketing navigation and admin do not import that sheet.

The [route matrix](evidence/route-matrix.json) records every destination and [role matrix](evidence/role-module-matrix.json) records the exact grant mapping. The unchanged `/app/events/new`, preview exceptions, aliases, backend-owned entitlements and renderer identities remain contracts, not redesign opportunities.''',
4:'''The independent baseline reproduced the long gap below host navigation and the sprawling detached filter panel. The new title, native controls and result summary form one compact operational header. The final header action remains; the redundant floating Create button was removed because it covered controls at 320px. Cards retain authored-source fallback behavior and one clear primary action, with edit/delete in the overflow disclosure.

The overview no longer pairs a tall sparse hero with a disconnected checklist. It uses a shorter event identity, a four-metric strip, then response composition beside preparation. Financial records sit in their own comparable section. The sidebar is narrower and shares document scrolling rather than requiring a second menu scrollbar. Compare the same event 42, owner role, frozen date, English/light and viewport in the selected images. These are synthetic API fixtures, not live customer records.

[Annotated desktop comparison](comparison.html), [capture hashes](evidence/visual-before-after-manifest.json), and [measured geometry](evidence/geometry-matrix.json) are the evidence. Before captures are independently rendered Chromium; no Firefox/WebKit before-build claim is made.''',
5:'''The compact plan keeps the existing ivory `#fbf6ee`, white `#ffffff`, forest `#2e433a`, warm gold `#926c34`, ink `#1f2421` and muted green `#59615c` roles. Components consume the existing semantic theme variables, with existing Khmer/Latin font stacks and readable Khmer leading. There is no new font, icon family, chart package, photograph, global reset or animation engine.

The first draft was reviewed against the actual brief: a generic equal-card dashboard would bury the event task. The final composition instead makes the event identity/action the focal point, uses a quiet metric strip, and places real response status next to preparation. Dense navigation stays secondary. A long decorative masthead, repeated all-caps branding and a floating action covering filters were removed. Mobile keeps the same tasks in normal flow.

Desktop composition: `host bar → event scope/title → event identity/action → comparable records → responses | preparation → finance/tools`. Collection composition: `host bar → title + Create/view → period + native filters → range → event grid`. [Manual craft review](evidence/styleseed-review.json) is an assessment under the retained operations-console bundle; it is not human acceptance or a deterministic certificate.''',
6:'''Host chrome now uses a consistent 64px inner bar with an 80px compensated top offset, restrained rectangular rounding, left-aligned icon/text navigation and a quiet active pill. Nested numeric event routes keep My Events current. The original logo, actual account identity, theme toggle and KM/EN control remain. No notification number, fake status or new security setting was introduced.

The account menu supports ArrowUp/Down opening, initial item focus, Home/End, Escape with trigger return, Tab dismissal and outside dismissal. Account ID and navigation changes close menus; image identity is keyed by actual source. Mobile uses the existing native dialog and existing background/scroll isolation. Keyboard and locale/theme interactions are exercised in each browser engine, separately from physical screen-reader certification.

See the profile/nav tests and capture records in [commands](evidence/test-commands.json) and [accessibility](evidence/axe-keyboard-contrast.json). The first independent profile test had an ambiguous selector matching both the visible trigger and hidden drawer link; the locator was corrected to the actual button, not misreported as an application failure.''',
7:'''The event sidebar is 240px expanded and 72px collapsed. It keeps event switcher, actual status, logical groups, active state, Lucide icon/text labels and owner-keyed stored preferences. All 19 destinations remain represented in the source model; group disclosure controls visibility rather than deleting routes. Collapsed tooltips preserve the keyboard-focused label even if pointer movement caused by layout collapse enters a different item.

Desktop sidebar/main content now use document scrolling. There is no viewport-bounded sidebar scroll host in the selected desktop render. The mobile drawer retains its necessary modal scroll body and focus isolation. A discovered selector conflict hid its trigger after resizing a collapsed rail to mobile; that rule is now desktop-only. Escape, focus return, background lock and resize closure pass the dedicated engine matrix.

Permission filtering still calls `moduleAllowed`. Owner-only paths are absent for viewers; package locks reflect actual source features. Studio retains its established focused workspace/recovery exclusions. [Role mapping](evidence/role-module-matrix.json), [geometry](evidence/geometry-matrix.json) and [defects](evidence/defect-register.json) describe the boundaries.''',
8:'''The collection uses a purposeful masthead with one Create action, a List/Calendar control, concise localized subtitle and compact labeled controls. Desktop uses three consistent cards; tablet uses two; mobile uses one. Covers keep existing owner → invitation → template → neutral fallback resolution. Missing photos are not replaced with fabricated couples. Existing neutral template artwork is the synthetic screenshot fallback.

The footer now has a clear Manage/Resume action, Preview and a restrained overflow disclosure; duplicated Edit in the primary footer was removed while retaining Edit in the overflow. Shared cards omit edit/delete. Backend identity and unsaved synchronization are separate facts in list actions, so unknown nonnumeric records cannot imply an acknowledged server workspace. Local owner-proven drafts remain recoverable after a failed background save.

Empty and filtered states keep their create/clear/retry actions. The loaded filtered range does not claim server-total pagination. Unit coverage includes card provenance, neutral cover failure and acknowledged deletion recovery. [Provenance/data register](evidence/filters-url-pagination.json) and the reviewed before/after images show the actual result.''',
9:'''Native controlled selects were retained for status, type and sort, preserving browser keyboard/typeahead behavior. The search control has a visible label, icon, real clear button and focus return. Matching normalizes query and actual text to NFC and trims for comparison while retaining the original typed query. No new search API, autocomplete service or inaccessible faux select was added.

Period choices use ordinary pressed buttons rather than incomplete tabs. Selected criteria remain visible as removable chips; Clear preserves unrelated context such as `module`, and focus returns to search. Search keystrokes replace history, while filter/view/page changes push meaningful history. Back/forward is exercised with 25 records. Invalid enums use safe defaults; malformed/huge page values cannot produce an empty slice.

Newest sorting now has a total order across finite/missing/malformed updated/created times, with numeric-aware ID ties. Title ordering is locale/NFC aware; date ordering uses validated calendar dates with unknown last. [URL/filter contract](evidence/filters-url-pagination.json) and the model/browser tests are the evidence; no unimplemented sort choice is shown.''',
10:'''Pagination remains client-side over the known loaded filtered records, 12 per page. It now exposes bounded numbered pages and ellipses, semantic current-page state and Previous/Next. The visible range is calculated from the clamped current page. A changed filter resets the page; page navigation moves focus to the result summary. Large/negative/noninteger page inputs are safely bounded without deleting unrelated URL state.

The model exercises 0, 1, 11, 12, 13, 25 and 100 records. Browser evidence covers the second page/range, back history, a no-match search and a 100-record collection. The inherited delete-last-item regression verifies the list returns to the remaining page after acknowledged removal and retains data after failure. Zero results offer Clear filters; zero events offer Create.

[Filter/pagination evidence](evidence/filters-url-pagination.json) identifies the commands. Native select popup pixels and physical touch operation are not certified by these emulated browser cases.''',
11:'''The authoritative calendar remains `/app/events?view=calendar`; no separate calendar route or API was introduced. Monday-first indexing and the existing month/agenda view remain. Current component tests exercise leap day 2028-02-29 and Khmer weekday/month labels. The calendar now has row semantics, one date tab stop and Arrow/Home/End/PageUp/PageDown movement; Enter/Space select date details with native Manage/Resume actions.

Period filtering validates true calendar days, rejecting missing/rolled-over dates from Upcoming/Past. Calendar formatting remains based on local calendar dates; the countdown now uses the event time or local end of day rather than UTC midnight. The server contract does not supply a separately verified event timezone, so a cross-timezone/complete-DST certificate is not claimed. InitialDate support is retained and selected-date URL persistence was not an existing feature.

[Date cases](evidence/calendar-date-cases.json) distinguishes tested fidelity from incomplete malformed-API/DST breadth. Agenda is an existing aggregate list; there is no invented booking/reminder capability.''',
12:'''The overview now makes event title, date/time, venue, real publication status and the next source-backed action readable in a shorter first viewport. Duplicate couple text is omitted when already contained in the title. Guest, confirmed, pending and check-in records form a single comparable strip; financial ledgers are separate so they do not push all response/preparation tasks below a wall of equal tiles.

The actual preparation rules remain: event details, selected invitation, publication, guest records and recorded delivery. A completed milestone requires its real predicate; the UI does not invent 5/5 or a delivery success. Published next actions distinguish adding guests, sharing invitations and tracking responses. No owner chart or finance dashboard is mounted for the separate collaborator overview.

The prior fallback mixed guests/seats/responses with `Math.max`; it is removed. Missing aggregates remain unavailable, totalInvited is independent, and a past scheduled date says Date passed. [KPI register](evidence/kpi-data-provenance.json), negative tests and the [comparison](comparison.html) substantiate these changes.''',
13:'''The new response track is an independently implemented semantic snapshot, not a fabricated trend. It uses the actual invitation dashboard's attending, declined, maybe and pending record counts. Proportions render only when all counts and totalGuests are nonnegative safe integers and the categories sum exactly to that denominator. Zero produces guidance; unavailable/inconsistent snapshots preserve text counts without a misleading full bar.

The definition list provides category/count/percentage text independently of color; the visual bar is supplementary. There is no hover-only data, tooltip needing focus, animation loop or chart dependency. Budget and gifts remain independent USD/KHR totals. An invalid amount makes that labeled currency unavailable instead of silently zero; an unlabeled currency is never assumed USD. No FX conversion or history is manufactured.

[Chart contract](evidence/chart-data-contracts.json) and [KPI register](evidence/kpi-data-provenance.json) map each source and unit. These are owner fixture/browser checks, not provider settlement or live analytics certification.''',
14:'''Server identity is a valid numeric backend ID, while unsaved changes, local provenance and sharing are separate facts. Shared cards do not expose owner destructive/edit actions. Local/non-numeric records use the supported legacy editor path; valid backend IDs use the verified workspace. A partial save retains original request UUID and local payload through existing Phase 11 mechanisms. No local badge grants owner/server authority.

Authenticated list/sync now requires actual ownerUserId proof. Ownerless legacy records remain unchanged in browser storage and are excluded from automatic claim/upload to the account that happens to open Events. This is a privacy boundary for Events, not a new certification of every legacy Studio/storage consumer. That broader authored-draft recovery/ownership review belongs in the explicit Phase 13 handoff.

The legacy storage implementation itself was not rewritten or erased. [Account evidence](evidence/account-event-races.json), [negative tests](evidence/negative-tests.json) and full current unit suites document the preserved/repaired behavior. Ambiguous stale server/local combinations remain a bounded partial gate rather than universal provenance certification.''',
15:'''A layout-effect probe records the first committed frame after account A→B. The old list and open delete target must already be absent in B; waiting for a passive reset effect is insufficient. Separate deferred tests prove A's late list reply cannot replace B, and a late synchronization cannot update B's display or claim the old record. The original draft bytes and request identity remain retained.

Workspace identity already remounts on account/event key; that is preserved. A newly reproduced access race used two independent revision domains: an initial owner response could overwrite a newer revocation. Both now share a single revision counter. An event with no current grants renders a safe denial and removes its identity/navigation; an already open Studio retains its established read-only draft recovery contract. Older refresh replies cannot restore revoked actions.

[Race register](evidence/account-event-races.json) and [red/green evidence](evidence/negative-tests.json) state the scope. Backend authorization and the Phase 11 account-bound HTTP cancellation remain ultimate and unchanged; no visual hiding is represented as server authorization.''',
16:'''The route/module contract remains `moduleAllowed(path, owner, permissions)`. Owners retain all existing module destinations; collaborators receive only mapped grants. Budget, gifts, delivery, settings, team and other owner-only destinations are not inferred from VIEW_EVENT. Direct denied URLs fail closed. A source-backed separate collaborator overview does not request owner financial aggregates.

The existing numeric route guards, RequireAuth, preview/Studio exceptions and legacy continuation remain. No Java controller, entitlement selector, payment flow, invitation renderer or applied migration changed. Current route tests reconcile exact leaf patterns against the restored immutable route fixtures. Existing guest RSVP authority, account-switch HTTP isolation, create request UUID, partial-cover retry and media ownership are regression invariants.

[Role matrix](evidence/role-module-matrix.json) and [attribution](evidence/file-attribution.json) distinguish UI affordances from server grants. Live multiuser HTTP/MySQL authorization is not newly certified by mocked browser success.''',
17:'''The existing project Khmer/English font stacks and language controls remain. New copy is plain and task-oriented; there is no new Latin-only display font or script-splitting animation. Titles, venue and control labels can wrap, with Khmer diacritic leading retained. Long synthetic Khmer event titles are exercised in the added narrow browser case; native linguistic/cultural approval remains explicitly external.

UI UX Pro Max's broad Khmer typography query returned off-topic recommendations. The required narrower retry returned zero. Those recommendations were rejected rather than persisted as Khmer expertise; the project typography guidance is the documented fallback. English/Khmer rendering is development evidence, not native pronunciation/numeral/terminology certification.

[Query transcripts](evidence/ux-pro-max-queries.json), [captures](evidence/visual-before-after-manifest.json) and [external carryovers](evidence/cross-phase-ledger.json) retain this distinction. Do not mark the native signoff gate closed from these screenshots.''',
18:'''Actual routes were exercised in light/dark themes, EN/KM, keyboard operation, reduced motion and forced-colors emulation. Axe's color-contrast rule remained enabled. A measured 4.49:1 couple-name failure was repaired with a semantic theme color; later sampled reports have their actual violations/incomplete results preserved. No suppression was added to make checks green.

The drawer/profile/calendar/pagination interactions have programmatic names and visible focus; focus return/scroll lock are tested. Principal controls aim at 44px, while WCAG 2.2 AA minimum target acceptance is 24 CSS px or a valid exception. The 720px equivalent-reflow test is labeled honestly; it is not native browser 200% zoom. Physical NVDA/VoiceOver/TalkBack, text enlargement/native zoom and Windows system high-contrast review remain open.

[Axe and keyboard evidence](evidence/axe-keyboard-contrast.json) contains the bounded results. W3C [focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) and [target-size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) guidance informed acceptance.

The added 320px long Khmer title case cycles KM/light, KM/dark, EN/dark and EN/light in all three engines. A first Chromium trial sampled intermediate theme-transition colors; the corrected steady-state inspection awaits finite animations and document fonts before Axe and screenshots. No Axe rule is disabled. The reviewed [narrow Khmer capture](visuals/after-long-khmer-320.png) supplements the viewport geometry checks.''',
19:'''Independent list/overview geometry is recorded at 1920×1080, 1440×900, 1280×720, 1024×768, 768×1024, 393×851, 360×800, 320×568 and 844×390 in the after engine matrix. The baseline is Chromium at those same viewports. Rectangle positions, content widths, sidebar dimensions and explicit scroll hosts accompany screenshot hashes. Zero horizontal document overflow is a measured property, not the sole visual-quality claim.

Human pixel review inspected desktop, narrow mobile and Khmer dark full-page composition. The 320px review caught the duplicate FAB covering filter content, leading to its removal while preserving the header action. The new sidebar shares the document scroll; the modal retains its necessary independent scroll region and focus isolation. Short landscape/200%-equivalent layout and focused controls are separately tested.

[Geometry matrix](evidence/geometry-matrix.json), [comparison](comparison.html) and selected [1440px overview](visuals/after-overview-chromium-1440x900-en-light.png) provide evidence. Physical browser bars, virtual keyboards and real device responsiveness remain external.''',
20:'''No runtime dependency was added. Standard feedback uses existing duration/easing tokens, color/opacity/transform where needed, and a complete reduced-motion result. The response snapshot does not animate a fabricated history. The countdown refresh is once per minute rather than once per second. Native controls and a small CSS response track avoid a chart bundle and animation loop.

Final emitted route chunk raw/gzip bytes and hashes are recorded. The baseline build's formatted output remains, but an exact raw byte inventory was not copied before rebuilding; no false precise baseline inventory is invented. Build times varied with concurrent lab workload, so they are not presented as a speedup. No field INP/RUM or physical low-end device result is claimed.

Browser reliability logs retain a port collision, incorrect admin preview origin, interrupted unfrozen runs and genuine assertion failures. Correctly configured/frozen reruns are separate. [Performance evidence](evidence/performance-before-after.json) and [commands](evidence/test-commands.json) give the actual results.''',
21:'''The actual canonical ten are Animate UI, Badtz UI, Lightswind UI, Kokonut UI, Untitled UI, shadcn/ui, React Bits, Aceternity UI, Magic UI and Skiper UI. Each has a recorded source/license link, current implementation decision and use-case rationale. None supplied new copied source or dependencies in this phase. This is independent inspiration/rejection, not installation of ten packages or legal clearance for their entire catalogs.

Commons Clause, Badtz additional conditions, builder/source resale restrictions, paid/free separation and attribution uncertainties remain explicit. Existing project vendor notices were not removed. Dribbble's dashboard/sidebar listing was consulted for hierarchy concepts; no screenshot/photo/markup was downloaded into product code. W3C native-control, tabs, focus and target contracts take precedence over appearance.

[Canonical matrix](evidence/ten-library-canonical-matrix.json), [actual query outputs](evidence/ux-pro-max-queries.json) and [StyleSeed result](evidence/styleseed-review.json) correct the inherited claims. The retained legacy StyleSeed bundle was read, but its root lock/current registry is missing; the deterministic checker reports SS000. No fake registry or compliance certificate was generated.''',
22:'''Jakob's Law is expressed through familiar native controls, ordinary links and event hierarchy. Hick's Law motivates three period choices and grouping secondary destinations. Fitts's Law motivates reachable principal targets. Gestalt proximity groups title/actions, search/criteria and comparable records. Tesler's Law keeps all operational complexity accessible through readable groups rather than removing rare modules. Immediate filter state supplies genuine feedback without claiming a measured user-decision time.

Nielsen #1 is demonstrated by provenance, zero/unavailable and loading states; #3 by clear/history/Escape; #5 by no silent ownership claim, verified request identity and confirmation; #6 by labeled event context and next action; #9 by preserved drafts and retry. Each mapping points to actual source/fixtures in the machine register. Miller's 7±2 is not used as an item limit or justification for hiding destinations.

[Observable mappings](evidence/ux-law-mappings.json) are design rationale, not usability-study evidence. They can guide the next Studio phase without substituting a theory label for tests.''',
23:'''Initial run [44479860498](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/44479860498) at ad02a263 had Secret Scan and Browser E2E failures. The securely redacted secret artifact identifies one generic-api-key finding at MASTER_SCOPE.md:121; inspected content is planning prose, not a credential. The scanner was not disabled and its failure remains a failure. The guest owner fixture expected zero Add guest buttons but received one; hiding that valid owner affordance just for a test is outside this phase.

The concurrent b18aae3 [run 44493698838](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/44493698838) additionally failed user/admin and repository-policy checks, and skipped browser. Logs identify the missing Node process import, deleted route matrices and missing docs/README. Those narrowly scoped repairs are recorded separately from the historical guest/secret issues. The new push, if performed, gets its own run/status and must not be called green while queued/running/red.

[CI triage](evidence/ci-triage.json) retains actual job IDs and redacted classification. The independently checksum-verified Gitleaks 8.30.1 scan of an exported tracked/reviewed tree found three matches: the same planning prose and two static synthetic JWT-signing test fixtures. All three are unchanged from ad02 after Git newline normalization. [Redacted classifications](evidence/secret-classifications.json) retain path/line/rule evidence without credential values. This scanner result is classified red, not green; no scanner was disabled. No external message, deployment or credential rotation was performed.''',
24:'''The [defect register](evidence/defect-register.json) lists C12-001 through C12-016 with severity, root cause, local repair and evidence. P1 list/account and access-revocation findings have controlled negative reproductions; privacy is not inferred from an after-only screenshot. The first negative suite had five failures/one pass before fixes; revocation had two failures; ownerless legacy draft claiming had a distinct failure. Their follow-up commands remain separate from the red runs.

Meaningful failures in existing assertions were reconciled with actual product semantics: record-based check-in rate, Date passed, period buttons rather than incomplete tabs, and one header Create entry rather than a covering duplicate FAB. Tests were not weakened to mask unauthorized requests or missing controls. An ambiguous test selector was corrected as a test defect, separately from source bugs.

[Negative-test evidence](evidence/negative-tests.json) and exact command logs bound every result. Broad live authorization, legacy editor ownership recovery, native typography and physical AT remain carryovers; a local repaired label is not a universal security certificate.''',
25:'''The table below is generated from durable command records: exact invocation, true process exit, duration and observed summary. Full user/admin totals are not added to overlapping targeted suites. Configured skips and inherited failures are retained. Output paths are local ignored raw evidence; their hashes are recorded even where the binary/log is not shipped.

Intermediate failures include two missing route-fixture failures in each app, a Node import lint failure, a profile locator strictness error, tooltip/mobile-trigger source bugs, a contrast failure, a same-port server collision and an admin preview pointing at localhost:5173. Long cross-phase runs interrupted for environment correction/source rebuild are not green completed runs. No deadline was increased to hide a real application failure. Raw environment warnings about NO_COLOR/FORCE_COLOR and expected mocked DOM/network errors can appear in otherwise passing suites.''',
26:'''Every F12.1-01…44 row preserves Gemini's verdict and records a separate Codex verdict, evidence and owner. Arithmetic comes from the actual row array, not hand-entered summary prose. VERIFIED — LOCAL means only the named source/fixture checks. PARTIALLY COMPLETE includes remaining local breadth or external certification; it is not disguised as external-only if proof is incomplete.

The inherited 41/2/1 versus 39/3/2 discrepancy remains visible. CI truth, native review, physical AT/zoom, exhaustive malformed dates/provenance, every legacy draft consumer and field performance remain bounded. No badges, screenshot filenames or theoretical library compatibility substitute for behavior.

[All 44 rows and generated counts](evidence/f12-independent-44.json) are the authoritative independent classification. Production release certification remains incomplete even when a development checkpoint is safe to publish.''',
27:'''UX12-C01…C16 are a separate visual acceptance set, not replacements for F12.1 IDs. They cover compact navbar/list composition, sidebar/drawer, overview hierarchy, controls/history/pagination, calendar/provenance, truthful response visuals, motion, bilingual/theme/reflow, race isolation, before/after proof, references and Phase 10/11 invariants.

The local implementation is supported by actual screenshots, geometry and named unit/browser checks. Native physical zoom/AT/device coverage, Chromium-only baseline breadth, and the missing StyleSeed deterministic contract remain partial. An improved render is not a claim that every device/state is certified. No new feature such as booking, reminders, AI or a separate calendar was smuggled into these gates.

[The 16 independent rows and exact counts](evidence/ux12-visual-16.json) preserve that distinction. No human design acceptance is inferred from a manual craft score.''',
28:'''The exact 57 historical canonical entries are retained from the immutable Phase 11 ledger at ad02a263, including their original IDs/status/evidence/owners. Their historical distribution remains 29 closed verified, 2 not applicable, 6 review, 16 blocked external and 4 deferred. They are not reclassified as currently verified from this owner UI pass. Separate AUTH, nine Phase 07 partials, C08-013, C09, Gemini D10, Codex C10, Phase 11 acceptance/fixes and Gemini 12.1 defects are retained alongside them.

The concurrent cleanup removed old on-disk report directories; this package retains the ledger data and identifies immutable Git provenance rather than restoring thousands of unrelated documents or emitting broken file:/// links. Rights for the 358-asset inventory, native Khmer, physical NVDA/VoiceOver/TalkBack/native zoom, live MySQL/provider/settlement and field RUM remain open with their prior owners. C08-013's BCrypt byte-policy conflict is not changed by frontend work.

[Cross-phase ledger](evidence/cross-phase-ledger.json) contains exact historical data, not a count-only placeholder. Closure here refers only to new scoped repairs with named local tests.''',
29:'''The original external snapshot and inherited patch preserve Gemini's source bytes, tests, reports and screenshots. The source attribution register compares those entry hashes with current bytes and identifies which files the user-published b18aae3 already included. The final Git diff alone therefore cannot describe the whole Phase 12 combined effort. Backend, renderers, auth/HTTP/store and shared draft-storage source remain unchanged from ad02a263.

Selective rollback means review one named file/hunk against its recorded entry/predecessor, then prepare a new forward commit. Do not globally restore the repo, erase the documentation cleanup, rewrite history, clean ignored output or remove the preserved Phase 11 publication folder. Draft data remains stored; no migration or raw customer asset was staged.

[Attribution](evidence/file-attribution.json), [rollback instructions](evidence/changed-files-rollback.json), [source freeze](evidence/source-freeze.json) and restored fixture hashes provide the review trail. The external snapshot path is intentionally kept local and is not represented as a portable public URL.''',
30:'''Publication is conditional on the prompt §29 gates: main branch, reviewed expected files, remote ancestor match, no new unmitigated P0/P1 or attributable failing required checks, staged secret/rights/size inspection and honest frozen QA. The user-confirmed concurrent b18aae3 is the reviewed ancestor; an unexpected later advance requires another stop, never force/merge/rebase by inference.

Only explicit source/test/report/fixture paths may be staged. No output, dist, node_modules, .env, customer photo, archive or private backup belongs in the commit. Known classified pre-existing guest/secret external issues can remain on a clearly labeled development checkpoint; they are not CI green or production approval. Git SHA/remote match and a new run URL/status must be recorded after any actual push.

[Publication gates](evidence/publication-gates.json) and [actual result](evidence/publication-result.json) are separate machine records. Reading this report or generating it does not itself stage, commit, push, deploy or certify anything.''',
31:'''Next is **Phase 13.1 creator Studio and advanced invitation editor**. Do not begin another dashboard redesign. Gemini implements locally/uncommitted; Codex 13 independently audits/fixes/tests and only then publishes a reviewed combined development checkpoint to main under the same hard gates. No automatic deployment or new backend capability is implied.

Inspect hostRoutes, EventWorkspace/EventInvitation, wedding-builder/InvitationEditFeature, template registries and serializers, preview/frame protocol and origin guards, media/crop flows, save revision/conflict handling and server entitlements. Preserve unknown JSON roundtrips, clientRequestId, partial cover retry/ownership, native chooser, 401/409/503/offline recovery, C10-001 guest authority and Phase 11 account-bound credentials. Review legacy ownerless draft recovery across editor/storage consumers without silently claiming records or losing bytes; Phase 12 only tightened Events listing/sync.

Carry the 57-plus ledgers, C08-013, rights/native/physical AT/provider/RUM, classified secret/guest CI reds, missing StyleSeed lock/registry and explicit native zoom gap. Use the canonical ten/reference licenses, real UI UX Pro Max outputs, observable UX-law mappings and real before/after fixtures. The [complete discovered Studio source inventory](evidence/phase13-studio-source-inventory.json) includes wedding-builder, invitations, registry and preview/route contracts. Inspect every relevant consumer before editing; the inventory and acceptance/evidence links are prerequisites, not a claim that Studio is implemented.

Protected owner entry points include `/app/events/new`, `/app/events/:eventId/invitation`, legacy continuation aliases and their unchanged preview frame/session/origin protocol. Retain the current native file chooser and confirmed server request identity. Address the inherited Phase 02 Studio landscape preview containment and translated-selector failures through source-backed reproduction; do not silently update selectors or hide owner controls to manufacture green. Exact [historical/current regression comparison](evidence/regression-comparison.json) and [failed identities](evidence/phase02-failure-identities.json) are part of the handoff.'''
    }
    for index,title in enumerate(titles,1):
        body=bodies[index]
        if index==25:
            body+='\n\n| Command ID | Exact command | Exit | Seconds | Observed summary |\n|---|---|---:|---:|---|\n'
            for row in cmd:body+=f"| {row['id']} | `{row['command']}` | {row['exit_code']} | {row['seconds']} | {'; '.join(row['summary']).replace('|','/')} |\n"
        if index in [26,27]:
            data=read(EVIDENCE/('f12-independent-44.json' if index==26 else 'ux12-visual-16.json'))
            body+='\n\nGenerated exact counts: '+', '.join(f'{key}: {value}' for key,value in data['counts'].items())+f". Total: {data['total']}.\n"
        (REPORT/f'{index:02}-{title}.md').write_text(f'# {index:02} — {title.replace("-"," ")}\n\nAudit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.\n\n'+body+'\n\n[Report index](README.md).\n',encoding='utf8')
    index='\n'.join(f'- [{number:02} — {title.replace("-"," ")}]({number:02}-{title}.md)' for number,title in enumerate(titles,1))
    (REPORT/'README.md').write_text('''# Phase 12 — independent owner dashboard audit

**Verdict: PARTIALLY COMPLETE.** Local owner UI refinements and confirmed repairs have named evidence. Production release certification remains open. Actual latest checks and publication are recorded below; intermediate failures are retained rather than relabeled green.

The entry was ad02a263 with Gemini work dirty. The user independently published b18aae3 during this audit, confirmed its origin, and authorized review/resumption. This report distinguishes that checkpoint from any later Codex publication.

Start with the [annotated comparison](comparison.html), [all commands](25-all-exact-test-commands-and-failure-register.md), [44 acceptance rows](26-independent-f12-01-to-44-acceptance.md), [16 visual gates](27-ux12-c01-to-c16-visual-acceptance.md), [actual publication](evidence/publication-result.json), and [Phase 13.1 Studio handoff](31-phase13-1-gemini-studio-execution-handoff.md).

'''+index+'\n\nRaw local traces/screens remain in ignored output. Selected synthetic images are reviewed and shipped in visuals/. No live customer data, credentials, new paid/source assets, dependency, migration, deployment or provider settlement is claimed. Historical data is preserved from exact Git revisions.\n',encoding='utf8')


if __name__=='__main__':
    main()
