import {z} from 'zod';
import {nextOccurrence,pendingOccurrence,type ScheduledReminder} from '../src/reminders.js';
export const reminderActionSchema=z.object({at:z.iso.datetime(),until:z.iso.datetime().optional()}).strict();
export type ReminderAction='complete'|'undo'|'snooze';
export function applyReminderAction(row:ScheduledReminder,action:ReminderAction,input:z.infer<typeof reminderActionSchema>,now=new Date()):ScheduledReminder{
 const history=row.completionHistory||[],same=(a:string|null|undefined,b:string)=>!!a&&new Date(a).getTime()===new Date(b).getTime();
 if(action==='undo'){
  const last=history[history.length-1];if(!last||!same(last.at,input.at)||!same(row.completedThrough,input.at))throw new Error('Somente a última confirmação pode ser desfeita.');
  return {...row,completedThrough:last.previous,completionHistory:history.slice(0,-1),snoozedUntil:null,snoozedAt:null};
 }
 if(action==='complete'&&same(row.completedThrough,input.at))return row;
 if(!same(pendingOccurrence(row),input.at)||new Date(input.at)>now)throw new Error('Esta ocorrência não está pendente ou ainda não chegou o horário.');
 if(action==='snooze'){
  const until=input.until&&new Date(input.until);if(!until||until<=now||until.getTime()>now.getTime()+7*86400000)throw new Error('Adie para um horário futuro nos próximos sete dias.');
  return {...row,snoozedAt:input.at,snoozedUntil:until.toISOString(),nextAt:until.toISOString()};
 }
 return {...row,completedThrough:input.at,completionHistory:[...history,{at:input.at,completedAt:now.toISOString(),title:row.title,previous:row.completedThrough||null}].slice(-500),snoozedAt:null,snoozedUntil:null,nextAt:nextOccurrence(row,now)};
}
