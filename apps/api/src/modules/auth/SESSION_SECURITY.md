# Authentication session security

## Web clients

- Login and refresh responses return the short-lived access token in JSON. The opaque refresh token is never included in the response body.
- The refresh token is stored in the `findbuddy_refresh` cookie with `HttpOnly`, `SameSite=Strict`, an auth-only path, and `Secure` in production.
- A separate readable `findbuddy_csrf` cookie implements the double-submit pattern. Web refresh and logout calls must copy its value into the `x-csrf-token` header.
- CORS accepts credentials only from the configured allowlist. Production requires an explicit allowlist.
- Logout clears both cookies. Refresh rotates the refresh token and both cookies.

## Mobile clients

- Requests select `clientType: "MOBILE"`; login and refresh return the opaque refresh token in JSON for storage in the platform secure store.
- Mobile refresh and logout send that token in the JSON body. Access tokens remain bearer tokens and should normally be held in memory.

## Shared controls

- Refresh tokens are random opaque values; only SHA-256 hashes are persisted.
- Every refresh revokes the previous token. Reusing a revoked token revokes its entire family.
- Password resets revoke all outstanding refresh tokens for that user.
- Passwords use Argon2id. Authentication endpoints have separate application-level rate limits.
- Passwords, cookie headers, authorization headers, and token fields are redacted from structured logs.
