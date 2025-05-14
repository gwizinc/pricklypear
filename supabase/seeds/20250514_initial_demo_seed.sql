begin;

-- 1) House-keeping
create extension if not exists pgcrypto;

-- 2) Helper – create one auth user + identity + profile in one shot
create or replace function public._demo_create_user(
  in_email       text,
  in_full_name   text,
  in_password    text default 'DemoPass1!'
) returns uuid
language plpgsql
security definer set search_path = public, auth
as $$
declare
  new_uid uuid;
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user,
    created_at,
    updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    in_email,
    crypt(in_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', in_full_name),
    '', '', '',
    false,
    now(),
    now()
  ) returning id into new_uid;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
  ) values (
    gen_random_uuid(),
    new_uid,
    jsonb_build_object('sub', new_uid::text, 'email', in_email),
    'email',
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, name, message_tone)
  values (new_uid, in_full_name, 'friendly');

  return new_uid;
end;
$$;

-- 3) Demo users
with created as (
  select public._demo_create_user('alice@example.com',   'Alice Wonderland')
  union all
  select public._demo_create_user('bob@example.com',     'Bob Builder')
  union all
  select public._demo_create_user('charlie@example.com', 'Charlie Chaplin')
  union all
  select public._demo_create_user('dana@example.com',    'Dana Scully')
)
select 1;

-- 4) Threads & Participants together
-- Thread 1
with t1 as (
  insert into public.threads (id, title, created_at, owner_id, status, summary, topic)
  values (
    '11111111-1111-1111-1111-111111111111',
    'Spring Break Travel Plans 🌴🏖️',
    '2024-03-01T10:00:00Z',
    (select id from public.profiles where name = 'Alice Wonderland'),
    'open',
    null,
    'travel'
  )
  returning id
)
insert into public.thread_participants (thread_id, profile_id)
select
  (select id from t1),
  p.id
from public.profiles p
where p.name in ('Alice Wonderland','Bob Builder','Charlie Chaplin');

-- Thread 2
with t2 as (
  insert into public.threads (id, title, created_at, owner_id, status, summary, topic)
  values (
    '22222222-2222-2222-2222-222222222222',
    'Monthly Child-Care Expense Report – March 2024',
    '2024-03-05T14:30:00Z',
    (select id from public.profiles where name = 'Bob Builder'),
    'open',
    null,
    'expense'
  )
  returning id
)
insert into public.thread_participants (thread_id, profile_id)
select
  (select id from t2),
  p.id
from public.profiles p
where p.name in ('Bob Builder','Alice Wonderland');

-- Thread 3
with t3 as (
  insert into public.threads (id, title, created_at, owner_id, status, summary, topic)
  values (
    '33333333-3333-3333-3333-333333333333',
    '🏥 Post-Surgery Recovery & Follow-up Schedule',
    '2023-11-21T08:15:00Z',
    (select id from public.profiles where name = 'Charlie Chaplin'),
    'closed',
    null,
    'health'
  )
  returning id
)
insert into public.thread_participants (thread_id, profile_id)
select
  (select id from t3),
  p.id
from public.profiles p
where p.name in (
  'Charlie Chaplin','Bob Builder','Dana Scully','Alice Wonderland'
);

-- Thread 4
with t4 as (
  insert into public.threads (id, title, created_at, owner_id, status, summary, topic)
  values (
    '44444444-4444-4444-4444-444444444444',
    'Educational Resources for Advanced Calculus (AP Exam Prep)',
    '2024-01-10T18:45:00Z',
    (select id from public.profiles where name = 'Dana Scully'),
    'open',
    null,
    'education'
  )
  returning id
)
insert into public.thread_participants (thread_id, profile_id)
select
  (select id from t4),
  p.id
from public.profiles p
where p.name in ('Dana Scully','Charlie Chaplin');

-- Thread 5
with t5 as (
  insert into public.threads (id, title, created_at, owner_id, status, summary, topic)
  values (
    '55555555-5555-5555-5555-555555555555',
    '⚖️ Requesting Modification to Existing Legal Agreement',
    '2022-07-15T12:00:00Z',
    (select id from public.profiles where name = 'Alice Wonderland'),
    'closed',
    null,
    'legal'
  )
  returning id
)
insert into public.thread_participants (thread_id, profile_id)
select
  (select id from t5),
  p.id
from public.profiles p
where p.name in ('Alice Wonderland','Dana Scully');

commit;

-- 5) Clean-up helper
drop function if exists public._demo_create_user(text, text, text);