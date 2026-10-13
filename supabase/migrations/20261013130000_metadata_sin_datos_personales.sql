-- =============================================================================
-- Keep personal data out of auth.users.raw_user_meta_data
--
-- 20261013120000_registro_completo.sql cleared the metadata right after the
-- sign-up, but Supabase Auth writes the full metadata it kept in memory back
-- when the email is confirmed, so DNI, address and phone came back and
-- travelled inside every access token. A BEFORE UPDATE trigger now strips
-- those keys on every write, whoever makes it (including a user calling
-- updateUser({ data })). The tables stay the single source (AGENTS.md §3).
-- =============================================================================

/** Sign-up fields that must never stay in the user metadata. */
create function public.quitar_datos_personales(p_datos jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(p_datos, '{}'::jsonb) - array[
    'dni', 'nombre', 'apellido', 'localidad', 'direccion', 'telefono',
    'razon_social', 'cuit', 'nombre_comercial'
  ];
$$;

create function public.limpiar_metadata_usuario()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.raw_user_meta_data := public.quitar_datos_personales(new.raw_user_meta_data);
  return new;
end;
$$;

create trigger limpiar_metadata_usuario
  before update of raw_user_meta_data on auth.users
  for each row execute function public.limpiar_metadata_usuario();

-- The sign-up trigger keeps the role and any keys Supabase adds itself
-- (email_verified, sub…), and the UPDATE goes through the trigger above.
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

  update auth.users
  set raw_user_meta_data = public.quitar_datos_personales(raw_user_meta_data)
  where id = new.id;

  return new;
end;
$$;

-- Accounts created before this migration: the data is already in the
-- postulantes/empresas tables, only the copy in the metadata is removed.
update auth.users
set raw_user_meta_data = public.quitar_datos_personales(raw_user_meta_data)
where raw_user_meta_data ?| array[
  'dni', 'nombre', 'apellido', 'localidad', 'direccion', 'telefono',
  'razon_social', 'cuit', 'nombre_comercial'
];
