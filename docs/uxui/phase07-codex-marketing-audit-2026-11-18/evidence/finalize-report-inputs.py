"""Apply final evidence identifiers and documented findings to the report generator."""
from pathlib import Path

EV = Path(__file__).resolve().parent
p = EV / 'build-report.py'
s = p.read_text(encoding='utf-8')
for old, new in {
    'complete-phase07': 'delivery-phase07',
    'complete-combined': 'delivery-combined',
    'complete-user-unit': 'delivery-user-unit',
    'complete-user-lint': 'delivery-user-lint',
    'accepted-phase02': 'final-phase02',
}.items():
    s = s.replace(old, new)
s = s.replace('Fourteen reproduced local findings', 'Fifteen reproduced local findings')
s = s.replace('contact contrast/metadata, editorial typography', 'contact contrast/metadata/draft retention, footer clearance, editorial typography')
s = s.replace('?Missing output grammar.?', '`Missing output grammar`')
s = s.replace('?With no registry or lock, establish scope before a compliance claim.?', '“With no registry or lock, establish scope before a compliance claim.”')
s = s.replace('The user?s Phase07', "The user's Phase07")
s = s.replace('Contact ? Pricing ? Back', 'Contact → Pricing → Back')
s = s.replace("required=['delivery-phase07','complete-phase06','delivery-combined','complete-route-content','delivery-user-unit','delivery-user-lint','final-admin-unit','final-admin-lint','final-token']", "required=['delivery-phase07','complete-phase06','delivery-combined','complete-route-content','delivery-user-unit','delivery-user-lint','final-admin-unit','final-admin-lint','final-token','delivery-user-build','delivery-captures','delivery-contrast','delivery-modes','delivery-reverse-check','final-lab-before','final-lab-after']")
if "('M07-015'" not in s:
    s = s.replace("defs=[", "defs=[\n ('M07-015','P3','Fixed support launcher obscured the last Khmer footer credit','layouts/components/MarketingChrome.css','Let the last credit scroll clear','At the actual page bottom, the 320px Khmer credit overlapped the fixed support launcher in four WebKit/Firefox cases; two Chromium cases passed. Marketing-only bottom space now permits the full credit to scroll clear, including the safe-area inset.','footer credits remain readable above the support launcher'),")
s = s.replace('footer are covered by Phase07/06 fixtures.', 'footer are covered by Phase07/06 fixtures; page-end credit clearance is checked at 320/1440px in six projects.')
s = s.replace('Header discovery/create/login or signed-in Dashboard destinations', 'A fresh page-end check reproduced the fixed support launcher covering the Khmer credit in four WebKit/Firefox cases (Chromium passed). Marketing-only footer bottom space now clears the launcher; all six project cases pass. Matched page-end captures distinguish this from intermediate scrolling: ' + "{shot('home-_-footer-end-320-km-dark-reduce', 'before')} / {shot('home-_-footer-end-320-km-dark-reduce')}.\n\nHeader discovery/create/login or signed-in Dashboard destinations")
s = s.replace("{result('delivery-phase07')}. Extra edge cases: {result('delivery-phase07')}.", "{result('delivery-phase07')}.")
s = s.replace('CSS viewport/reflow checks are not relabeled as native zoom.', 'CSS viewport/reflow checks are not relabeled as native zoom. The [native zoom attempt](evidence/native-zoom-results.json) stopped before input: the owned Chromium window was listed, but get_window twice returned `window id 853142 no longer belongs to Chrome; current owner is Chrome`, including one fresh lookup/retry. Neither actual 200% nor 400% zoom was executed.')
s = s.replace("Default concurrency: {result('accepted-default-workers')}.", "Earlier default concurrency: {result('accepted-default-workers')}. Latest default concurrency: {result('final-default-workers')}. The latter failed the unchanged desktop shared-invitation Skip assertion after five seconds while the page still showed Loading template. Its trace/context is retained. Isolated original-assertion repeat: {result('skip-isolated-repeat')}. Resource-sensitive loading is a supported hypothesis, not proven root cause; the CI/default-worker gate stays open.")
s = s.replace('the final full suite contains 246 cases without changing old suites or timeouts.', 'that suite contained 246 cases. Six page-end footer-clearance cases bring the delivered matrix to 252 without changing old suites or timeouts.')
s = s.replace('The report\'s font list', "The report's font list")
s = s.replace('Additional read-only inspection used', 'Native zoom was attempted through the computer-use skill and @oai/sky on an owned headed fixture; the bridge failed before input after a fresh-window retry. Its exact result is in [native zoom evidence](evidence/native-zoom-results.json).\n\nAdditional read-only inspection used')

# Give every acceptance row explicit routes, command IDs and artifact references.
marker = "save('acceptance-f01-f20.json',gate_rows)"
extra = """gate_context={
 'F01':(['/','/contact','/venues','/venues/:id','/about','/help','*'],['complete-route-content','delivery-phase07'],['route-shell-inventory.json','route-state-matrix.json']),
 'F02':(['/'],['delivery-phase07','delivery-captures'],['before-manifest.json','after-manifest.json']),
 'F03':(['/','/contact','/venues'],['delivery-contrast','delivery-modes'],['computed-theme-contrast.json','asset-rights-ledger.json']),
 'F04':(['marketing header/footer'],['delivery-phase07','complete-phase06','footer-clearance-after'],['after-manifest.json']),
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
 'F16':(['Phase02/04/05/06/07 fixture routes'],['final-phase02','delivery-combined','complete-phase06','delivery-phase07','final-default-workers','skip-isolated-repeat'],['test-command-results.json']),
 'F17':(['protected auth/checkout/guest/Studio contracts'],['delivery-user-unit','final-admin-unit'],['source-preservation.json']),
 'F18':(['report package'],['evidence-validation'],['test-command-results.json','evidence-validation.json']),
 'F19':(['57 historical source/domain obligations'],['delivery-user-unit','delivery-combined'],['carryover-updated.json']),
 'F20':(['Phase08 identity/account handoff'],[],['../19-phase08-1-gemini-frontend-execution-handoff.md']),
}
for row in gate_rows:
    routes,command_ids,artifacts=gate_context[row['id']]
    row.update(routes=routes,testCommandIds=command_ids,evidenceArtifacts=artifacts)
"""
if 'gate_context={' not in s:
    s = s.replace(marker, extra + marker)
p.write_text(s, encoding='utf-8')

p = EV / 'verify-evidence.py'
s = p.read_text(encoding='utf-8')
for old,new in {'complete-phase07':'delivery-phase07','complete-user-unit':'delivery-user-unit','complete-user-lint':'delivery-user-lint','complete-combined':'delivery-combined','complete-captures':'delivery-captures','complete-contrast':'delivery-contrast','complete-modes':'delivery-modes','reverse-patch-after':'delivery-reverse-check'}.items():
    s=s.replace(old,new)
p.write_text(s,encoding='utf-8')
print('Updated report generator and package checks; no product source modified.')
