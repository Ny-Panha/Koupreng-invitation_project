# Template compatibility and evidence — V2

Audit date: 2026-11-05. The read-only development endpoint
`http://127.0.0.1:8080/api/v1/templates` returned six ACTIVE entries:
Khmer Celestial, Royal Garden Cinematic, Silk Heritage, Khmer Floral Gold,
Event Essential and Koupreng Demo Wedding. Floral was nonpremium, zero USD.
Royal Garden was premium even though its listed price was zero; paid eligibility
must not be inferred from price alone. This check did not alter catalog data.

The local marketing catalog also contains the additional designs below. Their
renderer support does not imply that an inactive/missing server catalog item can
be selected or published. Synthetic browser catalog IDs are fixture-only.

| Template / stable code | Active in observed dev catalog | Date styles | Program styles | Cover style gallery | Opening/video and guest controls | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Khmer Floral Gold / `khmer-floral-gold` | Yes, Free | 8 supported | 8 supported | Original frames, text/art, image/video background, crop, portraits, gallery/motion/map frames | Fixed and tested shared authorized Premium film; single song; language; new registered-section dock | Floral E2E, styles V2, motion V2, H2 service + real MySQL film test |
| Khmer Celestial / `khmer-celestial` | Yes | 8 supported | 8 supported | Existing canonical appearance/cover editor | Existing opening/music/language; new shared section dock; Premium film | Styles V2 author/save/public; phase9 film; existing identity tests |
| Royal Khmer / `royal-khmer-wedding` | Local only | 8 supported | 8 supported | Existing Celestial renderer adapter | Celestial choreography and controls retained | Styles V2 author/save/public |
| Silk Heritage / `silk-heritage` | Yes, Free | 8 supported | 8 supported | Existing folio editor | Folio preserved; new shared dock; existing song; Premium film | Styles V2 author/save/public, phase9 film, unit regressions |
| Royal Garden Cinematic / `royal-garden-cinematic` | Yes, premium | Bespoke calendar; shared date picker not exposed by design | 8 supported | Existing cinematic/scene studio | Bespoke film scene/navigation preserved; Premium remains server-owned | Existing Royal unit suite; shared program markup tests; no new claim of all 8 styles visually certified inside Royal |
| Digital Yes / `the-digital-yes-wedding` | Local only | 8 supported | 8 supported, including legacy flat schedules | Existing seal/cover editor | Existing top music and guest actions preserved; Premium film | Styles V2 author/save/public; phase9 film |
| Emerald Luxe / `emerald-canva-luxe-wedding` | Local only | 8 supported | 8 supported in flip-card program | Existing curtain/flip editor | Bespoke flip controls and audio retained; Premium film | Styles V2 author/save/public; phase9 film. Shared dock not overlaid on the flip-card navigation |
| WithJoy / `withjoy-modern-portal` | Local only | 8 supported | 8 supported | Existing portal editor | Existing navigation/audio retained; coverless shared film entry | Styles V2 author/save/public; phase9 film |
| Bliss Editorial / `bliss-editorial-wedding` | Local only | 8 supported | 8 supported | Existing editorial editor | Existing navigation/audio/RSVP drawer retained; shared film entry | Styles V2 author/save/public; phase9 film |
| Golden Canva / `khmer-golden-canva-inspired-wedding` | Local only | 8 supported | 8 supported | Existing canonical editor | Bespoke bottom navigation/music retained; Premium film | Styles V2 author/save/public; phase9 film |
| Cover Golden / `cover-khmer-golden-wedding` | Local only | 8 supported | 8 supported | Same compatible Golden renderer | Existing bottom navigation/music | Styles V2 author/save/public |
| Event Essential / `event-essential` | Yes, Free | 8 supported through existing settings editor | 8 supported | Not a decorative cover template | Existing neutral guest flow and optional Premium film | Styles V2 author/save/public, EventDetails unit tests, phase9 film |
| Koupreng Demo / `koupreng-demo-wedding` | Yes, Free | 8 supported | 8 supported | Existing shared experience | Existing shared navigation/music | Styles V2 author/save/public |
| Developer boilerplate / `template-boilerplate`, `custom-starter` | Not in observed active catalog | Not supported by design | Not supported by design | Existing starter contract | Not promoted as a finished public wedding design | Capability exclusions; no full publication certification |

## Authority and coverage

The base Floral design remains Free. Existing account quotas and template purchase
rules are unchanged. PRE_WEDDING_VIDEO remains Premium on the server. Free, Pro,
expired, owner/stranger, private guest credentials, selected media ownership and
protected bytes are exercised in the real disposable MySQL test; existing browser
fixtures cover Free/Basic/Pro/Premium/Custom Floral authoring. Unknown/expired plan
semantics remain those of EntitlementService, not client capability flags.

All style variants consume canonical dates and normalized schedules. All 8+8
variants round-trip through the draft/public serializer tests; browser scenarios
exercise live editor saves and publication projections, not a real external account.
H2/MySQL tests separately prove server persistence and authorization. Actual
Cloudinary provider credentials, physical Safari and live customer publication
were not used. No production deployment or payment flow was changed.

The shared dock is added where it fits existing choreography. Royal, Golden,
WithJoy, Bliss, Digital Yes and Emerald retain their bespoke controls; this document
does not claim they have all been replaced with one identical navigation bar.
