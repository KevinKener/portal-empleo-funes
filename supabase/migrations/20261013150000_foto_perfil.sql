-- =============================================================================
-- Optional profile photo for job seekers (docs/research/panel-postulante.md §4)
--
-- 1. Private bucket fotos-perfil: the browser crops and shrinks the photo to a
--    512 px JPEG before uploading, so the limit is small.
-- 2. Storage policies: the owner manages their own photo; the Admin reads it.
--    Companies never get a policy here: the photo must not reach them
--    (Rule 1, and the "Currículum Equitativo" reasoning in the research).
-- 3. postulantes.foto_url, checked by the trigger like the other file columns.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Bucket
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-perfil', 'fotos-perfil', false, 1048576, array['image/jpeg']);


-- -----------------------------------------------------------------------------
-- 2. Storage policies
-- -----------------------------------------------------------------------------

create policy "storage: dueno gestiona su foto" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: admin ve fotos" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos-perfil' and (select public.es_admin()));


-- -----------------------------------------------------------------------------
-- 3. Column and trigger
-- -----------------------------------------------------------------------------

-- Storage path ("<auth uid>/foto.jpg"); null shows the initials instead.
alter table public.postulantes add column foto_url text;

-- candidatos_empresa lists its columns explicitly, so the photo stays out of
-- the companies' view without changing it.

/**
 * Same rules as 20261013140000_perfil_postulante.sql, plus foto_url in the
 * owner-folder check. A new photo does not touch estado_domicilio.
 */
create or replace function public.validar_cambios_postulante()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  admin boolean := public.actua_como_admin();
  carpeta text := auth.uid()::text || '/';
  revisar_de_nuevo boolean;
begin
  if new.perfil_id is distinct from old.perfil_id then
    raise exception 'perfil_id is immutable' using errcode = '42501';
  end if;

  if new.dni is distinct from old.dni and not admin then
    raise exception 'only an admin can change the DNI' using errcode = '42501';
  end if;

  if not admin then
    if (new.cv_url is distinct from old.cv_url and new.cv_url is not null and not starts_with(new.cv_url, carpeta))
      or (new.comprobante_url is distinct from old.comprobante_url and new.comprobante_url is not null
        and not starts_with(new.comprobante_url, carpeta))
      or (new.foto_url is distinct from old.foto_url and new.foto_url is not null
        and not starts_with(new.foto_url, carpeta)) then
      raise exception 'files must be in the owner folder' using errcode = '42501';
    end if;

    revisar_de_nuevo :=
      (new.comprobante_url is distinct from old.comprobante_url and new.comprobante_url is not null)
      or new.direccion is distinct from old.direccion
      or new.localidad is distinct from old.localidad;

    if revisar_de_nuevo then
      new.estado_domicilio := 'pendiente';
    elsif new.estado_domicilio is distinct from old.estado_domicilio then
      raise exception 'only an admin can change the address status' using errcode = '42501';
    end if;
  elsif new.estado_domicilio is distinct from old.estado_domicilio and old.estado_domicilio <> 'pendiente' then
    raise exception 'invalid status transition' using errcode = '23514';
  end if;

  return new;
end;
$$;
