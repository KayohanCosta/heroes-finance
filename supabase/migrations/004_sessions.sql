create table public.auth_sessions (
 token_hash text primary key,
 owner text not null check(owner in ('Kayohan','Arielle')),
 expires_at timestamptz not null
);
create index auth_sessions_expiry on public.auth_sessions(expires_at);
alter table public.auth_sessions enable row level security;
revoke all on public.auth_sessions from anon,authenticated;
-- Sessões opacas: cookie no navegador, somente hash SHA-256 no banco.
