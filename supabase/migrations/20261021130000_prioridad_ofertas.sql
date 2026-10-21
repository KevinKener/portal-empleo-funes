-- =============================================================================
-- Offer priority and demand (2026-10-21, docs/research/admin.md §4.8)
--
-- 1. ofertas.prioridad: the company says how fast it needs to fill the offer
--    ('urgente' or 'normal'). Editable by the company only while borrador,
--    like the rest of the content; the Admin may change it at any time (to
--    turn an offer back to normal when a company marks everything urgent).
-- 2. ofertas.fecha_envio: stamped when the company sends the offer for review
--    (borrador → pendiente), so the Office can measure its own review time
--    and see the oldest pending offers first. Cleared when taken back.
-- 3. ofertas_publicas gains prioridad and nivel_demanda (appended: create or
--    replace view can only add columns at the end). nivel_demanda is a
--    bucket, never the application count: the exact number is not public, so
--    it neither puts people off nor tells anything about who applied.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Columns
-- -----------------------------------------------------------------------------

create type public.prioridad_oferta as enum ('normal', 'urgente');

alter table public.ofertas
  add column prioridad public.prioridad_oferta not null default 'normal',
  add column fecha_envio timestamptz;

-- Offers already waiting for review: best guess is their last change
update public.ofertas set fecha_envio = updated_at where estado <> 'borrador';

-- New offers are drafts and have not been sent yet
drop policy "ofertas: empresa verificada crea" on public.ofertas;
create policy "ofertas: empresa verificada crea" on public.ofertas
  for insert to authenticated
  with check (
    empresa_id = (select public.empresa_actual_id())
    and (select public.empresa_actual_verificada()) -- Rule 3
    and estado = 'borrador' -- Rule 2: the Admin reviews it once sent
    and motivo_rechazo is null
    and fecha_publicacion is null
    and fecha_envio is null
  );


-- -----------------------------------------------------------------------------
-- 2. Status trigger: same rules as 20261008120100_correcciones_flujo.sql, plus
--    prioridad (draft-only for the company) and fecha_envio (system-stamped)
-- -----------------------------------------------------------------------------

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
      or new.fecha_publicacion is distinct from old.fecha_publicacion
      or new.fecha_envio is distinct from old.fecha_envio then
      raise exception 'only an admin can change these fields' using errcode = '42501';
    end if;

    if old.estado <> 'borrador' and (
      new.titulo is distinct from old.titulo
      or new.descripcion is distinct from old.descripcion
      or new.requisitos is distinct from old.requisitos
      or new.categoria_id is distinct from old.categoria_id
      or new.jornada is distinct from old.jornada
      or new.prioridad is distinct from old.prioridad
    ) then
      raise exception 'only draft offers can be edited' using errcode = '42501';
    end if;
  end if;

  -- Stamped after the checks above, so only the trigger ever sets them
  if new.estado = 'pendiente' and old.estado = 'borrador' then
    new.fecha_envio = now();
  elsif new.estado = 'borrador' and old.estado = 'pendiente' then
    new.fecha_envio = null;
  end if;

  if new.estado = 'publicada' and old.estado <> 'publicada' then
    new.fecha_publicacion = now();
  end if;

  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. Public offers view with priority and demand
-- -----------------------------------------------------------------------------

/**
 * nivel_demanda (0, 1, 2) so it can be sorted on:
 * - 2 "muy solicitada": 10 or more applications and in the top 20 % of the
 *   published offers.
 * - 0 "pocos postulantes": 3 or fewer applications after 5 days published,
 *   a good chance for whoever applies.
 * - 1 otherwise.
 */
create or replace view public.ofertas_publicas
with (security_barrier = true)
as
with conteo as (
  select
    o.id,
    count(p.id) as postulaciones,
    percent_rank() over (order by count(p.id)) as rango
  from public.ofertas o
  left join public.postulaciones p on p.oferta_id = o.id
  where o.estado = 'publicada'
  group by o.id
)
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
  e.logo_url as empresa_logo_url,
  o.prioridad,
  case
    when k.postulaciones >= 10 and k.rango >= 0.8 then 2
    when k.postulaciones <= 3 and o.fecha_publicacion < now() - interval '5 days' then 0
    else 1
  end::smallint as nivel_demanda
from public.ofertas o
join public.categorias c on c.id = o.categoria_id
join public.empresas e on e.id = o.empresa_id
join conteo k on k.id = o.id
where o.estado = 'publicada';
