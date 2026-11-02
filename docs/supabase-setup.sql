-- Mastery: one saved copy of each person's app data, readable and writable only by that person.
create table if not exists public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at bigint not null,
  created_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "Read my own data" on public.app_state
  for select using (auth.uid() = user_id);

create policy "Save my own data" on public.app_state
  for insert with check (auth.uid() = user_id);

create policy "Update my own data" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
