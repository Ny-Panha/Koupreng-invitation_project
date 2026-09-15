# Current-user API

Status: canonical contract with compatibility alias

Canonical prefix: `/api/v1/users/me`

Compatibility prefix: `/api/users/me`

All routes require authentication. The controller returns HTTP DTOs and never exposes the `AppUser` persistence entity.

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | base prefix | none | `UserResponse` |
| `PATCH` | base prefix | `UpdateProfileRequest` | `UserResponse` |
| `POST` | `{prefix}/change-password` | `ChangePasswordRequest` | `204 No Content` |
| `POST` | `{prefix}/profile-image` | validated multipart image | `{ "url": "..." }` |

`UpdateProfileRequest` retains the existing JSON aliases for `fullName` and `profileImage`. Phone values are whitespace-normalized and uniqueness-checked when changed. Role changes invalidate existing authentication state, and the final administrator cannot be demoted.

Both prefixes share the same controller methods, authorization, CSRF behavior, request aliases, and response shapes. New consumers use the canonical prefix. The compatibility prefix remains until caller evidence supports deprecation and removal.
