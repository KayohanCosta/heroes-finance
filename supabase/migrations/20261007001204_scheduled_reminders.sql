create table public.reminders (
 id uuid primary key default gen_random_uuid(),
 owner text not null check (owner in ('Kayohan','Arielle')),
 title text not null check (char_length(title) between 1 and 140),
 recurrence text not null check (recurrence in ('once','daily','weekly','monthly')),
 "startDate" date not null,
 time text not null check (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 weekdays integer[] not null default '{}' check (weekdays <@ array[1,2,3,4,5,6,7]),
 app boolean not null default true, email boolean not null default false,
 "hideContent" boolean not null default true, enabled boolean not null default true,
 revision uuid not null default gen_random_uuid(), "nextAt" timestamptz,
 check (app or email), check (recurrence <> 'weekly' or cardinality(weekdays)>0)
);
create index reminders_owner_idx on public.reminders(owner);
create index reminders_due_idx on public.reminders("nextAt") where enabled;
create table public.reminder_deliveries (
 id uuid primary key default gen_random_uuid(),
 reminder_id uuid not null references public.reminders(id) on delete cascade,
 owner text not null check (owner in ('Kayohan','Arielle')), revision uuid not null,
 due_at timestamptz not null,
 status text not null check (status in ('pending','sending','sent','failed','canceled','unconfigured','missed','app_only')),
 payload jsonb not null default '{}', attempts integer not null default 0,
 retry_at timestamptz not null default now(), lease_until timestamptz, lease_token uuid,
 provider_id text, last_error text, created_at timestamptz not null default now(),
 unique(reminder_id,revision,due_at)
);
create index reminder_deliveries_pending_idx on public.reminder_deliveries(retry_at) where status in ('pending','sending');
alter table public.reminders enable row level security;
alter table public.reminder_deliveries enable row level security;
revoke all on public.reminders,public.reminder_deliveries from anon,authenticated;
grant all on public.reminders,public.reminder_deliveries to service_role;

-- Compare-and-swap advances the reminder and inserts one occurrence atomically.
create function public.claim_reminder_occurrence(p_id uuid,p_revision uuid,p_due timestamptz,p_next timestamptz,p_status text,p_payload jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.reminders;
begin
 select * into r from public.reminders where id=p_id and revision=p_revision and enabled and "nextAt"=p_due and "nextAt"<=now() for update;
 if not found then return false; end if;
 if p_status not in ('pending','unconfigured','missed','app_only') then raise exception 'Invalid occurrence status'; end if;
 insert into public.reminder_deliveries(reminder_id,owner,revision,due_at,status,payload) values(r.id,r.owner,r.revision,p_due,p_status,p_payload);
 update public.reminders set "nextAt"=p_next where id=r.id;
 return true;
end $$;
create function public.lease_reminder_email()
returns setof public.reminder_deliveries language plpgsql security invoker set search_path='' as $$
declare delivery public.reminder_deliveries;
begin
 update public.reminder_deliveries d set status='canceled'
 where d.status in ('pending','sending') and not exists(select 1 from public.reminders r where r.id=d.reminder_id and r.enabled and r.email and r.revision=d.revision);
 update public.reminder_deliveries set status='failed',last_error='Delivery expired'
 where status in ('pending','sending') and (created_at<now()-interval '20 hours' or attempts>=6);
 select * into delivery from public.reminder_deliveries
 where (status='pending' or (status='sending' and lease_until<now())) and retry_at<=now()
 order by retry_at for update skip locked limit 1;
 if not found then return; end if;
 return query update public.reminder_deliveries set status='sending',attempts=attempts+1,lease_until=now()+interval '2 minutes',lease_token=gen_random_uuid() where id=delivery.id returning *;
end $$;
revoke all on function public.claim_reminder_occurrence(uuid,uuid,timestamptz,timestamptz,text,jsonb) from public,anon,authenticated;
revoke all on function public.lease_reminder_email() from public,anon,authenticated;
grant execute on function public.claim_reminder_occurrence(uuid,uuid,timestamptz,timestamptz,text,jsonb) to service_role;
grant execute on function public.lease_reminder_email() to service_role;
