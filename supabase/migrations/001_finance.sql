create table public.transactions (
 id uuid primary key default gen_random_uuid(),
 owner text not null check (owner in ('Kayohan','Arielle')),
 type text not null check (type in ('receita','despesa')),
 area text not null check (area in ('pessoal','trabalho')),
 category text not null check (length(trim(category)) between 1 and 80),
 description text not null default '' check (length(description)<=300),
 value numeric(12,2) not null check (value>0 and value<=10000000),
 date date not null
);
create index transactions_owner_date on public.transactions(owner,date);
create table public.fixed (
 id uuid primary key default gen_random_uuid(),
 owner text not null check (owner in ('Kayohan','Arielle')),
 name text not null check (length(trim(name)) between 1 and 80),
 value numeric(12,2) not null check (value>0 and value<=10000000),
 day integer not null check(day between 1 and 31),
 area text not null check(area in ('pessoal','trabalho'))
);
create index fixed_owner on public.fixed(owner);
alter table public.transactions enable row level security;
alter table public.fixed enable row level security;
-- Sem policies públicas: acesso exclusivo pelo servidor com service_role.
revoke all on public.transactions, public.fixed from anon, authenticated;
