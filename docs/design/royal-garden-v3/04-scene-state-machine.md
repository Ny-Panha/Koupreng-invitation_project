# Scene transitions

The existing INTRO_STAGES and nextIntroState remain compatible. The hook adds explicit video preparation/playback entry methods; video stages have no slideshow timer.

| Current/action | Result |
| --- | --- |
| COVER + Open + eligible film | VIDEO_PREPARING, then PRE_WEDDING_VIDEO after a 900ms cover transition |
| Preparation + Skip/restart | Cancel delayed provider start; CONTENT or COVER |
| PRE_WEDDING_VIDEO + ended/Skip/load error/403/timeout | CONTENT, or PHOTO_SLIDESHOW if the owner selected that follow-up |
| COVER + no eligible film | Existing ORNAMENT_REVEAL → TITLE_REVEAL → PHOTO_SLIDESHOW → INVITATION_REVEAL → CONTENT |
| COVER + reduced motion/Save-Data | CONTENT |
| Studio Preview information | Stop film and enter CONTENT |
| Studio Restart animation | Stop film, discard resume callback, return to COVER |

Royal Garden video is an inline, focused region in normal document flow across opening styles, with no dialog, popup form or modal focus trap. Underlying invitation content is hidden while the film scene is active and restored on completion. Other templates retain their current provider presentation.

Provider active/started guards prevent duplicate starts. Finish is idempotent; a second ended/error cannot resume audio twice. Cancellation clears the delayed start. The player aborts protected requests, revokes object URLs and pauses the media on unmount. A 15-second loading/stall watchdog leads to usable content. Autoplay denial exposes Play and Skip; user pause does not trigger a stall skip. Tab hiding pauses video and resumes only playback that was active before hiding.

Music starts only following interaction. A film start pauses background music; film sound starts muted, with an explicit Enable sound action. The owner can disable music resumption. Replay retains the current sound preference.
