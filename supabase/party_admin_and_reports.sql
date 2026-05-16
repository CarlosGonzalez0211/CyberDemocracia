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

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid references public.politician_accounts(id) on delete set null,
  content_id text,
  title text,
  reason text,
  status text not null default 'nuevo',
  created_at timestamptz not null default now()
);

alter table public.content_reports enable row level security;

drop policy if exists "service role manages content reports" on public.content_reports;
create policy "service role manages content reports" on public.content_reports
for all using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
