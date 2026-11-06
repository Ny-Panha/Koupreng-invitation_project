# Original realistic effects — built-in imagegen

2026-11-06. The user authorized three source-inspired effects if the supplied
green/black-screen clips did not suit the portrait template. These are original
generated bitmap assets, not extracted video frames. All three calls used the
built-in imagegen tool with `transparent_background: true`; no API/CLI mode was
used. The original PNGs remain locally under `output/floral-source-effects/masters`.
Lossless, transparent 1536 × 1024 working masters are committed in
`assets/khmer-floral-gold/realistic-effects`. Runtime sprites preserve the source
pixel dimensions and use high-quality WebP; no low-resolution animated fallback
is used. Near-zero alpha padding was cleared before packaging.

## Butterfly atlas — final prompt

Use case: photorealistic-natural. Asset type: transparent bitmap sprite atlas for
a premium Khmer wedding invitation. Create four separate lifelike butterflies as
high-resolution studio macro cutouts in a precise 2 by 2 grid on genuinely
transparent alpha, each isolated with generous clear padding. Top-left warm amber
monarch, top-right iridescent blue morpho, bottom-left soft violet butterfly,
bottom-right ivory swallowtail with subtle blush detail. All viewed dorsally from
above with wings open, realistic fine wing scales, delicate antennae and natural
thin bodies. These will flutter around cream and gold floral wedding stationery;
refined natural colors, no cartoon outlines, no stylization, no shadows or floor,
no motion blur, no scenery, no text, no labels, no borders. Every butterfly entirely
inside its own quadrant and no touching or overlap. Crisp HD detail and anatomically
coherent symmetrical wings. A new original artwork inspired by colorful butterfly
footage.

## Blossom branch — final prompt

Use case: photorealistic-natural. Asset type: high-resolution transparent floral
corner for a luxury Khmer wedding invitation. Create a graceful flowering branch
entering from the upper right and curving gently toward the upper left, with
delicate ivory and pale blush cherry blossoms, a few small buds, sparse muted sage
leaves, and slender natural brown stems. Realistic macro botanical photography
with soft diffused natural light, fine petal veins, translucent petal edges, real
organic irregularity. Composition wide, most flowers along the upper right and top
edge, ample empty transparent space lower-left, the entire silhouette comfortably
inside the canvas without clipping. Restrained elegant professional wedding
styling matching white roses, cream paper, champagne gold. Absolutely transparent
alpha background, no white/black backdrop, no cartoon outlines, no illustration,
no text or watermark, no fake sparkle. This original asset will sway gently like
wind; inspired by a flowering-branch-and-falling-blossom video.

## Petal atlas — final prompt

Use case: photorealistic-natural. Asset type: transparent HD petal sprite atlas for
a premium wedding invitation animation. Six separate individual real lotus or rose
petals as macro photographic cutouts in a precise three-column by two-row grid,
generous transparent gaps. Single petals only, no whole flowers. Soft ivory,
translucent blush, warm pale rose; subtle natural curled shapes and varied
orientation, delicate visible veins, realistic organic edges. Each petal entirely
inside its own cell with no overlap, no connected stems, no cast shadow, no floor,
no text, no cartoon outlines. Genuinely transparent alpha background. Crisp
high-resolution realistic details for slow natural falling and turning animation
over cream and gold stationery. A new original artwork inspired by soft pink and
white petals in supplied footage.

## Selected white/green border — restoration prompt

Input: `assets/ritilsa_ssspin.io_1793970094.jpg` (edit target), after the user
replaced the earlier background. Native source: 675 × 1200. Built-in imagegen,
transparent background. Restored atlas: 1536 × 1024; two native 1536 × 512 edges.
Working master: `assets/khmer-floral-gold/realistic-effects/white-green-border-hd.webp`.
This is HD restoration/extraction, not native 4K.

+Use case: precise-object-edit / high-resolution restoration. Image 1 is the user's chosen floral invitation border and is the edit target. Preserve its exact white and ivory flowers, muted natural green leaves, golden stamens, overall composition, botanical shapes and colors; faithfully restore crisp realistic fine petal veins and leaf texture from this soft small original. For use as high-density web border assets, output a landscape 1536x1024 or larger native-resolution transparent atlas with exactly TWO wide horizontal floral strips: the original top border across the TOP HALF, and the original bottom border across the BOTTOM HALF, separated by a clear transparent gap. Keep both strips the full canvas width, horizontally oriented, all flower silhouettes inside their respective half without overlap. Remove ONLY the plain empty white paper background to genuine transparent alpha, while keeping WHITE FLOWERS FULLY OPAQUE and crisp. Match the reference, do not redesign into different flowers, do not recolor or stylize, no blur, no opacity fade, no text, no logos, no extra decoration, no shadows or background. This is a faithful HD restoration and border extraction of the provided image for cream-and-gold Khmer wedding stationery, not an unrelated new floral design.
