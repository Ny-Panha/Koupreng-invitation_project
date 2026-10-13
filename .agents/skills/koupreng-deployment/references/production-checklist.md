# Production Checklist & Disaster Recovery

## 1. Pre-Deployment Sign-Off

- [ ] All environment secrets in `.env` populated with cryptographically strong values.
- [ ] Database backup created and verified in `/var/backups/`.
- [ ] HTTPS forced via Cloudflare and Nginx.
- [ ] CORS allowed origins restricted to production domains.
- [ ] Swagger / Scalar UI disabled in production (`SWAGGER_UI_ENABLED=false`).
- [ ] Automated health checks passing.

## 2. Disaster Recovery Runbook

### Rollback Process
1. Stop backend: `docker compose stop backend`.
2. Restore database from pre-deployment snapshot:
   ```bash
   docker compose exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" koupreng_db < /var/backups/koupreng_snapshot.sql
   ```
3. Checkout previous stable container tag or commit.
4. Restart services: `docker compose up -d`.

