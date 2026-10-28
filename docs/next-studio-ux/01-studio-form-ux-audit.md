# Studio form and workspace design

The six tabs, section keys, guided flow, controlled values, template registry and iframe remain the existing implementation. Extraction is limited to presentation; the existing writer still owns server persistence and optimistic revisions.

## Design direction

The user explicitly requested a more modern workspace during implementation. Management surfaces use white `#ffffff`, sage canvas `#f4f6f5`, forest ink `#17372d`, muted text `#627168`, soft rules `#e0e7e2` and restrained brass `#98743b`. Existing local Khmer/Latin font families remain in use. The form is left aligned; the preview has its own quiet canvas. Save has one strong visual priority. Public invitation artwork is unchanged.

The first pass retained too many bordered panels and exposed every language option in the toolbar. The reviewed second pass removes redundant headings and nested card borders, groups language/publishing controls in an accessible disclosure, and keeps language switching immediately available. Mobile uses the section selector; the six desktop navigation entries remain hidden there.

The user's later copy direction overrides the initial request for extensive guidance. Dashboard taglines, routine field instructions, section introductions, family-host empty-state paragraphs and implementation explanations are removed. The Add host action, authored content, all fields, error messages, upload restrictions, pending-payment status and essential access guidance remain. Engineering reports are not rendered as product copy.

| Issue / reproduction | Source and cause | Implemented change | Evidence |
| --- | --- | --- | --- |
| Narrow split compresses name fields | `InvitationForm.jsx`, legacy `.pe-grid-2` follows viewport rather than editor width | `StudioFormRow` and a 640px editor container query; one column below that width | Six-tab mobile/desktop captures; existing split suite |
| Field meaning and required state unclear | Repeated local form JSX | `StudioField`, help/error associations, optional vs required-to-publish labels; existing controlled values/IDs | `StudioFields.test.jsx` |
| Three competing event headings | Tab, disclosure and field card all repeat the heading | Retain tab and disclosure hierarchy; remove duplicate field-card heading | [Before](../../output/playwright/next-studio-ux/before/studio-eventInformation-1440.jpg), [after](../../output/playwright/next-studio-ux/after/studio-eventInformation-1440.jpg) |
| Language controls dominate mobile | `InvitationForm.jsx:3120`, legacy flex layout plus publishing/checklist content | Compact language pills plus “Language & publishing” disclosure; complete controls retained inside | [Mobile after](../../output/playwright/next-studio-ux/after/studio-eventInformation-390.jpg) |
| Save feedback can imply success after failure | `InvitationForm.jsx:1192`, browser draft persistence and server outcome share messages | One deliberate success after `flush` confirms the server; quiet autosave; inline retained failure/retry | New Chromium/Firefox/WebKit save journeys |
| FileReader completion looks like upload success | Gallery handler and local image field | “Ready; Save to upload” information; actual upload failures remain retryable | `StudioUploadField.jsx`, media suites |
| Feature rejection loses draft or cause | `InvitationForm.jsx:3105`, hooks flatten errors to text | Preserve structured failure, explicit review action and recovery download; no autosave popup loop | Real HTTP/JWT tests and revocation browser journey |
| Lost role can unmount the open editor | `EventWorkspace.jsx`, module gate immediately replaces Outlet | Retain already-open Studio read-only for recovery, disable writer/template/publish; initial unauthorized entry stays blocked | Workspace race unit test; revocation browser journey |
| Featured cover blocks recovery action | `EventsFeature.css`, grid image retains intrinsic aspect sizing | Bound grid image width and remove the competing aspect ratio in featured layout | `event-access-recovery.spec.js` |

`StudioFields.jsx` supplies field/group/row/date-time/text/section/validation/action primitives. `StudioUploadField.jsx` retains the original image browse/drop/replace/default/recovery behavior. `StudioChrome.css` owns the revised management styling, including the toolbar portal, without selecting public template DOM.

Focus on Editing hides the existing preview column while keeping its iframe mounted. Preview presets, splitter persistence, mobile preview dialog, trusted click-to-edit and full preview remain existing mechanisms. Reset/wording/template replacement use shared confirmation; browser-required leave-page warnings remain synchronous.
