"""Assemble the review evidence without credentials or live records."""
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
OUT = Path('D:/Koupreng-UXUI-Phase4')
BASE = 'fd20522227a12296dc841ea8f33c2ec6b92a298c'

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True, encoding='utf-8').strip()

def save(name, value):
    target = OUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) if not isinstance(value, str) else value, encoding='utf-8')

def log_text(name):
    data = Path('D:/' + name).read_bytes()
    return data.decode('utf-16' if data.startswith(b'\xff\xfe') else 'utf-8', errors='replace')

head = git('rev-parse', 'HEAD')
branch = git('branch', '--show-current')
files = git('diff', '--name-only', BASE, 'HEAD').splitlines()
save('metadata/source-changes.json', {'baseline': BASE, 'head': head, 'branch': branch,
    'files': [{'path': name, 'sha256': hashlib.sha256((ROOT / name).read_bytes()).hexdigest()} for name in files if (ROOT / name).is_file()]})
save('metadata/git-commits.md', '# Local Phase 4 commits\n\n```text\n' + git('log', '--reverse', '--format=%h %s', BASE + '..HEAD') + '\n```\n\nNo push or deployment performed.\n')

tests = [
    ('Baseline frontend', 'npm test -- src/features/events/workspace src/features/guests src/features/invitations/InvitationDeliveryManager.test.jsx src/features/events/components/EventCard.test.jsx', 53, 0, 'Koupreng-Phase4-baseline-tests.log'),
    ('Baseline navigation', 'npm run test:e2e -- tests/e2e/phase3-navigation.spec.js --project=desktop-chromium --workers=2', 14, 0, 'Koupreng-Phase4-baseline-browser.log'),
    ('Full frontend suite', 'npm test -- --maxWorkers=2', 656, 0, 'Koupreng-Phase4-final-unit-3.log'),
    ('Final affected components', 'npm test -- src/features/invitations/InvitationDeliveryManager.test.jsx src/features/invitations/mediaLibraryModel.test.js src/features/seating src/features/guests src/shared/ui/Modal.test.jsx', 60, 0, 'Koupreng-Phase4-unit-verified.log'),
    ('Cover integration and workspace components', 'npm test -- src/features/events/workspace src/features/invitations/mediaLibraryModel.test.js src/features/invitations/InvitationDeliveryManager.test.jsx', 17, 0, 'Koupreng-Phase4-cover-unit.log'),
    ('Broad desktop/mobile regression', 'npm run test:e2e -- tests/e2e/phase3-navigation.spec.js tests/e2e/phase4-workspace.spec.js tests/e2e/guest-workspace.spec.js tests/e2e/phase2-operations.spec.js --workers=2', 71, 1, 'Koupreng-Phase4-regression-2.log'),
    ('Final Phase 4 desktop/mobile', 'npm run test:e2e -- tests/e2e/phase4-workspace.spec.js --workers=2', 28, 0, 'Koupreng-Phase4-browser-verified.log'),
    ('Final cover flow and Phase 4 desktop', 'npm run test:e2e -- tests/e2e/phase4-workspace.spec.js --project=desktop-chromium --workers=2', 15, 0, 'Koupreng-Phase4-browser-cover.log'),
]
results = []
for name, command, passed, skipped, filename in tests:
    text = log_text(filename)
    assert re.search(rf'\b{passed} passed\b', text), filename
    # Pass summaries and stack traces from successful synthetic runs only; remove terminal escapes.
    text = re.sub(r'\x1b\[[0-9;]*m', '', text)
    text = re.sub(r'Bearer\s+[A-Za-z0-9._-]+', 'Bearer [REDACTED]', text)
    save('logs/' + filename, text)
    results.append({'name': name, 'command': command, 'passed': passed, 'failed': 0, 'skipped': skipped, 'log': 'logs/' + filename})

backend_log = log_text('Koupreng-Phase4-backend-certified.log')
assert 'Tests run: 65, Failures: 0, Errors: 0, Skipped: 0' in backend_log
assert 'Maven process exit code: 0' in backend_log
backend_summary = '\n'.join(line for line in backend_log.splitlines() if line.startswith('[INFO]') and any(key in line for key in ['Running com.', 'Tests run:', 'BUILD SUCCESS', 'Total time:', 'Finished at:']))
save('logs/backend-test-summary.log', backend_summary + '\nMaven process exit code: 0\n')
results.append({'name': 'Backend contracts and architecture', 'command': ".\\mvnw.cmd '-Dtest=EventDraftPersistenceTests,GuestServiceTests,SeatingServiceTests,RsvpServiceTests,InvitationDeliveryServiceTests,MediaServiceTests,ArchitectureRulesTests' test; exit $LASTEXITCODE", 'passed': 65, 'failed': 0, 'skipped': 0, 'database': 'isolated H2 in MySQL compatibility mode; no live database', 'log': 'logs/backend-test-summary.log'})
for name, filename in [('Lint', 'Koupreng-Phase4-lint-final.log'), ('Build', 'Koupreng-Phase4-build-release.log'), ('Skills integrity', 'Koupreng-Phase4-skills.log'), ('Routing', 'Koupreng-Phase4-routing.log'), ('Geometry', 'Koupreng-Phase4-geometry-final.log')]:
    save('logs/' + filename, log_text(filename))
    results.append({'name': name, 'status': 'passed', 'log': 'logs/' + filename})
save('metadata/test-summary.json', {'runs': results, 'note': 'Runs overlap; do not add their counts. The full 656-test suite preceded the final cover mapping; 17 affected component tests and 15 browser scenarios verify that follow-up.'})

columns = [('name', 'guestName', 'String', 'guest_name'), ('phone', 'phone', 'String', 'phone'), ('email', 'email', 'String', 'email'), ('count', 'seatCount', 'Integer', 'seat_count'), ('group', 'guestGroup', 'String', 'guest_group'), ('category', 'sideType', 'String', 'side_type'), ('companionName', 'companionName', 'String', 'companion_name'), ('seat', 'tableNumber', 'String', 'table_number'), ('note', 'note', 'String', 'note')]
save('metadata/guest-form-field-matrix.json', {'createAndEdit': [{'form': form, 'requestAndResponse': dto, 'entityType': type_, 'column': column, 'create': True, 'edit': True, 'notes': 'Non-wedding form only; weddings use Seating' if form == 'seat' else 'Optional' if form in ['phone', 'email', 'companionName', 'note'] else ''} for form, dto, type_, column in columns], 'preservedOutsideEditableForm': ['contributionStatus', 'totalContributed', 'sendStatus'], 'serverOwned': ['id', 'invitationId', 'inviteToken', 'qrCodeUrl', 'RSVP relation', 'delivery timestamps'], 'unsupported': 'No independent guest-code column was added. Existing QR identity remains server-owned.'})

def luminance(value):
    channels = [int(value[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in channels]
    return sum(a * b for a, b in zip(linear, (.2126, .7152, .0722)))
pairs = [('Ink on ivory', '#1f2421', '#fbf6ee'), ('Muted on white', '#59615c', '#ffffff'), ('White on gold', '#ffffff', '#926c34'), ('White on teal', '#ffffff', '#0f766e')]
save('metadata/token-contrast.json', [{'pair': name, 'foreground': fg, 'background': bg, 'ratio': round((max(luminance(fg), luminance(bg)) + .05) / (min(luminance(fg), luminance(bg)) + .05), 2), 'scope': 'Opaque semantic token pair; not a full rendered WCAG audit'} for name, fg, bg in pairs])

reports = {
 'executive-summary': 'Phase 4 delivers a viewport-bounded desktop event shell, a synchronized guest form, a usable seating planner, clearer dashboard priorities, pending RSVP rows, selected-recipient delivery and a media library that distinguishes uploaded files from invitation artwork. Work stays on a local feature branch. No production data, payment logic, migration, dependency, push or deployment was changed.',
 'phase3-vs-phase4': 'Phase 3 used document scrolling and a sticky sidebar; Phase 4 bounds desktop scrolling to the task panel. Add previously hid phone and Edit hid classification; both now expose the same supported fields. Seating previously stacked long bilingual forms beside an empty region; creation now uses a dialog, with capacity-aware assignments beside real tables. Published dashboards move activity before preparation. Delivery places recipients before sharing methods. Media uses shared tokens and explains its actual asset sources.',
 'sidebar-scroll-root-cause': 'Measured baseline sidebar top positions: 96, -400, -900 and -2646 px during document scrolling. Main scrollTop stayed zero. Sticky positioning was inside an unbounded shell with overflow-x:hidden ancestors (#root and .app-container), which establish scrolling ancestors while the document moves. This explains why a computed sticky value was insufficient. Desktop now uses a 100dvh shell, min-height:0, a bounded grid row and overflow-y:auto on .event-workspace-main. Sidebar context/footer remain in the same grid row; only the menu scrolls internally. Mobile keeps document scrolling and the existing accessible drawer. Focused Studio retains its separate editor layout. browser-scroll-measurements.json records 400px, another 500px and bottom samples on all six modules, plus independent menu scrolling at 1440x600, with a 1px tolerance.',
 'guest-form-data-consistency': 'GuestFormModal is the shared create/edit implementation. Phone, seats, group and category are visible in both modes; email, companion and notes use progressive disclosure. Unknown stored group/category options remain selectable. Optional phone stays a string, preserves leading zeroes and accepts Cambodian local or international +country-code formats. Validation focuses the first error; failed saves retain inputs; dirty cancellation asks before discarding. The mapper preserves email, contribution values and the raw server delivery status. Status is readable in the form; manual sharing uses the existing delivery service after explicit action. Backend deletion failures no longer remove rows optimistically. Browser fixtures verify create/reload/edit/update/reload; real MockMvc/JPA tests flush and clear persistence between reads, preserve QR identity and reject another event path. Those are complementary test layers, not a browser connected to a live database.',
 'seating-ux-redesign': 'The planner now presents tables, capacity, assigned seats and unassigned guest records as distinct metrics. The zero-table view offers a first-table action instead of an empty canvas. A focused modal retains name, label, capacity, order and notes. List cards show occupancy, remaining seats, assignments, move/unassign and guarded delete. Selecting a guest defaults to their complete party size. Invalid or excessive capacity disables assignment; the backend remains authoritative. Moving uses the existing assignment upsert. Populated list and floor-plan modes retain existing pointer, keyboard and numeric positioning. Mobile switches between Tables and Assign guests. Real HTTP/JPA tests cover capacity rejection, assignment identity on move, occupied-table deletion rejection, cross-event isolation, unassignment and reload. Venue decoration positions remain device-local, as the existing floor-plan UI explains.',
 'dashboard-ux-review': 'The existing dashboard is retained. The cover uses the verified event summary/media identity, with template artwork as a fallback. The summary includes event type, status, date, time, venue, primary next action, preview and edit. Activity metrics now precede preparation. Published events prioritize guest and delivery tasks in the checklist; draft events retain preparation order. No invented percentage is displayed. Currency totals remain separated by their existing currency-aware implementation. A final browser check verifies that an uploaded cover reaches the dashboard and persists on reload.',
 'rsvp-delivery-media-review': 'RSVP merges guests with submitted responses so pending invitations are visible; pending invitations do not expose response-edit/delete controls. Status metrics count records, confirmed attendees count people, and invited seats are labelled separately. Existing owner actions remain server-authorized. Delivery follows Prepare → Select → Share → Track, supports search/status filtering and visible eligible selection, and sends explicit guestIds with allEligible:false. Email results use successCount/failedCount; copied/native/Telegram shares never auto-mark sent. Manual share recording is an explicit confirmed action. Email requires server configuration; real messages were not sent. Media uses the existing service, validates extension/MIME/size and reports upload progress, errors and retry. Cover/gallery/video/music use compact tabs and actual records. Template and saved-design artwork are references, not automatic duplicate uploads. Files referenced in Studio are changed there because the media replace/delete endpoints do not rewrite saved design JSON atomically. Unreferenced library files support replace/remove here.',
 'design-system-changes': 'Shared workspace styles now cover headings, summaries, forms, action groups, selection controls, search, icon buttons and empty states. New seating, delivery and media UI consumes existing --ui-* / --ws-* semantic roles. Ivory, readable ink, gold primary actions and teal operational controls remain. Guest branding and invitation templates are retained. My Events uses an auto-fit card grid, compact filter surface and natural title wrapping. Lucide icons serve new operational controls. Existing floor-plan interactions remain; their host labels now follow the language system. Shared modals respect reduced motion. No new color vocabulary, animation library or production dependency was introduced.',
 'backend-api-contract-changes': 'No production backend API, database schema, migration, authorization or payment implementation changed. GuestRequest/GuestResponse already support phone, email, guestGroup, sideType, seatCount, companionName, tableNumber, note and contribution values. GuestService applies full PUT data; preserving unedited fields in the frontend is therefore necessary. Media service methods gained optional frontend upload-progress callbacks, retaining their existing endpoint contracts. Seating POST creation and assignment endpoints return HTTP 200. Delivery selection uses existing guestIds and allEligible fields. The event summary exposes coverUrl while the detail response does not; workspace loading now retains that verified cover identity and media updates refresh it. Only backend test code was added, using isolated H2 and real HTTP/JPA mappings.',
 'accessibility-results': 'Captured all seven main screens at 320, 375, 390, 430, 768, 1024, 1366, 1440 and 1920px in Khmer, plus English desktop/mobile and modal states. Geometry checks found no document-width overflow. Eighteen additional DOM audits cover short viewports and effective 125%/200% viewport widths; no unnamed visible controls were found. Existing navigation tests verify drawer focus trapping, background isolation, Escape/close/scrim behavior, focus restoration, active routes and reduced motion. Floor-plan keyboard and numeric positioning remain tested. Mobile save controls remain visible while the guest dialog scrolls. Semantic token contrast pairs are recorded separately. This is a scoped accessibility review, not full WCAG certification; physical devices, assistive technology, Safari/Firefox and native browser zoom were not tested.',
 'test-results': 'Executed evidence is in metadata/test-summary.json and logs/. Full frontend: 656/656 tests, 116 files. Final affected components: 60/60; cover/workspace follow-up: 17/17. Backend: 65/65 including real guest/seating HTTP/JPA persistence and ArchUnit. Broad browser regression: 71 passed, one existing skip; final Phase 4 desktop/mobile: 28 passed; final cover-inclusive desktop: 15 passed. Counts overlap and must not be added. Lint, production build, skill integrity and routing pass. Early failures were corrected: tests expected hidden fields/old stage labels, a locale-dependent keyboard test assumed English, seating assertions expected HTTP 201 rather than the actual 200, and test registrations shared an auth rate-limit bucket (HTTP 429). The H2 test helper now isolates simulated client addresses without changing production rate limits. A template lazy-render timing failure under high parallel load passed in the full suite with --maxWorkers=2. Java warnings caused an initial PowerShell wrapper exit of 1 despite Maven BUILD SUCCESS; the final command propagates the native Maven exit code explicitly.',
 'remaining-issues': 'No live email/Telegram messages or cloud-storage mutations were performed. Media cloud persistence is covered by service tests and browser contract fixtures, not an end-to-end upload to a configured isolated provider. MySQL-specific migration/locking certification is not claimed; persistence tests use H2 compatibility mode. Existing floor-plan venue decorations are device-local. Assets referenced by saved Studio content route to Studio for safe replacement/removal; atomic reference rewriting in Media remains outside this frontend change. Phone validation is format-based, not carrier verification. Browser zoom was approximated by effective viewport sizes; native zoom, assistive technology, physical devices and other browser engines remain unverified. The full frontend suite passed before the small cover follow-up; its affected tests and browser journey passed afterward.',
 'final-implementation-report': f'Baseline {BASE}; implementation HEAD {head}; branch {branch}. All requested implementation milestones are represented by local focused commits. Sidebar scrolling and guest parity were reproduced before editing. Source changes retain existing frontend architecture and backend contracts. Shared styles, localization, seating workflows, dashboard ordering, delivery selection and media-source clarity are implemented. Review covers real synthetic browser screenshots, scrolling geometry, functional regression and isolated backend persistence. No production user/demo data was altered. No push or deployment occurred. Review remaining-issues.md for the precise verification boundary. ZIP validation checks report existence, screenshot decoding, member CRC and content allowlisting.',
}
for name, body in reports.items():
    save('reports/' + name + '.md', '# ' + name.replace('-', ' ').title() + '\n\n' + body + '\n')
save('README.md', '# Koupreng Phase 4 review\n\nStart with reports/executive-summary.md and reports/remaining-issues.md. Compare screenshots/before with screenshots/after; responsive contains the nine required widths. All browser records are synthetic. API test data is isolated and rolled back. No live guest data or credentials are included.\n\nReproduce from the repository with scripts/phase4/capture.mjs and scripts/phase4/verify.mjs using the local frontend servers and installed Playwright. See metadata/test-summary.json for exact test commands, logs, counts and overlap.\n\nThe after dashboard/RSVP/delivery capture fixture was corrected to use coherent aggregate counts; do not interpret those synthetic count differences as production data changes.\n')

capture_records = []
for filename in ['before-captures.json', 'after-captures.json', 'extra-captures.json']:
    capture_records.extend(json.loads((OUT / 'metadata' / filename).read_text(encoding='utf-8')))
by_path = {str(Path(row['path']).resolve()).lower(): row for row in capture_records}
manifest = []
for path in sorted((OUT / 'screenshots').rglob('*.png')):
    with Image.open(path) as img:
        size = img.size
        img.verify()
    record = by_path.get(str(path.resolve()).lower(), {})
    manifest.append({'file': path.relative_to(OUT).as_posix(), 'width': size[0], 'height': size[1], 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'route': record.get('route'), 'language': record.get('lang', 'en'), 'browser': record.get('browser')})
save('metadata/screenshot-manifest.json', manifest)
assert len(manifest) >= 100
for name in reports:
    assert (OUT / 'reports' / (name + '.md')).is_file()

archive = OUT / 'Koupreng-Frontend-Phase4-Review.zip'
members = [OUT / 'README.md', *sorted((OUT / 'reports').rglob('*.md')), *sorted((OUT / 'metadata').rglob('*.json')), OUT / 'metadata/git-commits.md', *sorted((OUT / 'screenshots').rglob('*.png')), *sorted((OUT / 'logs').glob('*.log'))]
assert all(path.suffix in {'.md', '.json', '.png', '.log'} and '.env' not in path.name for path in members)
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as zipped:
    for path in members:
        zipped.write(path, path.relative_to(OUT).as_posix())
with zipfile.ZipFile(archive) as zipped:
    assert zipped.testzip() is None
    assert len(zipped.namelist()) == len(members)
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
verification = {'path': str(archive), 'bytes': archive.stat().st_size, 'sha256': digest, 'members': len(members), 'screenshotsDecoded': len(manifest), 'reports': len(reports), 'crcCheck': 'passed', 'head': head, 'createdAtUtc': datetime.now(timezone.utc).isoformat()}
save('archive-verification.json', verification)
save('Koupreng-Frontend-Phase4-Review.zip.sha256', digest + '  ' + archive.name + '\n')
print(json.dumps(verification, indent=2))
