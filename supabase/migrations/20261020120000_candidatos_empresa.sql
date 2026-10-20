-- =============================================================================
-- What a company sees of its pre-selected candidates (Phase 5, decisions of
-- 2026-10-20)
--
-- 1. The CV built on the platform (experiencias, formaciones) becomes readable
--    for companies, read-only and only for candidates the Admin pre-selected
--    for one of their offers (Rules 1 and 6). The PDF already was, through the
--    "storage: empresa lee cv de preseleccionados" policy.
-- 2. candidatos_empresa adds phone and email, filled only once the company
--    moved the candidate to entrevista (or contratado): municipal employment
--    offices refer candidates to the company's interview, so the company calls.
--    Before that, contact data stays hidden. This replaces "decision A" of the
--    initial migration (never phone or email). DNI, address, photo and proof
--    of address still never reach companies.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. CV built on the platform
-- -----------------------------------------------------------------------------

/**
 * Whether the signed-in company has this job seeker pre-selected for one of
 * its offers. SECURITY DEFINER because companies cannot read postulaciones
 * outside their pre-selected rows nor postulantes at all.
 */
create function public.empresa_actual_ve_postulante_id(p_postulante_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.postulaciones p
    join public.ofertas o on o.id = p.oferta_id
    join public.empresas e on e.id = o.empresa_id
    where p.postulante_id = p_postulante_id
      and p.fecha_preseleccion is not null
      and e.perfil_id = auth.uid()
  );
$$;

revoke execute on function public.empresa_actual_ve_postulante_id(uuid) from public, anon;
grant execute on function public.empresa_actual_ve_postulante_id(uuid) to authenticated;

create policy "experiencias: empresa ve las de preseleccionados" on public.experiencias
  for select to authenticated using (public.empresa_actual_ve_postulante_id(postulante_id));

create policy "formaciones: empresa ve las de preseleccionados" on public.formaciones
  for select to authenticated using (public.empresa_actual_ve_postulante_id(postulante_id));


-- -----------------------------------------------------------------------------
-- 2. Contact data from the interview on
-- -----------------------------------------------------------------------------

-- New columns go last, as create or replace view requires. Grants are kept.
-- The view runs as its owner, so it can read auth.users for the email.
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
  p.decision_empresa,
  po.id as postulante_id,
  case when p.estado in ('entrevista', 'contratado') then po.telefono end as telefono,
  case when p.estado in ('entrevista', 'contratado') then u.email::text end as email
from public.postulaciones p
join public.postulantes po on po.id = p.postulante_id
join auth.users u on u.id = po.perfil_id
join public.ofertas o on o.id = p.oferta_id
join public.empresas e on e.id = o.empresa_id
where p.fecha_preseleccion is not null
  and e.perfil_id = auth.uid();
