create table public.user_settings (
 owner text primary key check (owner in ('Kayohan','Arielle')),
 settings jsonb not null check (jsonb_typeof(settings)='object' and octet_length(settings::text)<=45000),
 updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
revoke all on public.user_settings from public,anon,authenticated;
grant select,insert,update,delete on public.user_settings to service_role;
