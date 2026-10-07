alter table public.reminders add column if not exists "completionHistory" jsonb not null default '[]', add column if not exists "snoozedAt" timestamptz, add column if not exists "snoozedUntil" timestamptz;
create or replace function public.next_reminder_due(r public.reminders,p_after timestamptz)
returns timestamptz language plpgsql security invoker set search_path='' as $$
declare base date; d date; at_time timestamptz; i integer; original_day integer;
begin
 base:=greatest(r."startDate"::date,(p_after at time zone 'America/Sao_Paulo')::date);original_day:=extract(day from r."startDate");
 for i in 0..62 loop
  if r.recurrence='once' then d:=r."startDate";
  elsif r.recurrence='monthly' then d:=(date_trunc('month',base)+make_interval(months=>i))::date;d:=d+least(original_day,extract(day from (d+interval '1 month - 1 day'))::integer)-1;
  else d:=base+i;end if;
  if r.recurrence='weekly' and not(extract(isodow from d)::integer=any(r.weekdays)) then continue;end if;
  at_time:=(d+r.time::time) at time zone 'America/Sao_Paulo';
  if d>=r."startDate" and at_time>p_after then return at_time;end if;
  if r.recurrence='once' then return null;end if;
 end loop;return null;
end $$;
revoke all on function public.next_reminder_due(public.reminders,timestamptz) from public,anon,authenticated;
grant execute on function public.next_reminder_due(public.reminders,timestamptz) to service_role;
create or replace function public.act_on_reminder(p_owner text,p_id uuid,p_action text,p_at timestamptz,p_until timestamptz default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.reminders; last_item jsonb; first_due timestamptz; local_day date; i integer; candidate timestamptz; original_day integer;
begin
 select * into r from public.reminders where id=p_id and owner=p_owner for update;
 if not found then raise exception 'Lembrete não encontrado neste perfil.'; end if;
 if p_action='undo' then
  last_item:=r."completionHistory"->(jsonb_array_length(r."completionHistory")-1);
  if last_item is null or (last_item->>'at')::timestamptz<>p_at or r."completedThrough" is distinct from p_at then raise exception 'Somente a última confirmação pode ser desfeita.'; end if;
  update public.reminders set "completedThrough"=(last_item->>'previous')::timestamptz,"completionHistory"="completionHistory"-(jsonb_array_length("completionHistory")-1),"snoozedAt"=null,"snoozedUntil"=null where id=p_id returning * into r;
  return to_jsonb(r);
 end if;
 if p_action not in ('complete','snooze') then raise exception 'Ação inválida.'; end if;
 if p_action='complete' and r."completedThrough"=p_at then return to_jsonb(r); end if;
 if not r.enabled or p_at>now() or p_at<((r."startDate"::date+r.time::time) at time zone 'America/Sao_Paulo') or (r."completedThrough" is not null and p_at<=r."completedThrough") then raise exception 'Ocorrência não está pendente.'; end if;
 first_due:=public.next_reminder_due(r,coalesce(r."completedThrough",(r."startDate"::timestamp at time zone 'America/Sao_Paulo')-interval '1 second'));
 if first_due is distinct from p_at then raise exception 'Esta ocorrência não está pendente.'; end if;
 if p_action='snooze' then
  if p_until is null or p_until<=now() or p_until>now()+interval '7 days' then raise exception 'Escolha um horário futuro nos próximos sete dias.';end if;
  update public.reminders set "snoozedAt"=p_at,"snoozedUntil"=p_until,"nextAt"=p_until where id=p_id returning * into r;
 else
  if jsonb_array_length(r."completionHistory")>=500 then r."completionHistory":=r."completionHistory"-0;end if;
  update public.reminders set "completedThrough"=p_at,"completionHistory"=r."completionHistory"||jsonb_build_array(jsonb_build_object('at',p_at,'completedAt',now(),'title',r.title,'previous',r."completedThrough")),"snoozedAt"=null,"snoozedUntil"=null,"nextAt"=public.next_reminder_due(r,now()) where id=p_id returning * into r;
 end if;
 return to_jsonb(r);
end $$;
revoke all on function public.act_on_reminder(text,uuid,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.act_on_reminder(text,uuid,text,timestamptz,timestamptz) to service_role;
