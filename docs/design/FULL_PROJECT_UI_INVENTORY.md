# Full-project UI inventory

Discovery snapshot: 2026-11-04. This is a structural inventory of the checked-out application, not a claim that every interaction passed a new audit. Route patterns are expanded from JSX arrays and nested declarations. Historical screenshots/tests are separate from newly executed evidence. The user subsequently requested implementation on `main`; original discovery began on `codex/premium-ui-modernization`.

## Architecture and inventory boundary

- User route authority: `apps/frontend-user/src/app/router.jsx`, `src/app/routes/{marketingRoutes,authRoutes,builderRoutes,hostRoutes}.jsx` and `lazyRoutePages.js`. Admin: `apps/frontend-admin/src/app/App.jsx` and `routes.js`.
- **111 user route patterns**: 56 page routes, 50 redirects, four conditional legacy routes and one wildcard. **24 admin patterns**: 13 page routes, ten redirects including index, one wildcard. These are patterns, not counts of unique visual page designs. Every expanded pattern appears in [coverage matrix](FULL_ROUTE_COVERAGE_MATRIX.md).
- Shells: `MarketingShell`, `AuthShell`, `HostShell`, `EventWorkspace`/`EventNavigation`; admin `AdminLayout`, `AdminHeader`, `AdminSidebar`. Fullscreen editor and preview routes deliberately bypass standard navigation.
- User authorization uses `AuthProvider`, `RequireAuth`, shared HTTP interceptors and auth storage; admin has its own `AdminAuthProvider`, `RequireAdmin`, `adminHttpClient`. Admin guard recognizes ADMIN, SUPER_ADMIN and ADMIN_MANAGER including `ROLE_` prefixes. UI guards never replace backend authorization.
- Event navigation follows owner/grants returned by the API. `moduleAllowed` exposes nonowner modules only for explicitly mapped permissions. Finance, publishing, team linkage and membership remain owner-controlled.
- Both apps lazy-load most routes with Suspense. Home is eager in `lazyRoutePages.js`; avoid a decorative initial loader. Existing engines are React/React Router, CSS/Tailwind and user `framer-motion`; no need to add ten dependency stacks.
- Invitation API contains both server CRUD/access/publish/preview and explicit local legacy draft adapters. A locally saved draft is not evidence of server publication.

## Domain inventory

“Present” means source and wiring exist. Runtime correctness, accessibility, network recovery and visual quality require batch-specific checks. No feature is considered working solely from its name.

| Domain | Existing screens and nested surfaces | Source and implementation state | Verification focus |
|---|---|---|---|
| Marketing | Home hero, navigation, features/packages/FAQ/footer, pricing, contact; public language controls | Routed; `features/marketing`, `pages/marketing`, MarketingShell | Content/anchors, share metadata, bilingual small screens |
| Marketplace | Catalog, categories/search, cards, demos, host browse/owned templates and checkout continuation | Routed; `features/templates`, `features/payments`, host template pages | Actual catalog availability, unknown template, preview, entitlements |
| Venues | Catalog and parameterized venue state | `/venues` and `/venues/:id` share VenuesPage; no separate detail component | Confirm selected/detail behavior before promising a new screen |
| Authentication | Register/login, supported identifier, Google/Telegram, password recovery/reset/change, account linking | `features/auth`, authApi, SocialAuthButtons/AuthLayout | Expired tokens, missing provider configuration, safe continuation, recovery |
| Account | Profile, password, notifications, packages, payments and receipt | Routed accountPages array | Form validation, actual receipt state, long names, denied/failed requests |
| Events | Cards/list/delete, create/edit, cover/status, workspace/team/attendance analytics | `features/events`, 18 child modules plus event index | Search/empty/error, event URL ownership, deletion intent, save conflicts |
| Event types | WEDDING, ENGAGEMENT, BIRTHDAY, ANNIVERSARY, CORPORATE, OTHER | `onboarding/eventFields.js` with conditional participant fields | Six types, Khmer names, date/time, preservation of stored fields |
| Invitation studio | Existing editor, local legacy builder, themes/content/typography/section/media controls, preview and publishing | `features/invitations`, wedding-builder; EventInvitation selects WeddingEditor or EventDetails | Draft recovery, autosave, publish truth, capabilities, no lost changes |
| Tickets | Designer, preview/actions, guest selection, images/uploads, local unsaved guard | `/app/events/:eventId/tickets/design`, `features/tickets` | Actual server design/pass, denied package, downloads/print, mobile panels |
| Guest invitation | Identity/access, ceremonial opening, optional video, couple/family/story, schedule/map, calendar/countdown, gallery/audio, QR and share, RSVP/wishes/FAQ/dress code where capable | `/w/:slug`, `/i/:slug`, demos/previews, template registry/blocks | Every renderer, access/token/expiry, motion fallback, media failures |
| Guest operations | Paged list, CRUD/details/groups/side/seats, bulk selection, CSV/file import inspect/preview/commit, selected/all export and send list | `features/guests`, guestApi | Server pagination/search, duplicate import recovery, selection scope |
| RSVP/wishes | Host status/responses, guest form/count, greetings management and public wishes | `features/rsvp`, `wishes`, public/template sections | Attend/decline, deadline/expiry, identity, duplicate submit/retry |
| Check-in | Scan/manual/undo, roster/search/history, duplicate state, ticket/pass | `features/check-in`, invitation wrapper, guestApi/ticketApi | Camera permission, invalid/expired QR, duplicate handling, server-confirmed state |
| Seating | Floorplan/tables/assignments, guest lists, summaries/notes, keyboard alternatives in existing source | `features/seating`; accessibility tests exist | Drag/drop and keyboard equivalence, narrow viewport, unassigned/VIP/save errors |
| Budget/expenses | Current budget route renders ExpensesPage; older BudgetPage feature remains | `features/expenses`, `budget`, planning service | Reachability distinction, decimal forms, explicit USD/KHR totals/export |
| Gifts/reports | Gift CRUD, currency-separated financial/operational reports and exports | `features/gifts`, `reports`, routed gifts/reports | Actual server data, currencies, filters/export failures |
| Packages/payments | Packages, checkout, KHQR/ABA instructions, pending polling, status/cancel/return, transaction history/receipt, owned templates | `features/subscriptions`, `payments` and page wrappers | Server-owned prices/entitlements, pending/retry/expiry, browser claim never confirms payment |
| Teams/enterprise | List/create/detail, membership/invitations, roles, event team review | `features/organizations`, EventTeamPanel; enterprise folder is CSS-only | Owner/member boundaries, entitlements, revocation and explicit team-change review |
| Delivery/Telegram | Invitation delivery and guest send state; Telegram WebApp/social auth interfaces | `features/delivery`, invitation delivery API, `shared/telegram`, worker integration | Provider errors/retries, genuine delivery state; webhook security preserved |
| Media | Authorized library/uploads/progress, editor/gallery assets, image fallbacks | `features/media`, invitation media API/components | Failed/retry uploads, authorization, dimensions, load cost |
| Assistant/QR/support | AI composer/result/apply, QR/share/export, support/chat | `ai-assistant`, `qr`, shared ChatBot/SupportWidget | Config/provider errors, content preservation, entitlement and QR identity |
| Admin dashboard | Fact/metric/trend/recent invitation/conversion/health panels | `features/dashboard` | Genuine metrics, actionable empty/error, keyboard navigation |
| Admin users | Search/list/create, activation/role changes, detail/invitations | `features/users`, adminService | Privilege safeguards, dense tables, confirmation/API failure |
| Admin templates | Catalog/premium/activation/delete, fullscreen studio, block/unified sections, gallery/cover/QR/order controls | `features/templates` | Save/preview contract, keyboard ordering, provenance and export rights |
| Admin finance | Payments/details/confirmation; package CRUD, visibility/activation | `features/payments`, `packages`, adminService | Evidence review and pending truth, protected actions, currency amounts |
| Admin reports | Overview/financial/invitation/guest/RSVP/check-in/subscription/system-health sections, filters/navigation/KPI/ledger/drawers/print/export | `features/reports` | Query races/errors, currencies, responsive/print layouts, server exports |
| Admin notification/logs | Compose/status, system and audit history | `features/notifications`, `system-logs` | Empty/error/permission, honest audit history, read vs mutate actions |
| Admin monitoring | Streaming requests/filter/details/waterfall, metrics/slow/SQL/error panels, command palette and QA sessions | `features/api-monitor` | Stream cleanup/offline truth, diagnostic permissions, dense mobile presentation |
| Foundations | Tokens, fonts, motion, loading/skeleton/error/empty states, dialogs/drawers, fields/date/time, tables, badges/toasts, access/feedback helpers | Both shared trees, layouts, app providers and styles | Reuse existing primitives and preserve expressive/customer/admin surface roles |

## Reachability and absent-product distinctions

- `BudgetPage` is exported by lazyRoutePages but no current route renders that export; the current budget route renders ExpensesPage. Preserve and inventory the older feature/tests as legacy/unrouted.
- `InvitationCreatePage` is also exported but not rendered by the current route factories. Current creation uses EventCreatePage; directly reachable legacy design/edit routes still use the editor.
- `features/enterprise` is styling; actual team UI is in organizations and EventTeamPanel. `features/planning` is a service client without a standalone routed screen.
- A payment receipt exists. No separate general invoice, template comparison, generic settings/preferences, standalone planning schedule or public check-in route is declared. Related embedded functionality is not automatically absent; no new working screen is invented.
- Google and Telegram are implemented auth API methods. Facebook/Apple methods are absent in authApi. Social login depends on actual provider configuration and explicitly handles missing setup.
- Runtime grants, flags and returned catalog entries can hide implemented modules. Source/tests do not establish entitlement for a real account.

## Template renderers

Authority: `features/templates/registry/templateRegistry.js` and `templateCapabilities.js`. Ten distinct layout components include default and developer starter. Aliases do not create separate implementations. Capabilities are independent of paid entitlements.

| Renderer | Registry identifiers and aliases | Capability boundaries |
|---|---|---|
| RoyalGardenCinematicLayout | royal-garden-cinematic / ROYAL_GARDEN_CINEMATIC | Cinematic intro/family/map/typography/order; explicitly no story/couplePhoto/party/FAQ |
| SilkHeritageLayout | silk-heritage / SILK_HERITAGE | Typography/family/order; validate existing section contract |
| TemplateBoilerplateLayout | template-boilerplate / custom-starter | Developer starter; no story/schedule/countdown; not production wedding equivalence |
| KhmerCelestialLayout | khmer-celestial / KHMER_CELESTIAL / 10; royal-khmer aliases / 1; RUBY_RED / ROYAL_KHMER | Appearance/typography/party/family |
| DigitalYesLayout | the-digital-yes-wedding / digital-yes / 7 / GOLD_LUXURY | No story; opening/audio remains renderer-specific |
| EmeraldLuxeLayout | emerald-canva/emerald-luxe/emerald-royal aliases / 9 / 2 / EMERALD_GREEN | No story; curtain/card opening |
| WithJoyPortalLayout | withjoy-modern-portal / 3 | Portal/gallery/story; shared FloatingAudioPlayer consumer |
| BlissEditorialLayout | bliss-editorial-wedding / 4 | No story per capabilities; editorial gallery/RSVP; shared FloatingAudioPlayer consumer |
| CanvaKhmerWeddingTemplate | khmer-golden-canva-inspired-wedding / cover-khmer-golden-wedding / 5 / CHAMPAGNE / KHMER_GOLDEN | Family and ceremonial layout |
| DefaultTemplateLayout | Explicit fallback export and shared/default engine | Unknown stable code must not silently select unrelated renderer |

`koupreng-demo-wedding` and `event-essential` are explicitly allowed shared renderers in resolveTemplateRenderer; neither is an extra dedicated registry component.

## Evidence and limitations

Historical [route audit](../audit/ux-ui-route-audit.md), [phase 9 inventory](../phase9/01-route-inventory.md), [design audit](../KOUPRENG_DESIGN_AUDIT.md) and `docs/qa/ux-ui/routes` screenshots are leads, not current completion. User E2E includes critical-routes/route-smoke and studio/invitation suites; fixtures do not certify live bank/provider behavior. Current execution results belong in [verification](UI_MODERNIZATION_VERIFICATION.md).

At discovery there are 328 production JSX files and 162 source test files in frontend-user, and 79 production JSX files and 22 source test files in frontend-admin. CSS file counts are 92 and 6 respectively. These counts describe the preimplementation snapshot; new tests/styles may increase them. Every production JSX component has a coverage row. The following file index includes service/model/hook/styles/tests so nonroute behavior remains visible.


## frontend-user file index

### ai-assistant

- `src/features/ai-assistant/aiAssistant.test.jsx`
- `src/features/ai-assistant/AiAssistantPage.css`
- `src/features/ai-assistant/AiAssistantPage.jsx`
- `src/features/ai-assistant/api/aiAssistantApi.js`
- `src/features/ai-assistant/components/AssistantComposer.jsx`
- `src/features/ai-assistant/components/AssistantResult.jsx`
- `src/features/ai-assistant/hooks/useAiAssistant.js`
- `src/features/ai-assistant/model/aiAssistantConstants.js`
- `src/features/ai-assistant/model/invitationContent.js`
- `src/features/ai-assistant/model/responseSource.js`
- `src/features/ai-assistant/sourceContract.test.js`

### auth

- `src/features/auth/api/authApi.js`
- `src/features/auth/api/userApi.js`
- `src/features/auth/AuthPage.css`
- `src/features/auth/ChangePasswordFeature.jsx`
- `src/features/auth/components/AuthLayout.jsx`
- `src/features/auth/components/SocialAuthButtons.jsx`
- `src/features/auth/components/SocialAuthButtons.test.jsx`
- `src/features/auth/components/socialAuthError.js`
- `src/features/auth/components/telegramOAuth.js`
- `src/features/auth/components/telegramOAuth.test.js`
- `src/features/auth/ForgotPasswordFeature.jsx`
- `src/features/auth/hooks/useAuth.js`
- `src/features/auth/LoginFeature.jsx`
- `src/features/auth/ProfileFeature.jsx`
- `src/features/auth/RegisterFeature.jsx`
- `src/features/auth/RegisterFeature.test.jsx`
- `src/features/auth/ResetPasswordFeature.jsx`
- `src/features/auth/safeRedirect.js`
- `src/features/auth/safeRedirect.test.js`
- `src/features/auth/useTemplateContinuation.js`

### budget

- `src/features/budget/api/budgetApi.js`
- `src/features/budget/budget.test.jsx`
- `src/features/budget/budgetCategories.js`
- `src/features/budget/BudgetPage.jsx`
- `src/features/budget/BudgetPages.css`
- `src/features/budget/components/BudgetItemForm.jsx`
- `src/features/budget/components/BudgetItemTable.jsx`
- `src/features/budget/components/BudgetProgress.jsx`
- `src/features/budget/components/BudgetSummaryCards.jsx`
- `src/features/budget/components/CategoryBreakdown.jsx`
- `src/features/budget/currencyTotals.js`
- `src/features/budget/mixedCurrency.test.jsx`

### check-in

- `src/features/check-in/api/checkInApi.js`
- `src/features/check-in/checkIn.test.jsx`
- `src/features/check-in/hooks/useCheckIn.js`

### dashboard

- `src/features/dashboard/dashboardData.js`
- `src/features/dashboard/dashboardData.test.js`
- `src/features/dashboard/DashboardFeature.jsx`
- `src/features/dashboard/DashboardPage.css`
- `src/features/dashboard/EventOverview.css`

### delivery

- `src/features/delivery/api/deliveryApi.js`
- `src/features/delivery/delivery.test.jsx`
- `src/features/delivery/hooks/useDelivery.js`

### enterprise

- `src/features/enterprise/EnterprisePages.css`

### events

- `src/features/events/api/eventsApi.js`
- `src/features/events/components/EventCard.jsx`
- `src/features/events/components/EventCard.test.jsx`
- `src/features/events/components/EventCover.jsx`
- `src/features/events/components/EventDeleteModal.jsx`
- `src/features/events/events.test.jsx`
- `src/features/events/EventsFeature.css`
- `src/features/events/EventsFeature.jsx`
- `src/features/events/hooks/useEvents.js`
- `src/features/events/model/eventCover.js`
- `src/features/events/model/eventCover.test.js`
- `src/features/events/onboarding/EventCreatePage.css`
- `src/features/events/onboarding/EventCreatePage.jsx`
- `src/features/events/onboarding/EventCreatePage.test.jsx`
- `src/features/events/onboarding/eventCreation.js`
- `src/features/events/onboarding/EventDetails.css`
- `src/features/events/onboarding/EventDetails.jsx`
- `src/features/events/onboarding/EventDetails.test.jsx`
- `src/features/events/onboarding/eventFields.js`
- `src/features/events/onboarding/EventFields.jsx`
- `src/features/events/onboarding/LocalizedEventEditor.jsx`
- `src/features/events/onboarding/localizedEventModel.js`
- `src/features/events/workspace/AttendanceAnalytics.css`
- `src/features/events/workspace/AttendanceAnalytics.jsx`
- `src/features/events/workspace/AttendanceAnalytics.test.jsx`
- `src/features/events/workspace/EventContext.js`
- `src/features/events/workspace/EventInvitation.jsx`
- `src/features/events/workspace/EventNavigation.jsx`
- `src/features/events/workspace/EventNavigation.test.jsx`
- `src/features/events/workspace/eventNavigationModel.js`
- `src/features/events/workspace/eventRoutes.js`
- `src/features/events/workspace/EventTeamPanel.jsx`
- `src/features/events/workspace/EventWorkspace.css`
- `src/features/events/workspace/EventWorkspace.jsx`
- `src/features/events/workspace/EventWorkspace.test.jsx`
- `src/features/events/workspace/useEventNavigation.js`

### expenses

- `src/features/expenses/api/expensesApi.js`
- `src/features/expenses/components/ExpenseFormModal.jsx`
- `src/features/expenses/components/ExpenseSummaryCards.jsx`
- `src/features/expenses/components/ExpenseTable.jsx`
- `src/features/expenses/expenseCategories.js`
- `src/features/expenses/expenses.test.jsx`
- `src/features/expenses/ExpensesFeature.jsx`
- `src/features/expenses/ExpensesList.jsx`
- `src/features/expenses/ExpensesPage.css`
- `src/features/expenses/expenseTotals.js`
- `src/features/expenses/expenseTotals.test.js`
- `src/features/expenses/hooks/useExpenses.js`
- `src/features/expenses/mixedLedger.test.jsx`

### gifts

- `src/features/gifts/api/giftsApi.js`
- `src/features/gifts/components/GiftStatsCards.jsx`
- `src/features/gifts/components/GiftTable.jsx`
- `src/features/gifts/components/guestLabels.js`
- `src/features/gifts/components/GuestSelectField.jsx`
- `src/features/gifts/gifts.test.jsx`
- `src/features/gifts/GiftsFeature.css`
- `src/features/gifts/GiftsFeature.jsx`
- `src/features/gifts/hooks/useGifts.js`

### guests

- `src/features/guests/api/guestApi.js`
- `src/features/guests/components/GuestDeleteDialog.jsx`
- `src/features/guests/components/GuestFilters.jsx`
- `src/features/guests/components/GuestImportModal.css`
- `src/features/guests/components/GuestImportModal.jsx`
- `src/features/guests/components/GuestInlineForm.jsx`
- `src/features/guests/components/GuestInlineForm.test.jsx`
- `src/features/guests/components/GuestQrModal.css`
- `src/features/guests/components/GuestQrModal.jsx`
- `src/features/guests/components/GuestQrModal.test.jsx`
- `src/features/guests/components/GuestRowActions.jsx`
- `src/features/guests/components/GuestStats.jsx`
- `src/features/guests/components/GuestTable.jsx`
- `src/features/guests/components/GuestTable.test.jsx`
- `src/features/guests/guestAuthority.test.jsx`
- `src/features/guests/GuestPage.test.jsx`
- `src/features/guests/guestPersistence.test.jsx`
- `src/features/guests/guests.test.jsx`
- `src/features/guests/GuestsFeature.jsx`
- `src/features/guests/GuestsList.jsx`
- `src/features/guests/GuestsPage.css`
- `src/features/guests/GuestsPage.jsx`
- `src/features/guests/GuestWorkspace.css`
- `src/features/guests/hooks/useDebouncedGuestQuery.js`
- `src/features/guests/hooks/useGuestFilters.js`
- `src/features/guests/hooks/useGuestMutations.js`
- `src/features/guests/hooks/useGuests.js`
- `src/features/guests/model/guestConstants.js`
- `src/features/guests/model/guestCsvUtils.js`
- `src/features/guests/model/guestImport.js`
- `src/features/guests/model/guestImport.test.js`
- `src/features/guests/model/guestLabels.js`
- `src/features/guests/model/guestMappers.js`
- `src/features/guests/model/guestStatus.js`
- `src/features/guests/serverTools.test.jsx`

### invitations

- `src/features/invitations/api/deliveryApi.js`
- `src/features/invitations/api/invitationApi.js`
- `src/features/invitations/api/mediaApi.js`
- `src/features/invitations/checkIn.persistence.test.jsx`
- `src/features/invitations/checkIn.test.jsx`
- `src/features/invitations/components/QrCameraScanner.jsx`
- `src/features/invitations/components/SpotifyMusicPicker.css`
- `src/features/invitations/components/SpotifyMusicPicker.jsx`
- `src/features/invitations/config/templateFormFlowConfig.js`
- `src/features/invitations/config/templateFormFlowConfig.test.js`
- `src/features/invitations/DeliveryWorkspace.css`
- `src/features/invitations/hooks/useCheckInDesk.js`
- `src/features/invitations/InvitationCheckInPage.jsx`
- `src/features/invitations/InvitationDeliveryManager.jsx`
- `src/features/invitations/InvitationDeliveryManager.test.jsx`
- `src/features/invitations/InvitationEditFeature.jsx`
- `src/features/invitations/InvitationForm.jsx`
- `src/features/invitations/InvitationForm.test.jsx`
- `src/features/invitations/InvitationMediaManager.jsx`
- `src/features/invitations/InvitationPages.css`
- `src/features/invitations/invitationPayloadUtils.js`
- `src/features/invitations/invitationPayloadUtils.test.js`
- `src/features/invitations/InvitationPlanEssentialEditor.css`
- `src/features/invitations/InvitationPreviewFeature.jsx`
- `src/features/invitations/InvitationPreviewFeature.test.jsx`
- `src/features/invitations/LivePhoneSimulator.css`
- `src/features/invitations/LivePhoneSimulator.jsx`
- `src/features/invitations/MediaLibrary.css`
- `src/features/invitations/mediaLibraryModel.js`
- `src/features/invitations/mediaLibraryModel.test.js`
- `src/features/invitations/PublicRsvpForm.jsx`
- `src/features/invitations/PublicRsvpForm.language.test.jsx`
- `src/features/invitations/PublicRsvpForm.test.jsx`
- `src/features/invitations/studio/CinematicIntroEditor.jsx`
- `src/features/invitations/studio/FamilyDesignEditor.jsx`
- `src/features/invitations/studio/IllustratedMapDesigner.css`
- `src/features/invitations/studio/IllustratedMapDesignerModal.jsx`
- `src/features/invitations/studio/IllustratedMapDesignerModal.test.jsx`
- `src/features/invitations/studio/IllustratedMapEditor.jsx`
- `src/features/invitations/studio/InvitationStudio.css`
- `src/features/invitations/studio/LocaleChecklist.jsx`
- `src/features/invitations/studio/localeNavigation.js`
- `src/features/invitations/studio/MapToolIcon.jsx`
- `src/features/invitations/studio/PreWeddingVideoEditor.jsx`
- `src/features/invitations/studio/publishReadiness.js`
- `src/features/invitations/studio/PublishReview.jsx`
- `src/features/invitations/studio/RoyalGardenSceneEditor.jsx`
- `src/features/invitations/studio/SaveTheDateEditor.jsx`
- `src/features/invitations/studio/StudioAppearance.jsx`
- `src/features/invitations/studio/StudioChrome.css`
- `src/features/invitations/studio/StudioEventFields.jsx`
- `src/features/invitations/studio/StudioFields.css`
- `src/features/invitations/studio/StudioFields.jsx`
- `src/features/invitations/studio/StudioFields.test.jsx`
- `src/features/invitations/studio/StudioFontPreview.jsx`
- `src/features/invitations/studio/StudioFontPreview.test.jsx`
- `src/features/invitations/studio/StudioGuide.jsx`
- `src/features/invitations/studio/StudioGuide.test.jsx`
- `src/features/invitations/studio/studioMedia.js`
- `src/features/invitations/studio/studioMedia.test.js`
- `src/features/invitations/studio/studioNavigation.js`
- `src/features/invitations/studio/StudioSections.jsx`
- `src/features/invitations/studio/StudioSplitControls.jsx`
- `src/features/invitations/studio/StudioToolbar.jsx`
- `src/features/invitations/studio/StudioUploadField.jsx`
- `src/features/invitations/studio/TemplateChooser.css`
- `src/features/invitations/studio/TemplateChooser.jsx`
- `src/features/invitations/studio/TemplateChooser.test.jsx`
- `src/features/invitations/studio/useStudioPersistence.js`
- `src/features/invitations/studio/useStudioPersistence.test.jsx`
- `src/features/invitations/studio/useStudioSplit.js`
- `src/features/invitations/studio/useStudioSplit.test.jsx`
- `src/features/invitations/studio/WeddingProgramEditor.jsx`
- `src/features/invitations/studio/wordingPresets.js`

### marketing

- `src/features/marketing/components/InvitationDemo.css`
- `src/features/marketing/components/InvitationDemo.jsx`
- `src/features/marketing/components/InvitationShowcase.jsx`
- `src/features/marketing/components/LandingConversion.jsx`
- `src/features/marketing/components/LandingHero.css`
- `src/features/marketing/components/LandingHero.jsx`
- `src/features/marketing/components/LandingPackagePreview.jsx`
- `src/features/marketing/components/LandingPackagePreview.test.jsx`
- `src/features/marketing/components/LandingPhoto.jsx`
- `src/features/marketing/components/LandingProduct.jsx`
- `src/features/marketing/components/LandingStory.jsx`
- `src/features/marketing/components/PricingFactors.jsx`
- `src/features/marketing/ContactFeature.jsx`
- `src/features/marketing/ContactFeature.test.jsx`
- `src/features/marketing/HomeFeature.jsx`
- `src/features/marketing/HomeFeature.test.jsx`
- `src/features/marketing/MarketingFeature.css`
- `src/features/marketing/MarketingPages.css`
- `src/features/marketing/model/packagePresentation.js`
- `src/features/marketing/model/usePackageCatalog.js`
- `src/features/marketing/NotFoundFeature.jsx`
- `src/features/marketing/PricingFeature.jsx`
- `src/features/marketing/PricingFeature.test.jsx`
- `src/features/marketing/PublicControls.test.jsx`
- `src/features/marketing/VenuesFeature.jsx`

### media

- `src/features/media/api/mediaApi.js`
- `src/features/media/hooks/useMedia.js`
- `src/features/media/media.test.jsx`

### notifications

- `src/features/notifications/api/notificationsApi.js`
- `src/features/notifications/components/NotificationItem.jsx`
- `src/features/notifications/components/NotificationList.jsx`
- `src/features/notifications/components/NotificationStatsGrid.jsx`
- `src/features/notifications/hooks/useNotifications.js`
- `src/features/notifications/NotificationPages.css`
- `src/features/notifications/notifications.test.jsx`
- `src/features/notifications/notificationService.js`
- `src/features/notifications/NotificationsPage.jsx`

### organizations

- `src/features/organizations/api/organizationApi.js`
- `src/features/organizations/components/AcceptTeamInvitation.jsx`
- `src/features/organizations/components/ChangeRoleModal.jsx`
- `src/features/organizations/components/InviteMemberModal.jsx`
- `src/features/organizations/components/MemberTable.jsx`
- `src/features/organizations/components/OrganizationCard.jsx`
- `src/features/organizations/components/RoleBadge.jsx`
- `src/features/organizations/components/TeamInvitation.test.jsx`
- `src/features/organizations/hooks/useOrganizationMembers.js`
- `src/features/organizations/hooks/useOrganizations.js`
- `src/features/organizations/model/organizationConstants.js`
- `src/features/organizations/model/organizationPermissions.js`
- `src/features/organizations/OrganizationDetailPage.jsx`
- `src/features/organizations/OrganizationPage.css`
- `src/features/organizations/OrganizationPage.jsx`
- `src/features/organizations/organizations.test.jsx`

### payments

- `src/features/payments/api/paymentsApi.js`
- `src/features/payments/checkoutOffer.js`
- `src/features/payments/checkoutOffer.test.js`
- `src/features/payments/khqr.js`
- `src/features/payments/khqr.test.js`
- `src/features/payments/PaidTemplatesPage.jsx`
- `src/features/payments/PaymentCancelPage.jsx`
- `src/features/payments/PaymentHistoryPage.jsx`
- `src/features/payments/PaymentPages.css`
- `src/features/payments/PaymentQrCard.jsx`
- `src/features/payments/PaymentQrCard.test.jsx`
- `src/features/payments/PaymentReceiptPage.jsx`
- `src/features/payments/PaymentReceiptPage.test.jsx`
- `src/features/payments/paymentService.js`
- `src/features/payments/paymentService.test.js`
- `src/features/payments/paymentStatus.js`
- `src/features/payments/PaymentStatusPage.jsx`
- `src/features/payments/PaymentStatusPage.test.jsx`
- `src/features/payments/PaymentSuccessPage.jsx`
- `src/features/payments/TemplateCheckoutPage.jsx`
- `src/features/payments/TemplateCheckoutPage.test.jsx`

### planning

- `src/features/planning/api/planningApi.js`

### profile

- `src/features/profile/api/profileApi.js`
- `src/features/profile/hooks/useProfile.js`
- `src/features/profile/profile.test.jsx`

### qr

- `src/features/qr/api/qrApi.js`
- `src/features/qr/components/QrDownloadButton.jsx`
- `src/features/qr/components/QrPreview.jsx`
- `src/features/qr/hooks/useQrCode.js`
- `src/features/qr/qr.test.jsx`
- `src/features/qr/qrContract.test.jsx`
- `src/features/qr/QrPage.css`
- `src/features/qr/QrPage.jsx`

### reports

- `src/features/reports/api/reportsApi.js`
- `src/features/reports/components/OwnerReportSummary.jsx`
- `src/features/reports/FinancialReport.jsx`
- `src/features/reports/FinancialReport.test.jsx`
- `src/features/reports/hooks/useActiveEventReport.js`
- `src/features/reports/hooks/useActiveEventReport.test.jsx`
- `src/features/reports/hooks/useReports.js`
- `src/features/reports/model/financialReport.js`
- `src/features/reports/model/financialReport.test.js`
- `src/features/reports/ownerReportIntegration.test.jsx`
- `src/features/reports/reports.test.jsx`
- `src/features/reports/ReportsPage.css`
- `src/features/reports/ReportsPage.jsx`

### rsvp

- `src/features/rsvp/api/rsvpApi.js`
- `src/features/rsvp/components/RsvpGuestTable.jsx`
- `src/features/rsvp/components/RsvpKpiCards.jsx`
- `src/features/rsvp/components/RsvpOwnerActions.jsx`
- `src/features/rsvp/components/RsvpWishesWall.jsx`
- `src/features/rsvp/hooks/useRsvpDashboard.js`
- `src/features/rsvp/ownerManagement.test.jsx`
- `src/features/rsvp/rsvp.test.jsx`
- `src/features/rsvp/RsvpDashboardPage.css`
- `src/features/rsvp/RsvpDashboardPage.jsx`

### seating

- `src/features/seating/api/seatingApi.js`
- `src/features/seating/components/SeatingFloorPlan.css`
- `src/features/seating/components/SeatingFloorPlan.jsx`
- `src/features/seating/components/SeatingFloorPlanModal.jsx`
- `src/features/seating/components/SeatingForms.jsx`
- `src/features/seating/components/SeatingTableCard.jsx`
- `src/features/seating/hooks/useSeating.js`
- `src/features/seating/InvitationSeatingPage.jsx`
- `src/features/seating/notesContract.test.js`
- `src/features/seating/seating.test.jsx`
- `src/features/seating/seatingAccessibility.test.jsx`
- `src/features/seating/SeatingPage.css`
- `src/features/seating/seatingService.js`
- `src/features/seating/seatingSummary.test.jsx`

### subscriptions

- `src/features/subscriptions/PackageCheckout.css`
- `src/features/subscriptions/PackageComparison.jsx`
- `src/features/subscriptions/SubscriptionPackagesPage.css`
- `src/features/subscriptions/SubscriptionPackagesPage.jsx`
- `src/features/subscriptions/SubscriptionPackagesPage.test.jsx`
- `src/features/subscriptions/subscriptionService.js`
- `src/features/subscriptions/subscriptionService.test.js`

### templates

- `src/features/templates/api/templateCatalogApi.js`
- `src/features/templates/api/templateService.js`
- `src/features/templates/blocks/BlockErrorBoundary.jsx`
- `src/features/templates/blocks/blockRegistry.js`
- `src/features/templates/blocks/blockTypes.js`
- `src/features/templates/blocks/CustomImageBlock.jsx`
- `src/features/templates/blocks/CustomTextBlock.jsx`
- `src/features/templates/blocks/DynamicTemplateRenderer.jsx`
- `src/features/templates/blocks/DynamicTemplateRenderer.test.jsx`
- `src/features/templates/blocks/HorizontalScrollSection.jsx`
- `src/features/templates/blocks/HorizontalScrollSection.test.jsx`
- `src/features/templates/blocks/index.js`
- `src/features/templates/blocks/LegacySectionBlock.jsx`
- `src/features/templates/blocks/LegacySectionBlock.test.jsx`
- `src/features/templates/blocks/LegacyTemplateBlock.jsx`
- `src/features/templates/blocks/StandardBlocks.jsx`
- `src/features/templates/catalogCache.test.js`
- `src/features/templates/components/PublicTemplateCard.jsx`
- `src/features/templates/components/PublicTemplateCard.test.jsx`
- `src/features/templates/components/PublicTemplateDevicePreview.css`
- `src/features/templates/components/PublicTemplateDevicePreview.jsx`
- `src/features/templates/components/TemplateGrid.jsx`
- `src/features/templates/components/templates.css`
- `src/features/templates/data/templatesData.js`
- `src/features/templates/experience/components/canva-khmer/canva-khmer-wedding.css`
- `src/features/templates/experience/components/canva-khmer/CanvaKhmerWeddingTemplate.jsx`
- `src/features/templates/experience/components/controls/TemplateMusicControl.jsx`
- `src/features/templates/experience/components/controls/TemplateQuickNav.jsx`
- `src/features/templates/experience/components/sections/TemplateCountdown.jsx`
- `src/features/templates/experience/components/sections/TemplateCouple.jsx`
- `src/features/templates/experience/components/sections/TemplateDressCode.jsx`
- `src/features/templates/experience/components/sections/TemplateFaq.jsx`
- `src/features/templates/experience/components/sections/TemplateFooter.jsx`
- `src/features/templates/experience/components/sections/TemplateGallery.jsx`
- `src/features/templates/experience/components/sections/TemplateGift.jsx`
- `src/features/templates/experience/components/sections/TemplateHero.jsx`
- `src/features/templates/experience/components/sections/TemplateMessage.jsx`
- `src/features/templates/experience/components/sections/TemplateOpeningGate.jsx`
- `src/features/templates/experience/components/sections/TemplateRsvp.jsx`
- `src/features/templates/experience/components/sections/TemplateRsvp.test.jsx`
- `src/features/templates/experience/components/sections/TemplateSchedule.jsx`
- `src/features/templates/experience/components/sections/TemplateStory.jsx`
- `src/features/templates/experience/components/sections/TemplateVenue.jsx`
- `src/features/templates/experience/components/shared/TemplateImage.jsx`
- `src/features/templates/experience/components/shared/TemplateReveal.jsx`
- `src/features/templates/experience/components/shared/TemplateSectionHeader.jsx`
- `src/features/templates/experience/config/openingConfig.js`
- `src/features/templates/experience/config/templateExperienceContent.js`
- `src/features/templates/experience/config/templateExperienceThemes.js`
- `src/features/templates/experience/config/templateIcons.js`
- `src/features/templates/experience/hooks/useTemplateMusicController.js`
- `src/features/templates/experience/studio-fonts.css`
- `src/features/templates/experience/studioStyle.js`
- `src/features/templates/experience/template-experience.css`
- `src/features/templates/experience/TemplateExperience.jsx`
- `src/features/templates/experience/TemplateExperience.security.test.jsx`
- `src/features/templates/experience/TemplateExperience.test.jsx`
- `src/features/templates/experience/TemplateRenderGuard.jsx`
- `src/features/templates/hooks/usePublicTemplateCatalog.js`
- `src/features/templates/index.js`
- `src/features/templates/layouts/bliss-editorial.css`
- `src/features/templates/layouts/BlissEditorialLayout.jsx`
- `src/features/templates/layouts/DefaultTemplate/DefaultTemplateLayout.jsx`
- `src/features/templates/layouts/DigitalYes/components/DigitalYesRsvpModal.jsx`
- `src/features/templates/layouts/DigitalYes/components/DigitalYesSchedule.jsx`
- `src/features/templates/layouts/DigitalYes/components/FallingPetals.jsx`
- `src/features/templates/layouts/DigitalYes/components/WaxSealEnvelope.jsx`
- `src/features/templates/layouts/DigitalYes/digital-yes.css`
- `src/features/templates/layouts/DigitalYes/DigitalYesLayout.jsx`
- `src/features/templates/layouts/DigitalYes/DigitalYesLayout.test.jsx`
- `src/features/templates/layouts/EmeraldLuxe/components/Card3DFlip.jsx`
- `src/features/templates/layouts/EmeraldLuxe/components/VelvetCurtainOpening.jsx`
- `src/features/templates/layouts/EmeraldLuxe/emerald-luxe.css`
- `src/features/templates/layouts/EmeraldLuxe/EmeraldLuxeLayout.jsx`
- `src/features/templates/layouts/EmeraldLuxe/EmeraldLuxeLayout.test.jsx`
- `src/features/templates/layouts/EventEssentialLayout.jsx`
- `src/features/templates/layouts/EventEssentialLayout.test.jsx`
- `src/features/templates/layouts/hostedRsvp.test.jsx`
- `src/features/templates/layouts/KhmerCelestial/celestialMotion.js`
- `src/features/templates/layouts/KhmerCelestial/celestialMotion.test.js`
- `src/features/templates/layouts/KhmerCelestial/celestialTypography.js`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialButterfly.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialFlower.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialGallery.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialHeritage.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialLiveGarden.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialOpening.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialPetal.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialSection.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/CelestialVine.jsx`
- `src/features/templates/layouts/KhmerCelestial/components/OpenInvitationCTA.jsx`
- `src/features/templates/layouts/KhmerCelestial/khmer-celestial.css`
- `src/features/templates/layouts/KhmerCelestial/khmerCelestialAssets.js`
- `src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.jsx`
- `src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.test.jsx`
- `src/features/templates/layouts/previewSecurity.test.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGallery.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenArtworkFrame.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenCeremonialLetter.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenDressCode.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenEntranceScene.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenGifts.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenGuestFrame.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenInformationScene.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenIntro.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenMonogram.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenMotionLayer.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenRoyalArch.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenVideoScene.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/components/RoyalGardenWeddingCalendar.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/hooks/useIntroSequence.js`
- `src/features/templates/layouts/RoyalGardenCinematic/hooks/useIntroSequence.test.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/hooks/useRoyalMotionBudget.js`
- `src/features/templates/layouts/RoyalGardenCinematic/model/royalGardenGuestPresentation.js`
- `src/features/templates/layouts/RoyalGardenCinematic/model/royalGardenPresentation.js`
- `src/features/templates/layouts/RoyalGardenCinematic/README.md`
- `src/features/templates/layouts/RoyalGardenCinematic/royal-garden-cinematic.css`
- `src/features/templates/layouts/RoyalGardenCinematic/royal-garden-guest.css`
- `src/features/templates/layouts/RoyalGardenCinematic/royal-garden-scenes.css`
- `src/features/templates/layouts/RoyalGardenCinematic/royal-garden-v33.css`
- `src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenCinematicLayout.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenCinematicLayout.test.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenV3.test.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenV32.test.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenV33.test.jsx`
- `src/features/templates/layouts/RoyalGardenCinematic/template.json`
- `src/features/templates/layouts/RoyalKhmer/RoyalKhmerLayout.jsx`
- `src/features/templates/layouts/SilkHeritage/silk-heritage.css`
- `src/features/templates/layouts/SilkHeritage/SilkHeritageLayout.jsx`
- `src/features/templates/layouts/SilkHeritage/SilkHeritageLayout.test.jsx`
- `src/features/templates/layouts/SilkHeritage/template.json`
- `src/features/templates/layouts/SilkHeritage/useSilkMotion.js`
- `src/features/templates/layouts/TEMPLATE_CONTRACT.md`
- `src/features/templates/layouts/TemplateBoilerplate/BOILERPLATE_GUIDE.md`
- `src/features/templates/layouts/TemplateBoilerplate/template-boilerplate.css`
- `src/features/templates/layouts/TemplateBoilerplate/template.json`
- `src/features/templates/layouts/TemplateBoilerplate/TemplateBoilerplateLayout.jsx`
- `src/features/templates/layouts/withjoy-portal.css`
- `src/features/templates/layouts/WithJoyPortalLayout.jsx`
- `src/features/templates/model/catalogPolicy.js`
- `src/features/templates/model/catalogPolicy.test.js`
- `src/features/templates/model/publicTemplateImage.js`
- `src/features/templates/model/templateIdentity.js`
- `src/features/templates/model/templateIdentity.test.js`
- `src/features/templates/model/templateIntent.js`
- `src/features/templates/model/templateIntent.test.js`
- `src/features/templates/model/templateModel.js`
- `src/features/templates/model/templatePresentation.js`
- `src/features/templates/model/templatePresentation.test.js`
- `src/features/templates/pages/BrowseTemplates.css`
- `src/features/templates/pages/BrowseTemplatesFeature.jsx`
- `src/features/templates/pages/BrowseTemplatesFeature.test.jsx`
- `src/features/templates/pages/HostTemplateDemoFeature.jsx`
- `src/features/templates/pages/HostTemplateDemoFeature.test.jsx`
- `src/features/templates/pages/TemplateDemoFeature.jsx`
- `src/features/templates/pages/TemplatesFeature.jsx`
- `src/features/templates/registry/phase10Contract.test.jsx`
- `src/features/templates/registry/phase12ContractMatrix.test.jsx`
- `src/features/templates/registry/templateCapabilities.js`
- `src/features/templates/registry/templateRegistry.js`
- `src/features/templates/registry/templateRegistry.test.jsx`
- `src/features/templates/shared/AudioPlayer/FloatingAudioPlayer.jsx`
- `src/features/templates/shared/AuthoredClosing.jsx`
- `src/features/templates/shared/AuthoredFamilies.jsx`
- `src/features/templates/shared/CeremonyIcon.jsx`
- `src/features/templates/shared/ceremonyIcons.js`
- `src/features/templates/shared/cinematicIntro.js`
- `src/features/templates/shared/cinematicIntro.test.js`
- `src/features/templates/shared/Controls/FloatingActionBar.jsx`
- `src/features/templates/shared/Countdown/CountdownTimer.jsx`
- `src/features/templates/shared/event-sections.css`
- `src/features/templates/shared/eventCalendarExport.js`
- `src/features/templates/shared/eventDateTime.js`
- `src/features/templates/shared/eventDateTime.test.js`
- `src/features/templates/shared/eventPresentation.js`
- `src/features/templates/shared/eventProgramExport.test.js`
- `src/features/templates/shared/EventSchedule/ScheduleList.jsx`
- `src/features/templates/shared/eventSections.test.jsx`
- `src/features/templates/shared/eventTemplateMatrix.test.jsx`
- `src/features/templates/shared/FamilyNames.jsx`
- `src/features/templates/shared/Gallery/GalleryGrid.jsx`
- `src/features/templates/shared/goldenIntro.test.jsx`
- `src/features/templates/shared/IllustratedMap.jsx`
- `src/features/templates/shared/illustratedMapModel.js`
- `src/features/templates/shared/illustratedMapModel.test.js`
- `src/features/templates/shared/index.js`
- `src/features/templates/shared/invitation-features.css`
- `src/features/templates/shared/invitationFeatures.js`
- `src/features/templates/shared/invitationFeatures.test.jsx`
- `src/features/templates/shared/InvitationLabel.jsx`
- `src/features/templates/shared/invitationLabels.js`
- `src/features/templates/shared/invitationLocaleContext.js`
- `src/features/templates/shared/localizedContent.js`
- `src/features/templates/shared/localizedContent.test.js`
- `src/features/templates/shared/mapPresets.js`
- `src/features/templates/shared/mapSymbols.js`
- `src/features/templates/shared/Openings/cinematicOpeningContext.js`
- `src/features/templates/shared/Openings/CinematicOpeningProvider.jsx`
- `src/features/templates/shared/Openings/CinematicVideoOpening.css`
- `src/features/templates/shared/Openings/CinematicVideoOpening.jsx`
- `src/features/templates/shared/Openings/CoverBackground.css`
- `src/features/templates/shared/Openings/CoverBackground.jsx`
- `src/features/templates/shared/Openings/CoverBackground.test.jsx`
- `src/features/templates/shared/Openings/RibbonOpening.jsx`
- `src/features/templates/shared/phase12Refinements.test.jsx`
- `src/features/templates/shared/program.js`
- `src/features/templates/shared/program.test.js`
- `src/features/templates/shared/ProgramDetails.jsx`
- `src/features/templates/shared/ProgramTimeline.jsx`
- `src/features/templates/shared/royalGardenDemo.js`
- `src/features/templates/shared/RSVP/RsvpContainer.jsx`
- `src/features/templates/shared/SaveTheDate.jsx`
- `src/features/templates/shared/templateTypography.js`
- `src/features/templates/shared/vectorExport.js`
- `src/features/templates/templateCoreContract.test.js`
- `src/features/templates/templateResolution.test.js`

### tickets

- `src/features/tickets/PublicTicketAccess.jsx`
- `src/features/tickets/TicketActions.jsx`
- `src/features/tickets/ticketApi.js`
- `src/features/tickets/TicketDesigner.jsx`
- `src/features/tickets/ticketLocalization.js`
- `src/features/tickets/ticketLocalization.test.js`
- `src/features/tickets/TicketModal.jsx`
- `src/features/tickets/TicketPreview.jsx`
- `src/features/tickets/ticketRenderer.js`
- `src/features/tickets/tickets.css`

### wedding-builder

- `src/features/wedding-builder/utils/draftPublishApi.js`
- `src/features/wedding-builder/utils/draftPublishApi.test.js`
- `src/features/wedding-builder/utils/draftToTemplate.js`
- `src/features/wedding-builder/utils/draftToTemplate.test.js`
- `src/features/wedding-builder/utils/invitationDraftAdapter.js`
- `src/features/wedding-builder/utils/invitationDraftAdapter.test.js`
- `src/features/wedding-builder/WeddingBuilderFeature.css`
- `src/features/wedding-builder/WeddingBuilderFeature.jsx`
- `src/features/wedding-builder/WeddingBuilderFeature.test.jsx`

### wedding-site

- `src/features/wedding-site/hooks/useCountdown.js`
- `src/features/wedding-site/PublicInvitationFeature.jsx`
- `src/features/wedding-site/publicInvitationQuery.js`
- `src/features/wedding-site/publicInvitationQuery.test.js`
- `src/features/wedding-site/wedding-site.css`
- `src/features/wedding-site/WeddingPreviewFeature.jsx`
- `src/features/wedding-site/WeddingSite.jsx`
- `src/features/wedding-site/WeddingSite.test.jsx`

### wishes

- `src/features/wishes/api/wishesApi.js`
- `src/features/wishes/components/WishCard.jsx`
- `src/features/wishes/components/WishList.jsx`
- `src/features/wishes/hooks/useWishes.js`
- `src/features/wishes/wishes.test.jsx`
- `src/features/wishes/WishesPage.css`
- `src/features/wishes/WishesPage.jsx`

### pages

- `src/pages/auth/ForgotPasswordPage.jsx`
- `src/pages/auth/LoginPage.jsx`
- `src/pages/auth/RegisterPage.jsx`
- `src/pages/auth/ResetPasswordPage.jsx`
- `src/pages/host/BudgetPage.jsx`
- `src/pages/host/ChangePasswordPage.jsx`
- `src/pages/host/DashboardPage.jsx`
- `src/pages/host/EventsPage.jsx`
- `src/pages/host/ExpensesPage.jsx`
- `src/pages/host/GuestsPage.jsx`
- `src/pages/host/invitations/InvitationCheckInPage.jsx`
- `src/pages/host/invitations/InvitationCreatePage.jsx`
- `src/pages/host/invitations/InvitationDeliveryPage.jsx`
- `src/pages/host/invitations/InvitationEditPage.jsx`
- `src/pages/host/invitations/InvitationMediaPage.jsx`
- `src/pages/host/invitations/InvitationPreviewPage.jsx`
- `src/pages/host/NotificationsPage.jsx`
- `src/pages/host/ProfilePage.jsx`
- `src/pages/host/SeatingPage.jsx`
- `src/pages/host/SubscriptionPackagesPage.jsx`
- `src/pages/host/templates/BrowseTemplatesPage.jsx`
- `src/pages/host/templates/HostTemplateDemoPage.jsx`
- `src/pages/host/WeddingGiftPage.jsx`
- `src/pages/marketing/ContactPage.jsx`
- `src/pages/marketing/HomePage.jsx`
- `src/pages/marketing/NotFoundPage.jsx`
- `src/pages/marketing/PricingPage.jsx`
- `src/pages/marketing/TemplateDemoPage.jsx`
- `src/pages/marketing/TemplatesPage.jsx`
- `src/pages/marketing/VenuesPage.jsx`
- `src/pages/payments/PaymentHistoryPage.jsx`
- `src/pages/payments/PaymentReceiptPage.jsx`
- `src/pages/public/PublicInvitationPage.jsx`
- `src/pages/public/WeddingPreviewPage.jsx`

### layouts

- `src/layouts/AuthShell.jsx`
- `src/layouts/components/Footer.jsx`
- `src/layouts/components/Header.jsx`
- `src/layouts/components/HostNav.jsx`
- `src/layouts/components/MarketingChrome.css`
- `src/layouts/HostShell.css`
- `src/layouts/HostShell.jsx`
- `src/layouts/MarketingShell.jsx`

### shared

- `src/shared/access/access.css`
- `src/shared/access/accessCopy.js`
- `src/shared/access/accessDecision.js`
- `src/shared/access/accessDecision.test.js`
- `src/shared/access/AccessFailureState.jsx`
- `src/shared/access/entitlementContext.js`
- `src/shared/access/EntitlementProvider.jsx`
- `src/shared/access/EntitlementProvider.test.jsx`
- `src/shared/access/FeatureAccessCard.jsx`
- `src/shared/access/QuotaProgress.jsx`
- `src/shared/access/UpgradeFeatureDialog.jsx`
- `src/shared/access/UpgradeFeatureDialog.test.jsx`
- `src/shared/access/useAccessError.js`
- `src/shared/access/useFeatureAccess.js`
- `src/shared/animations/RouteMotion.jsx`
- `src/shared/animations/siteAnimations.css`
- `src/shared/animations/SiteAnimations.jsx`
- `src/shared/api/ApiError.js`
- `src/shared/api/downloadCsv.js`
- `src/shared/api/helpers.js`
- `src/shared/api/httpClient.js`
- `src/shared/api/httpClient.test.js`
- `src/shared/api/i18nService.js`
- `src/shared/data/musicTracks.js`
- `src/shared/feedback/feedback.js`
- `src/shared/feedback/FeedbackHost.jsx`
- `src/shared/feedback/FeedbackHost.test.jsx`
- `src/shared/fonts/core-fonts.css`
- `src/shared/fonts/RouteFontLoader.jsx`
- `src/shared/hooks/useClickOutside.js`
- `src/shared/hooks/usePrefersReducedMotion.js`
- `src/shared/hooks/usePreviewSyncRetries.js`
- `src/shared/hooks/usePreviewSyncRetries.test.jsx`
- `src/shared/hooks/useToggle.js`
- `src/shared/i18n/i18n.test.jsx`
- `src/shared/i18n/interfaceLanguage.test.jsx`
- `src/shared/i18n/invitationLanguage.js`
- `src/shared/i18n/marketingFallback.test.jsx`
- `src/shared/i18n/marketingMessages.js`
- `src/shared/i18n/messagesDictionary.js`
- `src/shared/i18n/operationsMessages.js`
- `src/shared/i18n/profileMessages.js`
- `src/shared/i18n/useBackendMessages.js`
- `src/shared/i18n/useBackendMessages.test.jsx`
- `src/shared/i18n/useT.js`
- `src/shared/i18n/useUiCopy.js`
- `src/shared/i18n/workspaceMessages.js`
- `src/shared/motion/variants.js`
- `src/shared/navigation/unsavedHistoryGuard.js`
- `src/shared/preferences/DisplayPreferences.jsx`
- `src/shared/preferences/DisplayPreferences.test.jsx`
- `src/shared/preview/previewDevices.js`
- `src/shared/preview/previewMessaging.js`
- `src/shared/preview/previewMessaging.test.js`
- `src/shared/preview/studioEditTargets.js`
- `src/shared/preview/useStudioPreviewEditing.js`
- `src/shared/storage/authStorage.js`
- `src/shared/storage/draftMediaStorage.js`
- `src/shared/storage/galleryStorage.js`
- `src/shared/storage/hostPlanningStorage.js`
- `src/shared/storage/index.js`
- `src/shared/storage/weddingStorage.js`
- `src/shared/storage/weddingStorage.test.js`
- `src/shared/styles/app-experience.css`
- `src/shared/styles/semantic-tokens.css`
- `src/shared/styles/semanticTokens.test.js`
- `src/shared/styles/workspace-ui.css`
- `src/shared/telegram/telegramWebApp.js`
- `src/shared/ui/ChatBot.css`
- `src/shared/ui/ChatBot.jsx`
- `src/shared/ui/ConfirmDialog.css`
- `src/shared/ui/ConfirmDialog.jsx`
- `src/shared/ui/DatePicker.css`
- `src/shared/ui/DatePicker.jsx`
- `src/shared/ui/DatePicker.test.jsx`
- `src/shared/ui/EmptyState.css`
- `src/shared/ui/EmptyState.jsx`
- `src/shared/ui/ErrorState.css`
- `src/shared/ui/ErrorState.jsx`
- `src/shared/ui/FormField.css`
- `src/shared/ui/FormField.jsx`
- `src/shared/ui/FormField.test.jsx`
- `src/shared/ui/index.js`
- `src/shared/ui/LoadingButton.css`
- `src/shared/ui/LoadingButton.jsx`
- `src/shared/ui/LoadingState.jsx`
- `src/shared/ui/LoadingState.test.jsx`
- `src/shared/ui/MediaImage.jsx`
- `src/shared/ui/MediaImage.test.jsx`
- `src/shared/ui/Modal.css`
- `src/shared/ui/Modal.jsx`
- `src/shared/ui/Modal.test.jsx`
- `src/shared/ui/PhoneFrame.css`
- `src/shared/ui/PhoneFrame.jsx`
- `src/shared/ui/ResponsiveTable.css`
- `src/shared/ui/ResponsiveTable.jsx`
- `src/shared/ui/RouteLoadingSkeleton.jsx`
- `src/shared/ui/ScrollReveal.jsx`
- `src/shared/ui/SearchInput.css`
- `src/shared/ui/SearchInput.jsx`
- `src/shared/ui/sharedUi.test.jsx`
- `src/shared/ui/Skeleton.css`
- `src/shared/ui/Skeleton.jsx`
- `src/shared/ui/StatusBadge.css`
- `src/shared/ui/StatusBadge.jsx`
- `src/shared/ui/SupportWidget.jsx`
- `src/shared/ui/TimePicker.css`
- `src/shared/ui/TimePicker.jsx`
- `src/shared/ui/TimePicker.test.jsx`
- `src/shared/ui/TimePickerDropdown.jsx`
- `src/shared/ui/Toast.css`
- `src/shared/ui/toast.js`
- `src/shared/ui/ToastContainer.jsx`
- `src/shared/ui/ToastContainer.test.jsx`
- `src/shared/utils/localDate.js`
- `src/shared/utils/localDate.test.js`

### app

- `src/app/App.jsx`
- `src/app/guards/RequireAuth.jsx`
- `src/app/guards/RequireAuth.test.jsx`
- `src/app/providers/AuthProvider.jsx`
- `src/app/providers/AuthProvider.test.jsx`
- `src/app/providers/index.js`
- `src/app/providers/QueryProvider.jsx`
- `src/app/providers/ThemeProvider.jsx`
- `src/app/router.jsx`
- `src/app/router.test.jsx`
- `src/app/routes/authRoutes.jsx`
- `src/app/routes/builderRoutes.jsx`
- `src/app/routes/hostRoutes.jsx`
- `src/app/routes/InvitationScopedRedirect.jsx`
- `src/app/routes/lazyRoutePages.js`
- `src/app/routes/marketingRoutes.jsx`
- `src/app/routes/reportAliases.test.jsx`
- `src/app/routes/RequireAuth.jsx`
- `src/app/ScrollToTop.jsx`

### stores

- `src/stores/useAppearanceStore.js`
- `src/stores/useAuthStore.js`
- `src/stores/useAuthStore.test.js`
- `src/stores/useLanguageStore.js`
- `src/stores/useWeddingStore.js`


## frontend-admin file index

### api-monitor

- `src/features/api-monitor/apiContractValidator.js`
- `src/features/api-monitor/apiContractValidator.test.js`
- `src/features/api-monitor/ApiMonitorCommandPalette.jsx`
- `src/features/api-monitor/ApiMonitorFeature.jsx`
- `src/features/api-monitor/ApiMonitorFeature.test.jsx`
- `src/features/api-monitor/ErrorInvestigationPanel.jsx`
- `src/features/api-monitor/LiveRequestTable.jsx`
- `src/features/api-monitor/MonitorOverview.jsx`
- `src/features/api-monitor/openapiContractManifest.json`
- `src/features/api-monitor/QaSessionBar.jsx`
- `src/features/api-monitor/QaSessionBar.test.jsx`
- `src/features/api-monitor/RequestDetailsDrawer.jsx`
- `src/features/api-monitor/RequestFilters.jsx`
- `src/features/api-monitor/RequestMetricsChart.jsx`
- `src/features/api-monitor/RequestWaterfall.jsx`
- `src/features/api-monitor/RequestWaterfall.test.jsx`
- `src/features/api-monitor/SlowRequestsPanel.jsx`
- `src/features/api-monitor/SqlDiagnosticsPanel.jsx`
- `src/features/api-monitor/useApiMonitorStream.js`
- `src/features/api-monitor/useQaSessionRecorder.js`

### dashboard

- `src/features/dashboard/AdminDashboardPage.jsx`
- `src/features/dashboard/components/AnimatedNumber.jsx`
- `src/features/dashboard/components/AnimatedTrendChart.jsx`
- `src/features/dashboard/components/ConversionHealthBox.jsx`
- `src/features/dashboard/components/CoreMetricsBox.jsx`
- `src/features/dashboard/components/DashboardFacts.test.jsx`
- `src/features/dashboard/components/LiveTickerBanner.jsx`
- `src/features/dashboard/components/RecentInvitationsCard.jsx`
- `src/features/dashboard/components/RecentInvitationsCard.test.jsx`
- `src/features/dashboard/dashboardService.js`

### notifications

- `src/features/notifications/AdminNotificationsFeature.jsx`

### packages

- `src/features/packages/AdminPackagesFeature.jsx`

### payments

- `src/features/payments/AdminPaymentsFeature.jsx`

### reports

- `src/features/reports/AdminReportOverview.jsx`
- `src/features/reports/AdminReportOverview.test.jsx`
- `src/features/reports/components/CategoryBreakdownSection.jsx`
- `src/features/reports/components/FinancialReportSection.jsx`
- `src/features/reports/components/GuestsRsvpCheckinSection.jsx`
- `src/features/reports/components/InvitationsReportSection.jsx`
- `src/features/reports/components/ReportAnalytics.jsx`
- `src/features/reports/components/ReportDrawer.jsx`
- `src/features/reports/components/ReportExportMenu.jsx`
- `src/features/reports/components/ReportFilters.jsx`
- `src/features/reports/components/ReportKpi.jsx`
- `src/features/reports/components/ReportLedger.jsx`
- `src/features/reports/components/ReportNavigation.jsx`
- `src/features/reports/components/ReportOverviewCards.jsx`
- `src/features/reports/components/ReportPrintPreviewModal.jsx`
- `src/features/reports/components/SubscriptionsReportSection.jsx`
- `src/features/reports/components/SystemHealthSection.jsx`
- `src/features/reports/FinancialReport.css`
- `src/features/reports/FinancialReport.jsx`
- `src/features/reports/FinancialReport.test.jsx`
- `src/features/reports/reportConstants.js`
- `src/features/reports/reportFocus.js`
- `src/features/reports/reportModel.js`
- `src/features/reports/reportModel.test.js`
- `src/features/reports/reports.css`
- `src/features/reports/reportWorkspace.js`
- `src/features/reports/useFinancialReportData.js`
- `src/features/reports/useFinancialReportData.test.jsx`

### system-logs

- `src/features/system-logs/AdminSystemLogsFeature.jsx`

### templates

- `src/features/templates/AdminTemplateEditFeature.jsx`
- `src/features/templates/AdminTemplatesFeature.jsx`
- `src/features/templates/components/BlockEditors.jsx`
- `src/features/templates/components/blockHelpers.js`
- `src/features/templates/components/blockHelpers.test.js`
- `src/features/templates/components/index.js`
- `src/features/templates/components/TemplateBlocksManager.jsx`
- `src/features/templates/components/TemplateCoverSection.jsx`
- `src/features/templates/components/TemplateGallerySection.jsx`
- `src/features/templates/components/TemplateQrSection.jsx`
- `src/features/templates/components/TemplateSectionOrderManager.jsx`
- `src/features/templates/components/templateSections.js`
- `src/features/templates/components/TemplateUnifiedSectionsManager.jsx`

### users

- `src/features/users/AdminUserDetailFeature.jsx`
- `src/features/users/AdminUsersFeature.jsx`
- `src/features/users/AdminUsersFeature.test.jsx`

### pages

- `src/pages/auth/LoginPage.jsx`
- `src/pages/dashboard/AdminDashboardPage.jsx`
- `src/pages/dev/ApiMonitorPage.jsx`
- `src/pages/notifications/AdminNotificationsPage.jsx`
- `src/pages/payments/AdminPackagesPage.jsx`
- `src/pages/payments/AdminPaymentsPage.jsx`
- `src/pages/reports/AdminReportsPage.jsx`
- `src/pages/system-logs/AdminSystemLogsPage.jsx`
- `src/pages/templates/AdminTemplateEditPage.jsx`
- `src/pages/templates/AdminTemplatesPage.jsx`
- `src/pages/users/AdminUserDetailPage.jsx`
- `src/pages/users/AdminUsersPage.jsx`

### layouts

- `src/layouts/AdminLayout.jsx`
- `src/layouts/components/AdminDialog.jsx`
- `src/layouts/components/AdminHeader.jsx`
- `src/layouts/components/adminNavigation.js`
- `src/layouts/components/AdminNavigationSearch.jsx`
- `src/layouts/components/AdminSidebar.jsx`

### shared

- `src/shared/api/adminHttpClient.js`
- `src/shared/api/adminService.js`
- `src/shared/api/adminService.test.js`
- `src/shared/api/authService.js`
- `src/shared/api/index.js`
- `src/shared/config/runtime.js`
- `src/shared/hooks/index.js`
- `src/shared/hooks/usePreviewSyncRetries.js`
- `src/shared/hooks/usePreviewSyncRetries.test.jsx`
- `src/shared/hooks/useResource.js`
- `src/shared/hooks/useResource.test.jsx`
- `src/shared/hooks/useToast.js`
- `src/shared/preview/previewMessaging.js`
- `src/shared/preview/previewMessaging.test.js`
- `src/shared/ui/AdminSkeleton.css`
- `src/shared/ui/AdminSkeleton.jsx`
- `src/shared/ui/AdminUI.jsx`
- `src/shared/ui/AnimatedNumber.jsx`
- `src/shared/ui/DatePicker.jsx`
- `src/shared/ui/DateTimePicker.test.jsx`
- `src/shared/ui/dateTimeUtils.js`
- `src/shared/ui/index.js`
- `src/shared/ui/States.jsx`
- `src/shared/ui/TimePicker.jsx`
- `src/shared/ui/Toast.jsx`
- `src/shared/utils/authStorage.js`
- `src/shared/utils/csvExport.js`
- `src/shared/utils/csvExport.test.js`
- `src/shared/utils/format.js`
- `src/shared/utils/format.test.js`
- `src/shared/utils/index.js`

### app

- `src/app/App.jsx`
- `src/app/App.test.jsx`
- `src/app/guards/RequireAdmin.jsx`
- `src/app/guards/RequireAdmin.test.jsx`
- `src/app/providers/AdminAuthProvider.jsx`
- `src/app/providers/AdminLanguageProvider.jsx`
- `src/app/providers/index.js`
- `src/app/providers/QueryProvider.jsx`
- `src/app/routes.js`


## First-batch source additions

New admin dialog/search/navigation components are implementation work, beyond the original source counts. Their final tests and visual evidence remain batch-specific.

- `apps/frontend-admin/src/layouts/components/AdminDialog.jsx`
- `apps/frontend-admin/src/layouts/components/AdminNavigationSearch.jsx`
