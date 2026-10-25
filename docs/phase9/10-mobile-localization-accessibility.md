# Mobile, language and accessibility evidence

Studio uses six desktop parent controls and one equivalent native mobile selector. Each sub-section uses a native details/summary control, retains mounted fields and can be operated by keyboard. Existing sticky save/preview controls, full-screen preview, modal isolation and return focus are preserved. Tickets use a mobile Edit/Preview switch with the same underlying design state and explicit save-before-export feedback.

New parent, media, ticket, status and error labels have Khmer and English copy. Existing local application fonts and generous Khmer line height are retained. UI language changes do not translate or replace authored wording. The native live journey verifies family text, message, closing text, program metadata and date settings through the same saved content contract.

Automated coverage includes 320/390/768/1440px Phase 9 Studio checks in both languages, inherited eight-width ticket/Studio checks, Phase 7 preview/navigation focus and text reflow, and Phase 8 date/program accessibility. Scoped axe checks cover Studio navigation/forms, ticket design, cinematic controls and real local admin dashboard/reports. Native selects, disclosures, Skip/Escape and return-to-content behavior are exercised through browser controls.

Reduced motion bypasses cinematic download and preserves the existing static template opening behavior. Browser autoplay denial remains recoverable. The bundled Windows WebKit engine rejected the MP4 fixture; the test records its actual media error and verifies recovery instead of claiming video decoding succeeded. Chromium and Firefox exercise the real fixture's muted playback and sound control. Physical Safari/iOS behavior is a separate test.

These are automated checks against the stated screens/states, not WCAG certification. Physical phones/tablets, on-screen keyboards, human screen readers, native browser zoom and Khmer family/editorial review remain manual release checks. Authored films with speech may require creator-provided captions/content review; no automatic captioning or transcoding pipeline was introduced.
