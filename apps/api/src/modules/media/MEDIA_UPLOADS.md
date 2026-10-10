# Profile-image upload contract

1. An authenticated active user creates their profile.
2. The client calls `POST /api/v1/media/presign` with only `mimeType`, `sizeBytes`, and the `PROFILE_IMAGE` kind.
3. The API validates the configured allowlist and size limit, generates the canonical object key, creates a `PENDING` media record, and returns a short-lived S3 upload URL.
4. The client uploads the image bytes directly to S3 using the returned `content-type` header. Image bytes never pass through this API.
5. The client calls `POST /api/v1/media/:mediaId/confirm` without file data.
6. The API reads S3 object metadata and requires its content type and byte length to exactly match the authorized upload.
7. A MongoDB transaction changes the owned media record from `PENDING` to `ACTIVE` and assigns it as the profile photo.

The bucket must reject arbitrary public writes and allow browser/mobile PUT requests only through signed URLs. Configure bucket CORS for the approved web origins and required `Content-Type` header. `MEDIA_PUBLIC_BASE_URL` must point to the approved read origin (S3 or a CDN); it does not grant upload permission.
