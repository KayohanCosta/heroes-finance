import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {randomBytes,scryptSync} from 'node:crypto';
import {ownerSchema} from '../src/domain.js';
const owner=ownerSchema.parse(process.argv[2]);const email=process.argv[3]?.trim().toLowerCase();
if(!email||!/^\S+@\S+\.\S+$/.test(email))throw new Error('Uso: npm run account -- Kayohan seu@email.com');
if(!process.stdin.isTTY)throw new Error('Execute em um terminal interativo para definir a senha sem exibi-la.');
function password(prompt:string):Promise<string>{return new Promise(resolve=>{process.stdout.write(prompt);let value='';process.stdin.setRawMode(true);process.stdin.resume();const handler=(data:Buffer)=>{for(const char of data.toString()){if(char==='\u0003')process.exit(1);if(char==='\r'||char==='\n'){process.stdin.removeListener('data',handler);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');resolve(value);return;}if(char==='\u007f'||char==='\b')value=value.slice(0,-1);else value+=char;}};process.stdin.on('data',handler);});}
const first=await password('Nova senha (mínimo 8 caracteres, entrada oculta): ');if(first.length<8||first.length>256)throw new Error('Use uma senha entre 8 e 256 caracteres.');if(first!==await password('Confirme a senha: '))throw new Error('As senhas não coincidem.');
await mkdir('data',{recursive:true});let accounts:any[]=[];try{accounts=JSON.parse(await readFile('data/accounts.json','utf8'));}catch(e:any){if(e.code!=='ENOENT')throw e;}
if(accounts.some(a=>a.email===email&&a.owner!==owner))throw new Error('Este e-mail já pertence ao outro perfil.');
const salt=randomBytes(16).toString('hex');const account={owner,email,salt,hash:scryptSync(first,salt,64).toString('hex')};accounts=accounts.filter(a=>a.owner!==owner);accounts.push(account);await writeFile('data/accounts.tmp',JSON.stringify(accounts,null,2),{mode:0o600});await rename('data/accounts.tmp','data/accounts.json');console.log(`Conta ${owner} configurada. A senha não foi armazenada em texto puro. Reinicie o servidor se estiver redefinindo uma senha para encerrar sessões anteriores.`);

