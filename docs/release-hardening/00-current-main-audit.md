# Current main audit

Audit started 29 October 2026 (Asia/Bangkok) in the original `D:\Koupreng-invitation_project` checkout. Initial `main` and fetched `origin/main`: `4a3fc2deef3b2903b3c70a490df01a8064803488`; divergence `0 0`; working tree clean. No branch, worktree, or clone created.

Read the complete supplied Chief Engineer prompt, `.agents/ROUTER.md`, and `CODEX.md`. Primary skill: `koupreng-qa-release`; supporting guidance: `playwright`, `sast-configuration`.

Actual backend parent is Spring Boot **4.1.1**, Java 25, despite older guidance referring to 4.0.8. Local tools: Java 25.0.1, Node 26.12.1, default Python 3.15.1. CI uses Java 25, Node 22, Python 3.13. Docker Linux daemon is initially unavailable; installed MySQL 8.0 permits an isolated local server without touching existing databases. Environment files and existing services must remain untouched.

The only active workflow is `.github/workflows/ci.yml`, triggered by pushes to main (also the existing cleanup branch) and pull requests to main. Baseline run: https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/40880792891 . At inspection, seven jobs succeeded, secret and browser jobs failed, Java audit was still running. Final baseline conclusions and exact errors are recorded in the triage report.

Continued on 30 October on the same main checkout; fetched remote still matched the initial SHA. Targeted React guidance was used for Safari menu focus, and backend standards for the documentation dependency repair. Node 22.23.4 was checksum-verified and used for final local checks to match CI.

Raw local command logs and timing/exit records are kept under ignored `.cache/release-hardening/`. Historical counts are not used as current evidence.
