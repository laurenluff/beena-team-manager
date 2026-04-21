create table if not exists public.players (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  number text default '',
  position text default 'Utility',
  status text default 'Available',
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.attendance (
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  round integer not null check (round between 1 and 16),
  session text not null check (session in ('monday', 'thursday', 'game')),
  created_at timestamptz default now(),
  primary key (user_id, player_id, round, session)
);

alter table public.players enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "Users can read their players" on public.players;
drop policy if exists "Users can insert their players" on public.players;
drop policy if exists "Users can update their players" on public.players;
drop policy if exists "Users can delete their players" on public.players;

create policy "Users can read their players"
  on public.players for select
  using (auth.uid() = user_id);

create policy "Users can insert their players"
  on public.players for insert
  with check (auth.uid() = user_id);

create policy "Users can update their players"
  on public.players for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their players"
  on public.players for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their attendance" on public.attendance;
drop policy if exists "Users can insert their attendance" on public.attendance;
drop policy if exists "Users can update their attendance" on public.attendance;
drop policy if exists "Users can delete their attendance" on public.attendance;

create policy "Users can read their attendance"
  on public.attendance for select
  using (auth.uid() = user_id);

create policy "Users can insert their attendance"
  on public.attendance for insert
  with check (auth.uid() = user_id);

create policy "Users can update their attendance"
  on public.attendance for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their attendance"
  on public.attendance for delete
  using (auth.uid() = user_id);
