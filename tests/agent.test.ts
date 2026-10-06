import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quickAgent} from '../server/agent-local.js';
test('atalhos consultam ferramentas com owner e período corretos',async()=>{
 const calls:any[]=[];const run=async(...args:any[])=>{calls.push(args);return {free:25,gross:100,work:50,personal:25,expenseTotal:12.34};};
 assert.match((await quickAgent('Arielle','Quanto me sobrou essa semana?',run))!.text,/25,00/);
 assert.deepEqual(calls[0],['Arielle','getFinancialSummary',{period:'week'}]);
 assert.match((await quickAgent('Kayohan','Quanto gastei de gasolina esse mês?',run))!.text,/12,34/);
 assert.deepEqual(calls[1],['Kayohan','getTransactions',{period:'month',category:'gasolina'}]);
});
test('despesa rápida é proposta e perguntas fora do padrão vão ao modelo',async()=>{
 const run=async(owner:any,name:any,args:any)=>({proposal:{action:'create',data:args},owner,name});
 const result:any=await quickAgent('Arielle','Gastei 50 de gasolina hoje',run);
 assert.equal(result.proposal.data.value,50);assert.equal(result.proposal.data.area,'trabalho');assert.equal(result.owner,'Arielle');assert.equal(result.name,'createTransaction');
 assert.equal(await quickAgent('Kayohan','Quanto Arielle gastou?',run),null);
 assert.equal(await quickAgent('Kayohan','Quanto me sobrou depois de excluir aluguel?',run),null);
});
