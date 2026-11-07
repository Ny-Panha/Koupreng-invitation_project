# Generated asset prompts

Mode: built-in `image_gen`, not CLI. Final WebP assets are in `apps/frontend-user/public/templates/royal-garden/v4/`. Only resized/encoded from the generated PNGs; frame alpha was preserved.

## Burgundy velvet

`transparent_background: false`

```text
Use case: photorealistic-natural. Asset type: production web animation texture, single vertical velvet theater curtain panel. Create ONLY a rectangular uninterrupted panel of luxurious deep burgundy wine velvet cloth, full bleed, tall portrait approximately 1:2.5 proportions. Soft irregular vertical hanging folds run from top edge through bottom edge. Deep shadows in fold troughs, rich wine red highlights, subtle velvet nap, realistic soft stage lighting, restrained and elegant for a traditional Cambodian wedding invitation. Camera straight on, completely flat orthographic composition. Edges are fabric through every pixel; no room, rod, stage, ropes, border, tassels, ornament, text, logo, people, transparency, opening, or background scene. No symmetry or repeated striped gradient look. Palette: shadows #260617, main cloth #560822, soft highlights #871437. This texture will be placed inside two moving CSS curtain panels with separate gold edging; do not render a pair of curtains or a center gap. Save generated image to disk so it can be copied into the web project.
```

## Gold heritage frame

`transparent_background: true`

```text
Use case: stylized-concept. Asset type: transparent ornamental foreground frame for a Cambodian royal wedding web invitation. Create an original elegant 9:16 portrait gold Khmer kbach scrollwork frame, front-facing, extremely fine polished antique yellow gold with soft embossed highlights. Outer rectangular silhouette. Slim straight vertical double gold rules at x=4% and x=96%, from y=16% to84%; no heavy architectural columns. At the four corners, exquisite curling acanthus / Khmer flame scrolls branch inward and outward, sculpted gold tendrils. The top is symmetrical and gently arched, sweeping gold curls ONLY inside top 15% of canvas, with a tiny hanging wedding bell motif at top center. Bottom symmetrical scrolling flourish ONLY in bottom 14%, with a small inward centered curl. Rounded inner corners. Huge empty completely transparent center extends from x=8% to92%, y=17% to83%. ALL non-gold pixels must be truly transparent, including outside the frame and inside the opening. Do not fill with any colored background. Detailed yet light airy gold flourishes, balanced gilded silhouettes like traditional burgundy and gold Khmer invitations. No diamonds, gemstones, flowers, lotus flower, crown, giant crest, shield, monogram, initials, text, letters, people, phone mockup, shadows on background, backdrop, extra border or watermark. Entire frame must fit inside canvas with a 2% transparent outer margin; nothing cropped.
```

The generated frame's native output is 1024×1536; its straight sides use nine-slice framing to fit the existing portrait canvas without stretching the gold corners. It is original reference-inspired artwork, not a claim of pixel identity with the reference frame.
