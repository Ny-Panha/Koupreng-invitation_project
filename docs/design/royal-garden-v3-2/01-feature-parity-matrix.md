# Feature parity matrix

Audit classifications below describe the baseline, before implementation. Delivery evidence and final status are recorded in `07-qa-results.md` and `09-release-readiness.md`.

Common pipeline: `InvitationForm` state → `contentPayload`/`designPayload` → invitation update API → `contentJson`/`designJson`; public rehydration is `publicInvitationToDraft` → `draftToTemplate.tpl.hostContent` → localized content → Royal layout. Preview uses `LivePhoneSimulator.LIVE_PREVIEW_SYNC` on a validated channel. JSON presentation fields have no new endpoint. "Round trip" below means adapter/component tests plus mocked Studio save/reload/public browser verification; it does not mean real database integration.

| Feature / baseline classification | Studio control and canonical source | Preview / persistence / public mapping | Royal renderer / visibility / localization | QA requirement |
|---|---|---|---|---|
| Couple names — FULLY_SUPPORTED | Event information; `groomName`, `brideName`, `couple` | top-level API names and content couple; `draftToTemplate` names | entrance/invitation; localized authored content, no invented translations | names / clearing / round trip |
| Parents — FULLY_SUPPORTED | family editor; parent fields and `familyGroupsV1` | `invitationFeatureFields`, content parents | `FamilyNames` / family; authored localized names | family / localization regressions |
| Invitation message — FULLY_SUPPORTED | message editor; `messageTitle`, `messageText` | content message and host content | invitation; section flag, authored translation registry | edit / clear / language |
| Guest personalization — FULLY_SUPPORTED | guest management, not public defaults; authorized guest response | public guest token flow, separate from owner draft | entrance guest frame and invitation; valid guest only | token fixture / isolation |
| Ceremony dates — FULLY_SUPPORTED | event information; `eventDate`, `eventTime`, `eventTimezone` | canonical API date/time; `eventPresentationFields` zone | invitation and date slot; `resolveEvent` | timezones / midnight / invalid dates |
| Countdown — FULLY_SUPPORTED | `SaveTheDateEditor`; `saveTheDate.showCountdown` | additive settings through both adapters | `WeddingCountdown`; date slot enabled; Khmer/Latin numerals | past / missing time / locale |
| Calendar — PARTIALLY_SYNCHRONIZED | `SaveTheDateEditor`; showCalendar/navigation/numerals | settings already preserved | shared grid marks main event only; replace with Royal multi-day presentation | leap / month/year / selection / keyboard |
| Calendar export — PARTIALLY_SYNCHRONIZED | showAddToCalendar; event end and UID | canonical public date and allowlisted text | one VEVENT only; extend optional ceremony export | UTC / escaping / fold / invalid exclusion / privacy |
| Program days — FULLY_SUPPORTED | `WeddingProgramEditor`; `programDays` | `eventPresentationFields` / content JSON | `ProgramTimeline` groups via `groupProgram`; enabled flags; bilingual day headings | order / ID / extensions / round trip |
| Schedule — FULLY_SUPPORTED | program editor; `schedule`, `showSchedule` | normalized flat rows / content schedule | timeline; enabled rows; localized titles/descriptions | reorder / disable / legacy |
| Ceremony icons — FULLY_SUPPORTED | icon select; `schedule[].iconKey` | row extension retained; backend allowlist | `CeremonyIcon`; fixed safe icon dictionary | icon fallback / backend validation |
| Venue — FULLY_SUPPORTED | venue editor; name/address and row location | API + content venue, adapters | venue and program; localized authored text | edit / public / no demo fallback |
| Directions — FULLY_SUPPORTED | Google Maps field | validated HTTPS Google host; `safeDirections` | venue link; only valid URL | unsafe URL rejection |
| Illustrated map — PARTIALLY_SYNCHRONIZED | existing map editor; `illustratedMap` | `invitationFeatureFields` | `IllustratedMap`; enabled map can be empty; guard actual nodes | empty map / language / safe link |
| Gallery — FULLY_SUPPORTED | photo editor; `photos`/gallery media | uploaded media to effectiveGallery and public media | `RoyalGallery`; gallery enabled, lazy images | gallery / no cover-stage requests |
| Music — FULLY_SUPPORTED | music editor; `musicUrl` / media | explicit owner choice; no catalog song fallback | single audio element; music section flag | gesture / toggle / continuity |
| Dress code — STUDIO_ONLY | existing dress editor; `dressCode`, `dressColors`, `showDressCode` | payload and adapters preserve data | missing Royal renderer, capability false; localized content registry available | implement, enable only after round trip |
| Love story — STUDIO_ONLY | story editor; `storyChapters`, `showStory` | arrays preserved in content/host content | no Royal renderer, capability false | retain saved data; defer if incomplete |
| Wedding party — STUDIO_ONLY | party editor; `party`, `showParty` | arrays preserved in content/host content | no Royal renderer, capability false | no private contacts; defer if incomplete |
| FAQ — STUDIO_ONLY | guest-notes editor; `faq`, `showFaq` | q/a records preserved in content/host content | no Royal renderer, capability false | accessible disclosure / authored content |
| Gift KHQR — FULLY_SUPPORTED | KHQR editor; `khqrDollar`, `khqrRiel` | adapters project USD/KHR gift records | gift section with safe images, no payment-confirmed state | currencies / media / no false confirmation |
| RSVP — FULLY_SUPPORTED | existing RSVP / guest settings | existing public RSVP API and service | real `PublicRsvpForm` child; authorized guest/deadline policy | mocked submit and backend security tests |
| Wishes — PARTIALLY_SYNCHRONIZED | RSVP private message | audit found the existing public service returned message rows | Royal notice described privacy, but the public API leaked messages; fix requires server protection | service privacy + organizer access + browser no-feed assertion |
| Thank-you — FULLY_SUPPORTED | closing editor; thankYouTitle/Text | content JSON and authored localization | `RoyalGardenCeremonialLetter`; empty letter omitted | edit / clear / bilingual |
| Apology — FULLY_SUPPORTED | closing editor; apologyTitle/Text | content JSON and authored localization | same ceremonial letter treatment | edit / clear / bilingual |
| Typography — FULLY_SUPPORTED | appearance editor; fontKhmer/Latin, elementFonts, studioStyle | content/design fields and live sync | scoped CSS variables and element fonts | Khmer combining marks / viewport review |
| Visibility/order — PARTIALLY_SYNCHRONIZED | section controls; show flags, enabledSections, sectionOrder | saved arrays retained | fixed ORDER accepts only implemented keys; nav can target empty gallery/schedule | hidden nav / preserve old order / internal root |
| Pre-wedding film — ENTITLEMENT_RESTRICTED | `PreWeddingVideoEditor`; media IDs | server entitlement and protected media provider | existing muted inline video; preserve token/access checks | V3 regression / entitlement tests |
| Generic couple photo — NOT_SUPPORTED | separate generic couplePhoto capability | coverBackgroundImage already has its own working path | keep false; no duplicate editor | cover regression |

## Final classification after implementation

Calendar, calendar export, dress code, illustrated-map empty-state handling, private wishes, and supported visibility/ordering now have **FULLY_SUPPORTED** code paths with the local unit/backend/mocked-browser evidence in `07-qa-results.md`. English closing aliases, active-locale dress style, gift currency and explicit clearing were additionally repaired. Existing fully supported rows retain their status. Video remains **ENTITLEMENT_RESTRICTED**.

Royal FAQ, love story and wedding party remain **NOT_SUPPORTED** in this release (the wider application's Studio models exist; Royal controls remain disabled). Their saved records survive the actual template selector and save flow in all four browser projects. Generic couplePhoto remains **NOT_SUPPORTED**, with its separate existing cover-photo path supported. No capability flag was enabled for those deferred renderers.

The shared backend contracts are `InvitationRequest` / `InvitationCustomizationRequest`, their application service and `InvitationContentPolicy`, with `PublicInvitationResponse` / `PublicGuestResponse` governing guest access. Optional presentation data stays in content/design JSON. Program rows, dates, timezone and settings use the policy's existing validation; RSVP uses the existing controller/service and guest authorization. "Supported" describes implemented data paths, not completion of the explicitly unverified real MySQL/native Safari release gates.
