import type {Owner} from '../src/domain.js';
export function emailReady(env:NodeJS.ProcessEnv=process.env){return !!(env.RESEND_API_KEY&&env.REMINDER_FROM&&env.KAYOHAN_EMAIL&&env.ARIELLE_EMAIL);}
export function emailPayload(owner:Owner,title:string,hide:boolean,due:string,env:NodeJS.ProcessEnv=process.env){
 const to=owner==='Kayohan'?env.KAYOHAN_EMAIL:env.ARIELLE_EMAIL;
 if(!to||!env.REMINDER_FROM)throw new Error('E-mail não configurado.');
 const date=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(new Date(due));
 return {from:env.REMINDER_FROM,to:[to],subject:hide?'Heroes Finance · seu lembrete':`Heroes Finance · ${title}`,text:`${hide?'Você tem um lembrete programado. Abra o aplicativo para ver os detalhes.':title}\n\nProgramado para ${date} (Brasília).\n\nAcesse https://heroesfinance.vercel.app para editar ou pausar seus lembretes.`};
}
export async function sendReminderEmail(id:string,payload:ReturnType<typeof emailPayload>,fetcher:typeof fetch=fetch){
 const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`heroes-reminder/${id}`},body:JSON.stringify(payload)});
 if(!response.ok)throw new Error(`Resend HTTP ${response.status}`);
 const result=await response.json() as {id?:string};if(!result.id)throw new Error('Resposta inválida do serviço de e-mail.');return result.id;
}
