-- =============================================================================
-- Flow corrections from the tutor review (2026-10-08)
--
-- 1. Offers: created as 'borrador'; the company edits only drafts, sends them
--    for review (borrador → pendiente) and may take them back
--    (pendiente → borrador). A pending offer is out of the company's hands.
-- 2. Rejected applications carry a reason: 'cupo_completo' is a soft
--    rejection (the quota was filled), 'no_seleccionado' a regular one.
-- 3. Selection draft: the company marks pre-selected candidates as
--    tomar/descartar without changing their status, then applies every
--    decision at once with confirmar_seleccion().
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Offers start as drafts
-- -----------------------------------------------------------------------------

alter table public.ofertas alter column estado set default 'borrador';

drop policy "ofertas: empresa verificada crea" on public.ofertas;
create policy "ofertas: empresa verificada crea" on public.ofertas
  for insert to authenticated
  with check (
    empresa_id = (select public.empresa_actual_id())
    and (select public.empresa_actual_verificada()) -- Rule 3
    and estado = 'borrador' -- Rule 2: the Admin reviews it once sent
    and motivo_rechazo is null
    and fecha_publicacion is null
  );

drop policy "ofertas: empresa borra pendientes propias" on public.ofertas;
create policy "ofertas: empresa borra borradores propios" on public.ofertas
  for delete to authenticated
  using (empresa_id = (select public.empresa_actual_id()) and estado = 'borrador');

/**
 * ofertas:
 * - Admin: pendiente → publicada | rechazada, publicada → cerrada.
 * - Company: borrador → pendiente (send), pendiente → borrador (take back),
 *   publicada → cerrada. Content edits only while borrador, so neither a
 *   pending nor a published offer changes under the Admin's eyes (Rule 2).
 */
create or replace function public.validar_cambios_oferta()
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
    elsif not (
      (old.estado = 'borrador' and new.estado = 'pendiente')
      or (old.estado = 'pendiente' and new.estado = 'borrador')
      or (old.estado = 'publicada' and new.estado = 'cerrada')
    ) then
      raise exception 'invalid status transition' using errcode = '42501';
    end if;
  end if;

  if not admin then
    if new.motivo_rechazo is distinct from old.motivo_rechazo
      or new.fecha_publicacion is distinct from old.fecha_publicacion then
      raise exception 'only an admin can change these fields' using errcode = '42501';
    end if;

    if old.estado <> 'borrador' and (
      new.titulo is distinct from old.titulo
      or new.descripcion is distinct from old.descripcion
      or new.requisitos is distinct from old.requisitos
      or new.categoria_id is distinct from old.categoria_id
      or new.jornada is distinct from old.jornada
    ) then
      raise exception 'only draft offers can be edited' using errcode = '42501';
    end if;
  end if;

  if new.estado = 'publicada' and old.estado <> 'publicada' then
    new.fecha_publicacion = now();
  end if;

  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 2. Rejection reason and selection draft on postulaciones
-- -----------------------------------------------------------------------------

create type public.motivo_rechazo_postulacion as enum ('cupo_completo', 'no_seleccionado');

create type public.decision_empresa as enum ('tomar', 'descartar');

alter table public.postulaciones
  add column motivo_rechazo public.motivo_rechazo_postulacion,
  -- Company's pending decision; internal to the company and the Admin
  -- (hidden from the job seeker via column grants, like notas_admin).
  add column decision_empresa public.decision_empresa,
  -- Every rejection carries a reason, and only rejections do.
  add constraint postulaciones_rechazo_con_motivo
    check ((estado = 'rechazado') = (motivo_rechazo is not null));

/**
 * postulaciones:
 * - Admin: pendiente → preseleccionado | rechazado (stamps fecha_preseleccion).
 * - Company: preseleccionado → entrevista | rechazado, entrevista → contratado | rechazado.
 * - motivo_rechazo is set together with the move to rechazado and never after.
 * - decision_empresa: company only, while the candidate is in its hands;
 *   cleared on every status change so a stale draft never survives.
 */
create or replace function public.validar_cambios_postulacion()
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

    new.decision_empresa = null;
  else
    if new.motivo_rechazo is distinct from old.motivo_rechazo then
      raise exception 'motivo_rechazo is set only when rejecting' using errcode = '42501';
    end if;

    if new.decision_empresa is distinct from old.decision_empresa and (
      admin or old.estado not in ('preseleccionado', 'entrevista')
    ) then
      raise exception 'only the company can draft a decision here' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

/**
 * Applies the company's selection draft for one offer in a single
 * transaction: tomar moves the candidate one step forward
 * (preseleccionado → entrevista, entrevista → contratado), descartar
 * rejects it as no_seleccionado. Undecided candidates are left as they are.
 *
 * SECURITY INVOKER: RLS and the trigger above still apply, so a company only
 * reaches pre-selected candidates of its own offers (Rule 1). Only companies
 * get rows back; for anyone else it is a no-op.
 * Returns how many applications changed.
 */
create function public.confirmar_seleccion(p_oferta_id uuid)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cambiadas integer;
begin
  -- Decisions are read through candidatos_empresa: the company has no
  -- column grant on postulaciones.decision_empresa.
  update public.postulaciones p
  set
    estado = case
      when d.decision_empresa = 'descartar' then 'rechazado'
      when d.estado = 'preseleccionado' then 'entrevista'
      else 'contratado'
    end::public.estado_postulacion,
    motivo_rechazo = case
      when d.decision_empresa = 'descartar' then 'no_seleccionado'
    end::public.motivo_rechazo_postulacion
  from public.candidatos_empresa d
  where p.id = d.postulacion_id
    and d.oferta_id = p_oferta_id
    and d.decision_empresa is not null
    and d.estado in ('preseleccionado', 'entrevista');

  get diagnostics cambiadas = row_count;
  return cambiadas;
end;
$$;

revoke execute on function public.confirmar_seleccion(uuid) from public, anon;
grant execute on function public.confirmar_seleccion(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- 3. Grants and views
-- -----------------------------------------------------------------------------

-- The job seeker sees why they were rejected (a full quota reads softer);
-- decision_empresa stays unreadable through the table.
grant select (motivo_rechazo) on public.postulaciones to authenticated;
grant update (motivo_rechazo, decision_empresa) on public.postulaciones to authenticated;

-- Views fix their column list at creation time; re-create them so the new
-- columns show up (new columns go last, as create or replace requires).
create or replace view public.postulaciones_admin
with (security_barrier = true)
as
select
  p.id, p.oferta_id, p.postulante_id, p.estado, p.notas_admin,
  p.fecha_preseleccion, p.created_at, p.updated_at,
  p.motivo_rechazo, p.decision_empresa
from public.postulaciones p
where public.es_admin();

create or replace view public.candidatos_empresa
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
  ) as categorias,
  p.motivo_rechazo,
  p.decision_empresa
from public.postulaciones p
join public.postulantes po on po.id = p.postulante_id
join public.ofertas o on o.id = p.oferta_id
join public.empresas e on e.id = o.empresa_id
where p.fecha_preseleccion is not null
  and e.perfil_id = auth.uid();
