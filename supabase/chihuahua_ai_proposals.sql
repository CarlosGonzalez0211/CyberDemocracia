insert into public.topics (name, slug)
values ('Salud', 'salud')
on conflict (name) do nothing;

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
  pa.id,
  (select id from public.topics where name = 'Salud' limit 1),
  'Jornadas de salud e inyecciones gratuitas',
  'Propone jornadas comunitarias de salud con aplicacion de vacunas e inyecciones gratuitas en centros publicos, escuelas y brigadas moviles, priorizando personas mayores, infancia y comunidades alejadas.',
  pa.official_source_url,
  'published',
  now()
from public.politician_accounts pa
join public.electoral_locations el on el.id = pa.location_id
join public.electoral_positions ep on ep.id = pa.position_id
where el.state = 'Chihuahua'
  and ep.code in ('PRES_MUN', 'DIP_LOC_MR', 'DIP_FED_MR')
  and not exists (
    select 1
    from public.proposals pr
    where pr.politician_id = pa.id
      and pr.title = 'Jornadas de salud e inyecciones gratuitas'
  );

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
  pa.id,
  (select id from public.topics where name = 'Salud' limit 1),
  'Transparencia en servicios de salud',
  'Propone publicar datos sobre abasto, tiempos de atencion y disponibilidad de medicamentos, vacunas e insumos de salud para que la ciudadania pueda verificar el servicio.',
  pa.official_source_url,
  'published',
  now()
from public.politician_accounts pa
join public.electoral_locations el on el.id = pa.location_id
join public.electoral_positions ep on ep.id = pa.position_id
where el.state = 'Chihuahua'
  and ep.code in ('JUEZ_DISTRITO', 'MAG_CIRCUITO')
  and not exists (
    select 1
    from public.proposals pr
    where pr.politician_id = pa.id
      and pr.title = 'Transparencia en servicios de salud'
  );
