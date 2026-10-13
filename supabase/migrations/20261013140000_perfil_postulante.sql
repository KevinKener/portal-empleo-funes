-- =============================================================================
-- Job seeker profile (Phase 4)
--
-- 1. Structured CV on the platform: experiencias and formaciones (Rule 6; the
--    PDF in postulantes.cv_url stays as the alternative).
-- 2. Proof of address flow (Rule 4, decisions in docs/research/postulante-ux.md):
--    uploading a new proof or changing the address/town sends the address
--    back to 'pendiente'; only the Admin verifies or rejects.
-- 3. File columns can only point inside the owner's own Storage folder.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Structured CV
-- -----------------------------------------------------------------------------

create type public.nivel_formacion as enum ('primario', 'secundario', 'terciario', 'universitario', 'curso');
create type public.estado_formacion as enum ('completo', 'en_curso', 'incompleto');

-- Work experience. empresa is optional: informal jobs ("changas") count too.
-- Dates are stored as the first day of the month (the form asks month/year).
create table public.experiencias (
  id uuid primary key default gen_random_uuid(),
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  puesto text not null check (char_length(puesto) between 1 and 150),
  empresa text check (char_length(empresa) <= 150),
  desde date not null,
  -- null = current job
  hasta date,
  tareas text check (char_length(tareas) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experiencias_fechas check (hasta is null or hasta >= desde)
);

create table public.formaciones (
  id uuid primary key default gen_random_uuid(),
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  nivel public.nivel_formacion not null,
  titulo text not null check (char_length(titulo) between 1 and 150),
  institucion text check (char_length(institucion) <= 150),
  estado public.estado_formacion not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index experiencias_postulante_id_idx on public.experiencias (postulante_id);
create index formaciones_postulante_id_idx on public.formaciones (postulante_id);

create trigger set_updated_at before update on public.experiencias
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.formaciones
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.experiencias to authenticated;
grant select, insert, update, delete on public.formaciones to authenticated;

alter table public.experiencias enable row level security;
alter table public.formaciones enable row level security;

-- The owner manages its CV; the Admin reads every CV. Companies get the
-- pre-selected candidates' CV in Phase 5 through candidatos_empresa (Rule 1).
create policy "experiencias: postulante gestiona las propias" on public.experiencias
  for all to authenticated
  using (postulante_id = (select public.postulante_actual_id()))
  with check (postulante_id = (select public.postulante_actual_id()));
create policy "experiencias: admin ve todas" on public.experiencias
  for select to authenticated using ((select public.es_admin()));

create policy "formaciones: postulante gestiona las propias" on public.formaciones
  for all to authenticated
  using (postulante_id = (select public.postulante_actual_id()))
  with check (postulante_id = (select public.postulante_actual_id()));
create policy "formaciones: admin ve todas" on public.formaciones
  for select to authenticated using ((select public.es_admin()));


-- -----------------------------------------------------------------------------
-- 2 and 3. Address status and file paths
-- -----------------------------------------------------------------------------

/**
 * postulantes:
 * - perfil_id is immutable; only the Admin changes the DNI.
 * - Admin: estado_domicilio pendiente → verificado | rechazado (Rule 4).
 * - Job seeker: a new proof of address (comprobante_url) or a new address or
 *   town puts estado_domicilio back to 'pendiente', so the Office reviews it
 *   again; any other change of status is refused.
 * - File columns must stay inside the owner's folder ("<auth uid>/..."), so
 *   nobody can point their profile at someone else's file.
 * Outside Funes the status is kept but ignored: no proof is asked for there.
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
        and not starts_with(new.comprobante_url, carpeta)) then
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
