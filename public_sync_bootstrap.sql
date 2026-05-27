create table if not exists public.teams (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.team_members (
  team_id text not null references public.teams(id) on delete cascade,
  email text not null,
  role text default 'member',
  created_at timestamptz default now(),
  primary key (team_id, email)
);

create table if not exists public.players (
  id uuid primary key,
  team_id text not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  nickname text default '',
  number text default '',
  position text default 'Utility',
  status text default 'Available',
  notes text default '',
  created_at timestamptz default now()
);

create unique index if not exists players_unique_team_name
  on public.players (team_id, lower(btrim(name)));

create table if not exists public.attendance (
  team_id text not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  player_id uuid not null references public.players(id) on delete cascade,
  round integer not null check (round between 1 and 16),
  session text not null check (session in ('monday', 'thursday', 'game', 'game_unavailable')),
  created_at timestamptz default now(),
  primary key (team_id, player_id, round, session)
);

create table if not exists public.lineups (
  team_id text not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  round integer not null check (round between 1 and 16),
  spot_id text not null,
  player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (team_id, round, spot_id)
);

create table if not exists public.fixtures (
  id text primary key,
  team_id text not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  round text default '',
  date date not null,
  time time,
  team text not null,
  opponent text not null,
  venue text not null,
  notes text default '',
  created_at timestamptz default now()
);

insert into public.teams (id, name)
values ('beena', 'Murrumbeena Lions')
on conflict (id) do update set name = excluded.name;

alter table public.players alter column user_id drop not null;
alter table public.attendance alter column user_id drop not null;
alter table public.lineups alter column user_id drop not null;
alter table public.fixtures alter column user_id drop not null;

alter table public.teams enable row level security;
alter table public.team_members disable row level security;
alter table public.players disable row level security;
alter table public.attendance disable row level security;
alter table public.lineups disable row level security;
alter table public.fixtures disable row level security;

drop policy if exists "Members can read their teams" on public.teams;
drop policy if exists "Members can read team members" on public.team_members;
drop policy if exists "Members can read players" on public.players;
drop policy if exists "Members can insert players" on public.players;
drop policy if exists "Members can update players" on public.players;
drop policy if exists "Members can delete players" on public.players;
drop policy if exists "Members can read attendance" on public.attendance;
drop policy if exists "Members can insert attendance" on public.attendance;
drop policy if exists "Members can update attendance" on public.attendance;
drop policy if exists "Members can delete attendance" on public.attendance;
drop policy if exists "Members can read lineups" on public.lineups;
drop policy if exists "Members can insert lineups" on public.lineups;
drop policy if exists "Members can update lineups" on public.lineups;
drop policy if exists "Members can delete lineups" on public.lineups;
drop policy if exists "Members can read fixtures" on public.fixtures;
drop policy if exists "Members can insert fixtures" on public.fixtures;
drop policy if exists "Members can update fixtures" on public.fixtures;
drop policy if exists "Members can delete fixtures" on public.fixtures;
drop policy if exists "Public can read players" on public.players;
drop policy if exists "Public can insert players" on public.players;
drop policy if exists "Public can update players" on public.players;
drop policy if exists "Public can delete players" on public.players;
drop policy if exists "Public can read attendance" on public.attendance;
drop policy if exists "Public can insert attendance" on public.attendance;
drop policy if exists "Public can update attendance" on public.attendance;
drop policy if exists "Public can delete attendance" on public.attendance;
drop policy if exists "Public can read lineups" on public.lineups;
drop policy if exists "Public can insert lineups" on public.lineups;
drop policy if exists "Public can update lineups" on public.lineups;
drop policy if exists "Public can delete lineups" on public.lineups;
drop policy if exists "Public can read fixtures" on public.fixtures;
drop policy if exists "Public can insert fixtures" on public.fixtures;
drop policy if exists "Public can update fixtures" on public.fixtures;
drop policy if exists "Public can delete fixtures" on public.fixtures;

create policy "Public can read players"
  on public.players for select
  to anon, authenticated
  using (team_id = 'beena');

create policy "Public can insert players"
  on public.players for insert
  to anon, authenticated
  with check (team_id = 'beena');

create policy "Public can update players"
  on public.players for update
  to anon, authenticated
  using (team_id = 'beena')
  with check (team_id = 'beena');

create policy "Public can delete players"
  on public.players for delete
  to anon, authenticated
  using (team_id = 'beena');

create policy "Public can read attendance"
  on public.attendance for select
  to anon, authenticated
  using (team_id = 'beena');

create policy "Public can insert attendance"
  on public.attendance for insert
  to anon, authenticated
  with check (team_id = 'beena');

create policy "Public can update attendance"
  on public.attendance for update
  to anon, authenticated
  using (team_id = 'beena')
  with check (team_id = 'beena');

create policy "Public can delete attendance"
  on public.attendance for delete
  to anon, authenticated
  using (team_id = 'beena');

create policy "Public can read lineups"
  on public.lineups for select
  to anon, authenticated
  using (team_id = 'beena');

create policy "Public can insert lineups"
  on public.lineups for insert
  to anon, authenticated
  with check (team_id = 'beena');

create policy "Public can update lineups"
  on public.lineups for update
  to anon, authenticated
  using (team_id = 'beena')
  with check (team_id = 'beena');

create policy "Public can delete lineups"
  on public.lineups for delete
  to anon, authenticated
  using (team_id = 'beena');

create policy "Public can read fixtures"
  on public.fixtures for select
  to anon, authenticated
  using (team_id = 'beena');

create policy "Public can insert fixtures"
  on public.fixtures for insert
  to anon, authenticated
  with check (team_id = 'beena');

create policy "Public can update fixtures"
  on public.fixtures for update
  to anon, authenticated
  using (team_id = 'beena')
  with check (team_id = 'beena');

create policy "Public can delete fixtures"
  on public.fixtures for delete
  to anon, authenticated
  using (team_id = 'beena');

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.players to anon, authenticated;
grant select, insert, update, delete on public.attendance to anon, authenticated;
grant select, insert, update, delete on public.lineups to anon, authenticated;
grant select, insert, update, delete on public.fixtures to anon, authenticated;
