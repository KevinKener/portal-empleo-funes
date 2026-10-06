-- =============================================================================
-- Private Storage buckets and their policies.
--
-- Path convention for every bucket: "<auth uid of the owner>/<file name>".
-- The first folder identifies the owner, so policies never need a table lookup
-- for the owner's own files. Files are served only through short-lived signed
-- URLs (AGENTS.md §3).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cvs', 'cvs', false, 5242880, array['application/pdf']),
  ('comprobantes-domicilio', 'comprobantes-domicilio', false, 5242880,
    array['application/pdf', 'image/jpeg', 'image/png']),
  ('constancias-arca', 'constancias-arca', false, 5242880, array['application/pdf']);


-- -----------------------------------------------------------------------------
-- Owners manage the files in their own folder
-- -----------------------------------------------------------------------------

create policy "storage: dueno lee sus archivos" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('cvs', 'comprobantes-domicilio', 'constancias-arca')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: dueno sube sus archivos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('cvs', 'comprobantes-domicilio', 'constancias-arca')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: dueno reemplaza sus archivos" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('cvs', 'comprobantes-domicilio', 'constancias-arca')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('cvs', 'comprobantes-domicilio', 'constancias-arca')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: dueno borra sus archivos" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('cvs', 'comprobantes-domicilio', 'constancias-arca')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- -----------------------------------------------------------------------------
-- Read access for others
-- -----------------------------------------------------------------------------

-- The Admin reviews CVs, proofs of address (Rule 4) and ARCA certificates.
create policy "storage: admin lee documentos" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('cvs', 'comprobantes-domicilio', 'constancias-arca')
    and (select public.es_admin())
  );

-- Rule 1: a company reads a CV only after the Admin pre-selected that job
-- seeker for one of its offers. Proofs of address are never shared.
create policy "storage: empresa lee cv de preseleccionados" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'cvs'
    and public.empresa_actual_ve_postulante((storage.foldername(name))[1])
  );
