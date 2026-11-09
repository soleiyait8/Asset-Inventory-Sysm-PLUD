-- Asset Inventory System (PLUD): database schema
-- Already applied to the "Plud Asset inventory Project" Supabase project.
-- Kept here for reference and for setting up a new project.

create table public.staff (
  email text primary key check (email = lower(email)),
  name text,
  added_at timestamptz not null default now()
);

create table public.assets (
  id text primary key check (id ~ '^[A-Z]{2,5}-[0-9]+$'),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text default (auth.jwt() ->> 'email')
);

create table public.settings (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

create or replace function public.touch_row()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if tg_table_name = 'assets' then new.updated_by := auth.jwt() ->> 'email'; end if;
  return new;
end;
$$;
create trigger assets_touch before insert or update on public.assets for each row execute function public.touch_row();
create trigger settings_touch before insert or update on public.settings for each row execute function public.touch_row();

alter table public.staff enable row level security;
alter table public.assets enable row level security;
alter table public.settings enable row level security;

create policy "staff read staff list" on public.staff for select to authenticated using ((select public.is_staff()));
create policy "staff read assets" on public.assets for select to authenticated using ((select public.is_staff()));
create policy "staff add assets" on public.assets for insert to authenticated with check ((select public.is_staff()));
create policy "staff update assets" on public.assets for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "staff delete assets" on public.assets for delete to authenticated using ((select public.is_staff()));
create policy "staff read settings" on public.settings for select to authenticated using ((select public.is_staff()));
create policy "staff add settings" on public.settings for insert to authenticated with check ((select public.is_staff()));
create policy "staff update settings" on public.settings for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

revoke all on public.staff, public.assets, public.settings from anon;
grant select on public.staff to authenticated;
grant select, insert, update, delete on public.assets to authenticated;
grant select, insert, update on public.settings to authenticated;

alter publication supabase_realtime add table public.assets, public.settings;
