# Studio and one-link guest language

The six-tab Studio, split workspace, authenticated click-to-edit channel, Guided mode, preview iframe and existing save/history writer remain in place. The form owns one canonical state; visible fields and preview use the selected authored locale. Account/UI language is independent from the KH/EN authoring pills. English starts blank. Copy names from Khmer is a deliberate action.

The author sees per-language saved/unsaved status based on the acknowledged save snapshot, English completion counts and readable missing-field links. Owner publication controls and a default guest language expose English only after readiness. Preset preview does not mutate authored content; applying a preset asks to replace the current section and creates one undoable state update.

`PublicInvitationFeature` selects an approved locale on the same slug and access token. Its language buttons update `lang` using replace navigation with scroll reset prevention. No locale-based remount key was added. RSVP input remains mounted; the opening state, ticket credentials and canonical guest identity remain shared. Wrapper language attributes and localized system labels follow the display locale. Unapproved English requests show the approved fallback, without English draft text.

The public draft and template adapters transport locale/design contracts through dedicated renderers. Ticket display projection changes approved visible title/name/venue labels only; QR payloads, ticket IDs, guest identity and original purchased appearance are preserved.

The original form defect was reproduced with a failing English-empty assertion against the initial source; the corrected implementation passes the same case. Browser fixtures verify save/reload and guest language switching. Actual backend HTTP/MySQL tests verify persisted translations, private access and token identity; browser fixtures are not presented as provider integration.
