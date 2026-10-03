# Historical template recovery (DB-003)

Status: **NEEDS_OWNER_DECISION / NEEDS_PRODUCT_DECISION** for existing customer data. No automatic reassignment is safe.

Migration V16 changed template references in invitations, both order models and purchased access, then deactivated other catalog entries. Its SQL contains no per-row record of the former template IDs. Current code cannot reconstruct those references reliably. Template names and invitation design JSON can help investigate; neither is authoritative proof of a historical template ID.

All historical migrations, template IDs, invitations, orders, purchases, renderers and assets remain preserved. Do not edit V16 or change its checksum. Do not delete inactive templates, merge purchases, rewrite financial history or run a blanket reverse migration.

Recovery requires a pre-V16 backup or another authoritative record tied to the original row IDs. Work on a restored, isolated copy first:

1. Compare the backup with the current schema using immutable invitation/order/access primary keys. Preserve each current record and its relationships.
2. Produce an explicit mapping containing entity type, primary key, current template ID, proposed historical template ID and evidence. Keep customer records outside Git.
3. Verify each destination template still exists and has its original renderer/assets. Determine whether historical access should remain usable while new checkout stays disabled.
4. Review duplicate access constraints and subsequent customer edits. Never infer a destination from a display name alone.
5. Obtain owner approval for the exact mapping and test a new forward-only migration or transactional recovery operation on the restored copy. Require affected-row counts, preconditions and an independent backup. Recheck all invitation, payment, subscription and template relationships.
6. Reconcile before/after counts, render restored invitations and verify paid access. Preserve a private rollback mapping; do not modify payment amounts, statuses or evidence.

Read-only inventory queries for the isolated copy:

```sql
SELECT template_id, code, name, status FROM templates ORDER BY template_id;
SELECT template_id, COUNT(*) FROM invitations GROUP BY template_id;
SELECT template_id, COUNT(*) FROM template_payment_orders GROUP BY template_id;
SELECT template_id, COUNT(*) FROM template_orders GROUP BY template_id;
SELECT template_id, COUNT(*) FROM user_template_access GROUP BY template_id;
SELECT COUNT(*) FROM invitations i
LEFT JOIN templates t ON t.template_id = i.template_id
WHERE i.template_id IS NOT NULL AND t.template_id IS NULL;
```

Without authoritative historical mapping, retain the current data and report recovery as unresolved. A fresh migration test validates schema compatibility; it does not establish that existing customer template references are historically correct.
