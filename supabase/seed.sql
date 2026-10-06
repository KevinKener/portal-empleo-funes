-- =============================================================================
-- Demo data: categories, one verified demo company and sample offers.
--
-- Idempotent (fixed ids + on conflict do nothing), so it can be re-run.
-- The demo company's auth user has no password: it owns the demo offers but
-- nobody can log in with it.
-- =============================================================================

insert into public.categorias (nombre)
values
  ('Administración'),
  ('Atención al cliente'),
  ('Comercio y ventas'),
  ('Construcción'),
  ('Cuidado de personas'),
  ('Educación'),
  ('Gastronomía'),
  ('Industria y producción'),
  ('Limpieza y mantenimiento'),
  ('Logística y transporte'),
  ('Salud'),
  ('Tecnología')
on conflict (nombre) do nothing;

-- Demo company account. The trigger on auth.users creates its perfiles row
-- from raw_user_meta_data.rol. Empty-string token columns are what GoTrue
-- expects; NULLs there break the dashboard's user list.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'empresa.demo@example.com',
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"rol": "empresa"}',
  now(),
  now(),
  '', '', '', ''
)
on conflict (id) do nothing;

insert into public.empresas (
  id, perfil_id, razon_social, cuit, nombre_comercial, telefono, direccion, estado
)
values (
  'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000001',
  'Empresa Demo S.R.L.',
  '30000000007',
  'Empresa Demo',
  '3410000000',
  'Calle Falsa 123, Funes',
  'verificado'
)
on conflict (id) do nothing;

-- Published offers show up on the public portal; the pending one does not (Rule 2).
insert into public.ofertas (
  id, empresa_id, categoria_id, titulo, descripcion, requisitos, jornada, estado, fecha_publicacion
)
select v.id::uuid, 'd0000000-0000-4000-8000-000000000002', c.id, v.titulo, v.descripcion,
  v.requisitos, v.jornada::public.jornada, v.estado::public.estado_oferta,
  case when v.estado = 'publicada' then now() end
from (
  values
    ('d0000000-0000-4000-8000-000000000101', 'Gastronomía', 'Ayudante de cocina',
      'Buscamos ayudante de cocina para restaurante en el centro de Funes. Tareas de preparación, limpieza y apoyo al cocinero.',
      'Experiencia mínima de 6 meses. Carnet de manipulación de alimentos (deseable).',
      'completa', 'publicada'),
    ('d0000000-0000-4000-8000-000000000102', 'Comercio y ventas', 'Vendedor/a de mostrador',
      'Atención al público, cobro y reposición en comercio de barrio.',
      'Secundario completo. Manejo básico de caja.',
      'media_jornada', 'publicada'),
    ('d0000000-0000-4000-8000-000000000103', 'Construcción', 'Oficial albañil',
      'Obra en construcción de viviendas en Funes. Trabajo por temporada.',
      'Experiencia comprobable en obra.',
      'temporal', 'publicada'),
    ('d0000000-0000-4000-8000-000000000104', 'Administración', 'Auxiliar administrativo/a',
      'Carga de datos, facturación y atención telefónica.',
      'Manejo de planillas de cálculo. Secundario completo.',
      'completa', 'publicada'),
    ('d0000000-0000-4000-8000-000000000105', 'Limpieza y mantenimiento', 'Personal de limpieza',
      'Limpieza de oficinas por la tarde.',
      null,
      'por_horas', 'publicada'),
    ('d0000000-0000-4000-8000-000000000106', 'Tecnología', 'Soporte técnico',
      'Soporte a usuarios, instalación de equipos y redes básicas.',
      'Conocimientos de hardware y redes.',
      'completa', 'pendiente')
) as v (id, categoria, titulo, descripcion, requisitos, jornada, estado)
join public.categorias c on c.nombre = v.categoria
on conflict (id) do nothing;

insert into public.cursos (id, nombre, descripcion, enlace)
values
  ('d0000000-0000-4000-8000-000000000201', 'Manipulación de alimentos',
    'Curso introductorio de buenas prácticas en la manipulación de alimentos.', null),
  ('d0000000-0000-4000-8000-000000000202', 'Herramientas digitales básicas',
    'Uso de correo electrónico, procesador de textos y búsqueda de empleo en internet.', null)
on conflict (id) do nothing;
