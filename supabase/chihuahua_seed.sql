alter table public.politician_accounts
add column if not exists gender text;

insert into public.parties (id, name, short_name, color_hex)
values
  ('11000000-0000-0000-0000-000000000001', 'Fuerza Chihuahua', 'FCH', '#0F766E'),
  ('11000000-0000-0000-0000-000000000002', 'Movimiento Sierra Norte', 'MSN', '#E11D48'),
  ('11000000-0000-0000-0000-000000000003', 'Alianza del Desierto', 'AD', '#F2C94C'),
  ('11000000-0000-0000-0000-000000000004', 'Justicia y Comunidad', 'JC', '#1D4ED8')
on conflict (id) do nothing;

insert into public.topics (id, name, slug)
values
  ('21000000-0000-0000-0000-000000000001', 'Campo', 'campo'),
  ('21000000-0000-0000-0000-000000000002', 'Agua', 'agua'),
  ('21000000-0000-0000-0000-000000000003', 'Seguridad', 'seguridad-chihuahua'),
  ('21000000-0000-0000-0000-000000000004', 'Salud', 'salud-chihuahua'),
  ('21000000-0000-0000-0000-000000000005', 'Transparencia', 'transparencia-chihuahua')
on conflict (name) do nothing;

with municipalities as (
  select name, row_number() over (order by name) as municipality_index
  from (
    values
      ('Ahumada'),
      ('Aldama'),
      ('Allende'),
      ('Aquiles Serdan'),
      ('Ascension'),
      ('Bachiniva'),
      ('Balleza'),
      ('Batopilas de Manuel Gomez Morin'),
      ('Bocoyna'),
      ('Buenaventura'),
      ('Camargo'),
      ('Carichi'),
      ('Casas Grandes'),
      ('Chihuahua'),
      ('Chinipas'),
      ('Coronado'),
      ('Coyame del Sotol'),
      ('Cuauhtemoc'),
      ('Cusihuiriachi'),
      ('Delicias'),
      ('Dr. Belisario Dominguez'),
      ('Galeana'),
      ('Gomez Farias'),
      ('Gran Morelos'),
      ('Guachochi'),
      ('Guadalupe'),
      ('Guadalupe y Calvo'),
      ('Guazapares'),
      ('Guerrero'),
      ('Hidalgo del Parral'),
      ('Huejotitan'),
      ('Ignacio Zaragoza'),
      ('Janos'),
      ('Jimenez'),
      ('Juarez'),
      ('Julimes'),
      ('Lopez'),
      ('Madera'),
      ('Maguarichi'),
      ('Manuel Benavides'),
      ('Matachi'),
      ('Matamoros'),
      ('Meoqui'),
      ('Morelos'),
      ('Moris'),
      ('Namiquipa'),
      ('Nonoava'),
      ('Nuevo Casas Grandes'),
      ('Ocampo'),
      ('Ojinaga'),
      ('Praxedis G. Guerrero'),
      ('Riva Palacio'),
      ('Rosales'),
      ('Rosario'),
      ('San Francisco de Borja'),
      ('San Francisco de Conchos'),
      ('San Francisco del Oro'),
      ('Santa Barbara'),
      ('Santa Isabel'),
      ('Satevo'),
      ('Saucillo'),
      ('Temosachic'),
      ('El Tule'),
      ('Urique'),
      ('Uruachi'),
      ('Valle de Zaragoza')
  ) as source(name)
),
locations as (
  insert into public.electoral_locations (
    id,
    state,
    municipality,
    federal_district,
    local_district,
    judicial_circuit,
    judicial_district
  )
  select
    md5('chihuahua-location-' || name)::uuid,
    'Chihuahua',
    name,
    'Distrito federal demo ' || (((municipality_index - 1) % 9) + 1),
    'Distrito local demo ' || (((municipality_index - 1) % 22) + 1),
    'Circuito judicial Chihuahua',
    'Distrito judicial demo ' || (((municipality_index - 1) % 12) + 1)
  from municipalities
  on conflict (id) do nothing
  returning id
),
levels as (
  select *
  from (
    values
      ('FED', 'DIP_FED_MR', 'Diputacion federal', 'Agua', 'Agenda federal para agua, seguridad carretera y presupuesto transparente.'),
      ('EST', 'DIP_LOC_MR', 'Diputacion local', 'Seguridad', 'Agenda estatal para seguridad regional, salud y fiscalizacion del gasto publico.'),
      ('MUN', 'PRES_MUN', 'Presidencia municipal', 'Campo', 'Agenda municipal para servicios publicos, campo, caminos y atencion ciudadana.'),
      ('JUD', 'JUEZ_DISTRITO', 'Juzgado de Distrito', 'Transparencia', 'Agenda judicial para lenguaje claro, tiempos de resolucion y justicia abierta.')
  ) as source(level_code, position_code, office_label, topic_name, proposal_body)
),
candidate_rows as (
  select
    m.name as municipality,
    m.municipality_index,
    l.level_code,
    l.position_code,
    l.office_label,
    l.topic_name,
    l.proposal_body,
    row_number() over (order by m.name, l.level_code) as candidate_index
  from municipalities m
  cross join levels l
),
named_candidates as (
  select
    candidate_rows.*,
    case when candidate_index % 2 = 0 then 'Mujer' else 'Hombre' end as gender,
    case when candidate_index % 2 = 0
      then (array['Ana','Carolina','Daniela','Elena','Fernanda','Gabriela','Isabel','Lucia','Mariana','Paola','Renata','Sofia'])[((candidate_index - 1) % 12) + 1]
      else (array['Alejandro','Carlos','Diego','Emilio','Fernando','Hector','Javier','Luis','Marco','Oscar','Rafael','Santiago'])[((candidate_index - 1) % 12) + 1]
    end as first_name,
    (array['Aguilar','Baca','Chavez','Dominguez','Estrada','Flores','Garcia','Herrera','Ibarra','Jimenez','Lopez','Martinez','Navarro','Ortega','Paredes','Quintana','Rivas','Salazar','Torres','Valdez'])[((candidate_index - 1) % 20) + 1] as last_name,
    (array[
      '11000000-0000-0000-0000-000000000001',
      '11000000-0000-0000-0000-000000000002',
      '11000000-0000-0000-0000-000000000003',
      '11000000-0000-0000-0000-000000000004'
    ]::uuid[])[((candidate_index - 1) % 4) + 1] as party_id
  from candidate_rows
),
inserted_candidates as (
  insert into public.politician_accounts (
    id,
    government_politician_id,
    legal_name,
    display_name,
    gender,
    position_id,
    party_id,
    location_id,
    verification_status,
    bio,
    official_source_url
  )
  select
    md5('chihuahua-candidate-' || municipality || '-' || level_code)::uuid,
    'MX-CHIH-' || upper(regexp_replace(municipality, '[^A-Za-z0-9]+', '', 'g')) || '-' || level_code || '-' || lpad(candidate_index::text, 4, '0'),
    first_name || ' ' || last_name,
    first_name || ' ' || last_name,
    gender,
    (select id from public.electoral_positions where code = position_code),
    party_id,
    md5('chihuahua-location-' || municipality)::uuid,
    'verified',
    'Perfil demo para ' || office_label || ' en ' || municipality || ', Chihuahua. Incluye propuestas verificables para probar el feed civico por ubicacion.',
    'https://example.com/chihuahua/' || lower(level_code) || '/' || lower(regexp_replace(municipality, '[^A-Za-z0-9]+', '-', 'g'))
  from named_candidates
  on conflict (government_politician_id) do nothing
  returning id
)
insert into public.proposals (
  politician_id,
  topic_id,
  title,
  body,
  source_url,
  status,
  published_at
)
select
  md5('chihuahua-candidate-' || municipality || '-' || level_code)::uuid,
  (select id from public.topics where name = topic_name limit 1),
  'Propuesta base para ' || municipality,
  proposal_body || ' Municipio de referencia: ' || municipality || ', Chihuahua.',
  'https://example.com/chihuahua/propuestas/' || lower(level_code) || '/' || lower(regexp_replace(municipality, '[^A-Za-z0-9]+', '-', 'g')),
  'published',
  now()
from named_candidates
where exists (
  select 1
  from public.politician_accounts pa
  where pa.id = md5('chihuahua-candidate-' || municipality || '-' || level_code)::uuid
)
on conflict do nothing;
