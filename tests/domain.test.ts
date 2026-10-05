import{test}from'node:test';import assert from'node:assert/strict';import{bounds,summary,select,entrySchema,type Entry}from'../src/domain.js';
const rows:Entry[]=[{id:'1',owner:'Kayohan',type:'receita',area:'trabalho',category:'Uber',description:'',value:1250,date:'2026-10-05'},{id:'2',owner:'Kayohan',type:'despesa',area:'trabalho',category:'Gasolina',description:'',value:340,date:'2026-10-06'},{id:'3',owner:'Kayohan',type:'despesa',area:'pessoal',category:'Mercado',description:'',value:285,date:'2026-10-07'},{id:'4',owner:'Arielle',type:'receita',area:'pessoal',category:'Salário',description:'',value:9999,date:'2026-10-05'}];
test('resumo e isolamento de owner',()=>assert.deepEqual(summary(select(rows,'Kayohan','week',undefined,'2026-10-05')),{gross:1250,work:340,net:910,personal:285,free:625}));
test('semana começa segunda e atravessa o mês',()=>assert.deepEqual(bounds('week','2026-11-01'),{start:'2026-10-26',end:'2026-11-01'}));
test('mês contempla ano bissexto',()=>assert.deepEqual(bounds('month','2028-02-29'),{start:'2028-02-01',end:'2028-02-29'}));
test('categoria e período não incluem outro perfil',()=>assert.equal(select(rows,'Kayohan','month','gasolina','2026-10-05').length,1));
test('cálculo em centavos',()=>assert.equal(summary([{...rows[0],value:.1},{...rows[0],value:.2}]).free,.3));
test('rejeita valor negativo, data impossível e precisão extra',()=>{for(const change of [{value:-1},{date:'2026-02-30'},{value:1.123}])assert.equal(entrySchema.safeParse({...rows[0],...change}).success,false);});
