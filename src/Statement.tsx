import {SelectField,DateField} from './Fields';
import {useState} from 'react';
import {money,summary,type Entry,type Owner} from './domain';

export function Statement({entries,owner}:{entries:Entry[];owner:Owner}){
 const [start,setStart]=useState(''),[end,setEnd]=useState(''),[search,setSearch]=useState(''),[type,setType]=useState('all'),[area,setArea]=useState('all');
 const invalid=!!(start&&end&&start>end);
 const all=entries.filter(e=>e.owner===owner).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 let balance=0;
 const ledger=all.map(entry=>{balance+=Math.round(entry.value*100)*(entry.type==='receita'?1:-1);return {...entry,balance:balance/100};});
 const period=invalid?[]:ledger.filter(e=>(!start||e.date>=start)&&(!end||e.date<=end));
 const visible=period.filter(e=>(type==='all'||e.type===type)&&(area==='all'||e.area===area)&&`${e.category} ${e.description}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
 const totals=summary(visible);
 const opening=summary(all.filter(e=>start&&e.date<start)).free;
 const closing=period.at(-1)?.balance??opening;
 return <section className="statement">
  <div className="statement-filters panel"><label>De<DateField label="Data inicial" value={start} onChange={setStart}/></label><label>Até<DateField label="Data final" value={end} onChange={setEnd}/></label><label>Tipo<SelectField label="Tipo" value={type} onChange={setType} options={[{value:"all",label:"Todos"},{value:"receita",label:"Receitas"},{value:"despesa",label:"Despesas"}]}/></label><label>Área<SelectField label="Área" value={area} onChange={setArea} options={[{value:"all",label:"Todas"},{value:"trabalho",label:"Trabalho"},{value:"pessoal",label:"Pessoal"}]}/></label><label className="statement-search">Buscar<input placeholder="Descrição ou categoria" value={search} onChange={e=>setSearch(e.target.value)}/></label><button onClick={()=>{setStart('');setEnd('');setType('all');setArea('all');setSearch('');}}>Limpar</button></div>
  {invalid&&<p role="alert" className="error">A data inicial deve ser anterior ou igual à data final.</p>}
  <div className="statement-totals">{[['Entradas exibidas',totals.gross,'cyan'],['Saídas exibidas',totals.work+totals.personal,'red'],['Resultado exibido',totals.free,totals.free>=0?'green':'red']].map(([label,value,color])=><article className={'metric '+color} key={label}><div>{label}</div><h2>{money(Number(value))}</h2></article>)}</div>
  <section className="panel"><div className="panel-title"><h3>Histórico de {owner}</h3><span className="tag">{visible.length} MOVIMENTOS</span></div><p className="statement-context">Saldo anterior ao período: <strong>{money(opening)}</strong> · Saldo ao final do período: <strong>{money(closing)}</strong></p><p className="note">O saldo acumulado considera todos os lançamentos do perfil até cada movimento, mesmo quando a busca, o tipo ou a área escondem linhas. Movimentos do mesmo dia são ordenados por identificador. Contas fixas entram no extrato quando o pagamento é lançado.</p>
  <div className="table"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Área</th><th>Entrada</th><th>Saída</th><th>Saldo acumulado</th></tr></thead><tbody>{visible.map(e=><tr key={e.id}><td data-label="Data">{e.date.split('-').reverse().join('/')}</td><td data-label="Descrição" className="statement-description">{e.description||'Sem descrição'}</td><td data-label="Categoria">{e.category}</td><td data-label="Tipo"><span className={'tag '+(e.type==='receita'?'green':'red')}>{e.type==='receita'?'Receita':'Despesa'}</span></td><td data-label="Área">{e.area==='trabalho'?'Trabalho':'Pessoal'}</td><td data-label="Entrada" className="cyan">{e.type==='receita'?money(e.value):'—'}</td><td data-label="Saída" className="red">{e.type==='despesa'?money(e.value):'—'}</td><td data-label="Saldo acumulado" className={e.balance>=0?'green':'red'}>{money(e.balance)}</td></tr>)}</tbody></table></div>{!visible.length&&<div className="empty">{entries.some(e=>e.owner===owner)?'Nenhum movimento corresponde aos filtros.':'Seu histórico aparecerá aqui quando você adicionar lançamentos.'}</div>}</section>
 </section>;
}

