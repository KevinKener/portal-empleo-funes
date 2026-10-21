-- =============================================================================
-- Offer closing date (decisions 2026-10-21)
--
-- * ofertas.fecha_cierre (date, Argentina): last day the offer takes
--   applications. The company may pick it while the offer is a draft, from
--   tomorrow up to 60 days ahead. On publication it becomes today + 30 days
--   when missing or already past.
-- * An offer is "vencida" when it is `publicada` and fecha_cierre < today.
--   It is derived, not a status: the public view hides it and nobody can
--   apply, and extending it is only moving the date (Admin only, up to 60
--   days from today), with no status transition.
-- * Offers already published get fecha_publicacion + 30 days, or today + 7
--   when that already passed, so none disappears overnight.
-- =============================================================================

/** Today in Funes: dates are days, not instants, and the server runs in UTC. */
create function public.hoy_argentina()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Argentina/Buenos_Aires')::date;
$$;

alter table public.ofertas add column fecha_cierre date;

update public.ofertas
set fecha_cierre = greatest((fecha_publicacion at time zone 'America/Argentina/Buenos_Aires')::date + 30, public.hoy_argentina() + 7)
where estado = 'publicada';

/**
 * Same rules as 20261021130000_prioridad_ofertas.sql, plus fecha_cierre:
 * the company sets it only on drafts and within 60 days; the Admin moves it
 * (extends) within 60 days from today; publishing fills it when missing.
 */
create or replace function public.validar_cambios_oferta()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  admin boolean := public.actua_como_admin();
  hoy date := public.hoy_argentina();
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
      or new.fecha_cierre is distinct from old.fecha_cierre
    ) then
      raise exception 'only draft offers can be edited' using errcode = '42501';
    end if;

    if new.fecha_cierre is distinct from old.fecha_cierre
      and new.fecha_cierre is not null
      and (new.fecha_cierre <= hoy or new.fecha_cierre > hoy + 60) then
      raise exception 'closing date must be within the next 60 days' using errcode = '23514';
    end if;
  elsif new.fecha_cierre is distinct from old.fecha_cierre
    and new.estado = 'publicada' and old.estado = 'publicada'
    and (new.fecha_cierre is null or new.fecha_cierre < hoy or new.fecha_cierre > hoy + 60) then
    -- Extending: from today (last day) up to 60 days ahead
    raise exception 'closing date must be within the next 60 days' using errcode = '23514';
  end if;

  -- Stamped after the checks above, so only the trigger ever sets them
  if new.estado = 'pendiente' and old.estado = 'borrador' then
    new.fecha_envio = now();
  elsif new.estado = 'borrador' and old.estado = 'pendiente' then
    new.fecha_envio = null;
  end if;

  if new.estado = 'publicada' and old.estado <> 'publicada' then
    new.fecha_publicacion = now();
    if new.fecha_cierre is null or new.fecha_cierre < hoy then
      new.fecha_cierre = hoy + 30;
    end if;
  end if;

  return new;
end;
$$;

-- Inserts go through the same window (a company creating a draft with a date)
create or replace function public.validar_fecha_cierre_nueva()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  hoy date := public.hoy_argentina();
begin
  if new.fecha_cierre is not null and (new.fecha_cierre <= hoy or new.fecha_cierre > hoy + 60) then
    raise exception 'closing date must be within the next 60 days' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validar_fecha_cierre_nueva before insert on public.ofertas
  for each row execute function public.validar_fecha_cierre_nueva();

/** Published and not past its closing date: the only offers that take applications (Rule 2). */
create or replace function public.oferta_esta_publicada(p_oferta_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.ofertas
    where id = p_oferta_id
      and estado = 'publicada'
      and (fecha_cierre is null or fecha_cierre >= public.hoy_argentina())
  );
$$;

-- Same view as 20261021130000, with expired offers left out and
-- fecha_cierre appended (create or replace can only add columns at the end).
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
    and (o.fecha_cierre is null or o.fecha_cierre >= public.hoy_argentina())
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
  end::smallint as nivel_demanda,
  o.fecha_cierre
from public.ofertas o
join public.categorias c on c.id = o.categoria_id
join public.empresas e on e.id = o.empresa_id
join conteo k on k.id = o.id
where o.estado = 'publicada'
  and (o.fecha_cierre is null or o.fecha_cierre >= public.hoy_argentina());

-- Harmless (it only returns today's date) and read by the public view
grant execute on function public.hoy_argentina() to anon, authenticated;
