---
name: koupreng-deployment
description: "Production operations, Docker Compose orchestration, Nginx reverse proxy configuration, and low-budget VPS deployment for Koupreng. Use when modifying Docker Compose services, container health checks, Nginx routing, Cloudflare WAF integration, environment secrets, database backup procedures, or deployment runbooks."
---

# Koupreng Deployment & Infrastructure Standards

## 1. Low-Budget Production Architecture

Koupreng is engineered to run cost-effectively on a standard Linux VPS (Ubuntu/Debian) fronted by Cloudflare:

```text
Internet
   │ (HTTPS / DNS / DDoS Protection / WAF)
   ▼
Cloudflare Edge
   │ (Strict SSL / Authenticated Origin Pulls)
   ▼
VPS Host (UFW Firewall: ports 80/443 open to Cloudflare only; SSH on non-standard port)
   │
   ▼
Nginx Gateway (Reverse Proxy / Security Headers / SSL Termination / Rate Limiting)
   │
   ├─► frontend-user:8080   (Vite static SPA build)
   ├─► frontend-admin:8080  (Admin console SPA build)
   ├─► backend:8080         (Spring Boot 4 container, JVM optimized)
   └─► telegram-bot:8000    (FastAPI + uvicorn worker)
         │
         ▼
Internal Docker Network (`data` network — isolated, no external port exposure)
   ├─► mysql:3306 (MySQL 8.0, persistent volume `mysql-data`)
   └─► redis:6379 (Redis 7.4-alpine, persistent volume `redis-data`)
```

> **Cardinal Operational Invariant:** Never deploy, restart live production services, or modify live DNS records without explicit human authorization.

---

## 2. Docker Compose Topology & Health Checks

Every service in `docker-compose.yml` must define a reliable healthcheck to enable zero-downtime rolling updates:

- **MySQL:** `mysqladmin ping --silent -h 127.0.0.1 -u root -p$$MYSQL_ROOT_PASSWORD`
- **Redis:** `redis-cli ping`
- **Backend:** `curl --fail --silent http://localhost:8080/actuator/health/readiness`
- **Frontends:** `wget -q -O /dev/null http://localhost:8080/health`
- **Telegram Bot:** `python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=3)"`
- **Gateway:** `wget -q -O /dev/null http://localhost:8080/health`

### Service Dependency Order
Services start in dependency order using `condition: service_healthy`:
```text
mysql + redis (healthy) ──► backend (healthy) ──► telegram-bot + frontends ──► gateway
```

---

## 3. Deployment Runbook & Migration Ordering

When releasing a new version to production, follow this strict sequential order:

1. **Pre-Deployment Backup:**
   ```bash
   # Create snapshot before any migration runs
   docker compose exec mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
       --single-transaction --quick koupreng_db > /var/backups/koupreng_$(date +%Y%m%d_%H%M%S).sql
   ```
2. **Pull Updated Container Images:**
   ```bash
   docker compose pull
   ```
3. **Deploy Backend (Executes Flyway Migrations):**
   ```bash
   docker compose up -d --no-deps backend
   # Monitor logs to ensure Flyway schema migrations succeed
   docker compose logs -f backend
   ```
4. **Deploy Frontends & Worker:**
   ```bash
   docker compose up -d --no-deps frontend-user frontend-admin telegram-bot
   ```
5. **Reload Nginx Gateway:**
   ```bash
   docker compose exec gateway nginx -s reload
   ```
6. **Post-Deployment Verification:**
   Inspect `/actuator/health` and verify key endpoints return HTTP 200.

---

## 4. Security & Hardening Rules

- **Internal Data Network:** MySQL and Redis MUST NEVER bind ports to `0.0.0.0` or expose host ports in production `docker-compose.yml`. They communicate exclusively across the internal `data` bridge network.
- **Environment Secrets:** Secrets live in `.env` with file permissions `chmod 600 .env`. Never commit `.env` or production passwords to git.
- **Security Headers:** Nginx enforces:
  - `X-Frame-Options: SAMEORIGIN` (or explicit CSP `frame-ancestors` for invitation widgets)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
- **Forwarded Headers:** Spring Boot must configure `server.forward-headers-strategy=native` and `CLIENT_ADDRESS_FORWARDED_HEADERS_ENABLED=true` so audit logs capture real client IPs passed through Cloudflare and Nginx.

---

## 5. Detailed References

- [Docker Compose Architecture](references/docker-compose-architecture.md)
- [Nginx Gateway Configuration](references/nginx-gateway-configuration.md)
- [Production Deployment & Disaster Recovery Checklist](references/production-checklist.md)

