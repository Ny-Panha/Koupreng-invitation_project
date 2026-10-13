# Koupreng Developer API Live Monitor V2.1 — UX & Motion Design Specification

## 1. Aesthetic Vision & Product Identity

The Koupreng Developer API Live Monitor V2.1 is designed to feel like an integrated enterprise developer product combining:
- **Chrome DevTools Network Panel:** High-density, fast-scanning table layout, status badges, and request inspection tabs.
- **Grafana & Datadog APM:** Live velocity sparklines, P95 SLA gauges, and real-time streaming health indicators.
- **Linear:** Refined typography, keyboard navigation via Command Palette (`Ctrl+K`), and subtle dark/light contrast.
- **Koupreng Brand Palette:** Warm Cambodian amber (`#f59e0b`, `#d97706`), deep slate/zinc backgrounds, and crisp emerald/rose semantic status indicators.

---

## 2. Motion Design Tokens & Accessibility Safeguards

### 2.1 Live Stream Pulse
- **Connected State:** Continuous emerald ping animation (`animate-ping`) indicates live Server-Sent Events reception.
- **Paused State:** Solid amber indicator with "Streaming Paused" status.
- **Disconnected State:** Solid rose indicator with immediate "Reconnect" action.
- **Reduced Motion Support:** All pulse animations include `motion-reduce:animate-none` to protect users with vestibular sensitivities.

### 2.2 Numerical Stability (`tabular-nums`)
All dynamic numerical data—including request latencies (`durationMs`), SQL statement counts, clock timestamps, and percentage gauges—utilize `font-mono tabular-nums`. This prevents micro-layout jitter when values update in real time.

---

## 3. Dedicated Dashboard Views

The top view switcher enables instant transitions between specialized debugging views:

```text
[ Live Table ] [ Request Waterfall ] [ Error Triage ] [ SQL Diagnostics ] [ Combined View ]
```

### 3.1 Live Traffic Table (`table`)
- **Row Density Toggle:**
  - *Comfortable:* Standard `py-2.5 px-3` padding for relaxed browsing.
  - *Compact:* High-density `py-1.5 px-2.5` padding for inspecting high-volume traffic bursts.
- **Multi-Column Sorting:** Interactive sorting on Status, Method, Path, Latency, SQL Count, and Time.
- **Search Highlighting:** Exact search query matching highlighted with amber pill backgrounds.
- **Quick Copy:** One-click copy cURL command or telemetry JSON on row hover with instant feedback indicator.

### 3.2 Interactive Request Waterfall (`waterfall`)
- **Zoom & Panning:** Zoom controls (`1x`, `1.5x`, `2x`, `3x`) and reset for granular inspection of microsecond intervals.
- **Concurrency & Parallelism Detection:**
  - `⚡ Concurrent / Parallel`: Detected when request start timestamp is earlier than the preceding request's completion within the same `X-Action-Id`.
  - `↳ Sequential`: Detected when requests execute sequentially.
- **Client Transit Overhead Visualization:** Secondary bar overlay illustrates network serialization and reverse proxy latency when client-side monotonic duration exceeds backend execution duration.

### 3.3 Error Triage Panel (`errors`)
- **KPI Metrics:** Error rate percentage, 4xx client errors count, 5xx server errors count, and client-observed network drops.
- **Top Recurring Errors:** Aggregates error codes (`INVALID_PAYLOAD`, `UNAUTHORIZED`, `TOKEN_EXPIRED`, `NETWORK_FAILURE`).
- **Remediation Guide:** Contextual diagnostic advice mapped to HTTP status codes (e.g. 401 JWT inspection, 422 Bean Validation, 500 stack trace lookup).

### 3.4 SQL Statement Diagnostics (`sql`)
- **ORM Metric Cards:** Executed SQL statements count, detected N+1 patterns count, and average queries per request.
- **Observability Invariant:** Explicit disclosure regarding Hibernate `StatementInspector` AST template tracking versus JDBC driver roundtrip duration.
- **JPA Optimization Recipes:** Actionable remediation recipes for `JOIN FETCH`, `@EntityGraph`, and `@BatchSize(size = 25)`.

---

## 4. 7-Tab Request Details Inspector

Selecting any request opens the slide-over inspector drawer:
1. **Overview:** Request ID, Action ID, latency, HTTP method, client app, full path, quick copy cURL / JSON actions.
2. **Timeline:** 5-step milestone breakdown from client dispatch through Nginx, Spring Boot controller, database execution, and HTTP response serialization. Includes "Show in Waterfall" jump button.
3. **Headers & Auth:** Masked credentials (`Authorization: Bearer ey...[SANITIZED]`), user principal, Spring Security role, and remote IP.
4. **Controller:** Spring Boot Handler method signature, matched `@RequestMapping` pattern, and execution outcome.
5. **Database:** Executed SQL query count, Hibernate StatementInspector explanation, and `POTENTIAL_N_PLUS_ONE` warning banner if triggered.
6. **Contract:** OpenAPI 3.0 specification alignment (`MATCHED`, `COMPATIBILITY_ALIAS`, or `UNTRACKED`) with tag and operation summary.
7. **Errors:** Error code, outcome, exception message, and contextual remediation steps.

---

## 5. Command Palette (`Ctrl+K`) Shortcuts

Full keyboard navigation with Arrow Up, Arrow Down, and Enter:
- `T` — Switch to Live Table View
- `W` — Switch to Request Waterfall View
- `E` — Switch to Error Triage View
- `D` — Switch to SQL Diagnostics View
- `B` — Switch to Combined View
- `P` — Toggle Stream Pause / Resume
- `4` — Filter 4xx/5xx Errors
- `S` — Filter Slow Requests (≥500ms)
- `U` — Filter User Web (:5173)
- `A` — Filter Admin App (:5174)
- `Q` — Start QA Session Recording
- `J` — Export Sanitized JSON Snapshot
- `C` — Clear Live Request History
- `R` — Reset All Filters

