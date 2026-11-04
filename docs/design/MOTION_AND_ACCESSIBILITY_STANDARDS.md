# Motion and accessibility standards

Batch-one implementation contract, 2026-11-04. These standards guide later work; they are not a declaration of whole-project WCAG conformance.

## Motion

- Shared feedback duration is 160ms, overlays 200ms, with `--ui-ease-standard`. Both durations become zero under `prefers-reduced-motion: reduce`.
- Customer modal entrances use those tokens and explicitly disable animation for reduced motion. Admin chrome does not choreograph every control. The audio button stays static, including while loading/playing; only a brief hover displacement responds to user input, disabled with reduced motion.
- Keep existing cinematic invitation openings local. Future template passes must verify immediate reduced-motion reveal, audio gesture requirements and keyboard reachability for each renderer separately.
- Show errors immediately. A spinner, counter or transition must never substitute for a successful server response. Avoid perpetual decorative motion in operational UI.

## Keyboard and semantics

- Every icon-only control/link needs a meaningful name. Shared operational control minimum is 44×44 CSS pixels; new admin links, toolbar controls and close buttons meet it.
- Admin navigation and search use named native modal dialogs, background inertness, explicit Tab/Shift+Tab boundary handling, Escape, body scroll restoration and opener focus restoration. Closed mobile navigation is unmounted. Route changes close open overlays.
- The customer modal retains its existing stacked focus/inertness implementation, including embedded-frame handling. Batch one changes layout/focus styling, not that contract.
- The admin skip link targets the focusable main region. Route search filters real destinations, supports keyboard activation and announces no results. It must not suggest that records were searched.
- Music is a named button with `aria-pressed` reflecting playback. Its polite status region announces loading or failure with retry guidance. Native media pause/error/ended events update the UI. No music source means no control. Public copy follows invitation locale, independent of host preferences.

## Responsive and multilingual behavior

Verify 320, 375, 390, 430, 768, 1024 and 1440px. Use dynamic viewport units for modal height and safe-area insets for mobile edges. Keep modal bodies scrollable and primary/footer actions reachable. Preserve Khmer shaping, body leading and natural word breaking. Test long names and real form errors in each future route pass.

Admin light/dark mode remains user-selected and keeps existing persistence. Cambodia clock formatting uses `Asia/Phnom_Penh`. Currency formatting and authorization remain existing service responsibilities.

## Evidence limits

Current automated coverage uses Chromium desktop/mobile projects and controlled API/media fixtures. Browser keyboard tests complement RTL; RTL's simulated DOM cannot certify browser-native focus containment. Safari/iOS, Firefox, hardware audio/camera, virtual keyboards and manual screen-reader tests remain outstanding. See the exact commands, results and screenshots in [verification](UI_MODERNIZATION_VERIFICATION.md).
