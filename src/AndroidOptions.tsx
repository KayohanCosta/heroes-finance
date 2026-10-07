import {useEffect,useState} from 'react';
import {addDays,fixedSchedule,loanSchedule,type Loan,type Payment} from './commitments';
import {today,type Fixed,type Owner} from './domain';
import {appOccurrences,type ScheduledReminder} from './reminders';
declare global {interface Window {HeroesAndroid?:{postMessage:(message:string)=>void}}}
export function androidMessage(action:string,dates?:string[]){window.HeroesAndroid?.postMessage(JSON.stringify({action,dates}));}
export function AndroidSync({owner,loans,fixed,payments,reminders,ready}:{owner:Owner;loans:Loan[];fixed:Fixed[];payments:Payment[];reminders:ScheduledReminder[];ready:boolean}){
 useEffect(()=>{
  if(!ready||!window.HeroesAndroid)return;
  const start=today(),end=addDays(start,60);
  const dues=[...loans.filter(l=>l.owner===owner).flatMap(l=>loanSchedule(l,payments)),...fixed.filter(f=>f.owner===owner).flatMap(f=>fixedSchedule(f,payments,start,end))];
  const dates=[...new Set(dues.filter(d=>!d.payment&&d.due>=start&&d.due<=end).map(d=>d.due))].sort();
  const items=[...dates.map(d=>({at:d+'T12:00:00.000Z',title:'Você tem pagamentos previstos para hoje. Confira seus lembretes.',id:'payment:'+d})),...appOccurrences(reminders,owner)].sort((a,b)=>a.at.localeCompare(b.at)).slice(0,500);
  window.HeroesAndroid.postMessage(JSON.stringify({action:'syncReminders',items}));
  // Older APKs continue receiving payment reminders; custom times require the new APK.
  androidMessage('sync',dates);
 },[owner,loans,fixed,payments,reminders,ready]);
 return null;
}
export function AndroidOptions(){
 const [notifications,setNotifications]=useState<boolean|null>(null);
 useEffect(()=>{
  if(!window.HeroesAndroid)return;
  const receive=(event:Event)=>{const state=(event as CustomEvent).detail;if(typeof state?.notifications==='boolean')setNotifications(state.notifications);};
  const refresh=()=>{if(document.visibilityState==='visible')androidMessage('deviceState');};
  window.addEventListener('heroes-device-state',receive);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);refresh();
  return()=>{window.removeEventListener('heroes-device-state',receive);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[]);
 if(!window.HeroesAndroid||notifications!==false)return null;
 return <section className="panel"><div className="panel-title"><h3>No seu Android</h3><span className="tag">ESTE APARELHO</span></div><p>Ative as notificações para receber lembretes de vencimento e da sua rotina. O bloqueio biométrico é opcional e pode ser configurado em Configurações.</p><button onClick={()=>androidMessage('notifications')}>Permitir lembretes</button><p className="note">Contas às 9h; seus lembretes no horário escolhido. Abra o aplicativo após mudanças para atualizar a agenda. O Android pode atrasar a entrega.</p></section>;
}
