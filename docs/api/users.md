# Current-user API

Status: compatibility contract

Prefix: `/api/users/me`

All routes require authentication. The controller returns HTTP DTOs and never exposes the `AppUser` persistence entity.

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/users/me` | none | `UserResponse` |
| `PATCH` | `/api/users/me` | `UpdateProfileRequest` | `UserResponse` |
| `POST` | `/api/users/me/change-password` | `ChangePasswordRequest` | `204 No Content` |
| `POST` | `/api/users/me/profile-image` | validated multipart image | `{ "url": "..." }` |

`UpdateProfileRequest` retains the existing JSON aliases for `fullName` and `profileImage`. Phone values are whitespace-normalized and uniqueness-checked when changed. Role changes invalidate existing authentication state, and the final administrator cannot be demoted.

The future canonical prefix is `/api/v1/users/me`. It will be added as a compatibility-tested alias in a separate contract slice so this package move remains behavior-preserving.
