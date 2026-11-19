"""Associate each existing visible RSVP label with its existing field."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
base = ROOT/'apps/frontend-user/src/features/templates'
for name, state, fields in [
    ('layouts/WithJoyPortalLayout.jsx','rsvpState',['name','guests','meal','song']),
    ('layouts/BlissEditorialLayout.jsx','rsvpState',['name','note']),
    ('layouts/DigitalYes/components/DigitalYesRsvpModal.jsx',None,['name','phone','count','wishes']),
    ('shared/RSVP/RsvpContainer.jsx','form',['name','phone','attending','guestCount','message']),
]:
    p=base/name; text=p.read_text(encoding='utf-8')
    text=text.replace('import { useState', 'import { useId, useState',1)
    # Stable per-instance IDs preserve focus and locale changes without global collisions.
    location=text.index('\n  const ',text.index('export default function'))
    text=text[:location]+'\n  const rsvpId = useId();'+text[location:]
    for field in fields:
        expression=f'{state}.{field}' if state else field
        token='value={'+expression+'}'
        pos=text.index(token)
        label=text.rfind('<label',0,pos)
        if label<0 or 'htmlFor=' in text[label:text.index('>',label)]:
            raise RuntimeError(f'Unexpected label for {name}/{field}')
        text=text[:pos]+f'id={{`${{rsvpId}}-{field}`}} '+text[pos:]
        text=text[:label]+f'<label htmlFor={{`${{rsvpId}}-{field}`}}'+text[label+6:]
    p.write_text(text,encoding='utf-8')
