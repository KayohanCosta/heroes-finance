create table public.debts (
 id uuid primary key default gen_random_uuid(),
 owner text not null check(owner in ('Kayohan','Arielle')),
 name text not null check(length(trim(name)) between 1 and 80),
 description text not null default '' check(length(description)<=500),
 value numeric(12,2) not null check(value>0 and value<=10000000)
);
create index debts_owner on public.debts(owner);
alter table public.debts enable row level security;
revoke all on public.debts from anon,authenticated;
