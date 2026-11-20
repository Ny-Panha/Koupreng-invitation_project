# Deep JSON and alternate readers

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

The shallow base spreads preserved unknown top-level keys but lost nested design keys when a colliding form object replaced the subtree. Gallery reconstruction dropped extension metadata, and initial form parsing truncated records beyond ten. Independent failures preceded repairs. preserveStudioJson merges plain object extensions, rejects prototype keys, honors explicit null and replaces edited arrays rather than restoring deleted/reordered rows by index. Gallery metadata is matched by stable id.

Two real form saves retain nested arrays/null/false/Khmer text, future locale keys and eleven existing photos. The alternate publicInvitationToDraft/draftToInvitationPayload path now carries raw JSON documents and edited locales, with its own failing-then-passing regression. The ten-photo limit still applies to adding new uploads; existing authored records are not silently erased. No global schema migration or backend serializer change was made.

Evidence:

- [defect-register.json](evidence/defect-register.json)
- [negative-tests.json](evidence/negative-tests.json)
- [test-runs.json](evidence/test-runs.json)

[Report index](README.md).
