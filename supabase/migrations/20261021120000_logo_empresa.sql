-- =============================================================================
-- Optional company logo (2026-10-21)
--
-- Companies can upload a logo; without one, their initial is shown, as for
-- job seekers without a photo. Unlike the job seeker's photo, a logo is public
-- brand information (like the trade name already shown on every offer), so:
-- 1. Public bucket logos-empresa: the browser fits the logo into a 512 px
--    square JPEG before uploading, so the limit is small. Anyone can read it
--    by its public URL; only the owner company writes its own folder.
-- 2. empresas.logo_url, checked by the trigger like the ARCA certificate.
-- 3. ofertas_publicas gains empresa_logo_url (appended: create or replace view
--    can only add columns at the end), so offer cards show the logo.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Bucket and Storage policies
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos-empresa', 'logos-empresa', true, 1048576, array['image/jpeg']);

create policy "storage: empresa gestiona su logo" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'logos-empresa'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'logos-empresa'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- -----------------------------------------------------------------------------
-- 2. empresas.logo_url
-- -----------------------------------------------------------------------------

alter table public.empresas add column logo_url text;

/**
 * Same rules as 20261020130000_datos_empresa.sql, plus logo_url in the
 * owner's folder (like constancia_arca_url).
 */
create or replace function public.validar_cambios_empresa()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  admin boolean := public.actua_como_admin();
begin
  if new.perfil_id is distinct from old.perfil_id then
    raise exception 'perfil_id is immutable' using errcode = '42501';
  end if;

  if new.estado is distinct from old.estado then
    if not admin then
      raise exception 'only an admin can change the company status' using errcode = '42501';
    end if;
    if old.estado <> 'pendiente' then
      raise exception 'invalid status transition' using errcode = '23514';
    end if;
  end if;

  if not admin then
    if new.cuit is distinct from old.cuit then
      raise exception 'only an admin can change the CUIT' using errcode = '42501';
    end if;

    if new.razon_social is distinct from old.razon_social and old.estado = 'verificado' then
      raise exception 'only an admin can change the legal name of a verified company' using errcode = '42501';
    end if;

    if (new.constancia_arca_url is distinct from old.constancia_arca_url
        and new.constancia_arca_url is not null
        and not starts_with(new.constancia_arca_url, auth.uid()::text || '/'))
      or (new.logo_url is distinct from old.logo_url
        and new.logo_url is not null
        and not starts_with(new.logo_url, auth.uid()::text || '/')) then
      raise exception 'files must be in the owner folder' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. Public offers view with the logo
-- -----------------------------------------------------------------------------

create or replace view public.ofertas_publicas
with (security_barrier = true)
as
select
  o.id,
  o.titulo,
  o.descripcion,
  o.requisitos,
  o.jornada,
  o.fecha_publicacion,
  o.categoria_id,
  c.nombre as categoria_nombre,
  e.nombre_comercial as empresa_nombre,
  e.logo_url as empresa_logo_url
from public.ofertas o
join public.categorias c on c.id = o.categoria_id
join public.empresas e on e.id = o.empresa_id
where o.estado = 'publicada';
