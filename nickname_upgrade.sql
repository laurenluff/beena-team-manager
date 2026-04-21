alter table public.players
  add column if not exists nickname text default '';
