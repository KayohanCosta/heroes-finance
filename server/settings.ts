import type {Express} from 'express';
import type {SupabaseClient} from '@supabase/supabase-js';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {defaultSettings,settingsSchema,type UserSettings} from '../src/settings.js';
import type {Owner} from '../src/domain.js';
export function installSettings(app:Express,db:SupabaseClient|null){
 let queue=Promise.resolve();
 const email=(owner:Owner)=>owner==='Kayohan'?process.env.KAYOHAN_EMAIL:process.env.ARIELLE_EMAIL;
 async function local():Promise<Partial<Record<Owner,UserSettings>>>{try{return JSON.parse(await readFile('data/settings.json','utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {};throw e;}}
 app.get('/api/:owner/settings',async(_req,res,next)=>{try{
  const owner=res.locals.owner as Owner;let settings:UserSettings|undefined;
  if(db){const {data,error}=await db.from('user_settings').select('settings').eq('owner',owner).maybeSingle();if(error)throw error;settings=data?.settings;}
  else settings=(await local())[owner];
  res.json({settings:settings?settingsSchema.parse(settings):defaultSettings(owner),email:email(owner)||''});
 }catch(e){next(e);}});
 app.put('/api/:owner/settings',async(req,res,next)=>{try{
  const parsed=settingsSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Confira seu nome, a foto e as preferências.'});
  const owner=res.locals.owner as Owner,settings=parsed.data;
  if(settings.avatar){const bytes=Buffer.from(settings.avatar.split(',')[1],'base64'),png=settings.avatar.startsWith('data:image/png');if(png?!bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')):bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)return res.status(400).json({error:'Use uma foto JPEG ou PNG válida.'});}
  if(db){const {error}=await db.from('user_settings').upsert({owner,settings,updated_at:new Date().toISOString()},{onConflict:'owner'});if(error)throw error;}
  else {const operation=queue.catch(()=>{}).then(async()=>{const rows=await local();rows[owner]=settings;await mkdir('data',{recursive:true});await writeFile('data/settings.tmp',JSON.stringify(rows),{mode:0o600});await rename('data/settings.tmp','data/settings.json');});queue=operation;await operation;}
  res.json({settings,email:email(owner)||''});
 }catch(e){next(e);}});
}
