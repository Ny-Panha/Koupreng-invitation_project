"""Read-only current-source inventories; writes only this audit's evidence."""
from pathlib import Path
import collections
import gzip
import hashlib
import json
import re
import subprocess
from audit import ROOT, EVIDENCE, RAW, sha, write, git

SRC = ROOT / 'apps/frontend-user/src/features/templates'
gemini = ROOT / 'docs/uxui/phase10-1-gemini-template-art-2026-11-18'

validation = []
for path in sorted((gemini / 'evidence').glob('*.json')):
    try:
        value = json.loads(path.read_text(encoding='utf-8-sig'))
        validation.append({'path': path.relative_to(ROOT).as_posix(), 'valid_json': True, 'sha256': sha(path), 'keys': list(value) if isinstance(value, dict) else None})
    except Exception as err:
        validation.append({'path': path.relative_to(ROOT).as_posix(), 'valid_json': False, 'error': str(err)})
write('gemini-evidence-validation.json', validation)

registry = (SRC / 'registry/templateRegistry.js').read_text(encoding='utf-8')
block = registry.split('export const templateRegistry = {',1)[1].split('\n};',1)[0]
aliases = []
for match in re.finditer(r'''^\s*(?:['"]([^'"\n]+)['"]|([A-Z_]+))\s*:\s*(\w+),?''', block, re.M):
    aliases.append({'alias': match[1] or match[2], 'component': match[3]})
families = []
for component in dict.fromkeys(row['component'] for row in aliases):
    match = re.search(r'const '+component+r''' = lazy\(\(\) => import\(['"]([^'"]+)''', registry)
    path = (SRC / 'registry' / match[1]).resolve().with_suffix('.jsx')
    family_aliases = [row['alias'] for row in aliases if row['component'] == component]
    families.append({'family_id': family_aliases[0], 'component': component, 'source_path': path.relative_to(ROOT).as_posix(), 'sha256': sha(path), 'registered_aliases': family_aliases, 'canonical_routes': ['/templates/:id', '/templates/:id/demo', '/templates/:id/preview', '/w/:slug', '/i/:slug'], 'inventory_status': 'SOURCE PRESENT', 'live_surface_certification': 'NOT_RUN — fixture demo and selected guest contracts only'})
matrix = json.loads((ROOT / 'docs/qa/batch12/route-matrix.json').read_text(encoding='utf-8'))
write('route-family-alias-matrix.json', {'families': families, 'aliases': aliases, 'shared': ['event-essential','koupreng-demo-wedding'], 'fallback': {'component':'DefaultTemplateLayout','contract':'getDedicatedTemplateComponent(..., true); public TemplateExperience fails closed with TemplateUnavailable for unknown code'}, 'routes': matrix['routes'], 'route_source': 'Current route factory tests compare exact sequence against docs/qa/batch12/route-matrix.json', 'route_counts': dict(collections.Counter(row['application'] for row in matrix['routes']))})

vendor_names = [('Animate UI','animateui','MIT + Commons Clause','https://raw.githubusercontent.com/imskyleen/animate-ui/main/LICENSE.md'),('Badtz UI','badtz','MIT with significant modification restriction','https://raw.githubusercontent.com/badtzx0/badtz-ui/main/LICENSE.md'),('Lightswind UI','lightswind','Conflicting MIT repository / restrictive builder and template site terms','https://lightswind.com/license'),('Kokonut UI','kokonutui','MIT free core; Pro separate','https://raw.githubusercontent.com/kokonut-labs/kokonutui/main/LICENSE'),('Untitled UI React','untitledui','MIT free core; Pro separate','https://raw.githubusercontent.com/untitleduico/react/main/LICENSE'),('shadcn/ui','shadcn','MIT','https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md'),('React Bits','reactbits','MIT + Commons Clause; tools/exports distinct restrictions','https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md'),('Aceternity UI','aceternity','Custom end product / source and marketplace restrictions','https://ui.aceternity.com/licence'),('Magic UI','magicui','MIT free core; Pro separate','https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md'),('Skiper UI','skiper','Free usage requires attribution; general terms reserve rights','https://skiper-ui.com/docs/quick-start')]
vendors = []
for name, directory, terms, url in vendor_names:
    path = ROOT / 'apps/frontend-user/src/shared/ui/vendor' / directory
    files = [p for p in path.rglob('*') if p.is_file()] if path.exists() else []
    sources = [p for p in files if p.suffix == '.jsx' and '.test.' not in p.name]
    vendor = {'name': name, 'claimed_directory': 'src/shared/ui/vendor/'+('untitled' if directory == 'untitledui' else 'kokonut' if directory == 'kokonutui' else directory), 'actual_directory': path.relative_to(ROOT).as_posix() if path.exists() else None, 'files': [{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in files], 'source_components': [p.name for p in sources], 'terms': terms, 'official_current_reference': url, 'web_check': 'Official source read in this audit, 2026-11-18', 'source_revision_evidence': 'docs/design/THIRD_PARTY_UI_LICENSES.md; historical declared pins not all independently matched to upstream source', 'adoption': 'PRE-EXISTING VENDOR' if sources else 'EVALUATED/NOT USED', 'phase10_new_source_copied': False, 'new_dependencies': [], 'invitation_imports': [], 'decision': 'No new reuse; keep existing outside renderer tree pending exact component provenance audit' if sources else 'Original interaction principles only; no install', 'redistribution_permission': 'REVIEW REQUIRED for exact component and commercial template outputs; no new third-party source in Codex repair', 'dependency_overhead_bytes': 0, 'test_evidence': 'full-user-unit; renderer browser suite tests original/project controls, not unused vendor widgets'}
    for p in SRC.rglob('*'):
        if p.suffix in ['.js','.jsx'] and 'vendor/'+directory in p.read_text(encoding='utf-8'):
            vendor['invitation_imports'].append(p.relative_to(ROOT).as_posix())
    vendors.append(vendor)
write('vendor-license-matrix.json', vendors)

extensions = {'.png','.jpg','.jpeg','.webp','.avif','.svg','.mp3','.m4a','.wav','.ogg','.mp4','.webm','.woff','.woff2','.ttf','.otf'}
asset_rows = []
for directory in [ROOT/'apps/frontend-user/public', ROOT/'apps/frontend-user/src/assets']:
    for path in directory.rglob('*'):
        if not path.is_file() or path.suffix.lower() not in extensions: continue
        notices = [p.relative_to(ROOT).as_posix() for p in path.parent.glob('*') if p.is_file() and any(term in p.name.lower() for term in ['ofl','license','provenance'])]
        asset_rows.append({'asset_path':path.relative_to(ROOT).as_posix(),'sha256':sha(path),'bytes':path.stat().st_size,'format':path.suffix,'source_uri_or_original_author':'NOT ESTABLISHED per asset; inspect linked source manifests and rights owner records','acquisition_date_if_known':None,'exact_license_or_contract':notices or None,'rights_scope':'REVIEW REQUIRED — adjacent notice is evidence to investigate, not exact binary grant','required_credit':'UNVERIFIED','actual_credit_location':None,'redistribution_template_output_allowed':None,'modified':'UNKNOWN','contains_recognizable_person':'REVIEW REQUIRED' if path.suffix.lower() in ['.jpg','.jpeg','.png','.webp','.avif','.mp4','.webm'] else 'N/A or inspect artwork','test_or_manual_evidence':notices,'confidence':'insufficient per-asset provenance','disposition':'RIGHTS UNVERIFIED','owner':'Content/brand rights owner; Phase14 asset pipeline and Phase26 release'})
external_refs = []
for path in SRC.rglob('*'):
    if path.suffix not in ['.js','.jsx','.css','.json']: continue
    for uri in sorted(set(re.findall(r'''https?://[^\s'"<>`\)]+''', path.read_text(encoding='utf-8')))):
        external_refs.append({'source':path.relative_to(ROOT).as_posix(),'uri':uri,'disposition':'RIGHTS/NETWORK REVIEW REQUIRED; URL does not establish grant'})
write('media-license-asset-inventory.json', {'scope':'All frontend-user public and imported asset media files (conservative superset of reachable template resources), plus source external references; hash inventory is not completed legal certification','assets':asset_rows,'external_references':external_refs,'critical_recordings':[row for row in asset_rows if row['format'] in ['.mp3','.m4a','.wav','.ogg']], 'rights_owner_action':'Obtain exact track recording/composition grants and photograph/model/property release scope; match font binary/revision to OFL notices. No media replaced or rights declared by Codex.'})

builds = {}
for app in ['frontend-user','frontend-admin']:
    root = ROOT/'apps'/app/'dist'
    builds[app] = [{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'gzip_bytes':len(gzip.compress(p.read_bytes(),mtime=0)),'sha256':sha(p)} for p in root.rglob('*') if p.is_file()]
write('performance-and-payload.json', {'build_assets':builds,'method':'actual emitted production files; Python gzip.compress(mtime=0), unrounded bytes','baseline_logs':['output/playwright/phase10-codex-2026-11-18/baseline-build-user.log','output/playwright/phase10-codex-2026-11-18/final-build-user.log'],'field_cwv':'EXTERNAL — RUM owner Phase26','INP':'NOT_RUN — no field/user population; automated click durations are not field INP','budgets':'No agreed per-family numeric budget found; do not infer from chunk existence'})

baseline = json.loads((EVIDENCE/'git-baseline-and-attribution.json').read_text(encoding='utf-8'))
changes = []
preserved = []
for row in baseline['files']:
    path = ROOT/row['path']
    current = sha(path) if path.is_file() else None
    unchanged = current == row['sha256']
    preserved.append({**row,'current_sha256':current,'unchanged':unchanged})
    if not unchanged:
        before = (ROOT/row['snapshot']).read_text(encoding='utf-8')
        after = path.read_text(encoding='utf-8') if path.exists() else ''
        import difflib
        patch = ''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='before/'+row['path'],tofile='after/'+row['path']))
        diff_file = RAW/'codex-diffs'/(row['path']+'.patch')
        diff_file.parent.mkdir(parents=True,exist_ok=True); diff_file.write_text(patch,encoding='utf-8')
        changes.append({'path':row['path'],'before_sha256':row['sha256'],'after_sha256':current,'baseline_copy':row['snapshot'],'codex_only_diff':diff_file.relative_to(ROOT).as_posix(),'rollback':'Review this Codex-only patch and reverse selected hunks against current file after checking after hash; never restore from HEAD'})
# Sources pristine in Git at baseline need HEAD comparison, not absence from dirty list.
baseline_paths = {row['path'] for row in baseline['files']}
for name in git('diff','--name-only').splitlines():
    if name in baseline_paths: continue
    path = ROOT/name
    original = subprocess.check_output(['git','show','HEAD:'+name],cwd=ROOT)
    snap = RAW/'baseline'/name; snap.parent.mkdir(parents=True,exist_ok=True); snap.write_bytes(original)
    import difflib
    patch = ''.join(difflib.unified_diff(original.decode('utf-8').splitlines(True),path.read_text(encoding='utf-8').splitlines(True),fromfile='before/'+name,tofile='after/'+name))
    target = RAW/'codex-diffs'/(name+'.patch'); target.parent.mkdir(parents=True,exist_ok=True); target.write_text(patch,encoding='utf-8')
    changes.append({'path':name,'before_sha256':hashlib.sha256(original).hexdigest(),'after_sha256':sha(path),'baseline_copy':snap.relative_to(ROOT).as_posix(),'codex_only_diff':target.relative_to(ROOT).as_posix(),'rollback':'Review and selectively reverse Codex-only patch; confirm after hash and no concurrent edits'})
write('source-preservation-hashes.json', {'inherited_files':preserved,'changed_count':sum(not row['unchanged'] for row in preserved),'unchanged_count':sum(row['unchanged'] for row in preserved),'head_unchanged':git('rev-parse','HEAD')==baseline['head'],'index_diff':git('diff','--cached','--name-status'),'protected_paths':git('diff','--name-only','--','apps/backend','apps/telegram-bot','apps/frontend-user/package.json','apps/frontend-admin/package.json')})
def defect_ids(name):
    if 'PublicRsvpForm.jsx' in name or 'Phase10GuestRsvp' in name:return ['C10-001']
    if any(value in name for value in ['InvitationLightbox','GalleryGrid','Modal.jsx']):return ['C10-003','C10-011']
    if any(value in name for value in ['RsvpContainer','DemoRsvpNotice','DigitalYesRsvpModal']):return ['C10-002','C10-008']
    if 'DigitalYes' in name:return ['C10-003','C10-004']
    if 'EmeraldLuxe' in name:return ['C10-005','C10-008']
    if 'CanvaKhmer' in name:return ['C10-002','C10-006']
    if any(value in name for value in ['KhmerFloralGold','RoyalGarden','KhmerCelestial']):return ['C10-007']
    if any(value in name for value in ['Boilerplate','WithJoy','withjoy','Bliss','bliss']):return ['C10-002','C10-003','C10-008','C10-009']
    return ['Audit coverage / C10-001–C10-011; see test source and defect register']
for row in changes:
    row['defect_ids']=defect_ids(row['path'])
    row['rationale']='Targeted repair or regression evidence for cited findings; exact before/current hunks are linked'
new_sources=[]
for name in git('ls-files','--others','--exclude-standard').splitlines():
    if name in baseline_paths or not name.startswith(('apps/','scripts/')):continue
    path=ROOT/name
    snapshot=RAW/'codex-new-files'/name
    snapshot.parent.mkdir(parents=True,exist_ok=True);snapshot.write_bytes(path.read_bytes())
    new_sources.append({'path':name,'before_sha256':None,'after_sha256':sha(path),'bytes':path.stat().st_size,'snapshot':snapshot.relative_to(ROOT).as_posix(),'defect_ids':defect_ids(name),'rollback':'Created by this audit; remove only after checking after hash, later edits and all imports/callers. Never bulk-delete untracked work.'})
write('changed-files-and-rollback.json', {'modified_existing':changes,'new_sources':new_sources, 'no_git_mutations':'No staging, commits, push, fetch, branch switch or deploy performed','current_status':git('status','--short','--untracked-files=all')})
print(json.dumps({'families':len(families),'aliases':len(aliases),'routes':len(matrix['routes']),'assets':len(asset_rows),'gemini_json':len(validation),'codex_changed_existing':len(changes),'vendor_directories':sum(row['actual_directory'] is not None for row in vendors)}))
