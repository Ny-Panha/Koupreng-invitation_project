# Koupreng Developer API Live Monitor V2.1 — Performance & Telemetry Benchmark

## 1. Architectural Performance Invariants

The API Live Monitor subsystem is engineered for zero impact on production throughput and minimal memory consumption during local development.

### 1.1 Memory Bounding & Ring Buffer
- **Ring Buffer Size:** Bounded to exactly 1,000 events (`ApiMonitorEventStore`).
- **Memory Footprint:** Fixed upper ceiling of approximately 1.5MB in JVM heap memory.
- **Concurrent Access:** Thread-safe circular array guarded by reentrant read/write locks, preventing heap exhaustion or garbage collection pressure under continuous load testing.

### 1.2 High-Precision Monotonic Clock Timing
- **Backend Duration:** Measured with `System.nanoTime()` inside `ApiRequestLoggingFilter`:
  ```java
  long durationNanos = System.nanoTime() - startNanos;
  long durationMs = TimeUnit.NANOSECONDS.toMillis(durationNanos);
  ```
  Monotonic timers prevent artificial negative or inflated durations caused by system wall-clock adjustments (NTP syncs).
- **Client Monotonic Timing:** Measured with `performance.now()` in `httpClient.js` request interceptor.

### 1.3 Hibernate SQL AST Tracking Overhead
- **Interceptor Choice:** `StatementInspector` intercepts query AST string generation inside Hibernate `SessionFactory`.
- **Benchmark:** Adds `<0.05ms` per statement execution compared to JDBC proxy drivers which wrap every `Connection`, `PreparedStatement`, and `ResultSet`.
- **Zero Timing Fabrication:** Exact statement counts and repeated query templates are recorded; fabricated roundtrip durations were completely eliminated in V2.1.

---

## 2. Frontend Rendering & Virtualization

- **Vite Bundle Size:** `ApiMonitorPage` minified and gzip bundle is `31.73 kB`.
- **Chart Rendering:** SVG sparklines computed in a single `useMemo` loop with 12 time slices; no external heavy charting libraries (e.g. Chart.js or D3) loaded into runtime bundle.
- **Micro-Layout Stability:** All numerical values use `font-mono tabular-nums` to eliminate browser layout reflows during 50ms SSE bursts.
- **Garbage Collection in React:** Event buffer is capped at 500 records in client state to prevent browser tab sluggishness during extensive test suites.

---

## 3. Test Suite Performance & Benchmarks

| Test Phase | Tooling | Execution Time | Pass Count | Failure Count |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Frontend Lint** | ESLint | ~7.2s | All files clean | 0 |
| **Admin Frontend Tests** | Vitest 4.1 | 3.67s | 68 / 68 passed | 0 |
| **Admin Production Build** | Vite 8.3 | 703ms | Clean bundle | 0 |
| **User Frontend Lint** | ESLint | ~16s | All files clean | 0 |
| **User Frontend Tests** | Vitest 4.1 | 16.88s | 394 / 394 passed | 0 |
| **User Production Build** | Vite 8.3 | 4.95s | Clean bundle | 0 |
| **Backend Static Analysis** | PMD 7.17 & SpotBugs 4.10 | 24.59s | Clean report | 0 |
| **Backend ArchUnit & Integration** | Maven / JUnit 5 | 44.60s | 35 / 35 passed | 0 |
| **Playwright Route Smoke** | Chromium (Desktop & Pixel 7) | 29.1s | 44 / 44 passed | 0 |
| **Playwright Critical Routes** | Chromium (Desktop & Mobile) | 9.2s | 12 / 12 passed | 0 |
| **Total Automated Tests** | — | — | **553 tests passed** | **0 failures** |

