import {parseReminderMessage} from '../src/reminders.js';
import {money,today,type Owner} from '../src/domain.js';
type ToolRunner=(owner:Owner,name:string,args:any)=>Promise<any>;
// Intenções conhecidas utilizam as mesmas ferramentas, sem depender do provedor.
export async function quickAgent(owner:Owner,message:string,run:ToolRunner){
 const m=message.trim().toLocaleLowerCase('pt-BR').replace(/[?!]+$/,'');
 const reminder=parseReminderMessage(message);if(reminder)return {text:'Confira o horário, a repetição e os canais antes de confirmar.',...await run(owner,'createReminder',reminder)};
 const period=/mês|mes/.test(m)?'month':'week';
 const expense=m.match(/^gastei\s+(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s+(?:de|com|em)\s+(.+?)(?:\s+hoje)?[.!]?$/);
 if(expense){const category=expense[2].replace(/\s+hoje$/,'').trim();return {text:'Confira o lançamento antes de confirmar.',...await run(owner,'createTransaction',{type:'despesa',area:/gasolina|combustível/.test(category)?'trabalho':'pessoal',category,description:'Registrado pelo Heroes Agent',value:Number(expense[1].replace(',','.')),date:today()})};}
 if(/^quanto (?:eu )?gastei (?:de|com|em) gasolina(?: (?:esse|este|nessa|nesta) (?:mês|mes|semana))?$/.test(m)){const result=await run(owner,'getTransactions',{period,category:'gasolina'});return {text:`Você gastou ${money(result.expenseTotal)} de gasolina ${period==='month'?'neste mês':'nesta semana'}.`};}
 if(/^quanto (?:me )?(?:sobrou|sobra)(?: (?:essa|esta|nessa|nesta|esse|este) (?:semana|mês|mes))?$/.test(m)){const result=await run(owner,'getFinancialSummary',{period});return {text:`Sua sobra real é ${money(result.free)} ${period==='month'?'neste mês':'nesta semana'}. Receita bruta: ${money(result.gross)} · custos do trabalho: ${money(result.work)} · gastos pessoais: ${money(result.personal)}.`};}
 return null;
}
