alter table public.players
  add column if not exists nickname text default '';

with duplicate_players as (
  select
    id,
    first_value(id) over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as keep_id,
    row_number() over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as row_number
  from public.players
),
duplicates as (
  select id, keep_id
  from duplicate_players
  where row_number > 1
)
delete from public.attendance attendance_row
using duplicates
where attendance_row.player_id = duplicates.id
and exists (
  select 1
  from public.attendance existing
  where existing.team_id = attendance_row.team_id
  and existing.player_id = duplicates.keep_id
  and existing.round = attendance_row.round
  and existing.session = attendance_row.session
);

with duplicate_players as (
  select
    id,
    first_value(id) over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as keep_id,
    row_number() over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as row_number
  from public.players
),
duplicates as (
  select id, keep_id
  from duplicate_players
  where row_number > 1
)
update public.attendance
set player_id = duplicates.keep_id
from duplicates
where public.attendance.player_id = duplicates.id;

with duplicate_players as (
  select
    id,
    first_value(id) over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as keep_id,
    row_number() over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as row_number
  from public.players
),
duplicates as (
  select id, keep_id
  from duplicate_players
  where row_number > 1
)
update public.lineups
set player_id = duplicates.keep_id
from duplicates
where public.lineups.player_id = duplicates.id;

with duplicate_players as (
  select
    id,
    first_value(id) over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as keep_id,
    row_number() over (
      partition by team_id, lower(btrim(name))
      order by created_at, id
    ) as row_number
  from public.players
),
duplicates as (
  select id
  from duplicate_players
  where row_number > 1
)
delete from public.players
using duplicates
where public.players.id = duplicates.id;

create unique index if not exists players_unique_team_name
  on public.players (team_id, lower(btrim(name)));
