-- Create apps table and RLS policies for Supabase
-- Run this in the Supabase SQL Editor for your project.

-- Enable required extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- Table
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  html text default '' not null,
  css text default '' not null,
  js text default '' not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists apps_user_id_idx on public.apps(user_id);
create index if not exists apps_created_at_idx on public.apps(created_at desc);

-- Update updated_at on row update
create or replace function public.set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.apps;
create trigger set_timestamp
before update on public.apps
for each row
execute function public.set_timestamp();

-- RLS
alter table public.apps enable row level security;

-- Policies
drop policy if exists "Users can view own apps" on public.apps;
create policy "Users can view own apps"
  on public.apps for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own apps" on public.apps;
create policy "Users can insert own apps"
  on public.apps for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own apps" on public.apps;
create policy "Users can update own apps"
  on public.apps for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own apps" on public.apps;
create policy "Users can delete own apps"
  on public.apps for delete
  using (auth.uid() = user_id);

-- Optional: ensure name is not empty and trimmed
alter table public.apps
  add constraint apps_name_nonempty check (length(btrim(name)) > 0);

