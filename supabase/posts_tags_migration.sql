create table if not exists public.posts (
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

alter table public.posts
add column if not exists post_type text not null default 'Publicacion';

alter table public.posts
add column if not exists image_url text;

alter table public.posts enable row level security;

drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts" on public.posts for select using (status = 'published');

drop policy if exists "politicians manage own posts" on public.posts;
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

create table if not exists public.post_topics (
  post_id uuid not null references public.posts(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  primary key (post_id, topic_id)
);

alter table public.post_topics enable row level security;

drop policy if exists "public read post topics" on public.post_topics;
create policy "public read post topics" on public.post_topics for select using (true);

drop policy if exists "politicians manage own post topics" on public.post_topics;
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

drop view if exists public.politician_feed;

create view public.politician_feed as
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
    (
      select array_agg(distinct topic_name order by topic_name)
      from (
        select t2.name as topic_name
        from public.proposals pr2
        join public.topics t2 on t2.id = pr2.topic_id
        where pr2.politician_id = pa.id and pr2.status = 'published'
        union
        select t2.name as topic_name
        from public.posts po
        join public.post_topics pt2 on pt2.post_id = po.id
        join public.topics t2 on t2.id = pt2.topic_id
        where po.politician_id = pa.id and po.status = 'published'
      ) all_topics
    ),
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
          coalesce(array_remove(array_agg(post_tag_topics.name), null), array[]::text[]) as tags
        from public.posts
        left join public.post_topics pt on pt.post_id = posts.id
        left join public.topics post_tag_topics on post_tag_topics.id = pt.topic_id
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
