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

alter table public.players
  add column if not exists team_id text references public.teams(id) on delete cascade;

alter table public.players
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.players
  add column if not exists nickname text default '';

create unique index if not exists players_unique_team_name
  on public.players (team_id, lower(btrim(name)));

update public.players set team_id = 'beena' where team_id is null;

alter table public.players
  alter column team_id set not null;

alter table public.attendance
  add column if not exists team_id text references public.teams(id) on delete cascade;

alter table public.attendance
  add column if not exists user_id uuid references auth.users(id) on delete set null;

update public.attendance set team_id = 'beena' where team_id is null;

alter table public.attendance
  alter column team_id set not null;

alter table public.attendance
  drop constraint if exists attendance_pkey;

alter table public.attendance
  drop constraint if exists attendance_session_check;

alter table public.attendance
  add constraint attendance_session_check check (session in ('monday', 'thursday', 'game', 'game_unavailable'));

alter table public.attendance
  add primary key (team_id, player_id, round, session);

-- Add every email address that should access the shared team.
-- Replace these example emails with real addresses, then run the insert.
-- insert into public.team_members (team_id, email, role)
-- values
--   ('beena', 'you@example.com', 'admin'),
--   ('beena', 'helper-one@example.com', 'member'),
--   ('beena', 'helper-two@example.com', 'member')
-- on conflict (team_id, email) do update set role = excluded.role;

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.players enable row level security;
alter table public.attendance enable row level security;
alter table public.lineups enable row level security;
alter table public.fixtures enable row level security;

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

create policy "Members can read their teams"
  on public.teams for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can read team members"
  on public.team_members for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "Members can read players"
  on public.players for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = players.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can insert players"
  on public.players for insert
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = players.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can update players"
  on public.players for update
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = players.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = players.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can delete players"
  on public.players for delete
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = players.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can read attendance"
  on public.attendance for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = attendance.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can insert attendance"
  on public.attendance for insert
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = attendance.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can update attendance"
  on public.attendance for update
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = attendance.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = attendance.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can delete attendance"
  on public.attendance for delete
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = attendance.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can read lineups"
  on public.lineups for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = lineups.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can insert lineups"
  on public.lineups for insert
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = lineups.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can update lineups"
  on public.lineups for update
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = lineups.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = lineups.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can delete lineups"
  on public.lineups for delete
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = lineups.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can read fixtures"
  on public.fixtures for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = fixtures.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can insert fixtures"
  on public.fixtures for insert
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = fixtures.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can update fixtures"
  on public.fixtures for update
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = fixtures.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = fixtures.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Members can delete fixtures"
  on public.fixtures for delete
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = fixtures.team_id
      and lower(team_members.email) = lower(auth.jwt() ->> 'email')
    )
  );
