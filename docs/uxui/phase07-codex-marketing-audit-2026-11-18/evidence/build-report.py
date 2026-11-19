"""Regenerate the Phase 07 report from actual local logs and evidence, never inferred passes."""
from pathlib import Path
import json, re, hashlib, subprocess, collections, statistics

ROOT = Path(__file__).resolve().parents[4]
REPORT = Path(__file__).resolve().parents[1]
EVIDENCE = REPORT / 'evidence'
OUT = ROOT / 'output/phase07-codex-2026-11-18'
SHA = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip()

def read(path, default=None):
    p = ROOT / path
    return json.loads(p.read_text(encoding='utf-8-sig')) if p.exists() else default

def save(name, value):
    (EVIDENCE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def md(name, title, body):
    (REPORT / name).write_text(f'# {title}\n\nSource HEAD: `{SHA}` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.\n\n{body.strip()}\n', encoding='utf-8')

def link_source(file, term):
    lines = (ROOT/file).read_text(encoding='utf-8').splitlines()
    line = next((i for i,s in enumerate(lines,1) if term in s),1)
    return f'[{Path(file).name}:{line}](../../../{file}#L{line})'

commands=[]
for p in sorted(OUT.glob('*.result.json')):
    row=json.loads(p.read_text(encoding='utf-8'))
    log=OUT/(row['id']+'.log')
    text=re.sub(r'\x1b\[[0-9;]*m','',log.read_text(encoding='utf-8',errors='replace')) if log.exists() else ''
    row['observedSummary']=[s.strip() for s in text.splitlines() if re.search(r'Test Files|\bTests\s+\d|\d+ (?:passed|failed|skipped|interrupted)|Running \d+ tests|Verified \d+|^\{"stage"',s)][-8:]
    if row.get('status') is None: row['status']='PASS' if row.get('exitCode')==0 else 'FAIL'
    if row['id'].startswith('inventory-'): row['environment']={'BATCH11_UPDATE_ROUTES':'1'}
    commands.append(row)
commands.extend(read(str(EVIDENCE.relative_to(ROOT)/'interrupted-runs.json'),[]))
save('test-command-results.json', commands)
by_id={r['id']:r for r in commands}
def result(key):
    r=by_id.get(key)
    return 'NOT RUN / MISSING RESULT' if not r else f"{r['status']} (exit {r.get('exitCode')}); "+'; '.join(r.get('observedSummary',[]))

source=read(str(EVIDENCE.relative_to(ROOT)/'source-preservation.json'),{})
inventory=read(str(EVIDENCE.relative_to(ROOT)/'route-shell-inventory.json'),[])
registry=read(str(EVIDENCE.relative_to(ROOT)/'renderer-registry.json'),{})
perf=read(str(EVIDENCE.relative_to(ROOT)/'performance-comparison.json'),{'status':'NOT RUN / pending final comparison'})
before=read(str(EVIDENCE.relative_to(ROOT)/'before-manifest.json'),[])
after=read(str(EVIDENCE.relative_to(ROOT)/'after-manifest.json'),[])
perf_table='Final matched measurements pending.'
if perf.get('groups'):
    perf_lines=['| Route / width | FCP before → after (ms) | LCP before → after (ms) | Transfer before → after (KiB) | Largest observed CLS before → after |','|---|---|---|---|---|']
    for route,width in sorted({(g['group'],g['width']) for g in perf['groups']}):
        selected=[g for g in perf['groups'] if (g['group'],g['width'])==(route,width)]
        values=lambda metric,stage:[v for g in selected for v in g['metrics'][metric][stage]['samples']]
        pair=lambda metric: ' → '.join(f'{statistics.median(values(metric,stage)):.1f}' for stage in ['before','after'])
        transfer=' → '.join(f'{statistics.median(values("resourceTimingTransferBytes",stage))/1024:.1f}' for stage in ['before','after'])
        cls=' → '.join(f'{max(values("cls",stage)):.4f}' for stage in ['before','after'])
        perf_lines.append(f'| {route} / {width}px | {pair("fcpMs")} | {pair("lcpMs")} | {transfer} | {cls} |')
    perf_table='\n'.join(perf_lines)+'\n\nThese summary rows pool 40 observations per stage/route/width across mode, motion and routing protocol. The comparison JSON retains all 48 matched five-repeat groups, sample ranges, outlier flags, LCP elements and every review trigger; pooled medians do not replace those groups.'
assets=read(str(EVIDENCE.relative_to(ROOT)/'build-assets.json'),{})
asset_table='\n'.join(['| Emitted HTML/JS/CSS | Raw bytes | Gzip bytes | Brotli bytes |','|---|---|---|---|']+[f"| {stage} | {data['totals']['raw']:,} | {data['totals']['gzip']:,} | {data['totals']['brotli']:,} |" for stage,data in assets.items()])
def shot(fragment, stage='after'):
    row=next((r for r in (after if stage=='after' else before) if fragment in r.get('imagePath','') and r.get('valid')),None)
    return f"[{stage} capture](../../../{row['imagePath']})" if row else f'{stage} capture: NOT AVAILABLE'

route_rows=[
 ('/','HomeFeature + MarketingShell','hero, primary/browse/create continuation, real demo entry, featured collection/empty, folio stages, guest sample, packages, FAQ, final CTA','home discovery; reflow/axe; signed-in; SPA renderer isolation','catalog + public packages; fictional read-only responses'),
 ('/contact','ContactFeature + MarketingShell','pristine, required/malformed, typed, locale/theme, pending, duplicate guard, SMTP_ACCEPTED, unacknowledged, 429/503/offline, retry','contact draft/rejection/retry; service error; Phase07 edges','POST /api/v1/contact intercepted; no real email'),
 ('/venues','VenuesFeature + MarketingShell','four static entries; filter/empty/reset; failed/slow media; selected detail via click; Back','venue search; history; background modality; slow-photo edges','local static records; blocked external photos in fixtures'),
 ('/venues/:id','VenuesFeature + native dialog portal','direct known ID, invalid ID, Escape/close/backdrop, inert background, trap/return, short landscape, eager selected image','direct entry; eager/fallback; reflow/axe; venue inquiry edge','local static records; no booking or availability service'),
 ('/about','Navigate replace → /contact','client redirect, destination title/description/focus; no 301 server assertion','about/help redirects','no dedicated About page'),
 ('/help','Navigate replace → /contact','client redirect, destination contact recovery','about/help redirects','no dedicated Help page'),
 ('*','NotFoundFeature, standalone system main','404 heading, home recovery, bilingual theme source; six-project Phase06 system checks','alias/404 recovery; Phase06 system-page cases','SPA fallback HTTP status needs deployment review'),
 ('/templates','existing catalog in MarketingShell','marketing entry/teaser and destination only; full catalog preserved','home browse + 135-route sweep','Phase09 owns catalog states and pricing'),
 ('/pricing','existing pricing in MarketingShell','marketing entry; real package service untouched','CTA href + 135-route sweep','Phase09/21 own amounts, eligibility and checkout'),
 ('/login → /app/events/new','existing auth guard and return intent','anonymous create continuation; signed-in Dashboard chrome','home continuation + existing guard units','Phase08 identity; Phase11 creation'),
 ('/templates/:id, /templates/:id/demo','existing independent renderers','real demo entry; Silk computed style after SPA marketing; Silk/Emerald before/after','new isolation case; Phase06 cover tests','Phase10 art/registry; Phase16 guest journey'),
]
route_matrix=[]
for route,component,states,cases,dependency in route_rows:
    route_matrix.append({'route':route,'component':component,'states':states.split('; '),'cases':cases.split('; '),'dependency':dependency,'sourceSha':SHA,'proof':'SOURCE MAPPED + named fixture browser cases; no live integration certification','external':['physical device/AT/native Khmer where applicable']})
save('route-state-matrix.json',route_matrix)

claims=[
 {'id':'C01','claim':'clean modifications; identical HEAD','observation':'main remains 2429b765, origin/main 4d30a8f3; 13 ahead, six initially modified files plus untracked CSS/tests/docs. Nothing staged.','classification':'AMBIGUOUS PROSE RESOLVED BY GIT','evidence':'initial-git.txt; starting-inventory.json'},
 {'id':'C02','claim':'43 tests / 8 files vs 41 / 7','observation':'Both reproduced: marketing 41/7; marketing plus route inventory 43/8. Final marketing gains two metadata tests plus one draft-boundary test (44/9); final combined scope 46/10.','classification':'DIFFERENT DENOMINATORS','evidence':['baseline-marketing','baseline-marketing-routes']},
 {'id':'C03','claim':'Phase06 42/44 vs local report 36/44 vs historic 132/132','observation':'Actual Gemini local command register says 36 passed/8 failed, not 42/44; no supplied raw Gemini trace proves either cause. Consistent origin baseline reproduced 44/44. Six projects contain 132 cases.','classification':'REPORT CONTRADICTION; ORIGIN DIAGNOSIS SEPARATE','evidence':['baseline-phase06','closure-phase06-recovered','origin-diagnosis']},
 {'id':'C04','claim':'Phase02 24/8 matches prior baseline','observation':'Current controlled baseline reproduces 26/6; failures are the same three assertion identities in two projects, not viewport snapshots. Native copy/QA maintenance remains unapproved.','classification':'UNSUPPORTED EXTRA TWO FAILURES','evidence':['baseline-phase02','final-phase02']},
 {'id':'C05','claim':'native venue dialog, background inert, full AA','observation':'Starting venue modal was a custom role=dialog div; header alone used native dialog. Background focus, reset, history and contrast failed fresh tests. Repaired and explicitly sampled.','classification':'DISPROVED THEN REPAIRED','evidence':['baseline-new-marketing','accepted-phase07']},
 {'id':'C06','claim':'8.38kB venue CSS proves fast / decoding async everywhere','observation':'Initial actual JSX had lazy images without decoding=async. Current emitted sizes and routed request/paint lab are separately recorded.','classification':'SOURCE CONTRADICTION; PERFORMANCE REQUIRES MEASUREMENT','evidence':['build-assets.json','performance-comparison.json']},
 {'id':'C07','claim':'all 10 renderer names and zero pixel contamination certified','observation':'Gemini gallery lists fictional family identifiers. Current registry has 10 families, 38 aliases, two shared IDs and fallback. Two representative paint comparisons and Silk retained-CSS checks do not certify all authored/live families.','classification':'INCORRECT NAMES / OVERCLAIM','evidence':'renderer-registry.json'},
 {'id':'C08','claim':'support alias, contact channels, new commission form, permanent redirects','observation':'/support is absent from marketing routes; /about and /help use SPA Navigate replace to /contact, not HTTP301. Actual form keys are name/email/phone/plan/message with limits 120/255/30/120/5000; no claimed address/hours/concierge email or custom commissions are implemented.','classification':'DISPROVED BY SOURCE','evidence':'marketingRoutes.jsx; ContactFeature.jsx'},
 {'id':'C09','claim':'F01–F20 all PASS','observation':'Actual local acceptance JSON uses AC-01–AC-20. This package supplies the requested F01–F20 independently. No one-to-one PASS inheritance.','classification':'RECONCILED IDS / RECLASSIFIED','evidence':'acceptance-f01-f20.json'},
 {'id':'C10','claim':'48 migrations vs 51 SQL paths','observation':f"Current source: {source.get('flywayPaths','?')} Flyway SQL paths; {source.get('trackedSql','?')} total tracked SQL paths. All protected categories unchanged.",'classification':'DIFFERENT FILE SETS','evidence':'source-preservation.json'},
 {'id':'C11','claim':'Studio Phase08 / payments Phase10','observation':'Master: Phase08 identity/account; Phase09 marketplace; Phase10 template art; Phase21 payments; Phase25 admin Studio.','classification':'OWNER LABELS CORRECTED','evidence':'MASTER_SCOPE.md'},
 {'id':'C12','claim':'new whole-home artistic transformation','observation':'HomeFeature and landing components were unchanged in Gemini diff. Existing editorial composition, interactive folio, demo, FAQ and conversion were retained. Codex corrected the overridden editorial face and illegible dark surfaces, rather than crediting old components as new work.','classification':'EXISTING WORK RETAINED; ATTRIBUTION CORRECTED','evidence':'starting-inventory.json; attributed-changes.json'},
]
save('gemini-claim-reconciliation.json',claims)

base='apps/frontend-user/src/'
defs=[
 ('M07-015','P3','Fixed support launcher obscured the last Khmer footer credit','layouts/components/MarketingChrome.css','Let the last credit scroll clear','At the actual page bottom, the 320px Khmer credit overlapped the fixed support launcher in four WebKit/Firefox cases; two Chromium cases passed. Marketing-only bottom space now permits the full credit to scroll clear, including the safe-area inset.','footer credits remain readable above the support launcher'),
 ('M07-001','P2','Venue background could receive focus despite aria-modal','features/marketing/VenuesFeature.jsx','dialog.showModal()','Baseline venue-modal test focuses .kp-brand behind the overlay. Native modality now makes background inert and retains keyboard return.','venue modal isolates background'),
 ('M07-002','P2','Venue selection replaced history; selected state could survive WebKit Back','features/marketing/VenuesFeature.jsx','const selectedVenue','Open card → Back. Initial implementation replaced the directory; first repair exposed stale duplicated state in WebKit. Selection now derives directly from :id.','venue click creates history'),
 ('M07-003','P2','Clear search restored cards but retained visible query and lost task focus','features/marketing/VenuesFeature.jsx','value={searchTerm}','Type no-such-place, Clear search. Controlled input and explicit search focus restore a coherent result state.','venue search reset'),
 ('M07-004','P2','Unknown venue ID silently showed a directory; direct dismissal lacked a focus target','features/marketing/VenuesFeature.jsx','Venue not found','Direct /venues/999 now explains missing ID; direct valid modal closes to directory search.','venue direct entry'),
 ('M07-005','P2','Broken venue imagery lacked fallback and generic stock photos implied specific venues','features/marketing/VenuesFeature.jsx','Photo unavailable','Block Unsplash requests. Fallback preserves geometry; photographs are explicitly illustrative; selected photo is eager/async. Venue rights/factual validation remain a separate review gate.','venue failed photos; slow illustrative photos'),
 ('M07-006','P2','Dark metric text and white vendor surfaces were unreadable','features/marketing/MarketingFeature.css','.kp-landing .kp-metric-value','Fresh axe measured metrics at 2.09:1 (labels) and 2.77:1 (large value). Pixel review also showed white cards with white text. Local semantic foreground/surface overrides preserve renderer ownership.','marketing reflow and axe: dark/en; dark/km'),
 ('M07-007','P2','Contact light eyebrow missed normal-text contrast','features/marketing/MarketingPages.css','.kp-contact-page .kp-page-label','Fresh scan measured #926c34 on #fbf6ee at 4.41:1 for 14px text. Use semantic muted ink.','marketing reflow and axe: light/en; light/km'),
 ('M07-008','P2','Direct route titles were overwritten; contact description/canonical absent','features/marketing/MarketingMetadata.jsx','MarketingMetadata','App initial effect reset route title after ScrollToTop. Removed duplicate title writer; added contact title and scoped description/social/canonical cleanup. Client metadata is not server crawler certification.','about/help redirects; contact title; metadata unit tests'),
 ('M07-009','P3','Claimed editorial Latin face was overridden by body font','features/marketing/MarketingFeature.css','font-family: var(--kp-display)','Rendered desktop used body sans for headings despite loaded local editorial font declaration. Restored existing licensed Cormorant identity for EN H1/H2; Khmer face remains independent.','before/after home capture pairs; loaded-font manifests'),
 ('M07-014','P2','Marketing navigation discarded an unsent contact draft','features/marketing/ContactDraftProvider.jsx','ContactDraftProvider','Contact → Pricing → Back reproduced empty fields. Draft state now lives only in the marketing shell and is keyed to the current account; accepted delivery and leaving the shell clear it. No contact data is written to local/session storage.','contact draft survives marketing Back; draft boundary unit'),
 ('M07-013','P2','Native venue shell was visible before its modal open state','features/marketing/VenuesFeature.css','venue-modal-backdrop:not([open])','A mobile WebKit run lost an immediate Escape on direct entry because display:flex exposed a closed dialog before showModal readiness. Closed native dialogs are now explicitly hidden; the existing direct-entry case asserts native open state and is repeated ten times.','native-ready-repeat; venue direct entry'),
 ('M07-012','P2','Dark contact validation messages failed contrast','features/marketing/MarketingPages.css','kp-contact-page .kp-field-error','Actual submitted invalid state measured 2.08:1 (#a02e39 on #202a24). Semantic danger foreground and invalid borders repair the state; dedicated invalid-form axe cases cover both locales/themes in all six projects.','contact invalid state contrast'),
 ('M07-011','P2','Populated featured/catalog Preview hover became illegible in dark mode','layouts/components/MarketingChrome.css','kp-action-preview:is','A seeded real collection exposed 1.07:1 white text on fixed ivory hover. Shared marketing hover/focus now uses semantic foreground and surface. This touches appearance only; prices/entitlements unchanged.','featured collection hover and discovery'),
 ('M07-010','P2','Unsubstantiated first/premier, 100% and seven-viewport marketing claims','features/marketing/components/LandingHero.jsx','thoughtfully made','Removed unsupported rank claim; replaced blanket linguistic certification/viewport counter with bilingual capability and responsive-layout icon. Renderer counts stay in engineering evidence, not product proof.','home EN/KM screenshots; renderer-registry.json'),
]
defects=[]
for id,severity,title,file,term,detail,cases in defs:
    defects.append({'id':id,'severity':severity,'title':title,'source':base+file,'sourceReference':link_source(base+file,term),'reproductionAndFix':detail,'cases':cases,'status':'FIXED — named fixture verification; see exact command outcomes','owner':'Phase07 Codex','sourceSha':SHA})
save('defect-register.json',defects)

gates=[('F01','Marketing route completeness','VERIFIED COMPLETE','135 source routes/62 groups/63 app-group pairs; owned routes/aliases mapped; route-content sweep and named tests.'),
 ('F02','Whole-home premium experience','VERIFIED COMPLETE','Rendered EN/KM phone/desktop story, real demo entry, collection/empty, folio, FAQ, truthful conversion; independent visual grade B+; native review remains F13.'),
 ('F03','Premium brand system','PARTIALLY COMPLETE','Computed sampled contrast and font loading verified; full native Khmer/weight/device art approval remains external.'),
 ('F04','Header/footer','VERIFIED COMPLETE','Native drawer, skip/main focus, signed-in/out, destinations, Escape/history/resize and footer are covered by Phase07/06 fixtures; page-end credit clearance is checked at 320/1440px in six projects.'),
 ('F05','Contact','VERIFIED COMPLETE','Fixture-only invalid/pending/429/503/offline/unacknowledged/SMTP_ACCEPTED/retry and preference retention. No real SMTP delivery certified.'),
 ('F06','Alias semantics','VERIFIED COMPLETE','/about and /help are replace navigations to /contact. Correct destination title, focus, description; no dedicated page or HTTP301 claim.'),
 ('F07','Venue list/detail','PARTIALLY COMPLETE','Functional states and image policy fixed/tested; exact venue facts and photo rights need directory/content owner approval.'),
 ('F08','Marketplace boundary','VERIFIED COMPLETE','Browse/create/pricing destinations and safe login next retained; prices/entitlements unchanged. Full pricing/catalog belongs to Phase09/21.'),
 ('F09','UX laws / application quality','VERIFIED COMPLETE','Observed hierarchy, recognition, keyboard operation, practical targets and error recovery. See heuristic review and sampled geometry.'),
 ('F10','Motion governance','VERIFIED COMPLETE','Normal/reduced paths; no new motion engine/3D; immediate venue content; selected dialog respects reduced motion. Physical profiling remains external.'),
 ('F11','Accessibility','PARTIALLY COMPLETE','Sampled axe and keyboard/contrast run; physical AT and native zoom cannot be certified here.'),
 ('F12','Responsive quality','PARTIALLY COMPLETE','25 viewport/reflow points in each main browser/theme/locale case; physical keyboards, native bars and real zoom remain external.'),
 ('F13','Localization','PARTIALLY COMPLETE','EN/KM route/state source and rendered samples verified; native terminology, shaping and pronunciation approval remains external.'),
 ('F14','Performance','PARTIALLY COMPLETE','Controlled local before/after assets and repeated routed lab comparison; review triggers and field/device limits remain explicit.'),
 ('F15','Renderer isolation','PARTIALLY COMPLETE','10/38/2/fallback source/unit contracts; Silk retained-CSS computed comparison and Silk/Emerald paint only. Dynamic published catalog/all guest families remain external/domain-owned.'),
 ('F16','Regression reliability','PARTIALLY COMPLETE','Current unit/lint/build and browser commands recorded; Phase02 six known red assertions and default-worker instability stay explicit. No historical result relabeled as current.'),
 ('F17','Business/security preservation','PARTIALLY COMPLETE','Protected source paths unchanged; guards/preview/entitlement unit contracts retained. No MySQL/provider/payment/live guest integration certificate.'),
 ('F18','Evidence completeness','VERIFIED COMPLETE','Dated package, logs/manifests/source hashes/regeneration scripts, truthful failures and local-only artifacts. External evidence explicitly unavailable.'),
 ('F19','Cross-phase recovery','VERIFIED COMPLETE','All 57 original IDs and original fields preserved; per-ID status/evidence/next action retained. No external gates silently closed.'),
 ('F20','Phase08.1 handoff','VERIFIED COMPLETE','Gemini-first identity/account scope, boundaries, next actions and Codex verification cycle documented.')]
gate_rows=[{'id':id,'gate':name,'status':status,'evidence':proof,'sourceSha':SHA,'scope':'local source + fictional fixture evidence only','owner':'Phase07 Codex / named external gate owner'} for id,name,status,proof in gates]
# A required missing final test is not allowed to inherit a written gate claim.
required=['delivery-phase07','closure-phase06-recovered','delivery-combined','closure-route-content','delivery-user-unit','delivery-user-lint','final-admin-unit','final-admin-lint','final-token','delivery-user-build','delivery-captures','delivery-contrast','delivery-modes','delivery-reverse-check','final-lab-before','final-lab-after','closure-marketing-only','evidence-validation-repaired']
missing=[k for k in required if not by_id.get(k) or by_id[k].get('exitCode')!=0]
if missing:
    for r in gate_rows:
        if r['status']=='VERIFIED COMPLETE': r['status']='PARTIALLY COMPLETE';r['evidence']+=' Final package check pending: '+', '.join(missing)
gate_context={
 'F01':(['/','/contact','/venues','/venues/:id','/about','/help','*'],['closure-route-content','delivery-phase07'],['route-shell-inventory.json','route-state-matrix.json']),
 'F02':(['/'],['delivery-phase07','delivery-captures'],['before-manifest.json','after-manifest.json']),
 'F03':(['/','/contact','/venues'],['delivery-contrast','delivery-modes'],['computed-theme-contrast.json','asset-rights-ledger.json']),
 'F04':(['marketing header/footer'],['delivery-phase07','closure-phase06-recovered','footer-clearance-after'],['after-manifest.json']),
 'F05':(['/contact'],['delivery-phase07','delivery-marketing-routes'],['route-state-matrix.json','after-manifest.json']),
 'F06':(['/about','/help'],['delivery-phase07'],['route-state-matrix.json']),
 'F07':(['/venues','/venues/:id'],['delivery-phase07'],['after-manifest.json','asset-rights-ledger.json']),
 'F08':(['/templates','/pricing','/login','/app/events/new'],['delivery-phase07','delivery-user-unit'],['source-preservation.json']),
 'F09':(['all Phase07 consuming routes'],['delivery-phase07'],['defect-register.json','after-manifest.json']),
 'F10':(['/','/venues','/venues/:id'],['delivery-phase07','delivery-combined'],['mode-edge-results.json','after-manifest.json']),
 'F11':(['home/contact/venues/detail sampled states'],['delivery-phase07','delivery-contrast','delivery-modes'],['computed-theme-contrast.json','mode-edge-results.json','native-zoom-results.json']),
 'F12':(['home/contact/venues/detail at documented widths'],['delivery-phase07','delivery-modes'],['after-manifest.json','mode-edge-results.json','native-zoom-results.json']),
 'F13':(['EN/KM marketing routes'],['delivery-phase07','delivery-captures'],['after-manifest.json','asset-rights-ledger.json']),
 'F14':(['/','/contact','/venues'],['final-lab-before','final-lab-after','delivery-assets'],['performance-comparison.json','performance-samples.json','build-assets.json']),
 'F15':(['/templates/silk-heritage','/templates/emerald-canva-luxe-wedding','source registry'],['delivery-phase07','delivery-user-unit'],['renderer-registry.json','before-manifest.json','after-manifest.json']),
 'F16':(['Phase02/04/05/06/07 fixture routes'],['final-phase02','delivery-combined','closure-phase06-recovered','delivery-phase07','final-default-workers','skip-isolated-repeat'],['test-command-results.json']),
 'F17':(['protected auth/checkout/guest/Studio contracts'],['delivery-user-unit','final-admin-unit'],['source-preservation.json']),
 'F18':(['report package'],['evidence-validation-repaired'],['test-command-results.json','evidence-validation.json']),
 'F19':(['57 historical source/domain obligations'],['delivery-user-unit','delivery-combined'],['carryover-updated.json']),
 'F20':(['Phase08 identity/account handoff'],[],['../19-phase08-1-gemini-frontend-execution-handoff.md']),
}
for row in gate_rows:
    routes,command_ids,artifacts=gate_context[row['id']]
    row.update(routes=routes,testCommandIds=command_ids,evidenceArtifacts=artifacts)
save('acceptance-f01-f20.json',gate_rows)
counts=dict(collections.Counter(r['status'] for r in gate_rows))

prior=read('docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/carryover-closure-ledger.json')
carry=[]
for row in prior['entries']:
    current=dict(row)
    current['originalOwner']=row['owner'];current['previousStatus']=row['finalStatus'];current['currentStatus']=row['finalStatus']
    current['phase07SourceSha']=SHA
    if 'qa-new' in row['id']:
        evidence='baseline-phase02 and final-phase02: same three failures in two projects; original assertions untouched. Native Khmer copy/QA owner approval required.'
    elif row['finalStatus'].startswith('BLOCKED') or row['finalStatus'].startswith('DEFERRED'):
        evidence='External/domain scope remains unavailable; marketing fixtures do not close this gate. '+row.get('nextAction','')
    elif row['id']=='P05-concurrency':
        evidence='Controlled accepted-combined, six-project run and accepted-default-workers retained separately; one local run cannot certify isolated CI capacity. Build-origin mismatch diagnosed without changing trust.'
    elif row['id']=='P05-timings':
        evidence='Marketing performance-comparison.json is new local evidence only. Historical RSVP +264ms/+41.51% timing review and field obligations remain open.'
    elif row['finalStatus']=='REVIEW REQUIRED':
        evidence='Review remains open. Two sampled renderer paints and local typography do not replace authored/live/native evidence. '+row.get('nextAction','')
    else:
        evidence='Current full frontend unit contracts, route factories, token check and Phase04/05/06 fixture suites revalidate applicable foundations; protected paths unchanged. Original narrow closure retained, not expanded to all domain states.'
    current['phase07Evidence']=evidence
    current['nextAction']=row.get('nextAction','Preserve verified contract in owning domain')
    carry.append(current)
assert len(carry)==57 and len({r['id'] for r in carry})==57
carry_counts=dict(collections.Counter(r['currentStatus'] for r in carry))
save('carryover-updated.json',{'sourceSha':SHA,'originalCount':57,'count':len(carry),'counts':carry_counts,'entries':carry,'newPhase07Findings':'defect-register.json; separate IDs, not merged into historical denominator'})

rights=[
 {'asset':'CormorantGaramond.woff2 / marketing Koupreng Editorial alias','provenance':'docs/frontend/user/template-asset-licenses.md; adjacent CormorantGaramond-OFL.txt','status':'EXISTING LOCAL OFL NOTICE RETAINED; no new asset imported','use':'EN marketing headings; actual loaded-face evidence in manifests'},
 {'asset':'DM Sans / Kantumruy Pro / Moul','provenance':'existing local font notices and Phase03 binary audit','status':'SOURCE PRESERVED; native glyph/weight approval remains external'},
 {'asset':'Homepage phone preview, Silk folio, template posters, brand logo','provenance':'existing public assets and repository template asset ledger','status':'EXISTING ASSETS PRESERVED; no rights expansion claimed'},
 {'asset':'four images.unsplash.com venue URLs','provenance':'preexisting getVenues static records; exact photographer/use record absent from local scope','status':'REVIEW REQUIRED — directory/content owner must verify rights and photo identity','mitigation':'illustrative caption, empty photo alt, failed-media fallback; no verified venue photography or partnership claim'},
 {'asset':'src/assets/icons/background.png on Venues','provenance':'preexisting local decorative asset; unchanged','status':'BASELINE ASSET RETAINED; 2,520,889 decoded bytes in the measured route; absolute mobile asset-cost/provenance review remains open'},
 {'asset':'new UI source','provenance':'original project edits using existing React/Framer/Lucide; local native dialog','status':'NO NEW THIRD-PARTY COMPONENT, FONT, RUNTIME DEPENDENCY OR IMAGE IMPORT'},
]
save('asset-rights-ledger.json',rights)

cmd_table='\n'.join(f"| {r['id']} | `{r.get('command','see interrupted log')}` | {r['status']} / {r.get('exitCode')} | {'; '.join(r.get('observedSummary',[])).replace('|','/')} | [log](../../../output/phase07-codex-2026-11-18/{r['id']}.log) |" for r in commands if (OUT/(r['id']+'.log')).exists())
route_table='\n'.join(f'| `{r}` | {c} | {s} | {t} | {d} |' for r,c,s,t,d in route_rows)
gate_table='\n'.join(f"| {r['id']} | {r['gate']} | {r['status']} | {r['evidence']} |" for r in gate_rows)
defect_table='\n'.join(f"| {r['id']} | {r['severity']} | {r['title']} | {r['sourceReference']} | {r['cases']} |" for r in defects)
claim_table='\n'.join(f"| {r['id']} | {r['claim']} | {r['observation']} | {r['classification']} |" for r in claims)
carry_table='\n'.join(f"| {r['id']} | {r['originalOwner']} | {r['previousStatus']} | {r['currentStatus']} | {r['phase07Evidence']} | {r['nextAction']} |" for r in carry)
files=[
 ('01-source-git-and-gemini-diff-reconciliation.md','Source, Git and Gemini diff reconciliation',f'''`main` remains `{SHA}`; observed `origin/main` is `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`. All 13 local Phase06 commits remain ancestors. No fetch/pull/reset/restore/clean/commit/push/deploy was performed. No staged changes were present at the start.

Initial Gemini state: six tracked files modified; VenuesFeature.css, Phase07Marketing.test.jsx and the complete Phase07.1 report directory untracked. It was a dirty, focused working tree, not a clean checkout. Existing home components and contact logic were not newly implemented by Gemini.

Before edits, 30 allowed frontend/report files were hashed and backed up to ignored `output/phase07-codex-2026-11-18/starting-files/`; binary diff is `gemini-starting.patch` (25,583 bytes). No environment files or secrets were copied. Initial commands and untracked inventory are preserved in `initial-git.txt` / `starting-inventory.json`. Codex-only patch is generated separately against this starting state. The [final Git snapshot](evidence/git-final.txt) records the actual dirty/staged/untracked state.

[Current source preservation](evidence/source-preservation.json) includes original Gemini report hash checks and protected categories. Local `.git/info/exclude` excludes only `/output/phase07-codex-2026-11-18/`; binaries, local backups and traces are not proposed Git artifacts. [Changed-file attribution](evidence/attributed-changes.json) distinguishes Gemini, Codex and newly created source. Original historical reports remain unchanged.'''),
 ('02-claims-and-test-count-discrepancy-register.md','Claims and test-count discrepancies',f'''Neither narrative counts nor an acceptance JSON are executed proof. Local Gemini acceptance uses AC identifiers; F identifiers below are this independent audit's requested contract.

| ID | Claim | Source/current observation | Classification |
|---|---|---|---|
{claim_table}

Controlled baseline: {result('baseline-phase06')}; {result('baseline-phase02')}. Actual final outcomes are in [commands](15-exact-commands-test-matrix-and-evidence-index.md). Gemini raw traces for its 24/8 and 36/44/42/44 claims were not supplied, so their exact additional failure cause cannot be retroactively proven. The separate origin probe demonstrates the concrete default-origin failure mode.'''),
 ('03-phase07-route-feature-state-coverage.md','Route, feature and state coverage',f'''Current source inventory has {source.get('routes','?')} routes, {source.get('groups','?')} groups and {source.get('appGroupPairs','?')} application/group pairs. Every current factory entry is retained in [route-shell inventory](evidence/route-shell-inventory.json). A route sweep is readiness coverage, not complete business-state certification of 135 routes.

| Route | Consumer | Owned states | Actual case family | Dependency / boundary |
|---|---|---|---|---|
{route_table}

[Machine state matrix](evidence/route-state-matrix.json). Unsupported booking, refunds, general CMS, owner calendar and live AI remain out of scope. `/support` is not a marketing alias; it receives existing 404 recovery. `/pricing/packages` is not inferred from Gemini prose. All in-scope states have named local evidence or explicit external/domain limits.'''),
 ('04-premium-brand-visual-ux-laws-review.md','Premium brand and UX-law review',f'''Independent UX grade: **B+ after repair**, versus **C for the observed starting dark-mode/recovery defects**. This is a qualitative local review, not a universal WCAG or cultural certification. The deliberate logo, ceremonial invitation art, ivory/forest/gold palette, split desktop hero, tactile folio and clear create/browse hierarchy are worth retaining. EN headings now use the existing licensed Cormorant face; Khmer retains its own face and spacing.

The baseline's dark cards visibly mixed white surfaces with pale inherited text, and metrics failed computed contrast. Both are repaired within marketing selectors. No generic console redesign, new artwork or component suite was introduced. Long lower-page repetition and native linguistic/art approval remain design review limits.

Nielsen status/recovery A− (pending/error/acknowledged contact states); match/truth B+ (removed unsupported rank/certification counters, venue facts still owner review); control/freedom A− (Back, Escape, clear/reset); consistency B+ (local theme repairs); prevention A− (duplicate-submit guard retained); recognition A− (named actions); efficiency B+ (sampled primary targets); minimalism B (long home narrative); recovery A−; contextual help B.

Hick: two clear hero paths. Fitts: sampled primary actions meet practical 44px height; this is not every inline-link certification. Jakob: URL selection and browser Back now agree. Gestalt: errors stay grouped with fields, while demo guest data is explicitly labeled. Evidence: {shot('home-_-initial-1440-en-light-reduce')} / {shot('home-_-initial-390-km-dark-reduce')}; see [visual manifests](evidence/after-manifest.json).

Requested skills were used in focused phases: code-reviewer with ss-audit/ui-ux-pro-max; QA with koupreng-qa-release/playwright/ss-verify; repair with react-state-management/ui-styling/ui-ux-pro-max. HyperFrames CLI was inspected but no video was requested or generated. ss-component did not require scaffolding because existing primitives/native dialog fit. Legacy StyleSeed declares operations-console/productivity/list and has no STYLESEED.md; it is stale/mismatched for this marketing artifact. Its core heuristics informed review; formal compiled-grammar compliance is **not claimed**, and the lock was not rewritten. The read-only resolver exited 1: `Missing output grammar` The [ss-verify skill](../../../.agents/skills/ss-verify/SKILL.md) says, “With no registry or lock, establish scope before a compliance claim.” The user's Phase07 master scope supplies the review boundary; it does not repair the missing StyleSeed lock.'''),
 ('05-home-storytelling-cta-and-conversion-audit.md','Home storytelling and conversion',f'''HomeFeature already composed LandingHero, featured TemplateGrid, InvitationShowcase, LandingProduct, LandingStory and LandingConversion before Gemini's edits. Attribution matters: Phase07.1 changed styling/localization/preload and venue extraction, not these existing narrative modules.

The retained story is: see a genuine invitation → explore designs → understand guest information/RSVP → learn creation steps → inspect current package information → read FAQ → create or ask for help. Primary create remains `/app/events/new` with existing safe login continuation; browse remains `/templates`; pricing points to `/pricing`; help points to `/contact`. The folio sample and guest table disclose illustrative data. FAQ uses native details/summary with keyboard behavior.

Codex restored intended EN editorial hierarchy, removed the unsupported “premier/first” claim and blanket “100%”/“7 viewports” counter language, and fixed dark metric/vendor-card readability. The ten dedicated registry families include the authoring starter; that count is not a live purchasable-theme count. The public counter and authenticity/realtime/instant claims were removed in favor of capabilities. Server package amounts and access checks were not changed.

The base route fixture intentionally yields a featured-empty state because Event Essential is not a featured code. Supplemental collection captures seed three explicitly fictional source-shaped identities to inspect real card consumers without faking live catalog proof. {shot('home-_-collection-1440')} / {shot('home-_-collection-390')}. Dynamic production catalog parity remains Phase09/10 and external dataset QA.'''),
 ('06-header-footer-drawer-navigation-and-seo.md','Header, footer, navigation and SEO',f'''The actual skip link is `.host-skip-link` → `#marketing-content`; neither Gemini's `#main-content` nor `#nav-menu` claim matches current source. Header's native `#public-mobile-navigation` retains Escape, Tab wrap, return focus, body scroll lock, route close and desktop resize behavior. Six-project Phase06 tests exercise Back/scroll, owner/admin drawers and Studio reachability separately.

A fresh page-end check reproduced the fixed support launcher covering the Khmer credit in four WebKit/Firefox cases (Chromium passed). Marketing-only footer bottom space now clears the launcher; all six project cases pass. Matched page-end captures distinguish this from intermediate scrolling: {shot('home-_-footer-end-320-km-dark-reduce', 'before')} / {shot('home-_-footer-end-320-km-dark-reduce')}.

Header discovery/create/login or signed-in Dashboard destinations and footer home/templates/pricing/venues/contact/login are source-preserved and fixture-tested. About/Help use client-side Navigate replace to Contact. No dedicated About/Help page, permanent server redirect, address, concierge email or office hours was manufactured.

Contact now has a route title, scoped description/social copy and canonical without query/fragment. Marketing tags restore previous values on unmount, protecting guest metadata ownership. Removed the app-level generic title writer which overwrote direct route titles. {link_source(base+'app/App.jsx','document.documentElement.lang')} and {link_source(base+'features/marketing/MarketingMetadata.jsx','MarketingMetadata')}.

**SEO limit:** static index still contains generic invitation-oriented social fallback, and client tag updates do not certify non-JavaScript social bots, crawl rendering, HTTP redirect codes or HTTP404 deployment behavior. Deployment/SEO owner must validate server response/canonical/social-card origin and rights on staging. No backend or Nginx change was made to manufacture certification. {shot('contact-_about-alias-390')} / {shot('home-_phase07-missing-404-390')}.'''),
 ('07-contact-form-support-and-recovery.md','Contact form and recovery',f'''Actual payload: `name`, `email`, optional `phone`, `plan`, `message`; limits 120/255/30/120/5000. Required name/email/message and native email validity are checked on submit. Existing validation and API contract were retained, including trimmed payload, first invalid-field focus, described errors, in-flight duplicate guard and disabled fieldset. Gemini's minimum lengths, subject/ceremony types, character counter, custom commission pricing, office channels and blur validation descriptions do not describe this form.

Only `{{accepted:true, delivery:"SMTP_ACCEPTED"}}` produces success; QUEUED is rejected. Browser fixtures intercept `/api/v1/contact`; they exercise invalid/malformed, pending, 429, 503/offline, retry, entered-data retention, locale/theme changes and focused acknowledgment. There was no real contact delivery or mailbox write. No Telegram contact address is displayed on the current Contact page, so the report cannot certify a channel inferred from Gemini prose. Unsent fields now survive navigation between marketing routes in shell-owned memory. Accepted delivery, leaving the marketing shell, or account identity changes clear the draft. No contact data is persisted to localStorage/sessionStorage; reload/cross-shell restoration is not promised.

The light eyebrow contrast was 4.41:1 and now uses semantic muted ink. Route metadata was added without exposing entered form values. Contact initial/invalid/filled/pending/error/recovered screenshots are indexed in [after manifest](evidence/after-manifest.json): {shot('contact-_contact-failure-390')} / {shot('contact-_contact-recovered-390')}. Native keyboard/AT and real SMTP configuration remain external gates.'''),
 ('08-venues-directory-detail-modal-and-media.md','Venue directory, dialog and media',f'''Four local static venue records are an editorial starting point, not booking inventory. Capacities, price symbols, popularity/service tags and image identity are not independently verified venue facts. A visible disclaimer requires direct confirmation; photos are explicitly illustrative. The new contact CTA says Contact Koupreng rather than implying a booking partnership. Rights/factual review stays open.

Gemini's extraction removed the inline style block and emitted a route CSS asset; initial JSX did not contain the claimed async decoding. Codex retained the stylesheet/art direction, namespaced generic tag/overlay/gold classes, made the search controlled with focusful reset, supplied missing-ID recovery and a fixed-size failed-photo fallback, and made selected photos eager/async while keeping cards lazy.

The initial custom role=dialog did not make background inert. Native showModal now owns modality; closed dialogs stay hidden until the open state exists, preventing an early Escape race; explicit trap/Escape and return paths remain. URL :id now owns selection. Card navigation pushes history, Back returns to directory, and direct close replaces to `/venues` with search focus. A first repair's duplicated state exposed a WebKit stale-dialog failure; source-derived selection fixed the reproduced failure. The original venue unit test was wrapped in the real `/venues/:id?` route; assertions were retained. This is fixture realism, not a weaker expected result. Old Phase02 assertions were untouched.

No ScrollReveal entrance hides the venue task while waiting for viewport intersection. Reduced motion avoids card/dialog transforms. Search min-width and modal safe-area/vertical flow prevent clipped primary actions. Failed and slow-photo paths run locally without remote venue fetches. {shot('venues-_venues_1-direct-390')} / {shot('venues-_venues-empty-390')}.'''),
 ('09-khmer-english-typography-and-theme-qa.md','Khmer/English typography and theme QA',f'''Locale remains in the existing Zustand language store; form/search UI state remains local and venue selection is URL-derived. A shell-owned contact draft survives marketing navigation and clears at account boundaries; no global persistence library or duplicate server-price store was introduced. EN headings use existing locally licensed Koupreng Editorial (Cormorant 600); body uses the current core fonts. Khmer display/body fallbacks remain Moul/Kantumruy Pro under current tokens. No template font files or registry faces were edited.

All capture rows list actually loaded faces/weights. EN/KM + light/dark + normal/reduced home sampling covers 320/390/768/1440/1920, with other owned routes sampled and responsive cases covering additional breakpoints. Source fallbacks remain operational when backend translations are empty in fixtures. The original en-dash repairs in marketingMessages are preserved.

Native Khmer terms, diacritic shaping, pronunciation, long names, synthetic weights and physical platform rendering require a qualified reviewer. A numeric 100% language guarantee was removed. The report's font list is based on current declarations/loaded faces, not Gemini's proposed Playfair/Cinzel/Inter palette. {shot('home-_-initial-390-km-dark-reduce')} / {shot('home-_-initial-1440-en-light-reduce')}.'''),
 ('10-responsive-cross-browser-a11y-and-input.md','Responsive, cross-browser and accessibility QA',f'''The main Phase07 suite executes real consuming routes in desktop/mobile Chromium, WebKit and Firefox projects. Reflow uses 320,360,375,390,414,430,599,600,601,767,768,769,820,1023,1024,1025,1100,1101,1102,1280,1440,1920 plus 844×390,820×430,768×390. Each of four theme/locale cases traverses home/contact/venues/detail and samples primary-action height. The extra 1100/1101/1102 neighbors match the actual marketing header breakpoint.

Axe scans run WCAG2 A/AA, 2.1 AA and 2.2 AA tags on four owned routes in each variant/project: **96 base route scans plus 48 populated-card hover scans and 24 invalid-form scans** when all six projects pass. Attachments retain each result. Keyboard cases verify skip, drawer modality/trap/Escape/return, FAQ Enter/Space, validation focus, native venue focus and browser Back. Forced-colors/reduced-motion is a browser proxy, not physical AT. Initial contrast failures and their exact computed colors remain in the baseline logs.

{result('delivery-phase07')}. Separate [mode-edge probes](evidence/mode-edge-results.json) verify failed local fonts, text spacing, menu/venue backdrop dismissal and detail refresh in 24 browser/width/theme/locale combinations. Native zoom and physical virtual keyboards are not certified by these assertions. [Computed-theme pairs](evidence/computed-theme-contrast.json) record 408 sampled values; gradients/alpha remain explicitly unresolved by the numeric helper and are covered only by their named axe/visual samples. Native 200/400% zoom, VoiceOver/TalkBack, OS font scaling, Android/iPhone/in-app client journeys remain **BLOCKED — EXTERNAL**, with Phase26 QA owners. CSS viewport/reflow checks are not relabeled as native zoom. The [native zoom attempt](evidence/native-zoom-results.json) stopped before input: the owned Chromium window was listed, but get_window twice returned `window id 853142 no longer belongs to Chrome; current owner is Chrome`, including one fresh lookup/retry. Neither actual 200% nor 400% zoom was executed.'''),
 ('11-motion-media-lazy-loading-and-performance.md','Motion, media and performance',f'''Before is the exact preserved Gemini working build; after is the repaired local build. HEAD is identical because no commits were authorized; source-tree/build hashes distinguish stages. Requests, decoded response bytes, ResourceTiming transfer fields, emitted raw/gzip/Brotli bytes, FCP, observed LCP element/timing, CLS and long tasks are separate records.

Lab design: Chromium/native performance clock, same loopback fixture/hardware, 390/1440, light/dark, normal/reduced, routed cold/revisit contexts, five repetitions per group. Playwright request routing disables normal HTTP caching; revisit is explicitly **routed-revisit**, not proof of native warm cache. External venue images are blocked, so these measurements do not certify their real latency/bytes. Observation window is 700ms after ready/fonts and does not measure field INP or late user scrolling. Available earlier raw rows remain in before/lab-diagnostic-initial.json and before/lab-interrupted-hover-review.json; attempts without a completion record are explicitly excluded; final controlled comparison uses the isolated frozen-source before/after run. The pair ran without concurrent agent browser/unit/build work; final regression confirmations followed it.

Current performance summary: `{json.dumps(perf.get('summary',perf.get('status')),ensure_ascii=False)}`. [Comparison](evidence/performance-comparison.json), [build assets](evidence/build-assets.json), [before](evidence/before-manifest.json), [after](evidence/after-manifest.json). Review triggers use >100ms **and** >20% median timing, >20KiB **and** >10% route transfer, or CLS delta >0.02. Triggers are review signals, not automatic source causality.

{perf_table}

{asset_table}

Emitted totals cover every built route chunk and exclude public media. They are separate from actual route request bytes in the table above.

**Absolute cost remains a review item:** Venues requests the preexisting `background.png` at 2,520,889 decoded bytes (about 2.40 MiB). It dominates the route even when remote venue photos are blocked. Zero relative review triggers do not make that weight negligible. The phase defines baseline-relative diagnostics rather than an absolute venue transfer target; performance/content owners should assess an equivalent smaller derivative and a mobile transfer budget against real-device visual quality. The original decorative art was retained. This cost contributes to the partial F14 decision.

No new runtime dependency, GSAP/Three/WebGL or global smooth-scroll engine. Existing CSS/Framer paths remain; venue reveal no longer hides essential content and selected media is eager. New English editorial face use is an existing licensed local asset with explicit request-cost accounting. Historical RSVP +264ms/+41.51% review and field p75 CWV remain open; a marketing benchmark does not close them.'''),
 ('12-phase02-to-phase06-regression-triage.md','Phase02–06 regression triage',f'''Controlled baseline built admin with `VITE_USER_APP_URL=http://127.0.0.1:4173`, matching the actual user preview. Baseline Phase06 passed 44/44. Phase02 passed 26 and failed six: responsive Studio simultaneous iframe visibility, outdated Khmer create action, outdated Khmer external-preview accessible name; each appears in two projects. These are exact assertion identities, not visual snapshots. Stronger current Studio reachability/section/dirty-state tests remain in Phase06; native copy/QA owners must approve historical assertion maintenance.

Final six-project Phase06: {result('closure-phase06-recovered')}. Controlled Phase04/05/06: {result('delivery-combined')}. Phase02: {result('final-phase02')}. Earlier default concurrency: {result('accepted-default-workers')}. Latest default concurrency: {result('final-default-workers')}. The latter failed the unchanged desktop shared-invitation Skip assertion after five seconds while the page still showed Loading template. Its trace/context is retained. Isolated original-assertion repeat: {result('skip-isolated-repeat')}. Resource-sensitive loading is a supported hypothesis, not proven root cause; the CI/default-worker gate stays open. Counts refer to different project/case denominators. No old expectations were retimed, deleted or changed.

Default admin runtime points at localhost:5173 when VITE_USER_APP_URL is not supplied. [Origin probe](evidence/origin-diagnosis.json) preserves the emitted default destination versus consistent-loopback success; preview origin/session trust was not weakened. Gemini's original failing traces are unavailable, so a reproduced origin failure mode does not prove every reported Gemini failure was caused by it.

The initial new matrix recorded 91/102 because 11 oversized multi-route reflow cases exhausted their total 30-second timeout. The final matrix splits routes into independent cases and batches actual geometry reads, retaining every width and adding descendant bounds; no timeout was increased. That run passed 192/192. Four additional populated collection/theme/locale cases (each on home and catalog) per project then exposed a 1.07:1 hover failure; the populated-card run passed 216/216; explicit invalid-form contrast adds 24 cases, so the resulting suite contained 240 cases. A final marketing Back/draft-clear contract adds six cases, so that suite contained 246 cases. Six page-end footer-clearance cases bring the delivered matrix to 252 without changing old suites or timeouts.

Our own new-test issues were retained: a nonexistent Silk selector, desktop-hidden preference selection, a transient bounding-box read, an initial capture syntax error, a wrong Playwright project config invocation, and WebKit's reproduced stale dialog. Intermediate/interrupt logs remain separate from final acceptance. No live backend/Telegram/MySQL suite was run for this frontend-only phase.'''),
 ('13-renderer-and-business-invariant-preservation.md','Renderer and business invariants',f'''Current source registry: {registry.get('dedicatedFamilies','?')} dedicated families / {registry.get('aliases','?')} alias keys, two shared IDs (`event-essential`, `koupreng-demo-wedding`) and callable deferred DefaultTemplateLayout fallback. [Actual mapping](evidence/renderer-registry.json) replaces Gemini's fictional gallery family names. Resolver precedence and original guard/preview/unit contracts remain unchanged.

Protected categories are empty in [source preservation](evidence/source-preservation.json): backend/Telegram, manifests/lockfiles, migration history, template art/fonts/registry and original Phase02/04/05/06 browser tests. Current tracked SQL sets are 48 Flyway migration files / 51 total SQL files. No migration was applied, edited or inferred from a table count.

Full frontend units include existing safe-next/role/entitlement, unknown JSON roundtrip, preview origin/session and payment/status contracts. CTA tests use existing auth continuation. Passing unit logs still contain Happy DOM iframe-loading-disabled diagnostics against localhost:3000; these were retained and are not browser iframe or live-backend proof. The actual browser suites provide their own bounded iframe checks. No server amount/currency/entitlement/PAID status, guest token, RSVP privacy or media ownership logic changed. This is preservation evidence, not a live integration certificate.

Silk direct versus marketing-retained SPA CSS computed foreground/background/font are compared; before/after Silk desktop and Emerald mobile captures are representative paint checks. {shot('template-demo-_templates_silk-heritage-renderer-1440')} / {shot('template-demo-_templates_emerald-canva-luxe-wedding-renderer-390')}. In these captures the bounded fixture deliberately returns 501 for unspecified Silk/Emerald slug API requests, and the registered local cover fallback paints. Emerald has no authored couple names in this fixture. No cover typography/color/geometry change was apparent in the inspected pairs, but these are fallback-cover comparisons, not complete authored-data or published invitations. External media abort errors, deliberate contact 503 responses and these fixture 501 responses remain in the capture error/request arrays; no page exceptions were observed in the final capture set. Full authored renderer/media/guest journeys belong to Phase10/16; live catalog, sandbox payments and MySQL remain blocked separately.'''),
 ('14-verified-bugs-fixes-and-reproduction.md','Verified bugs, repairs and reproduction',f'''Severity P2 means material accessibility/navigation/content trust; P3 means polish. Each row has a reproduced starting or intermediate failure, a focused source repair and named fixture evidence. Open external rights/copy/device certification is separate from fixed local behavior. No P0/P1 was identified in this marketing diff.

| ID | Severity | User-visible defect | Current source | Reproduction / test |
|---|---|---|---|---|
{defect_table}

[Machine defect register](evidence/defect-register.json). Baseline browser result: {result('baseline-new-marketing')}; one of its nine failures was our contact selector error, not a product defect. Subsequent scans exposed the contact contrast failure; WebKit diagnosis exposed stale derived state. Initial and intermediate logs/traces are preserved, not rewritten as passes. Additional selector namespacing and immediate venue paint are preventive containment improvements, not invented confirmed cross-renderer bugs.'''),
 ('15-exact-commands-test-matrix-and-evidence-index.md','Exact commands and evidence',f'''Commands below are collected from actual process results; exit codes, durations and full stdout/stderr are retained in [machine results](evidence/test-command-results.json). Local binary evidence/backup tree is deliberately excluded from Git via .git/info/exclude. No production data or credentials are included. Source/report files and regeneration scripts are reviewable without committing binary screenshots.

| Run | Exact command | Status / exit | Observed output | Full local log |
|---|---|---|---|---|
{cmd_table}

Native zoom was attempted through the computer-use skill and @oai/sky on an owned headed fixture; the bridge failed before input after a fresh-window retry. Its exact result is in [native zoom evidence](evidence/native-zoom-results.json).

Additional read-only inspection used git branch/rev-parse/status/log/diff/ls-files, rg, Get-Content, Get-Command npx, Node/npm version checks, selected local PNG inspection and loopback listener inspection. A PowerShell quote error broadened one rg query; Windows wildcard path guesses and a missing STYLESEED.md read failed and were corrected/recorded. These inspection errors are not failed product tests. Run harness, builds, fixtures and capture source live in this evidence directory. No external integration command is represented as run when it was not.'''),
 ('16-gemini-f01-to-f20-independent-acceptance-matrix.md','Independent F01–F20 acceptance',f'''Independent scoreboard: `{json.dumps(counts,ensure_ascii=False)}`. Overall **PARTIALLY COMPLETE** because native language/device/AT/zoom, field performance, venue factual/rights and live integration obligations are open. Verified means the explicitly named local fixture/source scope only. Gemini's AC-01–20 register is preserved unchanged.

| ID | Gate | Independent status | Evidence / limit |
|---|---|---|---|
{gate_table}

[Machine acceptance](evidence/acceptance-f01-f20.json). Final command gaps, if any: `{missing}`. A missing result prevents inherited verified labels.'''),
 ('17-cross-phase-57-entry-closure-update.md','57-entry cross-phase closure update',f'''All 57 distinct original IDs, original owners, previous evidence and statuses are preserved. Counts: `{json.dumps(carry_counts,ensure_ascii=False)}`. No new marketing fixture is used to close physical devices, native Khmer, provider, database, field CWV or complete authored renderer journeys. Four repeated QA maintenance gates remain four historical ledger entries, not four unique app defects.

Phase01/03/04/05/06 broader statuses remain PARTIALLY COMPLETE; Phase02 remains COMPLETE as an architecture package, not production certification. Phase07 findings are separate M07 IDs. Source-preserved historical closures retain their original narrow scope; evidence rows distinguish rerun contracts from external/domain obligations.

| ID | Original owner | Previous | Current | Current evidence / reason | Next action |
|---|---|---|---|---|---|
{carry_table}

[Lossless machine update](evidence/carryover-updated.json). All IDs are unique and compared to the original JSON before generation.'''),
 ('18-changed-files-diff-security-rollback.md','Changed files, preservation and rollback',f'''[Attribution ledger](evidence/attributed-changes.json) lists Gemini starting hashes, Codex current hashes, ownership and exact paths. [Source preservation](evidence/source-preservation.json) checks all original Gemini report hashes and protected categories. Production changes are marketing JSX/CSS/metadata and one duplicate title-writer removal; no route factory, auth/payment API, data migration, dependency or template art/registry changed.

The original venue unit test was changed only to mount the real optional-id route; all its original assertions remain. New browser tests cover stronger actual-route behavior. Original Phase02/04/05/06 E2E files are unchanged. New metadata tests prove canonical updates and restoration on unmount.

Rollback is **reviewable, per-file/per-hunk**, not a reset: preserve current later work first; inspect `output/phase07-codex-2026-11-18/codex-only.patch` against the recorded starting hashes; apply only approved reverse hunks to attributed paths. Inspect new files individually and their consumers before any removal. Retain Gemini's starting files, all 13 Phase06 commits and original reports. Do not run Gemini's blanket checkout/remove recipe. No rollback has been executed. No commit/push/deploy occurred.'''),
 ('19-phase08-1-gemini-frontend-execution-handoff.md','Phase08.1 Gemini frontend handoff',f'''**Next implementation owner: Gemini. Next independent verification owner: Codex.** Phase08 is identity/account UX under the 27-phase master, not admin Studio or ABA settlement.

Start from the actual current dirty main/HEAD and read this package, MASTER_SCOPE Phase08 and repository router. Preserve both Gemini and Codex uncommitted patches; no automatic reset, commit, push or deployment. Establish a fresh before snapshot and route/state inventory before editing.

Inventory actual registration/email-password login/Google/Telegram entry, forgot/reset/change password, available verification/session-expiry flows, profile/security/logout, denied state and safe return-to-intended-page. Map unsupported provider/verification capabilities explicitly rather than inventing them. Reuse current form, modal, status, language/theme and focus contracts.

Implement conventional premium form UX, password visibility with accessible names, validation/recovery, provider failure/cancel/retry, session restoration and mobile keyboard reachability. Preserve validated same-origin next targets, role/customer/admin separation, tokens, server authentication and account authorization. No auth/security rewrite for novelty. Maintain drafts/entered data where the existing contract supports it and label persistence limits honestly.

Gemini must deliver new identity-route/state before/after captures, exact functional/component/browser checks, EN/KM light/dark/reduced-motion evidence, safe provider fixtures and explicit staging-provider/device/native-review blocks. Codex then independently audits source, reproduces failures, repairs feasible defects, updates F-style acceptance and carries forward all IDs. Phase09 owns marketplace/pricing, Phase10 template family art, Phase11 creation, Phase16 guest flows, Phase21 ABA/Telegram/payment, Phase24 admin and Phase25 admin Template Studio.

Carry forward: native Khmer terminology review; physical iOS/Android/AT/native zoom; default worker/field timing gates; isolated providers/MySQL/catalog; venue photo rights and facts; server SEO/social fallback review. Do not change QA-NEW-01/02/03 exact Khmer/Studio assertions without named copy/QA owner approval. Marketing acceptance is {json.dumps(counts,ensure_ascii=False)} with overall PARTIALLY COMPLETE, not a release certificate.'''),
 ('20-open-gates-owners-and-final-phase-status.md','Open gates, owners and final status',f'''**Phase07: PARTIALLY COMPLETE.** Local feasible marketing defects were repaired and their named checks run; this does not supply external certification. Final command gaps: `{missing}`. Scoreboard: `{json.dumps(counts,ensure_ascii=False)}`.

| Gate | Owner | Required next evidence |
|---|---|---|
| Native Khmer wording/shaping/weights | Native Khmer + typography reviewer | Review live EN/KM/error/content samples on real iOS/Android; approve historical test wording separately |
| Physical devices, AT, native zoom/in-app clients | Phase26 device/accessibility QA | Record VoiceOver/TalkBack, virtual keyboard, dynamic bars, OS scaling, 200/400% actual browser zoom and app-client journeys |
| Venue facts/photo provenance | Marketing content/rights owner | Verify each venue name/capacity/price/tag and exact photo author/license/use identity; retain illustrative disclosure until approved |
| Server metadata/social fallback/HTTP status | Deployment/SEO owner | Verify staging canonical origin, crawl/social response, redirects and SPA404 behavior; client tags alone are insufficient |
| Field CWV / historical RSVP timing | Operations/performance + Phase16/26 | Isolated real-device sample and approved p75 LCP/INP/CLS; retain +264ms/+41.51% diagnostic review |
| Worker instability | QA/CI host owner | Repeat same build/default concurrency on isolated runner; retain controlled two-worker comparator and failure traces |
| Live MySQL/catalog/provider/payments | Backend/catalog/Phase21/27 QA | Authorized isolated dataset/sandboxes, forward migrations/concurrency and server settlement/replay proof; no production writes |
| All authored template guest/media journeys | Phase10/16 | Full family-specific content/media/cinematic/privacy/device proof; two fixture paints are insufficient |
| Old Phase02 assertions | Native copy + QA owner | Approve stronger maintenance contract; six known red remain visible |

Historical phase statuses are not upgraded by this marketing package. No optional booking, refunds, CMS, AI or calendar was implemented. No unsafe reset, backend modification, commit, push or deployment occurred.'''),
]
for name,title,body in files:md(name,title,body)
toc='\n'.join(f'- [{title}]({name})' for name,title,_ in files)
md('README.md','Phase07 independent marketing audit — 2026-11-18',f'''**PARTIALLY COMPLETE.** The local marketing experience received focused repairs and independent fixture verification. External native Khmer/device/AT/zoom, rights/factual directory, field performance and live integration gates remain open; this is not a release or production certificate.

Git remains `main` at `{SHA}`, 13 local commits ahead of observed origin/main `4d30a8f3`. Nothing was staged, committed, pushed or deployed. Original Gemini reports and the starting working diff are preserved.

Fifteen reproduced local findings cover venue modality/history/reset/recovery/media, dark readability, contact contrast/metadata/draft retention, footer clearance, editorial typography and unsupported marketing claims. The existing product/ceremonial composition was retained. Before/after source hashes, loaded fonts, screenshots and logs distinguish source preservation from live certification.

Current gate scoreboard: `{json.dumps(counts,ensure_ascii=False)}`. Historical ledger: `{json.dumps(carry_counts,ensure_ascii=False)}`. Missing/nonpassing final commands: `{missing}`. Detailed outcomes and intermediate failures are in [exact commands](15-exact-commands-test-matrix-and-evidence-index.md), not inferred from this summary.

Representative evidence: {shot('home-_-initial-1440-en-light-reduce')} / {shot('home-_-initial-390-km-dark-reduce')} / {shot('venues-_venues_1-direct-390')}. Both stages contain 107 matched primary full-page states. Optional viewport crops accompany 34 baseline states and all 107 repaired states; early full-page evidence remains intact. Screenshots/traces/build backups are local and excluded from Git. Portable JSON and regeneration scripts are in [evidence](evidence/), with [package validation](evidence/evidence-validation.json).

The next build is [Phase08.1 Gemini identity/account UX](19-phase08-1-gemini-frontend-execution-handoff.md), followed by independent Codex verification.

{toc}''')
print(json.dumps({'documents':len(files)+1,'gates':counts,'carryover':carry_counts,'missingFinalResults':missing},ensure_ascii=False))
