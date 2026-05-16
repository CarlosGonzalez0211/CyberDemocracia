alter table public.parties
add column if not exists description text;

create unique index if not exists parties_name_unique_idx on public.parties (name);

insert into public.parties (name, short_name, color_hex, description)
values
  ('Intuicion Mistica', 'IM', '#6A0DAD', 'Partido de identidad mistica, espiritual y profunda.'),
  ('Alianza Coquette', 'AC', '#FFB7C5', 'Partido de identidad estetica, ordenada y comunitaria.'),
  ('Partido Salvando Mexico', 'PSM', '#DC143C', 'Partido de identidad intensa, pasional y rebelde.'),
  ('Partidon''t Care', 'PDC', '#89CC04', 'Partido de identidad disruptiva, electrica y juvenil.'),
  ('Union Malaventurada', 'PUM', '#0A0A0F', 'Partido de identidad melancolica, sobria y profunda.'),
  ('Amor Eterno por Chihuahua', 'AEC', '#1E90FF', 'Partido de identidad alegre, brillante y chihuahuense.')
on conflict (name) do update
set
  short_name = excluded.short_name,
  color_hex = excluded.color_hex,
  description = excluded.description;

with party_map as (
  select *
  from (
    values
      ('Morado', 'Intuicion Mistica'),
      ('Rosa', 'Alianza Coquette'),
      ('Rojo', 'Partido Salvando Mexico'),
      ('Verde', 'Partidon''t Care'),
      ('Negro', 'Union Malaventurada'),
      ('Azul', 'Amor Eterno por Chihuahua')
  ) as source(old_name, new_name)
),
resolved as (
  select
    old_party.id as old_party_id,
    new_party.id as new_party_id
  from party_map
  join public.parties old_party on old_party.name = party_map.old_name
  join public.parties new_party on new_party.name = party_map.new_name
)
update public.politician_accounts pa
set party_id = resolved.new_party_id,
    updated_at = now()
from resolved
where pa.party_id = resolved.old_party_id;

delete from public.parties
where name in ('Morado', 'Rosa', 'Rojo', 'Verde', 'Negro', 'Azul');
