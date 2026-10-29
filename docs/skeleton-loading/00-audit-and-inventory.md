# Loading audit — 29 October 2026

Started directly on `main` at `4f9d1f3d5cf1e811f0aa971a26bf320642cb6493`. `git fetch origin` followed by `git rev-list --left-right --count HEAD...origin/main` returned `0 0`. The original working tree contained 157 deleted tracked backend test `.class` files. Those deletions are user work and are excluded from this delivery. No branch, worktree, reset, stash, deployment, payment, or DNS change was made.

The attached brief supplied requirements and historical path hints. Current routers, shared UI, hooks, tests and API wrappers supplied implementation facts. The active scope is the existing React user and admin applications; backend and worker contracts remain unchanged.

The existing user `Skeleton`, `SkeletonCard`, and `SkeletonTable` were reusable. Gaps were table placeholders on card pages, text-only Studio/workspace startup, missing region semantics, and text/spinner-only pricing, media, ticket and account regions. The admin `Loading` and `LoadingState` were separate spinner wrappers. Its resource hook could commit out-of-order requests and hide all data during refresh. The owner financial report cleared valid results on every 30-second refresh. Notification summaries displayed zero before their data arrived.

Existing good behavior retained: static marketing heroes; scoped marketing card placeholders and image dimensions; auth submit states; Studio save/conflict/recovery state machine; live-preview timeout/retry; upload progress; cinematic skip/error/reduced-motion handling; guest pagination generation guards; QR purpose validation; package purchase single-submission guard; payment polling and backend-only confirmation; admin report filter cancellation and export feedback.

[The source discovery inventory](async-source-inventory.tsv) records loading-related lines throughout both apps, including retained implementations. It is a static discovery manifest, not a claim that every route received a new skeleton. [The route matrix](01-loading-state-matrix.md) records the decision for each active route family. Legacy `/dashboard`, `/event`, and `/create` aliases continue to use existing redirects.

Baseline: both builds and lint passed; admin unit tests 121/121; user tests 1142/1144, with two lazy template timing failures under unrestricted worker concurrency. All 1144 existing tests subsequently passed with four workers. Existing critical browser smoke: 6/6 passed. Studio before captures: 320, 375, 390, 430, 768, 1024, 1366, 1440 pixels in English and Khmer. The first capture script needed its own request-release fix; the corrected baseline capture passed.

Backend wrapper suite: 649 tests, zero failures/errors, 71 environment-gated skips. Worker: 74 passed using its existing `.venv`; the system Python lacks pytest. See [verification](05-tests-and-visual-regression.md).
