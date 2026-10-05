alter table public.fixed add column recurrence text not null default 'monthly' check(recurrence in ('monthly','weekly'));
alter table public.fixed add column "startDate" date not null default current_date;
alter table public.fixed add constraint fixed_weekday check(recurrence<>'weekly' or day<=7);
create table public.loans (
 id uuid primary key default gen_random_uuid(), owner text not null check(owner in ('Kayohan','Arielle')),
 name text not null check(length(trim(name)) between 1 and 80), value numeric(12,2) not null check(value>0 and value<=10000000),
 installments integer not null check(installments between 1 and 360), "firstDue" date not null,
 area text not null check(area in ('pessoal','trabalho'))
);
create table public.payments (
 id uuid primary key default gen_random_uuid(),owner text not null check(owner in ('Kayohan','Arielle')),
 kind text not null check(kind in ('loan','fixed')), "sourceId" uuid not null, number integer not null,
 value numeric(12,2) not null check(value>0),due date not null,"paidAt" date not null,"transactionId" uuid not null unique references public.transactions(id),
 unique(owner,kind,"sourceId",due), check((kind='loan' and number>0) or (kind='fixed' and number=0))
);
create unique index payments_loan_number on public.payments(owner,"sourceId",number) where kind='loan';
create index loans_owner on public.loans(owner);
create index payments_owner on public.payments(owner);
alter table public.loans enable row level security;
alter table public.payments enable row level security;
revoke all on public.loans,public.payments from anon,authenticated;
create function public.pay_commitment(p_owner text,p_kind text,p_source uuid,p_number integer,p_due date,p_paid date) returns jsonb
language plpgsql security definer set search_path=public as $$
declare l public.loans; f public.fixed; existing public.payments; month_start date; expected date; tx uuid:=gen_random_uuid(); pay uuid:=gen_random_uuid(); amount numeric; title text; expense_area text;
begin
 if p_paid>(now() at time zone 'America/Sao_Paulo')::date then raise exception 'A data do pagamento não pode estar no futuro.'; end if;
 if p_kind='loan' then
  select * into l from public.loans where id=p_source and owner=p_owner for update;
  if not found then raise exception 'Empréstimo não encontrado neste perfil.'; end if;
  if p_number<1 or p_number>l.installments then raise exception 'Parcela inválida.'; end if;
  month_start:=(date_trunc('month',l."firstDue")+make_interval(months=>p_number-1))::date;
  expected:=month_start+(least(extract(day from l."firstDue")::integer,extract(day from (month_start+interval '1 month - 1 day'))::integer)-1);
  if p_due<>expected then raise exception 'Vencimento inválido.'; end if;
  amount:=l.value;expense_area:=l.area;title:=l.name||' · parcela '||p_number||'/'||l.installments;
 elsif p_kind='fixed' then
  select * into f from public.fixed where id=p_source and owner=p_owner for update;
  if not found then raise exception 'Conta não encontrada neste perfil.'; end if;
  if p_number<>0 or p_due<f."startDate" then raise exception 'Vencimento inválido.'; end if;
  if f.recurrence='weekly' then
   if extract(isodow from p_due)::integer<>f.day then raise exception 'Dia da semana inválido.'; end if;
  else
   month_start:=date_trunc('month',p_due)::date;
   expected:=month_start+(least(f.day,extract(day from (month_start+interval '1 month - 1 day'))::integer)-1);
   if p_due<>expected then raise exception 'Vencimento inválido.'; end if;
  end if;
  amount:=f.value;expense_area:=f.area;title:=f.name||' · vencimento '||p_due;
 else raise exception 'Compromisso inválido.';
 end if;
 select * into existing from public.payments where owner=p_owner and kind=p_kind and "sourceId"=p_source and (due=p_due or (p_kind='loan' and number=p_number));
 if found then return to_jsonb(existing); end if;
 insert into public.transactions(id,owner,type,area,category,description,value,date) values(tx,p_owner,'despesa',expense_area,case when p_kind='loan' then 'Empréstimos' else 'Contas fixas' end,title,amount,p_paid);
 insert into public.payments(id,owner,kind,"sourceId",number,due,"paidAt","transactionId",value) values(pay,p_owner,p_kind,p_source,p_number,p_due,p_paid,tx,amount) returning * into existing;
 return to_jsonb(existing);
end $$;
create function public.undo_commitment_payment(p_owner text,p_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare payment public.payments;
begin
 select * into payment from public.payments where id=p_id and owner=p_owner for update;
 if not found then raise exception 'Pagamento não encontrado neste perfil.'; end if;
 delete from public.payments where id=p_id;
 delete from public.transactions where id=payment."transactionId" and owner=p_owner;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.pay_commitment(text,text,uuid,integer,date,date) from public,anon,authenticated;
revoke all on function public.undo_commitment_payment(text,uuid) from public,anon,authenticated;
grant execute on function public.pay_commitment(text,text,uuid,integer,date,date) to service_role;
grant execute on function public.undo_commitment_payment(text,uuid) to service_role;

