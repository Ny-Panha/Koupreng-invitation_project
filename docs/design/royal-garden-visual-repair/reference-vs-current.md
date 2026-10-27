# Measured reference versus rejected implementation

This is the baseline for the critical steering received during the first repair, before the second structural rewrite. Main started at `32e95466a2a55ba1cd53701012903a702c06e10b`; no work had been committed or pushed when this steering arrived.

The user supplied LEFT/RIGHT comparisons are preserved in [references](references/crop-metadata.json). Each side was cropped independently, excluding the comparison's labels and surrounding page. Proportional 390x844 normalization preserves the original image geometry; it does not stretch either scene. Source crops: cover LEFT 400x703 / RIGHT 400x711; video LEFT 400x693 / RIGHT 400x866; information LEFT 400x687 / RIGHT 400x866. The HEICs and the 44 inspected recording frames remain additional references, not substitute layouts.

[Actual pre-rewrite DOM geometry](baseline-geometry.json) records pixel bounds, normalized bounds, computed font size/line height, stacking and object-fit at 390x844. [Cover](evidence/before-cover.png), [video](evidence/before-video.png), [information top](evidence/before-information.png), [scrolled information](evidence/before-information-scrolled.png).

Coordinates below are x/y/width/height percentages. LEFT painted bounds were manually measured from the independently cropped supplied screenshots to approximately five source pixels; current element bounds are measured from the browser. Painted video bounds additionally account for contain letterboxing. These are composition measurements, not a claimed automated pixel similarity score.

| Component | LEFT target bounds, approximately | Current at 390x844 | Defect / required correction |
| --- | --- | --- | --- |
| Cover photograph | 5/14/90/81; subjects dominate the center | Photo element 11/31.9/78/39.4 | P0: replace small curved window with a tall source-shaped aperture; retain original opaque art and owner focal position |
| Ceremonial heading | 16/15/69/12; roughly 28-32px at 390 width, two formal lines | Lettering box 23/26.2/54/9.9, actual contained artwork smaller | P0: reserve a wide heading region, use original art or editable Moul title, clear of faces and carvings |
| Names/date | Lower portrait, below faces and before greeting | 14/59/72/5.9, absolute placement | P1: grid-reserved lower region and bounded wrapping; no inner scrollbar |
| Guest framed band | 11/73/78/7; centered live name | Box 12/70.6/76/5.2; 6.75:1 display box for 3:1 source | P0: natural 3:1 artwork with a defined interior text zone; no background stretching |
| Open action | Centered circular play control around 46/85/9/5 | 24/76.4/52/6.5, wide rectangular/image CTA | P0: circular 44px minimum control with visible play icon and an accessible label |
| Cover ornaments | Full stage, portrait enclosed by gold | Stage 0/8.9/100/82.1 | P0: eliminate letterboxed canvas; preserve proportions through nondestructive responsive framing |
| Video imagery | Approximately full-width portrait canvas; subjects occupy most of its height | Element 12.3/47.5/75.4/39; painted portrait only about 47.5% of viewport width | P0: immersive portrait media without an outer black-looking box, redundant heading or button rows |
| Video monogram | Upper center, roughly 35/7/30/22 | Generic heading occupies top of page | P0: compact live gold initials/monogram above subjects |
| Video controls | Sparse corner controls, roughly 36-44px targets | Two full rows at y33.4% and y87.5% | P0: compact icon controls, discreet Skip/Continue and thin progress; keep keyboard labels and full contrast |
| Video footer | Bottom structural flourish, full width, natural ratio | 11/105.8/78/12, below first viewport | P0: connect intact footer to bottom of media scene, outside faces and controls |
| Information heading/family | Heading y13-20%; symmetric parents y23-29% | Family section 11/26.5/78/30.7 | P0: one denser ceremonial composition and a smaller formal heading/parent rhythm |
| Invitation/monogram | Paragraph y30-40%, monogram y43-61% | Invitation begins y57.2%; monogram y93.3% | P0: remove repeated heading/divider spacing, integrate live monogram and couple/date hierarchy |
| Information frame | Continuous border, top and bottom remain visible | Background fixed 0/0/100/100 but text scrolls over its ornaments | P0: independent stationary frame and one inner scroll safe zone; navigation and focus scroll that same container |
| Bottom navigation | Compact floating controls outside readable content | 3/92.3/94/6.8; overlaps scrolling text | P0: reserve its region outside content; prove final section reachability |
| Language | Compact floating selection in every scene | Hidden entirely for hosted invitations; player/RVSP language can stay saved locale | P0: presentation-only locale switch across cover, active film and information without remount/restart |

## Layer and typography constraints

The original arch is opaque. The photograph must be above only its blue interior; important gold ornaments remain outside its clip. Source-derived clipping geometry is separate from text placement. Foreground text uses a real composition grid and reserved rows. Guest artwork stays at 3:1. No supplied art is regenerated, recolored or erased.

For information, nondestructive nine-slice framing keeps top/bottom carving geometry at its original width scale and repeats the straight side detail vertically. It does not stretch the complete tall source into a viewport. Content scrolls in one central safe region with a visible top heading, reachable ending, keyboard/wheel/touch access and no text behind the fixed ornament/navigation.

The reference uses formal display Khmer, around 1.6-1.9 heading line height and restrained body leading. The current computed typography is retained in the JSON evidence. Owner-entered names, parents and messages remain canonical text and are not translated without a real English variant.

## Review gates

Pass 1 must correct canvas structure, portrait scale, circular action, immersive film and fixed-frame scrolling. Pass 2 measures typography, wrapping, crop, first/last section access and locale stability. Pass 3 reviews original ornament proportions, footer/controls, restrained motion and small-screen polish. Screenshots and updated measurements must accompany each pass. More effects are not a substitute for these P0 repairs.
