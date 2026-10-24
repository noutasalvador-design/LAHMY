-- LAHMY — Schéma de production Neon PostgreSQL
-- Exécuter une fois dans Neon SQL Editor avant d'utiliser /admin.html.
create extension if not exists pgcrypto;

create table if not exists releases (
  id uuid primary key default gen_random_uuid(),
  title varchar(140) not null,
  release_type varchar(20) not null default 'single' check (release_type in ('single','album','mixtape')),
  description text not null default '',
  genre varchar(100) not null default '',
  release_date date,
  audio_url text not null,
  cover_url text,
  track_number integer not null default 1 check (track_number > 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists track_events (
  id bigint generated always as identity primary key,
  release_id uuid references releases(id) on delete set null,
  event_type varchar(20) not null check (event_type in ('play','download')),
  created_at timestamptz not null default now()
);
create table if not exists site_content (
  key varchar(100) primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
create table if not exists media_posts (
  id uuid primary key default gen_random_uuid(),
  kind varchar(20) not null check (kind in ('photo','video','news','event')),
  title varchar(180) not null,
  description text not null default '',
  media_url text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists releases_public_order_idx on releases(published, track_number);
create index if not exists track_events_created_idx on track_events(created_at);
create index if not exists track_events_release_idx on track_events(release_id,event_type);

-- Create a bcrypt hash locally or in a trusted password manager workflow, then set it
-- as Vercel environment variable ADMIN_PASSWORD_HASH. Never store the password in Git.
