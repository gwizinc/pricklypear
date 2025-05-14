-- Adds an emoji avatar column to user profiles (idempotent)
alter table public.profiles
add column if not exists profile_emoji text;
