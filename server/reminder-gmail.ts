import {createHash} from 'node:crypto';
import type {emailPayload} from './reminder-mail.js';
type Payload=ReturnType<typeof emailPayload>;
type Transport={sendMail:(mail:Record<string,unknown>)=>Promise<{messageId?:string;accepted?:unknown[]}>;close:()=>void};
type Factory=(options:Record<string,unknown>)=>Transport;
export function gmailOptions(env:NodeJS.ProcessEnv=process.env){
 const user=env.GMAIL_USER||'',pass=(env.GMAIL_APP_PASSWORD||'').replace(/\s/g,'');
 if(!/^[^\s<>@]+@gmail\.com$/i.test(user)||!/^[a-z]{16}$/i.test(pass))throw new Error('Gmail não configurado.');
 return {host:'smtp.gmail.com',port:465,secure:true,auth:{user,pass},tls:{minVersion:'TLSv1.2',rejectUnauthorized:true},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:10000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true};
}
export async function sendGmailReminder(id:string,payload:Payload,factory?:Factory,env:NodeJS.ProcessEnv=process.env){
 const options=gmailOptions(env);
 if(!factory){const mailer=await import('nodemailer');factory=mailer.default.createTransport as Factory;}
 const transport=factory(options),messageId=`<heroes-${createHash('sha256').update(id).digest('hex')}@gmail.com>`;
 try{
  const result=await transport.sendMail({...payload,from:`Heroes Finance <${env.GMAIL_USER}>`,messageId});
  if(!result.accepted?.length)throw new Error('Não aceito.');
  return result.messageId||messageId;
 }catch{throw new Error('Falha no envio Gmail; verifique a configuração e os limites da conta.');}
 finally{transport.close();}
}
