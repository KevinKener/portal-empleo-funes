-- =============================================================================
-- More CV formats (tutor review 2026-10-20)
--
-- The uploaded CV may also be a Word file (.doc, .docx) or a photo (JPG,
-- PNG) of a paper CV, for people less used to digital tools (Rule 6). The
-- path stays "<uid>/cv.<ext>" (src/lib/archivos.ts); the postulantes trigger
-- already only checks the owner's folder, so only the bucket changes.
-- =============================================================================

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]
where id = 'cvs';
