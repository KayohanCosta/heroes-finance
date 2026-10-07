import {z} from 'zod';
import {entrySchema,type Owner,today} from './domain.js';
import {addDays,monthlyDate} from './commitments.js';

export const reminderSchema=z.object({
 title:z.string().trim().min(1).max(140),
 recurrence:z.enum(['once','daily','weekly','monthly']),
 startDate:entrySchema.shape.date,
 time:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
 weekdays:z.array(z.number().int().min(1).max(7)).max(7).default([]),
 app:z.boolean().default(true),email:z.boolean().default(false),
 hideContent:z.boolean().default(true),enabled:z.boolean().default(true),
}).strict().refine(r=>r.app||r.email,'Escolha pelo menos um canal.').refine(r=>r.recurrence!=='weekly'||r.weekdays.length>0,'Selecione os dias da semana.');
export type ReminderInput=z.infer<typeof reminderSchema>;
export type ScheduledReminder=ReminderInput&{id:string;owner:Owner;revision:string;nextAt:string|null;completedThrough?:string|null};
export const zone='America/Sao_Paulo';
const parts=(d:Date)=>new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d);
export function localDate(d:Date){return new Intl.DateTimeFormat('sv-SE',{timeZone:zone}).format(d);}
export function reminderInstant(date:string,time:string){
 const [y,m,d]=date.split('-').map(Number),[h,min]=time.split(':').map(Number);
 const target=Date.UTC(y,m-1,d,h,min);let guess=target;
 for(let i=0;i<3;i++){
  const p=Object.fromEntries(parts(new Date(guess)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  const observed=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
  guess+=target-observed;
 }
 return new Date(guess).toISOString();
}
export function nextOccurrence(r:ReminderInput,after:Date=new Date()):string|null {
 const afterDate=localDate(after),base=afterDate>r.startDate?afterDate:r.startDate;
 if(r.recurrence==='once'){const at=reminderInstant(r.startDate,r.time);return new Date(at)>after?at:null;}
 if(r.recurrence==='monthly'){
  const offset=Math.max(0,(Number(base.slice(0,4))-Number(r.startDate.slice(0,4)))*12+Number(base.slice(5,7))-Number(r.startDate.slice(5,7)));
  for(let i=offset;i<=offset+2;i++){const date=monthlyDate(r.startDate,i),at=reminderInstant(date,r.time);if(date>=r.startDate&&new Date(at)>after)return at;}
 }else for(let i=0;i<8;i++){
  const date=addDays(base,i),weekday=((new Date(date+'T12:00:00Z').getUTCDay()+6)%7)+1;
  if(r.recurrence==='weekly'&&!r.weekdays.includes(weekday))continue;
  const at=reminderInstant(date,r.time);if(new Date(at)>after)return at;
 }
 return null;
}
export function appOccurrences(rows:ScheduledReminder[],owner:Owner,now=new Date(),days=60){
 const end=new Date(now.getTime()+days*86400000),items:{at:string;title:string;id:string}[]=[];
 for(const r of rows.filter(r=>r.owner===owner&&r.enabled&&r.app)){
  let at=nextOccurrence(r,now);
  while(at&&new Date(at)<=end){items.push({at,title:r.title,id:r.id+':'+at});at=nextOccurrence(r,new Date(at));}
 }
 return items.sort((a,b)=>a.at.localeCompare(b.at)).slice(0,450);
}
export function scheduleLabel(r:ReminderInput){return (r.recurrence==='once'?r.startDate.split('-').reverse().join('/'):r.recurrence==='daily'?'Todos os dias':r.recurrence==='monthly'?`Todo mês · dia ${Number(r.startDate.slice(-2))}`:r.weekdays.slice().sort().map(d=>['','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][d]).join(', '))+` às ${r.time}`;}
export function parseReminderMessage(message:string,now=new Date()):ReminderInput|null {
 const normalized=message.trim().replace(/[.!?]+$/,'');
 const match=normalized.match(/^(?:me\s+lembrar\s+(?:de|para)|(?:me\s+)?lembre(?:-me)?\s+(?:de|para)|criar\s+lembrete\s+(?:de|para))?\s*(.+?)\s+(todo\s+dia|todos\s+os\s+dias|diariamente|amanhã|amanha|hoje|dia\s+\d{1,2}\/\d{1,2}\/\d{4})\s+(?:às|as|a)\s+(\d{1,2})(?::(\d{2})|h(?:(\d{2}))?)?(?:\s+(?:pelo|por|no|via)\s+(app|aplicativo|e-?mail|app\s+e\s+e-?mail))?$/i);
 if(!match)return null;
 const trigger=match[2].toLowerCase(),daily=/todo|diariamente/.test(trigger),date=localDate(now);
 let startDate=/amanh/.test(trigger)?addDays(date,1):date;
 if(trigger.startsWith('dia '))startDate=trigger.slice(4).split('/').reverse().map(s=>s.padStart(2,'0')).join('-');
 const channel=match[6]?.toLowerCase(),input={title:match[1],recurrence:daily?'daily':'once',startDate,time:match[3].padStart(2,'0')+':'+(match[4]||match[5]||'00'),weekdays:[],app:!channel||/app/.test(channel),email:!!channel&&/mail/.test(channel),hideContent:true,enabled:true};
 const result=reminderSchema.safeParse(input);return result.success?result.data:null;
}

export function pendingOccurrence(r:ScheduledReminder):string|null {
 if(!r.enabled)return null;
 const after=r.completedThrough?new Date(r.completedThrough):new Date(new Date(reminderInstant(r.startDate,'00:00')).getTime()-1);
 return nextOccurrence(r,after);
}
