alter table public.attendance
  drop constraint if exists attendance_session_check;

alter table public.attendance
  add constraint attendance_session_check check (session in ('monday', 'thursday', 'game', 'game_unavailable'));
