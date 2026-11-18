"""Generate the Phase 06 handoff from retained source and measured evidence."""
import json, re, subprocess
from command_log import read_command_log
from collections import Counter
from pathlib import Path
E=Path(__file__).resolve().parent; OUT=E.parent; ROOT=E.parents[3]
def read(name,default=None):
 p=E/name
 return json.loads(p.read_text(encoding='utf-8-sig')) if p.exists() else default
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()
def write(name,text): (OUT/name).write_text(text.strip()+'\n',encoding='utf-8')
source=read('source-snapshot.json',{});routes=read('route-shell-adoption.json',[])
closure=read('carryover-closure-ledger.json',{'entries':[],'phases':{}})
qa=read('qa-command-results.json',[]);render=read('renderer-visibility-review.json',{'rows':[],'zoom':[]})
special=read('special-mode-results.json',{'rows':[]});before=read('before-shell-probes.json',{'rows':[],'axe':[],'captures':[]});after=read('after-shell-probes.json',{'rows':[],'axe':[],'captures':[]})
assets=read('final-build-assets.json',{'records':[]});perf=read('performance-comparison.json',{});lab=read('lab-summary.json',{})
performance_verdict=read('performance-conclusions.json',{})
sha=git('rev-parse','HEAD');branch=git('branch','--show-current');remote=git('rev-parse','origin/main')
baseline='4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4'
production=git('log','-1','--format=%H','--','apps/frontend-user/src','apps/frontend-admin/src',':!**/*.test.*')
def log(row):
 return read_command_log(ROOT,row)
def result(row):
 text=log(row);clean=re.sub(r'\x1b\[[0-9;]*[A-Za-z]','',text)
 lines=[line.strip() for line in clean.splitlines() if re.search(r'\b(?:Tests|Test Files)\s+.*(?:passed|failed)|^\s*\d+\s+(?:passed|failed)\b|^Running \d+ tests|^\{.*(?:rows|samples|stage)',line)]
 return '<br>'.join(lines[-3:]).replace('|',' / ') or f"exit {row.get('exitCode','unknown')}"
def scoreboard():
 headings='| Phase | Closed verified | Closed N/A | Review | Blocked | Deferred | Status |\n|---|---:|---:|---:|---:|---:|---|\n'
 for p in (1,3,4,5):
  c=Counter(r['finalStatus'] for r in closure['entries'] if r['originatingPhase']==p)
  headings+=f"| {p:02} | {c['CLOSED — VERIFIED']} | {c['CLOSED — NOT APPLICABLE']} | {c['REVIEW REQUIRED']} | {c['BLOCKED — EXTERNAL']} | {c['DEFERRED — DOMAIN OWNER']} | PARTIALLY COMPLETE |\n"
 return headings
shell_counts=Counter(s for r in routes for s in r['shell'])
groups=sorted({(r['app'],r['group']) for r in routes})
primitive_routes=sum(bool(r.get('primitiveSources')) for r in routes)
axes=sum(len(r.get('violations',[])) for r in after['axe'])
clips=sum(bool(r['geometry']['horizontalClips']) for r in after['rows'])
special_pass=sum(r['status']=='FIXTURE VERIFIED' for r in special['rows'])
renderer_pass=sum(r['status']=='FIXTURE VERIFIED' for r in render['rows'])
commands_pass=sum(r.get('exitCode')==0 for r in qa);commands_fail=sum(r.get('exitCode') not in (0,None) for r in qa)
intro=f"Execution dates: **17–18 November 2026 (Asia/Bangkok)**. The dated directory retains its 17 November start. Starting `main` `{baseline}` matched fetched `origin/main`. Production changes are fixed at `{production}`; report generation observed `{sha}` on `{branch}`. Remote remains `{remote}`. Local commits only; no push, PR, deployment or production mutation."
limits="Physical Android/iOS/in-app clients, VoiceOver/TalkBack, native Khmer linguistic/diacritic review, native 200%/400% browser zoom, isolated MySQL/provider/catalog certification and field p75 CWV remain unverified. A browser fixture or zero axe result is not a universal WCAG certificate."
write('README.md',f'''# Phase 06 — global layout, navigation and responsive platform

**Implementation delivered; overall phase PARTIALLY COMPLETE for the explicit review and external/manual gates.** All repository-feasible reproduced shell defects were fixed, with the test/harness failures and remaining review questions retained. Phases 01/03/04/05 retain their own partial status; Phase 02 remains COMPLETE as an architecture specification. Phases 07–27 are not implemented by this change.

{intro}

The shipped changes give public/owner/admin menus consistent focus return, isolate the owner drawer with native modality, preserve search/typed data during preferences and route changes, restore public Back scroll, add authorized event/admin breadcrumbs, retain all Studio sections and dirty state in short landscape, respect emulated safe areas, improve auth appearance/reflow, and make both 404s readable in light/dark. New renderer artwork, dependencies and backend behavior are absent.

* Current inventory: **135 leaves = 111 customer + 24 admin**, **62 named groups / 63 app-group pairs**, zero unassigned leaves; ten dedicated renderer families, 38 static keys, two shared IDs and the callable internal fallback preserved.
* Current proof: full suites **1,494 customer / 202 admin** pass; complete route content sweep **270/270**; navigation matrix **132/132** across six projects; controlled Phase 04/05/06 **68/68**. Default ten-worker attempts returned **62 pass / 6 fail** and **61 pass / 7 fail** and remain REVIEW REQUIRED for host capacity. The final suite has 22 Phase 06 cases. See exact stages in [QA](16-exact-tests-commands-and-results.md).
* Responsive evidence: **{len(after['rows'])}** shell-width/locale/theme observations, **{clips}** horizontal clipped-control rows; **{len(after['axe'])}** selected axe scans, **{axes}** rule findings. Special modes: **{special_pass}/{len(special['rows'])}** verified. Renderer review: **{renderer_pass}/{len(render['rows'])}** current semantic/action observations, including headed Silk/Emerald.
* Performance: **{lab.get('sample_count','PENDING')}** controlled navigation samples; actual HTTP cache hits and initial request bytes are recorded. See [performance](15-performance-motion-and-payload-remeasurement.md). No field INP measured.
* Original Phase 02 suite remains **26 pass / 6 known fail**: two Khmer exact-copy contracts and one impossible short-landscape iframe ratio in each project. No old assertion was weakened.

{scoreboard()}

{limits}

Start with [source](01-source-reconciliation-and-baseline.md), [complete inventory](02-entire-project-shell-and-navigation-inventory.md), [carryover closure](11-cross-phase-carryover-closure-register.md), [open gates](18-open-gates-ownership-and-phase-status.md), [rollback](17-changed-files-security-preservation-and-rollback.md) and the [Phase 07 handoff](19-phase07-marketing-experience-execution-handoff.md). Evidence JSON and reproducible scripts are in [evidence](evidence/). Full binaries are local, ignored `output/playwright/uxui-phase06-2026-11-17/`; no unseen PNG is presented as a GitHub embed.
''')
write('01-source-reconciliation-and-baseline.md',f'''# 01 — source reconciliation and baseline

{intro}

The tree was clean before work. `git fetch origin main`, `git rev-parse HEAD`, `git rev-parse origin/main` and `git log -7 --oneline` confirmed the supplied baseline. No teammate work was reset. The Phase 05 history and dated reports remain immutable. The full invoking prompt was read from the user-supplied Downloads file; it authorizes this phase and local reviewable commits, not production activity or pushing.

Primary implementation skill: `koupreng-premium-ux`; supporting `koupreng-qa-release` and `playwright`. During native browser QA the active bundle was `koupreng-qa-release` with `playwright` and `computer-use`. Repository ROUTER, SKILLS_INDEX, CODEX, master Phase 06/global gates and Phase 05 primary handoff govern the work.

Installed versions, current branch/dirty state, selected component signatures and source hashes are in [source-snapshot.json](evidence/source-snapshot.json). Node is {source.get('node','unknown')}; React/Vite/Vitest/Playwright/axe versions are read from installed manifests, not assumed. Installed browser package revisions: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2; actual engine use is supported by executed projects and trace metadata.

Executed route factories produce 111 + 24 leaves. New shell inventory tests inspect inherited guards/layouts and the real lazy-loader targets without mounting authorization or initializing lazy pages. The AST graph scans {source.get('parsedFiles',0)} modules, with {source.get('unresolvedImports',0)} unresolved imports; the current {source.get('motionOwnerFiles',0)} interaction/motion-cue owners include route orientation's cancellable frame and the table's horizontal-key behavior. These are operational handlers, not new ambient loops. No route drift, registry drift or migration change was found; {source.get('migrationSqlFiles',0)} existing SQL migrations remain untouched.

Baseline proof was captured before product edits: 52 images with no page exceptions; 24 Phase 04/05 browser passes; 26/6 unchanged Phase 02; 15 customer and 8 admin focused unit passes. Initial new contract probes reproduced menu background-focus escape, missing destination focus and locale-scroll reset. Three early Studio failures were a wrong test field selector; the corrected baseline passed all three landscape reachability tests. The ledger preserves the distinction.
''')
write('02-entire-project-shell-and-navigation-inventory.md',f'''# 02 — entire project shell inventory

The [route JSON](evidence/route-shell-adoption.json) and [generated readable table](evidence/route-shell-adoption.md) account for every current leaf. Static redirects, conditional aliases/legacy editor branches and actual screens are distinguished. A route pattern is not an independent workflow and an import is not a behavioral pass.

| Declared shell / boundary | Source-mapped leaves (overlap allowed) |
|---|---:|
'''+ '\n'.join(f'| {k} | {v} |' for k,v in sorted(shell_counts.items()))+f'''

`MarketingShell` owns public discovery; template demo/guest routes are declared outside it. `AuthShell` wraps auth-owned visual pages. `HostShell` wraps guarded account/event routes, with explicit focused Studio and preview branches. `EventWorkspace` remains data/permission aware. `AdminLayout` owns operational pages, while guarded Template Studio is standalone. User/admin system and auth pages retain their own boundaries.

The executed JSX chain is authoritative: for example `/app/events/:eventId/preview` still declares HostShell → EventWorkspace, while HostShell omits HostNav for preview. It is not mislabeled as a completely unwrapped public route. Direct builder aliases with no inherited shell are `RedirectOnly`; their destination owns the actual workspace.

There are {len(groups)} app/group pairs. [Consumer graph](evidence/shell-consumer-graph.json) maps direct imports, literal dynamic imports and transitive component reach. All 46 Phase 04 entries are reconciled. {primitive_routes} leaves have a source-resolved registered primitive dependency; aliases are included and this count does not mean independently tested component states. Global support/feedback hosts are not silently counted as per-route domain adoption.
''')
write('03-global-experience-and-navigation-architecture.md','''# 03 — implemented navigation architecture

Public discovery, authentication, owner/account, authorized event tasks, admin operations and guest art have distinct responsibilities. Existing route guards and server authorization still decide access. Menus expose destinations; they grant no permission. Breadcrumb event names come only from the verified EventWorkspace response. Admin parents are stable Workspace → current destination; owner parents are My Events → verified event → current module.

```mermaid
flowchart LR
  Public[Public discovery] --> Guard{Existing route guard}
  Guard -->|anonymous| Login[Login with validated local next]
  Login --> Guard
  Guard -->|customer session| Events[My Events]
  Events --> Event[Authorized event workspace]
  Event --> Task[Exact module / existing entitlement checks]
  Task --> Studio[Focused authoring shell]
  Studio --> Frame[Independent trusted preview iframe]
  AdminLogin[Separate admin login] --> AdminGuard{RequireAdmin}
  AdminGuard --> Ops[Operational shell]
  AdminGuard --> AdminStudio[Standalone Template Studio]
  Guest[Published invitation / demo] --> Art[Renderer-owned gate and content]
```

No route, alias, role guard, entitlement or event-switch implementation was replaced. Existing unsaved-history protection continues to govern Link/navigation operations. Explicit event-scoped module paths and exact active matching remain. `/dashboard`/`/app` compatibility and `/admin/*` aliases retain parameters/query intent according to their existing redirect rules.

The existing customer ScrollToTop owner now separates document titles from navigation. Locale changes retain scroll and typed state; query/filter updates retain focus. Back restores bounded, in-memory positions by history key. New destinations orient to a ready management main region, while existing user focus inside a field/table wins over late alias/API readiness. Guests keep their own scroll/focus choreography. No second router scroll restorer was installed.

The final zero-scroll probe found a new restoration regression: an entry at zero could leave before a scroll event or ready-page frame, so Back borrowed the next page's offset. The first attempt failed five of six engine/motion observations. Recording only at readiness still missed fast navigation. The final effect records the entry immediately and after orientation, with the same 100-entry bound. Six focused observations then passed with a real 300px catalog offset, and the permanent suite gained a 22nd case. See history-zero-first-failure.json, history-zero-ready-only-attempt.json and history-zero-results.json.
''')
write('04-public-marketing-and-auth-shell-upgrade.md','''# 04 — public and authentication shell changes

`Header.jsx` now focuses the opening menu control before native modality. This repairs WebKit pointer-open → Escape focus return without changing its browser-owned background inertness. MarketingShell retains the canonical bilingual skip link; the duplicate Header skip link was removed after the first full suite caught an overly broad removal. Current-page anchors retain exact/prefix boundary semantics, and real mobile menu navigation orients to main content.

MarketingChrome protects fixed header top/inline padding with safe-area values after responsive shorthands. This is shell work; home storytelling, catalog art direction, venue content, pricing and contact redesign remain Phase 07/09. No new marketing assets or libraries were added.

AuthShell has a named focus target; AuthLayout adds the existing appearance control beside existing language buttons and labels both languages. Dynamic viewport height and safe-area padding replace assumptions about a tall phone viewport. The final small-screen top bar reserves two rows before fonts settle. The first measured build produced repeatable mobile auth CLS 0.0484 versus baseline 0.0062; a focused three-trial diagnostic reduced it to 0.0049 with reserved rows. The CSS fix was committed and rebuilt before the final series. See auth-layout-shift-diagnosis.json and performance-comparison.json for the measured production verdict. Browser tests type an address, change locale and keyboard-toggle appearance without losing the field or validated local return intent. Password/provider/session implementation is unchanged. Physical virtual keyboard behavior remains a device gate.

`safeAuthRedirect` and RequireAuth were inspected and retain their existing local destination allowlist, protocol-relative/backslash/encoded separator rejection and checking/error states. Anonymous deep-link tests assert the intended local path and absence of private workspace content. No successful browser redirect is interpreted as payment or entitlement success.
''')
write('05-owner-workspace-event-nav-and-drawer-upgrade.md','''# 05 — owner workspace and drawer

HostNav keeps the same links, labels and closed drawer DOM, including `inert` and `aria-hidden`. Its open drawer now uses native `<dialog>` modality so background controls cannot receive focus by script or keyboard. The existing Tab loop remains the only custom boundary loop. Original overflow is restored. Escape, close/backdrop, selected route, browser Back, desktop resize and unmount release the menu. The opening control receives focus before modality, which fixes WebKit restoration. On desktop resize the visible navigation peer receives focus rather than the now-hidden hamburger.

The new event breadcrumb uses authorized current event data and exact module labels. Existing event selection, permissions, revocation behavior, dirty-history guard and current event source are unchanged. Full unit tests retain viewer denial, event-switch clearing and revoked-draft retention contracts. New route tests verify the current Guests link, event ID and drawer return at phone width; the full leaf sweep includes all event modules and account aliases.

The 320px real-route drawer test covers forward/reverse Tab, programmatic background exclusion, Escape, normal backdrop click, 1440px resize, route change and Back. Locale/theme controls retain the current route and form/filter data. Header safe-area reservation grows with top insets so fixed chrome does not cover the task. Short drawer content remains scrollable with wrapped Khmer labels.
''')
write('06-admin-shell-sidebar-search-and-studio-layout.md','''# 06 — admin navigation and full-screen Studio

AdminLayout adds a stable bilingual Workspace breadcrumb and destination focus after an actual pathname change. Theme/locale changes do not run that focus effect. Header/sidebar controls explicitly focus their trigger before opening native dialogs, preserving WebKit return behavior. Existing filtered destination search, empty results, account role and guard checks remain. Safe-area padding is applied after mobile shorthands; menu content scrolls independently.

Template Studio keeps its own dark authoring chrome and an independent preview document. All five section buttons retain their current labels and `aria-pressed`; a named group and missing level-two editor heading repair semantics without new tab behavior. The mobile Edit/Preview switch sticks within the scrolling studio. Short-landscape buttons keep 44px targets. A measured notch failure showed the short-height padding shorthand overriding insets; the narrow CSS fix now preserves top/right/left/bottom safe-area values.

Tests use 844×390, 820×430 and 768×390: visit all five sections, type a fictional catalog value, keyboard-switch Preview/Edit, hit-test preview tools, load the real user iframe, reach outer scroll bottom, scroll the inner document and verify retained typed data. The frame need not occupy 95% of a viewport shorter than the frame itself. Existing separator arrows/Home/End and simple pointer buttons remain; the trusted Khmer new-tab action is activated with Enter and its exact 127.0.0.1:4173 destination is asserted.

Admin fixture builds set `VITE_USER_APP_URL=http://127.0.0.1:4173`. Origin/session/channel checks, sandbox policy, JSON preservation, immutable identity, conflicts and save authorization remain untouched. An early Canva sandbox storage exception came from the test initializer and was corrected there, without relaxing iframe security.
''')
write('07-responsive-safe-area-zoom-and-keyboard.md',f'''# 07 — responsive, safe-area, zoom and keyboard evidence

Six shell contexts × twenty-four widths × two locales × two appearances = **{len(after['rows'])} observations**. Widths: 320, 359/360/361, 375, 390, 414, 430, 479/480/481, 599/600/601, 767/768/769, 820, 1023/1024/1025, 1280, 1440, 1920. The baseline used nineteen widths / 456 observations; five added widths bracket the auth breakpoints. [Raw geometry](evidence/after-shell-probes.json) records focusable child bounds, scroll ranges, local fonts and actual drawer focus. Closed inert/dialog-hidden controls are excluded from clipping flags. Result: {clips} horizontal control-clip rows and no page exceptions. This is not merely a document scrollWidth check.

Portrait CDP insets are top 44/bottom 34; short-landscape insets are left/right 44/bottom 21 at 844×390. [Special modes](evidence/special-mode-results.json) verify computed padding and real hit targets, text spacing, long mixed-script names, forced colors and local font fallback. These are explicit browser emulations, not physical hardware.

Studio’s three short landscapes have scroll/reachability contracts in the browser suite. Normal/reduced motion, keyboard Enter, Tab/Shift+Tab/Escape and normal pointer/touch paths are exercised in named cases. Device emulation names do not substitute for the actual viewport set by each test.

Native zoom remains **BLOCKED / NOT TESTED**. Headed Playwright Control+Equal did not change measured DPR/innerWidth; the Windows computer-use bridge then rejected its returned owned Chrome window handle twice: `window id 1640326 no longer belongs to Chrome; current owner is Chrome`. No native input was issued after recovery failed. A fresh default-zoom baseline is retained in [native-zoom-results](evidence/native-zoom-results.json). CSS 320px reflow is not called native 400% zoom. OS text scaling, hardware keyboards, browser bars and real virtual keyboards require device QA.
''')
write('08-navigation-focus-and-accessibility-contracts.md',f'''# 08 — navigation focus and accessibility contracts

Public, owner and operational admin shells retain their canonical main skip links; authentication has a ready main focus target and no repeated navigation block. Exact active anchors use `aria-current`. Native dialogs isolate backgrounds and retain a coherent Tab boundary. Existing user Modal stack, inert restoration, Escape ownership, iframe handling and trigger return remain the component contract. No replacement focus manager was introduced.

New destinations focus ready main content; current input/table engagement takes precedence over delayed route orientation. This fixed a reproduced organization-table regression: the unchanged Phase 04 ArrowRight scroll test initially failed 2/5 repeats, then passed 5/5 after the orientation guard. No table assertion was weakened. Query-only updates and locale changes do not reset typing or scroll.

The baseline broad scan found countdown text at 4.38:1, a redundant Khmer name mismatch, and two Studio heading-order findings. Fixes use existing semantic warning roles, visible Khmer label naming and a missing section heading. Final shell scans: **{len(after['axe'])} scans / {axes} findings**. New auth and system-page scans, existing AU contrast tests and manual focus/hit checks provide additional bounded proof. Native Khmer terms and AT narration remain unapproved.

The final repeat found another table operability gap: the first native horizontal key could leave a still-focused scroll region at zero (8/10 original repeats passed). ResponsiveTable now handles unmodified Left/Right only when the overflowing region itself receives the key; child controls, modified shortcuts and vertical arrows retain their behavior. Its focused unit test and the unchanged original browser assertion then passed **20/20** repeats. No assertion, table role or caller API was weakened.

Named scrollable table regions, field descriptions, loading/disabled native buttons, persistent dismissible error toasts and server-owned status labels retain their full unit coverage and selected real consumers. Unused DataTable/FilterTabs declarations are not counted as runtime adoption. Specialized domain states are identified separately. Automated axe and geometry do not establish full WCAG 2.2 AA conformance.
''')
write('09-khmer-english-theme-and-typography.md','''# 09 — Khmer/English, theme and typography

Customer `data-color-mode` and admin `.dark` stores remain independent and mapped to existing canonical roles. No root reset, theme provider replacement or blanket renderer recolor was added. Auth reuses DisplayPreferences; admin Studio keeps `--ui-studio-*` chrome independently of its invitation iframe. Both 404s now use semantic foreground/background/action pairs and real main landmarks.

Each primary shell is captured in EN/KM and light/dark at the current width matrix. Special probes load local DM Sans, Kantumruy Pro and Moul via FontFaceSet, record declared family/range/status, then separately block font files and test fallback geometry. Temporary QA-only fontTools 4.68 parsed binary names, OS/2, variable axes and sample codepoints: DM Sans wght 100–1000, Kantumruy Pro 100–700, Moul static 400. Local OFL notices/hashes are retained in [local-font-metadata.json](evidence/local-font-metadata.json). No application dependency, font binary or license notice was changed. The shared/studio Kantumruy CSS still advertises 100–900; intended synthetic weights and native visual fidelity remain REVIEW REQUIRED before a separate normalization, while dedicated Silk/Floral already declares 100–700. Binary sample coverage is not native shaping/diacritic certification.

Long fictional Khmer/Latin event and venue strings, wrap and adverse text spacing are exercised. UI preference changes do not rewrite authored invitation language. No product Khmer terminology was replaced to satisfy the old Phase 02 expectations. Current continuation and preview-link behavior are positively tested; native copy/diacritic certification and exact-copy approval remain external gates.
''')
write('10-motion-renderer-boundary-and-visibility-review.md',f'''# 10 — motion, renderer boundary and visibility

Current registry identity is ten dedicated families / 38 static keys; `event-essential` and `koupreng-demo-wedding` remain shared identifiers. Exact slug/code/preset priority over ambiguous numeric IDs and the callable internal fallback are unchanged. Unknown public stable codes deliberately remain unavailable; a direct public fallback screenshot is not a missing route implementation.

[Renderer review](evidence/renderer-visibility-review.json): **{renderer_pass}/{len(render['rows'])}** bounded current observations. Headless cases cover each family at 390/1440, normal/reduced motion; headed Silk desktop and Emerald 320/390 include loaded/missing media and intermediate/settled frames. Text/name, computed opacity/visibility, hit stack, fonts, paints, image load and action outcomes are retained alongside screenshots. No renderer component, CSS, art, music or identity was edited.

Silk/Emerald current covers are painted and actionable in the sampled conditions. Silk’s long cover can put the main action below the first screenshot fold; scroll reachability is tested. Emerald’s current action text is visible with its accessible name. Its local demo seed intentionally has empty couple names, so the cover shows an ampersand; this is not a claim of complete authored-data rendering. Historical unpainted frames are not reproduced as a current product regression. Their exact original compositor/capture cause remains REVIEW REQUIRED for authored-data/device review, not falsely proven as one specific browser bug.

Other initial review flags were harness errors: Boilerplate needed a fictional catalog record and starts open by design; a generic button selector retargeted its map action; Canva’s sandbox exception came from unguarded test storage initialization; Celestial’s idle float required natural pointer entry before its finite hover state settled. Corrected checks preserve art and test normal actions. Boilerplate validates a focused, named map destination without contacting the external provider.

The shared silent Skip/reduced-motion path, cancellation and immediate admin values retain Phase 05 tests. Full authored family RSVP/map/calendar/audio-denial and real phone certification remain Phase 10/16 work. No universal theme, WebGL dependency or ceremonial reskin was introduced.
''')

write('11-cross-phase-carryover-closure-register.md',f'''# 11 — cross-phase carryover closure

The [human ledger](carryover-closure-ledger.md) and [JSON](evidence/carryover-closure-ledger.json) contain **{len(closure['entries'])} explicit entries** with originating phase, old claim/source, current observation, owner, affected consumers, reproduction/proof, fix, status, blocker, next action and source SHA. Historical dated reports are unchanged. Entries are scoped acceptance items; repeated cross-phase dependencies are counted within their originating phase and are not added up as unique bugs.

{scoreboard()}

Newly verified closure includes current route/shell binding and consumer reconciliation, all-leaf content smoke, drawer background/focus behavior, theme/form/query retention, local font/fallback/forced-color checks, responsive/Studio reachability, safe-area overrides, actual renderer paint/actions, current build hashes and fresh diagnostic performance review. Existing correct modal/action/status behavior is retained with contemporary unit/consumer proof.

Historical image-cause review, intended font weights, exhaustive specialized component permutations and native copy decisions remain review items. Binary font metadata was recovered with a temporary parser. Physical device/AT/native zoom, provider/MySQL/catalog and field data have exact owners and prerequisites. Route-specific domain variants are deferred only to their named Phase 07–25 owner; a reproduced shared shell defect is not hidden in that category. Phase 02 is still COMPLETE as architecture; its old red browser suite is a separate maintenance gate.
''')
write('12-qa-new-01-to-03-and-browser-instability.md','''# 12 — QA-NEW-01/02/03 and instability

The unchanged Phase 02 baseline reproduced **26 pass / 6 fail / 0 skip** with two workers and aligned preview origin. Each of the following occurs in both Chromium projects. The original test file and its support contract remain unchanged by this phase.

| ID | Old assertion | Current behavior and disposition |
|---|---|---|
| QA-NEW-01 | Khmer Next expects `បន្ទាប់` | Current `បន្ត` advances the wizard; fictional title persists in session draft recovery. Native terminology approval is absent. Keep the original red contract until product/copy review approves a separate patch. |
| QA-NEW-02 | Preview name expects `បើកគំរូធៀបក្នុងផ្ទាំងថ្មី` | Current `បើកគំរូសំបុត្រអញ្ជើញក្នុងផ្ទាំងថ្មី` is named, focused and activated with Enter; the new tab uses the trusted fixture user origin. Do not loosen to an arbitrary link. Native wording review remains open. |
| QA-NEW-03 | A ~583px frame must be 95% visible in 390px-high landscape | The old ratio is inappropriate for a scroll-based workbench. Separate stronger tests verify all section controls, hit targets, outer/inner scroll, keyboard Edit/Preview and dirty value retention at three short landscapes. The old file remains red pending distinct QA maintenance approval. |

The first new Studio tests selected a field from the wrong section; corrected baseline cases passed all three landscapes without product edits. The first full unit run caught two missing shell skip-link tests; the canonical shell link was restored and its duplicate Header link removed. A later table repeat found delayed destination focus after an alias redirect stealing table focus; the product guard now respects an already-engaged field/table, and the unchanged old table assertion passed five repeats.

WebKit exposed six genuine trigger-return failures plus two test assumptions about pointer focus on theme buttons. Focus is now set before opening native dialogs; keyboard theme retention is tested explicitly. All eight focused cases then passed, followed by the full six-project matrix. No old assertions were weakened or force-clicked.

The final unit pass first exposed an existing media-test race: a category button exists before assets load. The test now awaits the same asserted filename; focused 3/3 and full 1,494/1,494 pass. A 131/132 matrix attempt then tried to scroll before the lazy home was ready; its corrected test requires the actual heading, settled fonts/frames and a scroll range above 500px. Five focused WebKit repeats and the final 132-case matrix passed. A duplicate matrix accidentally overlapped the resumed verification sequence and shared preview ports: it returned 129/132, including a connection refusal while the server owner changed, a teardown timeout and a Silk mobile-WebKit hit-test timeout. Those logs remain retained; they are not counted as a separate isolated run. The normal-click geometry diagnosis is recorded in [renderer-hit-diagnosis.json](evidence/renderer-hit-diagnosis.json). This overlap is a verification orchestration error, and the final lab/probe sequence runs serially after all browser suites close. The Silk timing result remains bounded runner/rendering review rather than a fabricated universal paint verdict.

One controlled run had `net::ERR_NO_BUFFER_SPACE`; its trace is retained. Fixture scenarios were separated into independent tests/contexts instead of accumulating initializers. With preview origin aligned to `127.0.0.1:4173`, the earlier 21-case suite passed 66/66 at both controlled and default worker counts. The final 22-case suite expands the controlled comparison to **68/68**. Its default ten-worker attempts returned **62/68** and **61/68**, with varying navigation/action timeouts at the unchanged 30-second test budget. The monitored attempt reached **97% CPU, under 865 MiB free physical memory, 75 headless processes and 8.20 GiB summed browser working sets** (shared pages can be counted more than once). Correlation supports host-pressure review; it does not prove every timeout's exact source. See concurrency-host-metrics.json and retained traces. The shared table key gap was separately reproduced at two workers and fixed; its unchanged assertion passed 20/20, while Studio passed 10/10 focused repeats. Default configuration and old tests remain unchanged. A dedicated-runner recheck remains REVIEW REQUIRED; the explicit two-worker comparator is not disguised as a default pass. Main-page fixture seeds no longer initialize sandboxed child storage. Performance harness cache/readiness/origin corrections and interrupted attempts remain archived.
''')
group_table='| App | Group | Leaves | Shells / boundaries | Primitive-source leaves |\n|---|---|---:|---|---:|\n'
for app,group in groups:
 entries=[r for r in routes if r['app']==app and r['group']==group]
 group_table+=f"| {app} | {group} | {len(entries)} | {', '.join(sorted({s for r in entries for s in r['shell']}))} | {sum(bool(r.get('primitiveSources')) for r in entries)} |\n"
write('13-component-consumer-and-route-adoption-matrix.md',f'''# 13 — consumer and route adoption

{len(routes)} current leaves / {len(groups)} app-group pairs; all have an accurate declared shell, access authority, primary domain phase and relevant state contract. The full [leaf ledger](evidence/route-shell-adoption.md) and [JSON](evidence/route-shell-adoption.json) include executed shell/leaf bindings, resolved lazy modules, dependency closure and primitive-source membership. The [graph](evidence/shell-consumer-graph.json) reconciles all 46 component register entries. Aliases are labeled; source mapping is not a claim of independent state certification.

{group_table}

The complete 270-case route sweep verifies current fictional content on desktop/mobile Chromium for every declared pattern, including aliases. It does not turn a redirect into a separate workflow or verify every role/error/payment mutation. Component-specific behavioral proof is only the named unit/browser tests. Unused AdminUI FilterTabs/DataTable declarations have no current production use; they are not presented as adopted tabs or tables. Specialized editors, media, charts, print, export, bulk selection and domain state completeness retain the phase owner in the ledger.
''')
write('14-before-after-visual-evidence.md',f'''# 14 — before/after evidence

[Before manifest](evidence/before-manifest.json), [after manifest](evidence/after-manifest.json), [capture diff](evidence/capture-diff.json) and [renderer review](evidence/renderer-visibility-review.json) are portable metadata. Full PNGs/builds/traces live under ignored `output/playwright/uxui-phase06-2026-11-17/`; they are not embedded as unseen GitHub images. Each retained capture records fixture, route, source SHA, viewport, locale/appearance, browser, motion and stage. Final primary capture records also include a production-source tree hash.

The primary matched set is 52 before + 52 after images. It includes home/catalog/auth, owner create/dashboard/guests/RSVP, admin login/dashboard/users/Studio and all ten renderer representatives plus the shared identifiers. A Date-only override fixes fictional dates without replacing the native performance clock. Additional 96 shell images per stage cover EN/KM light/dark at 320/390/768/1440; their native wall clocks can differ and are not treated as exact pixel-parity proof.

Action-state images include mobile menus, system recovery, special safe-area/forced-color/text/font states and three renderer stages. The meaningful verdict uses actual labels, font status, child geometry and action activation alongside the image; a pixel percentage alone cannot prove visibility or accessibility. Header clock/countdown or moving ornament differences are classified separately from missing content.

[Manual image review](evidence/visual-review.json) names the six actually viewed images and their hashes: mobile auth/Studio, before/after RSVP, headed Silk desktop and Emerald 320px. The Silk action is painted near the lower edge and is reachable by normal scrolling/click; the image is not described as fitting every cover element above the fold. Existing provider-unavailable auth fixture copy is not native linguistic or full error-state certification.

Reproduce with `capture-visual.mjs after`, `probe-shells.mjs after`, `probe-special-modes.mjs` and `review-renderers.mjs`. Before capture requires an unchanged isolated checkout at `{baseline}`; the script refuses to overwrite baseline provenance from changed product source. Do not rebuild current code and label it “before.” Use a separate worktree/checkout and preserve captured fixture origins.
''')
asset_table='| Stage | App | Files | Raw bytes | Gzip bytes | Asset-list SHA-256 |\n|---|---|---:|---:|---:|---|\n'
for r in assets['records']:asset_table+=f"| {r['stage']} | {r['app']} | {r['assetCount']} | {r['rawBytes']} | {r['gzipBytes']} | `{r['assetListSha256']}` |\n"
history_table='| Historical condition | Metric | Final before → after median | Delta | Final three-trial verdict | Final five-round verdict |\n|---|---|---:|---:|---|---|\n'
for row in performance_verdict.get('historicalSixConditions',[]):
 c=row['condition'];condition=f"{c['surface']} {c['width']} {c['motion']} {c['cache']}"
 for metric,series in row['metrics'].items():
  current=series['finalThreeTrials'];repeated=series['finalFiveAlternatingTrials'];b=current['before']['median'];a=current['after']['median'];delta=current['delta']
  history_table+=f"| {condition} | {metric} | {round(b,1) if b is not None else 'missing'} → {round(a,1) if a is not None else 'missing'} | {round(delta,1) if delta is not None else 'missing'} | {current['verdict']} | {repeated['verdict']} |\n"
trigger_table='| Final condition | Metric | Delta | Before range | After range |\n|---|---|---:|---|---|\n'
for row in perf.get('currentReviewTriggers',[]):trigger_table+=f"| {row['surface']} {row['width']} {row['motion']} {row['cache']} | {row['metric']} | {round(row['delta'],4)} | {row['beforeRange']} | {row['afterRange']} |\n"
if not perf.get('currentReviewTriggers'):trigger_table='No final diagnostic budget flags. This is a local comparison, not a field performance certificate.'
repeat_table='| Five-round condition | Metric | Delta | Percent | Before range | After range |\n|---|---|---:|---:|---|---|\n'
for row in performance_verdict.get('finalFiveRoundReview',{}).get('currentTriggers',[]):repeat_table+=f"| {row['surface']} {row['width']} {row['motion']} {row['cache']} | {row['metric']} | {round(row['delta'],4)} | {round(row['percent'],2)}% | {row['beforeRange']} | {row['afterRange']} |\n"
write('15-performance-motion-and-payload-remeasurement.md',f'''# 15 — performance, motion and payload remeasurement

The current series uses the unchanged final Phase 05 baseline and final Phase 06 production builds. [Build inventory](evidence/final-build-assets.json) gives every JS/CSS hash and emitted totals. [Lab summary](evidence/lab-summary.json) and [performance comparison](evidence/performance-comparison.json) distinguish navigation resources, cache hits, LCP element/render state, CLS, long tasks, initial request bytes and variability. Raw samples remain local in `output/playwright/uxui-phase06-2026-11-17/lab-results.json`.

Protocol: Chromium 156.0.8078.4, loopback fictional HTTP API/static server, DPR 1, 390×844 / 1440×900, normal/reduced, CDP CPU 2×, 20ms latency, 10Mbps down / 5Mbps up, at least three observations per condition. Actual HTTP caching is enabled: first navigation in a new context is cold, second is warm, with browser cache-hit events recorded. The server’s API mocks fail unknown reads/mutations closed and CSP excludes external resources. Its local uncompressed transfer timing is not a production CDN model.

This corrects a historical methodology limit: [Playwright documents that request routing disables HTTP cache](https://playwright.dev/docs/api/class-page#page-route). Mocks were moved out of page.route into a loopback fixture server. The smoke check recorded zero cold hits and 27 warm hits on home. Therefore older “warm” routed series are historical navigation comparators, not equivalent actual-cache measurements; no causal subtraction is claimed across the changed method.

The Date-only override preserves native performance entries. Screenshots consume a paint; no Playwright fixed clock erases navigation/paint/resource observations. A wrong editor readiness selector caused rejected first-attempt samples, and an interrupted before-only series is archived rather than blended into the final restarted comparison.

Current sample count: **{lab.get('sample_count','PENDING')}**; unresolved measurement errors: **{lab.get('error_count','PENDING')}**. Review budgets require BOTH >100ms and >20% for load/FCP/LCP, BOTH >20KiB and >10% for transfer, or CLS increase >0.02. These are local diagnostic change budgets, not field CWV thresholds. The six historical condition groups are listed individually in performance-comparison: cinematic desktop normal warm load/FCP; four create-event LCP conditions; RSVP mobile normal warm LCP — seven metric triggers in six groups.

{history_table}

The earlier post-safe-area 624 series and its **220-observation five-round alternating-stage follow-up** are retained in `performance-comparison.pre-auth-shift.json` and `performance-diagnostic-review.pre-auth-shift.json`; their raw samples remain local. The follow-up had **{len(performance_verdict.get('preAuthDiagnosticTimingTriggers',[]))} timing budget flags**. The repeatable mobile auth CLS increase was isolated to toolbar reflow: 0.0062 baseline → 0.0484 first implementation → 0.0049 reserved-row diagnostic. Commit `db428514` applied that fix. The later zero-scroll correction required another final build: **all 312 final-after observations were resampled**, while the already validated 312 observations of the unchanged baseline were retained with their original command windows. This forms the current 624-observation matched-condition matrix; it is not described as 624 newly executed post-fix navigations. [Conclusions](evidence/performance-conclusions.json) records actual final auth values and every historical metric verdict. One premature attempt was stopped after an admin build-origin mismatch was found; it is not blended into the current series. Missing observations from transient navigation/readiness timeouts are retried as complete cold/warm pairs with the original attempt archived.

Final diagnostic review flags (if any) remain explicit below. Overlapping ranges and an unstable three-sample median do not prove a source regression; these require targeted causal review rather than a fabricated performance pass.

A separate **{performance_verdict.get('finalFiveRoundReview',{}).get('samples',0)}-observation final-source follow-up**, in [performance-diagnostic-review.json](evidence/performance-diagnostic-review.json), alternates before/after over five rounds for every final trigger dimension and the six historical groups. It has {len(performance_verdict.get('finalFiveRoundReview',{}).get('currentTriggers',[]))} repeat budget flags; raw observations are separate from the 624 matrix. [Resource-window diagnosis](evidence/resource-window-diagnosis.json) compares unchanged static media hashes and completion/cache windows for any transfer flags; existing media arriving in a different snapshot is not newly emitted application code.

{repeat_table}

The RSVP LCP candidate is the same visible `.rsvp-count-context` paragraph, with the same text/font and 59 warm cache hits, and no recorded long tasks in the five-round samples. The primary invitation-editor flag did not repeat, while the five-round RSVP flag remains. [RSVP paint diagnosis](evidence/rsvp-paint-diagnosis.json) separately records content/font readiness, actual LCP entries, candidate bounds/ancestors and the effect of consuming earlier frames. This capture-scheduling experiment is not blended into either comparison and does not by itself prove a field or source regression. The timing gate remains REVIEW REQUIRED.

The [24-observation supplemental review](evidence/rsvp-paint-review.json) found no LCP change-budget flag in either scheduling mode. Warm median deltas were +16ms with the primary snapshot and −16ms with earlier consumed frames. Variable paint times occur in both builds; the original five-round +264ms / +41.51% RSVP result remains visible, with no asserted causal fix or production performance certificate.

{trigger_table}

{asset_table}

All emitted chunks are not initial page payload. Resource transfer and cache state are measured separately. Historical final Phase 05 user raw total 4,182,623 B is reproduced; minor admin gzip/hash differences from historical reports are qualified by the aligned preview build origin. Current source introduces no dependency or art/media asset.

Local interaction/frame observations, if available, are in [interaction-profile.json](evidence/interaction-profile.json) and explicitly include automation/profiling overhead. No no-interaction navigation series measures INP. Field p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 remain future production targets, not a certificate. Physical low-end GPU/radio behavior, media decode cost and actual user p75 require approved device/field measurement.
''')
qa_table='| ID | Exact command | Exit | Actual output summary |\n|---|---|---:|---|\n'
for row in qa:
 cmd=row['command'].replace('|','\\|').replace('\n',' ')
 qa_table+=f"| {row['id']} | `{cmd}` | {row.get('exitCode','unknown')} | {result(row)} |\n"
write('16-exact-tests-commands-and-results.md',f'''# 16 — exact commands and results

[Machine ledger](evidence/qa-command-results.json) stores exact commands, stage/source SHA, duration, exit and log path. **{commands_pass} recorded commands exited 0; {commands_fail} recorded commands exited nonzero** at generation. These include baseline failures and corrected harness/test attempts; exit 0 alone is not semantic acceptance when a script reports review rows. No failure is removed to present an all-green history. Early PowerShell array serialization lost metadata; exact commands/output were recovered from retained logs/transcript, and original missing start/duration fields are explicitly not invented.

{qa_table}

The reader decodes both Windows PowerShell UTF-16 Tee-Object logs and UTF-8 logs, so output summaries and count validation use actual text. One early failed `final-after-capture` command retains its original exit-1 metadata, but its referenced stdout file is absent. Its JSON explicitly marks output NOT AVAILABLE; no output or successful result was reconstructed. The separately repaired and final capture commands retain their own logs and source hashes.

Full suite totals differ from Phase 05’s 1,491/201 by three customer tests (Khmer name contract, executed shell binding and scoped table keyboard behavior) and one admin shell-binding test: 1,494/202. Historical files are not counted as fresh evidence. Original Phase 02 known red remains 26/6. Intermediate failures include two missing skip links, three wrong Studio selectors, late table focus, zero-scroll history, first horizontal-key handling, WebKit pointer-return behavior, sandbox initializer access, generic starter action selection and a short-landscape safe-area override. Their fixes and reruns are identified in reports 03/07/08/10/12. Unit stderr includes existing Happy DOM iframe-loading-disabled / refused localhost:3000 messages; assertions pass, and real iframe behavior is tested separately in Playwright. These messages are not silently treated as successful backend requests.

Read-only investigation also included `git branch --show-current`, `git status --short`, `git rev-parse HEAD`, `git fetch origin main`, `git rev-parse origin/main`, `git log -7 --oneline`, targeted `rg` / `Get-Content`, `Get-Command npx`, `node --version`, `npm --version`, fontTools availability, browser manifests, loopback `netstat` and owned-process inspection. Some guessed file paths/Windows glob syntax and an early Python quote command failed; corrected explicit paths/here-strings were used. The capture tree-hash script initially encountered Git-quoted Khmer filenames and was fixed with NUL-delimited `git ls-files -z`. The native zoom tool failures are retained as an environmental limit, not a pass.

Both build origins are local. No real credential, backend/provider transaction, database mutation, outbound notification, CI/deployment or field certification is implied. Full backend/Telegram suites were not run for this frontend shell change; source boundaries were preserved and inspected. See [open gates](18-open-gates-ownership-and-phase-status.md).
''')
changed=git('diff','--name-only',baseline,'--','apps/frontend-user/src','apps/frontend-admin/src','.gitignore','scripts/qa/phase06ShellInventory.mjs','apps/frontend-user/playwright.phase06.config.js','apps/frontend-user/tests/e2e/phase06-layout-navigation.spec.js','apps/frontend-user/tests/e2e/support/phase06Fixtures.js').splitlines()
write('17-changed-files-security-preservation-and-rollback.md',f'''# 17 — changes, preservation and rollback

{intro}

The committed application/test delta from baseline is:

'''+ '\n'.join(f'* `{file}`' for file in changed)+'''

No backend source, Flyway SQL, upload protection, API contract, auth guard/allowlist, payment/settlement/entitlement/currency calculation, guest token/RSVP policy, publication ownership, draft serializer/conflict rule, trusted preview origin/session protocol, template registry, renderer art/font/media or dependency manifest changed. Existing server-owned statuses remain authoritative. USD and KHR were not mixed. A redirect never means PAID. Fixtures reject live writes and use fictional identities only.

Implementation commits: `4b39fb18` (navigation/shells), `e0ce7728` (safe-area cascade), `13fb564e` (Studio short-landscape insets), `db428514` (font-settled mobile auth toolbar), `595091fa` / `ec39af0d` (zero-entry and fast-navigation history recovery, with a permanent regression case), `3a020044` (scoped table horizontal keys and regression unit). Tests/source-binding collector: `7d98ba9b`, `21520b56` (sandbox/starter fixture correction), `6bfc10a5` (main-document fixture authority), `fefe5f62` (wait for media assets), `e0a331ff` (wait for home content before testing scroll). The final evidence commit is identified in the delivery reply. No commit was pushed; origin/main remains the starting SHA.

Rollback is a reviewed `git revert` of this phase’s commits in reverse chronological order, preserving any later teammate work. After the evidence commit, revert `e0a331ff`, `fefe5f62`, `3a020044`, `ec39af0d`, `595091fa`, `6bfc10a5`, `db428514`, `21520b56`, `13fb564e`, `e0ce7728`, `7d98ba9b`, then `4b39fb18`; inspect each resulting diff and rerun token parity and affected tests. Do not reset hard, force-push, revert a migration or remove unrelated assets. Keep the phase output ignore rule if local binaries remain. No database rollback is required because no schema/data changed.
''')
open_rows=[r for r in closure['entries'] if r['finalStatus'] not in ('CLOSED — VERIFIED','CLOSED — NOT APPLICABLE')]
open_table='| ID | State | Owner | Reproducible next action |\n|---|---|---|---|\n'+'\n'.join(f"| {r['id']} | {r['finalStatus']} | {r['owner']} | {r['nextAction']} |" for r in open_rows)
write('18-open-gates-ownership-and-phase-status.md',f'''# 18 — open gates and independent phase status

Phase 06’s shipped source and automated browser scope are implemented. The overall phase remains **PARTIALLY COMPLETE** pending the review and manual/external conditions below; this is not a production release certificate. Phases 01/03/04/05 are independently **PARTIALLY COMPLETE** under their own original definitions. Phase 02 is **COMPLETE as architecture** with known-red browser maintenance debt. Phases 07–27 are **NOT STARTED by this task**.

{scoreboard()}

{open_table}

{limits}

Native zoom attempted through the desktop bridge failed twice on an owned returned Chrome handle; no guessed window or user authentication dialog was used. Actual 200/400% and OS scaling are separate from emulated reflow. Font binary metadata is now recorded; native glyphs and intended weights still need visual approval. Live data/provider checks require isolated authorized resources, never production mutation. No optional owner calendar, general CMS, live AI, booking or refunds were authorized or implemented.
''')
write('19-phase07-marketing-experience-execution-handoff.md',f'''# 19 — Phase 07 marketing handoff

**Planning handoff only. No Phase 07 production implementation occurred.** Begin from the final delivered local Phase 06 SHA, reconcile current main/origin and uncommitted teammate work, read the master Phase 07 scope and this phase’s open-gate ledger. The 17 November directory records work completed across 17–18 November; it does not supersede the older dated phases.

Phase 07 owns public home/storytelling, navigation content/discovery, contact/help/about aliases, venue discovery/detail, footer and SEO content. Current marketing leaves are mapped in route-shell-adoption.json; aliases `/about` and `/help` still resolve to contact and must not be called new content pages. Catalog/pricing decision redesign remains Phase 09 where the scope requires it. Venues remain static discovery, not live booking inventory.

Preserve the shipped mobile native dialog/focus return, one canonical skip link, safe-area padding, current route/Back scroll behavior, EN/KM stores, canonical tokens, auth return intent and all role/server boundaries. Keep guest renderers outside marketing chrome and retain each renderer identity. Do not adopt a new global reset/theme/focus manager, ambient route curtain or unreviewed art/library.

Before work: enumerate the real source route/layout/component graph; capture fixed fictional before states at 320/390/768/1440 and short landscape in both languages/modes; record authorship and exact rights for every proposed visual. Define a distinct editorial direction around clear Browse Templates / Create Invitation journeys and truthful product proof. Do not invent testimonials, inventory, metrics, prices, booking or providers.

Implement reviewable vertical slices: public wayfinding/CTA hierarchy; home narrative and template entry; responsive venue/contact/error recovery; footer/metadata. Verify real anchors, keyboard/pointer, modal Escape/return, long Khmer, focus/contrast, safe area and reflow. Typed contact data and locale/theme changes must survive. Keep domain backend and optional feature approval boundaries explicit.

Run both route factories, relevant/full frontend suites as blast radius requires, lint/build/token parity, Phase 04/05/06 regressions and current route content smoke. Preserve the six known Phase 02 failures until native copy/QA approval; never lower iframe ratios or loosen link-name assertions to get green. Reuse current native-performance-clock and cache-valid fixture-server method. Compare actual initial request bytes separately from emitted assets and retain variability; do not claim field INP from navigation loads.

Exit/handoff: all affected routes/states accountable; meaningful before/after captures and semantics; truthful English/Khmer content review state; no new unexplained shell/component failure; exact commands and performance caveats; named device/AT/native zoom/catalog/provider owners; source-specific rollback. Use [open gates](18-open-gates-ownership-and-phase-status.md) and [carryover JSON](evidence/carryover-closure-ledger.json) as dependencies, not completion proof.
''')
print(json.dumps({'reports':len(list(OUT.glob('*.md'))),'routes':len(routes),'closureEntries':len(closure['entries']),'sourceSha':sha}))
