-- VARKONIS profile table bootstrap for Supabase
-- Run this in Supabase SQL Editor for the project used by auth pages.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  firm text not null default '',
  team_size text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_email" on public.profiles;
create policy "profiles_select_own_email"
on public.profiles
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "profiles_insert_own_email" on public.profiles;
create policy "profiles_insert_own_email"
on public.profiles
for insert
to authenticated
with check (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "profiles_update_own_email" on public.profiles;
create policy "profiles_update_own_email"
on public.profiles
for update
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'))
with check (lower(email) = lower(auth.jwt() ->> 'email'));
