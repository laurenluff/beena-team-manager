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

alter table public.fixtures enable row level security;

drop policy if exists "Members can read fixtures" on public.fixtures;
drop policy if exists "Members can insert fixtures" on public.fixtures;
drop policy if exists "Members can update fixtures" on public.fixtures;
drop policy if exists "Members can delete fixtures" on public.fixtures;

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
