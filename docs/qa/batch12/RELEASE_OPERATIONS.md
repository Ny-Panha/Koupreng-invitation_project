# Release and recovery runbook

**NO-GO: do not deploy from this assessment.** This is the operating procedure after blockers are closed, not evidence that deployment occurred.

1. Record the exact immutable commit/artifact, provider topology and rollback owner. Require all eleven CI jobs, fresh audits, incident closure and staging/provider/device acceptance. Resolve or explicitly approve the measured public asset-budget exception. Retain the prior compatible artifact.
2. Store secrets only in the provider secret store; prove compromised credentials invalid. Never expose backend secrets through VITE variables. Verify the production profile, MySQL 8/JDK 25/Node 22/Python 3.13 and environment validation. Local Node 26/Python 3.14 evidence is not target-runtime proof.
3. Validate Compose and Nginx assumptions on the actual host. Local `docker compose config --quiet` passes; no daemon was available for image/runtime checks. Verify HTTPS/HSTS/certificates, DNS/Cloudflare WAF if used, CORS/CSP/cookies, forwarded-header trust, internal MySQL/Redis networks, rate limits and upload limits.
4. Back up MySQL and public/private uploads before schema changes. Use `infra/backup/mysql-backup.ps1`, encrypted/offsite retention and checksums. Restore to an isolated namespace and compare counts, currency totals and representative media access. Prove the restricted TLS backup role works. The helper's routines/tablespaces flags need deliberate grant alignment; prefer no-tablespaces over unnecessary PROCESS grants where appropriate, and verify routine permissions.
5. Apply forward Flyway migrations with the designated account. Never edit applied files/history rows. Separate migration and runtime grants (`infra/mysql/mysql-least-privilege.sql`). Check health, compatibility and ownership/payment/RSVP/check-in queries before traffic cutover.
6. Start the existing API/frontend/worker services using their real scheduling/health configuration. Verify retries/idempotency, pending notification failures and reconciliation queues. Alert on settlement/review/dispatch failures, DB/Redis errors and upload denials. Check credential redaction and pre-fix log retention. The SQL monitor does not measure complete JDBC wall time.
7. Cut over only after recorded staging acceptance. Monitor error rate, latency, pending/review payments, guest identity, queues and storage. On regression stop cutover/dispatch and restore the prior compatible artifact. If schema compatibility is uncertain, use verified isolated restore or forward repair; never erase settlement/audit history or improvise destructive migration rollback.

## Actual restore evidence

The existing helper backed up a newly owned synthetic MySQL schema, restored it to the same owned name, and preserved three rows, Khmer text, separate USD 12.50/KHR 50,000 totals and ordered-row SHA256. The owned schema was then removed. This does not prove restricted TLS roles, routines/events, upload-volume restore, offsite durability, provider snapshots or real recovery objectives. Those remain target acceptance checks.

No deployment, production restart, credential rotation or production restore was performed. Update the deployment checklist and incident owners with evidence before changing the verdict.
