# Bilingual data and compatibility

The existing invitation JSON column stores `localizedContentV1`; no table, column, currency, credential or migration changes were needed. All historical Flyway SQL files remain unchanged. A fresh MySQL migration and representative upgrade are exercised by the backend integration suite.

```json
{"localizedContentV1":{"version":1,"km":{"title":"Host-approved Khmer text"},"en":{"title":"Independent English draft"},"enabledLocales":["km"],"defaultLocale":"km"}}
```

`localizedContent.js` owns frontend seeding/projection. Legacy Khmer rows seed Khmer, never English. Stored locale values, including intentional empty optional text, outrank old mirrors and demo defaults. English fields are independently authored. Khmer mirrors the legacy root text and API title/names/venue/story columns. Wedding host/groom aliases stay aligned within one language; Event Essential uses neutral host names. Media references, dates, times, IDs, RSVP deadline, credentials and program row IDs remain canonical.

Collection text uses `collections.<collection>.<stable-row-id>.<field>`. Photos retain one image with independent alt/caption. Existing program `titleEn`, `descriptionEn`, `locationEn` and day titles stay on the original rows. Family and map labels use `{km,en}` text pairs.

`LocalizedInvitationPolicy` performs additive root/locale merges and bounded validation. Unknown root fields and omitted other-locale data survive replacement writers. Collections are bounded; locale strings and total JSON are capped. Existing and newly introduced locale content require `expectedUpdatedAt` on updates; the existing row lock rejects stale revisions with 409. This intentionally requires an old client to reopen a bilingual event instead of silently dropping its translations. Explicit empty strings clear optional text; omission preserves it. Array removal is an explicit replacement, not a deep row deletion protocol.

Only the owner approves English publication/default language. Enabling English validates required Khmer and English text, visible translated collections, enabled program rows, family pairs and enabled diagram labels. Hidden template sections are excluded. Disabling English removes English drafts, schedule/day English fields and family/map English pairs from public JSON. Private owner responses retain them. Query `lang=en` cannot authorize private access or enable a draft.

Evidence: `LocalizedInvitationPolicyTests`, `Phase7CollaborationMySqlTests`, `localizedContent.test.js`, adapter and form tests. Test results are recorded in report 10.
