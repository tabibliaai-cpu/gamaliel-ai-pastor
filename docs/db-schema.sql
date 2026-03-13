-- =============================================================
-- Gamaliel AI Pastor - Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------
-- TABLE: users
-- Stores public profile info for each authenticated user.
-- Synced from auth.users via the trigger below.
-- ---------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  tier text not null default 'free' check (tier in ('free', 'paid')),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create user record when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- TABLE: usage_logs
-- Tracks every message sent by a user for rate-limiting.
-- ---------------------------------------------------------------
create table if not exists public.usage_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  message_preview text,         -- first 100 chars of the user message
  language_code text default 'en',
  created_at timestamptz not null default now()
);

-- Index for fast per-user daily count queries
create index if not exists usage_logs_user_date_idx
  on public.usage_logs (user_id, created_at);

-- ---------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Users can only see their own data.
-- ---------------------------------------------------------------
alter table public.users enable row level security;
alter table public.usage_logs enable row level security;

-- Users table policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Usage logs policies
create policy "Users can view their own usage"
  on public.usage_logs for select
  using (auth.uid() = user_id);

-- Service role (admin) can read/write everything (used by API routes)
-- This is automatically granted to the service_role key in Supabase.

-- ---------------------------------------------------------------
-- HELPFUL VIEWS
-- ---------------------------------------------------------------

-- Daily usage summary per user
create or replace view public.daily_usage_summary as
select
  u.id as user_id,
  u.email,
  u.tier,
  date_trunc('day', l.created_at) as usage_date,
  count(l.id) as message_count
from public.users u
left join public.usage_logs l on u.id = l.user_id
group by u.id, u.email, u.tier, date_trunc('day', l.created_at);

-- ---------------------------------------------------------------
-- SAMPLE DATA (optional - remove before production)
-- ---------------------------------------------------------------
-- INSERT INTO public.users (id, email, full_name, tier)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'free');
