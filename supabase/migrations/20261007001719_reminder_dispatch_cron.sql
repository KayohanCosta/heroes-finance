create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create schema if not exists heroes_private;
revoke all on schema heroes_private from public,anon,authenticated;

-- Insert secrets named heroes_reminder_cron_url and heroes_reminder_cron_token
-- in Supabase Vault before enabling the job. Never commit their values.
create function heroes_private.dispatch_reminders()
returns void language plpgsql security invoker set search_path='' as $$
declare endpoint text; token text;
begin
 if not exists(select 1 from public.reminders where enabled and "nextAt"<=now())
 and not exists(select 1 from public.reminder_deliveries where status in ('pending','sending') and retry_at<=now() and (lease_until is null or lease_until<now())) then return; end if;
 select decrypted_secret into endpoint from vault.decrypted_secrets where name='heroes_reminder_cron_url';
 select decrypted_secret into token from vault.decrypted_secrets where name='heroes_reminder_cron_token';
 if endpoint is null or token is null then return; end if;
 perform net.http_post(url:=endpoint,headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||token),body:='{}'::jsonb,timeout_milliseconds:=55000);
end $$;
revoke all on function heroes_private.dispatch_reminders() from public,anon,authenticated;
select cron.schedule('heroes-reminders-minute','* * * * *','select heroes_private.dispatch_reminders();');
