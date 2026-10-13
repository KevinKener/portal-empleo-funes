-- =============================================================================
-- Complete sign-up in one step (Phase 3)
--
-- With email confirmation on, signUp() returns no session, so the app cannot
-- insert the postulantes / empresas row through RLS. The sign-up trigger now
-- creates it from the metadata sent by the server (raw_user_meta_data), in
-- the same transaction as the auth user: if any value breaks a constraint
-- (DNI/CUIT format, duplicate DNI/CUIT, missing field) the whole sign-up
-- fails and no half-created account is left behind.
--
-- The personal data is then removed from raw_user_meta_data: user_metadata
-- travels inside every access token (JWT), and the tables are the single
-- place where DNI, address and phone live (AGENTS.md §3).
-- =============================================================================

/**
 * Creates the perfiles row and, for public sign-ups, the postulantes or
 * empresas row when an auth user is created.
 * - raw_app_meta_data.rol = 'admin': only settable with the secret key, i.e. by
 *   the server-side "create Admin" flow (Rule 7).
 * - raw_user_meta_data.rol: set by the public sign-up; only postulante/empresa.
 * - No role at all: no profile (no access anywhere). This is the path for the
 *   seed Admin created from the dashboard, promoted manually (see README).
 */
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rol_app text := new.raw_app_meta_data ->> 'rol';
  v_datos jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_rol_usuario text := v_datos ->> 'rol';
begin
  if v_rol_app = 'admin' then
    insert into public.perfiles (id, rol) values (new.id, 'admin');
    return new;
  end if;

  if v_rol_usuario is null then
    return new;
  end if;

  if v_rol_usuario = 'postulante' then
    insert into public.perfiles (id, rol) values (new.id, 'postulante');
    -- estado_domicilio keeps its 'pendiente' default (Rule 4)
    insert into public.postulantes (perfil_id, dni, nombre, apellido, localidad, direccion, telefono)
    values (
      new.id,
      v_datos ->> 'dni',
      v_datos ->> 'nombre',
      v_datos ->> 'apellido',
      (v_datos ->> 'localidad')::public.localidad,
      v_datos ->> 'direccion',
      v_datos ->> 'telefono'
    );
  elsif v_rol_usuario = 'empresa' then
    insert into public.perfiles (id, rol) values (new.id, 'empresa');
    -- estado keeps its 'pendiente' default (Rule 3); the ARCA certificate is
    -- optional and uploaded later from the company profile (Rule 12)
    insert into public.empresas (perfil_id, razon_social, cuit, nombre_comercial, telefono, direccion)
    values (
      new.id,
      v_datos ->> 'razon_social',
      v_datos ->> 'cuit',
      v_datos ->> 'nombre_comercial',
      v_datos ->> 'telefono',
      v_datos ->> 'direccion'
    );
  else
    -- Rule 7: no public Admin sign-up, nor unknown roles
    raise exception 'invalid role on sign-up' using errcode = '22023';
  end if;

  -- Keep only the role in the token; the personal data now lives in the tables
  update auth.users
  set raw_user_meta_data = jsonb_build_object('rol', v_rol_usuario)
  where id = new.id;

  return new;
end;
$$;
