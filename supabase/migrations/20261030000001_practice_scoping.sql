-- ===========================================================================
-- Per-practice data separation
--
-- Before this migration every authenticated user could read and moderate every
-- practice's feedback, reply contacts, peer-support content and orders. That is
-- acceptable with one customer and not with many. From here on:
--
--   * an operator sees only the practices they are a member of;
--   * platform admins (Minshall Group) see everything;
--   * a signed-in user with no membership sees nothing;
--   * anonymous patients and kiosks keep exactly the access they had.
--
-- Operators are identified by their Clerk user id, which Clerk's native Supabase
-- integration puts in the JWT `sub` claim. Membership is granted by an invite
-- (practice + email), created by the Stripe webhook at sign-up or by an admin,
-- and claimed on first sign-in via claim_practice_invites(). Claiming needs the
-- operator's email in the session token: in Clerk, Sessions > Customize session
-- token, add  { "email": "{{user.primary_email_address}}" }.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.platform_admins (
  user_id    text primary key,                      -- Clerk user id (JWT sub)
  email      text,
  created_at timestamptz not null default now()
);

create table public.practice_members (
  practice_id uuid not null references public.practices(id) on delete cascade,
  user_id     text not null,                        -- Clerk user id (JWT sub)
  email       text,
  role        text not null default 'staff' check (role in ('owner', 'staff')),
  created_at  timestamptz not null default now(),
  primary key (practice_id, user_id)
);
create index practice_members_user_idx on public.practice_members (user_id);

create table public.practice_invites (
  id          uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  email       text not null,
  role        text not null default 'owner' check (role in ('owner', 'staff')),
  claimed_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (practice_id, email)
);
create index practice_invites_email_idx on public.practice_invites (lower(email)) where claimed_at is null;

alter table public.platform_admins  enable row level security;
alter table public.practice_members enable row level security;
alter table public.practice_invites enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so policies can call them without recursion)
-- ---------------------------------------------------------------------------
create or replace function public.current_user_id()
returns text language sql stable
as $$ select nullif(auth.jwt() ->> 'sub', '') $$;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.platform_admins a where a.user_id = public.current_user_id())
$$;

-- True for admins, or for members of the given practice. A null practice (feedback
-- that arrived on an unknown slug) is visible to admins only.
create or replace function public.is_practice_member(p_practice uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.is_platform_admin()
      or (p_practice is not null and exists (
            select 1 from public.practice_members m
            where m.practice_id = p_practice and m.user_id = public.current_user_id()))
$$;

create or replace function public.is_practice_owner(p_practice uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.is_platform_admin()
      or exists (
            select 1 from public.practice_members m
            where m.practice_id = p_practice and m.user_id = public.current_user_id() and m.role = 'owner')
$$;

-- Claim any open invites for the signed-in operator's email. Returns the number
-- of practices joined. Safe to call on every sign-in.
create or replace function public.claim_practice_invites()
returns integer language plpgsql security definer set search_path = public
as $$
declare
  v_user  text := public.current_user_id();
  v_email text := lower(nullif(auth.jwt() ->> 'email', ''));
  v_count integer := 0;
begin
  if v_user is null or v_email is null then
    return 0;
  end if;

  insert into public.practice_members (practice_id, user_id, email, role)
  select i.practice_id, v_user, v_email, i.role
  from public.practice_invites i
  where lower(i.email) = v_email and i.claimed_at is null
  on conflict (practice_id, user_id) do nothing;
  get diagnostics v_count = row_count;

  update public.practice_invites
     set claimed_at = now()
   where lower(email) = v_email and claimed_at is null;

  return v_count;
end;
$$;

revoke all on function public.claim_practice_invites() from public;
grant execute on function public.claim_practice_invites() to authenticated;
grant execute on function public.is_practice_member(uuid) to anon, authenticated;
grant execute on function public.is_practice_owner(uuid)  to anon, authenticated;
grant execute on function public.is_platform_admin()      to anon, authenticated;
grant execute on function public.current_user_id()        to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Policies on the new tables
-- ---------------------------------------------------------------------------
create policy admins_read_self on public.platform_admins
  for select to authenticated using (user_id = public.current_user_id());

create policy members_read on public.practice_members
  for select to authenticated using (user_id = public.current_user_id() or public.is_practice_member(practice_id));
create policy members_manage on public.practice_members
  for all to authenticated using (public.is_practice_owner(practice_id)) with check (public.is_practice_owner(practice_id));

create policy invites_read on public.practice_invites
  for select to authenticated using (public.is_practice_owner(practice_id));
create policy invites_manage on public.practice_invites
  for all to authenticated using (public.is_practice_owner(practice_id)) with check (public.is_practice_owner(practice_id));

-- ---------------------------------------------------------------------------
-- Replace the open "any authenticated user" policies with practice-scoped ones
-- ---------------------------------------------------------------------------

-- Practices: the public directory stays readable; only owners edit their own,
-- only admins create or delete (sign-ups are created by the service role).
drop policy if exists practices_write_auth on public.practices;
create policy practices_update_owner on public.practices
  for update to authenticated using (public.is_practice_owner(id)) with check (public.is_practice_owner(id));
create policy practices_insert_admin on public.practices
  for insert to authenticated with check (public.is_platform_admin());
create policy practices_delete_admin on public.practices
  for delete to authenticated using (public.is_platform_admin());

-- Feedback.
drop policy if exists feedback_read_auth   on public.feedback;
drop policy if exists feedback_update_auth on public.feedback;
create policy feedback_read_member on public.feedback
  for select to authenticated using (public.is_practice_member(practice_id) or (published and share_consent));
create policy feedback_update_member on public.feedback
  for update to authenticated using (public.is_practice_member(practice_id)) with check (public.is_practice_member(practice_id));

-- Reply / follow-up contacts: only the practice the feedback belongs to.
drop policy if exists feedback_contact_read_auth on public.feedback_contact;
create policy feedback_contact_read_member on public.feedback_contact
  for select to authenticated using (
    exists (select 1 from public.feedback f
            where f.id = feedback_contact.feedback_id and public.is_practice_member(f.practice_id)));

-- You said, we did.
drop policy if exists ysd_read_auth  on public.you_said_we_did;
drop policy if exists ysd_write_auth on public.you_said_we_did;
create policy ysd_read_member on public.you_said_we_did
  for select to authenticated using (published or public.is_practice_member(practice_id));
create policy ysd_write_member on public.you_said_we_did
  for all to authenticated using (public.is_practice_member(practice_id)) with check (public.is_practice_member(practice_id));

-- Peer support posts.
drop policy if exists posts_read_auth     on public.support_posts;
drop policy if exists posts_moderate_auth on public.support_posts;
drop policy if exists posts_delete_auth   on public.support_posts;
create policy posts_read_member on public.support_posts
  for select to authenticated using (status = 'visible' or public.is_practice_member(practice_id));
create policy posts_moderate_member on public.support_posts
  for update to authenticated using (public.is_practice_member(practice_id)) with check (public.is_practice_member(practice_id));
create policy posts_delete_member on public.support_posts
  for delete to authenticated using (public.is_practice_member(practice_id));

-- Peer support replies (scoped through their post).
drop policy if exists replies_read_auth     on public.support_replies;
drop policy if exists replies_moderate_auth on public.support_replies;
drop policy if exists replies_delete_auth   on public.support_replies;
create policy replies_read_member on public.support_replies
  for select to authenticated using (
    status = 'visible' or exists (select 1 from public.support_posts p
                                  where p.id = support_replies.post_id and public.is_practice_member(p.practice_id)));
create policy replies_moderate_member on public.support_replies
  for update to authenticated using (
    exists (select 1 from public.support_posts p
            where p.id = support_replies.post_id and public.is_practice_member(p.practice_id)))
  with check (
    exists (select 1 from public.support_posts p
            where p.id = support_replies.post_id and public.is_practice_member(p.practice_id)));
create policy replies_delete_member on public.support_replies
  for delete to authenticated using (
    exists (select 1 from public.support_posts p
            where p.id = support_replies.post_id and public.is_practice_member(p.practice_id)));

-- Reports (scoped through the reported post or reply).
create or replace function public.report_practice(p_type text, p_target uuid)
returns uuid language sql stable security definer set search_path = public
as $$
  select case
    when p_type = 'post'  then (select practice_id from public.support_posts where id = p_target)
    when p_type = 'reply' then (select p.practice_id from public.support_replies r
                                join public.support_posts p on p.id = r.post_id where r.id = p_target)
  end
$$;
grant execute on function public.report_practice(text, uuid) to authenticated;

drop policy if exists reports_read_auth   on public.support_reports;
drop policy if exists reports_update_auth on public.support_reports;
create policy reports_read_member on public.support_reports
  for select to authenticated using (public.is_practice_member(public.report_practice(target_type, target_id)));
create policy reports_update_member on public.support_reports
  for update to authenticated using (public.is_practice_member(public.report_practice(target_type, target_id)))
  with check (public.is_practice_member(public.report_practice(target_type, target_id)));

-- Orders.
drop policy if exists orders_read_auth on public.orders;
create policy orders_read_member on public.orders
  for select to authenticated using (public.is_practice_member(practice_id));

-- ---------------------------------------------------------------------------
-- Dashboard summary: a named practice stays public (it feeds the waiting-room
-- board), but the all-practices view is limited to the caller's own practices,
-- or the whole network for admins.
-- ---------------------------------------------------------------------------
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
    where (p_practice_slug is not null and p.slug = p_practice_slug)
       or (p_practice_slug is null and public.is_practice_member(f.practice_id))
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
grant execute on function public.feedback_summary(text) to anon, authenticated;
