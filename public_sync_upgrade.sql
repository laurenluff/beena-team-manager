-- Removes login requirements for the Beena Team Manager cloud sync.
-- Anyone with the live URL will be able to read and edit the shared team data.

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
