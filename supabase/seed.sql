insert into public.parties (id, name, short_name, color_hex)
values
  ('10000000-0000-0000-0000-000000000001', 'Coalicion Futuro Local', 'CFL', '#0F766E'),
  ('10000000-0000-0000-0000-000000000002', 'Movimiento Norte', 'MN', '#E11D48'),
  ('10000000-0000-0000-0000-000000000003', 'Agenda Ciudadana', 'AC', '#F2C94C'),
  ('10000000-0000-0000-0000-000000000004', 'Justicia Abierta', 'JA', '#1D4ED8')
on conflict (id) do nothing;

insert into public.topics (id, name, slug)
values
  ('20000000-0000-0000-0000-000000000001', 'Seguridad', 'seguridad'),
  ('20000000-0000-0000-0000-000000000002', 'Transparencia', 'transparencia'),
  ('20000000-0000-0000-0000-000000000003', 'Economia', 'economia'),
  ('20000000-0000-0000-0000-000000000004', 'Juventudes', 'juventudes'),
  ('20000000-0000-0000-0000-000000000005', 'Movilidad', 'movilidad'),
  ('20000000-0000-0000-0000-000000000006', 'Derechos humanos', 'derechos-humanos')
on conflict (slug) do nothing;

insert into public.electoral_locations (id, state, municipality, federal_district, local_district, judicial_circuit, judicial_district)
values
  ('30000000-0000-0000-0000-000000000001', 'Nuevo Leon', 'Monterrey', 'Distrito federal 10', 'Distrito local 6', null, null),
  ('30000000-0000-0000-0000-000000000002', 'Nuevo Leon', 'Monterrey', 'Distrito federal 10', 'Circuito judicial estatal', 'Circuito judicial estatal', 'Distrito judicial estatal')
on conflict (id) do nothing;

insert into public.politician_accounts (
  id,
  government_politician_id,
  legal_name,
  display_name,
  position_id,
  party_id,
  location_id,
  verification_status,
  bio,
  official_source_url
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    'MX-NL-MTY-PRESMUN-0001',
    'Valeria Robles',
    'Valeria Robles',
    (select id from public.electoral_positions where code = 'PRES_MUN'),
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'verified',
    'Candidata municipal con agenda enfocada en seguridad por colonia, respuesta ciudadana y datos abiertos del ayuntamiento.',
    'https://example.com/valeria-robles'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'MX-NL-DL06-DIPLOC-0002',
    'Santiago Meza',
    'Santiago Meza',
    (select id from public.electoral_positions where code = 'DIP_LOC_MR'),
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    'verified',
    'Aspirante al Congreso local con propuestas sobre empleo joven, simplificacion de tramites y becas de capacitacion.',
    'https://example.com/santiago-meza'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'MX-NL-MTY-REG-0003',
    'Jimena Castillo',
    'Jimena Castillo',
    (select id from public.electoral_positions where code = 'REGIDURIA'),
    '10000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    'verified',
    'Perfil ciudadano orientado a movilidad barrial, banquetas accesibles y vigilancia del presupuesto participativo.',
    'https://example.com/jimena-castillo'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'MX-NL-JUD-MAG-0004',
    'Rafael Ibarra',
    'Rafael Ibarra',
    (select id from public.electoral_positions where code = 'MAG_CIRCUITO'),
    '10000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000002',
    'verified',
    'Candidato judicial con enfasis en sentencias claras, indicadores de tiempos de resolucion y acceso ciudadano a criterios.',
    'https://example.com/rafael-ibarra'
  )
on conflict (government_politician_id) do nothing;

insert into public.proposals (politician_id, topic_id, title, body, source_url, status, published_at)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Patrullajes por cuadrante', 'Patrullajes por cuadrante con reportes semanales de incidencia y tiempos de respuesta por colonia.', 'https://example.com/valeria-robles', 'published', now()),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Compras municipales abiertas', 'Publicacion mensual de compras municipales, proveedor, monto y justificacion tecnica.', 'https://example.com/valeria-robles', 'published', now()),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Ventanilla digital unica', 'Ventanilla digital unica para permisos de bajo riesgo y seguimiento publico del tramite.', 'https://example.com/santiago-meza', 'published', now()),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'Becas de primer empleo', 'Becas de primer empleo con practicas pagadas en empresas locales y organizaciones civiles.', 'https://example.com/santiago-meza', 'published', now()),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'Rutas seguras a escuelas', 'Rutas seguras a escuelas con cruces visibles, iluminacion y auditorias de velocidad.', 'https://example.com/jimena-castillo', 'published', now()),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000006', 'Sentencias claras', 'Version ciudadana de sentencias relevantes con resumen, criterio y efecto practico.', 'https://example.com/rafael-ibarra', 'published', now())
on conflict do nothing;
