# 09 — cover upload type size focal and memory

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Browser and backend agree on JPG/JPEG, PNG and WebP, **5,242,880 bytes**. Exact maximum and maximum+1, empty file, unsupported MIME, HEIC and mismatched extension tests are explicit. The chooser resets so the same file can be reselected after rejection; backend content validation remains authoritative.

The actual focal protocol remains `top|center|bottom` through `designJson.coverFocalPoint`. It is checkpointed and merged with unknown design keys. No unrecognized XY format or uploaded blob is written into JSON.

Object URL cleanup has one owner: the parent effect revokes a replaced/removed/unmounted URL. A test uses distinct URLs and asserts each is revoked once; the old immediate handler revocation was removed. Picker replacement/removal focus is maintained.

Real camera orientation, corrupted-preview decoding, portrait/face crops and physical HEIC conversion are not certified. The browser fixture uses an artificial PNG, not a licensed customer photo. [Type/recovery constraints](evidence/upload-recovery-matrix.json), [tests](evidence/negative-tests-register.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
