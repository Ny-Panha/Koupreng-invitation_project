# Docker Compose Architecture Reference

## 1. Network Topology

The architecture divides network traffic into two isolated bridge networks:

- **`app` network:** Public-facing and application-level routing. Gateway, frontend-user, frontend-admin, telegram-bot, and backend communicate here.
- **`data` network (internal):** Storage layer. backend, mysql, and redis communicate here. `internal: true` prevents external egress or port leakage.

## 2. Volume Management

- `mysql-data`: Persists MySQL database tables and redo logs.
- `redis-data`: Persists Redis snapshots (`dump.rdb`).
- `uploads`: Stores uploaded invitation assets, guest avatars, and payment slips in `/app/uploads`.

## 3. Resource Limits & Tuning

For a low-cost 2 vCPU / 4GB RAM VPS:
- Backend JVM: `-XX:+UseG1GC -XX:MaxRAMPercentage=75.0`
- MySQL buffer pool: `innodb_buffer_pool_size=1G`
- Redis memory cap: `maxmemory 256mb maxmemory-policy allkeys-lru`

