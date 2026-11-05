# Koupreng Security Operations

This repo now has application controls plus repeatable server-side setup files.

## What is already implemented in the app

- WAF: `apps/backend/src/main/java/com/koupreng/backend/waf/WafFilter.java`
- HTTPS/HSTS enforcement: `HTTPS_REQUIRED`, `HSTS_ENABLED`, and Spring Security redirects
- JWT: signed local JWTs with issuer validation and token version invalidation
- Optional auth cookie mode: HttpOnly Secure SameSite JWT cookie plus Bearer header compatibility
- RBAC: `/api/v1/admin/**`, `/api/admin/**`, and admin controllers require `ROLE_ADMIN`
- Rate limiting: WAF per-IP limiting plus auth endpoint limiting
- Input validation: Jakarta validation on DTOs and file upload signature checks
- Monitoring: Spring Actuator health/info/prometheus endpoints

## Production-only guardrails

When the backend runs with `SPRING_PROFILES_ACTIVE=prod`, startup fails if:

- `JWT_SECRET` is weak or still uses the example value
- `HTTPS_REQUIRED` or HSTS is disabled
- CORS uses wildcard or non-HTTPS origins
- WAF is disabled or audit-only
- rate limiting is not Redis backed
- the database URL does not require TLS
- JPA schema auto-update is enabled
- first-user-admin bootstrap is enabled

## Minimum production environment

Use values like these on the server:

```properties
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://db.example.com:3306/koupreng_db?sslMode=VERIFY_IDENTITY&serverTimezone=Asia/Phnom_Penh
DB_USERNAME=koupreng_app
DB_PASSWORD=change-this
JWT_SECRET=change-this-to-a-random-64-plus-character-secret
JWT_ACCESS_TOKEN_MINUTES=15
AUTH_COOKIE_ENABLED=true
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_HTTP_ONLY=true
AUTH_COOKIE_SAME_SITE=Lax
AUTH_COOKIE_MAX_AGE_SECONDS=900
CORS_ALLOWED_ORIGINS=https://koupreng.example.com,https://admin.koupreng.example.com
CORS_ALLOW_CREDENTIALS=true
HTTPS_REQUIRED=true
HSTS_ENABLED=true
CLIENT_ADDRESS_FORWARDED_HEADERS_ENABLED=true
RATE_LIMIT_BACKEND=redis
RATE_LIMIT_FAIL_CLOSED=true
WAF_ENABLED=true
WAF_AUDIT_ONLY=false
```

## Operational Checklist & Production Readiness

### 1. Redis Fallback Telemetry (`auth.cache.fallback`)
`UserAuthCacheService` automatically falls back to direct database lookups if Redis is unreachable. However, to prevent a silent Redis failure from overwhelming the database connection pool:
- The service logs a warning: `auth.cache.fallback user=<id> reason=<reason>: <details>`
- A Micrometer counter is published: `auth.cache.fallback` with tag `reason` (`redis_unavailable`, `redis_read_error`, `redis_write_error`, `redis_evict_error`).
- **Recommended Alerting Rule (Prometheus/Alertmanager)**:
  ```yaml
  - alert: UserAuthCacheRedisFallbackHigh
    expr: rate(auth_cache_fallback_total[2m]) > 0
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "User authentication cache is falling back to relational database"
      description: "Redis is unavailable or failing for JWT auth lookups. Relational DB pool exhaustion risk under load."
  ```

### 2. Upstream Reverse Proxy CSP Preservation (`/uploads/**`)
`UploadSecurityFilter` enforces:
- `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`
- `X-Content-Type-Options: nosniff`

When placing an upstream CDN / reverse proxy in front of the backend:
- **Nginx**: Ensure `infra/nginx/koupreng-api.conf` retains `proxy_pass_header Content-Security-Policy;`, `proxy_pass_header X-Content-Type-Options;`, and `proxy_hide_header Set-Cookie;`.
- **Cloudflare**: In **Caching -> Cache Rules**, if caching `/uploads/*`, verify that Transform Rules or Edge Workers do not strip or rewrite `Content-Security-Policy`. Disable automatic script injection for the `/uploads/` path.
- **AWS CloudFront**: Attach a **Response Headers Policy** that enforces `Content-Security-Policy` and `X-Content-Type-Options`, or configure Cache Behavior to forward and include origin response security headers.

### 3. SPA 401 Interceptor Verification
When an administrator modifies a user's role or status, `UserAuthCacheService.evict(userId)` invalidates the cached auth state immediately across all nodes:
- The user's next request receives `401 Unauthorized`.
- **Frontend Interceptors**:
  - `apps/frontend-user/src/shared/api/httpClient.js`
  - `apps/frontend-admin/src/shared/api/adminHttpClient.js`
- Both clients immediately invoke `clearStoredAuth()` / `clearAuth()` to purge tokens from storage.
- If the current route is not `/login`, the client redirects to `/login?next=<current_path>` while strictly checking `!window.location.pathname.startsWith("/login")` to prevent reload loops.

## Files in this folder

- `nginx/koupreng-api.conf`: HTTPS reverse proxy with public API routing, upload security header forwarding, and restricted metrics routing.
- `firewall/ufw-setup.sh`: Linux UFW baseline for SSH, HTTP, HTTPS, backend, and monitoring ports.
- `firewall/windows-firewall.ps1`: Windows Defender Firewall equivalent.
- `monitoring/prometheus.yml`: Prometheus scrape example for `/actuator/prometheus`.
- `infra/mysql/mysql-least-privilege.sql`: app, migration, and backup database users with SSL required.
- `backup/mysql-backup.ps1`: MySQL dump backup with retention cleanup.
- `backup/postgres-backup.ps1`: legacy backup helper retained for reference only; the current project database is MySQL.

