import type {SupabaseClient} from '@supabase/supabase-js';
import {nextOccurrence,reminderSchema,type ScheduledReminder} from '../src/reminders.js';
import {emailReady,emailPayload,sendReminderEmail,emailProvider} from './reminder-mail.js';

export async function runReminders(db:SupabaseClient){
 const now=new Date(),deadline=Date.now()+40000;
 const {data:rows,error}=await db.from('reminders').select('*').eq('enabled',true).lte('nextAt',now.toISOString()).order('nextAt').limit(50);if(error)throw error;
 let claimed=0,sent=0,failed=0;
 for(const raw of rows||[]){
  const r=raw as ScheduledReminder,input=reminderSchema.parse({title:r.title,recurrence:r.recurrence,startDate:r.startDate,time:r.time,weekdays:r.weekdays,app:r.app,email:r.email,hideContent:r.hideContent,enabled:r.enabled});
  const missed=new Date(r.nextAt!).getTime()<now.getTime()-86400000;
  const ready=emailReady(),status=missed?'missed':!r.email?'app_only':ready?'pending':'unconfigured';
  const payload=status==='pending'?emailPayload(r.owner,r.title,r.hideContent,r.nextAt!):{};
  const {data,error}=await db.rpc('claim_reminder_occurrence',{p_id:r.id,p_revision:r.revision,p_due:r.nextAt,p_next:nextOccurrence(input,now),p_status:status,p_payload:payload});if(error)throw error;if(data)claimed++;
 }
 if(emailReady())while(Date.now()<deadline-11000){
  const {data,error}=await db.rpc('lease_reminder_email');if(error)throw error;const job=data?.[0];if(!job)break;
  // An edit, pause or deletion can invalidate a job already claimed by this worker.
  const current=await db.from('reminders').select('id').eq('id',job.reminder_id).eq('revision',job.revision).eq('enabled',true).eq('email',true).maybeSingle();if(current.error)throw current.error;
  const finish=(patch:Record<string,unknown>)=>db.from('reminder_deliveries').update(patch).eq('id',job.id).eq('lease_token',job.lease_token);
  if(!current.data){const result=await finish({status:'canceled'});if(result.error)throw result.error;continue;}
  try{const providerId=await sendReminderEmail(job.id,job.payload);const result=await finish({status:'sent',provider_id:providerId,last_error:null});if(result.error)throw result.error;sent++;}
  catch(e){const result=await finish({status:emailProvider()==='gmail'||job.attempts>=6?'failed':'pending',retry_at:new Date(Date.now()+Math.min(60,2**job.attempts)*60000).toISOString(),last_error:e instanceof Error?e.message:'Falha no envio'});if(result.error)throw result.error;failed++;}
 }
 return {claimed,sent,failed,emailConfigured:emailReady()};
}
