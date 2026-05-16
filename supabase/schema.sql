create extension if not exists "pgcrypto";

create type public.political_level as enum (
  'federal',
  'estatal',
  'municipal',
  'judicial_federal',
  'judicial_local',
  'especial'
);

create type public.power_branch as enum (
  'ejecutivo',
  'legislativo',
  'judicial',
  'municipal'
);

create type public.proposal_status as enum (
  'draft',
  'published',
  'archived'
);

create table public.electoral_positions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  level public.political_level not null,
  branch public.power_branch not null,
  scope_description text,
  requires_district boolean not null default false,
  requires_municipality boolean not null default false,
  requires_state boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.electoral_locations (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  municipality text,
  federal_district text,
  local_district text,
  judicial_circuit text,
  judicial_district text,
  created_at timestamptz not null default now()
);

create table public.parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  color_hex text,
  created_at timestamptz not null default now()
);

create table public.politician_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  government_politician_id text not null unique,
  legal_name text not null,
  display_name text not null,
  gender text,
  position_id uuid not null references public.electoral_positions(id),
  party_id uuid references public.parties(id),
  location_id uuid references public.electoral_locations(id),
  verification_status text not null default 'pending',
  bio text,
  photo_url text,
  official_source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politician_accounts(id) on delete cascade,
  topic_id uuid references public.topics(id),
  title text not null,
  body text not null,
  source_url text,
  status public.proposal_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politician_accounts(id) on delete cascade,
  title text not null,
  file_url text not null,
  document_type text not null default 'platform',
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politician_accounts(id) on delete cascade,
  title text not null,
  body text not null,
  post_type text not null default 'Publicacion',
  image_url text,
  status public.proposal_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_topics (
  post_id uuid not null references public.posts(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  primary key (post_id, topic_id)
);

create or replace view public.politician_feed as
select
  pa.id,
  pa.government_politician_id,
  pa.display_name as name,
  pa.gender,
  coalesce(p.name, 'Sin partido') as party,
  coalesce(p.color_hex, '#0A0A0F') as party_color_hex,
  ep.name as office,
  case ep.level
    when 'federal' then 'Federal'
    when 'estatal' then 'Estatal'
    when 'municipal' then 'Municipal'
    when 'judicial_federal' then 'Judicial'
    when 'judicial_local' then 'Judicial'
    else 'Especial'
  end as level,
  el.state,
  coalesce(el.municipality, 'Todo el estado') as municipality,
  coalesce(el.federal_district, 'No aplica') as federal_district,
  coalesce(el.local_district, 'No aplica') as local_district,
  coalesce(pa.bio, '') as profile,
  coalesce(pa.photo_url, '') as photo_url,
  coalesce(pa.official_source_url, '') as source,
  to_char(pa.updated_at, 'DD Mon YYYY') as updated_at,
  coalesce(
    array_remove(array_agg(distinct t.name), null),
    array[]::text[]
  ) as topics,
  coalesce(
    jsonb_agg(
      distinct jsonb_build_object(
        'topic', coalesce(t.name, 'General'),
        'text', pr.body
      )
    ) filter (where pr.status = 'published'),
    '[]'::jsonb
  ) as proposals,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', latest_posts.id,
          'title', latest_posts.title,
          'body', latest_posts.body,
          'type', latest_posts.post_type,
          'tags', latest_posts.tags,
          'imageUrl', latest_posts.image_url,
          'createdAt', to_char(latest_posts.created_at, 'DD Mon YYYY'),
          'createdAtIso', latest_posts.created_at
        )
        order by latest_posts.created_at desc
      )
      from (
        select
          posts.title,
          posts.id,
          posts.body,
          posts.post_type,
          posts.image_url,
          posts.created_at,
          coalesce(array_remove(array_agg(t.name), null), array[]::text[]) as tags
        from public.posts
        left join public.post_topics pt on pt.post_id = posts.id
        left join public.topics t on t.id = pt.topic_id
        where posts.politician_id = pa.id
          and posts.status = 'published'
        group by posts.id
        order by posts.created_at desc
      ) latest_posts
    ),
    '[]'::jsonb
  ) as posts
from public.politician_accounts pa
join public.electoral_positions ep on ep.id = pa.position_id
left join public.parties p on p.id = pa.party_id
left join public.electoral_locations el on el.id = pa.location_id
left join public.proposals pr on pr.politician_id = pa.id and pr.status = 'published'
left join public.topics t on t.id = pr.topic_id
where pa.verification_status = 'verified'
group by pa.id, p.name, p.color_hex, ep.name, ep.level, el.state, el.municipality, el.federal_district, el.local_district;

alter table public.electoral_positions enable row level security;
alter table public.electoral_locations enable row level security;
alter table public.parties enable row level security;
alter table public.politician_accounts enable row level security;
alter table public.topics enable row level security;
alter table public.proposals enable row level security;
alter table public.documents enable row level security;
alter table public.posts enable row level security;
alter table public.post_topics enable row level security;

create policy "public read positions" on public.electoral_positions for select using (true);
create policy "public read locations" on public.electoral_locations for select using (true);
create policy "public read parties" on public.parties for select using (true);
create policy "public read verified politicians" on public.politician_accounts for select using (verification_status = 'verified');
create policy "public read topics" on public.topics for select using (true);
create policy "public read published proposals" on public.proposals for select using (status = 'published');
create policy "public read documents for verified politicians" on public.documents for select using (
  exists (
    select 1
    from public.politician_accounts pa
    where pa.id = documents.politician_id
      and pa.verification_status = 'verified'
  )
);

create policy "public read published posts" on public.posts for select using (status = 'published');
create policy "public read post topics" on public.post_topics for select using (true);

create policy "politicians update own account" on public.politician_accounts
for update using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy "politicians manage own proposals" on public.proposals
for all using (
  exists (
    select 1
    from public.politician_accounts pa
    where pa.id = proposals.politician_id
      and pa.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.politician_accounts pa
    where pa.id = proposals.politician_id
      and pa.auth_user_id = auth.uid()
  )
);

create policy "politicians manage own posts" on public.posts
for all using (
  exists (
    select 1
    from public.politician_accounts pa
    where pa.id = posts.politician_id
      and pa.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.politician_accounts pa
    where pa.id = posts.politician_id
      and pa.auth_user_id = auth.uid()
  )
);

create policy "politicians manage own post topics" on public.post_topics
for all using (
  exists (
    select 1
    from public.posts po
    join public.politician_accounts pa on pa.id = po.politician_id
    where po.id = post_topics.post_id
      and pa.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.posts po
    join public.politician_accounts pa on pa.id = po.politician_id
    where po.id = post_topics.post_id
      and pa.auth_user_id = auth.uid()
  )
);

insert into public.electoral_positions (code, name, level, branch, scope_description, requires_district, requires_municipality, requires_state)
values
  ('PRES_MX', 'Presidencia de la Republica', 'federal', 'ejecutivo', 'Titular del Poder Ejecutivo Federal', false, false, false),
  ('SEN_MX', 'Senaduria', 'federal', 'legislativo', 'Camara de Senadores por entidad federativa y representacion proporcional', false, false, true),
  ('DIP_FED_MR', 'Diputacion federal de mayoria relativa', 'federal', 'legislativo', 'Camara de Diputados por distrito electoral federal', true, false, true),
  ('DIP_FED_RP', 'Diputacion federal de representacion proporcional', 'federal', 'legislativo', 'Camara de Diputados por circunscripcion plurinominal', false, false, true),
  ('GUB', 'Gubernatura', 'estatal', 'ejecutivo', 'Titular del Poder Ejecutivo estatal', false, false, true),
  ('JEF_GOB_CDMX', 'Jefatura de Gobierno', 'estatal', 'ejecutivo', 'Titular del Ejecutivo de la Ciudad de Mexico', false, false, true),
  ('DIP_LOC_MR', 'Diputacion local de mayoria relativa', 'estatal', 'legislativo', 'Congreso local por distrito electoral local', true, false, true),
  ('DIP_LOC_RP', 'Diputacion local de representacion proporcional', 'estatal', 'legislativo', 'Congreso local por representacion proporcional', false, false, true),
  ('ALCALDIA_CDMX', 'Alcaldia', 'municipal', 'municipal', 'Demarcacion territorial de la Ciudad de Mexico', false, true, true),
  ('PRES_MUN', 'Presidencia municipal', 'municipal', 'municipal', 'Ayuntamiento municipal', false, true, true),
  ('SINDICATURA', 'Sindicatura', 'municipal', 'municipal', 'Integrante del ayuntamiento', false, true, true),
  ('REGIDURIA', 'Regiduria', 'municipal', 'municipal', 'Integrante del ayuntamiento', false, true, true),
  ('CONCEJALIA', 'Concejalia', 'municipal', 'municipal', 'Concejo de alcaldia en Ciudad de Mexico', false, true, true),
  ('JUNTA_MUNICIPAL', 'Junta municipal', 'municipal', 'municipal', 'Autoridad municipal auxiliar donde aplique', false, true, true),
  ('MIN_SCJN', 'Ministratura de la SCJN', 'judicial_federal', 'judicial', 'Suprema Corte de Justicia de la Nacion', false, false, false),
  ('MAG_TDJ', 'Magistratura del Tribunal de Disciplina Judicial', 'judicial_federal', 'judicial', 'Tribunal de Disciplina Judicial', false, false, false),
  ('MAG_TEPJF_SS', 'Magistratura Sala Superior TEPJF', 'judicial_federal', 'judicial', 'Sala Superior del Tribunal Electoral del Poder Judicial de la Federacion', false, false, false),
  ('MAG_TEPJF_SR', 'Magistratura Sala Regional TEPJF', 'judicial_federal', 'judicial', 'Sala Regional del Tribunal Electoral del Poder Judicial de la Federacion', true, false, true),
  ('MAG_CIRCUITO', 'Magistratura de Circuito', 'judicial_federal', 'judicial', 'Tribunales Colegiados de Circuito', true, false, true),
  ('JUEZ_DISTRITO', 'Persona juzgadora de Distrito', 'judicial_federal', 'judicial', 'Juzgados de Distrito', true, false, true)
on conflict (code) do nothing;
