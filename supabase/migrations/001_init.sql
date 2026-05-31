-- =====================================================================
-- Suivi de révision du Coran — schéma initial
-- 3 tables : profiles, daily_logs, learning_state
-- + trigger de création de profil + RLS
-- =====================================================================

-- Rôles
create type user_role as enum ('prof', 'eleve');

-- Profils (1 ligne par utilisateur auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role user_role not null default 'eleve',
  created_at timestamptz not null default now()
);

-- Journal de révision quotidien
create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  eleve_id uuid not null references profiles(id) on delete cascade,
  log_date date not null default current_date,
  surah_from int not null check (surah_from between 1 and 114),
  surah_to   int not null check (surah_to   between 1 and 114),
  note text,
  created_at timestamptz not null default now()
);
create index daily_logs_eleve_date_idx on daily_logs (eleve_id, log_date);

-- Sourates connues (présence = connue)
create table learning_state (
  eleve_id uuid not null references profiles(id) on delete cascade,
  surah_id int not null check (surah_id between 1 and 114),
  created_at timestamptz not null default now(),
  primary key (eleve_id, surah_id)
);

-- ---------------------------------------------------------------------
-- Trigger : création automatique du profil à l'inscription
-- ---------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'eleve');
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table profiles       enable row level security;
alter table daily_logs     enable row level security;
alter table learning_state enable row level security;

-- Helper anti-récursion : l'utilisateur courant est-il prof ?
create or replace function is_prof()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'prof');
$$;

-- profiles
create policy "profiles_select_self_or_prof" on profiles
  for select using (id = auth.uid() or is_prof());
create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

-- daily_logs : l'élève gère les siens, le prof lit tout
create policy "logs_select_self_or_prof" on daily_logs
  for select using (eleve_id = auth.uid() or is_prof());
create policy "logs_insert_self" on daily_logs
  for insert with check (eleve_id = auth.uid());
create policy "logs_update_self" on daily_logs
  for update using (eleve_id = auth.uid());
create policy "logs_delete_self" on daily_logs
  for delete using (eleve_id = auth.uid());

-- learning_state : idem
create policy "learn_select_self_or_prof" on learning_state
  for select using (eleve_id = auth.uid() or is_prof());
create policy "learn_insert_self" on learning_state
  for insert with check (eleve_id = auth.uid());
create policy "learn_delete_self" on learning_state
  for delete using (eleve_id = auth.uid());
