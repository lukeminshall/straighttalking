-- Seed data for Straight Talking. Safe to run on an empty project.
-- One demo practice, some board content, and a couple of peer-support threads.

insert into public.practices (slug, name, town, google_review_url, status)
values ('sussex-imaging', 'Sussex Imaging', 'Haywards Heath',
        'https://search.google.com/local/writereview?placeid=DEMO', 'active')
on conflict (slug) do nothing;

insert into public.you_said_we_did (practice_id, said, did)
select p.id, v.said, v.did
from public.practices p,
  (values
    ('Parking felt confusing on arrival.',
     'New signage from the car park and a map added to your appointment letter.'),
    ('I waited without any update on time.',
     'Reception now gives a wait-time update every 15 minutes.'),
    ('Changing felt a little exposing.',
     'Private changing and warmer gowns added in every room.'),
    ('My report felt slow to arrive.',
     'Same-week reporting introduced for routine scans.')
  ) as v(said, did)
where p.slug = 'sussex-imaging';

-- A few consented, published voices for the board + public reads.
insert into public.feedback (practice_id, reference, rating, recommend, service, intent, body, share_consent, published)
select p.id, v.reference, v.rating, v.recommend, v.service, v.intent, v.body, true, true
from public.practices p,
  (values
    ('ST-SEED-01', 5, 5, 'MRI',        'compliment', 'The radiographer explained every step and completely settled my nerves.'),
    ('ST-SEED-02', 5, 5, 'X-ray',      'compliment', 'Booked, scanned and out within half an hour. Genuinely lovely team.'),
    ('ST-SEED-03', 5, 4, 'Ultrasound', 'compliment', 'Reception was so warm it made an anxious morning feel easy.'),
    ('ST-SEED-04', 4, 4, 'DEXA',       'comment',    'Quick, kind, and clear about exactly what happens next.')
  ) as v(reference, rating, recommend, service, intent, body)
where p.slug = 'sussex-imaging';

-- Peer-support: a couple of opening posts with a supportive reply.
with p as (select id from public.practices where slug = 'sussex-imaging')
insert into public.support_posts (practice_id, alias, topic, body, hearts)
select p.id, v.alias, v.topic, v.body, v.hearts
from p, (values
  ('Jan', 'Before your scan', 'First MRI next week and I''m really nervous about the noise. Any tips from people who''ve been through it?', 6),
  ('Marked', 'Waiting on results', 'The wait for results is the hardest part. How did everyone cope with the in-between?', 4)
) as v(alias, topic, body, hearts);

with post as (
  select id from public.support_posts where topic = 'Before your scan' limit 1
)
insert into public.support_replies (post_id, alias, body, hearts)
select post.id, v.alias, v.body, v.hearts
from post, (values
  ('Row', 'Ask for headphones with music — mine let me pick a station. The first two minutes are the loudest, then you settle. You''ve got this.', 3),
  ('Pat', 'I closed my eyes before going in and kept them closed the whole time. Honestly over before I knew it.', 2)
) as v(alias, body, hearts);
