import {z} from 'zod';
import {entrySchema,today,type Owner,type Fixed} from './domain.js';
export const loanSchema=z.object({name:z.string().trim().min(1).max(80),value:entrySchema.shape.value,installments:z.number().int().min(1).max(360),firstDue:entrySchema.shape.date,area:z.enum(['pessoal','trabalho'])});
export type Loan=z.infer<typeof loanSchema>&{id:string;owner:Owner};
export type Payment={id:string;owner:Owner;kind:'loan'|'fixed';sourceId:string;number:number;due:string;paidAt:string;transactionId:string;value:number};
export type Due={kind:'loan'|'fixed';sourceId:string;number:number;due:string;name:string;value:number;area:'pessoal'|'trabalho';payment?:Payment};
export function addDays(date:string,days:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function monthlyDate(anchor:string,offset:number){const d=new Date(anchor+'T12:00:00Z');const target=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+offset,1,12));const day=Math.min(d.getUTCDate(),new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate());target.setUTCDate(day);return target.toISOString().slice(0,10);}
export function loanSchedule(loan:Loan,payments:Payment[]):Due[]{return Array.from({length:loan.installments},(_,i)=>({kind:'loan',sourceId:loan.id,number:i+1,due:monthlyDate(loan.firstDue,i),name:loan.name,value:loan.value,area:loan.area,payment:payments.find(p=>p.owner===loan.owner&&p.kind==='loan'&&p.sourceId===loan.id&&p.number===i+1)}));}
export function fixedSchedule(fixed:Fixed,payments:Payment[],from:string,to:string):Due[]{const start=fixed.startDate||today();const result:Due[]=[];if(fixed.recurrence==='weekly'){let d=from<start?start:from;const weekday=new Date(d+'T12:00:00Z').getUTCDay()||7;d=addDays(d,(fixed.day-weekday+7)%7);for(;d<=to;d=addDays(d,7))result.push({kind:'fixed',sourceId:fixed.id,number:0,due:d,name:fixed.name,value:fixed.value,area:fixed.area});}else{let cursor=(from<start?start:from).slice(0,7)+'-01';while(cursor<=to){
const [year,month]=cursor.split('-').map(Number);const day=Math.min(fixed.day,new Date(Date.UTC(year,month,0)).getUTCDate());const date=cursor.slice(0,8)+String(day).padStart(2,'0');if(date>=from&&date>=start&&date<=to)result.push({kind:'fixed',sourceId:fixed.id,number:0,due:date,name:fixed.name,value:fixed.value,area:fixed.area});cursor=monthlyDate(cursor,1);}}
return result.map(d=>({...d,payment:payments.find(p=>p.owner===fixed.owner&&p.kind==='fixed'&&p.sourceId===fixed.id&&p.due===d.due)}));}
export function reminders(loans:Loan[],fixed:Fixed[],payments:Payment[],owner:Owner,now=today()){const end=addDays(now,14);return [...loans.filter(l=>l.owner===owner).flatMap(l=>loanSchedule(l,payments)),...fixed.filter(f=>f.owner===owner).flatMap(f=>fixedSchedule(f,payments,addDays(now,-60),end))].filter(d=>!d.payment&&d.due<=end).sort((a,b)=>a.due.localeCompare(b.due)||a.name.localeCompare(b.name));}


