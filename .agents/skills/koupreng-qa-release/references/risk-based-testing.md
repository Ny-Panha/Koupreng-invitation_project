# Risk-Based Testing Framework

## 1. Principles

1. **Test Efficiency:** Avoid long feedback cycles. Run the smallest set of tests that fully exercises modified code paths.
2. **Blast Radius Analysis:** Trace changes up the dependency tree:
   - Modifying a shared utility in `apps/frontend-user/src/shared/` requires running tests across all consuming features.
   - Modifying an isolated template component only requires running that template's test suite.
3. **Escalation for High-Risk Modules:**
   - Any commit touching `com.koupreng.backend.payment..` or `auth..` automatically escalates to full payment integration tests, ArchUnit validation, and manual scenario verification.

