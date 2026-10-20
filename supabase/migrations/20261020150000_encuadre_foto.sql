-- =============================================================================
-- Profile photo framing (tutor review 2026-10-20)
--
-- The job seeker can move the photo inside the round frame and zoom it, and
-- the framing is kept in the database so it looks the same everywhere:
--   foto_x, foto_y  point of the photo at the frame's centre, 0–100 (%)
--   foto_zoom       1 (whole photo) to 3
-- Defaults are the centre with no zoom, so photos uploaded before (already
-- cropped square) look exactly as they did. The photo stays visible only to
-- its owner and the Admin (20261013150000_foto_perfil.sql); companies never
-- see it nor its framing.
-- =============================================================================

alter table public.postulantes
  add column foto_x smallint not null default 50 check (foto_x between 0 and 100),
  add column foto_y smallint not null default 50 check (foto_y between 0 and 100),
  add column foto_zoom numeric(3, 2) not null default 1 check (foto_zoom between 1 and 3);
