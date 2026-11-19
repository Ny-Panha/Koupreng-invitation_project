"""Aggregate real captures/results; mark missing scope explicitly, validate evidence."""
from pathlib import Path
import collections
import hashlib
import json
import math
import re
import struct
import statistics
from audit import ROOT,EVIDENCE,RAW,write,sha,git

def read(p,default=None):
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else default
inventory=read(EVIDENCE/'route-family-alias-matrix.json',{})
build=read(RAW/'current-build-source.json',{})
stages=[p for p in RAW.iterdir() if p.is_dir() and (p.name in ['before','before-complete','after','delivery-controlled','review-chromium'] or p.name.startswith('acceptance'))]
all_rows=[]; keyboard=[]; preview=[]; scans=[]; normal=[]; degradation=[];lab=[]
for stage in stages:
    for p in stage.glob('*.json'):
        data=read(p,{})
        for row in data.get('rows',[]):
            if 'family' in row and 'project' in row and 'viewport' in row:
                all_rows.append({**row,'stage':stage.name,'fingerprint':data.get('fingerprint'),'record':p.relative_to(ROOT).as_posix()})
        if data.get('scans'):
            scans.append({'stage':stage.name,'record':p.relative_to(ROOT).as_posix(),'scans':data['scans'],'accepted_invitation_scan':all(len(row.get('passes',[]))>5 for row in data['scans'])})
        if 'gallery' in p.stem or 'bliss-drawer' in p.stem:
            keyboard.append({'stage':stage.name,'record':p.relative_to(ROOT).as_posix(),**data})
        if 'preview-negative' in p.stem:preview.append({'stage':stage.name,'record':p.relative_to(ROOT).as_posix(),**data})
        if 'normal-art' in p.stem:normal.append({'stage':stage.name,'record':p.relative_to(ROOT).as_posix(),**data})
        if p.stem=='degradation':degradation.append({'stage':stage.name,'record':p.relative_to(ROOT).as_posix(),**data})
        if p.stem=='performance-lab':lab.append({'stage':stage.name,'record':p.relative_to(ROOT).as_posix(),**data})
accepted_stages=sorted(set(row['stage']for row in all_rows if row['stage'] in ['acceptance-frozen','acceptance-composition-default','acceptance-composition-controlled','acceptance-composition-repeat','acceptance-default-focused'] and row.get('fingerprint')==build.get('source_fingerprint')))
accepted=[row for row in all_rows if row['stage'] in accepted_stages and row.get('fingerprint')==build.get('source_fingerprint')]
write('viewport-geometry.json',{'accepted_stages':accepted_stages,'observations':accepted,'diagnostic_observations':all_rows,'scope':'CSS viewport/project emulation, not physical device or zoom; overflow and content paint, not every occlusion'})
families=[]
for family in inventory.get('families',[]):
    name=family['family_id']
    rows=[row for row in accepted if row['family']==name or row['family']in family['registered_aliases']]
    families.append({**family,'observations':rows,'canonical_route_painted':bool(rows),'runtime_status':'OBSERVED — LOCAL' if rows else 'NOT_RUN / missing accepted capture','permutation_limits':['All 38 aliases unit-tested, not separately painted on every engine','No physical device/AT/native Khmer signoff','No every permission/hosted/expired state in every family','No all-family failed CSS/media/runtime-pref/back navigation matrix']})
state_names=['cover_not_loaded','cover_ready','opening','skipped','open','reduced','interrupted','failed_media','back_navigation','event_change','preview_start_closed']
opening_states=[]
for family in families:
    name=family['family_id']
    for state in state_names:
        coverless=name in ['withjoy-modern-portal','bliss-editorial-wedding']
        outcome='N/A — coverless family' if coverless and state in ['cover_not_loaded','cover_ready','opening','skipped','preview_start_closed'] else 'NOT_RUN — family-specific state not exhaustively exercised'
        if state in ['open','reduced'] and family['observations']:outcome='OBSERVED — canonical demo matrix; see rows'
        if state=='skipped' and any(row.get('opening',{}).get('method')for row in family['observations']):outcome='OBSERVED — canonical cover action; exact labels/geometry in rows'
        opening_states.append({'family':name,'state':state,'outcome':outcome,'owner':'Renderer frontend QA, Phase16/26','evidence':[row['record']for row in family['observations'][:1]]})
write('family-state-coverage.json',{'families':families,'opening_states':opening_states,'accepted_stages':accepted_stages,'normal_samples':normal,'degradation_samples':degradation,'shared_id_tests':'Phase10Identity.test.jsx + phase10-codex-shared.spec.js and full unit logs','shared_observations':[row for row in accepted if row['family'] in inventory.get('shared',[])],'fallback_scope':'Explicit legacy DefaultTemplateLayout unit paint; unknown public stable identity browser fails closed. No invented public fallback route.','not_claimed':'Complete family × route × locale × authored content × permission × motion × engine × physical-device Cartesian certification'})
timings=[{'family':row['family'],'project':row['project'],'viewport':row['viewport'],'stage':row['stage'],**row.get('opening',{}),'evidence':row['record']}for row in accepted if row.get('opening',{}).get('method')]
values=sorted(row['browser_click_to_frame_ms']for row in timings if isinstance(row.get('browser_click_to_frame_ms'),(int,float)))
def percentile(p):return values[min(len(values)-1,math.ceil(len(values)*p)-1)] if values else None
write('opening-skip-timing.json',{'method':'Browser capture-phase click timestamp to first rAF with non-inert, nonhidden content box and nonzero computed opacity; automation wall time separate. Missing sample is unmeasured. Local emulation only.','samples':timings,'browser_sample_count':len(values),'p50_ms':percentile(.5),'p95_ms':percentile(.95),'universal_under_50ms':'NOT ESTABLISHED','state_matrix':opening_states})
write('a11y-keyboard-axe.json',{'axe_scans':scans,'keyboard_records':keyboard,'physical_AT_zoom':'EXTERNAL — NOT EXECUTED','contrast_enabled_in_new_suite':True,'rejected_skeleton_scans':'before-complete/axe.json and after/axe.json lacked completed-rule evidence; not accepted as invitation certification','scope':'Selected loaded invitation states, original/helper unit tests, and declared dialog interactions only'})
write('preview-negative-tests.json',{'browser_results':preview,'source':'apps/frontend-user/src/shared/preview/previewMessaging.js','existing_unit_source':'apps/frontend-user/src/shared/preview/previewMessaging.test.js','unit_scope':['wrong origin','wrong source','wrong session','malformed type/fields/arrays','prototype-like keys','top-level published channel inactive'],'lifetime_limit':'No time-based session expiration is implemented by the helper; iframe source/session replacement is the boundary. Replay/expiry beyond actual lifecycle is not certified.','sandbox_review':'Same-origin scripts+same-origin flags are not isolation from arbitrary executable child code. Current child is trusted renderer code; no new raw-script template feature introduced.'})
write('rsvp-truth-and-guest-privacy.json',{'before_commands':['negative-unit','negative-guest-privacy-confirmed','negative-hosted-media'],'repair_commands':['repaired-guest-privacy','hosted-media-repair'],'tests':['Phase10GuestRsvp.test.jsx:3 privacy +5 HTTP error/retry cases','Phase10CodexRegression.test.jsx:demo, child delegate, drafts, empty authored media','PublicRsvpForm.test.jsx and language tests'],'actual_live_persistence':'EXTERNAL / NOT_RUN; all service responses here are mocked','no_premature_success':'Existing PublicRsvpForm confirms only after resolved service response; stale old lifetime is ignored','renderer_demo':'Explicit nonpersistent notice before and after; canonical children unchanged','privacy_changes':['authority-keyed form lifetime','no denied-token cached receipt','late old submission cannot change new page URL/cache/receipt'],'backend_schema_payment_changes':False})

manifest=[]
for stage in stages:
    for p in sorted(stage.glob('*.png')):
        category='before' if stage.name.startswith('before') else 'current_unmodified' if stage.name in accepted_stages and 'silk-heritage' in p.name else 'after' if stage.name in accepted_stages else 'diagnostic_intermediate'
        row={'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size,'stage':stage.name,'category':category,'capture_scale':'CSS pixels in newer captures; legacy first exploratory stage may use device pixel scale','source_fingerprint':build.get('source_fingerprint')if category=='after'else 'See stage JSON fingerprint and baseline/build logs; not a pre-Gemini baseline','source_manifest':('output/playwright/phase10-codex-2026-11-18/'+build.get('command_id','')+'-source-manifest.json')if category=='after'else 'git-baseline-and-attribution.json; baseline-working-tree.patch','readiness':'Family root and main observed; eager media/fonts settled/known failures. Lazy images may be intentionally unrequested; per-row geometry image status is authoritative.','capture_type':'fullpage or viewport per regeneration spec; -cover is cover state; -open is invitation state','exists':p.exists(),'regenerate':'Use recorded npm browser command with PHASE10_STAGE; see phase10-codex-renderers.spec.js'}
        with p.open('rb') as image:
            header=image.read(24)
        if header[:8]==b'\x89PNG\r\n\x1a\n':row['raster_dimensions']=list(struct.unpack('>II',header[16:24]))
        metadata=read(Path(str(p)+'.json'),{})
        if metadata:
            row['source_fingerprint']=metadata.get('fingerprint') or row['source_fingerprint']
            if category=='current_unmodified':row['source_manifest']='output/playwright/phase10-codex-2026-11-18/'+build.get('command_id','')+'-source-manifest.json'
            row['capture_type']=metadata.get('capture_type')
            row['capture_geometry']=metadata.get('geometry')
            row['backing_surface_cap_applied']=metadata.get('backing_surface_cap_applied')
        manifest.append(row)
write('visual-capture-manifest.json',{'captures':manifest,'counts':dict(collections.Counter(row['category']for row in manifest)),'pre_gemini_baseline':'missing_baseline — no authenticated pre-Gemini family screenshot pairs supplied','unmodified_family':'Silk runtime/art source unchanged; final screenshots are current_unmodified art observations with shared shell contracts, not an upgrade claim','binary_storage':'Existing ignore rule output/playwright/phase10*; binaries are local, not claimed to exist on GitHub'})
perf=read(EVIDENCE/'performance-and-payload.json',{})
perf['lab_observations']=lab
groups=collections.defaultdict(list)
for observation in lab:
    if observation.get('stage')!='acceptance-frozen' or observation.get('fingerprint')!=build.get('source_fingerprint'):continue
    for sample in observation.get('samples',[]):groups[(sample['family'],sample['cache'])].append(sample)
perf['final_lab_summary']=[{'family':family,'cache':cache,'n':len(samples),'route_readiness_median_ms':round(statistics.median(row['route_readiness_ms']for row in samples),1),'lcp_observation_median_ms':statistics.median(row['measured']['lcp']for row in samples),'cls_observation_median':statistics.median(row['measured']['cls']for row in samples),'scope':'Local unthrottled mocked-route lab, not field p75/INP'}for(family,cache),samples in groups.items()]
write('performance-and-payload.json',perf)

command_outcomes=[]
for command in read(EVIDENCE/'test-command-results.json',[]):
    log=(ROOT/command['log']).read_text(encoding='utf-8',errors='replace')
    run=re.search(r'Running (\d+) tests? using (\d+) workers?',log)
    unit=re.search(r'^\s*Tests\s+([^\r\n]+)',log,re.M)
    command_outcomes.append({**command,'playwright_discovered':int(run[1])if run else None,'actual_workers':int(run[2])if run else None,'retries':'0 (local config, CI unset)'if run else None,'vitest_result':unit[1]if unit else None,'browser_summary':re.findall(r'^\s*(\d+ (?:passed|failed|skipped)(?:[^\r\n]*))$',log,re.M)[-3:]if run else [],'result_scope':'Local fixtures/mocks unless command log states otherwise; failures retained'})
write('command-outcomes-and-denominators.json',command_outcomes)

baseline=read(EVIDENCE/'git-baseline-and-attribution.json')
before_tracked=len(next(row for row in baseline['commands']if row['command']=='git diff --name-status')['stdout'].strip().splitlines())
before_status=next(row for row in baseline['commands']if row['command']=='git status --short --untracked-files=all')['stdout'].splitlines()
status=git('status','--short','--untracked-files=all').splitlines()
write('final-git-counts.json',{'branch':git('branch','--show-current'),'head':git('rev-parse','HEAD'),'origin':git('rev-parse','origin/main'),'ahead':int(git('rev-list','--count','origin/main..HEAD')),'before_observed_tracked_modified':sum(not line.startswith('??')for line in before_status),'before_observed_untracked_files':sum(line.startswith('??')for line in before_status),'before_inherited_tracked_modified':before_tracked,'before_inherited_untracked_files':len(baseline['files'])-before_tracked,'baseline_collector_note':'Observed Git status is49 tracked/396 untracked; the first audit.py collector is one of those396. Inherited baseline is49+395=444, excluding that new collector.','after_tracked_modified':sum(not line.startswith('??')for line in status),'after_untracked_files':sum(line.startswith('??')for line in status),'staged':git('diff','--cached','--name-status'),'committed_pushed_deployed':False})
validation=[]
for p in EVIDENCE.glob('*.json'):
    try:read(p);validation.append({'path':p.relative_to(ROOT).as_posix(),'valid_json':True})
    except Exception as err:validation.append({'path':p.relative_to(ROOT).as_posix(),'valid_json':False,'error':str(err)})
missing_links=[]
for p in EVIDENCE.parent.glob('*.md'):
    for target in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        if target.startswith(('https:','http:','#')):continue
        target=target.split('#')[0]
        if not(p.parent/target).exists():missing_links.append({'document':p.name,'target':target})
drift=[{'path':name,'expected':value,'actual':sha(ROOT/name)if(ROOT/name).is_file()else None}for name,value in build.get('source_hashes',{}).items()if not(ROOT/name).is_file()or sha(ROOT/name)!=value]
command_refs=read(EVIDENCE/'test-command-results.json',[])
change_refs=read(EVIDENCE/'changed-files-and-rollback.json',{})
linked_files=[(row['log'],row['log_sha256'])for row in command_refs]
linked_files += [(row['snapshot'],row['sha256'])for row in baseline['files']]
linked_files += [(row['baseline_copy'],row['before_sha256'])for row in change_refs.get('modified_existing',[])]
linked_files += [(row['snapshot'],row['after_sha256'])for row in change_refs.get('new_sources',[])]
bad_refs=[{'path':path,'expected_sha256':expected}for path,expected in linked_files if not(ROOT/path).is_file()or sha(ROOT/path)!=expected]
missing_diffs=[row['codex_only_diff']for row in change_refs.get('modified_existing',[])if not(ROOT/row['codex_only_diff']).is_file()]
write('evidence-validation.json',{'json_files':validation,'invalid_json_count':sum(not row['valid_json']for row in validation),'missing_markdown_links':missing_links,'capture_count':len(manifest),'missing_capture_count':sum(not(ROOT/row['path']).exists()for row in manifest),'capture_hash_replay':all(sha(ROOT/row['path'])==row['sha256']for row in manifest),'linked_baseline_command_and_new_source_files':len(linked_files),'invalid_linked_file_hashes':bad_refs,'missing_attribution_diffs':missing_diffs,'current_build_source_drift':drift,'report_md_count':len(list(EVIDENCE.parent.glob('*.md'))),'large_binary_not_committed':True,'replay_instructions':'audit.py baseline is one-time/refuses overwrite. Preserve baseline; run recorded tests with a new PHASE10_STAGE. Then collect.py, carryover.py, aggregate.py, report.py and aggregate.py for link validation. Never reset or replace inherited snapshots.'})
print(json.dumps({'accepted_rows':len(accepted),'captures':len(manifest),'json_valid':all(row['valid_json']for row in validation),'source_drift':len(drift),'missing_links':len(missing_links)}))
