# Rendering and data contract

The latest critical steering supersedes the earlier document-scrolling interpretation. The default information scene is now one viewport with a permanent original-art frame and one inner content scroller. Main started at `32e95466a2a55ba1cd53701012903a702c06e10b`. During verification another actor committed and pushed `db69ae910768ecbb505ee020a4f35c9573afed84`, including much of the in-progress repair and unrelated template retirement work. That commit is preserved; the remaining fixes and evidence build on it.

## Cover

`RoyalGardenArtworkFrame` paints the untouched blue/gold source through CSS nine-slice framing. Top and bottom carvings retain their width-derived scale; only the straight sides repeat vertically. The source background is not removed. The owner photograph sits above the blue interior inside a clip measured from the original gold contour. It remains below foreground text and outside the carved boundaries.

The foreground uses reserved grid rows for the heading, portrait space, names/date, guest band and circular Open control, with a source-derived bottom safe area. The original guest image retains 3:1 proportions; its transparent margins are part of that image. Text remains live, escaped React content from the existing authorized guest context. Long names wrap in a bounded safe region with no inner scrollbars and retain their full accessible label.

The default editable title uses existing Khmer fonts. Explicit saved artwork mode still displays supplied/owner calligraphy instead of duplicate HTML lettering. Existing focal position and new bounded cover zoom apply to owner media. The 48px circular SVG play control exposes the configured accessible label and keeps a separate grid row below the guest artwork.

## Inline film

`CinematicOpeningProvider` still owns eligibility, the protected loader, cancellation, music handoff and completion. Its context provides the authorized player element to `RoyalGardenVideoScene`, which renders inside `RoyalGardenInformationScene`. The invitation subtree stays mounted. Other templates retain their existing modal player.

Royal-only presentation uses dominant portrait media, live canonical initials/monogram, lower original calligraphy, compact 44px icon controls and a thin progress track. The complete original 3:1 footer is a structural grid row below the video and controls. Contain preserves the source image; cover is an explicit saved owner choice. Playback controls support sound, pause, replay, Skip and Continue, with visible keyboard focus and an explicit Play fallback when browser playback is denied.

Default completion collapses the film into information. The optional saved poster ending retains an approved keepsake and Replay. End, Skip, Continue, error and the existing 15-second recovery timeout resolve to content, abort pending loads and release blob URLs. Reduced motion and Save-Data retain their existing bypass. Inactive information effects and background music pause during playback. Sound requests follow interaction and remain subject to browser policy.

## Information and language

The default frame is stationary within the pinned Royal canvas. One central `rg-content-scroll` region moves all enabled sections. Its top, side and bottom safe areas exclude the gold and floating controls. Native anchor/focus scrolling, bottom navigation, Studio section requests, keyboard End and touch/wheel target this region. Section observation uses it as the viewport. The explicit saved fixed-frame opt-out still uses document scrolling, including the hosted wrapper; the immersive film keeps its normal full-width layout in either mode.

Initial information is one continuous ceremonial composition: heading, symmetric parents, invitation paragraph, monogram, couple names/date, then the enabled countdown/program/venue/gallery/gift/private wishes/RSVP/closing sections. Repeated cards and duplicate family/invitation dividers are removed. Existing functional map, calendar, curved program, gallery dialog and guest actions remain.

The same floating locale selector is available on hosted and catalog cover, film and information. URL locale overrides presentation only, preserves the guest token and does not reset the intro or recreate the active video element. Standard controls/countdown/RSVP wording updates; personal owner text changes only where a real approved language variant exists. A typed private RSVP message survives switching. English countdown uses Latin numerals.

## Studio, persistence and security

Existing editors, iframe transport and persistence remain in use. Necessary controls are integrated into CinematicIntroEditor, PreWeddingVideoEditor and RoyalGardenSceneEditor: text/artwork heading, bounded photo zoom/focal position, video fit/sound/end behavior and the existing contrast/motion options. Live film fit changes update the same iframe. Optional fields extend `cinematicIntro` and `informationScene.video`; canonical names/dates and protected media-ID contracts are unchanged. Round-trip and synthetic save/reload/public journeys cover them.

Hosted/Studio film still uses the protected POST loader and `PRE_WEDDING_VIDEO` eligibility. The approved catalog film is catalog-only. No public URL fallback, new endpoint, migration, wildcard preview origin, guest cache or authorization bypass was added. Authorized RSVP identity stays server-owned; no editable guest-name field was introduced. Wishes remain private RSVP data, without a fabricated public feed. No deployment or production operation is part of this repair.
