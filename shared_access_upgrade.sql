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

insert into public.teams (id, name)
values ('beena', 'Murrumbeena Lions')
on conflict (id) do update set name = excluded.name;

alter table public.players
  add column if not exists team_id text references public.teams(id) on delete cascade;

alter table public.players
  add column if not exists user_id uuid references auth.users(id) on delete set null;

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
  add primary key (team_id, player_id, round, session);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.players enable row level security;
alter table public.attendance enable row level security;

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
