import {installSettings} from '../server/settings.js';
import {defaultSettings} from '../src/settings.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {scryptSync} from 'node:crypto';
import {installAuth} from '../server/auth.js';
test('login, cookies, isolamento de todas as rotas, logout e ativação única',async()=>{
 const original=process.cwd(),kay=process.env.KAYOHAN_EMAIL,ari=process.env.ARIELLE_EMAIL;const folder=await mkdtemp(join(tmpdir(),'heroes-auth-test-'));let server:any;
 try{process.chdir(folder);process.env.KAYOHAN_EMAIL='kay@example.test';process.env.ARIELLE_EMAIL='ari@example.test';await mkdir('data');const password='test-password-12345';const salt='test-only-salt';await writeFile('data/accounts.json',JSON.stringify([{owner:'Kayohan',email:'kay@example.test',salt,hash:scryptSync(password,salt,64).toString('hex')}]));const app=express();app.use(express.json());await installAuth(app,null);installSettings(app,null);for(const method of ['get','post','put','delete']as const)app[method]('/api/:owner/:table{/:id}',(_req,res)=>res.json({owner:res.locals.owner}));server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${server.address().port}/api/`;
 const request=async(path:string,method='GET',body?:any,cookie?:string,origin?:string)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},body:body?JSON.stringify(body):undefined});
 assert.equal((await request('Kayohan/transactions')).status,401);assert.equal((await request('auth/login','POST',{email:'kay@example.test',password:'wrong'})).status,401);
 const login=await request('auth/login','POST',{email:'kay@example.test',password},undefined,'http://localhost:5173');assert.equal(login.status,200);const raw=login.headers.get('set-cookie')!;assert.match(raw,/HttpOnly/i);assert.match(raw,/SameSite=Strict/i);const cookie=raw.split(';')[0];assert.deepEqual(await(await request('auth/me','GET',undefined,cookie)).json(),{owner:'Kayohan'});
 for(const path of ['Arielle/transactions','Arielle/fixed','Arielle/agent'])for(const method of ['GET','POST','PUT','DELETE'])assert.equal((await request(path,method,method==='GET'?undefined:{owner:'Kayohan'},cookie)).status,403);
 assert.equal((await request('Kayohan/transactions','GET',undefined,cookie)).status,200);assert.equal((await request('Kayohan/agent','POST',{message:'test'},cookie,'https://evil.example')).status,403);
 const invites=JSON.parse(await readFile('data/invitations.json','utf8'));const code=invites.find((i:any)=>i.owner==='Arielle').code;assert.equal((await request('auth/activate','POST',{email:'kay@example.test',password,code})).status,400);assert.equal((await request('auth/activate','POST',{email:'ari@example.test',password,code})).status,200);assert.equal((await request('auth/activate','POST',{email:'ari@example.test',password,code})).status,400);const arLogin=await request('auth/login','POST',{email:'ari@example.test',password});const arCookie=arLogin.headers.get('set-cookie')!.split(';')[0];assert.equal((await request('Kayohan/transactions','GET',undefined,arCookie)).status,403);assert.deepEqual(await(await request('auth/me','GET',undefined,arCookie)).json(),{owner:'Arielle'});
 const profile={...defaultSettings('Nome privado'),hideBalances:true,showAgent:false};
 assert.equal((await request('Kayohan/settings','PUT',profile,cookie)).status,200);
 assert.deepEqual((await(await request('Kayohan/settings','GET',undefined,cookie)).json()).settings,profile);
 assert.equal((await(await request('Arielle/settings','GET',undefined,arCookie)).json()).settings.displayName,'Arielle');
 assert.equal((await request('Arielle/settings','PUT',profile,cookie)).status,403);
 assert.equal((await request('Kayohan/settings','PUT',{...profile,owner:'Arielle'},cookie)).status,400);
 assert.equal((await request('Kayohan/settings','PUT',{...profile,avatar:'data:image/jpeg;base64,YmFk'},cookie)).status,400);
 assert.deepEqual(JSON.parse(await readFile('data/settings.json','utf8')).Kayohan,profile);
 assert.equal((await request('auth/logout' ,'POST',{},cookie)).status,200);assert.equal((await request('Kayohan/transactions','GET',undefined,cookie)).status,401);
 }finally{if(server)await new Promise<void>(resolve=>server.close(resolve));process.chdir(original);if(kay===undefined)delete process.env.KAYOHAN_EMAIL;else process.env.KAYOHAN_EMAIL=kay;if(ari===undefined)delete process.env.ARIELLE_EMAIL;else process.env.ARIELLE_EMAIL=ari;await rm(folder,{recursive:true,force:true});}
});

