-- =============================================================================
-- Company rejection reason and second review (Phase 6, branch C)
-- docs/research/admin.md §5 C, decision D1 (accepted 2026-10-21)
--
-- * empresas.motivo_rechazo: what the Employment Office tells a company it
--   could not verify. Required while `rechazado`, cleared once `verificado`.
-- * A rejected company that fixes its data (legal name, trade name, phone,
--   address or the ARCA certificate) goes back to `pendiente` by itself, so
--   the Office reviews it again (same idea as the proof of address, Rule 4).
--   The last reason stays, so the Office knows what to check.
-- =============================================================================

alter table public.empresas
  add column motivo_rechazo text check (char_length(motivo_rechazo) between 10 and 1000);

alter table public.empresas
  add constraint empresas_rechazo_con_motivo check (estado <> 'rechazado' or motivo_rechazo is not null);

/**
 * empresas: only the Admin verifies or rejects (Rule 3) and only from
 * `pendiente`; the company never changes its CUIT, nor its legal name once
 * verified; files stay in the owner's folder. New: the reason is Admin-only,
 * it is cleared on verification, and a rejected company editing its data
 * goes back to review.
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

    if new.motivo_rechazo is distinct from old.motivo_rechazo then
      raise exception 'only an admin can change the rejection reason' using errcode = '42501';
    end if;

    if new.constancia_arca_url is distinct from old.constancia_arca_url
      and new.constancia_arca_url is not null
      and not starts_with(new.constancia_arca_url, auth.uid()::text || '/') then
      raise exception 'files must be in the owner folder' using errcode = '42501';
    end if;

    -- D1: fixing the data after a rejection asks for a new review.
    -- Set after the checks above, so only the trigger moves it.
    if old.estado = 'rechazado' and (
      new.razon_social is distinct from old.razon_social
      or new.nombre_comercial is distinct from old.nombre_comercial
      or new.telefono is distinct from old.telefono
      or new.direccion is distinct from old.direccion
      or (new.constancia_arca_url is distinct from old.constancia_arca_url and new.constancia_arca_url is not null)
    ) then
      new.estado := 'pendiente';
    end if;
  end if;

  if new.estado = 'verificado' then
    new.motivo_rechazo := null;
  end if;

  return new;
end;
$$;
