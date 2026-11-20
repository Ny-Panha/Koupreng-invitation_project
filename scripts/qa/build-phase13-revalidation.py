"""Build the Phase 13 revalidation package from retained local execution records.

This does not run checks, certify external gates, stage files, or publish anything.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'output/phase13-codex-revalidation'
DOC = ROOT / 'docs/uxui/phase13-codex-creator-studio-audit-2026-11-19-revalidation'
EVIDENCE = DOC / 'evidence'
ENTRY = '54565a125e1c1cc13be9b1ed5039434f1d0b9450'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def write(name, value):
    (EVIDENCE / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf8')


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT).decode('utf8', errors='replace').strip()


def source(path):
    return f'[{Path(path).name}](../../../{path})'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--brief', type=Path, required=True)
    args = parser.parse_args()
    DOC.mkdir(parents=True, exist_ok=True)
    EVIDENCE.mkdir(exist_ok=True)
    runs = []
    for p in sorted((RAW / 'checks').glob('*.json')):
        record = read(p)
        log = ROOT / record['log']
        record['log_hash_valid'] = digest(log) == record['log_sha256']
        text = re.sub(r'\x1b\[[0-9;]*m', '', log.read_text(encoding='utf8', errors='replace'))
        record['result_lines'] = [line.strip() for line in text.splitlines() if re.search(r'(Tests?\s+\d|Test Files|Tests run:|\d+ passed|\d+ failed|\d+ skipped|tests \d|pass \d|fail \d|leaks found:|no leaks found|Total Errors/Failures)', line)][-14:]
        record['failure_names'] = [line.strip() for line in text.splitlines()
            if re.match(r'\s*FAIL\s|\s{4}\[[^]]+\]\s+›', line)]
        runs.append(record)
    by_run = {r['id']: r for r in runs}
    write('test-runs.json', runs)
    ci = read(RAW / 'ci-observed.json')
    write('ci-observed.json', ci)
    prior = read(RAW / 'prior-package-validation.json')
    # The snapshot inventory contains both rg backslash and Git slash spellings.
    snapshots = {r['path'].replace('\\', '/'): r for r in read(RAW / 'snapshot-manifest.json')}
    gemini = ROOT / 'docs/uxui/phase13-1-gemini-creator-studio-2026-11-19'
    hashes = read(gemini / 'evidence/changes-attribution-sha256.json')
    attribution = []
    for name, wanted in hashes.items():
        found = [(path, row) for path, row in snapshots.items() if Path(path).name == name]
        attribution.append({'file': name, 'path': found[0][0] if len(found) == 1 else None,
                            'claimed_sha256': wanted, 'entry_sha256': found[0][1]['sha256'] if len(found) == 1 else None,
                            'matches': len(found) == 1 and found[0][1]['sha256'].lower() == wanted.lower()})
    prior['attribution_hashes'] = attribution
    write('prior-package-validation.json', prior)
    write('baseline.json', {'entry_head': ENTRY, 'entry_remote_main': ENTRY, 'entry_worktree': 'clean',
          'phase12_baseline': '8c1e930fbe1e39e8fc660c3ba2caf80d81e2b289',
          'entry_commit_files': 121, 'source_provenance': 'The nine Gemini source/test/config hashes match the entry snapshot. Prior Codex prose in the same published commit is a claim, not this execution.',
          'snapshot_file_count_after_path_normalization': len(snapshots), 'snapshot_manifest_sha256': digest(RAW / 'snapshot-manifest.json'),
          'brief_sha256': digest(args.brief), 'branch_at_generation': git('branch', '--show-current')})

    # Retain the complete prior ledger, including every separate newer namespace.
    ledger_path = ROOT / 'docs/uxui/phase12-codex-owner-dashboard-audit-2026-11-19/evidence/cross-phase-ledger.json'
    ledger = read(ledger_path)
    assert len(ledger['ledger']['historical_entries']) == 57
    write('historical-57-plus-new-ledger.json', {'source_path': ledger_path.relative_to(ROOT).as_posix(), 'source_sha256': digest(ledger_path),
          'historical_not_new_certification': True, 'preserved_ledger': ledger,
          'phase13_carryover': [
              {'id': 'C13-EXT-01', 'owner': 'Product / native Khmer reviewer', 'status': 'REVIEW REQUIRED', 'action': 'Review ceremonial wording and physical Khmer IME.'},
              {'id': 'C13-EXT-02', 'owner': 'Device / accessibility QA', 'status': 'BLOCKED — EXTERNAL', 'action': 'Physical Safari/Android, AT, native zoom and keyboard.'},
              {'id': 'C13-EXT-03', 'owner': 'Backend / staging QA', 'status': 'BLOCKED — EXTERNAL', 'action': 'Live MySQL concurrency, real cookie/OAuth session changes and publish parity.'},
              {'id': 'C13-EXT-04', 'owner': 'Asset / legal owner', 'status': 'REVIEW REQUIRED', 'action': 'Retain existing media/vendor redistribution rights uncertainty; no new vendor source adopted.'},
              {'id': 'C13-EXT-05', 'owner': 'Performance owner', 'status': 'PARTIALLY COMPLETE', 'action': 'Measure cold/warm typing, memory, object URLs and field RUM; bundle evidence alone is insufficient.'},
          ]})

    inv = 'apps/frontend-user/src/features/invitations/'
    studio = inv + 'studio/'
    adapter = 'apps/frontend-user/src/features/wedding-builder/utils/invitationDraftAdapter.js'
    defects = [
      ('C13-001','P1','A Studio payload dispatched with B credentials after account switch',studio+'StudioAuthority.test.jsx','pre-fix-negatives','authority-fix','Abort synchronously on session changes; bind every save/media/publish stage to one document lifetime.'),
      ('C13-002','P1','Ownerless legacy drafts could be read and silently adopted',studio+'StudioAuthority.test.jsx','pre-fix-negatives','authority-fix','Block ownerless authenticated reads, reject owner changes, preserve original bytes and show a recovery notice.'),
      ('C13-003','P1','Nested design fields, gallery extensions and records beyond ten were lost',studio+'StudioRoundtrip.test.jsx','pre-fix-json','json-fix','Preserve object extensions, honor array replacement/deletion, identify gallery rows by id, retain existing records above the new-upload limit.'),
      ('C13-004','P1','Alternate draft reader/writer discarded future content and locales',adapter.replace('.js','.test.js'),'pre-fix-alternate','alternate-fixed','Carry original JSON documents through the adapter and overlay authored fields without dropping extensions.'),
      ('C13-005','P2','Document shortcuts intercepted composition, inherited editable regions, modal commands and unavailable actions',studio+'StudioToolbar.test.jsx','pre-fix-negatives','authority-fix','Respect event ownership, IME, Alt, editable ancestors, read-only/saving/conflict/expired/denied states.'),
      ('C13-006','P2','Actual dark section labels and light template tag failed contrast', 'apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','baseline-functional','final-frozen-browsers','Use readable management text colors; scope reduced motion and forced colors to the portal toolbar too.'),
      ('C13-007','P2','Short landscape stacked chrome placed the first field below the viewport',studio+'StudioChrome.css','baseline-functional','final-frozen-browsers','Compress mode/section/language spacing and retain 44px command controls; report actual geometry, not a CSS minimum.'),
      ('C13-008','P2','Mobile actions were deliberately hidden while the keyboard branch was active',studio+'StudioToolbar.jsx',None,'final-frozen-browsers','Position actions above the visual viewport inset; physical keyboard verification stays external.'),
      ('C13-009','P2','WebKit pointer opening did not focus the modal invoker',studio+'StudioToolbar.jsx','repaired-browsers','browser-isolated-rerun','Focus the actual Studio invoker before opening its modal, allowing existing modal restoration to work.'),
      ('C13-010','P1','Ambiguous legacy Studio create retry lacked a stable request id',studio+'StudioRoundtrip.test.jsx','pre-fix-create-retry','retry-fixed','Reuse immutable first-create bytes and request id; apply later edits by update on the returned server id.'),
      ('C13-011','P2','HTTP 403 remained a generic failure with retry affordances',studio+'useStudioPersistence.test.jsx',None,'focused-security','Add a denied state that suspends writes and preserves local recovery.'),
      ('C13-012','P2','Late media upload completion could replace a newer selected image',inv+'invitationPayloadUtils.test.js',None,'retry-fixed','Only acknowledge an uploaded reference if the current field still equals the sent field; keep a newer pending file.'),
      ('C13-013','P2','Current CI browser job failed before test collection because a generated matrix was absent','.github/workflows/ci.yml',None,'ci-matrix-generation','Generate the source-derived matrix in the browser job with its existing opt-in before collecting the E2E suite.'),
      ('C13-014','P3','Repository verification failed on a missing documented setup page','docs/development/AI_SKILLS_SETUP.md','routing-check','routing-repaired','Restore the referenced verification guide without changing skills or dependencies.'),
      ('C13-015','P2','Public locale matrix assumed a shared opening label and button-based locale switch for Floral','apps/frontend-user/tests/e2e/phase12-matrix.spec.js','ci-browser-local','floral-native-controls','Probe the exact observed Khmer opening label and Floral’s native locale select; retain activation, suppression, guest-message, eight-width and axe assertions.'),
    ]
    write('defect-register.json', [{'id': i,'severity':s,'symptom':sym,'proof_source':p,'pre_fix_run':before,'post_fix_run':after,
          'repair':fix,'owner':'Codex Phase 13 revalidation','status':'REPAIRED — LOCAL; scope and external limits retained',
          'causal_evidence': 'Recorded pre-fix failing execution' if before else 'Source-backed defect; no independently captured failing automated run is claimed'} for i,s,sym,p,before,after,fix in defects])

    states = [
      {'route':'/app/events/:eventId/invitation','role':'owner / accepted MANAGE_INVITATION collaborator','event':'WEDDING','template':'supported dedicated renderer; not event-essential','storage':'server','result':'advanced editor, server mutation authority required'},
      {'route':'/app/events/:eventId/invitation','role':'owner / authorized collaborator','event':'non-wedding or event-essential','template':'event-essential / generic','storage':'server','result':'EventDetails; no new advanced non-wedding editor claimed'},
      {'route':'/app/events/:eventId/invitation','role':'revoked collaborator after opening','event':'WEDDING','storage':'server + dirty memory','result':'recovery editor remains, fields/save disabled; cancelled work cannot resume after regrant'},
      {'route':'/dashboard/invitations/:id/edit','role':'authenticated','event':'numeric id','storage':'server','result':'redirect to canonical event invitation route with existing query/hash behavior'},
      {'route':'/dashboard/invitations/:id/edit','role':'matching authenticated owner','event':'legacy nonnumeric id','storage':'local owner-scoped draft','result':'keyed loader and editor; existing JSON retained'},
      {'route':'/dashboard/invitations/:id/edit','role':'signed-in account / ownerless draft','event':'legacy nonnumeric id','storage':'unclaimed local bytes','result':'recovery notice; no assignment, deletion or upload'},
      {'route':'protected editor','role':'anonymous / session checking / verification error','storage':'any','result':'RequireAuth redirect, skeleton or error; guest token is not an editing grant'},
    ]
    write('source-routes.json', {'partitions': states, 'source_paths': ['apps/frontend-user/src/app/routes/hostRoutes.jsx','apps/frontend-user/src/app/guards/RequireAuth.jsx','apps/frontend-user/src/features/events/workspace/EventWorkspace.jsx',inv+'InvitationEditFeature.jsx',inv+'InvitationForm.jsx'],
          'limitations':'Partitions are source-backed, with current unit/browser proof for high-risk transitions; no Cartesian enumeration or new generic advanced editor is claimed.'})

    # Exact original IDs are distinct from test counts and from semantic coverage.
    brief = args.brief.read_text(encoding='utf-8-sig')
    original_source = (ROOT / studio / 'InvitationStudioNegativeScenarios.test.jsx').read_text(encoding='utf8')
    names = dict(re.findall(r"['\"](N13-\d{2}): ([^'\"\n]+)", original_source))
    meaningful_original = {3,4,5,9,11,12,13,27}
    proof = {
      1:(studio+'StudioAuthority.test.jsx','Real Axios adapter captures dispatched Authorization and payload; late success cannot start another account’s writes.'),
      2:('apps/frontend-user/src/features/events/workspace/EventWorkspace.jsx','Keyed account/event lifetime and preview session guards; full late asset route-switch browser proof remains partial.'),
      3:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Access refresh removes the grant; actual title field and Save disable while text stays.'),
      4:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Four intercepted HTTP statuses retain the title and show the corresponding phase, with blocked save where required.'),
      5:(studio+'useStudioPersistence.test.jsx','An old completion cannot acknowledge edits made while its promise is pending; flush sends the second snapshot.'),
      6:('apps/frontend-user/tests/e2e/phase13-codex-navigation.spec.js','Actual dirty form exit dismisses the native confirmation, preserves title/route, then accepts an explicit leave in all three engines.'),
      7:(studio+'StudioAuthority.test.jsx','Actual storage id/slug readers reject ownerless data and ownership-changing writes preserve byte-for-byte original storage.'),
      8:(studio+'StudioRoundtrip.test.jsx','Two real form saves retain future nested design keys, locale keys and eleven gallery records; alternate adapter test adds a second reader/writer.'),
      9:('apps/frontend-user/src/shared/preview/previewMessaging.test.js','Production message validator and origin/source/session tests; no wildcard target origin.'),
      10:('apps/frontend-user/src/app/guards/RequireAuth.jsx','Guest tokens cannot replace authenticated editor grants; backend unit/H2 privacy evidence has no live MySQL certification.'),
      11:('apps/frontend-user/src/shared/preview/useStudioPreviewEditing.js','Production whitelist and interactive-control exclusions; existing preview tests are narrow local contracts.'),
      12:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Actual offline browser branch retains text and explicit online retry acknowledges fixture server.'),
      13:(studio+'StudioToolbar.test.jsx','Real keyboard dispatch for IME/modal/editable ownership; browser typing undo and in-flight hook history guards.'),
      14:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Actual pointer down/move/cancel restores split ARIA and stored ratio; unit tests cover bounds/blocked storage.'),
      15:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Nine viewport journeys scroll to actual input, reach Save and open/close preview across three engines.'),
      16:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','320px and forced-color reflow covered; physical 400% browser zoom remains externally blocked.'),
      17:(studio+'TemplateChooser.test.jsx','Existing chooser/policy/backend tests; full A→B→A paid entitlement browser mutation matrix remains partial.'),
      18:(studio+'TemplateChooser.test.jsx','Real loading/error/retry props and fail-closed source policy; outage does not authorize a fallback selection.'),
      19:(inv+'InvitationForm.jsx','Template change spreads authored form and rechecks request authority; all dedicated A→B→A mapping journeys not exhaustively executed.'),
      20:(studio+'StudioRoundtrip.test.jsx','Actual form retries use equal first payload/clientRequestId, then update later edits on returned id; canonical wizard browser suite covers media retry.'),
      21:(studio+'studioMedia.test.js','Production MIME/size path and backend FileUploadValidator tests; no physical HEIC/orientation or complete client signature certification.'),
      22:(inv+'InvitationMediaManager.test.jsx','Existing media tests plus inspected URL cleanup; complete long-session object URL/memory soak remains partial.'),
      23:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','DOM composition events and mixed Khmer/English text roundtrip, not physical IME/native signoff.'),
      24:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Actual preview dialog, focus return, Escape and fixed 1200/440 content viewport while zoom changes; desktop outer frame is 1216 pixels.'),
      25:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Dirty draft flushes before intercepted publish; 503 produces error and no published result/link.'),
      26:('apps/frontend-user/src/features/events/workspace/EventWorkspace.jsx','Grant-derived controls and backend permission tests; no live HTTP MySQL endpoint proof in this execution.'),
      27:('apps/frontend-user/src/features/templates/registry/templateRegistry.test.jsx','Unknown stable identity fails closed; no implicit dedicated fallback.'),
      28:('apps/frontend-user/tests/e2e/phase02-foundations.spec.js','Replay original cases without changing translated selectors; preserve actual failures by identity.'),
      29:('apps/frontend-user/tests/e2e/guest-workspace.spec.js','Replay exact historical filter case and record the unchanged Add guest assertion; no test skip or product redesign.'),
      30:('.github/workflows/ci.yml','Unmodified Gitleaks rules; entry range scan has zero findings and broader tree scan is recorded separately.'),
      31:(inv+'InvitationForm.jsx','Canonical couple names remain empty when absent; preset artwork/date/copy defaults are not a native-language approval or complete neutral-content proof.'),
      32:(studio+'StudioAuthority.test.jsx','Delayed real Axios save preserves typed title/focus and sends final bytes; late media references only replace unchanged fields.'),
      33:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Mocked visualViewport shrink exercises real action-bar CSS; physical mobile keyboard stays external.'),
      34:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Computed toolbar transitions are zero under reduced motion; original guest motion suites remain independent evidence.'),
      35:('apps/frontend-user/tests/e2e/phase13-codex-functional.spec.js','Fixture edit/save/reload is verified; real saved/public parity and cold/warm performance are not certified.'),
    }
    partial = {2,10,16,17,19,21,22,23,26,31,33,35}
    negative = [{'id':f'N13-{n:02d}','original_title': names.get(f'N13-{n:02d}'),
                 'original_semantic_scope': 'narrow production contract' if n in meaningful_original else 'insufficient for the named scenario: toy logic, label, or limited subcase',
                 'proof_source':proof[n][0], 'exact_assertion_and_limit':proof[n][1],
                 'independent_disposition':'PARTIALLY COMPLETE' if n in partial else 'VERIFIED — LOCAL (named scope only)',
                 'owner':'Phase 13 QA; external/native/backend owners where stated'} for n in range(1,36)]
    write('negative-tests.json', {'original_unique_ids':len(names),'original_executions':38,'arithmetic':'34 single cases + four N13-04 parameter rows = 38; these overlap the full user suite.',
          'original_production_contract_ids':len(meaningful_original),'semantic_scope_not_equal_to_pass_count':True,'scenarios':negative})

    visual_rows = []
    for run_name, stage in [('before-ui','before'),('corrected-final','after')]:
        for p in sorted((RAW/run_name).glob('*.png')):
            geometry = p.with_suffix('.json')
            row = {'stage':stage,'local_path':p.relative_to(ROOT).as_posix(),'sha256':digest(p),
                   'build_source':ENTRY if stage=='before' else 'Reviewed working source; source-freeze.json',
                   'fixture':'phase9Fixtures: fictional owner 7 / event 101; no customer account',
                   'physical_certification':False}
            if geometry.exists(): row['geometry'] = read(geometry)
            # Ship only management views with no renderer photographs/artwork.
            if re.match(r'layout-(320|375|393|768|844)x', p.name) and 'chromium' in p.name:
                target = DOC/'visuals'/f'{stage}-{p.name}'
                target.parent.mkdir(exist_ok=True)
                shutil.copy2(p,target)
                row['published_path'] = target.relative_to(DOC).as_posix()
            visual_rows.append(row)
    write('visual-manifest.json', visual_rows)
    axes = []
    for stage in ['before-ui','after-ui','final-default','final-frozen','corrected-final']:
        for p in sorted((RAW/stage).glob('axe-*.json')):
            d=read(p);axes.append({'stage':stage,'path':p.relative_to(ROOT).as_posix(),'sha256':digest(p),
                'violations':[{'id':v['id'],'targets':[n['target'] for n in v['nodes']]} for v in d['violations']],
                'color_contrast_executed':'color-contrast' in d.get('passes',[]) or any(v['id']=='color-contrast' for v in d['violations']),
                'incomplete_rules':[r['id'] for r in d['incomplete']]})
    write('accessibility.json', {'scans':axes,'scope':'Loaded management form and portal toolbar; dialog focus/failure states have separate functional checks. Not physical AT or all Studio sections certified.'})

    verified = {1,3,4,6,7,8,10,11,18,19,20,22,23,26,27,28,30,31,34,36,38,41,42,43,44,45,49,50,51,52,53}
    blocked = {25}
    review = {37,54}
    original_gates = read(gemini/'evidence/f13-1-54-gates.json')
    requirements = re.findall(r'^\| (F13\.1-\d{2}) \| ([^|]+) \|', brief, flags=re.M)
    assert len(requirements)==54
    # Every requirement has its own bounded assertion and remaining risk.
    gate_details = {
      1: ('baseline.json', 'Clean entry main and three-way SHA agreement; independent snapshot retained.', 'Remote agreement is checked again before any publication.'),
      2: ('ci-observed.json', 'Published Phase 12 and entry commits retained; actual failed job identities recorded.', 'Inherited CI red remains owned by repository QA; no retrospective green.'),
      3: ('source-routes.json', 'Canonical wedding, generic event and authenticated legacy route partitions traced.', 'Route partitions are not a full Cartesian role/template/state certification.'),
      4: ('changed-files.json', 'Focused frontend, CI fixture and documentation changes; no backend/migration edits.', 'Existing server permission and guest-privacy obligations remain in the historical ledger.'),
      5: ('visual-manifest.json', 'Actual loaded management surfaces have before/after density and contrast evidence.', 'Subjective premium quality and every inspector section still require product review.'),
      6: ('visual-manifest.json', 'Actual toolbar, event workspace portal, back action and responsive journeys exercised.', 'Physical browser bars and touch hardware remain external.'),
      7: ('test-runs.json', 'Hook and browser assertions distinguish acknowledged, pending, offline and blocking states.', 'Fixture acknowledgement does not prove live-provider durability.'),
      8: ('negative-tests.json', 'Real key events respect IME, native undo, dialogs, saving and read-only states.', 'Physical platform keymaps and AT commands are not certified.'),
      9: ('source-routes.json', 'Guided/advanced controls share the same form and source-defined section map.', 'Exhaustive mode switches with every optional authored section were not replayed.'),
      10: ('negative-tests.json', 'Production section grouping and real ArrowDown/Home focus/current section assertions.', 'Physical touch and all AT navigation modes remain device QA.'),
      11: ('negative-tests.json', 'Production edit-target whitelist excludes interactive children and accepts only known sections.', 'All renderer-specific click targets are not exhaustively manually checked.'),
      12: ('visual-manifest.json', 'Loaded labels, field groups, validation source and responsive title editing reviewed.', 'The large inspector monolith is not exhaustively covered by representative captures.'),
      13: ('unknown-json-roundtrip.json', 'Actual form saves retain authored names, title, locale extensions and nested values.', 'Every family/message editor combination across templates is not replayed.'),
      14: ('test-runs.json', 'Current date/timezone and event adapter contracts run in the full user suite.', 'Physical locale keyboards and live wall-time persistence remain staging/native QA.'),
      15: ('unknown-json-roundtrip.json', 'Future objects and edited array replacement semantics are regression tested.', 'All story/FAQ/party/dress/closing controls lack a complete real-browser journey.'),
      16: ('negative-tests.json', 'Chooser/policy tests cover bounded failure and eligibility states; actual modal opens.', 'Every paid/owned/collaborator/template combination is not browser certified.'),
      17: ('unknown-json-roundtrip.json', 'Deep merge and stable gallery identity prevent confirmed extension loss.', 'Dedicated-template A to B to A media/customization journeys remain partial.'),
      18: ('test-runs.json', 'Current registry/route inventory and generated locale contracts verified without renderer edits.', 'Dedicated renderer art rights and public physical-device quality stay open.'),
      19: ('preview-security-negatives.json', 'Real origin/source/session/schema validators run; explicit target origins retained.', 'Controlled URL callers remain part of the trust boundary; no arbitrary URL sanitizer claim.'),
      20: ('browser-coverage.json', 'Real dialog checks desktop 1200/phone 440 content width, zoom, Escape and focus return.', 'Outer frame size is distinct from content size; physical zoom is external.'),
      21: ('historical-regressions.json', 'Original Phase 02 cases replayed by unchanged identities, with current failures retained.', 'Admin iframe containment failure remains an inherited QA/product owner gate.'),
      22: ('negative-tests.json', 'Pointer cancellation restores actual split ARIA and storage; unit tests cover keyboard/bounds.', 'lostpointercapture preserves the existing commit behavior; it is not called cancellation.'),
      23: ('browser-coverage.json', 'Nine viewport journeys edit the input, reach Save, and open/close the preview in three engines.', 'Browser engine emulation is not a physical phone certification.'),
      24: ('visual-manifest.json', '844x390 geometry measured and simulated visualViewport actions remain visible.', 'Physical safe area, browser bar and virtual keyboard still need device review.'),
      25: ('browser-coverage.json', '320px reflow is observed; native 200/400 percent browser zoom is explicitly unverified.', 'Assigned to physical device/accessibility QA; no fabricated native zoom result.'),
      26: ('negative-tests.json', 'Real dirty exit test dismisses navigation, retains title, then accepts explicit leave.', 'Browser crash/discard and every external navigation target remain broader recovery limits.'),
      27: ('studio-save-races.json', 'Deferred hook and actual Axios form tests retain newer edits and flush final bytes.', 'Live MySQL concurrent editors and field latency are not measured here.'),
      28: ('negative-tests.json', '401/403/409/503/offline and access-refresh assertions retain dirty text and block unsafe writes.', 'These are intercepted responses, not live authenticated HTTP deployment proof.'),
      29: ('studio-save-races.json', 'A to B Axios dispatch and late stages are fixed; keyed account/event lifetime inspected.', 'Complete late-asset event-switch/browser response matrix remains partial.'),
      30: ('studio-save-races.json', 'Actual storage id/slug reads and ownership-changing save reject unclaimed drafts without changing bytes.', 'Recovery notice preserves data; no automatic ownership-claim product was introduced.'),
      31: ('unknown-json-roundtrip.json', 'Two actual form saves plus alternate reader/writer preserve unknown nested JSON and locale extensions.', 'Known fields intentionally changed by the editor remain authoritative; arrays replace rather than resurrect deleted rows.'),
      32: ('studio-save-races.json', 'Ambiguous legacy create repeats identical first bytes/UUID and updates later edits on the returned id.', 'Complete legacy binary media recovery/cancel/refresh matrix is not executed.'),
      33: ('negative-tests.json', 'Dirty publish flush plus intercepted 503 yields an error and no published success/link.', 'Already-published, live public parity and revoke-mid-publish browser variants remain partial.'),
      34: ('changed-files.json', 'No server price, entitlement, payment or USD/KHR contract changed.', 'Live payment/provider certification is neither performed nor closed.'),
      35: ('unknown-json-roundtrip.json', 'Existing authored gallery rows above ten and metadata retained; empty couple names stay empty.', 'Preset artwork/default decorative copy and commercial rights still need review.'),
      36: ('negative-tests.json', 'Native chooser MIME/size source and upload validator tests retain existing constraints.', 'HEIC, EXIF/orientation, crop and new processing support are outside this phase.'),
      37: ('browser-coverage.json', 'Real EN/KM store, mixed text and DOM composition event coverage recorded.', 'Physical Khmer IME, diacritics and ceremonial language need native reviewer signoff.'),
      38: ('accessibility.json', 'Loaded real EN/KM light/dark management axe checks include contrast; forced colors branch exercised.', 'This is the rendered representative form/toolbar scope, not every renderer or physical AT.'),
      39: ('accessibility.json', 'Linked fields, actual modal focus and loaded axe results verified in named states.', 'All inspector errors/dialogs and physical AT reading order remain partial.'),
      40: ('negative-tests.json', 'Portal toolbar reduced-motion computation and keyboard split alternatives observed.', 'Every animation, physical touch and guest renderer motion variant is not recertified.'),
      41: ('libraries-and-ux.json', 'All ten named upstream sources and license dispositions independently recorded.', 'No source adopted; paid/template redistribution rights require asset/legal owners.'),
      42: ('libraries-and-ux.json', 'Actual UI UX Pro Max search logs and read frontend/premium skills recorded.', 'No project StyleSeed pin or compiled output was established.'),
      43: ('libraries-and-ux.json', 'Each UX-law mapping names an actual interaction, test and capture family.', 'Qualitative design rationale is not a user study or measured universal response budget.'),
      44: ('changed-files.json', 'No lockfile, dependency, vendor component or new invitation artwork adoption.', 'Existing commercial asset provenance remains open rather than implicitly cleared.'),
      45: ('test-runs.json', 'Exact full suites, lint, builds, tokens and repository checks have real exit codes and log hashes.', 'Overlapping suites are not added; backend configured skips remain explicit.'),
      46: ('browser-coverage.json', 'Default two-worker run and controlled native-engine reruns retained separately.', 'Emulated phone geometry and retry passes do not erase prior failures or prove physical devices.'),
      47: ('historical-regressions.json', 'Current Phase 02/guest identities and scanner/CI state retained without skips or assertion weakening.', 'Inherited failures remain owner gates rather than green certification.'),
      48: ('performance-compare.json', 'Same installed lockfile builds and exact current emitted bytes/hashes recorded.', 'No apples-to-apples runtime p95, memory soak, field INP/CWV or all cold/warm budgets.'),
      49: ('visual-manifest.json', 'Before/after actual locale/theme/viewport images are hashed; compact management-only captures selected.', 'Raw renderer art/traces remain local; screenshot does not certify commercial rights.'),
      50: ('historical-57-plus-new-ledger.json', 'All 57 original records and newer namespaces copied with source hash and original owners.', 'Historical closure is retained as historical, not silently re-certified by this audit.'),
      51: ('defect-register.json', 'Fifteen source-backed defects have severity, repair, run/source proof and remaining limits.', 'Source-only pre-fix findings are labeled without invented failing runs.'),
      52: ('evidence-validation.json', '31 topic reports plus index validated for local links, JSON, counts and independent artifact hashes.', 'Final regeneration is required after every documentation/publication state update.'),
      53: ('publication-result.json', 'Current handoff separates actual local results, conditional checkpoint publication and release certification.', 'The original published agent prose is explicitly superseded, not adopted as our execution.'),
      54: ('baseline.json', 'Entry main already contained published implementation and purported audit; no deployment or destructive rollback performed here.', 'Git metadata cannot authenticate historical agent authorship; repository owner review remains required.'),
    }
    gates=[]
    for gate, requirement in requirements:
        n=int(gate[-2:]);status='VERIFIED — LOCAL' if n in verified else 'BLOCKED — EXTERNAL' if n in blocked else 'REVIEW REQUIRED' if n in review else 'PARTIALLY COMPLETE'
        artifact, assertion, risk = gate_details[n]
        gates.append({'id':gate,'requirement':requirement.strip(),'prior_claim':original_gates[n-1]['verdict'],'independent_status':status,
            'evidence':[artifact,'test-runs.json'], 'asserted_state':requirement.strip(),
            'actual_observation':assertion, 'remaining_risk':risk,
            'corrections': [d[0] for d in defects if n in {
                'C13-001':{27,28,29},'C13-002':{29,30},'C13-003':{13,15,17,31,35},'C13-004':{13,15,17,31},
                'C13-005':{8,39},'C13-006':{5,38,39},'C13-007':{6,23,24},'C13-008':{23,24},
                'C13-009':{20,39},'C13-010':{32},'C13-011':{7,28},'C13-012':{27,32,35},'C13-013':{2,45,47},'C13-014':{45,52},'C13-015':{45,47}
            }[d[0]]],
            'responsible_owner':'Device/native QA' if n in {25,37} else 'Repository owner / audit provenance reviewer' if n==54 else 'Phase 13 QA / relevant domain owner'})
    counts=Counter(row['independent_status'] for row in gates)
    for status in ['VERIFIED — LOCAL','PARTIALLY COMPLETE','REVIEW REQUIRED','BLOCKED — EXTERNAL','FAILED','NOT APPLICABLE']:
        counts.setdefault(status,0)
    assert sum(counts.values())==54
    write('f13-independent-54-gates.json', {'counts':dict(counts),'total':54,'gates':gates})
    write('open-gates-owner-matrix.json', {
      'phase13_open':[{'id':g['id'],'status':g['independent_status'],'owner':g['responsible_owner'],
          'observed':g['actual_observation'],'next_action':g['remaining_risk'],'evidence':g['evidence']}
          for g in gates if g['independent_status'] != 'VERIFIED — LOCAL'],
      'historical_owner_source':'historical-57-plus-new-ledger.json; original owner rows retained in full',
      'release_gate_policy':'Local development-checkpoint readiness is independent of production certification; no external gate is automatically closed.'})

    write('gemini-claims.json', {'entry_already_published':True,'source_attribution':attribution,
      'reconciliations':[
        {'claim':'28 negative tests / 35 IDs / 38 passes are interchangeable','observation':'35 IDs and 38 executions, but only eight original IDs exercise a narrow production contract. Most other tests cannot prove their advertised scenario.'},
        {'claim':'2158 tests provide a disjoint global total','observation':'Targeted/negative/full suites overlap. Full entry user 1821 and admin 202 reproduced; later final counts live in test-runs.json. No combined pass total is asserted.'},
        {'claim':'All unknown nested JSON survives a shallow spread','observation':'Independent real form and alternate adapter regressions failed before C13-003/004 repairs.'},
        {'claim':'Account-switch safety was verified secure','observation':'Actual Axios adapter dispatched A bytes with B credentials before C13-001.'},
        {'claim':'54px CSS minimum proves 330px usable editor','observation':'Baseline actual header 72px and first title input y=429.98 at 844x390; current geometry is measured in visual-manifest.json.'},
        {'claim':'Dark screenshots verify real dark mode','observation':'Inherited fixtures wrote theme/data-theme, while the app reads koupreng.colorMode/data-color-mode. New fixtures use the actual key.'},
        {'claim':'Sixteen screenshot hashes are current','observation':f"Only {sum(s['matches_claim'] for s in prior['original_screenshot_hashes'])} of 16 original screenshot hash claims match entry bytes. Original files preserved; new captures have current hashes."},
        {'claim':'No publication has occurred yet','observation':f'Entry local/remote main already matched {ENTRY}; 121 files include both implementation and purported audit.'},
        {'claim':'Current browser CI is the two guest-filter assertions','observation':'Entry run 44544967826 actually stopped on missing generated Studio matrix before collecting those tests. Historical guest cases are replayed separately.'},
        {'claim':'There are ten section tabs / fallback always renders KhmerCelestial','observation':'Actual Studio has six grouped-button categories. Unknown stable registry identity fails closed, with explicit shared/fallback identities retained.'},
        {'claim':'Broad checkout/remove commands are a safe rollback','observation':'Rejected. The current package permits only dry-run reverse checking of attributable hunks, with original work retained.'},
        {'claim':'Performance/rights/AT are certified by build or mock tests','observation':'Bundle outputs and scoped fixture observations only. External/native/provider/rights/RUM owners remain open.'},
      ]})

    def recorded(ids):
        return [by_run[name] for name in ids if name in by_run]

    write('studio-save-races.json', {
      'production_sources':[studio+'useStudioAuthority.js',studio+'useStudioPersistence.js',inv+'InvitationForm.jsx','apps/frontend-user/src/shared/storage/weddingStorage.js'],
      'actual_test_sources':[studio+'StudioAuthority.test.jsx',studio+'StudioRoundtrip.test.jsx',studio+'useStudioPersistence.test.jsx'],
      'assertions':['A bytes cannot dispatch using B credentials','Late A response cannot start more requests or write B storage','Ownerless id/slug reads and reassignment reject without changing bytes','An old acknowledgement does not clear newer dirty edits','Real typed title/focus survive delayed Axios save and final bytes are sent','Ambiguous create retries reuse first payload and clientRequestId, then update newer bytes on one returned id'],
      'runs':recorded(['pre-fix-negatives','authority-fix','pre-fix-create-retry','retry-fixed','real-typing-race','full-user-frozen']),
      'limits':['Frontend Axios adapter and local storage proof; no live cookie/MySQL concurrency claim','Complete legacy binary recovery and event-switch late-asset matrix remain partial']})
    write('unknown-json-roundtrip.json', {
      'production_sources':[inv+'invitationPayloadUtils.js',inv+'InvitationForm.jsx',adapter],
      'tests':[studio+'StudioRoundtrip.test.jsx',inv+'invitationPayloadUtils.test.js',adapter.replace('.js','.test.js')],
      'assertions':['Two real form saves retain nested future design/content/localized keys, arrays, null, false and Khmer text','Eleven existing photos survive; ten-new-photo limit does not truncate authored rows','Gallery extensions follow stable id, not array index','Edited arrays replace arrays, retaining explicit deletion/reorder/null','Alternate public reader/writer carries raw JSON extensions and locale content','Late media acknowledgement cannot replace a newer selection'],
      'runs':recorded(['pre-fix-json','json-fix','pre-fix-alternate','alternate-fixed','roundtrip-isolated','focused-security','full-user-frozen']),
      'limits':['No full dedicated-template A to B to A matrix','No claim that all unknown semantics can be edited by current controls']})
    write('preview-security-negatives.json', {
      'sources':['apps/frontend-user/src/shared/preview/previewMessaging.js','apps/frontend-user/src/shared/preview/useStudioPreviewEditing.js',inv+'LivePhoneSimulator.jsx'],
      'assertions':['Explicit postMessage target origin','Origin/source/session nonce and message schema validation','Prototype, nesting, array and string bounds','Known edit section allowlist and interactive child exclusion'],
      'tests':['apps/frontend-user/src/shared/preview/previewMessaging.test.js',studio+'InvitationStudioNegativeScenarios.test.jsx','apps/frontend-user/tests/e2e/phase10-codex-renderers.spec.js'],
      'runs':recorded(['focused-security','route-registry-form','crossphase-06-08-09-10','crossphase-webkit-isolated','full-user-frozen']),
      'limits':['buildPreviewUrl permits HTTP(S); controlled registry callers remain required','Fixtures and unit contracts do not certify live guest-token deployment privacy']})
    browser_ids=['baseline-visuals','baseline-functional','repaired-browsers','browser-isolated-rerun','final-browsers-default','final-frozen-browsers','corrected-final-browsers','studio-navigation','phase11-browsers','phase11-isolated','phase12-owner-browsers','phase02-historical','historical-guest','crossphase-06-08-09-10','crossphase-webkit-isolated','ci-browser-collection','ci-browser-local','floral-selector-isolated','floral-native-controls']
    write('browser-coverage.json', {
      'runs':recorded(browser_ids),'suite_totals_overlap':True,
      'native_engines':['Chromium','Firefox','WebKit'],'physical_devices_certified':False,
      'creator_viewports':[[1920,1080],[1440,900],[1280,900],[1024,768],[844,390],[768,1024],[393,851],[375,812],[320,568]],
      'locales':['en','km'],'actual_theme_key':'koupreng.colorMode','actual_theme_attribute':'data-color-mode',
      'configured_workers':{'phase13-codex':2,'phase12-regressions':2,'phase02-foundations':2},
      'controlled_workers':'Exact command overrides are retained per run; one-worker corrected Studio run is separate from two-worker default run.',
      'limits':['No physical mobile browser/AT/Khmer IME or native 200/400 percent zoom signoff','Simulated visualViewport shrink tests the application branch only','Late CSS-only rebuild occurred during initial broader compatibility replay, which is not frozen performance evidence']})
    write('historical-regressions.json', {
      'runs':recorded(['crossphase-06-08-09-10','crossphase-webkit-isolated','phase11-browsers','phase11-isolated','phase02-historical','historical-guest','phase12-owner-browsers','ci-browser-local','floral-selector-isolated','floral-native-controls']),
      'phase02_unchanged_sources':['apps/frontend-user/tests/e2e/phase02-foundations.spec.js','apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx','apps/frontend-admin/src'],
      'phase02_current_identities':['responsive Studio retains edits, preview viewport and all sections across widths','Khmer route contract uses the active controls: create-event','Studio and contrast roles remain usable in km and dark mode'],
      'phase02_scope':'Same three identities in desktop/mobile Chromium; actual pass/fail counts are the recorded output, never substituted from historical totals.',
      'crossphase_admin_popup':{'failed_cases':6,'test':'phase06-layout-navigation.spec.js:163','expected':'http://127.0.0.1:4173/templates/event-essential','actual':'http://localhost:5173/templates/event-essential','source':'apps/frontend-admin/src/shared/config/runtime.js','classification':'Default admin build uses its unchanged configured fallback; test expects a different user origin. No admin source changed. Phase 02 isolated builds explicitly supply the expected origin.'},
      'transport_failures':'Two initial WebKit renderer 30s screenshot/evaluation timeouts and one Firefox Phase 11 page load timeout require separately recorded isolated reruns; they are not silently erased.',
      'guest':'Original guest list filters intersect case and Add guest assertion remain unmodified; current replay records actual identities.',
      'ci_matrix_probe':'Full local CI replay: 86 passed, six failed, two configured skips. Two were the unchanged guest assertions; four exposed Floral probe assumptions. Opening-label-only replay: two passed/two failed on a nonexistent shared button locale control. Final native-control replay keeps all suppression/message/reflow/axe assertions; its exact result remains separate, never added to the full run total.',
      'owner':'Repository regression QA; admin/guest owners for inherited failures'})
    for name in ['source-freeze.json','secret-findings-classification.json','inherited-sensitive-material-review.json']:
        if (RAW/name).exists(): shutil.copy2(RAW/name,EVIDENCE/name)

    # Every topic is explicit about what was and was not demonstrated.
    reports = [
      ('01-baseline-and-provenance','Git baseline and source ownership',
       f'The execution began on clean main at `{ENTRY}`, also returned by ls-remote. This is one commit after the Phase 12 baseline. The prompt’s dirty six-file expectation was stale: the entry commit already published 121 files, including both packages. All nine attributed Gemini code/test/config hashes match the preserved entry snapshot after normalizing duplicate slash spellings in the inventory. This execution does not authenticate an earlier agent identity from a commit author name.\n\nBefore changing product source, 197 inventory rows were snapshotted outside the repository; duplicate path spellings are accounted for in baseline.json. No environment secret was used as documentation. Backend tests later regenerated tracked synthetic output/admin-reporting fixtures; these are separately inventoried and excluded from the Studio publication candidate. No broad restore, clean, reset, stash or history rewrite was used.', ['baseline.json','prior-package-validation.json']),
      ('02-claim-reconciliation','Claims, counts and evidence mismatches',
       'The original suite has 35 unique N13 IDs and 38 executions, because N13-04 has four parameter rows. That resolves arithmetic only. Eight IDs exercise a narrow production contract; the remaining original examples include locally invented entitlement logic, direct URL.revokeObjectURL calls, arithmetic viewport sizes and a fake guest list. Passing those examples does not prove the application scenario. The new adapter, form and browser assertions supplement rather than relabel those tests.\n\nThe entry full user suite reproduced 1,821 passes and the admin suite 202. The prior 2,158 total mixes overlapping suites. This report deliberately keeps command counts separate. Sixteen inherited screenshot tests do execute sixteen times on one Chromium project, not six native-device projects. Hash mismatches and the incorrect dark preference fixture invalidate broad visual certification, while preserving the original captures for comparison.', ['gemini-claims.json','negative-tests.json','prior-package-validation.json']),
      ('03-routes-roles-and-editor-modes','Routes, editor modes and authority partitions',
       'hostRoutes keeps RequireAuth around the host shell. EventInvitation selects the advanced editor only for WEDDING events whose template is not event-essential. Other events continue through EventDetails. Numeric legacy edit links redirect to the canonical event workspace; nonnumeric local continuations use the owner-scoped loader. No new non-wedding advanced editor exists.\n\nEventWorkspace keys its verified lifetime by account/event and derives controls from the actual access response. Studio recovery may retain dirty text after revocation, while fields and Save are disabled. The legacy loader now has an equivalent account/id lifetime key, preventing the old invitation from painting during another account’s load. API mutation authority remains server-owned. The route matrix records these partitions rather than claiming every Cartesian combination was executed.', ['source-routes.json','negative-tests.json']),
      ('04-phase12-and-ci-carryover','Published Phase 12 and actual CI',
       'The Phase 12 checkpoint and its owner dashboard/navigation source remain preserved. The complete prior 57-entry ledger and newer namespaces are copied as historical records with their source hash. They are not retroactively closed by Studio tests. Run 44532062068 was independently queried and still shows Secret Scan and Browser E2E failures.\n\nThe entry commit’s distinct run 44544967826 is also failed in those jobs. Its browser job actually stops on ENOENT for docs/phase12/evidence/studio-template-locales-matrix.json, before guest assertions execute. CI now regenerates that source-derived fixture in the browser job using its existing PHASE12_WRITE_MATRIX opt-in. The generator passed locally. Historical Add guest failures remain a separate unchanged replay; they must never be substituted for the observed current failure.', ['ci-observed.json','test-runs.json','historical-57-plus-new-ledger.json']),
      ('05-visual-direction-and-comparison','Workbench visual direction and changed chrome',
       'The inherited forest, ivory and restrained gold workbench remains the design direction. This audit changes actual management chrome: readable section text in real dark mode, a darker light-mode template label, less stacked whitespace in short landscape, a fixed 44px landscape command height, and actions that remain available in the keyboard branch. No template artwork, new image, font dependency or motion engine was introduced.\n\nBaseline and final captures use the same fictional event/account fixture, locale and viewport. The baseline 844×390 title input begins at y=429.98, below the viewport; the final manifest records its actual new position and header height. Scroll/edit/Save/preview reachability is asserted, rather than inferring usability from min-height. Selected published screenshots show only management views; full renderer captures remain local because inherited art rights are not newly certified.', ['visual-manifest.json','accessibility.json']),
      ('06-toolbar-status-and-commands','Toolbar status and real keyboard ownership',
       'Saved means the persistence hook has acknowledged the serialized snapshot sent by its writer. Edits made during that request remain dirty and a deliberate flush continues until the newer snapshot is acknowledged. Offline, saving, unsaved, failed, conflict, expired and denied are distinct. HTTP 403 now suspends writes and keeps recovery text instead of presenting an unrestricted retry as generic failure.\n\nReal keyboard dispatch exposed interception during IME composition, Alt combinations, already handled events, modal commands, inherited contenteditable descendants and blocked/read-only actions. The toolbar now leaves those events to their owner. Native text undo is exercised in the browser. Focus is placed on the actual Studio modal invoker before opening, fixing WebKit’s pointer-focus difference without changing the shared modal implementation.', ['defect-register.json','negative-tests.json','test-runs.json']),
      ('07-section-navigation-and-aria','Six categories, mobile select and focus',
       'STUDIO_TABS contains six categories: Event Information, Schedule & Venue, Media & Opening, Design & Cover, Guest Experience, and Tickets & QR. Desktop markup is a nav containing grouped buttons with aria-current; it is not falsely documented as a ten-tab ARIA tablist. Arrow keys wrap and Home/End choose first/last. Natural Tab stops remain available on the semantic buttons.\n\nThe mobile native select has the visible Edit section label and the same category values. resolveStudioSection chooses a supported section, with an explicit unsupported-content notice when the template does not provide that group. Existing section data is retained. Browser keyboard assertions exercise actual focus/current state; viewport journeys exercise the select layout. Complete template-dependent disappearing-section focus recovery remains a review item rather than a blanket accessibility claim.', ['source-routes.json','negative-tests.json','visual-manifest.json']),
      ('08-inspector-fields-and-validation','Inspector hierarchy and authored input',
       'StudioField supplies linked labels/help/errors, required-to-publish descriptions and field groups. Actual title, partner names, date/time/timezone and venue fields are exercised by current form/onboarding tests; the long save/reload journey edits an actual input rather than a fabricated object. Validation and publish review remain separate from optional authoring fields. Unknown JSON is retained even where no inspector control exists.\n\nThe large InvitationForm is still a monolith and is not claimed exhaustively audited by a small six-file diff. Broad family/story/FAQ/closing/template-specific combinations remain partial coverage, identified in the gates. Short-landscape spacing changes retain reading line height and 44px commands rather than hiding fields or reducing the browser zoom. New color fixes apply only to management chrome, leaving dedicated invitation artwork untouched.', ['source-routes.json','f13-independent-54-gates.json','test-runs.json']),
      ('09-template-selection-and-entitlements','Template compatibility and server entitlements',
       'TemplateChooser separates public catalog visibility, renderer availability, language/event compatibility and paid access. Catalog failure presents preview-only designs with retry; it does not authorize selecting a fabricated template. The form fetches the fresh template identity, checks server access, confirms the change, and retains authored form data.\n\nEach asynchronous template-selection stage now verifies the same Studio request authority before applying a late result or opening feedback. This protects account/grant changes during catalog/access confirmation. Server prices and premium entitlements were not modified. Existing policy/chooser/backend tests and actual chooser focus are current evidence. Exhaustive paid A→B→A journeys across every renderer remain partial, and no permission is inferred from the visual premium badge.', ['source-routes.json','negative-tests.json','defect-register.json']),
      ('10-preview-protocol-security','Preview origin, source, session and edit targets',
       'The preview channel validates origin, source Window, per-editor session and allowed message shape. Recursive data validation rejects forbidden prototype keys, excessive nesting/arrays and oversized strings. postPreviewMessage supplies an explicit target origin; no wildcard was introduced. Only STUDIO_EDIT_SECTIONS can navigate the inspector, and click editing excludes links, buttons, inputs, media, summary and role=button controls.\n\nThe current application constructs same-origin template preview URLs from registry identities. buildPreviewUrl permits HTTP(S) URLs generally, so safety also depends on these controlled callers; this is not represented as a general untrusted-URL sanitizer. Unit negatives cover schema/channel contracts, with real iframe interactions in the browser. No owner credential, customer guest token or real account was added to evidence.', ['negative-tests.json','source-routes.json','test-runs.json']),
      ('11-preview-devices-focus-and-zoom','Device simulation and preview dialog',
       'The phone content viewport is 440×860 and desktop content viewport 1200×800, inside outer frames of 456×972 and 1216×816. These are scaled simulations, not physical Safari/VoiceOver certifications. The functional suite opens the real preview modal, exercises desktop/phone and zoom, checks actual iframe innerWidth, closes with Escape and verifies logical focus return.\n\nAn added assertion initially confused the desktop outer frame with its content width and failed in all engines. The original caption was correct; the test expectation was corrected against source and actual geometry. The failed run is retained. Short viewport editing is measured independently from an iframe visibility percentage. Native 200/400% browser zoom, browser toolbar/safe areas and physical keyboard behavior remain external review, even though narrow reflow and the visualViewport branch are tested.', ['negative-tests.json','visual-manifest.json','f13-independent-54-gates.json']),
      ('12-split-resize-and-cancellation','Split pane pointer, keyboard and storage',
       'useStudioSplit clamps the preference using available pane width, applies transient drag geometry without rerendering the invitation on every pointer move, and restores the original value on pointercancel/window blur. Stored invalid ratios and denied storage are covered by existing unit tests. Keyboard arrows, Shift increments and Home/End provide alternatives to dragging.\n\nThe original N13-14 example tested clamping rather than an actual cancelled drag. The independent browser case performs real pointer down/move followed by cancellation, then checks restored aria-valuenow and persisted preference. lostpointercapture retains the existing commit behavior; this audit does not falsely describe every capture-loss event as cancellation. Modal/small-screen layouts use the existing stacked preview rather than a forced desktop splitter.', ['negative-tests.json','test-runs.json']),
      ('13-autosave-revision-and-races','Snapshots, conflicts and acknowledgements',
       'useStudioPersistence has one writer, a bounded 25-entry history, a 1500ms autosave delay and an acknowledgement serialized independently from the latest form. Deferred-promise tests demonstrate that an old success cannot acknowledge a newer edit and that flush sends the next snapshot. A new real Axios adapter test edits the actual form during a pending save and verifies final sent bytes, retained value and focus.\n\nHTTP 401/403/409 block further writes while preserving dirty text; 503 allows an explicit retry. The form passes expectedUpdatedAt through both initial and media-reference updates, using returned revisions. Scope cancellation is checked after every asynchronous stage before subsequent requests or local writes. These are frontend adapter/fixture and backend unit/H2 observations, not live MySQL concurrent-editor proof.', ['negative-tests.json','defect-register.json','test-runs.json']),
      ('14-history-navigation-and-account-switch','Undo, navigation and document lifetimes',
       'Document history is in memory only; no server version-history product is claimed. Undo/redo are unavailable while saving or in blocked/read-only states, and native text undo remains owned by editable controls. Existing beforeunload/router/history guards continue to ask before leaving dirty content. The misleading original N13-06 dirty boolean is not treated as complete navigation proof.\n\nAccount/event lifetimes are keyed in the canonical workspace and now the legacy loader. A Studio authority hook aborts synchronously when the auth store changes and invalidates old permission-grant requests. This catches the Axios microtask window as well as late responses. The old account’s closure cannot start uploads, acknowledge Save, write a cache or confirm publication for the new account. Reopening after a session/grant change is explicit recovery.', ['negative-tests.json','defect-register.json','source-routes.json']),
      ('15-json-and-locale-roundtrips','Deep JSON and alternate readers',
       'The shallow base spreads preserved unknown top-level keys but lost nested design keys when a colliding form object replaced the subtree. Gallery reconstruction dropped extension metadata, and initial form parsing truncated records beyond ten. Independent failures preceded repairs. preserveStudioJson merges plain object extensions, rejects prototype keys, honors explicit null and replaces edited arrays rather than restoring deleted/reordered rows by index. Gallery metadata is matched by stable id.\n\nTwo real form saves retain nested arrays/null/false/Khmer text, future locale keys and eleven existing photos. The alternate publicInvitationToDraft/draftToInvitationPayload path now carries raw JSON documents and edited locales, with its own failing-then-passing regression. The ten-photo limit still applies to adding new uploads; existing authored records are not silently erased. No global schema migration or backend serializer change was made.', ['defect-register.json','negative-tests.json','test-runs.json']),
      ('16-legacy-recovery-and-create-retries','Ownerless recovery and stable creation identity',
       'Ownerless local records remain stored but cannot be loaded by an authenticated id/slug reader or reassigned through saveDraft. Owned records are also unavailable to anonymous readers. The legacy editor reports recovery required rather than silently replacing or deleting an unclaimed record. Listing may retain an ownerless record for recovery awareness; Phase 12 owner filtering still prevents account upload.\n\nA legacy Studio create now retains one clientRequestId and immutable first payload for an ambiguous response retry. After the server returns an id, later edited bytes are applied by update on that same event. The request/attempt is retained in the local recovery draft. The new form test checks equal retry payloads and the subsequent update; canonical Phase 11 browser retries are independently replayed. No applied migration or server idempotency policy was changed.', ['negative-tests.json','defect-register.json','source-routes.json']),
      ('17-permissions-and-revoked-grants','Mutation authority and revocation',
       'The server access response remains authoritative for workspace actions. Grant revocation disables fields and Save while preserving the dirty form for recovery. Request cancellation binds a write to one mounted document/session/grant, even when the user changes account before Axios adapter dispatch. The independent pre-fix adapter captured the actual forbidden combination of A bytes and B Authorization; after repair no write reached the adapter.\n\nServer-owned entitlements, prices, guest-token privacy and owner-only publish policy were preserved. A 403 is now denied, with retry suspended rather than disguised as a transient connection error. Full backend tests add unit/H2 contract confidence, but 82 configured skips retain external MySQL/live-provider limits. UI affordances are never presented as proof that an unauthorized direct endpoint is secure in a live environment.', ['defect-register.json','negative-tests.json','test-runs.json']),
      ('18-publish-state-truth','Publish review and private/public truth',
       'Publish Review still evaluates required fields and visibility, flushes the current draft, and requires a server PUBLISHED response before displaying success or constructing a share URL. Preview does not invoke publish. The request now carries the same cancellation authority as saving, and late publication/status results cannot confirm another account’s event.\n\nThe functional negative edits a dirty title, confirms review, intercepts a 503 publish response, verifies the error and asserts there is no published result. This is explicitly a fixture server acknowledgement journey. Real public access, unpublished/already-published transitions and live cookie/MySQL races remain Phase 15/staging validation gates. No guest message, payment settlement, public deployment or new access semantics were performed.', ['negative-tests.json','source-routes.json','test-runs.json']),
      ('19-media-contract-and-rights','Media limits, pending replacements and provenance',
       'The existing native chooser remains JPEG/PNG/WebP with the source-defined 5MiB limit and server signature validation. No HEIC support, crop redesign, new artwork or backend upload policy was introduced. Gallery request batching remains at five files. The independent source review found late upload callbacks could overwrite a newer selected reference and clear a newer pending file; acknowledgements now require the current field to match the sent field.\n\nInline media is not treated as a server-saved URL. Failed media keeps Save unsuccessful and the author’s current memory state; this is not a promise that all unsynced binary data survives an explicitly confirmed browser exit. Complete EXIF/orientation, object-URL/memory soak, cancel/retry UX and commercial asset provenance stay with Phase 14 and asset owners. The original direct revokeObjectURL test is not accepted as lifecycle proof.', ['negative-tests.json','defect-register.json','historical-57-plus-new-ledger.json']),
      ('20-khmer-english-ime-and-dates','Khmer, English and date/time coverage',
       'The actual language store and color-mode store are used in new fixtures. Loaded EN/KM captures differ in real labels, rather than filenames alone. DOM composition events and a long mixed Khmer/English/numeral string are exercised in the actual title input. Keyboard shortcuts do not interrupt unfinished composition. Existing event wall-time/timezone and locale-preservation tests remain part of the full suite.\n\nThis does not certify physical Khmer IME, native ceremonial language or cultural appropriateness. Some inherited preset wording/date/art defaults require broader renderer review before a universal neutral-content claim. No default couple identity was replaced with a fabricated customer. Locale arrays/extension objects survive the named two-save and alternate-reader tests; complete manual inspection of every long phrase/field remains partial.', ['accessibility.json','negative-tests.json','visual-manifest.json']),
      ('21-accessibility-and-physical-gaps','Loaded axe, focus and accessibility limits',
       'The baseline loaded scans actually enabled color-contrast and found the light template tag at 4.38:1 and dark section text as low as 1.05:1/1.69:1. Current form/portal scans cover EN/KM, light/dark and Chromium/Firefox/WebKit. These rule executions, violations and incomplete rules are preserved in accessibility.json. No color-contrast rule was disabled to manufacture a pass.\n\nKeyboard traversal, real native text undo, modal Escape/focus return, pointer-cancel alternatives and forced-color/reduced-motion branches have named functional assertions. Axe on the main loaded form is not an audit of every collapsed inspector or modal/error state. Physical VoiceOver/TalkBack/NVDA, native zoom and mobile keyboards remain explicitly external. The original report’s general zero-violation certification is superseded.', ['accessibility.json','test-runs.json','f13-independent-54-gates.json']),
      ('22-responsive-and-keyboard-geometry','Responsive geometry and reachability',
       'Nine sizes are independently exercised: 1920, 1440, 1280, 1024, 844×390, 768, 393, 375 and 320. Each journey scrolls to a real input, edits it, reaches Save, and opens/closes preview. The JSON records viewport, document width, toolbar/workflow/nav/field geometry and actual locale/theme. No whole-device certification is inferred from an image filename.\n\nAt 844x390 the measured header changes from 72px to 69.19px and the title field from y=429.98 to y=352.77. The editor body starts at y=228.19, leaving about 161.81px of body intersection; the complete first field still needs scrolling. Commands are 44px high. This is a density improvement, not a 54px actual header or 330px usable-editor claim. Real scroll/edit/Save/preview journeys pass. The visualViewport branch no longer hides mobile actions and is tested with a simulated shrink. A simulated viewport/320px reflow is not physical 200/400% zoom. Safe-area/browser-toolbar/native keyboard interactions stay open to device QA. Original Phase 02 admin Studio iframe containment failures are separate from this creator workbench.', ['visual-manifest.json','negative-tests.json','f13-independent-54-gates.json']),
      ('23-reference-libraries-skills-and-ux-laws','Reference products, skills and observable UX laws',
       'The canonical ten were checked as references: Animate UI, Badtz UI, Lightswind UI, Kokonut UI, Untitled UI, shadcn/ui, React Bits, Aceternity UI, Magic UI and Skiper UI. The referenced docs/design matrices do not exist in the current tree, so prior claims that they were inspected are not repeated. Current upstream URLs/terms and dispositions are recorded separately. No vendor code, dependency or paid component was adopted. React Bits/Animate UI restrictions and marketplace/template redistribution remain asset-owner questions.\n\nActual UI UX Pro Max focus-not-obscured and dark-contrast searches were run; their outputs are hashed in the command ledger. Frontend-design and premium Khmer guidance informed restrained density and readable management chrome. No pinned StyleSeed project lock/registry was found. UX-law mappings point to real controls and tests; they are qualitative design judgments, not fabricated user-study or latency measurements.', ['libraries-and-ux.json','test-runs.json']),
      ('24-performance-and-resources','Bundle and runtime evidence',
       'The unchanged entry source was built before product edits, then the reviewed source was built with the same installed Node/lockfile. Entry InvitationEditFeature was 241.35kB raw / 63.13kB gzip; the latest build log records current emitted sizes. The separate InvitationStudio chunk is not a substitute for the full editor route chunk. No dependencies were added. Small growth pays for session cancellation, JSON preservation and truthful recovery.\n\nThese are emitted-asset observations, with exact current file hashes/bytes retained locally. Build durations ran under different host load and are not a cold/warm performance experiment. No p95 typing latency, field INP/CWV, memory/object-URL lifetime or universal opening budget is invented. A late CSS-only compact-height refinement was rebuilt during broader compatibility replays; those replays are not frozen performance evidence. The final Studio browser run uses the subsequent fixed build.', ['performance-compare.json','test-runs.json','visual-manifest.json']),
      ('25-negative-matrix-and-defects','N13 matrix and confirmed repairs',
       'Every original N13-01…35 identity is preserved in negative-tests.json, with a production proof path, the actual invariant and fixture/external limits. Original executions remain 38, overlapping full and targeted runs. A named test is not accepted merely because its title repeats the obligation. The schema tests, simulated flags, array examples and arithmetic cases are explicitly distinguished from real adapter/form/browser assertions.\n\nC13-001…015 record severity, symptom, owner, repair and pre/post run ids. Where no automated pre-fix run was captured, the record says source-backed rather than inventing one. The failed original runs remain in the command ledger. The CI replay exposed two inherited Floral probe assumptions: its Khmer opening label and native locale select differ from the shared controls. The probe preserves the same activation/content/locale/axe obligations without changing template UI. JSON, session/grant cancellation, ownerless recovery, ambiguous create retries, keyboard ownership, contrast/density, WebKit focus and CI matrix generation are bounded repairs; none is presented as a new server/payment/media product.', ['negative-tests.json','defect-register.json','test-runs.json']),
      ('26-commands-failures-and-regressions','Exact invocations and retained failures',
       'test-runs.json records the command, repository-root cwd, start/finish UTC, duration, real exit code, log path and SHA-256 for each recorded execution. PowerShell read-only inspections also exposed the invalid initial ignored-files command, missing expected docs, and a quoted Unicode filename in an initial freeze script; these were corrected without editing unrelated source. Raw logs are retained outside the publication candidate.\n\nThe first new negatives failed before repair. Intermediate full-unit runs include a superseded 403 expectation and an overloaded real-form timeout; the isolated contract was moved to its own test file with a mocked preview, without extending timeouts. Browser failures and isolated reruns remain separate. Backend tests regenerate tracked synthetic reporting fixtures; those output changes are preserved and excluded rather than included in a Studio commit. No overlapping suite totals are added together.', ['test-runs.json','generated-test-output-exclusions.json','ci-observed.json']),
      ('27-independent-54-gates','Exact F13.1 gate disposition',
       'The exact 54 IDs and requirement text are taken from Appendix A of the supplied prompt, not substituted with an unrelated GATE-01 list. Each retains the original Gemini verdict beside the independent disposition, owner, evidence links and remaining limitation. Counts in README and JSON are generated from the same rows and must sum to 54.\n\nVerified local means the stated source/test/fixture observation only. Partial inspector/template/performance/state coverage stays partial. Physical zoom is externally blocked; native Khmer/IME and historical agent provenance require review. A valid token build or screenshot is not automatically proof of these gates. This package therefore reports PARTIALLY COMPLETE and makes the development-checkpoint decision separately from release certification.', ['f13-independent-54-gates.json','negative-tests.json']),
      ('28-historical-ledgers-and-owners','All 57 historical entries and newer namespaces',
       'The prior distribution is preserved exactly: 29 historically verified closed, two not applicable, six review, sixteen external blocked and four deferred. All 57 identities and their original evidence are retained inside historical-57-plus-new-ledger.json with the source file hash. The AUTH/C08/C09/D10/C10/C11/F12/Gemini additions remain separate nested ledgers; no flattening or retroactive closure occurred.\n\nC08-013 BCrypt policy, C10-001 guest privacy, Phase 11 creation/account isolation, Phase 12 draft/access repairs, original Phase 02 and guest cases, classified scanner findings, rights, providers, physical AT/native language and field performance remain assigned to their relevant owners. New Phase 13 external rows describe the missing native/staging/performance/rights work. Locally passing mocks do not close those responsibilities.', ['historical-57-plus-new-ledger.json','ci-observed.json']),
      ('29-attribution-and-selective-rollback','Reviewed hunks and safe rollback',
       'The initial tree was clean, and all original Gemini code hashes match entry bytes. Every current publication candidate has an explicit reason and hash in changed-files.json. The 121-file entry commit is retained; old report claims and unsafe broad rollback prose remain historical, with a supersession notice pointing here. No entire Studio/docs directory is selected for removal.\n\nThe new reverse patch covers only attributable Codex tracked hunks. git apply --check --reverse is a dry-run, and its result is recorded; no reverse application is authorized by this document. New files are separately hashed rather than implicitly deleted. Test-generated reporting outputs, raw traces, user media, environment files and ignored caches are excluded. Actual rollback still needs an explicit affected-file/owner decision.', ['changed-files.json','safe-rollback.json','baseline.json']),
      ('30-publication-hard-gates','Development-checkpoint publication decision',
       'Publication is conditional on current main/remote agreement, fully attributed files, no new unresolved P0/P1, actual validation, safe evidence and an exact staged scan. No force push, amend, branch-rule bypass, secret suppression or production deployment is permitted. publication-readiness.json records the actual decision at the final review; publication-result.json records observed Git/CI results or the precise block.\n\nThe entry was already published before this execution. Any new forward commit must be distinguished from that entry and from the old purported certification. Pre-existing CI red is accepted only with independent classification and an owner, never relabeled green. Pending workflows are pending. If a non-negotiable gate is unresolved, local fixes/evidence remain available without staging or pushing unknown work.', ['publication-readiness.json','publication-result.json','ci-observed.json']),
      ('31-phase14-1-handoff','Implementation-free Phase 14.1 Media Studio handoff',
       'No Phase 14 implementation started. The integration surface is InvitationForm/StudioUploadField and studioMedia, InvitationMediaManager/mediaApi, draftMediaStorage/galleryStorage, the template capability registry and dedicated renderers. Media owners should map upload/replace/remove, five-file batching, ten new-photo slots versus retained authored records, cover/background/invitation/map references, albums/order, crop/focal points, opening film/audio and retries/cancel.\n\nPreserve one account/document/grant authority across every awaited stage, stable create retry identity, original JSON/locale extensions, truthful server acknowledgement, native chooser limits, server entitlements, guest privacy and USD/KHR separation. HEIC, orientation/EXIF, processing memory, object-URL lifetime and rights require their own explicit scope. Physical/native/provider/zoom/RUM gates remain open. Refer to publication-result.json for the observed checkpoint/CI state; this handoff does not authorize backend media/schema work or deployment.', ['publication-result.json','historical-57-plus-new-ledger.json','defect-register.json']),
    ]

    # Supplemental artifacts are explicit measurements/decisions, not imported prose.
    write('libraries-and-ux.json', {'no_source_or_dependency_adoption':True,'adopted_version':None,
      'missing_expected_project_docs':['docs/design/TEN_LIBRARY_INTEGRATION_MATRIX.md','docs/design/THIRD_PARTY_UI_LICENSES.md'],
      'references':[
        {'name':n,'url':u,'observed_terms':t,'disposition':d,'upstream_ref':'Current public page / main observed 2026-11-19; no version adopted'}
        for n,u,t,d in [
          ('Animate UI','https://raw.githubusercontent.com/imskyleen/animate-ui/main/LICENSE.md','MIT + Commons Clause; component redistribution restricted','reviewed reference'),
          ('Badtz UI','https://raw.githubusercontent.com/badtzx0/badtz-ui/main/LICENSE.md','MIT text plus commercial redistribution modification restriction','rejected/deferred'),
          ('Lightswind UI','https://lightswind.com/license','v3.2.4 page permits commercial applications but restricts raw-source competing-library/UI-builder resale','rejected/deferred'),
          ('Kokonut UI','https://raw.githubusercontent.com/kokonut-labs/kokonutui/main/LICENSE','Free repository MIT; this does not license every PRO item','reviewed reference'),
          ('Untitled UI','https://raw.githubusercontent.com/untitleduico/react/main/LICENSE','Public React repository MIT; paid product terms separate','reviewed reference'),
          ('shadcn/ui','https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md','MIT with notice','reviewed reference'),
          ('React Bits','https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md','MIT + Commons Clause v1.0; component/tool/export redistribution restrictions','rejected/deferred'),
          ('Aceternity UI','https://ui.aceternity.com/licence','Pro license restricts marketplace/template/source redistribution','rejected/deferred'),
          ('Magic UI','https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md','Public repository MIT with notice; no paid-source adoption','reviewed reference'),
          ('Skiper UI','https://skiper-ui.com/docs/terms-of-service','Website terms reserve IP and restrict republication/redistribution; no blanket source clearance','rejected/deferred'),
      ]],
      'ux_laws':[
        {'law':law,'interaction':interaction,'test_source':test,'screenshot_family':shot}
        for law,interaction,test,shot in [
          ('Jakob','Familiar Save and native text undo, coherent preview return','StudioToolbar.test.jsx / functional native text undo','layout-1440x900'),
          ('Hick','Six section categories and progressive subsection disclosure','StudioSections.test.jsx','layout-768x1024'),
          ('Fitts','44px landscape commands and reachable Save/preview','functional responsive journeys','layout-844x390'),
          ('Miller','Semantic grouping reduces an unstructured section list','studioNavigation.js / StudioSections.test.jsx','layout-1440x900'),
          ('Tesler','Snapshot/authority/JSON complexity remains in the writer','StudioAuthority.test.jsx / StudioRoundtrip.test.jsx','save-reload'),
          ('Doherty','Immediate dirty/saving feedback while async work continues; no measured universal latency promised','useStudioPersistence.test.jsx','http-503'),
          ('Gestalt proximity/common region','Related inspector labels/help/actions stay within the same field group','loaded contrast scans and field label assertions','layout-393x851'),
          ('Nielsen','Visible save state, explicit failure recovery and prevention of stale-account writes','functional status/retry/revocation cases','save-failed'),
      ]], 'styleseed':'No project pin/compiled registry established; existing token check is not a StyleSeed pin.'})
    write('performance-compare.json', {'baseline_build_run':'baseline-build','final_build_run':'final-layout-build',
      'baseline_editor_raw_kb':241.35,'baseline_editor_gzip_kb':63.13,'baseline_studio_raw_kb':47.35,'baseline_studio_gzip_kb':14.08,
      'final_editor_raw_kb':245.56,'final_editor_gzip_kb':64.39,'final_studio_raw_kb':47.78,'final_studio_gzip_kb':14.15,
      'units':'Vite rounded decimal kB from actual build logs; current exact assets in ignored source-freeze.json',
      'cold_warm_latency_p95_memory_cwv':'NOT MEASURED / NOT CERTIFIED',
      'build_duration_not_comparable':'Host load differs. Compatibility replay was not a frozen performance experiment.'})
    defect_details = {
      'C13-001':(studio+'useStudioAuthority.js','useStudioAuthority',[27,28,29],['StudioAuthority.test.jsx','InvitationForm.jsx']),
      'C13-002':('apps/frontend-user/src/shared/storage/weddingStorage.js','export function getDraft',[29,30],['StudioAuthority.test.jsx','InvitationEditFeature.jsx']),
      'C13-003':(inv+'invitationPayloadUtils.js','export function preserveStudioJson',[13,15,17,31,35],['StudioRoundtrip.test.jsx','InvitationForm.jsx']),
      'C13-004':(adapter,'export function publicInvitationToDraft',[13,15,17,31],[adapter.replace('.js','.test.js')]),
      'C13-005':(studio+'StudioToolbar.jsx','const handleKeyDown',[8,39],['StudioToolbar.test.jsx']),
      'C13-006':(studio+'StudioChrome.css','accessible management colors',[5,38,39],['phase13-codex-functional.spec.js']),
      'C13-007':(studio+'StudioChrome.css','padding-block: 0',[6,23,24],['phase13-codex-functional.spec.js']),
      'C13-008':(studio+'StudioToolbar.jsx','setKeyboardInset',[23,24],['StudioChrome.css','phase13-codex-functional.spec.js']),
      'C13-009':(studio+'StudioToolbar.jsx','event.currentTarget.focus',[20,39],['phase13-codex-functional.spec.js']),
      'C13-010':(inv+'InvitationForm.jsx','createAttempt.current ||=',[32],['StudioRoundtrip.test.jsx']),
      'C13-011':(studio+'useStudioPersistence.js','error.status === 403',[7,28],['useStudioPersistence.test.jsx','StudioToolbar.jsx']),
      'C13-012':(inv+'invitationPayloadUtils.js','export function acknowledgeStudioMedia',[27,32,35],['invitationPayloadUtils.test.js','InvitationForm.jsx']),
      'C13-013':('.github/workflows/ci.yml','PHASE12_WRITE_MATRIX',[2,45,47],['phase12ContractMatrix.test.jsx']),
      'C13-014':('docs/development/AI_SKILLS_SETUP.md','# Repository AI skills',[45,52],['scripts/validate-agent-routing.py']),
      'C13-015':('apps/frontend-user/tests/e2e/phase12-matrix.spec.js','const controls =',[45,47],['support/activateOpening.js']),
    }
    enriched=read(EVIDENCE/'defect-register.json')
    for d in enriched:
        path, marker, related, companions=defect_details[d['id']]
        lines=(ROOT/path).read_text(encoding='utf8').splitlines()
        d.update({'repair_source':path,'repair_line':next(i+1 for i,line in enumerate(lines) if marker in line),
          'related_gates':[f'F13.1-{n:02d}' for n in related], 'companion_files':companions,
          'reproduction':'Run the named pre-fix test/source scenario against the retained entry snapshot; exact commands, assertions and failures are in the linked run record/log. No customer account is needed.',
          'before_after_proof':[r for r in [d['pre_fix_run'],d['post_fix_run']] if r],
          'remaining_limit':'Local source/adapter/browser fixture proof only; corresponding external and broader state gates remain in the owner matrix.'})
    write('defect-register.json', enriched)
    excluded=[]
    for p in git('diff','--name-only','--','output/').splitlines():
        if p: excluded.append({'path':p,'sha256':digest(ROOT/p),'owner':'Backend or browser test fixture generator during this execution','publication':'EXCLUDED; retained without broad rollback'})
    write('generated-test-output-exclusions.json', excluded)
    existing_publication = EVIDENCE/'publication-result.json'
    if not existing_publication.exists(): write('publication-result.json', {'status':'NOT PUBLISHED BY THIS EXECUTION','entry_already_published':ENTRY,'new_commit':None,'new_ci':'NOT OBSERVED'})
    existing_readiness = EVIDENCE/'publication-readiness.json'
    if not existing_readiness.exists(): write('publication-readiness.json', {'status':'PENDING FINAL REVIEW — DO NOT PUBLISH','gates':['remote agreement','attributed file review','zero new P0/P1','required validation','evidence and reverse-check','exact staged secret scan'],'no_deployment':True})
    if not (EVIDENCE/'safe-rollback.json').exists(): write('safe-rollback.json', {'status':'PENDING DRY-RUN','actual_rollback':'NOT PERFORMED; explicit owner decision required','new_files':'Hash inventory only; no deletion authorized'})
    for slug,title,body,artifacts in reports:
        links='\n'.join(f'- [{name}](evidence/{name})' for name in artifacts)
        text=f'# {title}\n\nIndependent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.\n\n{body}\n\nEvidence:\n\n{links}\n\n[Report index](README.md).\n'
        (DOC/(slug+'.md')).write_text(text,encoding='utf8')
    index='\n'.join(f'- [{title}]({slug}.md)' for slug,title,_,_ in reports)
    counts_text=', '.join(f'{v} {k}' for k,v in sorted(counts.items()))
    (DOC/'README.md').write_text(f'''# Phase 13 Creator Studio independent revalidation

**PHASE 13 STATUS — PARTIALLY COMPLETE.** This execution repairs confirmed local account/data-loss/UX defects. A reviewed development checkpoint is separate from production release certification. See [actual publication decision](evidence/publication-readiness.json) and [observed result](evidence/publication-result.json).

Entry was clean `main` at `{ENTRY}`, already published locally and remotely. The old purported Codex certification is superseded by this package. Every prior claim remains available in Git and its original package. The nine Gemini code/test/config hashes match the entry snapshot; only {sum(s['matches_claim'] for s in prior['original_screenshot_hashes'])}/16 inherited screenshot hashes match.

Current exact command results, including failed attempts, are in [test-runs.json](evidence/test-runs.json). Suites overlap and are never summed. Entry full suites reproduced 1,821 user and 202 admin tests. Final full user: **1,841 passed / 248 files**, exit 0. Backend: 680 executed, zero failures/errors, 82 configured skips (598 non-skipped). Telegram: 74 passed. Final Studio: **78 passed** at one worker, plus **3 passed** dirty-exit cases; the earlier default two-worker run separately passed 75 cases before added assertions. Owner-dashboard replay: **27 passed**. All other cross-phase/CI replays are recorded individually; pending files are not passes.

Confirmed repairs cover real Axios account dispatch/late stages, ownerless recovery, nested JSON and alternate adapters, existing gallery preservation, stable ambiguous creates, keyboard ownership/denied status, late image acknowledgements, actual dark contrast, compact short landscape, keyboard action reachability, WebKit focus return and CI matrix generation. No backend, migration, template art, price/entitlement or dependency change occurred.

Exact F13.1 grading: **{counts_text}**; total 54. The historical 57 remain 29 verified closed, two N/A, six review, 16 external blocked and four deferred, with all newer namespaces retained. Original N13 arithmetic is 35 IDs / 38 executions; semantic scope differs and is mapped [case by case](evidence/negative-tests.json).

Observed entry CI run [44544967826](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/44544967826) failed Secret Scan and Browser E2E. The latter stopped on a missing generated matrix, not guest assertions. Current local fixes are not retroactive CI success. Physical devices/AT/native zoom/IME/Khmer review, live providers/MySQL/public parity, rights, memory/latency and field CWV remain open.

There are {len(reports)} named topic reports plus this index. Compact selected management-only before/after images are in visuals/. Larger raw traces/logs/renderer screenshots stay local, with hashes and exact scope recorded. Backend-generated tracked reporting output is excluded and retained for review. No destructive rollback is performed.

{index}
''',encoding='utf8')
    changed=[]
    excluded_paths=[]
    raw_paths=subprocess.check_output(['git','ls-files','-m','-o','--exclude-standard','-z'],cwd=ROOT).decode('utf8').strip('\0').split('\0')
    for path in sorted(set(raw_paths)):
        if not path or path.startswith('output/'): continue
        p=ROOT/path
        if not p.is_file(): continue
        if path == 'security_best_practices_report.md' or path.startswith(('docs/phase12/','docs/qa/ux-overhaul/')):
            excluded_paths.append({'path':path,'sha256':digest(p),'reason':
                'Unrelated report appeared during execution; author/content not adopted, preserved without edits' if path == 'security_best_practices_report.md' else
                'Generated unit/browser fixture or screenshot; retained locally, not a publication candidate'})
            continue
        if p in {EVIDENCE/'changed-files.json', EVIDENCE/'evidence-validation.json', EVIDENCE/'publication-exclusions.json'}:
            continue
        changed.append({'path':path,'sha256':digest(p),'owner':'Codex Phase 13 revalidation','reason':
           'Audit/evidence/handoff and claim supersession' if path.startswith('docs/') else
           'Reproducible QA/evidence tooling' if path.startswith('scripts/') else
           'Generate existing source-derived fixture in the same browser CI job' if path.startswith('.github/') else
           'Source-backed Studio repair or meaningful regression coverage'})
    write('changed-files.json', {'files':changed,'self_hash_policy':'This file, exclusions and evidence-validation use the independent artifact hash manifest; no self-referential hashes.'})
    write('publication-exclusions.json', excluded_paths)
    # Validation excludes its own hash to avoid a self-referential digest.
    errors=[];files=[]
    for p in sorted(DOC.rglob('*')):
        if not p.is_file() or p.name=='evidence-validation.json':continue
        if p.suffix=='.json':
            try: read(p)
            except (ValueError,UnicodeError) as error:errors.append({'path':p.relative_to(DOC).as_posix(),'error':str(error)})
        if p.suffix=='.md':
            for target in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf8')):
                dest=target.split('#')[0]
                if dest and not re.match(r'^[a-z]+:',dest) and not (p.parent/dest).exists():errors.append({'path':p.relative_to(DOC).as_posix(),'missing':dest})
        files.append({'path':p.relative_to(DOC).as_posix(),'sha256':digest(p)})
    write('evidence-validation.json', {'errors':errors,'markdown_count':len(list(DOC.glob('*.md'))),'json_count':len(set(EVIDENCE.glob('*.json')) | {EVIDENCE/'evidence-validation.json'}),
          'gate_total':sum(counts.values()),'historical_count':57,'files':files,'command_log_hashes_all_valid':all(r['log_hash_valid'] for r in runs)})
    print(json.dumps({'reports':len(reports),'gate_counts':dict(counts),'validation_errors':len(errors),'runs':len(runs)}))
    if errors: raise SystemExit(1)


if __name__=='__main__':
    main()
