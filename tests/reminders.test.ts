import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextOccurrence,parseReminderMessage,reminderSchema,appOccurrences,type ScheduledReminder,type ReminderInput} from '../src/reminders.js';
import {emailPayload,sendReminderEmail} from '../server/reminder-mail.js';
import {quickAgent} from '../server/agent-local.js';
const base:ReminderInput={title:'Beber água',recurrence:'daily',startDate:'2026-10-06',time:'08:00',weekdays:[],app:true,email:false,hideContent:true,enabled:true};
test('interpreta frase diária, horário e canal sem modelo',()=>{
 const now=new Date('2026-10-06T10:00:00Z');
 assert.deepEqual(parseReminderMessage('Me lembrar de tomar Venvanse todo dia as 8:00',now),{...base,title:'tomar Venvanse'});
 assert.equal(parseReminderMessage('Me lembrar de beber água amanhã às 8h pelo e-mail',now)?.email,true);
 assert.equal(parseReminderMessage('Me lembrar de água todo dia às 25:00',now),null);
 assert.equal(parseReminderMessage('Me lembrar de água todo dia',now),null);
});
test('recorrências avançam no horário de Brasília, sem repetir minuto já vencido',()=>{
 assert.equal(nextOccurrence(base,new Date('2026-10-06T10:59:00Z')),'2026-10-06T11:00:00.000Z');
 assert.equal(nextOccurrence(base,new Date('2026-10-06T11:00:00Z')),'2026-10-07T11:00:00.000Z');
 assert.equal(nextOccurrence({...base,recurrence:'once'},new Date('2026-10-06T11:00:00Z')),null);
 assert.equal(nextOccurrence({...base,recurrence:'weekly',weekdays:[1]},new Date('2026-10-06T11:00:00Z')),'2026-10-12T11:00:00.000Z');
 assert.equal(nextOccurrence({...base,recurrence:'monthly',startDate:'2028-01-31'},new Date('2028-01-31T11:00:00Z')),'2028-02-29T11:00:00.000Z');
 assert.equal(nextOccurrence({...base,recurrence:'monthly',startDate:'2028-01-31'},new Date('2028-02-29T11:00:00Z')),'2028-03-31T11:00:00.000Z');
});
test('validação rejeita owner, destinatário arbitrário e lembrete sem canal',()=>{
 assert.equal(reminderSchema.safeParse({...base,owner:'Arielle'}).success,false);
 assert.equal(reminderSchema.safeParse({...base,to:'intruso@example.test'}).success,false);
 assert.equal(reminderSchema.safeParse({...base,app:false,email:false}).success,false);
 assert.equal(reminderSchema.safeParse({...base,recurrence:'weekly'}).success,false);
});
test('Android agenda somente o owner ativo e preserva conteúdo discreto',()=>{
 const row:ScheduledReminder={...base,id:'a',revision:'r',owner:'Kayohan',nextAt:null};
 const items=appOccurrences([row,{...row,id:'b',owner:'Arielle'},{...row,id:'c',enabled:false},{...row,id:'d',app:false,email:true}],'Kayohan',new Date('2026-10-06T10:00:00Z'),2);
 assert.equal(items.length,2);assert.ok(items.every(i=>i.id.startsWith('a:')&&!i.title.includes('água')));
});
test('agente prepara proposta de lembrete vinculada ao perfil ativo',async()=>{
 const calls:unknown[][]=[];
 await quickAgent('Arielle','Me lembrar de beber água todo dia às 8:00',async(...args)=>{calls.push(args);return {proposal:{target:'reminders'}};});
 assert.equal(calls[0][0],'Arielle');assert.equal(calls[0][1],'createReminder');
});
test('e-mail usa destinatário do owner e omite conteúdo privado',()=>{
 const env={KAYOHAN_EMAIL:'k@example.test',ARIELLE_EMAIL:'a@example.test',REMINDER_FROM:'Heroes <avisos@example.test>'};
 const payload=emailPayload('Arielle','conteúdo privado',true,'2026-10-06T11:00:00Z',env);
 assert.deepEqual(payload.to,['a@example.test']);assert.ok(!JSON.stringify(payload).includes('conteúdo privado'));
});
test('repetir envio usa a mesma chave de idempotência e falhas não são sucesso',async()=>{
 const headers:string[]=[];const payload={from:'avisos@example.test',to:['a@example.test'],subject:'Lembrete',text:'Discreto'};
 const fake=(async(_url:unknown,init:RequestInit)=>{headers.push((init.headers as Record<string,string>)['Idempotency-Key']);return new Response(JSON.stringify({id:'mail'}),{status:200});}) as typeof fetch;
 await sendReminderEmail('occurrence-1',payload,fake);await sendReminderEmail('occurrence-1',payload,fake);assert.deepEqual(headers,['heroes-reminder/occurrence-1','heroes-reminder/occurrence-1']);
 await assert.rejects(()=>sendReminderEmail('occurrence-1',payload,(async()=>new Response('',{status:429})) as typeof fetch),/HTTP 429/);
});

test('formulário reconhece título, amanhã e horário sem prefixo e sem LLM',()=>{
 const now=new Date('2026-10-06T23:30:00-03:00');
 assert.deepEqual(parseReminderMessage('Tomar venvanse amanhã as 8:00',now),{...base,title:'Tomar venvanse',recurrence:'once',startDate:'2026-10-07'});
 assert.equal(parseReminderMessage('Beber água todos os dias às 09:30',now)?.recurrence,'daily');
 assert.equal(parseReminderMessage('Tomar venvanse amanhã às 8:',now),null);
 assert.equal(parseReminderMessage('Tomar venvanse amanhã às 28:00',now),null);
 assert.equal(parseReminderMessage('Beber água hoje às 8h',now)?.startDate,'2026-10-06');
});
