-- =============================================================================
-- Initial schema — Municipal Job Portal (Funes)
--
-- Enums, tables, helper functions, triggers and RLS policies.
-- Business rules referenced as "Rule N" live in AGENTS.md §2.
-- Status enums and transitions mirror src/lib/estados.ts (single source of
-- truth for the app); the triggers below are the database-side enforcement.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------------------

create type public.rol_usuario as enum ('postulante', 'empresa', 'admin');

-- Shared by empresas.estado and postulantes.estado_domicilio.
create type public.estado_verificacion as enum ('pendiente', 'verificado', 'rechazado');

create type public.estado_oferta as enum ('pendiente', 'publicada', 'rechazada', 'cerrada');

create type public.estado_postulacion as enum (
  'pendiente', 'preseleccionado', 'entrevista', 'contratado', 'rechazado'
);

create type public.jornada as enum ('completa', 'media_jornada', 'por_horas', 'temporal');

-- Values without accents (identifier convention); the UI renders the labels.
create type public.localidad as enum ('funes', 'roldan', 'rosario', 'otra');


-- -----------------------------------------------------------------------------
-- 2. Shared trigger: updated_at
-- -----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. Tables
-- -----------------------------------------------------------------------------

-- One row per auth user. Created only by the trigger on auth.users (section 5);
-- users can never insert or change their own role.
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- File columns (*_url) store the object path inside a private bucket
-- ("<auth uid>/<file>"), never a public URL: access goes through signed URLs.
create table public.postulantes (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null unique references public.perfiles (id) on delete cascade,
  dni text not null unique check (dni ~ '^[0-9]{7,8}$'),
  nombre text not null check (char_length(nombre) between 1 and 100),
  apellido text not null check (char_length(apellido) between 1 and 100),
  localidad public.localidad not null,
  direccion text not null check (char_length(direccion) between 1 and 200),
  telefono text not null check (char_length(telefono) between 6 and 30),
  descripcion text check (char_length(descripcion) <= 3000),
  cv_url text,
  comprobante_url text,
  estado_domicilio public.estado_verificacion not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null unique references public.perfiles (id) on delete cascade,
  razon_social text not null check (char_length(razon_social) between 1 and 200),
  cuit text not null unique check (cuit ~ '^[0-9]{11}$'),
  nombre_comercial text not null check (char_length(nombre_comercial) between 1 and 200),
  telefono text not null check (char_length(telefono) between 6 and 30),
  direccion text not null check (char_length(direccion) between 1 and 200),
  constancia_arca_url text,
  -- Rule 3: new companies start pending
  estado public.estado_verificacion not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique check (char_length(nombre) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rule 5: a job seeker can pick several categories.
create table public.postulante_categorias (
  id uuid primary key default gen_random_uuid(),
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  categoria_id uuid not null references public.categorias (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (postulante_id, categoria_id)
);

create table public.ofertas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  categoria_id uuid not null references public.categorias (id) on delete restrict,
  titulo text not null check (char_length(titulo) between 1 and 150),
  descripcion text not null check (char_length(descripcion) between 1 and 5000),
  requisitos text check (char_length(requisitos) <= 3000),
  jornada public.jornada not null,
  estado public.estado_oferta not null default 'pendiente',
  motivo_rechazo text check (char_length(motivo_rechazo) <= 1000),
  fecha_publicacion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A rejection always carries a reason
  constraint ofertas_rechazo_con_motivo check (estado <> 'rechazada' or motivo_rechazo is not null)
);

create table public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  oferta_id uuid not null references public.ofertas (id) on delete cascade,
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  estado public.estado_postulacion not null default 'pendiente',
  -- Internal to the Employment Office: hidden from non-admins via column grants (section 7)
  notas_admin text check (char_length(notas_admin) <= 3000),
  -- Set once when the Admin pre-selects. Stays set through later states, so the
  -- company keeps seeing the candidate after interview/hire/rejection (Rule 1).
  fecha_preseleccion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Rule 8: no double application
  unique (oferta_id, postulante_id)
);

-- Follow-up of hired people (every 2 months). Admin only.
create table public.seguimientos (
  id uuid primary key default gen_random_uuid(),
  postulacion_id uuid not null references public.postulaciones (id) on delete cascade,
  fecha date not null default current_date,
  notas text check (char_length(notas) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 150),
  descripcion text check (char_length(descripcion) <= 3000),
  enlace text check (enlace ~ '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Referral of a (usually rejected) job seeker to a training course.
create table public.derivaciones (
  id uuid primary key default gen_random_uuid(),
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  curso_id uuid not null references public.cursos (id) on delete restrict,
  fecha date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Foreign keys are not indexed automatically in Postgres.
create index postulante_categorias_categoria_id_idx on public.postulante_categorias (categoria_id);
create index ofertas_empresa_id_idx on public.ofertas (empresa_id);
create index ofertas_categoria_id_idx on public.ofertas (categoria_id);
create index ofertas_estado_idx on public.ofertas (estado);
create index postulaciones_postulante_id_idx on public.postulaciones (postulante_id);
create index seguimientos_postulacion_id_idx on public.seguimientos (postulacion_id);
create index derivaciones_postulante_id_idx on public.derivaciones (postulante_id);
create index derivaciones_curso_id_idx on public.derivaciones (curso_id);

create trigger set_updated_at before update on public.perfiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.postulantes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.empresas
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.categorias
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.postulante_categorias
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.ofertas
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.postulaciones
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.seguimientos
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cursos
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.derivaciones
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 4. Helper functions for policies
--
-- SECURITY DEFINER so policies can look up other tables without recursing
-- through their RLS. search_path is pinned to avoid hijacking.
-- -----------------------------------------------------------------------------

/** True when the current user is an Admin (flat model, Rule 7). */
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles where id = auth.uid() and rol = 'admin'
  );
$$;

/** postulantes.id of the current user, or null. */
create function public.postulante_actual_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.postulantes where perfil_id = auth.uid();
$$;

/** empresas.id of the current user, or null. */
create function public.empresa_actual_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.empresas where perfil_id = auth.uid();
$$;

/** Rule 3: only verified companies may post offers. */
create function public.empresa_actual_verificada()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.empresas where perfil_id = auth.uid() and estado = 'verificado'
  );
$$;

/** True when the offer belongs to the current company. */
create function public.oferta_es_de_empresa_actual(p_oferta_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.ofertas o
    join public.empresas e on e.id = o.empresa_id
    where o.id = p_oferta_id and e.perfil_id = auth.uid()
  );
$$;

/** Rule 2: applications are only accepted on published offers. */
create function public.oferta_esta_publicada(p_oferta_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.ofertas where id = p_oferta_id and estado = 'publicada'
  );
$$;

/** True when the current job seeker applied to the offer (to keep seeing closed offers). */
create function public.postulante_actual_postulo(p_oferta_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.postulaciones p
    join public.postulantes po on po.id = p.postulante_id
    where p.oferta_id = p_oferta_id and po.perfil_id = auth.uid()
  );
$$;

/**
 * Rule 1: a company may see a job seeker's files only when the Admin
 * pre-selected that job seeker for one of the company's offers.
 * Takes the job seeker's perfil_id as text because it comes from a storage
 * path (keyed by auth uid); comparing as text never fails on malformed names.
 */
create function public.empresa_actual_ve_postulante(p_perfil_postulante text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.postulaciones p
    join public.postulantes po on po.id = p.postulante_id
    join public.ofertas o on o.id = p.oferta_id
    join public.empresas e on e.id = o.empresa_id
    where po.perfil_id::text = p_perfil_postulante
      and p.fecha_preseleccion is not null
      and e.perfil_id = auth.uid()
  );
$$;


/**
 * Used by the status triggers: an Admin session, or maintenance run directly
 * on the database (SQL editor as postgres, server with the secret key), which
 * has no auth.uid(). Transitions are still validated for both.
 */
create function public.actua_como_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.es_admin() or current_user in ('postgres', 'service_role');
$$;


-- -----------------------------------------------------------------------------
-- 5. Profile creation on sign-up
-- -----------------------------------------------------------------------------

/**
 * Creates the perfiles row when an auth user is created.
 * - raw_app_meta_data.rol = 'admin': only settable with the secret key, i.e. by
 *   the server-side "create Admin" flow (Rule 7).
 * - raw_user_meta_data.rol: set by the public sign-up; only postulante/empresa.
 * - No role at all: no profile (no access anywhere). This is the path for the
 *   seed Admin created from the dashboard, promoted manually (see README).
 */
create function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rol_app text := new.raw_app_meta_data ->> 'rol';
  v_rol_usuario text := new.raw_user_meta_data ->> 'rol';
begin
  if v_rol_app = 'admin' then
    insert into public.perfiles (id, rol) values (new.id, 'admin');
  elsif v_rol_usuario in ('postulante', 'empresa') then
    insert into public.perfiles (id, rol) values (new.id, v_rol_usuario::public.rol_usuario);
  elsif v_rol_usuario is not null then
    -- Rule 7: no public Admin sign-up, nor unknown roles
    raise exception 'invalid role on sign-up' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger crear_perfil_nuevo_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();


-- -----------------------------------------------------------------------------
-- 6. Status transitions and protected columns
--
-- Mirrors the state machines in AGENTS.md §2. Non-admins can only perform the
-- transitions their role owns; columns owned by the Admin cannot be changed
-- by anyone else even if a row-level UPDATE policy lets them touch the row.
-- -----------------------------------------------------------------------------

/** empresas: only the Admin verifies/rejects; CUIT and owner are immutable for the company. */
create function public.validar_cambios_empresa()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.perfil_id is distinct from old.perfil_id then
    raise exception 'perfil_id is immutable' using errcode = '42501';
  end if;

  if new.estado is distinct from old.estado then
    if not public.actua_como_admin() then
      raise exception 'only an admin can change the company status' using errcode = '42501';
    end if;
    if old.estado <> 'pendiente' then
      raise exception 'invalid status transition' using errcode = '23514';
    end if;
  end if;

  if new.cuit is distinct from old.cuit and not public.actua_como_admin() then
    raise exception 'only an admin can change the CUIT' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger validar_cambios_empresa before update on public.empresas
  for each row execute function public.validar_cambios_empresa();

/** postulantes: only the Admin verifies the address (Rule 4); DNI is immutable for the job seeker. */
create function public.validar_cambios_postulante()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.perfil_id is distinct from old.perfil_id then
    raise exception 'perfil_id is immutable' using errcode = '42501';
  end if;

  if new.estado_domicilio is distinct from old.estado_domicilio then
    if not public.actua_como_admin() then
      raise exception 'only an admin can change the address status' using errcode = '42501';
    end if;
    if old.estado_domicilio <> 'pendiente' then
      raise exception 'invalid status transition' using errcode = '23514';
    end if;
  end if;

  if new.dni is distinct from old.dni and not public.actua_como_admin() then
    raise exception 'only an admin can change the DNI' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger validar_cambios_postulante before update on public.postulantes
  for each row execute function public.validar_cambios_postulante();

/**
 * ofertas:
 * - Admin: pendiente → publicada | rechazada, publicada → cerrada.
 * - Company: publicada → cerrada; content edits only while pendiente, so a
 *   published offer can never change without a new approval (Rule 2).
 */
create function public.validar_cambios_oferta()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  admin boolean := public.actua_como_admin();
begin
  if new.empresa_id is distinct from old.empresa_id then
    raise exception 'empresa_id is immutable' using errcode = '42501';
  end if;

  if new.estado is distinct from old.estado then
    if admin then
      if not (
        (old.estado = 'pendiente' and new.estado in ('publicada', 'rechazada'))
        or (old.estado = 'publicada' and new.estado = 'cerrada')
      ) then
        raise exception 'invalid status transition' using errcode = '23514';
      end if;
    elsif not (old.estado = 'publicada' and new.estado = 'cerrada') then
      raise exception 'invalid status transition' using errcode = '42501';
    end if;
  end if;

  if not admin then
    if new.motivo_rechazo is distinct from old.motivo_rechazo
      or new.fecha_publicacion is distinct from old.fecha_publicacion then
      raise exception 'only an admin can change these fields' using errcode = '42501';
    end if;

    if old.estado <> 'pendiente' and (
      new.titulo is distinct from old.titulo
      or new.descripcion is distinct from old.descripcion
      or new.requisitos is distinct from old.requisitos
      or new.categoria_id is distinct from old.categoria_id
      or new.jornada is distinct from old.jornada
    ) then
      raise exception 'only pending offers can be edited' using errcode = '42501';
    end if;
  end if;

  if new.estado = 'publicada' and old.estado <> 'publicada' then
    new.fecha_publicacion = now();
  end if;

  return new;
end;
$$;

create trigger validar_cambios_oferta before update on public.ofertas
  for each row execute function public.validar_cambios_oferta();

/**
 * postulaciones:
 * - Admin: pendiente → preseleccionado | rechazado (stamps fecha_preseleccion).
 * - Company: preseleccionado → entrevista | rechazado, entrevista → contratado | rechazado.
 */
create function public.validar_cambios_postulacion()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  admin boolean := public.actua_como_admin();
begin
  if new.oferta_id is distinct from old.oferta_id
    or new.postulante_id is distinct from old.postulante_id then
    raise exception 'oferta_id and postulante_id are immutable' using errcode = '42501';
  end if;

  if not admin and (
    new.notas_admin is distinct from old.notas_admin
    or new.fecha_preseleccion is distinct from old.fecha_preseleccion
  ) then
    raise exception 'only an admin can change these fields' using errcode = '42501';
  end if;

  if new.estado is distinct from old.estado then
    if admin then
      if not (old.estado = 'pendiente' and new.estado in ('preseleccionado', 'rechazado')) then
        raise exception 'invalid status transition' using errcode = '23514';
      end if;
    elsif not (
      (old.estado = 'preseleccionado' and new.estado in ('entrevista', 'rechazado'))
      or (old.estado = 'entrevista' and new.estado in ('contratado', 'rechazado'))
    ) then
      raise exception 'invalid status transition' using errcode = '42501';
    end if;

    if new.estado = 'preseleccionado' then
      new.fecha_preseleccion = now();
    end if;
  end if;

  return new;
end;
$$;

create trigger validar_cambios_postulacion before update on public.postulaciones
  for each row execute function public.validar_cambios_postulacion();


-- -----------------------------------------------------------------------------
-- 7. Grants
--
-- Explicit so the schema does not depend on Supabase's default privileges.
-- RLS (section 8) decides which rows each role reaches.
-- -----------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;

grant select on public.categorias to anon, authenticated;

grant select on public.perfiles to authenticated;
grant select, insert, update on public.postulantes to authenticated;
grant select, insert, update on public.empresas to authenticated;
grant insert, update, delete on public.categorias to authenticated;
grant select, insert, delete on public.postulante_categorias to authenticated;
grant select, insert, update, delete on public.ofertas to authenticated;
grant select, insert, update, delete on public.seguimientos to authenticated;
grant select, insert, update, delete on public.cursos to authenticated;
grant select, insert, update, delete on public.derivaciones to authenticated;

-- postulaciones.notas_admin is never readable through the table: non-admins
-- would otherwise see it on their own rows. Admins read it via the
-- postulaciones_admin view (section 9).
-- Gotcha: select('*') on postulaciones fails for everyone; list the columns.
grant select (id, oferta_id, postulante_id, estado, fecha_preseleccion, created_at, updated_at)
  on public.postulaciones to authenticated;
grant insert (oferta_id, postulante_id) on public.postulaciones to authenticated;
grant update (estado, notas_admin) on public.postulaciones to authenticated;

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;


-- -----------------------------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------------------------

alter table public.perfiles enable row level security;
alter table public.postulantes enable row level security;
alter table public.empresas enable row level security;
alter table public.categorias enable row level security;
alter table public.postulante_categorias enable row level security;
alter table public.ofertas enable row level security;
alter table public.postulaciones enable row level security;
alter table public.seguimientos enable row level security;
alter table public.cursos enable row level security;
alter table public.derivaciones enable row level security;

-- perfiles: read-only from the app; rows come from the sign-up trigger.
create policy "perfiles: el usuario ve el propio" on public.perfiles
  for select to authenticated using (id = (select auth.uid()));
create policy "perfiles: admin ve todos" on public.perfiles
  for select to authenticated using ((select public.es_admin()));

-- postulantes: companies never read this table (Rule 1); they get the
-- reduced candidatos_empresa view instead.
create policy "postulantes: ve el propio" on public.postulantes
  for select to authenticated using (perfil_id = (select auth.uid()));
create policy "postulantes: crea el propio" on public.postulantes
  for insert to authenticated
  with check (
    perfil_id = (select auth.uid())
    and exists (select 1 from public.perfiles where id = (select auth.uid()) and rol = 'postulante')
    and estado_domicilio = 'pendiente'
  );
create policy "postulantes: edita el propio" on public.postulantes
  for update to authenticated
  using (perfil_id = (select auth.uid()))
  with check (perfil_id = (select auth.uid()));
create policy "postulantes: admin ve todos" on public.postulantes
  for select to authenticated using ((select public.es_admin()));
create policy "postulantes: admin edita" on public.postulantes
  for update to authenticated using ((select public.es_admin()));

-- empresas
create policy "empresas: ve la propia" on public.empresas
  for select to authenticated using (perfil_id = (select auth.uid()));
create policy "empresas: crea la propia" on public.empresas
  for insert to authenticated
  with check (
    perfil_id = (select auth.uid())
    and exists (select 1 from public.perfiles where id = (select auth.uid()) and rol = 'empresa')
    and estado = 'pendiente' -- Rule 3
  );
create policy "empresas: edita la propia" on public.empresas
  for update to authenticated
  using (perfil_id = (select auth.uid()))
  with check (perfil_id = (select auth.uid()));
create policy "empresas: admin ve todas" on public.empresas
  for select to authenticated using ((select public.es_admin()));
create policy "empresas: admin edita" on public.empresas
  for update to authenticated using ((select public.es_admin()));

-- categorias: public catalog, managed by the Admin.
create policy "categorias: lectura publica" on public.categorias
  for select to anon, authenticated using (true);
create policy "categorias: admin crea" on public.categorias
  for insert to authenticated with check ((select public.es_admin()));
create policy "categorias: admin edita" on public.categorias
  for update to authenticated using ((select public.es_admin()));
create policy "categorias: admin borra" on public.categorias
  for delete to authenticated using ((select public.es_admin()));

-- postulante_categorias
create policy "postulante_categorias: ve las propias" on public.postulante_categorias
  for select to authenticated using (postulante_id = (select public.postulante_actual_id()));
create policy "postulante_categorias: agrega las propias" on public.postulante_categorias
  for insert to authenticated with check (postulante_id = (select public.postulante_actual_id()));
create policy "postulante_categorias: quita las propias" on public.postulante_categorias
  for delete to authenticated using (postulante_id = (select public.postulante_actual_id()));
create policy "postulante_categorias: admin ve todas" on public.postulante_categorias
  for select to authenticated using ((select public.es_admin()));

-- ofertas: the public portal reads the ofertas_publicas view, not this table.
create policy "ofertas: empresa ve las propias" on public.ofertas
  for select to authenticated using (empresa_id = (select public.empresa_actual_id()));
create policy "ofertas: empresa verificada crea" on public.ofertas
  for insert to authenticated
  with check (
    empresa_id = (select public.empresa_actual_id())
    and (select public.empresa_actual_verificada()) -- Rule 3
    and estado = 'pendiente' -- Rule 2
    and motivo_rechazo is null
    and fecha_publicacion is null
  );
create policy "ofertas: empresa edita las propias" on public.ofertas
  for update to authenticated
  using (empresa_id = (select public.empresa_actual_id()))
  with check (empresa_id = (select public.empresa_actual_id()));
create policy "ofertas: empresa borra pendientes propias" on public.ofertas
  for delete to authenticated
  using (empresa_id = (select public.empresa_actual_id()) and estado = 'pendiente');
create policy "ofertas: autenticados ven publicadas" on public.ofertas
  for select to authenticated using (estado = 'publicada');
create policy "ofertas: postulante ve aquellas a las que se postulo" on public.ofertas
  for select to authenticated using (public.postulante_actual_postulo(id));
create policy "ofertas: admin ve todas" on public.ofertas
  for select to authenticated using ((select public.es_admin()));
create policy "ofertas: admin edita" on public.ofertas
  for update to authenticated using ((select public.es_admin()));

-- postulaciones
create policy "postulaciones: postulante ve las propias" on public.postulaciones
  for select to authenticated using (postulante_id = (select public.postulante_actual_id()));
create policy "postulaciones: postulante se postula" on public.postulaciones
  for insert to authenticated
  with check (
    postulante_id = (select public.postulante_actual_id())
    and public.oferta_esta_publicada(oferta_id) -- Rule 2
  );
-- Rule 1: the company only reaches rows the Admin pre-selected.
create policy "postulaciones: empresa ve preseleccionadas" on public.postulaciones
  for select to authenticated
  using (fecha_preseleccion is not null and public.oferta_es_de_empresa_actual(oferta_id));
create policy "postulaciones: empresa actualiza preseleccionadas" on public.postulaciones
  for update to authenticated
  using (fecha_preseleccion is not null and public.oferta_es_de_empresa_actual(oferta_id));
create policy "postulaciones: admin ve todas" on public.postulaciones
  for select to authenticated using ((select public.es_admin()));
create policy "postulaciones: admin edita" on public.postulaciones
  for update to authenticated using ((select public.es_admin()));

-- seguimientos: Admin only.
create policy "seguimientos: admin gestiona" on public.seguimientos
  for all to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- cursos: any signed-in user reads them; the Admin manages them.
create policy "cursos: lectura autenticada" on public.cursos
  for select to authenticated using (true);
create policy "cursos: admin crea" on public.cursos
  for insert to authenticated with check ((select public.es_admin()));
create policy "cursos: admin edita" on public.cursos
  for update to authenticated using ((select public.es_admin()));
create policy "cursos: admin borra" on public.cursos
  for delete to authenticated using ((select public.es_admin()));

-- derivaciones
create policy "derivaciones: postulante ve las propias" on public.derivaciones
  for select to authenticated using (postulante_id = (select public.postulante_actual_id()));
create policy "derivaciones: admin gestiona" on public.derivaciones
  for all to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));


-- -----------------------------------------------------------------------------
-- 9. Views
--
-- These run with the owner's privileges (no security_invoker) on purpose: each
-- exposes a fixed, reduced set of columns and filters rows itself.
-- security_barrier stops user-supplied filters from being evaluated before
-- the view's own WHERE clause (leaks through function side effects).
-- -----------------------------------------------------------------------------

/**
 * Public portal (Rule 2): only published offers and the company's trade name.
 * Never exposes CUIT, address, phone or any job seeker data.
 */
create view public.ofertas_publicas
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
  e.nombre_comercial as empresa_nombre
from public.ofertas o
join public.categorias c on c.id = o.categoria_id
join public.empresas e on e.id = o.empresa_id
where o.estado = 'publicada';

-- Supabase default privileges also grant write access on new views; read-only here.
revoke all on public.ofertas_publicas from anon, authenticated;
grant select on public.ofertas_publicas to anon, authenticated;

/**
 * Candidates a company may see (Rule 1, decision A): pre-selected for one of
 * its offers, and only name, city, categories, description and CV path.
 * Never DNI, phone, email or address.
 */
create view public.candidatos_empresa
with (security_barrier = true)
as
select
  p.id as postulacion_id,
  p.oferta_id,
  p.estado,
  p.fecha_preseleccion,
  po.nombre,
  po.apellido,
  po.localidad,
  po.descripcion,
  po.cv_url,
  coalesce(
    (
      select array_agg(c.nombre order by c.nombre)
      from public.postulante_categorias pc
      join public.categorias c on c.id = pc.categoria_id
      where pc.postulante_id = po.id
    ),
    '{}'
  ) as categorias
from public.postulaciones p
join public.postulantes po on po.id = p.postulante_id
join public.ofertas o on o.id = p.oferta_id
join public.empresas e on e.id = o.empresa_id
where p.fecha_preseleccion is not null
  and e.perfil_id = auth.uid();

revoke all on public.candidatos_empresa from anon, authenticated;
grant select on public.candidatos_empresa to authenticated;

/** Full postulaciones rows, including notas_admin, for Admins only. */
create view public.postulaciones_admin
with (security_barrier = true)
as
select p.*
from public.postulaciones p
where public.es_admin();

revoke all on public.postulaciones_admin from anon, authenticated;
grant select on public.postulaciones_admin to authenticated;
