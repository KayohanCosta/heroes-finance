import type {Owner} from '../src/domain.js';
export function emailProvider(env:NodeJS.ProcessEnv=process.env){return env.REMINDER_EMAIL_PROVIDER==='gmail'?'gmail':'resend';}
export function emailReady(env:NodeJS.ProcessEnv=process.env){return !!(env.KAYOHAN_EMAIL&&env.ARIELLE_EMAIL&&(emailProvider(env)==='gmail'?/^[^\s<>@]+@gmail\.com$/i.test(env.GMAIL_USER||'')&&/^[a-z]{16}$/i.test((env.GMAIL_APP_PASSWORD||'').replace(/\s/g,'')):env.RESEND_API_KEY&&env.REMINDER_FROM));}
export function emailPayload(owner:Owner,title:string,hide:boolean,due:string,env:NodeJS.ProcessEnv=process.env){
 const to=owner==='Kayohan'?env.KAYOHAN_EMAIL:env.ARIELLE_EMAIL;
 const from=emailProvider(env)==='gmail'?`Heroes Finance <${env.GMAIL_USER}>`:env.REMINDER_FROM;
 if(!to||!from)throw new Error('E-mail não configurado.');
 return {from,to:[to],subject:title,text:title};
}
export async function sendReminderEmail(id:string,payload:ReturnType<typeof emailPayload>,fetcher:typeof fetch=fetch){
 if(emailProvider()==='gmail'){const {sendGmailReminder}=await import('./reminder-gmail.js');return sendGmailReminder(id,payload);}
 const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`heroes-reminder/${id}`},body:JSON.stringify(payload)});
 if(!response.ok)throw new Error(`Resend HTTP ${response.status}`);
 const result=await response.json() as {id?:string};if(!result.id)throw new Error('Resposta inválida do serviço de e-mail.');return result.id;
}
