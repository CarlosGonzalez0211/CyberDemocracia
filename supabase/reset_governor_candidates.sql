-- Destructive reset for the demo candidate database.
-- Run this in the Supabase SQL editor when you want to replace the old
-- Chihuahua demo data with the new gubernatura candidate set.

begin;

-- Delete candidate-owned content first because these tables depend on politician_accounts.
delete from public.post_topics;
delete from public.posts;
delete from public.proposals;
delete from public.documents;
delete from public.politician_accounts;

-- Replace demo parties with the new party set.
delete from public.parties;

insert into public.parties (id, name, short_name, color_hex)
values
  ('71000000-0000-0000-0000-000000000001', 'Partido Morado', 'Morado', '#6D3FA0'),
  ('71000000-0000-0000-0000-000000000002', 'Partido Azul', 'Azul', '#0B5CAD'),
  ('71000000-0000-0000-0000-000000000003', 'Partido Verde', 'Verde', '#B9FF1F'),
  ('71000000-0000-0000-0000-000000000004', 'Partido Rosa', 'Rosa', '#D8B4E8'),
  ('71000000-0000-0000-0000-000000000005', 'Partido Rojo', 'Rojo', '#B00000'),
  ('71000000-0000-0000-0000-000000000006', 'Partido Negro', 'Negro', '#2B2B2B');

-- Ensure the app has a statewide executive position for these candidates.
insert into public.electoral_positions (
  id,
  code,
  name,
  level,
  branch,
  scope_description,
  requires_district,
  requires_municipality,
  requires_state
)
values (
  '72000000-0000-0000-0000-000000000001',
  'GOBERNATURA',
  'Gubernatura',
  'estatal',
  'ejecutivo',
  'Titular del Poder Ejecutivo estatal de Chihuahua.',
  false,
  false,
  true
)
on conflict (code) do update set
  name = excluded.name,
  level = excluded.level,
  branch = excluded.branch,
  scope_description = excluded.scope_description,
  requires_district = excluded.requires_district,
  requires_municipality = excluded.requires_municipality,
  requires_state = excluded.requires_state;

-- Statewide Chihuahua location.
insert into public.electoral_locations (
  id,
  state,
  municipality,
  federal_district,
  local_district,
  judicial_circuit,
  judicial_district
)
values (
  '73000000-0000-0000-0000-000000000001',
  'Chihuahua',
  'Todo el estado',
  'Chihuahua (Estado)',
  'Chihuahua (Estado)',
  null,
  null
)
on conflict (id) do update set
  state = excluded.state,
  municipality = excluded.municipality,
  federal_district = excluded.federal_district,
  local_district = excluded.local_district,
  judicial_circuit = excluded.judicial_circuit,
  judicial_district = excluded.judicial_district;

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
values
  (
    '74000000-0000-0000-0000-000000000001',
    'MX-CHIH-GOB-MORADO-0001',
    'Luna Violeta Morales',
    'Luna Violeta Morales',
    'Mujer',
    '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000001',
    '73000000-0000-0000-0000-000000000001',
    'verified',
    'Candidata a la Gubernatura de Chihuahua por el Partido Morado. Perfil inicial creado para el registro oficial de propuestas.',
    'https://example.com/chihuahua/gubernatura/morado'
  ),
  (
    '74000000-0000-0000-0000-000000000002',
    'MX-CHIH-GOB-AZUL-0002',
    'Alberto Aguilera Juarez',
    'Alberto Aguilera Juarez',
    'Hombre',
    '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000002',
    '73000000-0000-0000-0000-000000000001',
    'verified',
    'Candidato a la Gubernatura de Chihuahua por el Partido Azul. Perfil inicial creado para el registro oficial de propuestas.',
    'https://example.com/chihuahua/gubernatura/azul'
  ),
  (
    '74000000-0000-0000-0000-000000000003',
    'MX-CHIH-GOB-VERDE-0003',
    'Brad Garcia Leon',
    'Brad Garcia Leon',
    'Hombre',
    '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000003',
    '73000000-0000-0000-0000-000000000001',
    'verified',
    'Candidato a la Gubernatura de Chihuahua por el Partido Verde. Perfil inicial creado para el registro oficial de propuestas.',
    'https://example.com/chihuahua/gubernatura/verde'
  ),
  (
    '74000000-0000-0000-0000-000000000004',
    'MX-CHIH-GOB-ROSA-0004',
    'Lulu de la Rosa',
    'Lulu de la Rosa',
    'Mujer',
    '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000004',
    '73000000-0000-0000-0000-000000000001',
    'verified',
    'Candidata a la Gubernatura de Chihuahua por el Partido Rosa. Perfil inicial creado para el registro oficial de propuestas.',
    'https://example.com/chihuahua/gubernatura/rosa'
  ),
  (
    '74000000-0000-0000-0000-000000000005',
    'MX-CHIH-GOB-ROJO-0005',
    'Roberto Beltran Dominguez',
    'Roberto Beltran Dominguez',
    'Hombre',
    '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000005',
    '73000000-0000-0000-0000-000000000001',
    'verified',
    'Candidato a la Gubernatura de Chihuahua por el Partido Rojo. Perfil inicial creado para el registro oficial de propuestas.',
    'https://example.com/chihuahua/gubernatura/rojo'
  ),
  (
    '74000000-0000-0000-0000-000000000006',
    'MX-CHIH-GOB-NEGRO-0006',
    'Arturo Martinez Luto',
    'Arturo Martinez Luto',
    'Hombre',
    '72000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000006',
    '73000000-0000-0000-0000-000000000001',
    'verified',
    'Candidato a la Gubernatura de Chihuahua por el Partido Negro. Perfil inicial creado para el registro oficial de propuestas.',
    'https://example.com/chihuahua/gubernatura/negro'
  );

commit;

-- Valid official IDs for candidate login:
-- MX-CHIH-GOB-MORADO-0001
-- MX-CHIH-GOB-AZUL-0002
-- MX-CHIH-GOB-VERDE-0003
-- MX-CHIH-GOB-ROSA-0004
-- MX-CHIH-GOB-ROJO-0005
-- MX-CHIH-GOB-NEGRO-0006
