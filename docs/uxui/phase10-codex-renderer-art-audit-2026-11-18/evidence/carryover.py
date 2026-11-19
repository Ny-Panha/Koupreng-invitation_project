"""Preserve every inherited ID; never bulk-close by a newer phase's claims."""
import collections
import json
from audit import ROOT, EVIDENCE, write

source = 'docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/57-carryover-updated.json'
text = (ROOT/source).read_text(encoding='utf-8')
old = json.loads(text)
rows = []
for item in old['entries']:
    status = item.get('currentStatus', item.get('finalStatus'))
    row = {**item, 'immutable_id':item['id'], 'phase10_status_before':status, 'phase10_status_after':status, 'phase10_source_report':source, 'phase10_source_line':text[:text.index('"id": "'+item['id']+'"')].count('\n')+1, 'phase10_action':'Retained historical disposition and original evidence scope; not newly certified by renderer smoke tests', 'future_owner':item.get('owner','Domain QA owner'), 'future_phase':item.get('relatedLaterPhase') or 'Phase26 cross-cutting validation; original domain phase retains functional ownership', 'physical_paid_external_dependency': status == 'BLOCKED — EXTERNAL', 'overlap':'Original ID retained independently; see relatedAdditionalIds for later overlapping findings', 'new_proof':'Current unit and browser reports may support narrow local contracts only. Original source remains authoritative for historical closure.'}
    topic = (item.get('area','')+' '+item['id']).lower()
    if any(word in topic for word in ['renderer','template','silk','emerald','fidelity','historical-cause']):
        row['phase10_action'] += '; Current family paint, 38 source aliases and Silk/Emerald geometry rechecked. Historical nondeterministic cause and all authored guest/device states are not closed.'
        row['future_phase'] = 'Phase10/16 renderer owner, Phase26 device/art verification'
    if status == 'BLOCKED — EXTERNAL':
        if 'qa-new' in topic:
            equipment='Current build, original phase02-foundations.spec.js unchanged, native Khmer reviewer and QA contract owner'
            actions=['Run the original Phase02 suite on desktop/mobile and retain all six red assertions','Compare each QA-NEW-01/02/03 expected string/viewport with actual wizard copy, trusted preview fixture and short-landscape geometry','Native reviewer decides ceremony/copy terminology; QA owner decides the intended regression contract before any assertion is changed','Retain screenshot/trace and signed decision per ID; rerun original and behavioral replacement contracts']
        elif 'database' in topic:
            equipment='Disposable MySQL8 staging clone, backend test configuration, applied migration history and Backend QA owner'
            actions=['Record schema version and checksums without changing applied migrations','Run approved backend integration/Flyway validation against the disposable database','Exercise source-supported create/read/update and authorization failure transactions with fictional data','Verify rollback/isolation and unchanged historical checksums; attach redacted database/test logs']
        elif 'provider' in topic:
            equipment='Approved sandbox ABA/Telegram/delivery accounts, merchant observer, test credentials supplied through secure environment'
            actions=['Use disposable owner/order and separate USD/KHR amounts with server-owned prices','Exercise successful, duplicate, delayed and mismatched provider messages through the supported integration','Verify idempotent reconciliation, authorization and no activation on incomplete/wrong-currency settlement','Record redacted provider IDs, timestamps, ledger/state transitions and finance signoff; Phase21 owns real settlement']
        elif 'catalog' in topic:
            equipment='Owner-controlled staging published catalog/API and parity snapshot; approved field analytics access if CWV is included'
            actions=['Compare actual published stable template codes, visibility and server prices against the catalog fixture','Open every published family from discovery/detail and test loading/empty/failed API states','Verify unauthenticated, unpaid and owned continuation without granting access from a client ID','Attach parity diff and matched-environment lab observations; field p75/INP requires the actual eligible RUM population']
        elif 'field' in topic:
            equipment='Approved production RUM/CrUX access, declared time window, eligible sample counts, and physical AT/device lab where named'
            actions=['Define route/family/device cohorts and agreed LCP/CLS/INP budgets before interpreting data','Collect real-user p75 metrics with sample counts and reporting window; label missing cohorts insufficient data','Exercise applicable keyboard/AT/zoom paths on physical equipment separately from field metrics','Attach cohort exports, observed regressions and performance/accessibility owner signoff; local timings cannot close field gates']
        elif 'khmer' in topic:
            equipment='Native Khmer reviewer, current font binaries/build, authored long names/combining marks and all ten cover/main screenshots'
            actions=['Review invitation honorifics, parent hierarchy, ceremony names, RSVP/demo status, dates/numerals and mixed EN/KM strings','Inspect actual fonts at small width, enlarged text and font-failure fallback for clipped/incorrect combining marks','Log exact string/source/location with approved wording and cultural decision per family','Attach marked captures and native signoff; automated geometry alone is insufficient']
        else:
            equipment='Real current iPhone Safari/VoiceOver, low-end Android Chrome/TalkBack, desktop browser zoom/high contrast and relevant in-app webview'
            actions=['Record device/OS/browser/AT/build; open each applicable family normally and with OS reduced motion','Use Skip then traverse sections/gallery/RSVP by keyboard/touch/AT; verify focus trap, Escape/return and no background focus','At actual 200/400% browser zoom/text enlargement, rotate short landscape and raise virtual keyboard; verify visible actions, safe areas, Khmer shaping and no lost draft','Reject media/network and retry; inspect gesture audio without forcing autoplay; save redacted captures and device/accessibility signoff']
        row['manual_protocol'] = {
            'equipment_environment':equipment,
            'prerequisites':'Named domain owner approves disposable test account/data; use original report exact dependency',
            'actions':actions,
            'expected_outcome':item.get('requiredFix',item.get('nextAction')),
            'evidence_template':{'gate_id':item['id'],'operator':None,'build_fingerprint':None,'equipment':None,'started_at':None,'steps':[],'expected':None,'observed':None,'redacted_artifacts':[],'owner_signoff':None},
            'responsible_owner':item.get('owner'),'status':'EXTERNAL — NOT EXECUTED'}
    rows.append(row)
auth = [{**row,'source':source,'owner':'Backend Identity / Auth QA' if 'PWD' in row['id'] else 'Identity / Accessibility QA','phase10_action':'Retain actual Phase08 partial/verified disposition. Phase09 prose claiming five verified is not supported by this ID ledger.'} for row in old['newPhase08Items']]
p07 = json.loads((ROOT/'docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/phase07-partial-gates.json').read_text(encoding='utf-8'))
p09 = json.loads((ROOT/'docs/uxui/phase09-codex-marketplace-audit-2026-11-18/evidence/defect-register.json').read_text(encoding='utf-8'))
p10 = json.loads((ROOT/'docs/uxui/phase10-1-gemini-template-art-2026-11-18/evidence/defect-register.json').read_text(encoding='utf-8'))
write('cross-phase-carryover.json', {'historical_count':len(rows),'historical_distribution':dict(collections.Counter(row['phase10_status_after'] for row in rows)),'historical_entries':rows,'auth_items':auth,'phase07_partial_gates':p07,'C08-013':{'status':'OPEN — outside renderer authorization','owner':'Backend identity/security + product policy','future_phase':'Identity maintenance before Phase26/27 release','observed_contract':'8–100 UTF-16 policy vs installed BCrypt 72 UTF-8-byte rejection; no new probe claimed','required_tests':['register/change/reset/login Unicode boundaries','old-hash compatibility','API errors and native-reviewed guidance'],'evidence':'docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/password-encoder-probe.json','phase10_changes':'NONE; no frontend 72-character limit or hash change'},'phase09_defects':p09,'gemini_D10':p10['defects'],'phase10_codex':'defect-register.json','overall_phase_statuses':{str(phase):'PARTIALLY COMPLETE — retained; not recertified by Phase10' for phase in [1,3,4,5,6,7,8,9]},'known_Phase02_red':{'ids':['QA-NEW-01','QA-NEW-02','QA-NEW-03'],'historical_result':'26 pass / 6 fail; three issues across two projects','owner':'Native Khmer copy reviewer / QA contract owner','phase10_change':'NONE'}})
print(json.dumps({'historical':len(rows),'auth':len(auth),'phase07':len(p07),'distribution':dict(collections.Counter(row['phase10_status_after'] for row in rows))}))
