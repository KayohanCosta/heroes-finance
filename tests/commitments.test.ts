import{test}from'node:test';import assert from'node:assert/strict';
import{monthlyDate,loanSchedule,fixedSchedule,reminders,type Loan,type Payment}from'../src/commitments.js';
import{fixedSchema,type Fixed}from'../src/domain.js';
const loan:Loan={id:'l',owner:'Kayohan',name:'Banco',value:100,installments:3,firstDue:'2028-01-31',area:'pessoal'};
test('parcelas preservam o dia original nos meses curtos',()=>{assert.equal(monthlyDate('2028-01-31',1),'2028-02-29');assert.deepEqual(loanSchedule(loan,[]).map(p=>p.due),['2028-01-31','2028-02-29','2028-03-31']);});
test('contas semanais e mensal em mês curto',()=>{const f:Fixed={id:'f',owner:'Kayohan',name:'Conta',value:10,day:1,area:'pessoal',recurrence:'weekly',startDate:'2026-10-05'};assert.deepEqual(fixedSchedule(f,[],'2026-10-01','2026-10-20').map(d=>d.due),['2026-10-05','2026-10-12','2026-10-19']);assert.deepEqual(fixedSchedule({...f,recurrence:'monthly',day:31},[],'2027-02-01','2027-02-28').map(d=>d.due),['2027-02-28']);});
test('lembretes ignoram parcelas pagas e dados de outro perfil',()=>{const payment:Payment={id:'p',owner:'Kayohan',kind:'loan',sourceId:'l',number:1,due:'2028-01-31',paidAt:'2028-01-30',transactionId:'tx',value:100};const list=reminders([loan,{...loan,id:'other',owner:'Arielle'}],[],[payment],'Kayohan','2028-02-20');assert.deepEqual(list.map(d=>d.number),[2]);});
test('conta semanal rejeita dia maior que sete e valor com precisão extra',()=>{assert.equal(fixedSchema.safeParse({name:'X',value:10,day:8,recurrence:'weekly',area:'pessoal'}).success,false);assert.equal(fixedSchema.safeParse({name:'X',value:1.123,day:1,area:'pessoal'}).success,false);});

