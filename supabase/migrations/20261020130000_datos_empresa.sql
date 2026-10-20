-- =============================================================================
-- Company data editing (Phase 5, "Mi empresa", decisions of 2026-10-20)
--
-- validar_cambios_empresa gains two checks for companies (the Admin and
-- maintenance on the database are not affected):
-- 1. razon_social is fixed once the Employment Office verified the company:
--    renaming a verified company would skip the verification. While pending
--    it stays editable (typos at sign-up). The Office changes it on request.
-- 2. constancia_arca_url must point inside the owner's folder, as the job
--    seeker files already do (20261013150000_foto_perfil.sql).
-- =============================================================================

/** empresas: only the Admin verifies/rejects; CUIT, owner and (once verified) legal name are fixed for the company. */
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

    if new.constancia_arca_url is distinct from old.constancia_arca_url
      and new.constancia_arca_url is not null
      and not starts_with(new.constancia_arca_url, auth.uid()::text || '/') then
      raise exception 'files must be in the owner folder' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;
