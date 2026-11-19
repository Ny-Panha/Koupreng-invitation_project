"""Record Codex's bounded visual inspection of actual frozen-build captures.

Re-run review_images.py and inspect its sheets/focused captures before updating
these observations. This does not perform automated cultural/art certification.
"""
import json
from audit import RAW,ROOT,write,sha

build=json.loads((RAW/'current-build-source.json').read_text(encoding='utf-8'))
notes={
 'khmer-floral-gold':'White botanical/gold cover and paper main retain distinct ornaments, couple/family hierarchy and floating navigation. Initial Skip is visible below the audio controls.',
 'royal-garden-cinematic':'Burgundy/gold theatre, traditional couple cover and formal family invitation retain their composition. Initial Skip is separately visible. This is poster/DOM art evidence, not physical video/audio validation.',
 'silk-heritage':'Burgundy woven folio opens to cream, burgundy Khmer names, fine gold rules and portrait. Desktop1440 focused capture paints both hero columns and family cards. Runtime art source is unchanged by Codex.',
 'template-boilerplate':'Dark developer starter panels, gold actions and date/RSVP hierarchy remain. This generic API fixture has empty couple names; its ampersand is missing-field robustness evidence, not a complete authored invitation art sample.',
 'khmer-celestial':'Actual source is an ivory botanical ceremony with gold details. Settled cover and main text now paint clearly; it is not replaced with the report’s proposed generic dark starfield.',
 'the-digital-yes-wedding':'Wax envelope/paper and wine-dark gold/glass main remain distinct. Top Skip is separated from audio and sticky purchase action appears only after reveal. Generic fixture has empty couple names; no complete name-art certification is inferred.',
 'emerald-canva-luxe-wedding':'Green curtain, gold badge, emerald double card and Flip Card control paint. Focused320 capture shows the card, controls and scroll content. Empty fixture names do not certify every long-name/zoom case; separate degradation/unit fixtures cover selected long text.',
 'withjoy-modern-portal':'Coverless navy/white portal and pill navigation/photo composition remain. White text over variable photography still needs image-specific manual contrast review; automated axe cannot certify every photo pixel.',
 'bliss-editorial-wedding':'Coverless warm-paper editorial portrait, compact navigation and persistent RSVP drawer keep their identity. Missing names in the generic fixture are explicitly bounded; drawer behavior has separate keyboard/draft evidence.',
 'cover-khmer-golden-wedding':'Gold/cream spotlight cover opens immediately to the garden hero after Skip, with no outgoing cover occupying the top flow. Empty photo frame is the supplied fixture state. Decorative pointer/photographic rights and native design approval remain unverified.',
}
rows=[]
for family,note in notes.items():
    paths=[RAW/'acceptance-frozen'/f'{family}-normal-{state}.png'for state in ['cover','open']]
    rows.append({'family':family,'observation':note,'captures':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)}for p in paths if p.exists()],'inspector':'Codex visual inspection, not native/cultural/rights-holder approval','scope':'390x844 normal-motion cover and top844 of invitation on inspection sheet; full PNG retained. Desktop Silk and narrow Emerald also inspected.'})
write('visual-review-notes.json',{'build_fingerprint':build['source_fingerprint'],'families':rows,'sheets':[{'path':(RAW/name).relative_to(ROOT).as_posix(),'sha256':sha(RAW/name)}for name in ['visual-review-1.jpg','visual-review-2.jpg']],'limitations':['No authenticated pre-Gemini art baseline','Top-of-page inspection does not certify every lower section','Missing generic fixture names are not invented or replaced with private wedding data','Intentional petals/graphics/time-dependent countdown differences are not automatically regressions','Native Khmer, physical zoom/AT and legal/media approval remain external']})
