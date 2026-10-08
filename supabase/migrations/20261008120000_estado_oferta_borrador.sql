-- Offers start as a draft the company owns (tutor review 2026-10-08).
-- Kept in its own migration: Postgres cannot use a new enum value in the
-- same transaction that adds it.
alter type public.estado_oferta add value 'borrador' before 'pendiente';
