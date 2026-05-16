begin;

with target_posts as (
  select
    p.id,
    row_number() over (
      order by
        pa.government_politician_id,
        case t.name
          when 'Economia' then 1
          when 'Salud' then 2
          when 'Educacion' then 3
          when 'Medio ambiente' then 4
          when 'Seguridad' then 5
          when 'Politica Social' then 6
          when 'Libertad Ciudadana' then 7
          when 'Comunidad Indigena' then 8
          when 'Poblacion LGBT' then 9
          when 'Politica externa' then 10
          else 99
        end
    ) as mock_index
  from public.posts p
  join public.politician_accounts pa on pa.id = p.politician_id
  left join public.post_topics pt on pt.post_id = p.id
  left join public.topics t on t.id = pt.topic_id
  where pa.government_politician_id in (
    'MX-CHIH-GOB-MORADO-0001',
    'MX-CHIH-GOB-AZUL-0002',
    'MX-CHIH-GOB-VERDE-0003',
    'MX-CHIH-GOB-ROSA-0004',
    'MX-CHIH-GOB-ROJO-0005',
    'MX-CHIH-GOB-NEGRO-0006',
    'MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007',
    'MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008'
  )
    and p.post_type = 'Propuesta'
    and p.title like 'Propuesta sobre %'
), mock_dates as (
  select
    id,
    timestamptz '2026-05-15 09:00:00-06'
      - ((mock_index % 28) * interval '1 day')
      - ((mock_index % 9) * interval '1 hour')
      - ((mock_index % 37) * interval '1 minute') as mock_published_at
  from target_posts
)
update public.posts p
set
  published_at = md.mock_published_at,
  created_at = md.mock_published_at,
  updated_at = md.mock_published_at
from mock_dates md
where p.id = md.id;

commit;
