# Current route-to-shell ownership

Source mapping only; aliases are not separate verified workflows.

| ID | App | Route | Group | Shell | Alias | Domain phase |
|---|---|---|---|---|---|---|
| SCOPE-001 | frontend-user | `/templates/:id/preview` | template-demo | GuestRenderer | false | 10 |
| SCOPE-002 | frontend-user | `/create/wedding` | create-event | RedirectOnly | true | 11 |
| SCOPE-003 | frontend-user | `/event/create` | create-event | RedirectOnly | true | 11 |
| SCOPE-004 | frontend-user | `/dashboard/events/create` | create-event | RedirectOnly | true | 11 |
| SCOPE-005 | frontend-user | `/create/wedding/:id` | invitation | StandaloneEditorOrScopedRedirect | true | 13 |
| SCOPE-006 | frontend-user | `/event/:id/manage` | invitation | StandaloneEditorOrScopedRedirect | true | 13 |
| SCOPE-007 | frontend-user | `/event/:draftId` | local-preview | GuestRenderer | false | 15 |
| SCOPE-008 | frontend-user | `/preview/:draftId` | local-preview | GuestRenderer | true | 15 |
| SCOPE-009 | frontend-user | `/payments/:orderCode/status` | payment-status | UserSystem | false | 21 |
| SCOPE-010 | frontend-user | `/payments/success` | payment-return | UserSystem | false | 21 |
| SCOPE-011 | frontend-user | `/payments/return` | payment-return | UserSystem | true | 21 |
| SCOPE-012 | frontend-user | `/payments/cancel` | payment-cancel | UserSystem | false | 21 |
| SCOPE-013 | frontend-user | `/w/:slug` | public-invitation | GuestRenderer | false | 16 |
| SCOPE-014 | frontend-user | `/i/:slug` | public-invitation | GuestRenderer | true | 16 |
| SCOPE-015 | frontend-user | `/` | home | MarketingShell | false | 07 |
| SCOPE-016 | frontend-user | `/templates` | catalog | MarketingShell | false | 09 |
| SCOPE-017 | frontend-user | `/templates/:templateId/checkout` | checkout | MarketingShell | false | 09 |
| SCOPE-018 | frontend-user | `/pricing` | pricing | MarketingShell | false | 09 |
| SCOPE-019 | frontend-user | `/contact` | contact | MarketingShell | false | 07 |
| SCOPE-020 | frontend-user | `/venues` | venues | MarketingShell | false | 07 |
| SCOPE-021 | frontend-user | `/venues/:id` | venue-detail | MarketingShell | false | 07 |
| SCOPE-022 | frontend-user | `/about` | contact | MarketingShell | true | 07 |
| SCOPE-023 | frontend-user | `/help` | contact | MarketingShell | true | 07 |
| SCOPE-024 | frontend-user | `/templates/:id` | template-demo | GuestRenderer | false | 10 |
| SCOPE-025 | frontend-user | `/templates/:id/demo` | template-demo | GuestRenderer | true | 10 |
| SCOPE-026 | frontend-user | `/login` | auth-login | AuthShell | false | 08 |
| SCOPE-027 | frontend-user | `/register` | auth-register | AuthShell | false | 08 |
| SCOPE-028 | frontend-user | `/forgot-password` | auth-forgot | AuthShell | false | 08 |
| SCOPE-029 | frontend-user | `/reset-password` | auth-reset | AuthShell | false | 08 |
| SCOPE-030 | frontend-user | `/app/events` | events | HostShell | false | 12 |
| SCOPE-031 | frontend-user | `/app/events/new` | create-event | HostShell | false | 11 |
| SCOPE-032 | frontend-user | `/app/events/:eventId` | dashboard | HostShell, EventWorkspace | false | 12 |
| SCOPE-033 | frontend-user | `/app/events/:eventId/invitation` | invitation | HostShell, EventWorkspace | false | 13 |
| SCOPE-034 | frontend-user | `/app/events/:eventId/tickets/design` | ticket | HostShell, EventWorkspace | false | 20 |
| SCOPE-035 | frontend-user | `/app/events/:eventId/settings` | settings | HostShell, EventWorkspace | false | 23 |
| SCOPE-036 | frontend-user | `/app/events/:eventId/team` | team | HostShell, EventWorkspace | false | 23 |
| SCOPE-037 | frontend-user | `/app/events/:eventId/analytics` | analytics | HostShell, EventWorkspace | false | 22 |
| SCOPE-038 | frontend-user | `/app/events/:eventId/preview` | preview | HostShell, EventWorkspace, GuestRenderer | false | 15 |
| SCOPE-039 | frontend-user | `/app/events/:eventId/guests` | guests | HostShell, EventWorkspace | false | 17 |
| SCOPE-040 | frontend-user | `/app/events/:eventId/rsvp` | rsvp | HostShell, EventWorkspace | false | 18 |
| SCOPE-041 | frontend-user | `/app/events/:eventId/gifts` | gifts | HostShell, EventWorkspace | false | 21 |
| SCOPE-042 | frontend-user | `/app/events/:eventId/budget` | budget | HostShell, EventWorkspace | false | 22 |
| SCOPE-043 | frontend-user | `/app/events/:eventId/seating` | seating | HostShell, EventWorkspace | false | 19 |
| SCOPE-044 | frontend-user | `/app/events/:eventId/check-in` | check-in | HostShell, EventWorkspace | false | 20 |
| SCOPE-045 | frontend-user | `/app/events/:eventId/reports` | reports | HostShell, EventWorkspace | false | 22 |
| SCOPE-046 | frontend-user | `/app/events/:eventId/delivery` | delivery | HostShell, EventWorkspace | false | 15 |
| SCOPE-047 | frontend-user | `/app/events/:eventId/media` | media | HostShell, EventWorkspace | false | 14 |
| SCOPE-048 | frontend-user | `/app/events/:eventId/qr` | qr | HostShell, EventWorkspace | false | 20 |
| SCOPE-049 | frontend-user | `/app/events/:eventId/wishes` | wishes | HostShell, EventWorkspace | false | 18 |
| SCOPE-050 | frontend-user | `/app/events/:eventId/assistant` | assistant | HostShell, EventWorkspace | false | 23 |
| SCOPE-051 | frontend-user | `/app/profile` | profile | HostShell | false | 08 |
| SCOPE-052 | frontend-user | `/app/change-password` | password | HostShell | false | 08 |
| SCOPE-053 | frontend-user | `/app/notifications` | notifications | HostShell | false | 23 |
| SCOPE-054 | frontend-user | `/app/packages` | packages | HostShell | false | 21 |
| SCOPE-055 | frontend-user | `/app/payments` | payments | HostShell | false | 21 |
| SCOPE-056 | frontend-user | `/app/payments/:orderCode` | receipt | HostShell | false | 21 |
| SCOPE-057 | frontend-user | `/app/organizations` | organizations | HostShell | false | 23 |
| SCOPE-058 | frontend-user | `/app/organizations/:organizationId` | organization-detail | HostShell | false | 23 |
| SCOPE-059 | frontend-user | `/app/templates/paid` | paid-templates | HostShell | false | 09 |
| SCOPE-060 | frontend-user | `/dashboard/profile` | profile | HostShell | true | 08 |
| SCOPE-061 | frontend-user | `/dashboard/change-password` | password | HostShell | true | 08 |
| SCOPE-062 | frontend-user | `/dashboard/notifications` | notifications | HostShell | true | 23 |
| SCOPE-063 | frontend-user | `/dashboard/packages` | packages | HostShell | true | 21 |
| SCOPE-064 | frontend-user | `/dashboard/payments` | payments | HostShell | true | 21 |
| SCOPE-065 | frontend-user | `/dashboard/payments/:orderCode` | receipt | HostShell | true | 21 |
| SCOPE-066 | frontend-user | `/dashboard/organizations` | organizations | HostShell | true | 23 |
| SCOPE-067 | frontend-user | `/dashboard/organizations/:organizationId` | organization-detail | HostShell | true | 23 |
| SCOPE-068 | frontend-user | `/dashboard/templates/paid` | paid-templates | HostShell | true | 09 |
| SCOPE-069 | frontend-user | `/dashboard` | dashboard | HostShell | true | 12 |
| SCOPE-070 | frontend-user | `/dashboard/events` | events | HostShell | true | 12 |
| SCOPE-071 | frontend-user | `/dashboard/invitations` | events | HostShell | true | 12 |
| SCOPE-072 | frontend-user | `/dashboard/invitations/new` | create-event | HostShell | true | 11 |
| SCOPE-073 | frontend-user | `/dashboard/invitations/design` | legacy-unsaved-editor | HostShell | false | 13 |
| SCOPE-074 | frontend-user | `/dashboard/invitations/edit` | legacy-unsaved-editor | HostShell | false | 13 |
| SCOPE-075 | frontend-user | `/dashboard/invitations/:id/edit` | invitation | HostShell | true | 13 |
| SCOPE-076 | frontend-user | `/dashboard/invitations/:id/preview` | preview | HostShell, GuestRenderer | true | 15 |
| SCOPE-077 | frontend-user | `/dashboard/invitations/:id` | dashboard | HostShell | true | 12 |
| SCOPE-078 | frontend-user | `/dashboard/invitations/:invitationId/guests` | guests | HostShell | true | 17 |
| SCOPE-079 | frontend-user | `/dashboard/invitations/:invitationId/rsvp` | rsvp | HostShell | true | 18 |
| SCOPE-080 | frontend-user | `/dashboard/invitations/:invitationId/gifts` | gifts | HostShell | true | 21 |
| SCOPE-081 | frontend-user | `/dashboard/invitations/:invitationId/budget` | budget | HostShell | true | 22 |
| SCOPE-082 | frontend-user | `/dashboard/invitations/:invitationId/seating` | seating | HostShell | true | 19 |
| SCOPE-083 | frontend-user | `/dashboard/invitations/:invitationId/check-in` | check-in | HostShell | true | 20 |
| SCOPE-084 | frontend-user | `/dashboard/invitations/:invitationId/reports` | reports | HostShell | true | 22 |
| SCOPE-085 | frontend-user | `/dashboard/invitations/:invitationId/qr` | qr | HostShell | true | 20 |
| SCOPE-086 | frontend-user | `/dashboard/invitations/:invitationId/wishes` | wishes | HostShell | true | 18 |
| SCOPE-087 | frontend-user | `/dashboard/invitations/:invitationId/assistant` | assistant | HostShell | true | 23 |
| SCOPE-088 | frontend-user | `/dashboard/invitations/:invitationId/delivery` | delivery | HostShell | true | 15 |
| SCOPE-089 | frontend-user | `/dashboard/invitations/:invitationId/media` | media | HostShell | true | 14 |
| SCOPE-090 | frontend-user | `/dashboard/guests` | guests | HostShell | true | 17 |
| SCOPE-091 | frontend-user | `/dashboard/rsvp` | rsvp | HostShell | true | 18 |
| SCOPE-092 | frontend-user | `/dashboard/gifts` | gifts | HostShell | true | 21 |
| SCOPE-093 | frontend-user | `/dashboard/budget` | budget | HostShell | true | 22 |
| SCOPE-094 | frontend-user | `/dashboard/seating` | seating | HostShell | true | 19 |
| SCOPE-095 | frontend-user | `/dashboard/check-in` | check-in | HostShell | true | 20 |
| SCOPE-096 | frontend-user | `/dashboard/reports` | reports | HostShell | true | 22 |
| SCOPE-097 | frontend-user | `/dashboard/delivery` | delivery | HostShell | true | 15 |
| SCOPE-098 | frontend-user | `/dashboard/media` | media | HostShell | true | 14 |
| SCOPE-099 | frontend-user | `/dashboard/expenses` | budget | HostShell | true | 22 |
| SCOPE-100 | frontend-user | `/dashboard/share` | delivery | HostShell | true | 15 |
| SCOPE-101 | frontend-user | `/events` | events | HostShell | true | 12 |
| SCOPE-102 | frontend-user | `/event/list` | events | HostShell | true | 12 |
| SCOPE-103 | frontend-user | `/guests` | guests | HostShell | true | 17 |
| SCOPE-104 | frontend-user | `/expenses` | budget | HostShell | true | 22 |
| SCOPE-105 | frontend-user | `/gift` | gifts | HostShell | true | 21 |
| SCOPE-106 | frontend-user | `/gifts` | gifts | HostShell | true | 21 |
| SCOPE-107 | frontend-user | `/reports` | reports | HostShell | true | 22 |
| SCOPE-108 | frontend-user | `/profile` | profile | HostShell | true | 08 |
| SCOPE-109 | frontend-user | `/templates/browse` | catalog | HostShell | false | 09 |
| SCOPE-110 | frontend-user | `/templates/browse/:id` | template-demo | GuestRenderer | false | 10 |
| SCOPE-111 | frontend-user | `*` | not-found | UserSystem | false | 06 |
| SCOPE-112 | frontend-admin | `/login` | auth-login | AdminAuth | false | 08 |
| SCOPE-113 | frontend-admin | `/templates/new` | admin-template-create | AdminStudio | false | 25 |
| SCOPE-114 | frontend-admin | `/templates/:templateId` | admin-template-edit | AdminStudio | false | 25 |
| SCOPE-115 | frontend-admin | `/` | admin-dashboard | AdminLayout | true | 24 |
| SCOPE-116 | frontend-admin | `/dashboard` | admin-dashboard | AdminLayout | false | 24 |
| SCOPE-117 | frontend-admin | `/users` | admin-users | AdminLayout | false | 24 |
| SCOPE-118 | frontend-admin | `/users/:userId` | admin-user-detail | AdminLayout | false | 24 |
| SCOPE-119 | frontend-admin | `/templates` | admin-templates | AdminLayout | false | 25 |
| SCOPE-120 | frontend-admin | `/payments` | admin-payments | AdminLayout | false | 24 |
| SCOPE-121 | frontend-admin | `/packages` | admin-packages | AdminLayout | false | 24 |
| SCOPE-122 | frontend-admin | `/notifications` | admin-notifications | AdminLayout | false | 24 |
| SCOPE-123 | frontend-admin | `/system-logs` | admin-logs | AdminLayout | false | 24 |
| SCOPE-124 | frontend-admin | `/reports` | admin-reports | AdminLayout | false | 24 |
| SCOPE-125 | frontend-admin | `/dev/api-monitor` | admin-monitor | AdminLayout | false | 24 |
| SCOPE-126 | frontend-admin | `/admin` | admin-dashboard | AdminLayout | true | 24 |
| SCOPE-127 | frontend-admin | `/admin/dashboard` | admin-dashboard | AdminLayout | true | 24 |
| SCOPE-128 | frontend-admin | `/admin/users` | admin-users | AdminLayout | true | 24 |
| SCOPE-129 | frontend-admin | `/admin/templates` | admin-templates | AdminLayout | true | 25 |
| SCOPE-130 | frontend-admin | `/admin/payments` | admin-payments | AdminLayout | true | 24 |
| SCOPE-131 | frontend-admin | `/admin/packages` | admin-packages | AdminLayout | true | 24 |
| SCOPE-132 | frontend-admin | `/admin/notifications` | admin-notifications | AdminLayout | true | 24 |
| SCOPE-133 | frontend-admin | `/admin/reports` | admin-reports | AdminLayout | true | 24 |
| SCOPE-134 | frontend-admin | `/admin/system-logs` | admin-logs | AdminLayout | true | 24 |
| SCOPE-135 | frontend-admin | `*` | admin-not-found | AdminSystem | false | 24 |
