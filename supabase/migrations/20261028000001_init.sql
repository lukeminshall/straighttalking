-- Straight Talking — initial schema
-- A patient-feedback + peer-support platform. NOT a clinical system: no patient
-- identifiable data is stored against feedback, and nothing here is a medical
-- record. Reply/follow-up contact details live in a separate table from the
-- feedback itself, and are never exposed to anonymous readers.
--
-- Access model:
--   anon          -> patients and the public. Can read only what is explicitly
--                    published, and can only write through the submit_* / heart_*
--                    / report_content functions below (no direct table writes).
--   authenticated -> practice operators (Clerk JWT with role=authenticated).
--                    Read everything, moderate, resolve. Per-practice scoping is
--                    a later step (needs practice_id in the JWT claims).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Practices
-- ---------------------------------------------------------------------------
create table public.practices (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  town              text,
  google_review_url text,
  status            text not null default 'trial'
                      check (status in ('trial', 'active', 'cancelled')),
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Feedback (anonymous — no PID here, ever)
-- ---------------------------------------------------------------------------
create table public.feedback (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid references public.practices(id) on delete set null,
  created_at    timestamptz not null default now(),
  reference     text not null,                       -- patient-facing receipt code
  rating        smallint check (rating between 1 and 5),
  recommend     smallint check (recommend between 1 and 5),
  service       text,
  intent        text not null default 'comment'
                  check (intent in ('compliment', 'concern', 'comment')),
  body          text,
  flagged       boolean not null default false,      -- needs the team's attention
  status        text not null default 'new'
                  check (status in ('new', 'seen', 'resolved')),
  share_consent boolean not null default false,      -- patient ok with public use
  published     boolean not null default false       -- operator approved for board
);
create index feedback_practice_created_idx on public.feedback (practice_id, created_at desc);
create index feedback_flagged_idx on public.feedback (flagged) where flagged;

-- Reply / follow-up contact — deliberately separate from feedback.
create table public.feedback_contact (
  id          uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback(id) on delete cascade,
  kind        text not null check (kind in ('reply', 'followup')),
  email       text,
  phone       text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- "You said, we did" — board content, operator-curated
-- ---------------------------------------------------------------------------
create table public.you_said_we_did (
  id          uuid primary key default gen_random_uuid(),
  practice_id uuid references public.practices(id) on delete cascade,
  said        text not null,
  did         text not null,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Peer-to-peer support
-- ---------------------------------------------------------------------------
create table public.support_posts (
  id          uuid primary key default gen_random_uuid(),
  practice_id uuid references public.practices(id) on delete set null,
  alias       text not null default 'Anonymous',     -- self-chosen, not an identity
  topic       text,
  body        text not null,
  status      text not null default 'visible'
                check (status in ('visible', 'pending', 'removed')),
  hearts      integer not null default 0,
  created_at  timestamptz not null default now()
);
create index support_posts_visible_idx on public.support_posts (created_at desc) where status = 'visible';

create table public.support_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.support_posts(id) on delete cascade,
  alias      text not null default 'Anonymous',
  body       text not null,
  status     text not null default 'visible'
               check (status in ('visible', 'pending', 'removed')),
  hearts     integer not null default 0,
  created_at timestamptz not null default now()
);
create index support_replies_post_idx on public.support_replies (post_id, created_at);

create table public.support_reports (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'reply')),
  target_id   uuid not null,
  reason      text,
  status      text not null default 'open' check (status in ('open', 'actioned')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders / subscriptions (written server-side via the service role)
-- ---------------------------------------------------------------------------
create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  practice_id            uuid references public.practices(id) on delete set null,
  email                  text,
  kind                   text not null default 'subscription'
                           check (kind in ('subscription', 'materials')),
  amount                 integer,                     -- in pence
  currency               text not null default 'gbp',
  stripe_session_id      text,
  stripe_subscription_id text,
  status                 text not null default 'pending'
                           check (status in ('pending', 'paid', 'cancelled')),
  created_at             timestamptz not null default now()
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.practices        enable row level security;
alter table public.feedback         enable row level security;
alter table public.feedback_contact enable row level security;
alter table public.you_said_we_did  enable row level security;
alter table public.support_posts    enable row level security;
alter table public.support_replies  enable row level security;
alter table public.support_reports  enable row level security;
alter table public.orders           enable row level security;

-- Practices: public can read the non-sensitive directory; operators manage.
create policy practices_read_all on public.practices
  for select to anon, authenticated using (true);
create policy practices_write_auth on public.practices
  for all to authenticated using (true) with check (true);

-- Feedback: public can read only board-approved, consented items. No anon writes
-- here (writes go through submit_feedback). Operators read + moderate everything.
create policy feedback_read_published on public.feedback
  for select to anon using (published and share_consent);
create policy feedback_read_auth on public.feedback
  for select to authenticated using (true);
create policy feedback_update_auth on public.feedback
  for update to authenticated using (true) with check (true);

-- Feedback contact: NEVER readable by anon. Operators only.
create policy feedback_contact_read_auth on public.feedback_contact
  for select to authenticated using (true);

-- You said / we did: public reads published, operators manage.
create policy ysd_read_published on public.you_said_we_did
  for select to anon using (published);
create policy ysd_read_auth on public.you_said_we_did
  for select to authenticated using (true);
create policy ysd_write_auth on public.you_said_we_did
  for all to authenticated using (true) with check (true);

-- Support: public reads visible items; writes go through functions. Operators moderate.
create policy posts_read_visible on public.support_posts
  for select to anon using (status = 'visible');
create policy posts_read_auth on public.support_posts
  for select to authenticated using (true);
create policy posts_moderate_auth on public.support_posts
  for update to authenticated using (true) with check (true);
create policy posts_delete_auth on public.support_posts
  for delete to authenticated using (true);

create policy replies_read_visible on public.support_replies
  for select to anon using (status = 'visible');
create policy replies_read_auth on public.support_replies
  for select to authenticated using (true);
create policy replies_moderate_auth on public.support_replies
  for update to authenticated using (true) with check (true);
create policy replies_delete_auth on public.support_replies
  for delete to authenticated using (true);

-- Reports: operators read + action. Anon raises them via report_content().
create policy reports_read_auth on public.support_reports
  for select to authenticated using (true);
create policy reports_update_auth on public.support_reports
  for update to authenticated using (true) with check (true);

-- Orders: operators read only (writes are service-role, which bypasses RLS).
create policy orders_read_auth on public.orders
  for select to authenticated using (true);

-- ===========================================================================
-- Write paths for anonymous patients — tightly-scoped SECURITY DEFINER funcs.
-- These are the ONLY way anon can write, so validation lives here.
-- ===========================================================================

-- Submit feedback (+ optional, separately-stored contact details).
create or replace function public.submit_feedback(
  p_practice_slug text,
  p_reference     text,
  p_rating        int,
  p_recommend     int,
  p_service       text,
  p_intent        text,
  p_body          text,
  p_share_consent boolean default false,
  p_reply_email   text default null,
  p_followup      text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_practice uuid;
  v_id       uuid;
  v_flagged  boolean;
begin
  if p_intent not in ('compliment', 'concern', 'comment') then
    raise exception 'invalid intent';
  end if;
  if length(coalesce(p_body, '')) > 5000 then
    raise exception 'body too long';
  end if;

  select id into v_practice from public.practices where slug = p_practice_slug;

  v_flagged := (p_intent = 'concern') or (coalesce(p_rating, 5) <= 2);

  insert into public.feedback
    (practice_id, reference, rating, recommend, service, intent, body, flagged, share_consent)
  values
    (v_practice, p_reference,
     nullif(p_rating, 0), nullif(p_recommend, 0),
     nullif(p_service, ''), p_intent, nullif(p_body, ''),
     v_flagged, coalesce(p_share_consent, false))
  returning id into v_id;

  if coalesce(p_reply_email, '') <> '' then
    insert into public.feedback_contact (feedback_id, kind, email)
    values (v_id, 'reply', p_reply_email);
  end if;

  if coalesce(p_followup, '') <> '' then
    insert into public.feedback_contact (feedback_id, kind, email)
    values (v_id, 'followup', p_followup);
  end if;

  return p_reference;
end;
$$;

-- Create a peer-support post.
create or replace function public.submit_support_post(
  p_practice_slug text,
  p_alias         text,
  p_topic         text,
  p_body          text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_practice uuid;
  v_id       uuid;
begin
  if length(coalesce(p_body, '')) = 0 then
    raise exception 'empty post';
  end if;
  if length(p_body) > 4000 then
    raise exception 'post too long';
  end if;
  select id into v_practice from public.practices where slug = p_practice_slug;

  insert into public.support_posts (practice_id, alias, topic, body)
  values (v_practice,
          coalesce(nullif(trim(p_alias), ''), 'Anonymous'),
          nullif(trim(p_topic), ''),
          p_body)
  returning id into v_id;
  return v_id;
end;
$$;

-- Reply to a post.
create or replace function public.submit_support_reply(
  p_post_id uuid,
  p_alias   text,
  p_body    text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if length(coalesce(p_body, '')) = 0 then
    raise exception 'empty reply';
  end if;
  if length(p_body) > 4000 then
    raise exception 'reply too long';
  end if;
  if not exists (select 1 from public.support_posts where id = p_post_id and status = 'visible') then
    raise exception 'post not available';
  end if;

  insert into public.support_replies (post_id, alias, body)
  values (p_post_id, coalesce(nullif(trim(p_alias), ''), 'Anonymous'), p_body)
  returning id into v_id;
  return v_id;
end;
$$;

-- Heart a post / reply (increment-only; anon cannot otherwise update).
create or replace function public.heart_post(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.support_posts set hearts = hearts + 1 where id = p_id and status = 'visible';
$$;

create or replace function public.heart_reply(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.support_replies set hearts = hearts + 1 where id = p_id and status = 'visible';
$$;

-- Report a post / reply for moderation.
create or replace function public.report_content(
  p_target_type text,
  p_target_id   uuid,
  p_reason      text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_target_type not in ('post', 'reply') then
    raise exception 'invalid target';
  end if;
  insert into public.support_reports (target_type, target_id, reason)
  values (p_target_type, p_target_id, nullif(trim(p_reason), ''));
end;
$$;

-- Public aggregates for the operator dashboard headline + board, without
-- exposing raw rows. Returns one row of counts for a practice (or whole network
-- when p_practice_slug is null).
create or replace function public.feedback_summary(p_practice_slug text default null)
returns table (
  captured      bigint,
  compliments   bigint,
  concerns      bigint,
  comments      bigint,
  open_flags    bigint,
  avg_rating    numeric,
  recommend_pct numeric
)
language sql
security definer
set search_path = public
as $$
  with scoped as (
    select f.*
    from public.feedback f
    left join public.practices p on p.id = f.practice_id
    where p_practice_slug is null or p.slug = p_practice_slug
  )
  select
    count(*)                                                        as captured,
    count(*) filter (where intent = 'compliment')                  as compliments,
    count(*) filter (where intent = 'concern')                     as concerns,
    count(*) filter (where intent = 'comment')                     as comments,
    count(*) filter (where flagged and status <> 'resolved')       as open_flags,
    round(avg(rating)::numeric, 2)                                 as avg_rating,
    round(100.0 * count(*) filter (where recommend >= 4)
          / nullif(count(*) filter (where recommend is not null), 0), 0) as recommend_pct
  from scoped;
$$;

-- Lock down + expose the write/read functions to the right roles.
revoke all on function public.submit_feedback(text,text,int,int,text,text,text,boolean,text,text) from public;
grant execute on function public.submit_feedback(text,text,int,int,text,text,text,boolean,text,text) to anon, authenticated;

grant execute on function public.submit_support_post(text,text,text,text) to anon, authenticated;
grant execute on function public.submit_support_reply(uuid,text,text)      to anon, authenticated;
grant execute on function public.heart_post(uuid)                          to anon, authenticated;
grant execute on function public.heart_reply(uuid)                         to anon, authenticated;
grant execute on function public.report_content(text,uuid,text)            to anon, authenticated;
grant execute on function public.feedback_summary(text)                    to anon, authenticated;
