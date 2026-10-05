import { z } from 'zod';
export const ownerSchema=z.enum(['Kayohan','Arielle']);
export type Owner=z.infer<typeof ownerSchema>;
export const entrySchema=z.object({type:z.enum(['receita','despesa']),area:z.enum(['pessoal','trabalho']),category:z.string().trim().min(1).max(80),description:z.string().trim().max(300),value:z.number().positive().max(10000000).refine(v=>Math.abs(v*100-Math.round(v*100))<0.00001,'Use até duas casas decimais'),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Data inválida')});
export type Entry=z.infer<typeof entrySchema>&{id:string;owner:Owner};
export type Fixed={id:string;owner:Owner;name:string;value:number;day:number;area:'pessoal'|'trabalho';recurrence?:'monthly'|'weekly';startDate?:string};
export const fixedSchema=z.object({name:z.string().trim().min(1).max(80),value:entrySchema.shape.value,day:z.number().int().min(1).max(31),area:z.enum(['pessoal','trabalho']),recurrence:z.enum(['monthly','weekly']).default('monthly'),startDate:entrySchema.shape.date.default(()=>today())}).refine(v=>v.recurrence!=='weekly'||v.day<=7,'Selecione um dia da semana válido');
export function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());}
export function bounds(period:string,now=today()){const d=new Date(now+'T12:00:00Z');let start:string,end:string;if(period==='month'){start=now.slice(0,7)+'-01';end=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0,12)).toISOString().slice(0,10);}else {d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));start=d.toISOString().slice(0,10);d.setUTCDate(d.getUTCDate()+6);end=d.toISOString().slice(0,10);}return {start,end};}
export function select(entries:Entry[],owner:Owner,period:string,category?:string,now=today()){const {start,end}=bounds(period,now);return entries.filter(e=>e.owner===owner&&e.date>=start&&e.date<=end&&(!category||e.category.toLocaleLowerCase('pt-BR').includes(category.toLocaleLowerCase('pt-BR'))));}
export function summary(entries:Entry[]){let gross=0,work=0,personal=0;for(const e of entries){const cents=Math.round(e.value*100);if(e.type==='receita')gross+=cents;else if(e.area==='trabalho')work+=cents;else personal+=cents;}return {gross:gross/100,work:work/100,net:(gross-work)/100,personal:personal/100,free:(gross-work-personal)/100};}
export const money=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);


