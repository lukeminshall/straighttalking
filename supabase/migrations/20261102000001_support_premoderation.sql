-- Peer-support safeguarding: hold every post and reply for approval, and reject
-- phone numbers at the source.
--
-- Why: the support space is for patients sharing their own journey to support
-- each other — not medical/clinical advice, and not a monitored crisis service.
-- Nothing should be publicly visible until an operator has checked it, and no
-- contact details should ever land in a post.
--
-- Public reads already return only status = 'visible' rows (see the init
-- migration's posts_read_visible / replies_read_visible policies), so flipping
-- the default to 'pending' is all that's needed to keep new items hidden until
-- an operator approves them in /app/moderate.

-- 1. New posts and replies start life hidden, pending approval.
alter table public.support_posts   alter column status set default 'pending';
alter table public.support_replies alter column status set default 'pending';

-- 2. Recreate submit_support_post: reject phone numbers / long digit runs in any
--    field, and insert as 'pending' explicitly (not relying on the default).
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
  -- Strip common separators, then reject any run of 7+ digits (a phone number),
  -- across the body, chosen name and topic. Keep the space anonymous.
  if regexp_replace(coalesce(p_body, '')  , '[\s().+-]', '', 'g') ~ '\d{7,}'
  or regexp_replace(coalesce(p_alias, ''), '[\s().+-]', '', 'g') ~ '\d{7,}'
  or regexp_replace(coalesce(p_topic, ''), '[\s().+-]', '', 'g') ~ '\d{7,}' then
    raise exception 'no_contact_details';
  end if;

  select id into v_practice from public.practices where slug = p_practice_slug;

  insert into public.support_posts (practice_id, alias, topic, body, status)
  values (v_practice,
          coalesce(nullif(trim(p_alias), ''), 'Anonymous'),
          nullif(trim(p_topic), ''),
          p_body,
          'pending')
  returning id into v_id;
  return v_id;
end;
$$;

-- 3. Recreate submit_support_reply: same phone-number rejection, inserted as
--    'pending'. Replies still only attach to an already-visible (approved) post.
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
  if regexp_replace(coalesce(p_body, '') , '[\s().+-]', '', 'g') ~ '\d{7,}'
  or regexp_replace(coalesce(p_alias, ''), '[\s().+-]', '', 'g') ~ '\d{7,}' then
    raise exception 'no_contact_details';
  end if;
  if not exists (select 1 from public.support_posts where id = p_post_id and status = 'visible') then
    raise exception 'post not available';
  end if;

  insert into public.support_replies (post_id, alias, body, status)
  values (p_post_id, coalesce(nullif(trim(p_alias), ''), 'Anonymous'), p_body, 'pending')
  returning id into v_id;
  return v_id;
end;
$$;
