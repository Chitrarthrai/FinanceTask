-- Add Settings Fields to Profiles

alter table public.profiles
add column if not exists avatar_url text,
add column if not exists preferences jsonb default '{}'::jsonb;
