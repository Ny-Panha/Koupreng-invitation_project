# Phase 3 complete change review

Recorded baseline: 161 modified tracked files and 119 untracked files (280 total) at `29c324101a2d4d11e66ee56a82b7fa41c9ee4ef5`. This manifest retains that review scope after external commits. Seven new Phase 3 documents extend it to 287 unique paths; the expanded secret-rotation document was already in the baseline.

Method: inspect production/configuration change hunks and new source, review test cases and assertions, run fresh regression/static-analysis gates, verify generated OpenAPI and original restored-asset bytes, and check documentation against source and isolated database evidence. This is a complete path inventory, not a claim of independent line-by-line manual inspection of every fixture or generated contract line. All 1,352 non-document/non-skill application files found in the saved pre-commit snapshot compare equal after CRLF normalization. All 27 migration files match that snapshot; the 158 tracked non-document/contract changes reconstructed from saved hunks also match. Phase 3 changed documentation only.

No accidental application files, generated build output, secret-bearing evidence or removable experiments were identified in this scope. Test fixtures and remediation evidence documentation are intentional. Preview retry/protocol copies serve separately deployed user/admin roots; no duplication refactor is warranted. Existing compatibility APIs/models remain. Logs/builds/browser artifacts/private environment inspection stayed outside Git.

Externally introduced skill/setup changes are accounted for separately: `64fa6cc`, `6272bef`, `0bbb648` changed HEAD during this task. The additional 227 paths are tooling/instruction/documentation additions outside the recorded application remediation scope; the pinned skill verification passed. They are included in current-tree secret scanning. This report does not claim a fresh manual audit of every third-party skill reference. No staging, commits, pushes or history edits were performed by this task.

| Path | Baseline state | Classification | Logical Phase 2 group / review evidence |
| --- | --- | --- | --- |
| `.env.example` | Modified tracked | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `.github/dependabot.yml` | Added baseline | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `.github/workflows/ci.yml` | Modified tracked | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `apps/backend/src/main/java/com/koupreng/backend/admin/application/AdminManagementService.java` | Modified tracked | BACKEND; PERFORMANCE; BUG_FIX | Group 6: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/audit/application/AuditLogService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/api/AuthController.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/application/AccountService.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/application/AuthService.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/domain/UserExternalIdentity.java` | Added baseline | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/persistence/PasswordResetTokenRepository.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/persistence/UserExternalIdentityRepository.java` | Added baseline | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/security/AppJwtAuthenticationConverter.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/security/CookieCsrfProtectionMatcher.java` | Added baseline | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/session/UserAuthCacheService.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/budget/api/dto/BudgetResponse.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/budget/api/dto/BudgetSummaryResponse.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/budget/application/BudgetService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/budget/domain/BudgetTotals.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/checkin/api/CheckInController.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/checkin/application/CheckInService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/checkin/domain/GuestCheckIn.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/checkin/domain/GuestCheckInEvent.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/checkin/infrastructure/persistence/GuestCheckInEventRepository.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/checkin/infrastructure/persistence/GuestCheckInRepository.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/contact/api/ContactController.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/contact/api/dto/ContactRequest.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/contact/application/ContactService.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/entitlement/application/EntitlementService.java` | Added baseline | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/event/application/EventService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/guest/api/GuestController.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/guest/api/dto/GuestImportFilePreviewResponse.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/guest/application/GuestService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/guest/infrastructure/persistence/GuestRepository.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/integration/ai/api/AiInvitationAssistantController.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/integration/ai/api/dto/AiInvitationDraftRequest.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/integration/ai/api/dto/AiInvitationDraftResponse.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/integration/ai/application/AiInvitationAssistantService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/integration/ai/application/AiInvitationProvider.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/invitation/application/InvitationPasswordAttemptLimiter.java` | Added baseline | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/invitation/application/InvitationService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/invitation/application/QrCodeService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/invitation/infrastructure/persistence/UserInvitationRepository.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/media/application/MediaService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/media/infrastructure/persistence/MediaFileRepository.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/payment/api/TemplatePaymentController.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplateCheckoutPolicy.java` | Added baseline | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplatePaymentService.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/payment/infrastructure/persistence/TemplatePaymentOrderRepository.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/reporting/api/dto/AdminDashboardSummaryResponse.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/reporting/api/dto/UserDashboardSummaryResponse.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/reporting/application/DashboardReportService.java` | Modified tracked | BACKEND; PERFORMANCE; BUG_FIX | Group 6: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/reporting/domain/RevenueTotals.java` | Added baseline | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/rsvp/api/RsvpController.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/rsvp/api/dto/RsvpResponse.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/rsvp/application/RsvpService.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/rsvp/infrastructure/persistence/RsvpRepository.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/seating/application/SeatingService.java` | Modified tracked | BACKEND; ACCESSIBILITY; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/shared/config/AppProperties.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/shared/config/OpenApiExamples.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/shared/config/SecurityConfig.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/shared/security/ApiSecurityProperties.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/shared/security/FileUploadValidator.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/shared/security/RateLimitService.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/subscription/application/SubscriptionService.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/subscription/domain/Subscription.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/subscription/infrastructure/persistence/SubscriptionPackageRepository.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/subscription/infrastructure/persistence/SubscriptionRepository.java` | Modified tracked | BACKEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/template/api/dto/PublicTemplateResponse.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/template/infrastructure/persistence/InvitationTemplateRepository.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/java/com/koupreng/backend/user/infrastructure/persistence/AppUserRepository.java` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/resources/application-prod.properties` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/resources/application.properties` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/backend/src/main/resources/db/migration/V28__persist_verified_provider_identities.sql` | Added baseline | DATABASE | Group 2: Append-only V28–V30; fresh and upgrade MySQL/Flyway/Hibernate tests |
| `apps/backend/src/main/resources/db/migration/V29__preserve_staff_role.sql` | Added baseline | DATABASE | Group 2: Append-only V28–V30; fresh and upgrade MySQL/Flyway/Hibernate tests |
| `apps/backend/src/main/resources/db/migration/V30__preserve_check_in_undo_history.sql` | Added baseline | DATABASE | Group 2: Append-only V28–V30; fresh and upgrade MySQL/Flyway/Hibernate tests |
| `apps/backend/src/test/java/com/koupreng/backend/MigrationUpgradeMySqlTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/auth/application/AuthIntegrityMySqlTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/auth/application/AuthServiceTests.java` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/auth/infrastructure/identity/GoogleIdentityVerifierTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/auth/infrastructure/security/AppJwtAuthenticationConverterTests.java` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/auth/infrastructure/security/AuthEndpointSecurityTests.java` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/auth/infrastructure/security/CookieCsrfSecurityTests.java` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/auth/infrastructure/session/UserAuthCacheServiceTests.java` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/budget/application/BudgetServiceTests.java` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/checkin/api/GuestMutationEndpointTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/checkin/application/CheckInServiceTests.java` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/checkin/application/CheckInSummaryQueryIntegrationTests.java` | Added baseline | TEST; PERFORMANCE | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/checkin/application/GuestMutationIntegrityMySqlTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/contact/api/ContactEndpointTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/contact/application/ContactServiceTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/entitlement/application/EntitlementIntegrityMySqlTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/entitlement/application/EntitlementServiceTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/event/api/LegacyEventEndpointTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/event/application/EventServiceTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/guest/api/GuestImportPreviewEndpointTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/guest/application/GuestImportPreviewTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/integration/ai/api/AiInvitationEndpointTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/integration/ai/application/AiInvitationAssistantServiceTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/invitation/application/InvitationAccessSecurityTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/invitation/application/InvitationPasswordAttemptLimiterTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/media/application/MediaIntegrityMySqlTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/media/application/MediaServiceTests.java` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/payment/api/TemplateClaimEndpointTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/payment/application/TemplateCheckoutPolicyTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/payment/application/TemplatePaymentServiceTests.java` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/reporting/application/DashboardReportServiceTests.java` | Modified tracked | TEST; PERFORMANCE | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/reporting/application/QueryGrowthIntegrationTests.java` | Added baseline | TEST; PERFORMANCE | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/reporting/application/ReportingIntegrityMySqlTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/rsvp/application/RsvpServiceTests.java` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/shared/config/GoogleProfileConfigurationTests.java` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/subscription/application/SubscriptionIntegrityMySqlTests.java` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/backend/src/test/java/com/koupreng/backend/subscription/application/SubscriptionServiceTests.java` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-admin/src/app/App.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-admin/src/features/dashboard/AdminDashboardPage.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-admin/src/shared/hooks/usePreviewSyncRetries.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-admin/src/shared/hooks/usePreviewSyncRetries.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-admin/src/shared/preview/previewMessaging.js` | Added baseline | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-admin/src/shared/preview/previewMessaging.test.js` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-admin/src/shared/utils/format.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-admin/src/shared/utils/format.test.js` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/public/invitations/canva-khmer/CoverKhmer.svg` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/details.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/footer.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/gallery.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/gift.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/hero.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/location.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/program.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/rsvp.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/invitations/canva-khmer/sections/story.webp` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/public/templates/canva-luxury/emerald-luxury.jpg` | Added baseline | RESTORED_ASSET | Group 5: Original asset restoration; byte/decode/browser checks; retained |
| `apps/frontend-user/src/app/guards/RequireAuth.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/guards/RequireAuth.test.jsx` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/app/providers/AuthProvider.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/router.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/routes/authRoutes.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/routes/builderRoutes.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/routes/hostRoutes.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/routes/lazyRoutePages.js` | Added baseline | FRONTEND; PERFORMANCE; BUG_FIX | Group 6: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/routes/marketingRoutes.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/app/routes/reportAliases.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/ai-assistant/aiAssistant.test.jsx` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/ai-assistant/components/AssistantResult.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/ai-assistant/hooks/useAiAssistant.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/ai-assistant/model/responseSource.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/ai-assistant/sourceContract.test.js` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/auth/ProfileFeature.jsx` | Modified tracked | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/auth/api/authApi.js` | Modified tracked | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/auth/components/SocialAuthButtons.jsx` | Modified tracked | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/auth/components/SocialAuthButtons.test.jsx` | Modified tracked | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/auth/components/socialAuthError.js` | Added baseline | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/auth/hooks/useAuth.js` | Modified tracked | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/budget/components/BudgetProgress.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/budget/components/BudgetSummaryCards.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/budget/components/CategoryBreakdown.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/budget/currencyTotals.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/budget/mixedCurrency.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/dashboard/DashboardFeature.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/dashboard/dashboardData.js` | Added baseline | FRONTEND; PERFORMANCE; BUG_FIX | Group 6: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/dashboard/dashboardData.test.js` | Added baseline | TEST; PERFORMANCE | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/expenses/ExpensesList.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/expenses/components/ExpenseSummaryCards.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/expenses/expenseTotals.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/expenses/expenseTotals.test.js` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/expenses/hooks/useExpenses.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/expenses/mixedLedger.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/gifts/components/GiftStatsCards.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/gifts/hooks/useGifts.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/guests/GuestsPage.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/guests/api/guestApi.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/guests/components/GuestImportModal.jsx` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/guests/components/GuestServerTools.jsx` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/guests/serverTools.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/invitations/InvitationPreviewFeature.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/invitations/LivePhoneSimulator.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/invitations/PublicRsvpForm.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/invitations/PublicRsvpForm.language.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/invitations/checkIn.persistence.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/invitations/hooks/useCheckInDesk.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/marketing/ContactFeature.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/marketing/ContactFeature.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/marketing/PricingContact.css` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/marketing/PricingFeature.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/marketing/PublicControls.test.jsx` | Added baseline | TEST; ACCESSIBILITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/marketing/VenuesFeature.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/payments/PaymentQrCard.jsx` | Modified tracked | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/payments/PaymentQrCard.test.jsx` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/payments/TemplateCheckoutPage.jsx` | Modified tracked | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/payments/checkoutOffer.js` | Added baseline | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/payments/checkoutOffer.test.js` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/qr/api/qrApi.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/qr/components/QrPreview.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/qr/hooks/useQrCode.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/qr/qrContract.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/reports/ReportsPage.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/reports/api/reportsApi.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/reports/components/OwnerReportSummary.jsx` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/reports/ownerReportIntegration.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/rsvp/RsvpDashboardPage.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/rsvp/api/rsvpApi.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/rsvp/components/RsvpGuestTable.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/rsvp/components/RsvpOwnerActions.jsx` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/rsvp/ownerManagement.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/seating/InvitationSeatingPage.jsx` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/seating/api/seatingApi.js` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/seating/components/SeatingFloorPlan.css` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/seating/components/SeatingFloorPlan.jsx` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/seating/hooks/useSeating.js` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/seating/model/tableNotes.js` | Added baseline | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/seating/notesContract.test.js` | Added baseline | TEST; ACCESSIBILITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/seating/seatingAccessibility.test.jsx` | Added baseline | TEST; ACCESSIBILITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/seating/seatingSummary.test.jsx` | Added baseline | TEST; ACCESSIBILITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/templates/api/templateCatalogApi.js` | Modified tracked | FRONTEND; PERFORMANCE; BUG_FIX | Group 6: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/api/templateService.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/catalogCache.test.js` | Added baseline | TEST; PERFORMANCE | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/templates/experience/TemplateExperience.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/experience/TemplateExperience.security.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/templates/experience/config/templateExperienceContent.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/BlissEditorialLayout.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/DefaultTemplate/DefaultTemplateLayout.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/DigitalYes/DigitalYesLayout.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/EmeraldLuxe/EmeraldLuxeLayout.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/EmeraldLuxe/EmeraldLuxeLayout.test.jsx` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.test.jsx` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/celestialTypography.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/components/CelestialOpening.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/TemplateBoilerplate/TemplateBoilerplateLayout.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/WithJoyPortalLayout.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/templates/layouts/previewSecurity.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/features/templates/shared/Openings/CinematicVideoOpening.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/features/wishes/wishes.test.jsx` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/layouts/components/Header.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/api/downloadCsv.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/api/httpClient.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/api/httpClient.test.js` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/shared/hooks/usePreviewSyncRetries.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/hooks/usePreviewSyncRetries.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/shared/i18n/invitationLanguage.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/i18n/marketingFallback.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/shared/i18n/marketingMessages.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/i18n/messagesDictionary.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/preview/previewMessaging.js` | Added baseline | FRONTEND; SECURITY; BUG_FIX | Group 1: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/preview/previewMessaging.test.js` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/shared/storage/hostPlanningStorage.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/ui/ChatBot.css` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/ui/ChatBot.jsx` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/ui/DatePicker.jsx` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/ui/DatePicker.test.jsx` | Added baseline | TEST; ACCESSIBILITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/shared/ui/Modal.jsx` | Modified tracked | FRONTEND; ACCESSIBILITY; BUG_FIX | Group 5: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/ui/Modal.test.jsx` | Added baseline | TEST; ACCESSIBILITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/shared/ui/ToastContainer.jsx` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/ui/ToastContainer.test.jsx` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/shared/utils/localDate.js` | Added baseline | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/shared/utils/localDate.test.js` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/src/stores/useAuthStore.js` | Modified tracked | FRONTEND; BUG_FIX | Group 4: Source changes reviewed; lint/tests/build and browser checks |
| `apps/frontend-user/src/stores/useAuthStore.test.js` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/tests/e2e/khmer-celestial-guest-banner.spec.js` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/frontend-user/tests/e2e/khmer-celestial-scroll.spec.js` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/telegram-bot/README.md` | Modified tracked | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `apps/telegram-bot/main.py` | Modified tracked | BACKEND; BUG_FIX | Group 3: Source changes reviewed; Java/Python tests and static analysis |
| `apps/telegram-bot/tests/test_main.py` | Modified tracked | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/telegram-bot/tests/test_webhook_delivery.py` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `apps/telegram-bot/tests/test_webhook_security.py` | Added baseline | TEST; SECURITY | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `docker-compose.yml` | Modified tracked | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `docs/CODEX_E_INVITATION_DEEP_AUDIT.md` | Added baseline | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/CODEX_PHASE2_IMPLEMENTATION_REPORT.md` | Added baseline | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/CODEX_PHASE3_RELEASE_CANDIDATE_REPORT.md` | Phase 3 new | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/OWNER_AI_DECISION.md` | Phase 3 new | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/OWNER_ENTITLEMENT_DECISION.md` | Phase 3 new | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/OWNER_TEMPLATE_PRICING_DECISION.md` | Phase 3 new | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/PAGINATION_READINESS.md` | Phase 3 new | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/PHASE2_PRODUCT_POLICY_DECISIONS.md` | Added baseline | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/PHASE2_SECRET_ROTATION_REQUIRED.md` | Added baseline + Phase 3 expansion | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/PHASE2_TEMPLATE_RECOVERY.md` | Added baseline | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/PHASE3_CHANGE_REVIEW.md` | Phase 3 new | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/PHASE3_COMMIT_PLAN.md` | Phase 3 new | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/README.md` | Modified tracked | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `docs/deployment/DOCKER.md` | Modified tracked | DOCUMENTATION | Group 7: Required remediation, preservation, policy or release evidence |
| `infra/nginx/docker/gateway.conf.template` | Modified tracked | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `packages/api-contracts/openapi.yaml` | Modified tracked | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `run-local-stack.ps1` | Modified tracked | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `scripts/maintenance/dev/dev.ps1` | Modified tracked | CONFIG | Group 7: Configuration/source hunks reviewed; applicable config/skill verification |
| `scripts/qa/config-regression.test.mjs` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |
| `scripts/qa/repository-policy.test.mjs` | Added baseline | TEST | Group 8: Regression cases/assertions reviewed; fresh applicable suite passed |

Primary classifications (additional tags overlap): BACKEND=70, CONFIG=8, DATABASE=3, DOCUMENTATION=15, FRONTEND=96, RESTORED_ASSET=11, TEST=84.

Disposition: retain every listed file. No application cleanup/edit was necessary in Phase 3. External commits already contain the Phase 2 files; follow the current documentation commit plan without rewriting them.

## Concurrent dependency work — owner excludes from Phase 3

The owner explicitly answered “Keep it separate from Phase 3.” The four manifest/lock paths below are additional to the 287-path remediation/documentation inventory; CI already appears there but received a further concurrent edit. They remain untouched by this task. Structural lock review showed development-only removals, unchanged runtime dependency declarations and no added packages; both manifests now match lockfile root declarations. CI changes replace pinned action SHAs/version comments. The complete combined working tree is not certified by the earlier Phase 3 gates. A user follow-up gate passed; the other effort still owns completion, fresh-install and upgraded-action validation.

| Separate path | Classification | Disposition |
| --- | --- | --- |
| apps/frontend-user/package.json | CONFIG | Retain separately owned removal of Depcheck and Knip dependency script; exclude from Phase 3 commits |
| apps/frontend-user/package-lock.json | CONFIG | Retain development dependency pruning; exclude from Phase 3 commits |
| apps/frontend-admin/package-lock.json | CONFIG | Retain separate development dependency pruning; exclude from Phase 3 commits |
| apps/frontend-admin/package.json | CONFIG | Retain separately owned Depcheck removal and Knip dependency script; exclude from Phase 3 commits |
| .github/workflows/ci.yml | CONFIG | Separate pinned-action edits observed, briefly restored, then edited again as work continued; exclude from Phase 3 commits/certification |
| apps/backend/pom.xml | CONFIG | Separate POI/dependency-analysis edits observed and restored at a checkpoint; any continuing edits remain excluded from Phase 3 commits/certification |
