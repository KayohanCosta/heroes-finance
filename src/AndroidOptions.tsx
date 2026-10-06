import {useEffect} from 'react';
import {addDays,fixedSchedule,loanSchedule,type Loan,type Payment} from './commitments';
import {today,type Fixed,type Owner} from './domain';
declare global {interface Window {HeroesAndroid?:{postMessage:(message:string)=>void}}}
export function androidMessage(action:string,dates?:string[]){window.HeroesAndroid?.postMessage(JSON.stringify({action,dates}));}
export function AndroidOptions({owner,loans,fixed,payments,ready}:{owner:Owner;loans:Loan[];fixed:Fixed[];payments:Payment[];ready:boolean}){
 useEffect(()=>{
  if(!ready||!window.HeroesAndroid)return;
  const start=today(),end=addDays(start,60);
  const dues=[...loans.filter(l=>l.owner===owner).flatMap(l=>loanSchedule(l,payments)),...fixed.filter(f=>f.owner===owner).flatMap(f=>fixedSchedule(f,payments,start,end))];
  androidMessage('sync',[...new Set(dues.filter(d=>!d.payment&&d.due>=start&&d.due<=end).map(d=>d.due))].sort());
 },[owner,loans,fixed,payments,ready]);
 if(!window.HeroesAndroid)return null;
 return <section className="panel"><div className="panel-title"><h3>No seu Android</h3><span className="tag">ESTE APARELHO</span></div><p>Proteja a abertura do aplicativo e receba lembretes de vencimento.</p><button onClick={()=>androidMessage('biometry')}>Ativar biometria</button> <button onClick={()=>androidMessage('notifications')}>Permitir lembretes</button><p className="note">Lembretes às 9h, horário de Brasília. Abra o aplicativo após alterar ou pagar uma conta para atualizar o agendamento. O Android pode atrasar a entrega.</p></section>;
}
