-- LAHMY Official Website — Supabase schema
-- 1) Create the Supabase project, then run this SQL in SQL Editor.
-- 2) Create the LAHMY administrator in Authentication > Users.
-- 3) Replace the email below with the exact admin email and run the INSERT at the bottom.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  release_type text not null default 'single' check (release_type in ('single','album','mixtape')),
  description text not null default '',
  genre text not null default '',
  release_date date,
  audio_path text not null,
  cover_path text,
  track_number integer not null default 1,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.media_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('photo','video','news','event')),
  title text not null,
  description text not null default '',
  media_url text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.track_events (
  id bigint generated always as identity primary key,
  release_id uuid references public.releases(id) on delete cascade,
  event_type text not null check (event_type in ('play','download')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.releases enable row level security;
alter table public.site_content enable row level security;
alter table public.media_posts enable row level security;
alter table public.track_events enable row level security;

create or replace function public.is_lahmy_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()); $$;

drop policy if exists "admin list self" on public.admin_users;
create policy "admin list self" on public.admin_users for select to authenticated using (user_id = auth.uid());
drop policy if exists "public read published releases" on public.releases;
create policy "public read published releases" on public.releases for select to anon, authenticated using (published = true or public.is_lahmy_admin());
drop policy if exists "admin manage releases" on public.releases;
create policy "admin manage releases" on public.releases for all to authenticated using (public.is_lahmy_admin()) with check (public.is_lahmy_admin());
drop policy if exists "public read site content" on public.site_content;
create policy "public read site content" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "admin manage site content" on public.site_content;
create policy "admin manage site content" on public.site_content for all to authenticated using (public.is_lahmy_admin()) with check (public.is_lahmy_admin());
drop policy if exists "public read published media" on public.media_posts;
create policy "public read published media" on public.media_posts for select to anon, authenticated using (published = true or public.is_lahmy_admin());
drop policy if exists "admin manage media" on public.media_posts;
create policy "admin manage media" on public.media_posts for all to authenticated using (public.is_lahmy_admin()) with check (public.is_lahmy_admin());
drop policy if exists "admin read track events" on public.track_events;
create policy "admin read track events" on public.track_events for select to authenticated using (public.is_lahmy_admin());
drop policy if exists "public record track events" on public.track_events;
create policy "public record track events" on public.track_events for insert to anon, authenticated with check (event_type in ('play','download'));

-- Create the storage buckets from Storage > New bucket, named:
-- lahmy-audio (public), lahmy-covers (public), lahmy-media (public).
-- Then apply the storage policies below.
drop policy if exists "public read lahmy assets" on storage.objects;
create policy "public read lahmy assets" on storage.objects for select to anon, authenticated
using (bucket_id in ('lahmy-audio','lahmy-covers','lahmy-media'));
drop policy if exists "admin upload lahmy assets" on storage.objects;
create policy "admin upload lahmy assets" on storage.objects for insert to authenticated
with check (bucket_id in ('lahmy-audio','lahmy-covers','lahmy-media') and public.is_lahmy_admin());
drop policy if exists "admin update lahmy assets" on storage.objects;
create policy "admin update lahmy assets" on storage.objects for update to authenticated
using (bucket_id in ('lahmy-audio','lahmy-covers','lahmy-media') and public.is_lahmy_admin())
with check (bucket_id in ('lahmy-audio','lahmy-covers','lahmy-media') and public.is_lahmy_admin());
drop policy if exists "admin delete lahmy assets" on storage.objects;
create policy "admin delete lahmy assets" on storage.objects for delete to authenticated
using (bucket_id in ('lahmy-audio','lahmy-covers','lahmy-media') and public.is_lahmy_admin());

-- After creating the LAHMY user in Authentication, add them as admin:
-- insert into public.admin_users(user_id,email)
-- select id, email from auth.users where email = 'lahmymusic@gmail.com'
-- on conflict (user_id) do nothing;
