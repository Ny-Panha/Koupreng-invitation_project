# Data and Studio contract

Canonical names, family, guest identity, dates, programme, gallery, venue, RSVP and gifts stay in their existing fields. No duplicate event identity is stored in presentation data.

`cinematicIntro` retains version 1 and all existing fields. New optional fields are style=royal-arch, entranceFrame, entranceFrameEnabled, entranceFrameScale, entranceFramePosition, guestFrameEnabled, coverX/coverY, titlePlacement, openButtonText and buttonArtwork. Existing saved styles are not migrated. An omitted artwork/frame source inherits its default; an explicit empty or null value remains cleared.

`informationScene` contains enabled, backgroundAsset, fixedBackground, backgroundPosition, contentOverlay, panelOpacity, sectionReveal, footerEnabled, motionPreset, effects, and video presentation options. Video options are fit, transition, footer, replay, followUpPhotos and resumeMusic. They are deliberately outside the strict backend preWeddingVideo object, which continues to contain only enabled/videoMediaId/posterMediaId.

`invitationFeatureFields` carries informationScene through save, publicInvitationToDraft, draftToTemplate and buildTemplateContent. Studio autosave/conflict/offline/undo machinery is unchanged. Uploaded background art follows uploadInlineReferences/replaceMediaReferences and is replaced with saved gallery-media URLs; base64 is not intentionally persisted as permanent server content.

Studio groups entrance settings inside Cinematic intro, video settings inside the existing entitled video editor, and information/motion settings inside Appearance, scoped to Royal Garden. The preview toolbar has Entrance, Video, Information, Restart and a live scene label. Editing presentation data does not replace the iframe. Existing cover and event-information editors remain the place to change cover media and canonical identity.

New PREVIEW_SCENE and PREVIEW_SCENE_STATE messages accept exactly one validated scene string. They still require the existing session nonce, exact source window and explicit origin. Studio-only event IDs and entitlement availability are ephemeral preview data. The iframe loads owner film through the authenticated owner endpoint; the backend checks event ownership and entitlement again. Catalog sample media is never copied into saved invitations.
