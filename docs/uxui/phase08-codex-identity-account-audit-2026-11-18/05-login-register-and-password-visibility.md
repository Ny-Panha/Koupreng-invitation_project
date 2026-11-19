# Login, registration and password controls

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

[apps/frontend-user/src/features/auth/LoginFeature.jsx:31](../../../apps/frontend-user/src/features/auth/LoginFeature.jsx#L31) trims identifiers and preserves entered identifier on 400/401/403/429/500/offline failure. Pending Enter/click is suppressed. Browser C08 pending test verifies pointer caret selection and keyboard Space without form submit. Toggles remain type=button with localized names and aria-pressed. Autofill remains username/current-password/new-password.

[apps/frontend-user/src/features/auth/RegisterFeature.jsx:42](../../../apps/frontend-user/src/features/auth/RegisterFeature.jsx#L42) keeps fullName/phone/password DTO and five rules. Existing tests cover7/8/100/101 units, Khmer letters/digits, all-uppercase and confirmation; C08-002 adds the DTO Lu edge. Java chars and JavaScript split intentionally do not treat a supplementary character as a single BMP letter. No lowercase rejection is added.

Full native touch/AT behavior and every field/error association are not certified. Refer to `RegisterFeature.test.jsx`, `LoginFeature.test.jsx`, `Phase08Regression.test.jsx` and `phase08-codex-regression.spec.js`.

Open C08-013 — actual password encoder boundary: the local BCryptPasswordEncoder bean in shared/config/SecurityConfig.java:312 uses installed spring-security-crypto7.1.1. A standalone no-account/no-network probe accepted72 ASCII bytes and rejected73/100 ASCII bytes as well as26 UTF-16 units containing74 UTF-8 bytes, with IllegalArgumentException: password cannot be more than72 bytes. This is an explicit rejection, not evidence of silent truncation or credential compromise. The 8–100 UI/DTO/service predicate tests do not establish full server acceptance. See [probe evidence](evidence/password-encoder-probe.json) and [regenerator](evidence/probe_encoder.py).

Backend identity/security and product policy owners must reconcile accepted Unicode/byte bounds and password hashing with old-hash compatibility, registration/change/reset/login tests, server error handling and native-reviewed guidance. This audit does not authorize a hashing/migration change or invent a72-character frontend limit. F08.1-06/08/16 and AUTH-PWD-01 therefore remain partial. No live API account was created or reset by this probe.
