/*
# Enforce CV upload file types and size limit on the storage bucket

1. Storage bucket hardening
- Update the `portfolio-assets` bucket to restrict uploads to the MIME
  types used for CV documents: PDF and Word (application/pdf,
  application/msword, application/vnd.openxmlformats-officedocument
  .wordprocessingml.document).
- Set a file size limit of 10 MB to prevent oversized or abusive uploads.
- These limits are enforced by Supabase Storage on the SERVER side, so a
  crafted request with a fake file extension or content type is rejected
  regardless of what the browser sends.

2. Notes
- The frontend already validates extensions client-side, but that is only
  a UX hint. The bucket-level MIME restriction is the real enforcement
  layer, because the storage API accepts anything when no restriction is
  set.
- No data is lost: existing files remain accessible. Only future uploads
  are constrained.
*/

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  file_size_limit = 10485760  -- 10 MB
WHERE id = 'portfolio-assets';
